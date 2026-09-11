module.exports = {
    classifier: {
        confidenceThresholds: {
            low: 0.4,
            moderate: 0.6,
        },
        synonyms: {
            'delevary': 'delivery',
            'delevery': 'delivery',
            'isseue': 'issue',
            'iteam': 'item',
            'defected': 'damaged',
            'recvied': 'received',
            'reiceved': 'received',
            'ligal': 'legal',
            'complient': 'complaint'
        },
        stopWords: new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'of', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once']),
    },
    decision: {
        confidenceThreshold: 0.4,
        highRiskThreshold: 0.5,
        highRiskIntents: ['refund_issue', 'payment_issue', 'account_issue'],
    },
    retriever: {
        k: 3,
        stopWords: new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'of', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'i', 'you', 'he', 'she', 'it', 'we', 'they']),
    },
    generator: {
        simulationLatency: 800,
    }
};
