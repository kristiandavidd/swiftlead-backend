const { saveAverageToDatabase } = require('../models/historicalDataModel');

const listenFirebaseChanges = (firebaseRef, io) => {
    let dataBuffer = [];
    let startTime = Date.now();

    firebaseRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const kelembapan = data.Kelembapan;
            const suhu = data.Suhu;

            console.log('Data received from Firebase:', { suhu, kelembapan });

            dataBuffer.push({ suhu, kelembapan });

            if (io) {
                io.emit('sensorData', { suhu, kelembapan });
            }

            if (Date.now() - startTime >= 3600000) {
                const avgSuhu = dataBuffer.reduce((sum, entry) => sum + entry.suhu, 0) / dataBuffer.length;
                const avgKelembapan = dataBuffer.reduce((sum, entry) => sum + entry.kelembapan, 0) / dataBuffer.length;
                const timestamp = new Date();

                saveAverageToDatabase({
                    suhu: avgSuhu,
                    kelembapan: avgKelembapan,
                    timestamp: timestamp
                }).then(() => {
                    console.log('Data rata-rata berhasil disimpan ke database:', {
                        suhu: avgSuhu,
                        kelembapan: avgKelembapan,
                        timestamp: timestamp
                    });
                }).catch((error) => {
                    console.error('Gagal menyimpan data ke database:', error);
                });

                dataBuffer = [];
                startTime = Date.now();
            }
        } else {
            console.log('No data available');
        }
    }, (error) => {
        console.error('Error fetching data from Firebase:', error);
    });
};

module.exports = { listenFirebaseChanges };
