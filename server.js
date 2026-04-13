const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', players: players.size, rooms: rooms.size, uptime: process.uptime() });
});

const CONFIG = {
    minPlayers: 2,
    maxPlayers: 30,
    drawTime: 80,
    hintTime: 20,
    hints: 3,
    rounds: 3
};

const THEMES = {
    mixed: ["house", "car", "dog", "cat", "tree", "sun", "flower", "book", "phone", "computer", "chair", "table", "lamp", "door", "window", "beach", "mountain", "river", "fish", "bird", "apple", "banana", "pizza", "cake", "guitar", "piano", "camera", "airplane", "boat", "rocket", "balloon", "umbrella", "crown", "key", "robot", "dragon", "unicorn", "castle", "bridge", "train", "bus", "heart", "star", "moon", "cloud", "rainbow", "snowman", "butterfly", "elephant", "lion", "monkey", "snake", "turtle", "shark", "whale", "dolphin", "octopus", "crab", "ladybug", "bee", "spider", "ant", "mushroom", "cactus", "palm", "rose", "tulip", "sunflower", "cherry", "strawberry", "grape", "watermelon", "pineapple", "mango", "peach", "lemon", "carrot", "broccoli", "corn", "potato", "tomato", "bread", "rice", "pasta", "noodle", "soup", "sandwich", "hotdog", "taco", "sushi", "curry", "steak", "bacon", "egg", "cheese", "butter", "milk", "coffee", "tea", "juice", "soda", "beer", "wine", "cocktail", "milkshake", "pancake", "waffle", "popcorn", "candy", "chocolate", "cookie", "donut", "muffin", "cupcake", "pie", "ice cream", "yogurt", "jelly", "honey", "jam", "syrup", "salt", "pepper", "cinnamon", "vanilla", "mint"],
    animals: ["dog", "cat", "bird", "fish", "elephant", "lion", "tiger", "bear", "monkey", "giraffe", "zebra", "horse", "cow", "pig", "sheep", "rabbit", "mouse", "squirrel", "deer", "wolf", "fox", "panda", "koala", "kangaroo", "penguin", "owl", "eagle", "parrot", "flamingo", "peacock", "dolphin", "whale", "shark", "octopus", "crab", "jellyfish", "seahorse", "starfish", "turtle", "crocodile", "snake", "lizard", "frog", "butterfly", "bee", "ant", "beetle", "spider", "scorpion", "ladybug", "dragonfly", "grasshopper", "snail", "slug", "worm", "squid", "lobster", "shrimp", "clam", "seahorse", "stingray", "orca", "walrus", "seal", "otter", "beaver", "hamster", "guinea pig", "hedgehog", "ferret", "badger", "raccoon", "opossum", "bat"],
    food: ["pizza", "burger", "hotdog", "taco", "sushi", "curry", "rice", "pasta", "noodle", "bread", "croissant", "bagel", "muffin", "cupcake", "cake", "pie", "cookie", "donut", "candy", "chocolate", "ice cream", "popsicle", "yogurt", "pudding", "jelly", "honey", "jam", "butter", "cheese", "milk", "egg", "bacon", "sausage", "steak", "ribs", "wings", "nugget", "fries", "chips", "popcorn", "pretzel", "cereal", "oatmeal", "pancake", "waffle", "smoothie", "milkshake", "coffee", "tea", "juice", "soda", "beer", "wine", "watermelon", "pineapple", "mango", "banana", "apple", "orange", "grape", "strawberry", "blueberry", "raspberry", "cherry", "peach", "plum", "pear", "kiwi", "melon", "coconut", "avocado", "lemon", "lime", "carrot", "potato", "tomato", "onion", "garlic", "broccoli", "corn", "pea", "bean", "lettuce", "cabbage", "spinach", "cucumber", "pepper", "eggplant", "pumpkin", "mushroom"],
    objects: ["phone", "computer", "laptop", "tablet", "camera", "television", "radio", "speaker", "headphones", "microphone", "keyboard", "mouse", "printer", "flashlight", "battery", "charger", "cable", "switch", "button", "lever", "handle", "wheel", "hammer", "wrench", "screwdriver", "knife", "scissors", "fork", "spoon", "plate", "bowl", "cup", "mug", "glass", "bottle", "jar", "pot", "pan", "kettle", "toaster", "blender", "oven", "microwave", "fridge", "freezer", "sink", "faucet", "toilet", "bathtub", "shower", "mirror", "comb", "brush", "razor", "toothbrush", "towel", "soap", "watch", "ring", "necklace", "bracelet", "earring", "crown", "medal", "trophy", "bell", "clock", "calendar", "notebook", "pencil", "pen", "marker", "crayon", "paintbrush", "canvas", "pillow", "blanket", "lamp", "chandelier", "candle", "vase", "plant", "pot"],
    nature: ["sun", "moon", "star", "cloud", "rain", "snow", "wind", "storm", "thunder", "lightning", "rainbow", "fog", "mist", "hail", "dew", "frost", "ice", "water", "wave", "ocean", "sea", "lake", "river", "stream", "waterfall", "pond", "pool", "spring", "well", "beach", "island", "mountain", "hill", "valley", "canyon", "cave", "desert", "forest", "jungle", "swamp", "meadow", "field", "farm", "garden", "park", "tree", "leaf", "flower", "grass", "moss", "fern", "palm", "cactus", "bush", "shrub", "vine", "root", "branch", "trunk", "bark", "seed", "fruit", "mushroom", "coral", "shell", "pebble", "rock", "stone", "sand", "dirt", "mud", "clay", "volcano", "earthquake", "tornado", "eclipse", "sunrise", "sunset", "horizon", "sky", "space", "planet", "comet", "meteor", "galaxy"],
    vehicles: ["car", "truck", "bus", "van", "motorcycle", "bicycle", "skateboard", "scooter", "train", "subway", "tram", "airplane", "helicopter", "jet", "rocket", "spaceship", "boat", "ship", "yacht", "submarine", "canoe", "kayak", "raft", "sailboat", "ferry", "cruise", "ambulance", "firetruck", "police", "taxi", "limousine", "rv", "camper", "tractor", "excavator", "crane", "bulldozer", "dump truck", "forklift", "garbage truck", "delivery", "carriage", "wagon", "sleigh", "drone", "balloon", "blimp", "parachute", "glider", "seaplane", "steamboat", "speedboat", "jet ski", "surfboard", "skate", "cart", "wheelchair", "stroller", "shopping cart", "golf cart", "atv", "jeep", "suv", "sedan", "coupe", "pickup", "limo"],
    fantasy: ["dragon", "unicorn", "phoenix", "griffin", "pegasus", "mermaid", "fairy", "elf", "dwarf", "giant", "troll", "goblin", "orc", "wizard", "witch", "sorcerer", "mage", "knight", "warrior", "archer", "ninja", "samurai", "pirate", "viking", "gladiator", "centaur", "minotaur", "cyclops", "hydra", "sphinx", "basilisk", "chimera", "kraken", "leviathan", "golem", "vampire", "werewolf", "zombie", "ghost", "skeleton", "mummy", "demon", "angel", "god", "goddess", "hero", "princess", "prince", "queen", "king", "jester", "clown", "magician", "genie", "naga", "fairy", "pixie", "sprite", "imp", "djinn", "salamander", "sylph", "undine", "gnome", "leprechaun", "banshee", "wraith", "phantom"]
};

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🐰', '🐶', '🐱', '🦄', '🐨', '🦋', '🌟', '🔥', '💜', '💙', '💚', '🐸', '🦉', '🐙', '🦋'];

const rooms = new Map();
const players = new Map();

function generateRoomCode() {
    return crypto.randomBytes(2).toString('hex').toUpperCase();
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getRandomWord(theme, usedWords = []) {
    let wordPool = THEMES[theme] || THEMES.mixed;
    wordPool = wordPool.filter(w => !usedWords.includes(w));
    if (wordPool.length === 0) wordPool = THEMES.mixed;
    return wordPool[Math.floor(Math.random() * wordPool.length)];
}

function getRandomAvatar() {
    return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

function createRoom(hostId, options = {}) {
    let code = generateRoomCode();
    while (rooms.has(code)) code = generateRoomCode();

    const room = {
        id: code,
        code,
        hostId,
        name: options.name || `${code} Room`,
        players: new Map(),
        settings: {
            theme: options.theme || 'mixed',
            drawTime: options.drawTime || CONFIG.drawTime,
            maxPlayers: Math.min(options.maxPlayers || 16, CONFIG.maxPlayers),
            rounds: options.rounds || CONFIG.rounds,
            allowSpectators: options.allowSpectators !== false,
            chatEnabled: options.chatEnabled !== false
        },
        state: 'waiting',
        currentRound: 0,
        currentDrawerIndex: 0,
        currentWord: null,
        wordOptions: [],
        usedWords: [],
        canvasData: [],
        chat: [],
        drawingOrder: [],
        createdAt: Date.now()
    };

    rooms.set(code, room);
    return room;
}

function startGame(room) {
    room.state = 'playing';
    room.currentRound = 0;
    room.usedWords = [];
    room.canvasData = [];
    room.chat = [];
    room.drawingOrder = shuffleArray(Array.from(room.players.keys()));
    room.players.forEach(p => { p.score = 0; p.correctGuesses = 0; p.guessedThisRound = false; });
    nextRound(room);
}

function nextRound(room) {
    room.currentRound++;
    if (room.currentRound > room.settings.rounds * room.players.size) {
        endGame(room);
        return;
    }

    room.currentDrawerIndex = (room.currentRound - 1) % room.drawingOrder.length;
    let drawerId = room.drawingOrder[room.currentDrawerIndex];

    if (!room.players.has(drawerId)) {
        room.currentRound++;
        nextRound(room);
        return;
    }

    room.currentWord = null;
    room.wordOptions = [getRandomWord(room.settings.theme, room.usedWords), getRandomWord(room.settings.theme, room.usedWords), getRandomWord(room.settings.theme, room.usedWords)];
    room.canvasData = [];
    room.state = 'choosing_word';
    room.players.forEach(p => p.guessedThisRound = false);

    const drawer = room.players.get(drawerId);

    io.to(room.code).emit('round_start', {
        round: room.currentRound,
        totalRounds: room.settings.rounds * room.players.size,
        drawerId,
        drawerName: drawer.name,
        drawerAvatar: drawer.avatar,
        timeLeft: room.settings.drawTime,
        wordOptions: room.wordOptions,
        players: getPlayersList(room)
    });

    startRoundTimer(room);
}

function startRoundTimer(room) {
    if (room.timer) clearInterval(room.timer);
    let timeLeft = room.settings.drawTime;

    room.timer = setInterval(() => {
        timeLeft--;
        room.timeLeft = timeLeft;
        io.to(room.code).emit('timer_update', { timeLeft, state: room.state });

        if (timeLeft === CONFIG.hintTime && room.state === 'drawing' && room.currentWord) {
            io.to(room.code).emit('hint_update', { hint: getHint(room.currentWord) });
        }

        if (timeLeft <= 0) {
            clearInterval(room.timer);
            if (room.state === 'choosing_word') {
                startDrawingPhase(room, room.wordOptions[0]);
            } else if (room.state === 'drawing') {
                skipRound(room);
            }
        }
    }, 1000);
}

function startDrawingPhase(room, word) {
    room.currentWord = word;
    room.usedWords.push(word);
    room.state = 'drawing';

    const drawer = room.players.get(room.drawingOrder[room.currentDrawerIndex]);

    io.to(room.code).emit('start_drawing', {
        drawerId: room.drawingOrder[room.currentDrawerIndex],
        drawerName: drawer.name,
        drawerAvatar: drawer.avatar,
        wordLength: word.length,
        timeLeft: room.settings.drawTime,
        players: getPlayersList(room)
    });

    io.to(room.code).emit('hint_update', { hint: getHint(word) });
}

function getHint(word) {
    if (!word) return '';
    return word.split('').map((c, i) => i === 0 || i === word.length - 1 || Math.random() > 0.6 ? c : '_').join('');
}

function skipRound(room) {
    io.to(room.code).emit('round_skipped', { word: room.currentWord });
    setTimeout(() => { room.currentRound++; nextRound(room); }, 3000);
}

function handleCorrectGuess(room, player) {
    const timeElapsed = room.settings.drawTime - room.timeLeft;
    const timeBonus = Math.floor((timeElapsed / room.settings.drawTime) * 50);
    const totalPoints = 100 + timeBonus;

    player.score += totalPoints;
    player.correctGuesses++;
    player.guessedThisRound = true;
    room.players.set(player.id, player);

    io.to(room.code).emit('correct_guess', {
        playerId: player.id,
        playerName: player.name,
        playerAvatar: player.avatar,
        points: totalPoints
    });

    const allGuessed = Array.from(room.players.values()).every(p => p.id === room.drawingOrder[room.currentDrawerIndex] || p.guessedThisRound);
    if (allGuessed) {
        clearInterval(room.timer);
        setTimeout(() => { room.currentRound++; nextRound(room); }, 2000);
    }
}

function endGame(room) {
    room.state = 'ended';
    if (room.timer) clearInterval(room.timer);

    const leaderboard = Array.from(room.players.values()).sort((a, b) => b.score - a.score).map((p, i) => ({
        rank: i + 1, id: p.id, name: p.name, avatar: p.avatar, score: p.score, correctGuesses: p.correctGuesses
    }));

    io.to(room.code).emit('game_ended', { leaderboard, totalRounds: room.currentRound });
}

function getPlayersList(room) {
    return Array.from(room.players.values()).map(p => ({
        id: p.id, name: p.name, avatar: p.avatar, score: p.score, correctGuesses: p.correctGuesses,
        isHost: p.id === room.hostId, isReady: p.isReady,
        isDrawing: room.state === 'playing' && room.drawingOrder[room.currentDrawerIndex] === p.id,
        guessedThisRound: p.guessedThisRound
    })).sort((a, b) => b.score - a.score);
}

io.on('connection', (socket) => {
    console.log(`[+] Player: ${socket.id}`);

    socket.on('rejoin_room', (data, callback) => {
        try {
            const { playerId, roomCode } = data;
            const room = rooms.get(roomCode);
            if (!room) return callback({ success: false, error: 'Room not found' });
            
            let player = null;
            let oldSocketId = null;
            room.players.forEach((p, id) => {
                if (p.id === playerId) {
                    player = p;
                    oldSocketId = id;
                    players.delete(id);
                    player.id = socket.id;
                    player.socketId = socket.id;
                    players.set(socket.id, { ...player, roomCode: room.code });
                    room.players.delete(id);
                    room.players.set(socket.id, player);
                }
            });
            
            if (!player) return callback({ success: false, error: 'Player not found' });
            
            if (oldSocketId && disconnectTimeouts.has(oldSocketId)) {
                clearTimeout(disconnectTimeouts.get(oldSocketId));
                disconnectTimeouts.delete(oldSocketId);
            }
            
            socket.join(room.code);
            socket.emit('room_state', { 
                success: true, 
                room: serializeRoom(room, socket.id), 
                players: getPlayersList(room), 
                chat: room.chat.slice(-50) 
            });
            io.to(room.code).emit('player_joined', { player, players: getPlayersList(room), isReconnect: true });
            console.log(`[Room] ${player.name} reconnected to: ${room.code}`);
            callback({ success: true });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    socket.on('get_rooms', (callback) => {
        const availableRooms = Array.from(rooms.values()).filter(r => r.state === 'waiting' && r.players.size < r.settings.maxPlayers)
            .map(r => ({ code: r.code, name: r.name, players: r.players.size, maxPlayers: r.settings.maxPlayers, theme: r.settings.theme }));
        callback({ rooms: availableRooms });
    });

    socket.on('create_room', (data, callback) => {
        try {
            const { name, settings } = data;
            const room = createRoom(socket.id, settings);
            const player = {
                id: socket.id, socketId: socket.id,
                name: name || `Player${Math.floor(Math.random() * 1000)}`,
                avatar: data.avatar || getRandomAvatar(),
                score: 0, correctGuesses: 0, isHost: true, isReady: true, guessedThisRound: false
            };
            players.set(socket.id, { ...player, roomCode: room.code });
            room.players.set(socket.id, player);
            socket.join(room.code);
            console.log(`[Room] Created: ${room.code} by ${player.name}`);
            callback({ success: true, room: serializeRoom(room, socket.id), player });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    socket.on('join_room', (data, callback) => {
        try {
            const { code, name, avatar } = data;
            const room = rooms.get(code.toUpperCase().trim());
            if (!room) return callback({ success: false, error: 'Room not found' });
            if (room.players.size >= room.settings.maxPlayers) return callback({ success: false, error: 'Room is full' });
            if (room.state !== 'waiting') return callback({ success: false, error: 'Game already started' });

            const player = {
                id: socket.id, socketId: socket.id,
                name: name || `Player${Math.floor(Math.random() * 1000)}`,
                avatar: avatar || getRandomAvatar(),
                score: 0, correctGuesses: 0, isHost: false, isReady: false, guessedThisRound: false
            };
            players.set(socket.id, { ...player, roomCode: room.code });
            room.players.set(socket.id, player);
            socket.join(room.code);

            io.to(room.code).emit('player_joined', { player, players: getPlayersList(room) });
            io.to(room.code).emit('notification', { type: 'info', message: `${player.name} joined`, icon: 'user-plus' });
            console.log(`[Room] ${player.name} joined: ${room.code}`);
            callback({ success: true, room: serializeRoom(room, socket.id), player });
        } catch (error) {
            callback({ success: false, error: error.message });
        }
    });

    socket.on('toggle_ready', (callback) => {
        const player = players.get(socket.id);
        if (!player) return callback({ success: false });
        const room = rooms.get(player.roomCode);
        if (!room || room.state !== 'waiting') return callback({ success: false });

        player.isReady = !player.isReady;
        room.players.set(socket.id, player);
        io.to(room.code).emit('player_ready', { playerId: socket.id, isReady: player.isReady, players: getPlayersList(room) });

        const allReady = room.players.size >= CONFIG.minPlayers && Array.from(room.players.values()).every(p => p.isReady || p.isHost);
        if (allReady) startGame(room);

        callback({ success: true, isReady: player.isReady });
    });

    socket.on('start_game', (callback) => {
        const player = players.get(socket.id);
        if (!player) return callback({ success: false });
        const room = rooms.get(player.roomCode);
        if (!room || room.hostId !== socket.id) return callback({ success: false, error: 'Not host' });
        if (room.players.size < CONFIG.minPlayers) return callback({ success: false, error: 'Need more players' });
        startGame(room);
        callback({ success: true });
    });

    socket.on('choose_word', (data, callback) => {
        const player = players.get(socket.id);
        if (!player) return callback({ success: false });
        const room = rooms.get(player.roomCode);
        if (!room || room.state !== 'choosing_word') return callback({ success: false });
        if (room.drawingOrder[room.currentDrawerIndex] !== socket.id) return callback({ success: false });

        const { word } = data;
        if (!room.wordOptions.includes(word)) return callback({ success: false });

        startDrawingPhase(room, word);
        callback({ success: true });
    });

    socket.on('draw', (data) => {
        const player = players.get(socket.id);
        if (!player) return;
        const room = rooms.get(player.roomCode);
        if (!room || room.state !== 'drawing') return;
        if (room.drawingOrder[room.currentDrawerIndex] !== socket.id) return;
        room.canvasData.push(data);
        socket.to(room.code).emit('draw', data);
    });

    socket.on('clear_canvas', () => {
        const player = players.get(socket.id);
        if (!player) return;
        const room = rooms.get(player.roomCode);
        if (!room || room.drawingOrder[room.currentDrawerIndex] !== socket.id) return;
        room.canvasData = [];
        io.to(room.code).emit('clear_canvas');
    });

    socket.on('fill', (data) => {
        const player = players.get(socket.id);
        if (!player) return;
        const room = rooms.get(player.roomCode);
        if (!room || room.state !== 'drawing') return;
        if (room.drawingOrder[room.currentDrawerIndex] !== socket.id) return;
        io.to(room.code).emit('fill', data);
    });

    socket.on('guess', (data, callback) => {
        const player = players.get(socket.id);
        if (!player) return callback({ success: false });
        const room = rooms.get(player.roomCode);
        if (!room || room.state !== 'drawing') return callback({ success: false });
        if (room.drawingOrder[room.currentDrawerIndex] === socket.id) return callback({ success: false });
        if (player.guessedThisRound) return callback({ success: false, error: 'Already guessed' });

        const { guess } = data;
        if (!guess || !guess.trim()) return callback({ success: false });

        const normalizedGuess = guess.toLowerCase().trim().toLowerCase();
        const normalizedWord = room.currentWord.toLowerCase();

        if (normalizedGuess === normalizedWord) {
            handleCorrectGuess(room, player);
            callback({ success: true, isCorrect: true });
        } else {
            io.to(room.code).emit('chat_message', {
                id: Date.now(), playerId: player.id, playerName: player.name, playerAvatar: player.avatar,
                message: guess, isGuess: true, timestamp: Date.now()
            });
            callback({ success: true, isCorrect: false });
        }
    });

    socket.on('chat_message', (data) => {
        const player = players.get(socket.id);
        if (!player) return;
        const room = rooms.get(player.roomCode);
        if (!room) return;

        const message = {
            id: Date.now(), 
            playerId: player.id, 
            playerName: player.name, 
            playerAvatar: player.avatar,
            message: String(data.message).substring(0, 200).replace(/[<>]/g, ''), 
            isGuess: data.isGuess || false,
            timestamp: Date.now()
        };
        room.chat.push(message);
        if (room.chat.length > 100) room.chat.shift();
        io.to(room.code).emit('chat_message', message);
    });

    socket.on('emoji_reaction', (data) => {
        const player = players.get(socket.id);
        if (!player) return;
        const room = rooms.get(player.roomCode);
        if (!room) return;
        io.to(room.code).emit('emoji_reaction', { playerId: player.id, playerName: player.name, emoji: data.emoji, x: data.x, y: data.y });
    });

    socket.on('get_room_state', (callback) => {
        const player = players.get(socket.id);
        if (!player) return callback({ success: false });
        const room = rooms.get(player.roomCode);
        if (!room) return callback({ success: false });
        callback({ success: true, room: serializeRoom(room, socket.id), players: getPlayersList(room), chat: room.chat.slice(-50) });
    });

    socket.on('play_again', () => {
        const player = players.get(socket.id);
        if (!player) return;
        const room = rooms.get(player.roomCode);
        if (!room || room.state !== 'ended') return;
        room.state = 'waiting';
        room.currentRound = 0;
        room.players.forEach(p => { p.score = 0; p.correctGuesses = 0; p.isReady = false; });
        io.to(room.code).emit('back_to_lobby', { players: getPlayersList(room) });
    });

    socket.on('leave_room', () => handleDisconnect(socket, true));
    socket.on('disconnect', () => handleDisconnect(socket, false));

    const disconnectTimeouts = new Map();

    function handleDisconnect(socket, isManual) {
        const player = players.get(socket.id);
        if (!player) return;
        const room = rooms.get(player.roomCode);

        if (isManual) {
            if (room) {
                room.players.delete(socket.id);
                if (room.players.size === 0) {
                    if (room.timer) clearInterval(room.timer);
                    rooms.delete(room.code);
                } else {
                    if (room.hostId === socket.id) {
                        room.hostId = room.players.keys().next().value;
                        const newHost = room.players.get(room.hostId);
                        if (newHost) newHost.isHost = true;
                    }
                    io.to(room.code).emit('player_left', { playerId: socket.id, playerName: player.name, players: getPlayersList(room) });
                    if (room.state === 'playing' && room.players.size < CONFIG.minPlayers) {
                        if (room.timer) clearInterval(room.timer);
                        room.state = 'waiting';
                        room.players.forEach(p => { p.score = 0; p.isReady = false; });
                        io.to(room.code).emit('game_cancelled', { reason: 'Not enough players' });
                    }
                }
            }
            players.delete(socket.id);
            socket.leave(room?.code);
        } else {
            const timeout = setTimeout(() => {
                if (room) {
                    room.players.delete(socket.id);
                    if (room.players.size === 0) {
                        if (room.timer) clearInterval(room.timer);
                        rooms.delete(room.code);
                    } else {
                        if (room.hostId === socket.id) {
                            room.hostId = room.players.keys().next().value;
                            const newHost = room.players.get(room.hostId);
                            if (newHost) newHost.isHost = true;
                        }
                        io.to(room.code).emit('player_left', { playerId: socket.id, playerName: player.name, players: getPlayersList(room) });
                        if (room.state === 'playing' && room.players.size < CONFIG.minPlayers) {
                            if (room.timer) clearInterval(room.timer);
                            room.state = 'waiting';
                            room.players.forEach(p => { p.score = 0; p.isReady = false; });
                            io.to(room.code).emit('game_cancelled', { reason: 'Not enough players' });
                        } else if (room.state === 'playing') {
                            const drawerIndex = room.drawingOrder.indexOf(socket.id);
                            if (drawerIndex !== -1 && drawerIndex === room.currentDrawerIndex) skipRound(room);
                        }
                    }
                }
                players.delete(socket.id);
                socket.leave(room?.code);
                disconnectTimeouts.delete(socket.id);
            }, 10000);
            disconnectTimeouts.set(socket.id, timeout);
        }
    }
});

function serializeRoom(room, socketId) {
    return {
        code: room.code, name: room.name, settings: room.settings, state: room.state,
        currentRound: room.currentRound, totalRounds: room.settings.rounds * room.players.size,
        currentDrawer: room.drawingOrder[room.currentDrawerIndex] || null,
        currentWord: room.state === 'drawing' && room.currentWord && room.drawingOrder[room.currentDrawerIndex] === socketId ? room.currentWord : null,
        wordLength: room.currentWord ? room.currentWord.length : 0,
        timeLeft: room.timeLeft || room.settings.drawTime,
        isHost: room.hostId === socketId
    };
}

setInterval(() => {
    rooms.forEach((room, code) => {
        if (room.state === 'waiting' && room.players.size === 0) rooms.delete(code);
        if (Date.now() - room.createdAt > 3600000 && room.state === 'waiting') rooms.delete(code);
    });
}, 300000);

const PORT = process.env.PORT || 1963;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n╔═══════════════════════════════════════════════════════╗`);
    console.log(`║   DRAW & GUESS GAME - SERVER RUNNING!              ║`);
    console.log(`║   Port: ${PORT}                                         ║`);
    console.log(`║   URL:  http://localhost:${PORT}                        ║`);
    console.log(`╚═══════════════════════════════════════════════════════╝\n`);
});

process.on('SIGTERM', () => {
    rooms.forEach(room => { if (room.timer) clearInterval(room.timer); });
    server.close(() => process.exit(0));
});
