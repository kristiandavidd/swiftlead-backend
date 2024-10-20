const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { listenFirebaseChanges } = require('./controllers/firebaseController');
const { db } = require('./config/firebase');

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);  // Buat server HTTP
const io = socketIo(server, {
    path: '/socket.io',  // Tentukan path Socket.IO di server
    cors: {
        origin: 'http://localhost:3000',  // Sesuaikan dengan origin frontend
        methods: ['GET', 'POST'],
    },
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());

listenFirebaseChanges(db.ref('/'));

io.on('connection', (socket) => {
    console.log('A user connected');
    listenFirebaseChanges(db.ref('/'), socket);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

module.exports = { io };
