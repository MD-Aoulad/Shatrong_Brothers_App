#!/bin/bash

echo "🚀 Deploying Forex Fundamental Data App to Kubernetes..."

# Set namespace
NAMESPACE="forex-app"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if minikube is running (for local development)
if command -v minikube &> /dev/null; then
    if ! minikube status | grep -q "Running"; then
        echo "⚠️  Minikube is not running. Starting minikube..."
        minikube start --memory=4096 --cpus=2
    fi
    echo "✅ Minikube is running"
fi

# Create namespace
echo "📦 Creating namespace: $NAMESPACE"
kubectl apply -f namespace.yaml

# Set context to our namespace
kubectl config set-context --current --namespace=$NAMESPACE

# Create secrets
echo "🔐 Creating Kubernetes secrets..."
kubectl apply -f secrets.yaml

# Deploy infrastructure (PostgreSQL, Redis, Kafka)
echo "🏗️  Deploying infrastructure services..."

# Deploy PostgreSQL
echo "🐘 Deploying PostgreSQL..."
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: forex-postgres
spec:
  replicas: 1
  selector:
    matchLabels:
      app: forex-postgres
  template:
    metadata:
      labels:
        app: forex-postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: "forex_app"
            - name: POSTGRES_USER
              value: "postgres"
            - name: POSTGRES_PASSWORD
              value: "password"
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-storage
          emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: forex-postgres
spec:
  selector:
    app: forex-postgres
  ports:
    - port: 5432
      targetPort: 5432
  type: ClusterIP
EOF

# Deploy Redis
echo "🔴 Deploying Redis..."
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: forex-redis
spec:
  replicas: 1
  selector:
    matchLabels:
      app: forex-redis
  template:
    metadata:
      labels:
        app: forex-redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          ports:
            - containerPort: 6379
---
apiVersion: v1
kind: Service
metadata:
  name: forex-redis
spec:
  selector:
    app: forex-redis
  ports:
    - port: 6379
      targetPort: 6379
  type: ClusterIP
EOF

# Wait for infrastructure to be ready
echo "⏳ Waiting for infrastructure services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/forex-postgres
kubectl wait --for=condition=available --timeout=300s deployment/forex-redis

# Deploy application services
echo "🚀 Deploying application services..."

# Deploy API Gateway
echo "🌐 Deploying API Gateway..."
kubectl apply -f api-gateway-deployment.yaml

# Deploy Frontend
echo "🖥️  Deploying Frontend..."
kubectl apply -f frontend-deployment.yaml

# Deploy Backend
echo "⚙️  Deploying Backend..."
kubectl apply -f backend-deployment.yaml

# Wait for application services to be ready
echo "⏳ Waiting for application services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/forex-api-gateway
kubectl wait --for=condition=condition=available --timeout=300s deployment/forex-frontend
kubectl wait --for=condition=available --timeout=300s deployment/fx-backend

# Deploy Ingress (if NGINX Ingress Controller is available)
echo "🌍 Deploying Ingress..."
kubectl apply -f ingress.yaml

# Show deployment status
echo "📊 Deployment Status:"
kubectl get all -n $NAMESPACE

echo ""
echo "🎉 Forex Fundamental Data App deployed successfully!"
echo ""
echo "📱 Access your application:"
echo "   • Frontend: http://localhost:3000 (port-forward)"
echo "   • API Gateway: http://localhost:8000 (port-forward)"
echo ""
echo "🔧 Port forwarding commands:"
echo "   kubectl port-forward -n $NAMESPACE service/forex-frontend 3000:3000"
echo "   kubectl port-forward -n $NAMESPACE service/forex-api-gateway 8000:8000"
echo ""
echo "📝 View logs:"
echo "   kubectl logs -n $NAMESPACE -l app=forex-frontend -f"
echo "   kubectl logs -n $NAMESPACE -l app=forex-api-gateway -f"
echo ""
echo "🛑 To stop the deployment:"
echo "   kubectl delete namespace $NAMESPACE"
