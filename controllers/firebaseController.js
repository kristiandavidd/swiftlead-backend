const { saveAverageToDatabase } = require('../models/historicalDataModel');
const { db } = require('../config/firebase');

let dataBuffer = {}; 

const listenFirebaseChanges = (io, socket, installCode) => {
    const devicePath = `/device/${installCode}`;
    console.log(`Listening to Firebase changes for device: ${installCode}`);

    const ref = db.ref(devicePath);

    ref.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            io.to(socket.id).emit('sensorData', { installCode, ...data });
            console.log(`Data received for installCode ${installCode}:`, data);

            if (!dataBuffer[installCode]) dataBuffer[installCode] = [];
            dataBuffer[installCode].push({ suhu: data.Suhu, kelembaban: data.Kelembaban });

        } else {
            console.log(`No data available for installCode: ${installCode}`);
            io.to(socket.id).emit('sensorData', { installCode, Suhu: null, Kelembaban: null });
        }
    }, (error) => {
        console.error('Error fetching data from Firebase:', error);
    });

    return ref;
};

const saveDataAtInterval = () => {
    console.log('Saving data based on interval...');
    const timestamp = new Date();

    Object.keys(dataBuffer).forEach(installCode => {
        const buffer = dataBuffer[installCode];

        if (buffer.length > 0) {
            const avgSuhu = buffer.reduce((sum, entry) => sum + entry.suhu, 0) / buffer.length;
            const avgKelembaban = buffer.reduce((sum, entry) => sum + entry.kelembaban, 0) / buffer.length;

            saveAverageToDatabase({
                installCode, 
                suhu: avgSuhu,
                kelembaban: avgKelembaban,
                timestamp
            }).then(() => {
                console.log(`Data saved to database for ${installCode}:`, {
                    suhu: avgSuhu,
                    kelembaban: avgKelembaban,
                    timestamp
                });
            }).catch((error) => {
                console.error(`Error saving data for ${installCode}:`, error);
            });

            dataBuffer[installCode] = []; 
        }
    });
};

const startDataSavingInterval = () => {
    console.log('Starting global data saving interval...');
    setInterval(saveDataAtInterval, 1000 * 60 * 15); 
};

module.exports = { listenFirebaseChanges, startDataSavingInterval };
