from flask import Flask, render_template, request
import pickle
import numpy as np

app = Flask(__name__)

# Load the model (Ensure you have run model.py first to create this file)
try:
    with open('stress_model.pkl', 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    model = None

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        # Processing prediction
        try:
            features = [int(x) for x in request.form.values()]
            prediction = model.predict([np.array(features)])
            
            levels = ["Low Stress", "Moderate Stress", "High Stress"]
            tips = [
                "Stay Gold! Your balance is perfect. Keep doing what you love.",
                "Take a breather. A 10-minute walk could change your day.",
                "Priority: YOU. It's time to unplug and seek calm."
            ]
            
            return render_template('index.html', 
                                   result=levels[prediction[0]], 
                                   advice=tips[prediction[0]],
                                   scroll_to_result=True)
        except Exception as e:
            return render_template('index.html', error="Please enter valid numbers.")

    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)
