const fs = require('fs');
const path = require('path');
const readline = require('readline');
const config = require('../config');

class HistoricalRetriever {
    constructor() {
        this.historicalData = [];
        this.isLoaded = false;
        this.stopWords = config.retriever.stopWords;
    }

    async loadData() {
        const threadsPath = path.join(process.cwd(), 'data', 'processed', 'threads.jsonl');
        const holdoutPath = path.join(process.cwd(), 'data', 'golden', 'golden_conversations.json');

        if (!fs.existsSync(threadsPath)) {
            throw new Error(`Threads file not found at ${threadsPath}`);
        }

        const holdoutIds = new Set();
        if (fs.existsSync(holdoutPath)) {
            const holdoutData = JSON.parse(fs.readFileSync(holdoutPath, 'utf-8'));
            if (Array.isArray(holdoutData)) {
                holdoutData.forEach(id => holdoutIds.add(id));
            }
        }

        const fileStream = fs.createReadStream(threadsPath);
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

        this.historicalData = [];

        for await (const line of rl) {
            if (!line.trim()) continue;
            const thread = JSON.parse(line);

            if (holdoutIds.has(thread.conversation_id)) continue;

            for (let i = 0; i < thread.messages.length - 1; i++) {
                const msg = thread.messages[i];
                const nextMsg = thread.messages[i + 1];

                if (msg.role === 'customer' && nextMsg.role === 'agent') {
                    this.historicalData.push({
                        conversation_id: thread.conversation_id,
                        customer_text: msg.text,
                        agent_text: nextMsg.text,
                    });
                }
            }
        }
        this.isLoaded = true;
    }

    retrieve(text, intent, k = config.retriever.k) {
        if (!this.isLoaded) {
            throw new Error('Retriever data not loaded. Call loadData() first.');
        }

        const tokenize = (str) => {
            if (typeof str !== 'string') return new Set();
            return new Set(str.toLowerCase()
                .replace(/[^\w\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length > 1 && !this.stopWords.has(w)));
        };

        const inputTokens = tokenize(text);
        const scored = this.historicalData.map(example => {
            const exampleTokens = tokenize(example.customer_text);

            const intersection = new Set([...inputTokens].filter(x => exampleTokens.has(x)));

            const denominator = Math.min(inputTokens.size, exampleTokens.size);
            const score = denominator === 0 ? 0 : intersection.size / denominator;

            return {
                ...example,
                score: parseFloat(score.toFixed(4))
            };
        });

        return scored
            .sort((a, b) => b.score - a.score)
            .slice(0, k);
    }
}

module.exports = new HistoricalRetriever();
