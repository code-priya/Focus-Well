from flask import Flask, render_template, request
import pickle
import numpy as np

app = Flask(__name__)

# Load the model
with open('stress_model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    # Get data from form
    features = [int(x) for x in request.form.values()]
    final_features = [np.array(features)]
    prediction = model.predict(final_features)
    
    levels = ["Low Stress", "Moderate Stress", "High Stress"]
    tips = [
        "You're doing great! Keep maintaining your work-life balance.",
        "Consider taking short breaks and practicing deep breathing exercises.",
        "It's time to prioritize rest. Maybe try meditation or talk to a friend."
    ]
    
    res = levels[prediction[0]]
    advice = tips[prediction[0]]
    
    return render_template('result.html', prediction=res, advice=advice)

if __name__ == "__main__":
    app.run(debug=True)
