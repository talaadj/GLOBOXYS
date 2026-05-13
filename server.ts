import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store for telegram messages received while the server is running
let telegramMessages: any[] = [];
const MAX_MESSAGES = 50;

// Dynamic Agent Store
interface AgentRule {
  id: string;
  keyword: string;
  response: string;
}

interface Agent {
  id: string;
  name: string;
  type: 'analyst' | 'growth' | 'custom';
  status: 'active' | 'offline';
  rules: AgentRule[];
}

let agents: Agent[] = [
  {
    id: 'agent_1',
    name: 'Market Analyst v4',
    type: 'analyst',
    status: 'active',
    rules: [
      { id: 'r1', keyword: 'price', response: 'Current market baseline: $42.5k' },
      { id: 'r2', keyword: 'trend', response: 'Bullish variance detected in localized nodes.' }
    ]
  },
  {
    id: 'agent_2',
    name: 'Growth Catalyst',
    type: 'growth',
    status: 'offline',
    rules: []
  }
];

// Initialize Telegram Bot if token is available
let bot: Telegraf | null = null;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (BOT_TOKEN) {
  bot = new Telegraf(BOT_TOKEN);
  
  bot.on('text', (ctx) => {
    const text = ctx.message.text.toLowerCase();
    const newMessage = {
      id: ctx.message.message_id,
      from: ctx.message.from.username || ctx.message.from.first_name,
      text: ctx.message.text,
      timestamp: new Date().toISOString(),
      chatId: ctx.chat.id,
      chatTitle: (ctx.chat as any).title || 'Private Chat'
    };
    
    telegramMessages.unshift(newMessage);
    if (telegramMessages.length > MAX_MESSAGES) {
      telegramMessages.pop();
    }
    
    // Global Synergy check
    if (text.includes('synergy')) {
      ctx.reply('Synergy detected! Operational efficiency increasing.');
    }

    // Process Active Agent Rules
    agents.filter(a => a.status === 'active').forEach(agent => {
      agent.rules.forEach(rule => {
        if (text.includes(rule.keyword.toLowerCase())) {
          ctx.reply(`[${agent.name}] ${rule.response}`);
        }
      });
    });
  });

  bot.launch().then(() => {
    console.log('Telegram bot launched');
  }).catch((err) => {
    console.error('Failed to launch Telegram bot:', err);
  });
}

// API Routes
app.get("/api/telegram/messages", (req, res) => {
  if (!BOT_TOKEN && telegramMessages.length === 0) {
    // Return mock messages if no token and no real messages
    return res.json([
      { id: 1, from: "Strategic_Agent", text: "Market analysis complete for Q3.", timestamp: new Date().toISOString(), chatTitle: "Internal Channel" },
      { id: 2, from: "GrowthBot", text: "New node detected in APAC region.", timestamp: new Date().toISOString(), chatTitle: "Operational Hub" }
    ]);
  }
  res.json(telegramMessages);
});

app.get("/api/telegram/status", (req, res) => {
  res.json({ 
    active: !!BOT_TOKEN,
    botUsername: bot?.botInfo?.username || 'Not configured'
  });
});

app.get("/api/telegram/agents", (req, res) => {
  res.json(agents);
});

app.post("/api/telegram/agents", (req, res) => {
  const newAgent: Agent = {
    id: `agent_${Date.now()}`,
    name: req.body.name || 'Unnamed Agent',
    type: req.body.type || 'custom',
    status: 'offline',
    rules: []
  };
  agents.push(newAgent);
  res.json(newAgent);
});

app.post("/api/telegram/agents/:id/rules", (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (agent) {
    const newRule: AgentRule = {
      id: `rule_${Date.now()}`,
      keyword: req.body.keyword,
      response: req.body.response
    };
    agent.rules.push(newRule);
    res.json(newRule);
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

app.patch("/api/telegram/agents/:id", (req, res) => {
  const index = agents.findIndex(a => a.id === req.params.id);
  if (index !== -1) {
    agents[index] = { ...agents[index], ...req.body };
    res.json(agents[index]);
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
