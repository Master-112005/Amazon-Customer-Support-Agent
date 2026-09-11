const config = require('../config');

class DecisionModule {
    decide(classification, retrieval) {
        const { intent, confidence } = classification;

        if (!intent || intent === 'other') {
            return {
                decision: 'escalate',
                reason: 'Intent could not be determined or is categorized as other.',
                confidence: 1.0
            };
        }

        if (confidence < config.decision.confidenceThreshold) {
            return {
                decision: 'escalate',
                reason: `Very low classification confidence (${confidence}) for intent ${intent}.`,
                confidence: 1.0
            };
        }

        const hasEvidence = retrieval && retrieval.length > 0 && retrieval[0].score > 0;

        if (!hasEvidence && confidence < 0.6) {
            return {
                decision: 'escalate',
                reason: 'Insufficient confidence and no historical evidence to ground the response.',
                confidence: 1.0
            };
        }

        if (config.decision.highRiskIntents.includes(intent) && confidence < config.decision.highRiskThreshold) {
            return {
                decision: 'escalate',
                reason: `High-risk intent ${intent} requires human oversight due to low confidence.`,
                confidence: 1.0
            };
        }

        return {
            decision: 'auto_handle',
            reason: hasEvidence
                ? 'Sufficient confidence and historical evidence found.'
                : 'Intent clear: using generic resolution.',
            confidence: confidence
        };
    }
}

module.exports = new DecisionModule();
