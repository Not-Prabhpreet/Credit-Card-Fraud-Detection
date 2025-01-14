from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import numpy as np
import pandas as pd
import joblib
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware with updated origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Local development
        "https://credit-card-fraud-detection-1-fkj3.onrender.com",  # Your Render frontend URL
        "*"  # Temporarily allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rest of your code remains the same...
# Load the trained model
try:
    model = joblib.load('fraud_detection_model.joblib')
    logger.info("Model loaded successfully!")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    model = None

class TransactionData(BaseModel):
    Time: float
    V1: float
    V2: float
    V3: float
    V4: float
    Amount: float

@app.get("/sample-transactions")
async def get_sample_transactions():
    try:
        # Read the original dataset
        df = pd.read_csv('credit_data_sample.csv')
        
        # Get 5 legitimate and 5 fraudulent transactions
        legitimate = df[df['Class'] == 0].sample(n=5)
        fraudulent = df[df['Class'] == 1].sample(n=5)
        
        # Combine and convert to dictionary
        samples = pd.concat([legitimate, fraudulent])
        
        # Convert to a list of dictionaries with rounded values
        samples_list = []
        for _, row in samples.iterrows():
            samples_list.append({
                'Time': float(row['Time']),
                'V1': round(float(row['V1']), 6),
                'V2': round(float(row['V2']), 6),
                'V3': round(float(row['V3']), 6),
                'V4': round(float(row['V4']), 6),
                'Amount': round(float(row['Amount']), 2),
                'Class': int(row['Class'])
            })
        
        return {
            "samples": samples_list,
            "explanation": {
                "Time": "Number of seconds elapsed between this transaction and the first transaction in the dataset",
                "V1-V4": "Transformed features that help identify fraudulent patterns while protecting customer privacy",
                "Amount": "Transaction amount in dollars",
                "Class": "0 for legitimate transaction, 1 for fraudulent"
            }
        }
    except Exception as e:
        logger.error(f"Error fetching samples: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict")
async def predict_fraud(transaction: TransactionData):
    logger.info(f"Received transaction data: {transaction}")
    
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        input_data = pd.DataFrame([{
            'Time': transaction.Time,
            'V1': transaction.V1,
            'V2': transaction.V2,
            'V3': transaction.V3,
            'V4': transaction.V4,
            'Amount': transaction.Amount,
            **{f'V{i}': 0.0 for i in range(5, 29)}
        }])

        # Ensure columns are in the correct order
        expected_columns = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']
        input_data = input_data[expected_columns]
        
        logger.info("Making prediction...")
        prediction = model.predict(input_data)
        probability = model.predict_proba(input_data)
        
        result = {
            "prediction": int(prediction[0]),
            "fraud_probability": float(probability[0][1]),
            "status": "success"
        }
        logger.info(f"Prediction result: {result}")
        
        return result
        
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }
app.mount("/", StaticFiles(directory="static", html=True), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    return FileResponse("static/index.html")