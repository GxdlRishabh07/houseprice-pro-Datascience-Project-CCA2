# 🏠 HousePrice Pro — AI-Powered Real Estate Valuation

> A production-ready, portfolio-level house price prediction web application built with Python, Flask, and Scikit-learn. Rebuilt from scratch with enhanced feature engineering, modern UI/UX, and a clean REST API architecture.

![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=flat-square&logo=flask)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.4-orange?style=flat-square&logo=scikit-learn)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🎯 Problem Statement

Real estate valuation is time-consuming, inconsistent, and opaque. Buyers and sellers lack tools to get fast, data-driven price estimates. Traditional appraisals are expensive and slow. This project solves that by delivering an instant, AI-powered price estimate based on 16 property features — including engineered signals like luxury score and area-per-room — through a clean, responsive web interface.

---

## 💡 Solution Approach

1. **Engineered 4 new features** from the original dataset (luxury_score, total_rooms, area_per_room, has_extra_amenities) to capture non-linear relationships
2. **Trained Random Forest Regressor** (200 estimators) achieving **R² = 0.62** — up from Linear Regression's baseline
3. **Built a Flask REST API** with clean separation of concerns (model layer → API layer → frontend)
4. **Designed a Pro-grade UI** with editorial dark-luxury aesthetic, toggle switches, animated count-up, and confidence range display

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Model | Scikit-learn RandomForestRegressor |
| Backend | Python 3.10+, Flask 3.0 |
| Frontend | HTML5, CSS3 (custom), Vanilla JS |
| Data Processing | Pandas, NumPy |
| Model Persistence | Joblib |
| Deployment | Gunicorn + any VPS / Railway / Render |

---

## 📦 Dataset

**Source:** [Housing Price Prediction — Kaggle](https://www.kaggle.com/datasets/harishkumardatalab/housing-price-prediction)

| Property | Value |
|----------|-------|
| Rows | 545 |
| Features (original) | 12 |
| Features (after engineering) | 16 |
| Target | `price` (INR) |

**Why this dataset?**
The original project used the same dataset but with a basic Linear Regression and no feature engineering. By adding 4 engineered features and switching to a Random Forest ensemble, we capture complex non-linear relationships between area, amenities, and pricing.

---

## ✨ Features

- **Instant AI Prediction** — sub-100ms response via REST API
- **16-Feature Model** — including engineered luxury and area features
- **Confidence Range** — ±8% bounds displayed with animated spectrum bar
- **Market Tier Classification** — Budget / Mid-Range / Premium / Luxury
- **Price Per Sqft** — automatic calculation
- **Smart Insights** — auto-generated contextual bullets based on inputs
- **Toggle Switches** — intuitive boolean inputs (no ugly dropdowns)
- **Animated Count-Up** — smooth price reveal animation
- **Responsive Design** — works on mobile, tablet, desktop
- **REST API** — `/api/predict` and `/api/model-info` endpoints

---

## 📁 Project Structure

```
houseprice_pro/
├── app.py                  # Flask application (MVC backend)
├── requirements.txt        # Python dependencies
├── ml/
│   ├── model.pkl           # Trained RandomForest model
│   ├── scaler.pkl          # StandardScaler
│   ├── encoders.pkl        # LabelEncoders for categorical features
│   ├── feature_cols.pkl    # Ordered feature list
│   └── model_meta.json     # Model metrics and metadata
├── templates/
│   └── index.html          # Single-page UI template
├── static/
│   ├── css/style.css       # Pro Max UI stylesheet
│   └── js/app.js           # Frontend logic & API calls
```

---

## 🚀 Setup Guide

### Prerequisites
- Python 3.10+
- pip

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/houseprice-pro.git
cd houseprice-pro

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the Flask app
python app.py

# 5. Open in browser
# http://localhost:5000
```

### Re-train the Model (optional)

```bash
# Place Housing.csv in project root
python retrain.py
```

---

## 🌐 API Reference

### `POST /api/predict`

**Request body (JSON):**
```json
{
  "area": 6000,
  "bedrooms": 3,
  "bathrooms": 2,
  "stories": 2,
  "parking": 2,
  "mainroad": "yes",
  "prefarea": "yes",
  "guestroom": "no",
  "basement": "no",
  "hotwaterheating": "no",
  "airconditioning": "yes",
  "furnishingstatus": "furnished"
}
```

**Response:**
```json
{
  "success": true,
  "price": 8607031,
  "price_low": 7918468,
  "price_high": 9295593,
  "price_per_sqft": 1434.51,
  "tier": "premium",
  "tier_label": "Premium"
}
```

### `GET /api/model-info`

Returns model metadata: name, R² score, MAE, feature list, training sample count.

---

## ☁️ Deployment

### Railway / Render (Recommended)
```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Push to GitHub and connect to Railway/Render
# Set PORT environment variable if needed
```

### VPS (Ubuntu)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

---

## 📸 Screenshots

| View | Description |
|------|-------------|
| Hero Section | Dark editorial header with live model stats |
| Form Panel | Numbered sections with toggle switches |
| Result Panel | Animated price card with tier badge, metrics, insights |

---

## 🔮 Future Scope (AI Integration)

- [ ] Integrate with **Google Maps API** for real location-based pricing
- [ ] Add **XGBoost / LightGBM** for higher accuracy (target R² > 0.85)
- [ ] **Explainability** with SHAP values — show which features drove the price
- [ ] **Comparable properties** — show 3 similar listings from dataset
- [ ] **Time-series pricing** — historical price trend chart
- [ ] **Claude AI integration** — natural language property queries

---

## 📄 License

MIT — free for personal and commercial use.

---

*Built as a portfolio-grade project demonstrating end-to-end ML engineering, REST API design, and modern UI/UX.*
