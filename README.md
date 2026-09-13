# Insurance Fraud Detection System

A production-ready full-stack Machine Learning application that detects insurance fraud using historical claim data.

## Architecture

```
Frontend (Next.js)
       ↓
Backend (Express.js REST API)
       ↓
ML Service (Python Flask)
       ↓
Trained XGBoost Model
       ↓
Prediction + Probability
```

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Frontend    | Next.js 14, React, Tailwind CSS, Recharts       |
| Backend     | Node.js, Express.js, MongoDB, Mongoose          |
| ML Service  | Python, Flask, scikit-learn, XGBoost, pandas    |

## Project Structure

```
ML_Project/
├── frontend/           # Next.js application
├── backend/            # Express.js REST API
├── ml-service/         # Python Flask ML API
├── dataset/            # Raw CSV dataset
├── README.md
└── .gitignore
```

---

## Setup & Installation

### Prerequisites

- Node.js >= 18
- Python >= 3.9
- MongoDB (local or Atlas)
- npm or yarn

---

### Step 1 — Train the ML Model

```bash
cd ml-service

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Train the model (this will save model + preprocessor to ml-service/model/)
python train.py
```

---

### Step 2 — Start the ML Service (Flask)

```bash
cd ml-service

# Make sure virtual environment is active
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

python app.py
# Flask runs on http://localhost:5001
```

---

### Step 3 — Configure and Start the Backend

```bash
cd backend

# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Edit .env and fill in your MongoDB URI and other values

# Start the backend
npm run dev
# Express runs on http://localhost:5000
```

---

### Step 4 — Configure and Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create your .env.local file
cp .env.example .env.local
# Edit .env.local if needed

# Start the frontend
npm run dev
# Next.js runs on http://localhost:3000
```

---

## Environment Variables

### backend/.env
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/insurance_fraud
JWT_SECRET=your_super_secret_key_here
ML_SERVICE_URL=http://localhost:5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## API Endpoints

### Backend (Express)

| Method | Endpoint                        | Description                    |
|--------|---------------------------------|--------------------------------|
| POST   | /api/predictions/predict        | Submit claim for fraud prediction |
| GET    | /api/predictions/history        | Get prediction history         |
| GET    | /api/predictions/:id            | Get single prediction          |
| DELETE | /api/predictions/:id            | Delete a prediction            |
| GET    | /api/predictions/stats/summary  | Get dashboard statistics       |
| GET    | /api/health                     | Health check                   |

### ML Service (Flask)

| Method | Endpoint   | Description              |
|--------|------------|--------------------------|
| POST   | /predict   | Get fraud prediction     |
| GET    | /health    | Health check             |
| GET    | /model-info| Model performance info   |

---

## Model Information

Four models are trained and compared:
- Logistic Regression
- Random Forest
- XGBoost (selected as best)
- Support Vector Machine (SVM)

Selection criteria: F1-score (fraud class) and PR-AUC.

---

## Features Used for Prediction

- Driver demographics (age, gender, marital status, education)
- Financial info (annual income, policy deductible, annual premium)
- Claim details (accident site, claim day, past claims)
- Vehicle info (age, category, price, color)
- Claim amounts (total claim, injury claim)
- Witness/police presence
- Property status, address change

---

## Running Services

### Option 1 — Single Command (Recommended)

From the project root (`ML_Project`):

**To run Frontend & Backend together:**
```bash
npm run dev
```

**To run all 3 (ML Service + Backend + Frontend) together:**
```bash
npm run dev:all
```

Or on Windows, simply double-click **`start.bat`** (Frontend + Backend) or **`start-all.bat`** (All 3 services).

---

### Option 2 — Separate Terminals

**Terminal 1 - ML Service:**
```bash
cd ml-service && venv\Scripts\activate && python app.py
```

**Terminal 2 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend && npm run dev
```

Then open http://localhost:3000 in your browser.
