const express = require('express');
const cors = require('cors');
const path = require('path');
const { processMessage } = require('./agent');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const userSessions = new Map();

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, context, userId } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const id = userId || 'default_user';

        console.log(`Processing request from ${id}: "${message}"`);
        const result = await processMessage(id, message, context || []);
        res.json(result);
    } catch (error) {
        console.error('Server error during processMessage:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================`);
    console.log(`🚀 ReplyAgent Server running at http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`========================================\n`);
});
