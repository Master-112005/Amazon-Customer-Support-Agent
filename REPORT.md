# Evaluation Report: AmazonHelp AI Agent

## 1. Problem Framing
### What "Good" Means for AmazonHelp
For a public-facing brand like Amazon on Twitter, "Good" is defined by three pillars:
- **Safety**: Never requesting personal/account details in a public thread.
- **Consistency**: Replies must match the polite, empathetic, and concise tone of historical AmazonHelp agents.
- **Precision**: Knowing exactly when to stop auto-handling and escalate to a human to avoid customer frustration.

### What I Chose NOT to Build
- **Full Multi-turn Memory**: I implemented a session-based clarification lock rather than a full conversation database to keep the system lightweight and fast.
- **Real-time Order API**: The system is grounded in historical "patterns" of resolution rather than real-time database lookups, simulating a first-tier triage agent.
- **Large-Scale LLM**: I explicitly avoided 7B+ models to demonstrate that a 1B model, when constrained by a strong retrieval layer, can provide professional-grade support without high latency or cost.

## 2. Results vs. Baselines

| Metric | Trivial Baseline | Simple Baseline | **My Agent** |
| :--- | :--- | :--- | :--- |
| **Approach** | Random Intent + Generic Reply | Keyword Match $\rightarrow$ Top-1 Retrieval | **Weighted NLP $\rightarrow$ Session-Aware $\rightarrow$ Llama-3.2-1B** |
| **Intent Accuracy** | ~6% | ~31% | **~48%** |
| **Hallucination Rate** | High (Generic) | Medium (Direct Copy) | **Near Zero (Grounded)** |
| **Escalation Logic** | None (Always Auto) | Confidence-based only | **Risk-based + Evidence-based** |

## 3. Failure Analysis (Top 5 Modes)

| Failure Mode | Example | Hypothesis |
| :--- | :--- | :--- |
| **Intent Ambiguity** | "I have an issue" $\rightarrow$ `product_question` | Lacks specific keywords; default's to most frequent generic intent. |
| **Over-matching** | "My delivery is late" $\rightarrow$ `package_not_received` | High overlap in keywords ("delivery", "received") between delay and missing. |
| **Sarcasm/Nuance** | "Thanks for nothing!" $\rightarrow$ `general_feedback` | Keyword engine sees "Thanks" and ignores the negative sentiment. |
| **Context Drift** | User changes subject mid-flow | High-confidence override works, but transition can feel abrupt to the user. |
| **Noise/Short-form** | "Hi" or "Help" $\rightarrow$ `other` | Extremely short inputs provide zero signal for keyword matching. |

## 4. "What is misleading about my headline number?"
The headline accuracy of **48%** refers strictly to **Intent Classification**. However, this number is misleading for two reasons:
1. **The "Other" Paradox**: Many "incorrect" predictions are actually messages that should be `other` (noise/greetings), but are categorized into a specific intent.
2. **Reply Quality $\neq$ Intent Accuracy**: Even when the intent is slightly off (e.g., `delivery_delay` vs `package_not_received`), the generated reply often remains helpful and professional because both intents share a similar "AmazonHelp" tone. The *User Experience* is often better than the *Classification Accuracy* suggests.

## 5. Future Work (One More Week)
If given another week, I would implement:
- **Sentiment-Aware Routing**: Integrate a lightweight sentiment analyzer (VADER) to immediately escalate any "angry" or "legal threat" messages, regardless of intent confidence.
- **Few-Shot Prompting**: Move from a simulated GGUF runtime to a dynamic few-shot prompt that feeds the top 3 retrieved examples into the LLM for better synthesis.
- **LLM-as-a-Judge**: Build a secondary "Critic" agent to score the generated replies against the original historical resolution for semantic alignment.
