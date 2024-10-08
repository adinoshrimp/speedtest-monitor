FROM python:3.11-slim-bookworm

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y speedtest-cli && apt install -y iputils-ping
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["python", "app.py"]