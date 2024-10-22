const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { listenFirebaseChanges, startDataSavingInterval } = require('./controllers/firebaseController');
const { db } = require('./config/firebase');

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIo(server, {
    path: '/socket.io',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.json());

listenFirebaseChanges(db.ref('/'), io);
startDataSavingInterval();

const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const controlRouter = require('./routes/control');
app.use('/control', controlRouter);

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

module.exports = { io };
