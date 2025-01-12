import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

# Loading the dataset to a Pandas DataFrame
# Make sure 'credit_data.csv' is in the same folder as this script
try:
    credit_card_data = pd.read_csv('credit_data.csv')
    print("Dataset loaded successfully!")
except FileNotFoundError:
    print("Error: credit_data.csv not found. Please make sure it's in the same directory as this script.")
    exit()

# Display first 5 rows of the dataset
print("\nFirst 5 rows of the dataset:")
print(credit_card_data.head())

# Display last 5 rows of the dataset
print("\nLast 5 rows of the dataset:")
print(credit_card_data.tail())

# Dataset information
print("\nDataset information:")
print(credit_card_data.info())

# Check for missing values
print("\nMissing values in each column:")
print(credit_card_data.isnull().sum())

# Distribution of transactions
print("\nDistribution of transactions:")
print(credit_card_data['Class'].value_counts())
print("\n0 --> Normal Transaction")
print("1 --> Fraudulent Transaction")

# Separating the data for analysis
legit = credit_card_data[credit_card_data.Class == 0]
fraud = credit_card_data[credit_card_data.Class == 1]

print("\nShape of legit transactions:", legit.shape)
print("Shape of fraudulent transactions:", fraud.shape)

# Statistical measures of the Amount column
print("\nStatistics for legitimate transaction amounts:")
print(legit.Amount.describe())

print("\nStatistics for fraudulent transaction amounts:")
print(fraud.Amount.describe())

# Compare mean values for all features between classes
print("\nMean values comparison between classes:")
print(credit_card_data.groupby('Class').mean())

# Under-Sampling
# Build a sample dataset containing similar distribution of normal and fraudulent transactions
legit_sample = legit.sample(n=492)

# Concatenating DataFrames
new_dataset = pd.concat([legit_sample, fraud], axis=0)

print("\nBalance check after sampling:")
print(new_dataset['Class'].value_counts())

print("\nMean values after sampling:")
print(new_dataset.groupby('Class').mean())

# Splitting the data into Features & Targets
X = new_dataset.drop(columns='Class', axis=1)
Y = new_dataset['Class']

# Split the data into Training and Testing sets
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, stratify=Y, random_state=2)

print("\nDataset shapes:")
print(f"Full dataset: {X.shape}")
print(f"Training set: {X_train.shape}")
print(f"Testing set: {X_test.shape}")

# Model Training - Logistic Regression
print("\nTraining the model...")
model = LogisticRegression()
model.fit(X_train, Y_train)

# Model Evaluation
# Training data accuracy
X_train_prediction = model.predict(X_train)
training_data_accuracy = accuracy_score(X_train_prediction, Y_train)
print('\nAccuracy on Training data:', training_data_accuracy)

# Test data accuracy
X_test_prediction = model.predict(X_test)
test_data_accuracy = accuracy_score(X_test_prediction, Y_test)
print('Accuracy on Test Data:', test_data_accuracy)

# Save the trained model
try:
    joblib.dump(model, 'fraud_detection_model.joblib')
    print("\nModel saved successfully as 'fraud_detection_model.joblib'!")
except Exception as e:
    print(f"\nError saving model: {e}")

# Optional: Save feature names for future reference
feature_names = X.columns.tolist()
joblib.dump(feature_names, 'feature_names.joblib')
print("Feature names saved successfully!")