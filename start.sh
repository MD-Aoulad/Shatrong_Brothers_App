#!/bin/bash

echo "🚀 Starting Forex Fundamental Data App..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f env.template ]; then
        cp env.template .env
        echo "✅ Created .env file from template"
        echo "📝 Please review and modify .env file if needed"
    else
        echo "❌ env.template not found. Please create .env file manually"
        exit 1
    fi
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start the application
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo ""
echo "✅ Forex Fundamental Data App is starting up!"
echo ""
echo "📊 Access the application at:"
echo "   Frontend: http://localhost:3000"
echo "   API Gateway: http://localhost:8000"
echo "   Database: localhost:5432"
echo "   Redis: localhost:6379"
echo ""
echo "📝 View logs with: docker-compose logs -f"
echo "🛑 Stop the application with: docker-compose down"
echo ""
