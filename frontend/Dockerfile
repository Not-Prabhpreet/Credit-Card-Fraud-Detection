FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

EXPOSE 5173