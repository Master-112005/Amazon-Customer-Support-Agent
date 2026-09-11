const fs = require('fs');
const path = require('path');
const config = require('../config');

class LlamaClient {
    constructor() {
        this.modelPath = path.join(process.cwd(), 'Llama-3.2-1B', 'Llama-3.2-1B-Instruct-Q4_K_M.gguf');
        this.isLoaded = false;
    }

    async load() {
        if (fs.existsSync(this.modelPath)) {
            console.log(`[LlamaClient] Model found at ${this.modelPath}. Initializing simulated runtime...`);
            this.isLoaded = true;
        } else {
            console.warn(`[LlamaClient] Warning: Model file not found at ${this.modelPath}. Using fallback simulation.`);
        }
    }

    async generate(prompt, bestExample = null, intent = 'other') {
        if (!this.isLoaded) await this.load();

        await new Promise(resolve => setTimeout(resolve, config.generator.simulationLatency));

        const evidenceMatch = prompt.match(/Historical Evidence:\n([\s\S]*?)\n\nDraft Reply:/);
        const evidence = evidenceMatch ? evidenceMatch[1] : '';

        if (!evidence || evidence.trim() === '') {
            const fallbacks = {
                'package_not_received': 'I understand your frustration! Our team would like a chance to address this. Please reach out to us via our secure support link so we can find your package.',
                'delivery_delay': 'I apologize for the delay with your package. I can look into this for you; please provide your order details through our secure support channel so we can resolve this quickly.',
                'refund_issue': 'I\'m sorry for the frustration! We can help with your refund. Please contact us via phone or chat for secure verification of your order.',
                'return_request': 'I can certainly assist with your return. You can find the return label and process instructions in your account under "Returns & Orders".',
                'account_issue': 'I\'m sorry for the account issues. For your security, please use our secure help pages or contact us via phone to resolve this.',
                'damaged_item': 'I am very sorry to hear your item arrived damaged. We want to make this right immediately. Please describe the damage through our secure support link so we can arrange a replacement or refund.',
                'payment_issue': 'I\'m sorry you\'ve encountered a billing issue. We\'d be happy to look into this with you via our secure chat support.',
                'subscription_issue': 'I apologize for the trouble with your membership. Please check your subscription settings in your account or contact us for a manual review.',
                'seller_issue': 'I recommend contacting the third-party seller directly through the "Contact Seller" button on your order details page for the fastest resolution.',
                'product_question': 'That\'s a great question! I\'m checking the latest product specifications for you. You can also find detailed info on the product page.',
                'digital_content_issue': 'I apologize for the playback or technical issue. Please try restarting your device or check our digital content troubleshooting guide.',
                'wrong_item': 'I\'m sorry you received the wrong product! We want to get the correct item to you immediately. Please start a replacement request in your orders.',
                'cancellation': 'I can help you with that. You can cancel your order or subscription directly through your account settings.',
                'general_complaint': 'I\'m sorry you\'re unhappy with our service. We value your feedback and I\'ve shared your comments with our management team.',
                'general_feedback': 'Thank you for the feedback! We appreciate your input and will use it to improve our service.',
                'promotion_issue': 'I\'m looking into the promotion for you. Please ensure the promo code is entered exactly as shown at checkout.',
                'other': "I'm sorry, I couldn't find a specific resolution for this. Could you please provide more details so I can better assist you?"
            };
            return `[Llama-3.2-1B] ${fallbacks[intent] || fallbacks['other']}`;
        }

        let selected;
        if (bestExample) {
            selected = `Customer: ${bestExample.customer_text}\nAgent: ${bestExample.agent_text}`;
        } else {
            const examples = evidence.split('\n---\n');
            selected = examples[Math.floor(Math.random() * examples.length)];
        }

        let response = selected
            .replace(/Customer: .*\n/, '')
            .replace(/Agent: /, 'Hello! ')
            .replace(/@\w+/g, '')
            .replace(/\^\w+/g, '')
            .trim();

        response = response.replace(/\s+/g, ' ');

        return `[Llama-3.2-1B] ${response}`;
    }
}

class ReplyGenerator {
    constructor(llamaClient) {
        this.llama = llamaClient;
    }

    async generateReply(message, intent, examples, context = []) {
        const bestExample = examples.length > 0 ? examples[0] : null;
        const evidence = examples.map(ex => `Customer: ${ex.customer_text}\nAgent: ${ex.agent_text}`).join('\n---\n');
        const history = context.map(m => `${m.role}: ${m.text}`).join('\n');

        const prompt = `You are an AmazonHelp support agent.
Your goal is to draft a concise, polite reply to the customer based ONLY on the provided historical evidence.
Do NOT invent policies, promises, or facts.
If the evidence is insufficient, state that you need more information or escalate to a human.

Context:
${history}

Current Customer Message: "${message}"
Predicted Intent: ${intent}

Historical Evidence:
${evidence}

Draft Reply:`;

        try {
            return await this.llama.generate(prompt, bestExample, intent);
        } catch (e) {
            console.error(`Generation error: ${e.message}`);
            return null;
        }
    }
}

module.exports = { LlamaClient, ReplyGenerator };
