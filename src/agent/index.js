const classifier = require('./classifier');
const retriever = require('./retriever');
const decision = require('./decision');
const { LlamaClient, ReplyGenerator } = require('./generator');
const config = require('../config');
const sessionStore = require('./session');

const llamaClient = new LlamaClient();
const generator = new ReplyGenerator(llamaClient);

const REQUIRED_CLARIFICATIONS = [
    'delivery_delay',
    'damaged_item',
    'refund_issue',
    'account_issue'
];

const ENQUIRY_MAP = {
    'package_not_received': 'I understand your frustration! Our team would like a chance to address this concern. Could you please share a few more details about your order?',
    'delivery_delay': 'I apologize for the delay. How many days past the expected delivery date is your package currently?',
    'refund_issue': 'I\'m sorry for the frustration! Without giving personal/account details, could you tell us a bit more about the refund issue you\'re experiencing?',
    'return_request': 'I can certainly help you with that. Have you already reported this to our support team, or would you like me to guide you through the return options?',
    'account_issue': 'I\'m sorry you\'re having trouble with your account. For your security, we can\'t handle account details here. Would you like the link to our secure chat/phone support?',
    'damaged_item': 'I apologize for the damage. Could you please describe the damage to the product so I can determine the best solution?',
    'payment_issue': 'I\'m sorry you\'ve encountered a payment or billing issue. Could you tell us a bit more about the charge or error you\'re seeing?',
    'subscription_issue': 'I apologize for the trouble with your subscription. Could you let us know which specific benefit or fee you are inquiring about?',
    'seller_issue': 'I can help you with that. Have you already attempted to contact the third-party seller directly through your order page?',
    'product_question': 'I would be happy to answer that! Which specific product or feature are you asking about?',
    'digital_content_issue': 'I apologize for the technical trouble. Could you describe the error or playback issue you\'re experiencing?',
    'wrong_item': 'I\'m sorry you received the wrong item. Could you please confirm what you ordered versus what actually arrived?',
    'cancellation': 'I can help you with that. Is this for a recent order or a recurring subscription cancellation?',
    'general_complaint': 'I\'m sorry you\'re unhappy with our service. We value your feedback—could you provide more details so I can share this with the right team?',
    'general_feedback': 'Thank you for reaching out! We appreciate your feedback. Is there anything specific you\'d like us to improve?',
    'promotion_issue': 'I can look into that promotion for you. Could you share which offer code or Prime benefit you are referring to?'
};

async function processMessage(userId, text, context = []) {
    const session = sessionStore.getSession(userId);
    let classification;
    let retrievalText = text;

    const currentClassification = classifier.classify(text);

    if (session.state === 'AWAITING_CLARIFICATION' && session.activeIntent) {
        if (currentClassification.confidence >= config.classifier.confidenceThresholds.moderate) {
            classification = currentClassification;
        } else {
            classification = {
                intent: session.activeIntent,
                confidence: 1.0,
                method: 'session_context'
            };
            retrievalText = `${session.lastQuery || ''} ${text}`;
        }
    } else {
        classification = currentClassification;
    }

    if (!retriever.isLoaded) {
        await retriever.loadData();
    }
    const retrieval = retriever.retrieve(retrievalText, classification.intent);

    const { intent, confidence } = classification;

    const createResponse = (decisionVal, reason, reply = null) => ({
        input: text,
        intent: classification,
        retrieval: { examples: retrieval },
        decision: { decision: decisionVal, reason, confidence: classification.confidence },
        reply: reply,
        trace: {
            timestamp: new Date().toISOString(),
            version: '1.3.4'
        }
    });

    if (intent === 'other') {
        sessionStore.clearSession(userId);
        return createResponse('escalate', 'Intent could not be determined.');
    }

    const needsClarification = REQUIRED_CLARIFICATIONS.includes(intent);
    const isModerate = (confidence >= config.classifier.confidenceThresholds.low &&
                        confidence < config.classifier.confidenceThresholds.moderate);

    if (session.state !== 'AWAITING_CLARIFICATION' && (needsClarification || isModerate)) {
        const question = ENQUIRY_MAP[intent] || 'I think I understand, but could you provide a bit more detail so I can give you the correct answer?';

        sessionStore.updateSession(userId, {
            state: 'AWAITING_CLARIFICATION',
            activeIntent: intent,
            pendingQuestion: question,
            lastQuery: text
        });

        return createResponse('auto_handle', 'Requesting required clarification.', question);
    }

    if (confidence < config.classifier.confidenceThresholds.low) {
        sessionStore.clearSession(userId);
        return createResponse('escalate', `Very low confidence (${confidence}) for intent ${intent}.`);
    }

    const d = decision.decide(classification, retrieval);

    if (d.decision === 'auto_handle') {
        let reply = await generator.generateReply(text, classification.intent, retrieval, context);
        if (!reply) {
            sessionStore.clearSession(userId);
            return createResponse('escalate', 'Reply generation failed.');
        }
        sessionStore.clearSession(userId);
        return createResponse('auto_handle', d.reason, reply);
    }

    sessionStore.clearSession(userId);
    return createResponse(d.decision, d.reason);
}

module.exports = { processMessage };
