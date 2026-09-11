const taxonomy = require('../intent/taxonomy');
const config = require('../config');

class IntentClassifier {
    constructor() {
        this.taxonomy = taxonomy.intents;
        this.synonyms = config.classifier.synonyms;
        this.stopWords = config.classifier.stopWords;
    }

    normalize(text) {
        let cleaned = text.toLowerCase();

        for (const [typo, correct] of Object.entries(this.synonyms)) {
            const regex = new RegExp(`\\b${typo}\\b`, 'g');
            cleaned = cleaned.replace(regex, correct);
        }

        cleaned = cleaned.replace(/https?:\/\/\S+/g, '')
                         .replace(/@\w+/g, '')
                         .replace(/[^\w\s]/g, ' ')
                         .replace(/\s+/g, ' ')
                         .trim();

        return cleaned;
    }

    classify(text) {
        if (!text || typeof text !== 'string') {
            return { intent: 'other', confidence: 0, method: 'validation_fail' };
        }

        const cleaned = this.normalize(text);
        const words = cleaned.split(' ').filter(w => w.length > 0 && !this.stopWords.has(w));

        const matches = [];

        for (const intent of this.taxonomy) {
            if (intent.name === 'other') continue;

            let matchCount = 0;
            if (intent.keywords) {
                intent.keywords.forEach(kw => {
                    const kwLower = kw.toLowerCase();
                    const kwRegex = new RegExp(`\\b${kwLower}\\b`, 'g');
                    if (kwRegex.test(cleaned)) {
                        matchCount += (kwLower.length > 4) ? 1.5 : 1.0;
                    }
                });
            }

            if (matchCount > 0) {
                matches.push({
                    intent: intent.name,
                    score: matchCount
                });
            }
        }

        if (matches.length === 0) {
            return {
                intent: 'other',
                confidence: 0.5,
                method: 'keyword_none'
            };
        }

        matches.sort((a, b) => b.score - a.score);

        const bestMatch = matches[0];

        const confidence = Math.min(0.95, 0.4 + (bestMatch.score / 3.0));

        return {
            intent: bestMatch.intent,
            confidence: parseFloat(confidence.toFixed(2)),
            method: 'weighted_keyword_match'
        };
    }
}

module.exports = new IntentClassifier();
