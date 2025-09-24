

# Dockerfile
FROM python:3.11

WORKDIR /app

# Copy dependency list
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "main:create_app", "--factory", "--host", "0.0.0.0", "--port", "8000", "--reload"]
