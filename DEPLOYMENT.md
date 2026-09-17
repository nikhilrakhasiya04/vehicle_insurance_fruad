# 🚀 Deployment Guide — Insurance Fraud Detection System

This guide explains how to deploy your project completely **FREE** online using **Render** (Backend) and **Vercel** (Frontend) or **Render Blueprint** (Both in 1 click).

---

## 🌟 Method 1: Render (Backend) + Vercel (Frontend) [Recommended]

### Part 1: Deploy Python ML Backend on Render
1. Go to **[Render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** → Select **Web Service**.
3. Connect your GitHub repository: `vehicle_insurance_fruad`.
4. Configure settings:
   - **Name**: `insurance-fraud-ml-backend`
   - **Root Directory**: `ml-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120`
   - **Plan**: `Free`
5. Click **Deploy Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://insurance-fraud-ml-backend.onrender.com`).

---

### Part 2: Deploy Frontend on Vercel
1. Go to **[Vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `vehicle_insurance_fruad`.
4. Configure settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click `Edit` and select `frontend`.
5. Under **Environment Variables**, add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://insurance-fraud-ml-backend.onrender.com/api` *(Your Render backend URL + `/api`)*
6. Click **Deploy**.

🎉 Your full-stack ML application is now live on the internet!

---

## 🌟 Method 2: Render Blueprint (1-Click Full Stack)
1. Go to **[Render.com](https://dashboard.render.com/blueprints)**.
2. Click **New Blueprint Instance**.
3. Connect your repository: `vehicle_insurance_fruad`.
4. Render will automatically detect `render.yaml` and configure both Backend and Frontend for you.
5. Click **Apply**.

---

## 🐳 Method 3: Deploy with Docker
To run locally or on a VPS using Docker:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
