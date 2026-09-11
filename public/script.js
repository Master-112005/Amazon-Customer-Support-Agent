let conversationHistory = [];

async function sendMessage() {
    const input = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const traceDiv = document.getElementById('trace-content');
    const text = input.value.trim();

    if (!text) return;

    appendMessage('customer', text);
    input.value = '';

    traceDiv.innerHTML = '<p style="opacity: 0.8;">Agent is thinking...</p>';

    try {
        const baseUrl = window.location.origin;
        const response = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                context: conversationHistory
            })
        });

        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            appendMessage('agent', 'Error: ' + data.error);
            return;
        }

        updateTrace(data);

        const decisionObj = data.decision || {};
        const decisionValue = typeof decisionObj === 'string' ? decisionObj : (decisionObj.decision || 'unknown');
        const reason = typeof decisionObj === 'object' ? decisionObj.reason : (data.escalation_reason || 'No reason provided');

        const reply = data.reply || (decisionValue === 'escalate'
            ? `⚠️ Escalated to Human Agent. Reason: ${reason}`
            : 'I am sorry, I could not generate a reply.');

        appendMessage('agent', reply);

        conversationHistory.push({ role: 'customer', text: text });
        conversationHistory.push({ role: 'agent', text: reply });

    } catch (error) {
        console.error('API Error:', error);
        appendMessage('agent', `Connection error: ${error.message}. Please ensure the server is running at http://localhost:3000`);
    }
}

function appendMessage(role, text) {
    const messagesDiv = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateTrace(data) {
    const traceDiv = document.getElementById('trace-content');
    traceDiv.innerHTML = '';

    const intent = data.intent || {};
    const decision = data.decision || {};

    const items = [
        { label: 'Predicted Intent', value: intent.intent || 'unknown' },
        { label: 'Confidence', value: intent.confidence ? (intent.confidence * 100).toFixed(2) + '%' : '0.00%' },
        {
            label: 'Decision',
            value: (typeof decision === 'string') ? decision.toUpperCase() : (decision.decision ? decision.decision.toUpperCase() : 'UNKNOWN')
        },
        { label: 'Decision Reason', value: decision.reason || 'Auto-handle' },
    ];

    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'trace-item';
        div.innerHTML = `
            <span class="trace-label">${item.label}</span>
            <div class="trace-value">${item.value}</div>
        `;
        traceDiv.appendChild(div);
    });

    if (data.retrieval && data.retrieval.examples) {
        const examples = data.retrieval.examples;
        const exDiv = document.createElement('div');
        exDiv.className = 'trace-item';
        exDiv.innerHTML = `<span class="trace-label">Retrieved Evidence (${examples.length})</span>`;

        const val = document.createElement('div');
        val.className = 'trace-value';
        val.textContent = `Found ${examples.length} similar historical resolutions. Top similarity: ${examples[0]?.score || 0}`;
        exDiv.appendChild(val);
        traceDiv.appendChild(exDiv);
    }
}

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});
