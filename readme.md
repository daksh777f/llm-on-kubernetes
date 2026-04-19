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

## Results

| Model | Avg Speed | Cost |
|-------|-----------|------|
| TinyLlama (Local K8s) | 20.23s | FREE |
| Claude Haiku (API) | 0.41s | ~$0.0003/query |

Claude is 49x faster. TinyLlama is 100% free and private.

## Full Guide

Blog: https://dev.to/dakxsh/how-to-deploy-an-open-source-llm-reliably-on-kubernetes-step-by-step-n7f

Video: https://youtu.be/EcyMo_vKpxo