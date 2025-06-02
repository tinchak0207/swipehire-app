# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install app dependencies
# If you're using yarn, replace npm install with yarn install
RUN npm install --production

# Bundle app source
COPY . .

# Your app binds to port 5000 (or whatever your PORT env var is)
# Cloud Run will automatically set the PORT environment variable.
# Your app needs to listen on the port specified by this env var.
# Make sure your index.js listens on process.env.PORT || 5000
ENV PORT 8080
EXPOSE 8080

# Keep container running for debugging
CMD ["/bin/sh", "-c", "node index.js & tail -f /dev/null"]