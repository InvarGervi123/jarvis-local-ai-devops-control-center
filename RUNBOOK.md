# JARVIS Local AI DevOps Control Center - Runbook

This runbook is designed for system administrators, DevOps field engineers, and interviewers to troubleshoot, inspect, and maintain the local AI stack.

---

## 🗂️ Table of Diagnostics
1. [Backend Service Unavailable](#1-backend-service-unavailable)
2. [Ollama Server Unreachable](#2-ollama-server-unreachable)
3. [Configured Model is Missing](#3-configured-model-is-missing)
4. [Image / Screen Analysis Fails](#4-image--screen-analysis-fails)
5. [Docker Compose & Network Failures](#5-docker-compose--network-failures)
6. [Logging Reference (What to check first)](#6-logging-reference-what-to-check-first)

---

## 1. Backend Service Unavailable
**Symptoms**: Frontend says "Failed to fetch" or connection times out.
- **Check 1: Backend process status**
  - If running bare-metal: verify `nodemon` or `node server.js` is running on port `5000`.
  - If running in Docker: run `docker compose ps` to verify the state of `jarvis_backend`.
- **Check 2: Port conflicts**
  - Run `netstat -ano | findstr 5000` (Windows) or `lsof -i :5000` (macOS/Linux) to ensure no other process is holding the port.
- **Immediate Fix**: 
  - Stop the conflicting process or change the port inside `server/.env` and `docker-compose.yml`.

---

## 2. Ollama Server Unreachable
**Symptoms**: Health check endpoint (`/api/health`) reports `ollama: "disconnected"`. AI processing returns connection timeout errors.
- **Check 1: Server running status**
  - Open a web browser on your host machine and go to `http://localhost:11434/`. You should see `Ollama is running`.
- **Check 2: Docker host connectivity**
  - Inside a Docker container, `localhost:11434` resolves to the container itself, not the host machine.
  - Verify that `OLLAMA_BASE_URL` is set to `http://host.docker.internal:11434` inside the compose environments.
  - Verify that `extra_hosts` option is defined under the backend service in `docker-compose.yml` to route `host.docker.internal` to the host gateway.
- **Immediate Fix**:
  - Run `ollama serve` or open the Ollama desktop client.

---

## 3. Configured Model is Missing
**Symptoms**: Health check reports `ollama: "model_missing"`. AI requests fail with message: `Model 'gemma4' not found`.
- **Check 1: Pull state**
  - Run the list command:
    ```bash
    ollama list
    ```
    Confirm that `gemma4` (or your configured model name) appears in the output.
- **Check 2: Model spelling in env**
  - Ensure the model name in `server/.env` (`OLLAMA_MODEL`) exactly matches the model tag returned by Ollama.
- **Immediate Fix**:
  - Pull the model manually:
    ```bash
    ollama pull gemma4
    ```

---

## 4. Image / Screen Analysis Fails
**Symptoms**: Scanning a UI screenshot in **Screen Analysis** returns: `Image analysis is not supported by the current local setup/model`.
- **Reason**: The standard lightweight model `gemma4` is a text-only LLM and does not natively support multimodal vision input.
- **Check 1: Multimodal support**
  - If you require screenshot analysis to function locally, you must pull a vision-capable model (like `llava` or `bakllava`) and set `OLLAMA_MODEL` to that model.
- **Immediate Fix**:
  ```bash
  ollama pull llava
  # In server/.env and docker-compose.yml, change:
  # OLLAMA_MODEL=llava
  ```

---

## 5. Docker Compose & Network Failures
**Symptoms**: Database connection times out on startup. Docker build fails.
- **Check 1: MongoDB container status**
  - Verify that `jarvis_mongodb` is running and accessible on port `27017`.
  - Check database logs: `docker compose logs mongodb`.
- **Check 2: Database URI resolving**
  - When containerized, the backend must connect to `mongodb://mongodb:27017/jarvis` (using the container hostname), NOT `127.0.0.1:27017`.
- **Immediate Fix**:
  - Ensure the `MONGO_URI` environment variable inside `docker-compose.yml` points to the service name: `mongodb://mongodb:27017/jarvis`.

---

## 6. Logging Reference (What to check first)
Observability is critical. Check these logs to quickly pinpoint issues:

- **Express Startup Log**:
  Look for these indicators upon running `docker compose logs backend`:
  ```text
  🚀 J.A.R.V.I.S Local AI DevOps Control Center started successfully on port 5000
  📡 Selected AI Provider: ollama
  🤖 Selected Model: gemma4
  🟢 Ollama Connection Status: Connected. Model 'gemma4' is ready.
  ```
- **Failing Request Log**:
  Check for service exceptions when an endpoint crashes:
  ```text
  [AI Service Request Failed] Reason: connect ECONNREFUSED 127.0.0.1:11434
  [AI Route Error] Processing failed: Ollama is unreachable at http://localhost:11434
  ```
- **Health Check Ping Log**:
  Monitors incoming diagnostic traffic:
  ```text
  [Health Check Status] Status: OK | Provider: ollama | Model: gemma4 | Ollama Connection: connected
  ```
