const con = require('../config/db');

const saveAverageToDatabase = (data) => {
    const { suhu, kelembapan, timestamp } = data;

    const avgTemp = parseFloat(suhu);
    const avgHumidity = parseFloat(kelembapan);

    if (isNaN(avgTemp) || isNaN(avgHumidity)) {
        console.error('Invalid data: avgTemp or avgHumidity is not a number');
        return Promise.reject(new Error('Invalid data'));
    }

    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO sensor (suhu, kelembapan, timestamp) VALUES (?, ?, ?)';
        const values = [avgTemp.toFixed(2), avgHumidity.toFixed(2), timestamp];

        con.query(query, values, (err, result) => {
            if (err) {
                reject(err);  
            } else {
                resolve(result.insertId);
            }
        });
    });
};

module.exports = { saveAverageToDatabase };
