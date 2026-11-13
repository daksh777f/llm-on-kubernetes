# Open Source LLM on Kubernetes

Deploy TinyLlama inside a real Kubernetes cluster with Grafana 
monitoring and a Next.js chatbot UI.

## What's Inside

- `ollama.yaml` — Kubernetes deployment for Ollama + TinyLlama
- `chatbot/` — Next.js chatbot UI
- `compare.py` — Comparison script (TinyLlama vs Claude Haiku)

## Stack

- **k3d** — Local Kubernetes inside Docker
- **Ollama** — Serves the LLM as a REST API
- **TinyLlama** — Open source 1.1B model (637MB RAM)
- **Prometheus + Grafana** — Cluster monitoring
- **Next.js + Tailwind** — Chatbot frontend

## Run it yourself

Requirements: Docker, [k3d](https://k3d.io), `kubectl`, Node.js 18+, Python 3.10+.

```bash
# 1. Local cluster + Ollama
k3d cluster create llm
kubectl apply -f ollama.yaml
kubectl -n llm rollout status deploy/ollama
kubectl -n llm exec deploy/ollama -- ollama pull tinyllama
kubectl -n llm port-forward svc/ollama-service 11434:11434

# 2. Chatbot UI (new terminal) — calls http://127.0.0.1:11434
cd chatbot
npm install
npm run dev

# 3. Benchmark (new terminal) — writes results.json
pip install requests anthropic
export ANTHROPIC_API_KEY=...   # your own key
python compare.py
```

Raw per-prompt latencies and responses are in [`results.json`](results.json).

## Results

| Model | Avg Speed | Cost |
|-------|-----------|------|
| TinyLlama (Local K8s) | 20.23s | FREE |
| Claude Haiku (API) | 0.41s | ~$0.0003/query |

Claude is 49x faster. TinyLlama is 100% free and private.

## Full Guide

Blog: https://dev.to/dakxsh/how-to-deploy-an-open-source-llm-reliably-on-kubernetes-step-by-step-n7f

Video: https://youtu.be/EcyMo_vKpxo