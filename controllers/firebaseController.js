const { saveAverageToDatabase } = require('../models/historicalDataModel');
let dataBuffer = [];
let lastData = null;
let startTime = Date.now();

const listenFirebaseChanges = (firebaseRef, io, installCode) => {
    const devicePath = `/device/${installCode}`;

    console.log(`Listening to Firebase changes for device: ${installCode}`);

    const ref = firebaseRef.child(devicePath);

    // Dengarkan perubahan data Firebase
    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            io.to(socket.id).emit('sensorData', { installCode: device.installCode, ...data });
            console.log(`Data received for installCode ${device.installCode}:`, data);
        } else {
            console.log(`No data available for installCode: ${device.installCode}`);
            io.to(socket.id).emit('sensorData', { installCode: device.installCode, Suhu: null, Kelembaban: null });
        }
    }, (error) => {
        console.error('Error fetching data from Firebase:', error);
    });
};

const saveDataAtInterval = () => {
    if (lastData) {
        console.log('Saving data based on interval...');

        const avgSuhu = dataBuffer.reduce((sum, entry) => sum + entry.suhu, 0) / dataBuffer.length || lastData.suhu;
        const avgKelembapan = dataBuffer.reduce((sum, entry) => sum + entry.kelembapan, 0) / dataBuffer.length || lastData.kelembapan;
        const timestamp = new Date();

        saveAverageToDatabase({
            suhu: avgSuhu,
            kelembapan: avgKelembapan,
            timestamp: timestamp
        }).then(() => {
            console.log('Data saved to database:', {
                suhu: avgSuhu,
                kelembapan: avgKelembapan,
                timestamp: timestamp
            });
        }).catch((error) => {
            console.error('Error saving data to database:', error);
        });

        dataBuffer = [];
        startTime = Date.now();
    }
};

const startDataSavingInterval = () => {
    console.log('Starting global data saving interval...');
    setInterval(saveDataAtInterval, 3600000);
};

module.exports = { listenFirebaseChanges, startDataSavingInterval };
