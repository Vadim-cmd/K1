const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());

const PORT = 3000;

const games = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinGame', ({ username, pin }) => {
        if (!games[pin]) {
            games[pin] = { players: {}, question: 0 };
        }
        if (!games[pin].players[username]) {
            games[pin].players[username] = 0;
        }
        socket.join(pin);
        io.to(pin).emit('updateLeaderboard', games[pin].players);
    });

    socket.on('submitAnswer', ({ pin, username, correct }) => {
        if (games[pin] && games[pin].players[username] !== undefined) {
            if (correct) {
                games[pin].players[username] += 1;
            }
            io.to(pin).emit('updateLeaderboard', games[pin].players);
        }
    });

    socket.on('optionSelected', ({ pin }) => {
        io.to(pin).emit('disableOptions');
    });

    socket.on('nextQuestion', ({ pin }) => {
        io.to(pin).emit('nextQuestion');
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});