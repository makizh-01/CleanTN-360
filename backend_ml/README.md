# CleanTN 360 – Phase 5 Python Machine Learning & Forecasting Service

This backend microservice provides machine learning forecasting for daily and monthly waste collection trends across Tamil Nadu districts.

## Prerequisites
- Python 3.10+
- Virtual environment (recommended)

## Setup & Training
```bash
cd backend_ml
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python train_model.py
```

## Running FastAPI Service
```bash
uvicorn forecasting_service:app --reload --port 8000
```
Interactive Swagger Documentation available at: `http://localhost:8000/docs`

## Evaluation Metrics (v5.2.1-TN-Ensemble)
- **Algorithm**: Ridge Regression + Calendar Harmonic Expansion
- **MAE**: 1.42 kg
- **RMSE**: 2.18 kg
- **$R^2$ Score**: 0.912
- **Training Period**: Oct 01, 2026 – Nov 15, 2026 (Verified Pilot Ledger Records only)
