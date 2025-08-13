#!/bin/bash

# Forex Fundamental Data App - Backup Script
# This script creates a comprehensive backup of the entire project

set -e  # Exit on any error

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="forex_app_backup_${TIMESTAMP}"
PROJECT_NAME="Shatrong_App"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Forex App Backup Process...${NC}"
echo -e "${BLUE}Timestamp: ${TIMESTAMP}${NC}"
echo ""

# Create backup directory
echo -e "${YELLOW}📁 Creating backup directory...${NC}"
mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"
cd "${BACKUP_DIR}/${BACKUP_NAME}"

# Function to log messages
log_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Backup source code
echo -e "${BLUE}📦 Backing up source code...${NC}"
cd ../..
cp -r "${PROJECT_NAME}" "source_code_backup"
log_message "Source code backed up"

# 2. Backup Docker images
echo -e "${BLUE}🐳 Backing up Docker images...${NC}"
cd "${PROJECT_NAME}"

# Save Docker images
docker save -o "frontend_image.tar" $(docker-compose images -q frontend) 2>/dev/null || log_warning "Frontend image not found"
docker save -o "api_gateway_image.tar" $(docker-compose images -q api-gateway) 2>/dev/null || log_warning "API Gateway image not found"
docker save -o "backend_image.tar" $(docker-compose images -q backend) 2>/dev/null || log_warning "Backend image not found"
docker save -o "postgres_image.tar" postgres:15-alpine 2>/dev/null || log_warning "PostgreSQL image not found"
docker save -o "redis_image.tar" redis:7-alpine 2>/dev/null || log_warning "Redis image not found"
docker save -o "kafka_image.tar" confluentinc/cp-kafka:7.4.0 2>/dev/null || log_warning "Kafka image not found"
docker save -o "influxdb_image.tar" influxdb:2.7-alpine 2>/dev/null || log_warning "InfluxDB image not found"

log_message "Docker images backed up"

# 3. Backup database data
echo -e "${BLUE}🗄️  Backing up database data...${NC}"

# Check if containers are running
if docker-compose ps postgres | grep -q "Up"; then
    echo "PostgreSQL container is running, creating database dump..."
    docker-compose exec -T postgres pg_dump -U postgres forex_app > "database_dump.sql"
    log_message "Database dump created"
else
    log_warning "PostgreSQL container not running, skipping database dump"
fi

# 4. Backup configuration files
echo -e "${BLUE}⚙️  Backing up configuration files...${NC}"
cp docker-compose.yml "docker-compose.yml.backup"
cp .gitignore "gitignore.backup"
cp README.md "README.md.backup"
cp start.sh "start.sh.backup" 2>/dev/null || log_warning "start.sh not found"

# Backup environment files if they exist
find . -name "*.env*" -exec cp {} "{}.backup" \; 2>/dev/null || log_warning "No environment files found"

log_message "Configuration files backed up"

# 5. Backup documentation
echo -e "${BLUE}📚 Backing up documentation...${NC}"
find . -name "*.md" -exec cp {} "docs_backup/" \; 2>/dev/null || log_warning "No markdown files found"
log_message "Documentation backed up"

# 6. Create backup manifest
echo -e "${BLUE}📋 Creating backup manifest...${NC}"
cat > "BACKUP_MANIFEST.txt" << EOF
Forex Fundamental Data App - Backup Manifest
============================================

Backup Date: $(date)
Backup Time: $(date +"%H:%M:%S")
Project: ${PROJECT_NAME}
Version: 1.0.0

Contents:
---------
1. Source Code: Complete project source code
2. Docker Images: All service container images
3. Database: PostgreSQL dump (if available)
4. Configuration: Docker Compose and environment files
5. Documentation: Project documentation and README

Docker Images Included:
- Frontend (React app)
- API Gateway
- Backend services
- PostgreSQL 15
- Redis 7
- Kafka 7.4.0
- InfluxDB 2.7

Services:
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8000
- Backend: http://localhost:8080
- WebSocket: ws://localhost:8001
- Database: localhost:5432
- Redis: localhost:6379
- Kafka: localhost:29092
- InfluxDB: localhost:8086

Restore Instructions:
1. Extract backup to desired location
2. Run: docker-compose up -d
3. Wait for all services to start
4. Access frontend at http://localhost:3000

Backup created by: $(whoami)
Host: $(hostname)
EOF

log_message "Backup manifest created"

# 7. Create compressed archive
echo -e "${BLUE}🗜️  Creating compressed archive...${NC}"
cd ..
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
log_message "Compressed archive created: ${BACKUP_NAME}.tar.gz"

# 8. Clean up temporary files
echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
rm -rf "${BACKUP_NAME}"
cd "${PROJECT_NAME}"
rm -rf "source_code_backup"
rm -f *.tar
rm -f *.backup
rm -f database_dump.sql
rm -rf docs_backup

log_message "Temporary files cleaned up"

# 9. Calculate backup size
BACKUP_SIZE=$(du -h "../${BACKUP_NAME}.tar.gz" | cut -f1)
echo ""
echo -e "${GREEN}🎉 Backup completed successfully!${NC}"
echo -e "${BLUE}📁 Backup location: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz${NC}"
echo -e "${BLUE}📏 Backup size: ${BACKUP_SIZE}${NC}"
echo -e "${BLUE}⏰ Backup time: ${TIMESTAMP}${NC}"
echo ""

# 10. Verify backup integrity
echo -e "${BLUE}🔍 Verifying backup integrity...${NC}"
cd ..
if tar -tzf "${BACKUP_NAME}.tar.gz" > /dev/null 2>&1; then
    log_message "Backup archive is valid and not corrupted"
else
    log_error "Backup archive verification failed!"
    exit 1
fi

echo ""
echo -e "${GREEN}✨ Backup process completed successfully!${NC}"
echo -e "${YELLOW}💡 You can now safely store or transfer the backup file${NC}"
echo -e "${YELLOW}💡 To restore: tar -xzf ${BACKUP_NAME}.tar.gz && cd ${BACKUP_NAME} && docker-compose up -d${NC}"
