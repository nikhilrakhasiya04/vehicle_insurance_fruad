# 🚀 Deployment Guide — Vehicle Insurance Fraud Detection System

This guide explains how to deploy your project completely **FREE** online using **Render** (Backend) and **Vercel** (Frontend), **Render Blueprint** (1-Click), or **Docker**.

---

## 🌟 Method 1: Render (Backend) + Vercel (Frontend) [Recommended]

### Part 1: Deploy Python ML Backend on Render
1. Go to **[Render.com](https://render.com)** and sign in with your GitHub account.
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

### Part 2: Deploy React Frontend on Vercel
1. Go to **[Vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `vehicle_insurance_fruad`.
4. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://insurance-fraud-ml-backend.onrender.com/api` *(Your Render backend URL + `/api`)*
6. Click **Deploy**.

🎉 **Your full-stack application is live on the internet!**

---

## 🌟 Method 2: Render Blueprint (1-Click Full Stack Deployment)

1. Push all code to your GitHub repository.
2. Go to **[Render Blueprints](https://dashboard.render.com/blueprints)**.
3. Click **New Blueprint Instance**.
4. Select your repository `vehicle_insurance_fruad`.
5. Render will automatically read [`render.yaml`](file:///d:/Nikhil/ML_Project/render.yaml) and create both:
   - **Python Web Service** for the ML API
   - **Static Site** for the React Frontend with automatic URL linking
6. Click **Apply**.

---

## 🐳 Method 3: Deploy with Docker

Run both services locally or on any cloud VPS (AWS, GCP, DigitalOcean):

```bash
docker-compose up --build -d
```

- 🌐 **Frontend**: `http://localhost:3000`
- 🐍 **Backend ML API**: `http://localhost:5000`
