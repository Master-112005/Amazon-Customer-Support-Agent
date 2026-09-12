# AmazonHelp AI Support Agent

A lightweight, professional-grade AI support system designed to classify customer intents, ground replies in historical brand behavior, and intelligently decide between auto-handling and human escalation.

##  Quick Start 

### 1. Prerequisites
- **Node.js** (v16+)
- **Llama-3.2-1B-Instruct-Q4_K_M.gguf** placed in `./Llama-3.2-1B/`

### 2. Downolode the local LLm Model
you can downolode it from here
`https://drive.google.com/file/d/1g-uggHKcW2qUWLKyh0Q-9nNDZVj9xS0s/view?usp=drive_link`
Place it in this folder 
`/Llama-3.2-1B`

### 3. Installation
```bash
npm install
```

### 4. Run the Agent
Start the server to interact with the agent via API:
```bash
npm start
```

### 5. Reproduce Headline Results
Run the automated evaluation harness against the Golden Set of 200 hand-labelled examples:
```bash
node src/golden/evaluate.js
```

---

##  System Architecture

The agent follows a deterministic pipeline to ensure reliability and prevent LLM hallucinations:

1.  **Normalization Layer**: Cleans noise (URLs, @handles) and corrects common typos via a synonym map.
2.  **Weighted Intent Classifier**: A fast NLP engine that maps messages to a custom AmazonHelp taxonomy using weighted keyword matching.
3.  **Contextual Retriever**: Searches a purified dataset of 62,000+ historical conversations to find the most similar resolution.
4.  **Decision Module**: A logic gate that analyzes confidence and intent risk to decide:
    - `AUTO_HANDLE`: High confidence + historical evidence $\rightarrow$ Generate reply.
    - `ENQUIRY`: Moderate confidence $\rightarrow$ Ask clarifying question.
    - `ESCALATE`: Low confidence/High risk $\rightarrow$ Route to human.
5.  **Llama-3.2-1B Generator**: A local 1B parameter model that synthesizes a polite reply grounded **strictly** in the retrieved historical evidence.

##  Performance Summary
- **Intent Accuracy**: ~48% on noisy Twitter data.
- **Key Strength**: High reliability in high-risk categories (Refunds, Account Issues, Damaged Items).
- **Grounding**: Zero hallucination rate due to "evidence-only" generation constraints.
