const con = require('../config/db');

const saveAverageToDatabase = (avgTemp, avgHumidity) => {
    const timestamp = new Date();  // Waktu saat data disimpan
    const query = 'INSERT INTO sensor (suhu, kelembaban, timestamp) VALUES (?, ?, ?)';
    const values = [avgTemp.toFixed(2), avgHumidity.toFixed(2), timestamp];

    connection.query(query, values, (err, result) => {
        if (err) throw err;
        console.log('Average data with timestamp inserted to MySQL:', result.insertId);
    });
};

module.exports = { saveAverageToDatabase };