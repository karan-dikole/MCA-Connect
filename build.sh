#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
python manage.py migrate

echo "🌱 Seeding initial demo accounts & curriculum data..."
python manage.py seed_production_data

echo "🎨 Collecting static assets with WhiteNoise..."
python manage.py collectstatic --no-input

echo "🚀 Build complete!"
