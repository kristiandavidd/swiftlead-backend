const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { listenFirebaseChanges, startDataSavingInterval } = require('./controllers/firebaseController');
const { db } = require('./config/firebase');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(cookieParser());
const port = process.env.PORT || 8080;
const server = http.createServer(app);
const io = socketIo(server, {
    path: '/socket.io',
    cors: {
        origin: [
            'http://localhost:3000',
            'https://swiftlead-frontend.vercel.app'
        ],
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(compression());

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://swiftlead-frontend.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token'],
}));
app.use(express.json());
app.options('*', cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


listenFirebaseChanges(db.ref('/'), io);
startDataSavingInterval();

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
    console.error('JWT_SECRET is not set');
    process.exit(1);
}

const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const controlRouter = require('./routes/control');
const profileRouter = require('./routes/profile');
const articleRoutes = require('./routes/articles');
const membershipRoutes = require('./routes/membership');
const paymentRoutes = require('./routes/payment');
const WeeklyPriceRoutes = require('./routes/weekly-price');
const SalesRoutes = require('./routes/sales');
const HarvestRoutes = require('./routes/harvest');

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/control', controlRouter);
app.use('/profile', profileRouter);
app.use('/articles', articleRoutes);
app.use('/membership', membershipRoutes);
app.use('/payment', paymentRoutes);
app.use('/weekly-price', WeeklyPriceRoutes);
app.use('/sales', SalesRoutes);
app.use('/harvest', HarvestRoutes);

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
