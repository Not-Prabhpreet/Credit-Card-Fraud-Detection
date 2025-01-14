# Build frontend
FROM node:18-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build backend and serve frontend
FROM python:3.8-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend files
COPY backend/ .

# Copy built frontend to static directory
COPY --from=frontend-builder /frontend/dist /app/static

# Make port configurable via environment variable
ENV PORT=8000

# Expose port
EXPOSE $PORT

# Command to run the application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT