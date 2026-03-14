import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pickle

# Simple survey-based features: 
# 1. Sleep Quality, 2. Work Load, 3. Physical Activity, 4. Anxiety Level
# Target: 0 (Low), 1 (Medium), 2 (High)

def train_model():
    # Creating a dummy dataset for demonstration
    X = np.random.randint(1, 10, size=(1000, 4))
    y = []
    for row in X:
        score = row[0]*0.4 + row[1]*0.5 - row[2]*0.2 + row[3]*0.6
        if score < 5: y.append(0)
        elif score < 10: y.append(1)
        else: y.append(2)
    
    model = RandomForestClassifier()
    model.fit(X, y)
    
    with open('stress_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    print("Model trained and saved!")

if __name__ == "__main__":
    train_model()
