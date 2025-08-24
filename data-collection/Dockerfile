FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install --production=false

# Copy source code
COPY . .

# Clean any existing dist directory and build the application
RUN rm -rf dist && npm run build

# Remove dev dependencies to reduce image size (but keep the built dist folder)
RUN npm prune --production

# Start the application
CMD ["npm", "start"]
