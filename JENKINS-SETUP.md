# Jenkins Setup for SnapSure

This guide explains Jenkins configuration and pipeline stages.

## What Jenkins Does Here

The current pipeline (from `Jenkinsfile`) does this:

### Stages 1-4: Build and Docker Compose (All Branches)
1. Pull code from GitHub
2. Install backend and frontend dependencies (`npm ci`, `pip install`)
3. Build frontend (`npm run build`)
4. Run checks (lint/tests)
5. Build Docker images (`docker compose build`)
6. Deploy via Docker Compose and verify with health checks

### Stages 5-8: Kubernetes Deployment (main branch only)
5. Start Minikube cluster (auto-starts if not running)
6. Load Docker images into Minikube (`minikube image load`)
7. Deploy to Kubernetes (`kubectl apply -f k8s/`)
8. Verify deployment and show pod status

## What You Need

- Jenkins running
- Git installed on Jenkins machine
- Docker installed on Jenkins machine
- Minikube installed on Jenkins machine
- kubectl installed on Jenkins machine
- Node + npm installed
- Python installed
- Repo URL (GitHub)

## Step 1: Prepare Jenkins Agent

The Jenkins agent (machine where builds run) needs:

```bash
# Check all prerequisites
docker --version
minikube version
kubectl version --client
npm --version
python3 --version
git --version
```

If any are missing, install them:

**Docker:**
- Linux: `apt-get install docker.io` or follow https://docs.docker.com/engine/install/
- macOS: Install Docker Desktop
- Windows: Install Docker Desktop

**Minikube:**
```bash
# Linux
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# macOS
brew install minikube

# Windows
winget install kubernetes.minikube
```

**kubectl:**
```bash
# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# macOS
brew install kubectl

# Windows
winget install kubernetes.kubectl
```

## Step 2: Create Jenkins Pipeline Job

1. Open Jenkins
2. Click `New Item`
3. Job name: `SnapSure-Pipeline`
4. Choose `Pipeline`
5. Click `OK`

In job config:

- **Definition:** `Pipeline script from SCM`
- **SCM:** `Git`
- **Repository URL:** your GitHub URL (e.g., `https://github.com/your-org/SnapSure`)
- **Credentials:** 
  - Leave blank for public repos
  - Add GitHub PAT for private repos
- **Branch:** `*/main`
- **Script Path:** `Jenkinsfile`

Under **Build Triggers:**
- Check `GitHub hook trigger for GITScm polling`

Under **Options:**
- Timeout: `45 minutes` (for model downloads)
- Discard old builds: Keep last `10 builds`

Save.

## Step 3: Enable Auto Build on GitHub Push

This makes Jenkins run automatically when you push to `main`.

### In Jenkins

1. Open `SnapSure-Pipeline` job
2. Click `Configure`
3. Under **Build Triggers**, check `GitHub hook trigger for GITScm polling`
4. Save

### In GitHub

1. Open your repo on GitHub
2. Go to **Settings** → **Webhooks**
3. Click **Add webhook**
4. Fill in:
   - **Payload URL:** `http://<jenkins-host>:8080/github-webhook/`
   - **Content type:** `application/json`
   - **Events:** `Just the push event` (or `Let me select individual events` → check `Pushes`)
   - **Active:** ✓ Checked
5. Click **Add webhook**

Now:
- Every push to `main` branch → Jenkins builds automatically
- Check Jenkins logs in Jenkins UI
- View build details in GitHub (green checkmark = passed, red X = failed)

## Step 4: Run Once Manually

1. Open `SnapSure-Pipeline` job
2. Click `Build Now`
3. A new build appears in Build History
4. Click the build number → `Console Output`
5. Watch the stages execute in order

You should see:
- ✓ Dependencies installed
- ✓ Frontend built
- ✓ Docker images built
- ✓ Docker Compose deployed and health checks pass
- ✓ (On main) Minikube started
- ✓ (On main) Images loaded to Minikube
- ✓ (On main) Kubernetes deployment applied
- ✓ (On main) Pods verified running

### Expected Output

```
...
[Pipeline] Start of Pipeline
[Pipeline] node
Running on <agent-name>
[Pipeline] {
[Pipeline] stage
[Pipeline] { (1. Setup Dependencies)
...
[Pipeline] stage
[Pipeline] { (2. Validate + Build)
...
[Pipeline] stage
[Pipeline] { (3. Build Docker Images)
...
[Pipeline] stage
[Pipeline] { (4. Deploy + Smoke Check)
...
[Pipeline] stage
[Pipeline] { (5. Minikube Start)
...
[Pipeline] stage
[Pipeline] { (6. Load Images to Minikube)
...
[Pipeline] stage
[Pipeline] { (7. Deploy to Kubernetes)
...
[Pipeline] stage
[Pipeline] { (8. Verify Deployment)
...
[Pipeline] Post Actions
[Pipeline] { (Success)
Pipeline passed. Build #<N> deployed.
✓ Docker Compose deployment ready
✓ Kubernetes/Minikube deployment successful
```

## Accessing the Deployment After Build

After a successful build:

**Docker Compose (all branches):**
```bash
# Accessible locally on Jenkins agent
http://localhost:3000     # Frontend
http://localhost:8000     # Backend API
```

**Kubernetes/Minikube (main branch only):**
```bash
# Get the Minikube IP
minikube ip

# Then access via browser
http://<minikube-ip>:30300   # Frontend (NodePort)

# Or port-forward for backend
kubectl port-forward svc/backend-service -n snapsure 8000:8000
http://localhost:8000        # Backend
```

## Credentials Guide

| Scenario | Solution |
|---|---|
| Public GitHub repo | No credentials needed |
| Private GitHub repo | Add GitHub Personal Access Token (PAT) as Jenkins credential |
| Push to Docker Hub | Add Docker Hub credentials (not currently used) |
| Kubernetes access | Use default kubeconfig (Minikube uses `~/.kube/config`) |

## Common Issues

| Problem | Reason | Fix |
|---|---|---|
| Build not auto-starting | Webhook not configured | Recreate webhook in GitHub → Settings → Webhooks |
| `stage Minikube Start` fails | Minikube not installed on agent | Install Minikube: `brew install minikube` or use installer |
| `stage Load Images` fails | Docker images not built | Check stage 3 logs for build errors |
| `stage Deploy to Kubernetes` fails | kubectl not configured | Install kubectl and ensure `~/.kube/config` exists |
| `stage Verify Deployment` fails | Pods not starting | Check `kubectl logs -n snapsure` for errors |
| Pipeline timeout (45 min) | First run takes long for model download | On first run, models download from Hugging Face (~2-3 min) |
| Permission denied: docker | Jenkins user cannot access Docker | Add Jenkins user to docker group: `usermod -aG docker jenkins` |
| Health check timeout | Models still downloading | Wait, then retry. Or set `DEMO_MODE=true` for faster testing |

## Monitoring and Logs

### View Build in Jenkins UI

1. Open `SnapSure-Pipeline` → Build number
2. Click `Console Output` to see real-time logs
3. Each stage shows clear status (✓ or ✗)

### View Kubernetes Status During Build

```bash
# From Jenkins agent machine
kubectl get pods -n snapsure -o wide
kubectl get services -n snapsure
kubectl logs -l app=backend -n snapsure
kubectl logs -l app=frontend -n snapsure
```

### View Build History

1. Open `SnapSure-Pipeline`
2. Build History shows all builds with status
3. Click any build to see detailed logs

## Best Practices

1. **Protect main branch**: Enable branch protection in GitHub
   - Require pull request reviews before merge
   - Require status checks to pass before merge

2. **Monitor builds**: Check Jenkins regularly
   - Slow builds might indicate performance issues
   - Failed builds need immediate attention

3. **Version control**: Always commit to GitHub
   - Pipeline only runs on pushed commits
   - Works best with branch strategy (main for production)

4. **Resource management**: Monitor Minikube resources
   - Default: 2 CPUs, 2 GB RAM
   - Increase if needed: `minikube start --cpus=4 --memory=8192`

5. **Notifications**: Add alerts (optional)
   - Slack integration for failed builds
   - Email notifications to team

## Optional Next Upgrades

1. **Add backend unit tests** to stage 2
2. **Push images to Docker Hub** (add credentials and push step)
3. **Add Slack notifications** for build status
4. **Add email notifications** for failures
5. **Add code coverage reports**
6. **Add security scanning** (Trivy, Snyk)
7. **Add manual approval stage** before Kubernetes deployment
8. **Add rollback mechanism** for failed deployments

## Troubleshooting Kubernetes Stages

See [k8s/README-K8S.md](k8s/README-K8S.md#jenkins-pipeline-troubleshooting) for detailed troubleshooting of Kubernetes-specific issues.

## Common Team Setup

```
Developer → Push to main branch
    ↓
GitHub webhook → Triggers Jenkins
    ↓
Jenkins Pipeline:
  • Builds and tests
  • Runs Docker Compose (all branches)
  • Deploys to Kubernetes (main only)
    ↓
Deployment successful → Team notified (optional)
```

## Good Team Practice

1. Protect `main` branch on GitHub (require PR reviews)
2. Use feature branches for development
3. Merge to `main` only via pull requests
4. Keep Jenkins running continuously
5. Monitor build logs for failures
6. Alert the team immediately on build failure

---

For detailed Kubernetes deployment information, see [k8s/README-K8S.md](k8s/README-K8S.md).




now we are testing the jenkins automation..lets see
again we are trying, hope it works
