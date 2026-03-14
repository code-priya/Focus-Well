import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from flask import Flask, render_template, request

app = Flask(__name__, template_folder='templates')  # Specify the directory for templates

# Load dataset
data = pd.read_csv("StressLevelDataset.csv")
encoder = LabelEncoder()
data["stress_level"] = encoder.fit_transform(data["stress_level"])

# Split dataset into features and target
X = data.drop("stress_level", axis=1)
y = data["stress_level"]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a decision tree classifier
tree_clf = DecisionTreeClassifier(max_depth=7, random_state=100)
tree_clf.fit(X_train, y_train)

# Route for login page
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            # Get user input from the form
            anxiety_level = float(request.form.get('anxiety_level'))
            mental_health_history = float(request.form.get('mental_health_history'))
            depression = float(request.form.get('depression'))
            headache = float(request.form.get('headache'))
            sleep_quality = float(request.form.get('sleep_quality'))
            breathing_problem = float(request.form.get('breathing_problem'))
            living_conditions = float(request.form.get('living_conditions'))
            academic_performance = float(request.form.get('academic_performance'))
            study_load = float(request.form.get('study_load'))
            future_career_concerns = float(request.form.get('future_career_concerns'))
            extracurricular_activities = float(request.form.get('extracurricular_activities'))

            # Predict stress level
            user_input = np.array([[anxiety_level, mental_health_history, depression, headache, sleep_quality,
                                    breathing_problem, living_conditions, academic_performance, study_load,
                                    future_career_concerns, extracurricular_activities]])
            predicted_stress_level = tree_clf.predict(user_input)[0]

            # Map encoded label back to original class
            predicted_stress_level = encoder.inverse_transform([predicted_stress_level])[0]

            return render_template('result.html', stress_level=predicted_stress_level)
        except ValueError:
            error_message = "Invalid input. Please enter numeric values for all fields."
            return render_template('error.html', error_message=error_message)

    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
