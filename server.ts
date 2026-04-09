import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock Database
  const users = [
    {
      uid: "admin-1",
      username: "Admin",
      firstName: "Admin",
      lastName: "Sistema",
      fullName: "Administrador do Sistema",
      cpf: "000.000.000-00",
      email: "viniciussestremmm@gmail.com",
      password: "admin",
      whatsapp: "000000000",
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString(),
      availableDays: 30,
      balance: 2500
    }
  ];

  let globalConfig = {
    pixKey: "00020126580014BR.GOV.BCB.PIX013669696969-6969-6969-6969-6969696969695204000053039865802BR5925PROFITUS AI TRADING BOT6009SAO PAULO62070503***6304E2B4",
    plan1_amount: 2500,
    plan1_pix: "",
    plan2_amount: 5000,
    plan2_pix: "",
    plan3_amount: 10000,
    plan3_pix: "",
    plan4_amount: 20000,
    plan4_pix: ""
  };

  const depositRequests = [];
  const withdrawRequests = [];

  const configs = {
    "admin-1": {
      userId: "admin-1",
      accountType: "demo",
      isBotActive: false,
      strategy: "MHI 1",
      dailyProfitTarget: 100,
      dailyStopLoss: 50,
      investmentAmount: 5,
      minPayout: 80,
      pairs: ["EUR/USD", "GBP/USD", "USD/JPY"],
      isAutoTrade: false
    }
  };

  const stats = [
    {
      userId: "admin-1",
      date: new Date().toISOString().split('T')[0],
      wins: 12,
      losses: 4,
      profit: 150.50,
      margin: 2450.00
    },
    {
      userId: "admin-1",
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      wins: 8,
      losses: 5,
      profit: 45.20,
      margin: 2300.00
    }
  ];

  const trades = [
    {
      id: "t1",
      userId: "admin-1",
      pair: "EUR/USD",
      entryTime: new Date(Date.now() - 3600000).toISOString(),
      exitTime: new Date(Date.now() - 3300000).toISOString(),
      result: "win",
      value: 4.25
    },
    {
      id: "t2",
      userId: "admin-1",
      pair: "GBP/USD",
      entryTime: new Date(Date.now() - 7200000).toISOString(),
      exitTime: new Date(Date.now() - 6900000).toISOString(),
      result: "loss",
      value: -5.00
    },
    {
      id: "t3",
      userId: "admin-1",
      pair: "USD/JPY",
      entryTime: new Date(Date.now() - 10800000).toISOString(),
      exitTime: new Date(Date.now() - 10500000).toISOString(),
      result: "win",
      value: 4.10
    }
  ];

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      if (user.status === 'blocked') {
        return res.status(403).json({ error: "Sua conta está bloqueada." });
      }
      res.json(user);
    } else {
      res.status(401).json({ error: "Usuário ou senha incorretos." });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { username, password, whatsapp, firstName, lastName, cpf } = req.body;
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: "Usuário já cadastrado." });
    }
    const newUser = {
      uid: Math.random().toString(36).substr(2, 9),
      username,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      cpf,
      email: `${username}@example.com`,
      password,
      whatsapp,
      role: "user",
      status: "active",
      createdAt: new Date().toISOString(),
      availableDays: 0,
      balance: 0
    };
    users.push(newUser);
    configs[newUser.uid] = {
      userId: newUser.uid,
      accountType: "demo",
      isBotActive: false,
      strategy: "AUTO_BEST",
      timeframe: "M1",
      dailyProfitTarget: 100,
      dailyStopLoss: 50,
      investmentAmount: 5,
      minPayout: 80,
      pairs: ["EUR/USD", "GBP/USD", "USD/JPY"],
      isAutoTrade: false
    };
    res.json(newUser);
  });

  app.get("/api/global-config", (req, res) => {
    res.json(globalConfig);
  });

  app.put("/api/global-config", (req, res) => {
    globalConfig = { ...globalConfig, ...req.body };
    res.json(globalConfig);
  });

  app.put("/api/admin/users/:userId/days", (req, res) => {
    const user = users.find(u => u.uid === req.params.userId);
    if (user) {
      user.availableDays = req.body.availableDays;
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/user/usage/check", (req, res) => {
    const { userId } = req.body;
    const user = users.find(u => u.uid === userId);
    if (user) {
      if (user.availableDays > 0) {
        // Here we could decrement days if it's a new day, 
        // but for simplicity we'll just check if it's > 0
        res.json({ success: true, availableDays: user.availableDays, balance: user.balance });
      } else {
        res.status(403).json({ error: "Seus dias expiraram.", balance: user.balance });
      }
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.delete("/api/admin/users/:userId", (req, res) => {
    const index = users.findIndex(u => u.uid === req.params.userId);
    if (index !== -1) {
      users.splice(index, 1);
      delete configs[req.params.userId];
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/user/:userId", (req, res) => {
    const user = users.find(u => u.uid === req.params.userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.get("/api/config/:userId", (req, res) => {
    const config = configs[req.params.userId];
    if (config) res.json(config);
    else res.status(404).json({ error: "Config not found" });
  });

  app.put("/api/config/:userId", (req, res) => {
    const { userId } = req.params;
    const oldConfig = configs[userId];
    const newConfig = { ...oldConfig, ...req.body };
    
    // Reset history if bot is being activated
    if (newConfig.isBotActive && (!oldConfig || !oldConfig.isBotActive)) {
      // Remove all trades for this user from the mock database
      for (let i = trades.length - 1; i >= 0; i--) {
        if (trades[i].userId === userId) {
          trades.splice(i, 1);
        }
      }

      // Reset daily stats for today
      const today = new Date().toISOString().split('T')[0];
      const dailyStat = stats.find(s => s.userId === userId && s.date === today);
      if (dailyStat) {
        dailyStat.wins = 0;
        dailyStat.losses = 0;
        dailyStat.profit = 0;
      }
    }
    
    configs[userId] = newConfig;
    res.json(newConfig);
  });

  app.get("/api/stats/:userId", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const userStats = stats.filter(s => s.userId === req.params.userId && s.date === today);
    res.json(userStats);
  });

  app.get("/api/history/:userId", (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const userTrades = trades.filter(t => t.userId === req.params.userId && t.entryTime.startsWith(today));
    res.json(userTrades);
  });

  app.post("/api/history/:userId", (req, res) => {
    const { userId } = req.params;
    const trade = { ...req.body, userId, id: Math.random().toString(36).substr(2, 9) };
    trades.push(trade);

    // Update stats for today
    const today = new Date().toISOString().split('T')[0];
    let dailyStat = stats.find(s => s.userId === userId && s.date === today);
    if (!dailyStat) {
      dailyStat = {
        userId,
        date: today,
        wins: 0,
        losses: 0,
        profit: 0,
        margin: 0 // This would ideally come from the broker
      };
      stats.push(dailyStat);
    }

    if (trade.result === 'win') {
      dailyStat.wins += 1;
    } else {
      dailyStat.losses += 1;
    }
    dailyStat.profit += trade.value;

    res.json(trade);
  });

  app.get("/api/admin/users", (req, res) => {
    res.json(users);
  });

  app.put("/api/admin/users/:userId/margin", (req, res) => {
    const { userId } = req.params;
    const { margin } = req.body;
    
    const user = users.find(u => u.uid === userId);
    if (user) {
      user.balance = margin;
    }

    const today = new Date().toISOString().split('T')[0];
    let dailyStat = stats.find(s => s.userId === userId && s.date === today);
    if (!dailyStat) {
      dailyStat = {
        userId,
        date: today,
        wins: 0,
        losses: 0,
        profit: 0,
        margin: margin
      };
      stats.push(dailyStat);
    } else {
      dailyStat.margin = margin;
    }
    res.json(dailyStat);
  });

  app.put("/api/admin/users/:userId/credentials", (req, res) => {
    const { userId } = req.params;
    const { username, password } = req.body;
    
    const user = users.find(u => u.uid === userId);
    if (user) {
      if (username) user.username = username;
      if (password) user.password = password;
      res.json({ success: true, user });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  });

  app.post("/api/deposits", (req, res) => {
    const { userId, username, amount } = req.body;
    const request = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      username,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    depositRequests.push(request);
    res.json(request);
  });

  app.get("/api/admin/deposits", (req, res) => {
    res.json(depositRequests);
  });

  app.put("/api/admin/deposits/:id", (req, res) => {
    const deposit = depositRequests.find(d => d.id === req.params.id);
    if (deposit) {
      deposit.status = req.body.status;
      res.json(deposit);
    } else {
      res.status(404).json({ error: "Deposit not found" });
    }
  });

  app.delete("/api/admin/deposits/:id", (req, res) => {
    const index = depositRequests.findIndex(d => d.id === req.params.id);
    if (index !== -1) {
      depositRequests.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Deposit not found" });
    }
  });

  // Withdrawals
  app.post("/api/withdrawals", (req, res) => {
    const { userId, username, amount, method, details } = req.body;
    const request = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      username,
      amount,
      method,
      details,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    withdrawRequests.push(request);
    res.json(request);
  });

  app.get("/api/admin/withdrawals", (req, res) => {
    res.json(withdrawRequests);
  });

  app.put("/api/admin/withdrawals/:id", (req, res) => {
    const withdrawal = withdrawRequests.find(w => w.id === req.params.id);
    if (withdrawal) {
      withdrawal.status = req.body.status;
      res.json(withdrawal);
    } else {
      res.status(404).json({ error: "Withdrawal not found" });
    }
  });

  app.delete("/api/admin/withdrawals/:id", (req, res) => {
    const index = withdrawRequests.findIndex(w => w.id === req.params.id);
    if (index !== -1) {
      withdrawRequests.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Withdrawal not found" });
    }
  });

  // API 404 handler to prevent falling through to Vite for non-existent API routes
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
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

startServer();
