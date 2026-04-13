<<<<<<< HEAD
# Draw & Guess Game 🎨

Multiplayer draw and guess game - play with friends!

## Features

- **Real-time Multiplayer** - Up to 30 players
- **Multiple Themes** - Animals, Food, Nature, Fantasy, Vehicles, Objects
- **Drawing Tools** - Brush, Eraser, Fill, Clear
- **20 Colors** - Full color palette
- **5 Brush Sizes** - From thin to thick
- **Timer** - 80 seconds per round
- **Hint System** - Get hints as time runs out
- **Scoring** - Points based on speed
- **Leaderboard** - See who won
- **Chat** - Chat and guess in real-time
- **Responsive** - Works on desktop and mobile
- **Dark Mode** - Easy on the eyes

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Open browser
http://localhost:3000
```

## Deploy Options

### 1. Railway (Recommended - Free Tier)

1. Push code to GitHub
2. Connect Railway to your repo
3. Deploy automatically

### 2. Render (Free Tier)

1. Create `render.yaml` or connect GitHub
2. Set build command: `npm install`
3. Set start command: `npm start`

### 3. VPS/Server

```bash
# SSH to server
ssh user@your-server

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone/pull your code
git clone your-repo
cd draw-guess-game

# Install & start
npm install
npm start

# Use PM2 for production
npm install -g pm2
pm2 start server.js --name draw-guess
pm2 save
pm2 startup
```

### 4. Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t draw-guess .
docker run -p 3000:3000 draw-guess
```

### 5. Replit

1. Create new Replit
2. Import from GitHub
3. Click Run

## Configuration

Environment variables:

```bash
PORT=3000  # Server port (default: 3000)
```

## How to Play

1. **Create Room** - Enter your name and click "Create Room"
2. **Share Code** - Give the 4-letter code to friends
3. **Join** - Friends enter code and join
4. **Ready Up** - Everyone clicks Ready
5. **Draw** - When it's your turn, choose a word and draw
6. **Guess** - Others type guesses in chat
7. **Score** - Faster guesses = more points
8. **Win** - Highest score after all rounds wins!

## Tech Stack

- Node.js
- Express
- Socket.io
- Vanilla JavaScript
- CSS3

## License

MIT - Free to use and modify!
=======
# draw-guess-game
Multiplayer Draw &amp; Guess Game
>>>>>>> faa74a5f404e6aa6cd27f040da3975b7cfc805e8
