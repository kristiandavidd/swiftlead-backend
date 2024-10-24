const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { listenFirebaseChanges, startDataSavingInterval } = require('./controllers/firebaseController');
const { db } = require('./config/firebase');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIo(server, {
    path: '/socket.io',
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(compression());

app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'],
}));
app.use(express.json());
app.options('*', cors());

listenFirebaseChanges(db.ref('/'), io);
startDataSavingInterval();

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const controlRouter = require('./routes/control');

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/control', controlRouter);


server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = { io };
