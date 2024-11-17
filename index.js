    const express = require("express");
    const Bull = require("bull");
    const Redis = require("ioredis");
    const fs = require("fs");
    const path = require("path");

    const redisClient = new Redis();
    const taskQueue = new Bull("taskQueue", { redis: { port: 6379, host: "127.0.0.1" } });

    const logFilePath = path.join(__dirname, "task_logs.txt");

    const app = express();
    app.use(express.json());

    const RATE_LIMITS = {
    perSecond: 1,
    perMinute: 20,
    };

    const userTimestamps = {};

    function isRateLimited(userId) {
    const now = Date.now();
    if (!userTimestamps[userId]) {
        userTimestamps[userId] = [];
    }

    const timestamps = userTimestamps[userId];
    const recentRequests = timestamps.filter((t) => now - t < 60000);

    userTimestamps[userId] = recentRequests;

    if (recentRequests.length >= RATE_LIMITS.perMinute) return true;
    if (recentRequests.filter((t) => now - t < 1000).length >= RATE_LIMITS.perSecond) return true;

    userTimestamps[userId].push(now);
    return false;
    }

    async function task(userId) {
    const logEntry = `${userId}-task completed at-${new Date().toISOString()}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    console.log(logEntry.trim());
    }

    taskQueue.process(async (job) => {
    const { userId } = job.data;
    await task(userId);
    });

    app.post("/api/v1/task1", async (req, res) => {
    const { user_id: userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "user_id is required" });
    }

    if (isRateLimited(userId)) {
        await taskQueue.add({ userId });
        return res.status(202).json({ message: "Task queued due to rate limiting." });
    }

    await task(userId);
    res.status(200).json({ message: "Task processed successfully." });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));