const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let globalPlaybackState = {
    videoUrl: '',
    title: 'No video selected',
    currentTime: 0,
    isPlaying: false
};

const users = {};

io.on('connection', (socket) => {
    socket.on('userLogin', (username) => {
        users[socket.id] = username || 'Anonymous';
        
        io.emit('updateUserCount', Object.keys(users).length);
        io.emit('receiveChatMessage', {
            username: 'PARTYCAST BOT',
            message: `🎉 ${users[socket.id]} joined the PartyCast room!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        socket.emit('syncGlobalState', globalPlaybackState);
    });

    socket.on('masterSelectVideo', (data) => {
        globalPlaybackState.videoUrl = data.videoUrl;
        globalPlaybackState.title = data.title;
        globalPlaybackState.currentTime = 0;
        globalPlaybackState.isPlaying = true;

        io.emit('loadGlobalVideo', globalPlaybackState);
    });

    socket.on('masterPlay', (data) => {
        globalPlaybackState.isPlaying = true;
        globalPlaybackState.currentTime = data.currentTime;
        socket.broadcast.emit('syncPlay', data);
    });

    socket.on('masterPause', (data) => {
        globalPlaybackState.isPlaying = false;
        globalPlaybackState.currentTime = data.currentTime;
        socket.broadcast.emit('syncPause', data);
    });

    socket.on('masterSeek', (data) => {
        globalPlaybackState.currentTime = data.currentTime;
        socket.broadcast.emit('syncSeek', data);
    });

    socket.on('sendReaction', (data) => {
        io.emit('receiveReaction', data);
    });

    socket.on('sendChatMessage', (data) => {
        const username = users[socket.id] || 'Anonymous';
        io.emit('receiveChatMessage', {
            username: username,
            message: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            io.emit('receiveChatMessage', {
                username: 'PARTYCAST BOT',
                message: `👋 ${users[socket.id]} left the room.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            delete users[socket.id];
            io.emit('updateUserCount', Object.keys(users).length);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 PartyCast Server running on http://localhost:${PORT}`));
