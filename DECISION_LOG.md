# Decision Log: Non-Obvious Engineering Choices

- **Intent-Locking Session State**: Implemented a state machine (`AWAITING_CLARIFICATION`). This ensures that when an agent asks a clarifying question, the user's answer is tied to the *original* intent, solving the "memory loss" issue common in stateless bots.
- **Weighted Keyword Scoring**: Moved away from simple keyword counting to a weighted system. Keywords longer than 4 characters provide 1.5x points, reducing false positives from common short words.
- **Word-Boundary Regex (\b)**: Implemented strict word-boundary checks for all keywords and synonyms. This prevents "delivery" from matching "delivered" incorrectly when a specific distinction is required.
- **Guided Flow for High-Risk Intents**: Identified a set of `REQUIRED_CLARIFICATIONS` (e.g., `damaged_item`). The agent is forbidden from "auto-handling" these until it has first asked the specific clarifying question found in the historical data.
- **Contextual Retrieval Augmentation**: When a user replies to a clarifying question, I combine the *original query* + *the reply* before passing it to the retriever. This significantly increases token overlap with historical resolutions.
- **Llama-3.2-1B Grounding**: Used a 1B parameter model for generation but constrained it to use ONLY retrieved evidence. This prevents the LLM from inventing policies or promises not present in the AmazonHelp data.
- **Three-Tier Confidence Threshold**: Implemented Low, Moderate, and High thresholds in `config.js`. This allows for a nuanced transition between: Escalate $\rightarrow$ Clarify $\rightarrow$ Resolve.
- **Synonym Normalization Layer**: Built a pre-processing layer that corrects common user typos (e.g., "delevery" $\rightarrow$ "delivery") *before* classification, increasing the hit rate of the keyword engine.
- **la-hoc Stop-word Filtering**: Used a custom stop-word set for the retriever to ensure that common words (the, and, a) don't inflate similarity scores between unrelated conversations.
- **Data-Driven Fallbacks**: For cases where the model has no historical evidence, I wrote intent-specific fallbacks that mirror the polite, helpful tone of the AmazonHelp brand.
