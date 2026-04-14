# Start with a lightweight Python image
FROM python:3.10-slim

# Set the working directory inside the container
WORKDIR /app

# Ensure Python output is sent straight to terminal (makes logs visible in Docker)
ENV PYTHONUNBUFFERED=1

# Install system tools required for building certain Python packages (like psycopg2)
RUN apt-get update && apt-get install -y gcc libpq-dev

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all your project files into the container
COPY . .