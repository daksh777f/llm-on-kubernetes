# Open Source LLM on Kubernetes

Deploy TinyLlama inside a real Kubernetes cluster with Grafana 
monitoring and a Next.js chatbot UI.

## What's Inside

- `k8s/` — production-ready Kustomize manifests for CPU and NVIDIA GPU nodes
- `chatbot/` — Next.js chatbot UI
- `compare.py` — Comparison script (TinyLlama vs Claude Haiku)

## Stack

- **k3d** — Local Kubernetes inside Docker
- **Ollama** — Serves the LLM as a REST API
- **TinyLlama** — Open source 1.1B model (637MB RAM)
- **Prometheus + Grafana** — Cluster monitoring
- **Next.js + Tailwind** — Chatbot frontend

## Results

| Model | Avg Speed | Cost |
|-------|-----------|------|
| TinyLlama (Local K8s) | 20.23s | FREE |
| Claude Haiku (API) | 0.41s | ~$0.0003/query |

Claude is 49x faster. TinyLlama is 100% free and private.

## Full Guide

Blog: https://dev.to/dakxsh/how-to-deploy-an-open-source-llm-reliably-on-kubernetes-step-by-step-n7f

Video: https://youtu.be/EcyMo_vKpxo

## Deploy Ollama

The base deployment uses a 20 Gi `ReadWriteOnce` persistent volume for
`/root/.ollama`, so downloaded models survive pod restarts and rollouts. It
also waits for Ollama's `/api/tags` endpoint before accepting traffic and uses
a startup probe to allow large model caches time to initialize.

### CPU (k3d, kind, or Minikube)

Your cluster must provide a default storage class. Then deploy the CPU overlay:

```bash
kubectl apply -k k8s/overlays/cpu
kubectl -n llm rollout status deployment/ollama --timeout=10m
```

The default resource envelope is 1–2 CPU cores and 4–6 GiB of memory. Adjust
`k8s/base/ollama.yaml` if the selected model needs more memory.

### NVIDIA GPU

Before applying the GPU overlay, install the NVIDIA GPU Operator or device
plugin and create an `nvidia` RuntimeClass. Label GPU nodes so the workload is
never scheduled onto an incompatible node:

```bash
kubectl label node <gpu-node> accelerator=nvidia-gpu
kubectl apply -k k8s/overlays/gpu
kubectl -n llm rollout status deployment/ollama --timeout=10m
```

The GPU overlay requests exactly one `nvidia.com/gpu`, tolerates dedicated GPU
nodes, selects the label above, and raises the CPU/memory envelope for parallel
inference. If your cluster uses a different RuntimeClass or node label, update
`k8s/overlays/gpu/gpu-patch.yaml` before deployment.

### Storage classes

When no `storageClassName` is set, Kubernetes uses the cluster default. Ready
patches are included for common environments:

| Environment | Ready-to-use overlay | Storage class |
| --- | --- | --- |
| AWS EKS with NVIDIA GPU nodes | `k8s/overlays/gpu-eks` | `gp3` |
| Google GKE with NVIDIA GPU nodes | `k8s/overlays/gpu-gke` | `standard-rwo` |
| k3s local development | `k8s/overlays/cpu-local` | `local-path` |

Apply the matching overlay instead of the generic CPU or GPU overlay. The
storage-class selection is intentionally local to each overlay so standard
Kustomize security restrictions remain enabled. Copy one of these small
overlays when a cluster uses a different compute/storage combination.

Choose the storage class before the first deployment because a PVC's storage
class is immutable. Confirm that the claim is bound before downloading models:

```bash
kubectl -n llm get pvc ollama-models
kubectl -n llm exec deployment/ollama -- ollama pull tinyllama
```

The deployment uses the `Recreate` strategy so the single `ReadWriteOnce`
model cache is not mounted by old and new pods simultaneously. During planned
shutdown Kubernetes allows up to 120 seconds for in-flight inference requests
to finish.
