import joblib
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder


def main():
    df = pd.read_csv("leave_dataset.csv")

    required_cols = {
        "attendance",
        "past_leaves",
        "duration",
        "leave_type",
        "past_rejections",
        "approved",
    }
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns in CSV: {sorted(missing)}")

    encoder = LabelEncoder()
    df["leave_type_encoded"] = encoder.fit_transform(df["leave_type"].astype(str))

    X = df[["attendance", "past_leaves", "duration", "leave_type_encoded", "past_rejections"]]
    y = df["approved"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = LogisticRegression(max_iter=1000)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)
    print(f"Accuracy: {accuracy:.2%}")

    joblib.dump(model, "model.pkl")
    joblib.dump(encoder, "encoder.pkl")
    print("Saved model.pkl and encoder.pkl")


if __name__ == "__main__":
    main()

