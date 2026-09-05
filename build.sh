#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

echo "🗄️ Running database migrations..."
python manage.py migrate

echo "🎨 Collecting static assets with WhiteNoise..."
python manage.py collectstatic --no-input

echo "🚀 Build complete!"
