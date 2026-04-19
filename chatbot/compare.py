import time
import requests
import anthropic
import json

PROMPTS = [
    "Which AI model are you? Tell me your name and version.",
    "Explain what Kubernetes is in 2 sentences.",
    "Write a Python function to reverse a string.",
    "What is the capital of Australia?",
    "Explain the difference between RAM and storage simply.",
    "Write a haiku about programming.",
    "What is Docker used for?",
    "Explain what an API is to a 10 year old.",
    "What are 3 benefits of open source software?",
    "What is machine learning in simple terms?",
]

results = []

# ─── TEST 1: TinyLlama via Ollama (FREE, local k8s) ───────────────────
print("=" * 60)
print("TESTING TinyLlama (Local Kubernetes)")
print("=" * 60)

for i, prompt in enumerate(PROMPTS):
    start = time.time()
    try:
        r = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={"model": "tinyllama", "prompt": prompt, "stream": False},
            timeout=120
        )
        elapsed = round(time.time() - start, 2)
        text = r.json().get("response", "ERROR").strip()
    except Exception as e:
        elapsed = round(time.time() - start, 2)
        text = f"ERROR: {e}"

    results.append({
        "prompt_num": i + 1,
        "prompt": prompt,
        "model": "TinyLlama (Local K8s)",
        "response": text,
        "latency_sec": elapsed,
        "cost_usd": 0.0
    })
    print(f"  [{i+1}/10] {elapsed}s → {prompt[:45]}...")
    print(f"          {text[:80]}...")
    print()

# ─── TEST 2: Claude Haiku (Anthropic API) ─────────────────────────────
print("=" * 60)
print("TESTING Claude Haiku (Anthropic API)")
print("=" * 60)

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY env var

for i, prompt in enumerate(PROMPTS):
    start = time.time()
    try:
        msg = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=300,
            messages=[{"role": "user", "content": prompt}]
        )
        elapsed = round(time.time() - start, 2)
        text = msg.content[0].text.strip()
        input_cost = msg.usage.input_tokens / 1000 * 0.00025
        output_cost = msg.usage.output_tokens / 1000 * 0.00125
        cost = round(input_cost + output_cost, 6)
    except Exception as e:
        elapsed = round(time.time() - start, 2)
        text = f"ERROR: {e}"
        cost = 0.0

    results.append({
        "prompt_num": i + 1,
        "prompt": prompt,
        "model": "Claude Haiku (API)",
        "response": text,
        "latency_sec": elapsed,
        "cost_usd": cost
    })
    print(f"  [{i+1}/10] {elapsed}s ${cost:.5f} → {prompt[:45]}...")
    print(f"          {text[:80]}...")
    print()

# ─── SAVE RESULTS ─────────────────────────────────────────────────────
with open("C:\\Users\\iamda\\Desktop\\llm-project\\results.json", "w") as f:
    json.dump(results, f, indent=2)

# ─── PRINT SUMMARY TABLE ──────────────────────────────────────────────
print()
print("=" * 65)
print(f"{'FINAL COMPARISON SUMMARY':^65}")
print("=" * 65)
print(f"{'Model':<28} {'Avg Speed':>10} {'Total Cost':>12} {'Cost/Q':>10}")
print("-" * 65)

for model in ["TinyLlama (Local K8s)", "Claude Haiku (API)"]:
    subset = [r for r in results if r["model"] == model]
    avg = sum(r["latency_sec"] for r in subset) / len(subset)
    total = sum(r["cost_usd"] for r in subset)
    per_q = total / len(subset)
    print(f"{model:<28} {avg:>9.2f}s  ${total:>10.5f}  ${per_q:>8.6f}")

print("=" * 65)
print()
print("Full results saved to: C:\\Users\\iamda\\Desktop\\llm-project\\results.json")
print()
print("KEY INSIGHTS:")
print("  TinyLlama → Runs FREE on your own hardware inside Kubernetes")
print("  Claude    → Faster responses, stronger reasoning, costs per call")
print("  Winner depends on your use case: cost vs quality vs privacy")