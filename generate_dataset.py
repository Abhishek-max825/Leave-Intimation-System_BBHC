import random

import pandas as pd


LEAVE_TYPES = ["medical", "personal", "emergency"]


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


def approval_probability(attendance, past_leaves, duration, leave_type, past_rejections):
    """
    Returns a probability (0..1) using simple realistic rules + light randomness.
    Tuned so that the relationship is clearer (Logistic Regression can hit ~85% accuracy).
    """
    p = 0.30

    # Attendance effect (very strong)
    if attendance > 90:
        p += 0.45
    elif attendance > 80:
        p += 0.30
    elif attendance > 70:
        p += 0.10
    else:
        p -= 0.15

    # Leave type effect
    if leave_type == "medical":
        p += 0.20
    elif leave_type == "emergency":
        p += 0.10
    else:  # personal
        p -= 0.05

    # Past leaves penalty
    if past_leaves > 10:
        p -= 0.25
    elif past_leaves > 6:
        p -= 0.12

    # Past rejections penalty
    if past_rejections > 2:
        p -= 0.25
    elif past_rejections > 0:
        p -= 0.08

    # Duration penalty (longer leaves harder to approve)
    if duration >= 6:
        p -= 0.12
    elif duration >= 4:
        p -= 0.06

    # Add light noise for realism, but keep signal strong
    p += random.uniform(-0.04, 0.04)

    return clamp(p, 0.02, 0.98)


def generate_dataset(n_rows=3000, seed=42):
    random.seed(seed)

    rows = []
    for _ in range(n_rows):
        attendance = random.randint(60, 100)
        past_leaves = random.randint(0, 15)
        duration = random.randint(1, 7)
        leave_type = random.choice(LEAVE_TYPES)
        past_rejections = random.randint(0, 5)

        p = approval_probability(attendance, past_leaves, duration, leave_type, past_rejections)
        approved = 1 if random.random() < p else 0

        rows.append(
            {
                "attendance": attendance,
                "past_leaves": past_leaves,
                "duration": duration,
                "leave_type": leave_type,
                "past_rejections": past_rejections,
                "approved": approved,
            }
        )

    df = pd.DataFrame(rows)

    # Balance: aim for 40%..60% approvals by flipping a small set if needed
    approvals = int(df["approved"].sum())
    ratio = approvals / len(df)
    target_ratio = 0.50

    if ratio < 0.40 or ratio > 0.60:
        desired_approvals = int(target_ratio * len(df))
        diff = desired_approvals - approvals

        if diff > 0:
            # Need more 1s: flip some 0s with highest approval probability
            candidates = df[df["approved"] == 0].copy()
            candidates["p"] = candidates.apply(
                lambda r: approval_probability(
                    int(r["attendance"]),
                    int(r["past_leaves"]),
                    int(r["duration"]),
                    str(r["leave_type"]),
                    int(r["past_rejections"]),
                ),
                axis=1,
            )
            flip_idx = candidates.sort_values("p", ascending=False).head(diff).index
            df.loc[flip_idx, "approved"] = 1
        elif diff < 0:
            # Need fewer 1s: flip some 1s with lowest approval probability
            candidates = df[df["approved"] == 1].copy()
            candidates["p"] = candidates.apply(
                lambda r: approval_probability(
                    int(r["attendance"]),
                    int(r["past_leaves"]),
                    int(r["duration"]),
                    str(r["leave_type"]),
                    int(r["past_rejections"]),
                ),
                axis=1,
            )
            flip_idx = candidates.sort_values("p", ascending=True).head(abs(diff)).index
            df.loc[flip_idx, "approved"] = 0

    return df


def main():
    df = generate_dataset(n_rows=3000, seed=42)
    df.to_csv("leave_dataset.csv", index=False)
    ratio = df["approved"].mean()
    print(f"Created leave_dataset.csv with {len(df)} rows. Approval rate: {ratio:.2%}")


if __name__ == "__main__":
    main()

