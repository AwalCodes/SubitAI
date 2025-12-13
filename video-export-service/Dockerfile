FROM node:18-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies as root to avoid permission issues
RUN npm install

# Copy application files
COPY . .

# Create build artifacts ownership change
# Use the existing 'node' user (ID 1000) instead of creating a new one
RUN chown -R node:node /app

# Switch to 'node' user
USER node

# Expose the port commonly used by Hugging Face Spaces (7860)
EXPOSE 7860

# Environmental variable to set the port
ENV PORT=7860

CMD ["node", "server.js"]
