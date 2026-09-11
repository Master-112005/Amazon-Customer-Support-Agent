const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function prepareData() {
    const csvPath = path.join(process.cwd(), 'data', 'AmazonHelp.csv');
    const threadsPath = path.join(process.cwd(), 'data', 'processed', 'threads.jsonl');
    const convsPath = path.join(process.cwd(), 'data', 'processed', 'conversations.jsonl');

    if (!fs.existsSync(csvPath)) {
        console.error('Error: AmazonHelp.csv not found at ' + csvPath);
        process.exit(1);
    }

    console.log('Parsing CSV and identifying AmazonHelp threads... (Streaming mode)');

    const allTweets = new Map();

    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let isHeader = true;
    for await (const line of rl) {
        if (!line.trim()) continue;
        if (isHeader) {
            isHeader = false;
            continue;
        }

        const parts = line.split(',');
        if (parts.length < 7) continue;

        const id = parts[0];
        const author = parts[1];
        const text = parts[4].replace(/"/g, '');
        const respId = parts[5];
        const inRespTo = parts[6];

        allTweets.set(id, { id, author, text, respId, inRespTo });
    }

    console.log(`Total tweets parsed: ${allTweets.size}. Processing threads...`);

    const processedIds = new Set();
    const threadsStream = fs.createWriteStream(threadsPath);
    const convsStream = fs.createWriteStream(convsPath);

    let threadCount = 0;

    for (const [id, tweet] of allTweets) {
        if (processedIds.has(id)) continue;

        const threadMessages = [];
        const visitedInThread = new Set();
        let current = tweet;
        let hasAmazon = false;

        while (current && !visitedInThread.has(current.id)) {
            visitedInThread.add(current.id);
            if (current.author === 'AmazonHelp') hasAmazon = true;

            threadMessages.push({
                tweet_id: current.id,
                role: current.author === 'AmazonHelp' ? 'agent' : 'customer',
                text: current.text
            });
            processedIds.add(current.id);
            current = allTweets.get(current.respId);
        }

        if (hasAmazon && threadMessages.length > 1) {
            const line = JSON.stringify({
                conversation_id: id,
                messages: threadMessages
            }) + '\n';
            threadsStream.write(line);
            convsStream.write(line);
            threadCount++;
        }
    }

    threadsStream.end();
    convsStream.end();

    console.log(`Success! Created ${threadCount} threads in data/processed/`);
}

prepareData().catch(console.error);
