const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { db } = require('./config/firebase'); // Firebase Realtime DB Config
const { getUserDevices } = require('./controllers/deviceController'); // Controller untuk MySQL
const compression = require('compression');
const cookieParser = require('cookie-parser');
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

const activeListeners = {}; // Melacak listener Firebase per socket

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('subscribeToSensor', async ({ installCode }) => {
        console.log(`Subscribing to sensor: ${installCode}`);

        // Hentikan listener sebelumnya jika ada
        if (activeListeners[socket.id]) {
            activeListeners[socket.id].off();
            console.log(`Unsubscribed from previous sensor for socket: ${socket.id}`);
        }

        // Pasang listener baru
        const ref = db.ref(`/device/${installCode}`);
        ref.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                io.to(socket.id).emit('sensorData', { installCode, ...data });
                console.log(`Data received for installCode ${installCode}:`, data);
            } else {
                io.to(socket.id).emit('sensorData', { installCode, Suhu: null, Kelembaban: null });
                console.log(`No data available for installCode: ${installCode}`);
            }
        });

        // Simpan reference listener baru
        activeListeners[socket.id] = ref;
    });

    socket.on('disconnect', () => {
        if (activeListeners[socket.id]) {
            activeListeners[socket.id].off();
            delete activeListeners[socket.id];
        }
        console.log('Client disconnected:', socket.id);
    });
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
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tambahkan route API
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
const DeviceRoutes = require('./routes/device');
const RequestRoutes = require('./routes/request');

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
app.use('/device', DeviceRoutes);
app.use('/request', RequestRoutes);

server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

// Handle 404
app.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that!");
});

// Handle 500
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = { io };
