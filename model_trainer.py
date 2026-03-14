import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Sample data: [Sleep Hours, Study Hours, Anxiety Level (1-10)]
# Target: [0: Low Stress, 1: Medium, 2: High]
data = {
    'sleep': [8, 7, 5, 4, 9, 6, 5, 8, 4, 7],
    'study': [2, 3, 7, 9, 1, 5, 8, 2, 10, 4],
    'anxiety': [2, 3, 8, 9, 1, 6, 7, 2, 10, 5],
    'stress_level': [0, 0, 2, 2, 0, 1, 2, 0, 2, 1]
}

df = pd.DataFrame(data)
X = df[['sleep', 'study', 'anxiety']]
y = df['stress_level']

model = RandomForestClassifier()
model.fit(X, y)

# Save the model to use in the website
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)

print("Model trained and saved as model.pkl!")
