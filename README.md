# SnapSure — AI-Powered Deepfake Detection

SnapSure is an enterprise-grade deepfake detection platform that classifies images as **Real** or **Fake** using an ensemble of state-of-the-art AI models. Built for production with complete DevOps infrastructure.

---

## Features

- **Ensemble AI Models**: Combines ViT Deepfake Detection and Deepfake vs Real Image Detection for superior accuracy
- **Lightning Fast**: 2-5 second analysis with optimized inference pipeline
- **Production Ready**: Docker, Kubernetes, and Jenkins CI/CD included
- **Privacy First**: Fully local inference with no external APIs
- **Modern UI**: Clean, startup-focused design built with Next.js and Tailwind CSS

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind CSS |
| Backend | Flask 3 + Gunicorn (Python 3.11) |
| ML Model | PyTorch 2 + Hugging Face Transformers + Ensemble |
| Models | ViT Deepfake Detection + Deepfake vs Real Image Detection |
| Face Detection | MTCNN (facenet-pytorch) |
| Containers | Docker + Docker Compose |
| CI/CD | Jenkins (declarative pipeline) |
| Orchestration | Kubernetes (Minikube) |

---

## Model Architecture

SnapSure uses an **ensemble approach** with two pretrained models from Hugging Face:

1. **Wvolf/ViT_Deepfake_Detection** - Vision Transformer-based deepfake detector
2. **dima806/deepfake_vs_real_image_detection** - Specialized deepfake vs real image classifier

### How It Works

1. **Image Processing**: The full image is analyzed (no face cropping for classification)
2. **Ensemble Inference**: Both models run inference independently
3. **Probability Extraction**: FAKE class probability is extracted from each model's logits
4. **Score Averaging**: `avg_fake_score = (score1 + score2) / 2`
5. **Decision Logic**:
   - If `avg_fake_score >= 0.5` → **FAKE**
   - Else → **REAL**
6. **Confidence Calculation**:
   - If FAKE: `confidence = avg_fake_score`
   - If REAL: `confidence = 1 - avg_fake_score`
7. **Face Detection** (secondary): MTCNN counts faces and optionally returns cropped face images

### Face Detection

Face detection is performed using MTCNN but is **not used** for the deepfake classification decision. It's provided for:
- Counting the number of faces in the image
- Optionally returning cropped face images for further analysis

---

## Project Structure

```
SnapSure/
├── frontend/          # Next.js app (port 3000)
│   ├── app/
│   │   ├── page.tsx          # Analyzer (home)
│   │   ├── features/         # Features page
│   │   ├── about/            # About page
│   │   ├── api/predict/      # API route
│   │   ├── layout.tsx        # Root layout with header/footer
│   │   └── globals.css       # Modern styling
├── backend/           # Flask API  (port 8000)
├── models/            # PyTorch inference layer (ensemble)
├── docker/            # Dockerfiles
│   ├── backend.Dockerfile
│   └── frontend.Dockerfile
├── k8s/               # Kubernetes manifests
│   ├── 00-namespace.yaml
│   ├── 01-configmap.yaml
│   ├── 02-backend-deployment.yaml
│   ├── 03-frontend-deployment.yaml
│   ├── 04-services.yaml
│   ├── 05-ingress.yaml
│   └── deploy.sh
├── docker-compose.yml
├── Jenkinsfile
└── README.md
```

---

## Quick Start

### Using Docker Compose (Recommended)

```bash
# From project root
docker compose up --build
```

- Frontend: http://localhost:3000
  - **Analyzer**: Upload and analyze images
  - **Features**: Learn about ensemble AI and DevOps capabilities
  - **About**: Company mission and technology stack
- Backend API: http://localhost:8000

**Note:** Docker Compose uses the values from `backend/.env.docker`. In the current repo, `DEMO_MODE=false`, so the backend loads the real ensemble models and may download them on first run.

### Using Docker Compose with Demo Mode

```bash
# Edit backend/.env.docker and set DEMO_MODE=true
# Then run:
docker compose up --build
```

In demo mode the backend skips model initialization and returns dummy predictions.

Verify backend health:

```bash
curl http://localhost:8000/health
```

Stop containers:

```bash
docker compose down
```

---

## API Reference

### `POST /predict`

Upload an image for deepfake detection.

- **Content-Type:** `multipart/form-data`
- **Field:** `file` (JPG / PNG / WEBP)

**Success response:**
```json
{
  "overall_label": "REAL",
  "overall_confidence": 0.8765,
  "fake_score": 0.1235,
  "num_faces": 1,
  "faces": []
}
```

**Response Fields:**

| Field | Type | Description |
|---|---|---|
| `overall_label` | string | Final classification: "REAL" or "FAKE" |
| `overall_confidence` | float | Confidence score (0.0 to 1.0), rounded to 4 decimal places |
| `fake_score` | float | Average FAKE probability from ensemble (0.0 to 1.0) |
| `num_faces` | int | Number of faces detected in the image |
| `faces` | array | Array of cropped face images (empty by default) |

**Error response:**
```json
{ "error": "Unsupported file type" }
```

### `GET /health`

Returns backend status and loaded model information.

```json
{ "status": "ok", "model": "ensemble" }
```

---

## Jenkins CI/CD Pipeline

### Pipeline Overview

The Jenkins pipeline handles both Docker Compose deployment and Kubernetes deployment on the main branch:

```
Code Push → Jenkins
    ↓
Stage 1: Setup Dependencies (npm, pip)
    ↓
Stage 2: Validate & Build (frontend build, lint, tests)
    ↓
Stage 3: Build Docker Images (snapsure-backend, snapsure-frontend)
    ↓
Stage 4: Deploy + Smoke Test (docker compose - all branches)
    ↓
Stage 5: Start Minikube (main branch only)
    ↓
Stage 6: Load Images to Minikube (main branch only)
    ↓
Stage 7: Deploy to Kubernetes (main branch only)
    ↓
Stage 8: Verify Deployment (main branch only)
```

### Pipeline Stages

| Stage | What it does | Branch |
|---|---|---|
| 1. Setup Dependencies | `npm ci` frontend, `pip install` backend deps | All |
| 2. Validate + Build | `npm run build`, lint, backend pytest | All |
| 3. Build Docker Images | Builds `snapsure-backend` and `snapsure-frontend` images | All |
| 4. Deploy + Smoke Check | `docker compose up -d`, health checks on `/health` and `/` | All |
| 5. Minikube Start | Starts or ensures Minikube cluster is running | main |
| 6. Load Images to Minikube | Loads built Docker images into Minikube's Docker daemon | main |
| 7. Deploy to Kubernetes | Applies K8s manifests (namespace, deployment, service, configmap) | main |
| 8. Verify Deployment | Waits for rollout, checks pod status, verifies services | main |

### Key Features

✓ **Cross-platform**: Works on Linux, macOS, and Windows  
✓ **Error Handling**: Automatic rollback and detailed error messages  
✓ **Health Checks**: Verifies pods are running and healthy  
✓ **Pod Logs**: Captures and displays container logs for debugging  
✓ **Automatic Minikube**: Starts Minikube if not running  
✓ **Image Loading**: Uses `minikube image load` with fallback methods  
✓ **Concurrent Build Prevention**: Prevents duplicate builds  
✓ **30-minute timeout**: Overall pipeline guard  

### Create Jenkins Job

1. Open Jenkins → **New Item** → **Pipeline** → name it `SnapSure-Pipeline`
2. Under **Pipeline**, set:
   - **Definition:** Pipeline script from SCM
   - **SCM:** Git
   - **Repository URL:** your GitHub repo URL
   - **Branch:** `*/main`
   - **Script Path:** `Jenkinsfile`
3. Save and click **Build Now**

### Prerequisites

Jenkins agent must have:
- Docker installed
- Minikube installed
- kubectl installed
- Git installed
- Either `bash` (Linux/macOS) or `PowerShell` (Windows)

### Verify Docker Images After Build

```bash
docker images | grep snapsure
```

Expected output:
```
snapsure-frontend   <build>   ...
snapsure-backend    <build>   ...
```

### Triggering the Pipeline

**Option 1: GitHub Webhook (Automatic)**
- Push to `main` branch triggers the pipeline automatically
- Jenkins must be accessible from GitHub
- Configure webhook in GitHub: Settings → Webhooks

**Option 2: Manual Trigger**
- Open Jenkins job → Click **Build Now**

---

## Kubernetes Deployment (Minikube + Jenkins)

### How It Works

The Jenkins pipeline automatically handles Kubernetes deployment on the main branch:

1. **Builds Docker images** in stages 1-3
2. **Starts Minikube cluster** (stage 5)
3. **Loads images into Minikube** (stage 6) - uses `minikube image load`
4. **Deploys manifests** (stage 7) - runs `kubectl apply -f k8s/`
5. **Verifies deployment** (stage 8) - waits for pods to be ready

### Architecture

```
Jenkins Agent
    ├─ docker build → snapsure-backend:latest
    ├─ docker build → snapsure-frontend:latest
    └─ minikube start
        ├─ minikube image load snapsure-backend
        ├─ minikube image load snapsure-frontend
        ├─ kubectl apply -f k8s/
        │   ├─ Namespace (snapsure)
        │   ├─ ConfigMaps (backend-config, frontend-config)
        │   ├─ Backend Deployment (replicas: 1)
        │   ├─ Frontend Deployment (replicas: 1)
        │   ├─ Backend Service (ClusterIP 8000)
        │   └─ Frontend Service (NodePort 30300)
        └─ kubectl rollout status
            ├─ Wait for backend pod ready
            └─ Wait for frontend pod ready
```

### Manifest Files

All Kubernetes manifests are in `k8s/`:

| File | Purpose |
|---|---|
| `00-namespace.yaml` | Creates `snapsure` namespace |
| `01-configmap.yaml` | Backend and frontend environment configs |
| `02-backend-deployment.yaml` | Backend pod with health checks and resource limits |
| `03-frontend-deployment.yaml` | Frontend pod with health checks and resource limits |
| `04-services.yaml` | ClusterIP service (backend), NodePort service (frontend) |
| `05-ingress.yaml` | Optional NGINX ingress for production |

### Image Pull Policy

All deployments use **`imagePullPolicy: Never`** to use locally-built images from Minikube.

### Accessing the Application

After successful deployment:

**Frontend (via NodePort):**
```bash
# Get Minikube IP
minikube ip

# Access via browser: http://<minikube-ip>:30300
# Example: http://192.168.49.2:30300
```

**Backend (from within cluster):**
```bash
# Access via kubectl port-forward
kubectl port-forward svc/backend-service -n snapsure 8000:8000

# Then access: http://localhost:8000
```

### Monitor Deployments

**Check deployment status:**
```bash
kubectl get deployments -n snapsure
kubectl get pods -n snapsure -o wide
kubectl get services -n snapsure
```

**View pod logs:**
```bash
# Backend logs
kubectl logs -l app=backend -n snapsure --tail=50 -f

# Frontend logs
kubectl logs -l app=frontend -n snapsure --tail=50 -f
```

**Describe a pod:**
```bash
kubectl describe pod <pod-name> -n snapsure
```

**Check pod health:**
```bash
kubectl get pods -n snapsure -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.phase}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'
```

### Manual Kubernetes Deployment

If you need to deploy manually without Jenkins:

```bash
# Start Minikube
minikube start --driver=docker --memory=4096 --cpus=2

# Build images inside Minikube
minikube docker-env
eval $(minikube docker-env)  # Load Minikube's Docker daemon
docker compose build

# Or load pre-built images
docker save snapsure-backend:latest | minikube image load -
docker save snapsure-frontend:latest | minikube image load -

# Deploy to Kubernetes
kubectl create namespace snapsure
kubectl apply -f k8s/

# Wait for deployment
kubectl rollout status deployment/backend -n snapsure --timeout=5m
kubectl rollout status deployment/frontend -n snapsure --timeout=5m

# Access the app
minikube service frontend-service -n snapsure
```

### Scaling Replicas

To scale the deployment:
```bash
kubectl scale deployment backend -n snapsure --replicas=3
kubectl scale deployment frontend -n snapsure --replicas=2
```

### Updating Deployments

After building new images:
```bash
# Load images
docker save snapsure-backend:latest | minikube image load -
docker save snapsure-frontend:latest | minikube image load -

# Trigger rollout
kubectl rollout restart deployment/backend -n snapsure
kubectl rollout restart deployment/frontend -n snapsure

# Verify rollout
kubectl rollout status deployment/backend -n snapsure
kubectl rollout status deployment/frontend -n snapsure
```

### Cleaning Up

```bash
# Delete deployments
kubectl delete namespace snapsure

# Stop Minikube
minikube stop

# Delete Minikube cluster completely
minikube delete
```

### Jenkins Pipeline Logs

Monitor pipeline execution:

1. **Open Jenkins** → Select `SnapSure-Pipeline` job
2. **Click Build Number** → **Console Output**
3. **View stage logs** including:
   - Minikube startup status
   - Docker image load progress
   - Kubernetes deployment status
   - Pod verification output

---

## Kubernetes Deployment (Manual - Old Method)

See [k8s/README-K8S.md](k8s/README-K8S.md) for the manual Windows-friendly Minikube workflow.

At a high level:

1. Start Minikube.
2. Build the images inside the Minikube Docker daemon.
3. Apply the manifests in `k8s/`.
4. Access the frontend with `minikube service frontend-service -n snapsure` or `kubectl port-forward`.
5. Enable the NGINX ingress addon if you want to use `snapsure.local`.

---

## End-to-End DevOps Flow

```
GitHub Push to main
    ↓
Jenkins detects change (webhook or manual trigger)
    ↓
Stage 1: Install Python + Node dependencies
    ↓
Stage 2: Build Next.js app, run lint + tests
    ↓
Stage 3: docker build → snapsure-backend:latest
         docker build → snapsure-frontend:latest
    ↓
Stage 4: docker compose up -d (all branches)
         curl /health & /  ← smoke test
         ✓ App running on localhost:3000 and localhost:8000
    ↓
╔═══════════════════════════════════════════════════════════╗
║  IF main BRANCH ONLY: Kubernetes Deployment             ║
╚═══════════════════════════════════════════════════════════╝
    ↓
Stage 5: minikube start (auto-start cluster if not running)
    ↓
Stage 6: minikube image load → snapsure-backend:latest
         minikube image load → snapsure-frontend:latest
    ↓
Stage 7: kubectl apply -f k8s/
         Creates: Namespace → ConfigMaps → Deployments → Services
    ↓
Stage 8: kubectl rollout status (verify all pods ready)
         Displays: Pod status, service endpoints, container logs
         ✓ App accessible via http://<minikube-ip>:30300
```

**Result:**
- ✓ **Docker Compose**: Running locally for development (all branches)
- ✓ **Kubernetes**: Running in Minikube for staging/testing (main branch only)
- ✓ Both deployments use the same Docker images
- ✓ Automatic error handling and rollback on any stage failure

---

## Local Development (without Docker)

### Prerequisites

- Python 3.11+
- Node.js 18+
- Internet connection (for Hugging Face model download on first run)

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
PYTHONPATH=. python -m backend.app
# → http://localhost:8000
```

**Note:** On first run, the ensemble models will be automatically downloaded from Hugging Face. This may take a few minutes depending on your internet connection.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Default | Description |
|---|---|---|
| `MODEL_DEVICE` | `cpu` | Device for model inference: `cpu` or `cuda` |
| `DEMO_MODE` | `false` | If `true`, returns dummy predictions without loading models |

**Frontend** (`frontend/.env.local`):

| Variable | Default | Description |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8000` | Backend API URL |

**Docker Compose** (`backend/.env.docker`):

| Variable | Default | Description |
|---|---|---|
| `MODEL_DEVICE` | `cpu` | Device for model inference |
| `DEMO_MODE` | `false` | If `true`, the backend skips model initialization and returns dummy predictions |

---

## Notes

- Database is not used — the app performs stateless image inference.
- Models are automatically downloaded from Hugging Face on first run (cached locally in `~/.cache/huggingface`).
- The ensemble uses lazy singleton pattern — models are loaded once and reused across requests.
- Face detection is performed using MTCNN but is not used for the deepfake classification decision.
- All containers run as non-root users for security.
- Kubernetes health probes use `/health` (backend) and `/` (frontend).
- First startup may take 1-2 minutes for model download and initialization.
- For production deployments, set `DEMO_MODE=false` in environment variables.

---

## Model Performance

### Expected Behavior

- **First Run**: 1-2 minutes for model download from Hugging Face
- **Subsequent Runs**: Models are cached locally (~2-3 seconds startup)
- **Inference Time**: 2-5 seconds per image (CPU), faster with GPU
- **Memory Usage**: ~2-3 GB RAM for both models (CPU mode)

### Model Cache Location

Models are cached in:
- Linux/Mac: `~/.cache/huggingface/hub/`
- Windows: `C:\Users\<username>\.cache\huggingface\hub\`

To clear cache and force re-download:
```bash
# Linux/Mac
rm -rf ~/.cache/huggingface/hub/

# Windows
Remove-Item -Recurse -Force $env:USERPROFILE\.cache\huggingface\hub\
```

---

## Troubleshooting

### Backend fails to start with "Failed to load models"

**Cause:** Network issues preventing Hugging Face model download

**Solution:**
1. Check internet connection
2. Verify Hugging Face is accessible: `curl https://huggingface.co`
3. Check firewall/proxy settings
4. Try manually downloading models or use `DEMO_MODE=true` for testing

### Health check fails in Docker Compose

**Cause:** Model download taking longer than healthcheck timeout

**Solution:**
1. Increase `start_period` in `docker-compose.yml` (currently 120s)
2. Check backend logs: `docker compose logs backend`
3. Set `DEMO_MODE=true` for quick testing without models

### Out of memory errors

**Cause:** Insufficient RAM for ensemble models

**Solution:**
1. Reduce to single model (modify `models/model.py`)
2. Use GPU with `MODEL_DEVICE=cuda` (if available)
3. Increase system RAM or use a larger instance

### Slow inference on CPU

**Cause:** Ensemble models running on CPU

**Solution:**
1. Use GPU if available: Set `MODEL_DEVICE=cuda` in environment
2. Ensure CUDA drivers are installed
3. Consider using a smaller model for faster inference
