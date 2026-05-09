# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Hugging Face Spaces requires port 7860
ENV PORT=7860
EXPOSE 7860

# Command to start the app
CMD ["node", "index.js"]
