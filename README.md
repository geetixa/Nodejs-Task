# Node.js Rate-Limited Task Queue API

## Overview
This project implements a REST API in Node.js that processes tasks with per-user rate limits and a queueing mechanism. It ensures no tasks are dropped while enforcing limits.

## Features
- **Rate Limiting**: 
  - 1 task per second.
  - 20 tasks per minute per user.
- **Task Queueing**: Exceeds rate limits are queued for later execution.
- **Scalability**: Clustering using PM2.
- **Logging**: Logs task completions to a file.

## Setup Instructions
1. **Prerequisites**:
   - Install Node.js and Redis.

2. **Install Dependencies**:
   ```
   npm install

3. **Redis Install**:
redis-server

4. **Run the application**: 
pm2 start index.js -i max

5. **Testing**:
curl -X POST http://localhost:3000/api/v1/task1 -H "Content-Type: application/json" -d "{\"user_id\":\"123\"}"