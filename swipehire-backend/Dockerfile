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

# Cloud Run requires listening on port 8080
ENV PORT=8080
CMD ["node", "index.js"]
