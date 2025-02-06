const con = require('../config/db');

const saveAverageToDatabase = (data) => {
    const { installCode, suhu, kelembaban, timestamp } = data;

    const avgTemp = parseFloat(suhu);
    const avgHumidity = parseFloat(kelembaban);

    if (isNaN(avgTemp) || isNaN(avgHumidity)) {
        console.error('Invalid data: avgTemp or avgHumidity is not a number');
        return Promise.reject(new Error('Invalid data'));
    }

    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO sensor (install_code, suhu, kelembaban, timestamp) VALUES (?, ?, ?, ?)';
        const values = [installCode, avgTemp.toFixed(2), avgHumidity.toFixed(2), timestamp];

        con.query(query, values, (err, result) => {
            if (err) {
                console.error('Error saving to database:', err);
                reject(err);
            } else {
                console.log(`Data saved successfully for install_code: ${installCode}`);
                resolve(result.insertId);
            }
        });
    });
};

module.exports = { saveAverageToDatabase };
