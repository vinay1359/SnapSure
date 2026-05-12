# SnapSure Kubernetes Setup

This guide explains both **automatic Jenkins-based deployment** and **manual Minikube setup** for SnapSure.

## What This Deployment Does

- Creates the `snapsure` namespace
- Starts the backend and frontend as Kubernetes Deployments
- Exposes the backend with a ClusterIP Service and the frontend with a NodePort Service
- Includes an optional NGINX Ingress manifest
- Includes health checks and resource limits for production readiness
- Integrates with Jenkins for automated deployments

---

## Quick Start: Jenkins Automated Deployment

The **recommended approach** is to use the Jenkins pipeline which handles everything automatically:

### Prerequisites

- Jenkins installed and running
- Jenkins agent with Docker, Minikube, and kubectl installed
- GitHub webhook configured (optional, for automatic triggers)

### How It Works

1. **Push to `main` branch** in GitHub
2. **Jenkins pipeline triggers** (webhook or manual)
3. **Stages 1-4**: Build Docker images and test with Docker Compose
4. **Stages 5-8**: Deploy to Kubernetes/Minikube
   - Stage 5: Auto-starts Minikube
   - Stage 6: Loads Docker images into Minikube
   - Stage 7: Applies K8s manifests
   - Stage 8: Verifies deployment and shows pod status

### Monitor Jenkins Pipeline

1. Open Jenkins dashboard
2. Click **SnapSure-Pipeline** job
3. Click the build number
4. View **Console Output** to see:
   - Minikube startup status
   - Image loading progress
   - K8s deployment status
   - Pod verification output
   - Access URLs

### Result

After successful pipeline:
- ✓ Docker Compose running locally (all branches)
- ✓ Kubernetes running in Minikube (main branch)
- ✓ Frontend accessible at: `http://<minikube-ip>:30300`
- ✓ Backend service: `backend-service.snapsure.svc.cluster.local:8000`

---

## Manual Setup: Minikube (Without Jenkins)

If you prefer to deploy manually, follow these steps:

---


## Manual Setup: Minikube (Without Jenkins)

If you prefer to deploy manually, follow these steps:

---

### Prerequisites

- Docker Desktop installed and running
- `kubectl` installed
- `minikube` installed
- A local Kubernetes cluster created with Minikube

### Windows Setup From Scratch

If you do not already have `kubectl` or `minikube`, install them on Windows first.

#### 1) Install Docker Desktop

Download and install Docker Desktop from the official Docker website, then start it once and make sure it is running in the system tray.

#### 2) Install `kubectl`

The easiest options on Windows are `winget` or Chocolatey.

```powershell
winget install -e --id Kubernetes.kubectl
```

If you use Chocolatey:

```powershell
choco install kubernetes-cli
```

Verify the install:

```powershell
kubectl version --client
```

If PowerShell says the command is not found, open a new terminal window so PATH updates load.

#### 3) Install Minikube

Install Minikube with `winget` or Chocolatey:

```powershell
winget install -e --id Kubernetes.minikube
```

Or:

```powershell
choco install minikube
```

Verify it:

```powershell
minikube version
```

#### 4) Start the local cluster

Start Minikube after Docker Desktop is running:

```powershell
minikube start --driver=docker
```

This creates your local Kubernetes cluster on Windows.

#### 5) Check that everything is ready

```powershell
kubectl get nodes
kubectl cluster-info
```

You should see one Minikube node in a `Ready` state.

### Start Minikube After Installation

```powershell
minikube start
```

If you already started Minikube in the setup section above, you can skip this step.

If you want to use the Ingress manifest, also enable the ingress addon:

```powershell
minikube addons enable ingress
```

### Build Images for Minikube

Use the PowerShell helper from the repository root:

```powershell
./k8s/deploy.ps1 deploy-minikube
```

This command:

1. Points Docker to the Minikube daemon
2. Builds `snapsure-backend:latest` and `snapsure-frontend:latest`
3. Applies all manifests in `k8s/`
4. Waits for both Deployments to roll out

---

### Deploy Manifests Manually

If you want to apply files yourself, run them in this order:

```powershell
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-backend-deployment.yaml
kubectl apply -f k8s/03-frontend-deployment.yaml
kubectl apply -f k8s/04-services.yaml
kubectl apply -f k8s/05-ingress.yaml
```

### Access the App

Fastest option with Minikube:

```powershell
minikube service frontend-service -n snapsure
```

That opens the NodePort service in your browser.

You can also port-forward:

```powershell
kubectl port-forward -n snapsure svc/frontend-service 3000:3000
```

Then open `http://localhost:3000`.

If you enabled ingress, add `snapsure.local` to your hosts file using the Minikube IP:

```powershell
minikube ip
```

Map that IP to `snapsure.local` and browse `http://snapsure.local`.

---

## Jenkins Pipeline Troubleshooting

### Pipeline Fails at "Minikube Start"

**Symptoms:**
- Stage 5 fails with "Minikube not installed" or "Minikube not found"

**Solutions:**
1. Verify Minikube is installed: `minikube version`
2. Check Jenkins agent has Minikube in PATH
3. Restart Jenkins agent and retry

### Pipeline Fails at "Load Images to Minikube"

**Symptoms:**
- Stage 6 fails with "image not found" or "image load error"

**Solutions:**
1. Verify Docker images were built: `docker images | grep snapsure`
2. Check Docker daemon is accessible: `docker ps`
3. Try manual image load: `docker save snapsure-backend:latest | minikube image load -`

### Pipeline Fails at "Deploy to Kubernetes"

**Symptoms:**
- Stage 7 fails with "kubectl not found" or "connection refused"

**Solutions:**
1. Verify kubectl is installed: `kubectl version`
2. Check Minikube cluster is running: `minikube status`
3. Set context: `kubectl config use-context minikube`
4. Check namespace: `kubectl get namespace snapsure`

### Pipeline Fails at "Verify Deployment"

**Symptoms:**
- Stage 8 fails with "deployment timeout" or "pods not ready"

**Solutions:**
1. Check pod status: `kubectl get pods -n snapsure`
2. View pod logs: `kubectl logs <pod-name> -n snapsure`
3. Describe pod: `kubectl describe pod <pod-name> -n snapsure`
4. Check resource availability: `kubectl top nodes`
5. Increase timeout in Jenkinsfile if models are downloading

---

## Important Runtime Notes

- `DEMO_MODE: "true"` is set in `k8s/01-configmap.yaml`, so the backend skips model initialization and returns demo predictions.
- There is no `weights/` hostPath mount in the manifests.
- If you want real Hugging Face model inference in Kubernetes, set `DEMO_MODE` to `"false"` and increase the backend memory limits.
- Images use `imagePullPolicy: Never` to use locally-built images in Minikube.
- All health checks use the `/health` endpoint for backend and `/` for frontend.

---

## Useful Commands

### Monitor Deployments

```powershell
# Check all resources in namespace
kubectl get all -n snapsure

# Get detailed pod status
kubectl get pods -n snapsure -o wide

# Watch deployment progress
kubectl get deployments -n snapsure -w

# Check services
kubectl get services -n snapsure
```

### View Logs

```powershell
# Backend deployment logs
kubectl logs -f -n snapsure deployment/backend

# Frontend deployment logs
kubectl logs -f -n snapsure deployment/frontend

# Specific pod logs
kubectl logs -f <pod-name> -n snapsure

# View last 50 lines
kubectl logs -n snapsure deployment/backend --tail=50

# Logs from all pods matching label
kubectl logs -f -n snapsure -l app=backend
```

### Debug Pods

```powershell
# Describe a pod (events and status)
kubectl describe pod -n snapsure -l app=backend
kubectl describe pod -n snapsure -l app=frontend

# Execute command inside pod
kubectl exec -it <pod-name> -n snapsure -- /bin/bash

# Get pod details in YAML
kubectl get pod <pod-name> -n snapsure -o yaml

# Check resource usage
kubectl top pod -n snapsure
kubectl top nodes
```

### Scale Deployments

```powershell
# Scale backend to 3 replicas
kubectl scale deployment backend -n snapsure --replicas=3

# Scale frontend to 2 replicas
kubectl scale deployment frontend -n snapsure --replicas=2

# Get current replicas
kubectl get deployments -n snapsure
```

### Update Deployments

```powershell
# Restart deployment (triggers new pods)
kubectl rollout restart deployment/backend -n snapsure
kubectl rollout restart deployment/frontend -n snapsure

# View rollout history
kubectl rollout history deployment/backend -n snapsure

# Check rollout status
kubectl rollout status deployment/backend -n snapsure
```

---

## Cleanup

```powershell
# Delete the entire snapsure namespace (all pods, services, deployments)
kubectl delete namespace snapsure

# Stop Minikube (keeps cluster)
minikube stop

# Delete entire Minikube cluster
minikube delete

# Clean up Minikube completely (removes all data)
minikube delete --all
```

---

## Ingress Setup (Optional)

To expose your app via domain name instead of NodePort:

```powershell
# Enable ingress addon
minikube addons enable ingress

# Apply ingress manifest
kubectl apply -f k8s/05-ingress.yaml

# Get Minikube IP
$IP = minikube ip

# Add to hosts file (Windows):
# C:\Windows\System32\drivers\etc\hosts
# <minikube-ip> snapsure.local

# Access: http://snapsure.local
```

---

