const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { processMessage } = require('../agent');

async function evaluateAgent() {
    const goldenPath = path.join(process.cwd(), 'data', 'golden', 'golden_200.jsonl');

    if (!fs.existsSync(goldenPath)) {
        console.error('Golden set not found. Please run annotation first.');
        process.exit(1);
    }

    const lines = fs.readFileSync(goldenPath, 'utf-8').split('\n').filter(l => l.trim());
    const records = lines.map(l => JSON.parse(l));

    console.log(`Evaluating agent against ${records.length} human-labelled examples...\n`);

    let correct = 0;
    const confusionMatrix = {};

    for (const rec of records) {
        const result = await processMessage(`eval-user-${records.indexOf(rec)}`, rec.customer_text);
        const pred = result.intent.intent;
        const gold = rec.human_intent;

        if (pred === gold) correct++;

        if (!confusionMatrix[gold]) confusionMatrix[gold] = {};
        confusionMatrix[gold][pred] = (confusionMatrix[gold][pred] || 0) + 1;
    }

    const accuracy = (correct / records.length) * 100;
    console.log('========================================');
    console.log('Agent Evaluation Report');
    console.log('========================================');
    console.log(`Accuracy: ${accuracy.toFixed(2)}%`);
    console.log(`Total: ${records.length}, Correct: ${correct}`);
    console.log('----------------------------------------');
    console.log('Confusion Matrix (Gold -> Pred):');
    console.log(JSON.stringify(confusionMatrix, null, 2));
    console.log('========================================');
}

if (require.main === module) {
    evaluateAgent().catch(console.error);
}

module.exports = { evaluateAgent };
