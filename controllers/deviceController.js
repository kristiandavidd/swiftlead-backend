const db = require("../config/db");

// controllers/deviceController.js
const getDeviceData = async (req, res) => {
    const { userId } = req.params;


    if (!userId) {
        return res.status(400).json({ error: 'ID pengguna dibutuhkan.' });
    }

    try {
        const query = `
            SELECT 
                sh.id AS swiftletHouseId,
                sh.name AS swiftletHouseName,
                d.floor AS floor,
                d.install_code AS installCode
            FROM swiftlet_house sh
            LEFT JOIN iot_device d ON sh.id = d.id_swiftlet_house AND d.status = 1
            WHERE sh.id_user = ? AND sh.status = 1
            ORDER BY sh.created_at, d.floor, d.install_code
        `;

        const [rows] = await db.query(query, [userId]);

        const result = rows.reduce((acc, row) => {
            if (!acc[row.swiftletHouseId]) {
                acc[row.swiftletHouseId] = {
                    name: row.swiftletHouseName,
                    floors: {}
                };
            }

            // Jika floor adalah NULL, jangan tambahkan ke daftar floors
            if (row.floor !== null) {
                if (!acc[row.swiftletHouseId].floors[row.floor]) {
                    acc[row.swiftletHouseId].floors[row.floor] = [];
                }

                acc[row.swiftletHouseId].floors[row.floor].push({
                    installCode: row.installCode
                });
            }

            return acc;
        }, {});

        res.json(result);
    } catch (error) {
        console.error('Error fetching device data:', error);
        res.status(500).json({ error: 'Gagal mendapatkan data.' });
    }
};

const getDeviceDataByDeviceId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "ID Perangkat dibutuhkan." });
        }

        const [device] = await db.query(
            `SELECT 
                d.id,
                d.install_code,
                d.floor,
                d.status,
                d.created_at,
                d.updated_at,
                sh.name AS house_name,
                sh.location AS house_location
             FROM iot_device d
             JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
             WHERE d.id = ?`,
            [id]
        );

        if (!device.length) {
            return res.status(404).json({ message: "Perangkat tidak ditemukan." });
        }

        res.status(200).json(device[0]);
    } catch (error) {
        console.error("Error fetching device by ID:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
};

const getAllDevices = async (req, res) => {
    try {
        const [devices] = await db.query(`
            SELECT u.name AS user_name, sh.location AS house_location, d.*
            FROM iot_device d
            JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
            JOIN users u ON sh.id_user = u.id
            ORDER BY d.created_at DESC
            `
        );
        res.json(devices);
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ error: 'Gagal mendapatkan perangkat.' });
    }
}

// const getUserDevices = async (userId, swiftletHouseId, floor) => {
//     if (!userId || !swiftletHouseId || typeof floor === 'undefined') {
//         throw new Error('Invalid parameters: userId, swiftletHouseId, and floor are required');
//     }

//     console.log('Fetching devices for:', { userId, swiftletHouseId, floor });

//     const query = `
//         SELECT id AS deviceId, install_code AS installCode
//         FROM iot_device
//         WHERE id_swiftlet_house = ?
//         AND floor = ?
//         AND status = 1
//     `;

//     const [devices] = await db.query(query, [swiftletHouseId, parseInt(floor, 10)]);
//     return devices;
// };

let retryCount = 0;

const generateCode = async (req, res) => {
    try {
        if (retryCount > 5) {
            throw new Error("Percobaan maksimum untuk menghasilkan kode instalasi telah dicapai.");
        }

        const prefix = "032";
        const floorCode = Math.floor(Math.random() * 90 + 10).toString().padStart(2, "0");
        const uniqueCode = Math.floor(Math.random() * 9000 + 1000).toString();
        const installCode = `${prefix}-${floorCode}-${uniqueCode}`;

        const [existing] = await db.query("SELECT * FROM iot_device WHERE install_code = ?", [installCode]);

        if (existing.length > 0) {
            retryCount++;
            return generateInstallCode(req, res);
        }

        res.json({ install_code: installCode });
    } catch (error) {
        console.error("Error generating install code:", error);
        res.status(500).json({ error: "Gagal menghasilkan kode instalasi." });
    }
};


const addDevice = async (req, res) => {
    try {
        const { id_swiftlet_house, floor, install_code, status } = req.body;

        if (!id_swiftlet_house || !floor || !install_code || status === undefined) {
            return res.status(400).json({ error: "Semua bagian harus diisi." });
        }

        const [result] = await db.query(
            `INSERT INTO iot_device (id, id_swiftlet_house, floor, install_code, status, created_at, updated_at)
             VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())`,
            [id_swiftlet_house, floor, install_code, status]
        );

        res.status(201).json({ message: "Perangkat berhasil ditambahkan", deviceId: result.insertId });
    } catch (error) {
        console.error("Error adding device:", error);
        res.status(500).json({ error: "Gagal dalam menambahkan perangkat." });
    }
};

const updateStatusDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { status } = req.body;

        if (status === undefined) {
            return res.status(400).json({ error: "Status diperlukan." });
        }

        await db.query(`UPDATE iot_device SET status = ? WHERE id = ?`, [status, deviceId]);
        res.json({ message: "Device status updated successfully" });
    } catch (error) {
        console.error("Error updating device status:", error);
        res.status(500).json({ error: "Gagal dalam memperbarui status perangkat." });
    }
};

const getUserHousesAndDevices = async (req, res) => {
    const { userId } = req.params;
    try {
        const housesQuery = `
            SELECT sh.id AS house_id, sh.name AS house_name, sh.location
            FROM swiftlet_house sh
            WHERE sh.id_user = ?
            ORDER BY sh.created_at;
        `;
        const devicesQuery = `
            SELECT d.id AS device_id, d.id_swiftlet_house, d.floor, d.install_code, d.status
            FROM iot_device d
        `;

        const [houses] = await db.query(housesQuery, [userId]);
        const [devices] = await db.query(devicesQuery);

        // Group devices by house
        const result = houses.map((house) => {
            const houseDevices = devices
                .filter((device) => device.id_swiftlet_house === house.house_id)
                .map((device) => ({
                    id: device.device_id,
                    floor: device.floor,
                    install_code: device.install_code,
                    status: device.status
                }));
            return { ...house, devices: houseDevices };
        });

        res.json(result);
    } catch (error) {
        console.error("Error fetching houses and devices:", error);
        res.status(500).json({ error: "Gagal dalam mendapatkan data kandang dan perangkat." });
    }
};

// Delete a swiftlet house
const deleteHouse = async (req, res) => {
    const { houseId } = req.params;
    try {
        const [devices] = await db.query(`SELECT COUNT(*) AS count FROM iot_device WHERE id_swiftlet_house = ?`, [houseId]);
        if (devices[0].count > 0) {
            return res.status(400).json({ error: "Tidak bisa menghapus kandang dengan perangkat terpasang." });
        }

        await db.query(`DELETE FROM swiftlet_house WHERE id = ?`, [houseId]);
        res.json({ message: "Berhasil menghapus kandang." });
    } catch (error) {
        console.error("Error deleting house:", error);
        res.status(500).json({ error: "Gagal dalam menghapus kandang." });
    }
};

const editHouse = async (req, res) => {
    const { houseId } = req.params;
    const { name, location } = req.body;
    try {
        await db.query(`UPDATE swiftlet_house SET name = ?, location = ? WHERE id = ?`, [name, location, houseId]);
        res.json({ message: "Kandang berhasil diperbarui." });
    } catch (error) {
        console.error("Error updating house:", error);
        res.status(500).json({ error: "Gagal dalam memperbarui kandang." });
    }
}

const deleteDevice = async (req, res) => {
    const { deviceId } = req.params;
    try {
        await db.query(`DELETE FROM iot_device WHERE id = ?`, [deviceId]);
        res.json({ message: "Perangkat berhasil dihapus." });
    } catch (error) {
        console.error("Error deleting device:", error);
        res.status(500).json({ error: "Gagal dalam menghapus perangkat." });
    }
};

const updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const { floor, status, created_at, updated_at } = req.body;

        if (!id || !floor || status === undefined || !created_at || !updated_at) {
            return res.status(400).json({ message: "Semua bagian harus diisi." });
        }

        // Update device di database
        const [result] = await db.query(
            `UPDATE iot_device 
             SET floor = ?, status = ?, created_at = ?, updated_at = ?
             WHERE id = ?`,
            [floor, status, created_at, updated_at, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Perangkat tidak ditemukan." });
        }

        res.status(200).json({ message: "Perangkat berhasil diperbarui." });
    } catch (error) {
        console.error("Error updating device:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
};


module.exports = {
    getDeviceData,
    getAllDevices,
    generateCode,
    addDevice,
    deleteHouse,
    getUserHousesAndDevices,
    editHouse,
    updateDevice,
    updateStatusDevice,
    deleteDevice,
    getDeviceDataByDeviceId
};
