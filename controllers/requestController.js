const { v4: uuidv4 } = require('uuid');
const db = require("../config/db");

const addSwiftletHouse = async (req, res) => {
    try {
        const { userId, name, location } = req.body;

        if (!userId || !name || !location) {
            return res.status(400).json({ message: "Semua bagian harus diisi." });
        }

        // Generate UUID
        const houseId = uuidv4();

        const [result] = await db.query(
            `INSERT INTO swiftlet_house (id, id_user, name, location, status) VALUES (?, ?, ?, ?, 1)`,
            [houseId, userId, name, location]
        );

        res.status(201).json({ message: "Kandang burung walet berhasil ditambahkan.", houseId });
    } catch (error) {
        console.error("Error adding swiftlet house:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
};

// Fungsi untuk menambahkan pengajuan instalasi
const requestInstallation = async (req, res) => {
    try {
        const { swiftletHouseId, floors, sensorCount, appointment_date } = req.body;

        // Validasi input
        if (!swiftletHouseId || !floors || !sensorCount || !appointment_date) {
            return res.status(400).json({ message: "Semua bagian harus diisi." });
        }

        // Masukkan data ke tabel `installation_requests`
        const [result] = await db.query(
            `INSERT INTO installation_requests (id_swiftlet_house, floors, sensor_count, appointment_date, status)
            VALUES (?, ?, ?, ?, ?)`,
            [swiftletHouseId, floors, sensorCount, appointment_date, 0] // Status default = 0 (pending)
        );

        res.status(201).json({
            message: "Pengajuan instalasi berhasil dibuat.",
            requestId: result.insertId,
        });
    } catch (error) {
        console.error("Error submitting installation request:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
};

const getAllInstallation = async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT u.name AS user_name, ir.*, sh.name AS house_name, sh.location, sh.status AS house_status
            FROM installation_requests ir
            JOIN swiftlet_house sh ON ir.id_swiftlet_house = sh.id
            JOIN users u ON sh.id_user = u.id
            ORDER BY ir.created_at DESC`
        );

        res.status(200).json(results);
    } catch (error) {
        console.error("Error getting installation requests:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const getAllUninstallation = async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT u.name AS user_name, ur.*, d.floor AS floors, sh.name AS house_name, sh.location, sh.status AS house_status
            FROM uninstallation_requests ur
            JOIN iot_device d ON ur.id_device = d.id
            JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
            JOIN users u ON sh.id_user = u.id
            ORDER BY ur.created_at DESC`
        );

        res.status(200).json(results);
    } catch (error) {
        console.error("Error getting uninstallation requests:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const getAllMaintenance = async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT u.name AS user_name, mr.*, d.floor AS floors, sh.name AS house_name, sh.location, sh.status AS house_status
            FROM maintenance_requests mr
            JOIN iot_device d ON mr.id_device = d.id
            JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
            JOIN users u ON sh.id_user = u.id
            ORDER BY mr.created_at DESC`
        );

        res.status(200).json(results);
    } catch (error) {
        console.error("Error getting maintenance requests:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const getInstallationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [results] = await db.query(
            `SELECT u.name AS user_name, ir.*, sh.name AS house_name, sh.location, sh.status AS house_status
            FROM installation_requests ir
            JOIN swiftlet_house sh ON ir.id_swiftlet_house = sh.id
            JOIN users u ON sh.id_user = u.id
            WHERE ir.id = ?`,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Pengajuan instalasi tidak ditemukan." });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting installation request by ID:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;


        const [results] = await db.query(
            `SELECT u.name AS user_name, mr.*, d.floor AS floors, sh.name AS house_name, sh.location, sh.status AS house_status
            FROM maintenance_requests mr
            JOIN iot_device d ON mr.id_device = d.id
            JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
            JOIN users u ON sh.id_user = u.id
            WHERE mr.id = ?`,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Pengajuan pemeliharaan tidak ditemukan." });
        }

        res.status(200).json(results[0]);
    } catch (error) {

        console.error("Error getting maintenance request by ID:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const getUninstallationById = async (req, res) => {
    try {
        const { id } = req.params;

        const [results] = await db.query(
            `SELECT u.name AS user_name, ur.*, d.floor AS floors, sh.name AS house_name, sh.location, sh.status AS house_status
            FROM uninstallation_requests ur
            JOIN iot_device d ON ur.id_device = d.id
            JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
            JOIN users u ON sh.id_user = u.id
            WHERE ur.id = ?`,
            [id]
        );

        if (results.length === 0) {
            return res.status(404).json({ message: "Pengajuan uninstalasi tidak ditemukan." });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error("Error getting uninstallation request by ID:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const updateInstallationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validasi nilai status
        if (![0, 1, 2, 3, 4, 5, 6].includes(status)) {
            return res.status(400).json({ message: "Status tidak valid." });
        }

        // Update status pengajuan instalasi
        await db.query("UPDATE installation_requests SET status = ? WHERE id = ?", [status, id]);

        res.json({ message: "Status pengajuan instalasi berhasil diperbarui." });
    } catch (error) {
        console.error("Error updating installation request status:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const updateMaintenanceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validasi nilai status
        if (![0, 1, 2, 3, 4, 5, 6].includes(status)) {
            return res.status(400).json({ message: "Status tidak valid." });
        }

        // Update status pengajuan maintenance
        await db.query("UPDATE maintenance_requests SET status = ? WHERE id = ?", [status, id]);

        res.json({ message: "Status pengajuan pemeliharaan berhasil diperbarui." });
    } catch (error) {
        console.error("Error updating maintenance request status:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const updateUninstallationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validasi nilai status
        if (![0, 1, 2, 3, 4, 5, 6].includes(status)) {
            return res.status(400).json({ message: "Status tidak valid." });
        }

        // Update status pengajuan uninstallation
        await db.query("UPDATE uninstallation_requests SET status = ? WHERE id = ?", [status, id]);

        res.json({ message: "Status pengajuan uninstalasi berhasil diperbarui." });
    } catch (error) {
        console.error("Error updating uninstallation request status:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
}

const requestMaintenance = async (req, res) => {
    try {
        const { id_device, reason, appointment_date } = req.body;

        if (!id_device || !reason || !appointment_date) {
            return res.status(400).json({ message: "Semua bagian harus diisi." });
        }

        const [result] = await db.query(
            `INSERT INTO maintenance_requests (id_device, reason, appointment_date, status)
            VALUES (?, ?, ?, 0)`, // Status default = 0 (pending)
            [id_device, reason, appointment_date]
        );

        res.status(201).json({
            message: "Pengajuan pemeliharaan berhasil dibuat.",
            requestId: result.insertId,
        });
    } catch (error) {
        console.error("Error submitting maintenance request:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
};

const requestUninstallation = async (req, res) => {
    try {
        const { id_device, reason, appointment_date } = req.body;

        if (!id_device || !reason || !appointment_date) {
            return res.status(400).json({ message: "Semua bagian harus diisi." });
        }

        const [result] = await db.query(
            `INSERT INTO uninstallation_requests (id_device, reason, appointment_date, status)
            VALUES (?, ?, ?, 0)`, // Status default = 0 (pending)
            [id_device, reason, appointment_date]
        );

        res.status(201).json({
            message: "Pengajuan uninstalasi berhasil dibuat.",
            requestId: result.insertId,
        });
    } catch (error) {
        console.error("Error submitting uninstallation request:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
};

const getTrackingData = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "ID pengguna dibutuhkan." });
        }

        const installationQuery = `
            SELECT 
                ir.id, 
                ir.id_swiftlet_house AS houseId, 
                sh.name AS house_name,
                ir.appointment_date, 
                ir.floors, 
                ir.status, 
                'installation' AS type, 
                ir.created_at
            FROM installation_requests ir
            JOIN swiftlet_house sh ON ir.id_swiftlet_house = sh.id
            WHERE sh.id_user = ?
            ORDER BY ir.created_at DESC
        `;

        const maintenanceQuery = `
            SELECT 
                mr.id, 
                mr.id_device AS deviceId, 
                d.floor AS floors, 
                sh.name AS house_name,
                mr.reason, 
                mr.appointment_date, 
                mr.status, 
                'maintenance' AS type, 
                mr.created_at
            FROM maintenance_requests mr
            JOIN iot_device d ON mr.id_device = d.id
            JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
            WHERE sh.id_user = ?
            ORDER BY mr.created_at DESC
        `;

        const uninstallationQuery = `
            SELECT 
                ur.id, 
                ur.id_device AS deviceId, 
                d.floor AS floors, 
                sh.name AS house_name,
                ur.reason, 
                ur.appointment_date, 
                ur.status, 
                'uninstallation' AS type, 
                ur.created_at
            FROM uninstallation_requests ur
            JOIN iot_device d ON ur.id_device = d.id
            JOIN swiftlet_house sh ON d.id_swiftlet_house = sh.id
            WHERE sh.id_user = ?
            ORDER BY ur.created_at DESC
        `;

        const [installations] = await db.query(installationQuery, [userId]);
        const [maintenances] = await db.query(maintenanceQuery, [userId]);
        const [uninstallations] = await db.query(uninstallationQuery, [userId]);

        const trackingData = [
            ...installations,
            ...maintenances,
            ...uninstallations,
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by created_at descending

        res.json(trackingData);
    } catch (error) {
        console.error("Error fetching tracking data:", error);
        res.status(500).json({ message: "Gagal mendapatkan data perkembangan." });
    }
};

const cancelRequest = async (req, res) => {
    const { id } = req.params; // The request ID
    const { type } = req.body; // The type (installation, maintenance, uninstallation)

    // Validate type
    const validTypes = ["instalasi", "pemeliharaan", "uninstalasi"];
    if (!validTypes.includes(type)) {
        return res.status(400).json({ message: "Pengajuan tidak valid." });
    }

    try {
        let tableName;

        // Determine the table name based on type
        if (type === "instalasi") {
            tableName = "installation_requests";
        } else if (type === "pemeliharaan") {
            tableName = "maintenance_requests";
        } else if (type === "uninstalasi") {
            tableName = "uninstallation_requests";
        }

        // Check the current status of the request
        const [currentRequest] = await db.query(`SELECT id, status FROM ${tableName} WHERE id = ?`, [id]);

        if (currentRequest.length === 0) {
            return res.status(404).json({ message: "Pengajuan tidak ditemukan." });
        }

        const { status } = currentRequest[0];

        // Only allow cancellation for statuses 0 (Pending) or 1 (Checking)
        if (status !== 0 && status !== 1 && status !== 6) {
            return res.status(400).json({ message: "Pembatalan tidak bisa dilakukan." });
        }

        // Update the status to "Cancelled" (4)
        const [result] = await db.query(`UPDATE ${tableName} SET status = 4 WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Pembatalan tidak bisa dilakukan.",
            });
        }

        res.status(200).json({ message: "Berhasil membatalkan pengajuan." });
    } catch (error) {
        console.error("Error cancelling request:", error);
        res.status(500).json({ message: "Peladen mengalami galat." });
    }
};

const rescheduleRequest = async (req, res) => {
    try {
        const { id, type, appointment_date } = req.body;

        if (!id || !type || !appointment_date) {
            return res.status(400).json({ message: "Semua bagian harus diisi." });
        }

        let table;
        if (type === "installation") {
            table = "installation_requests";
        } else if (type === "maintenance") {
            table = "maintenance_requests";
        } else if (type === "uninstallation") {
            table = "uninstallation_requests";
        } else {
            return res.status(400).json({ message: "Pengajuan tidak valid." });
        }

        const query = `UPDATE ${table} SET appointment_date = ?, status = 0 WHERE id = ?`;
        const [result] = await db.query(query, [appointment_date, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pengajuan tidak ditemukan." });
        }

        res.status(200).json({ message: "Berhasil menjadwalkan ulang pengajuan." });
    } catch (error) {
        console.error("Error rescheduling request:", error);
        res.status(500).json({ message: "Gagal menjadwalkan ulang pengajuan." });
    }
};



module.exports = {
    addSwiftletHouse,
    getAllInstallation,
    getAllUninstallation,
    getAllMaintenance,
    getInstallationById,
    getMaintenanceById,
    getUninstallationById,
    updateInstallationStatus,
    updateMaintenanceStatus,
    updateUninstallationStatus,
    requestInstallation,
    requestMaintenance,
    requestUninstallation,
    getTrackingData,
    cancelRequest,
    rescheduleRequest
};
