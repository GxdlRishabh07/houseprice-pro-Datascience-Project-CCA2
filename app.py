"""
🏠 HousePrice Pro — Production Flask Backend
Backend Engineer: Modular MVC architecture with RESTful API
"""

from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import joblib
import json
import os

app = Flask(__name__)

# ─── LOAD ML ARTIFACTS ────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)
model      = joblib.load(os.path.join(BASE, 'ml', 'model.pkl'))
scaler     = joblib.load(os.path.join(BASE, 'ml', 'scaler.pkl'))
encoders   = joblib.load(os.path.join(BASE, 'ml', 'encoders.pkl'))
feat_cols  = joblib.load(os.path.join(BASE, 'ml', 'feature_cols.pkl'))
with open(os.path.join(BASE, 'ml', 'model_meta.json')) as f:
    MODEL_META = json.load(f)


# ─── HELPERS ──────────────────────────────────────────────────────────────────
def encode(col, value):
    """Safely encode a categorical value using the stored LabelEncoder."""
    return int(encoders[col].transform([value.lower()])[0])


def build_feature_df(d):
    """
    Build a single-row DataFrame with all engineered features.
    Using DataFrame ensures scaler receives named columns (no warnings).
    """
    area      = float(d['area'])
    bedrooms  = int(d['bedrooms'])
    bathrooms = int(d['bathrooms'])
    stories   = int(d['stories'])
    parking   = int(d['parking'])

    # Derived features
    total_rooms         = bedrooms + bathrooms
    luxury_score        = sum([
        d['airconditioning'] == 'yes',
        d['hotwaterheating'] == 'yes',
        d['prefarea']        == 'yes',
        d['guestroom']       == 'yes'
    ])
    has_extra_amenities = sum([
        d['basement']  == 'yes',
        d['mainroad']  == 'yes'
    ])
    area_per_room = area / (total_rooms + 1)

    row = {
        'area':               area,
        'bedrooms':           bedrooms,
        'bathrooms':          bathrooms,
        'stories':            stories,
        'parking':            parking,
        'mainroad':           encode('mainroad',        d['mainroad']),
        'guestroom':          encode('guestroom',       d['guestroom']),
        'basement':           encode('basement',        d['basement']),
        'hotwaterheating':    encode('hotwaterheating', d['hotwaterheating']),
        'airconditioning':    encode('airconditioning', d['airconditioning']),
        'prefarea':           encode('prefarea',        d['prefarea']),
        'furnishingstatus':   encode('furnishingstatus', d['furnishingstatus']),
        'total_rooms':        total_rooms,
        'luxury_score':       luxury_score,
        'has_extra_amenities': has_extra_amenities,
        'area_per_room':      area_per_room,
    }
    return pd.DataFrame([row], columns=feat_cols)


# ─── ROUTES ───────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html', meta=MODEL_META)


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    POST /api/predict
    Body: JSON with property features
    Returns: price estimate, range, tier, price-per-sqft
    """
    try:
        data = request.get_json(force=True)

        # Build and scale features
        df_input = build_feature_df(data)
        df_scaled = scaler.transform(df_input)
        price = float(model.predict(df_scaled)[0])

        # Confidence range ±8%
        price_low  = price * 0.92
        price_high = price * 1.08

        # Market tier classification
        if price < 4_000_000:
            tier, tier_label = 'budget', 'Budget-Friendly'
        elif price < 7_000_000:
            tier, tier_label = 'mid', 'Mid-Range'
        elif price < 10_000_000:
            tier, tier_label = 'premium', 'Premium'
        else:
            tier, tier_label = 'luxury', 'Luxury'

        return jsonify({
            'success':       True,
            'price':         int(price),
            'price_low':     int(price_low),
            'price_high':    int(price_high),
            'price_per_sqft': round(price / float(data['area']), 2),
            'tier':          tier,
            'tier_label':    tier_label,
        })

    except KeyError as e:
        return jsonify({'success': False, 'error': f'Missing field: {e}'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/model-info')
def model_info():
    """GET /api/model-info — returns metadata about the trained model."""
    return jsonify(MODEL_META)


# ─── ENTRY POINT ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("🏠 HousePrice Pro starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
