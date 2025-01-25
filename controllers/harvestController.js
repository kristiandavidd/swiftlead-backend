const db = require("../config/db");
const mysql = require("mysql2/promise");

exports.addHarvest = async (req, res) => {
    try {
        const { userId, swiftletHouseId, postHarvestData } = req.body; // Data yang diterima dari frontend
        console.log(userId, swiftletHouseId, postHarvestData);

        // Cek apakah data yang diperlukan ada
        if (!userId || !swiftletHouseId || !Array.isArray(postHarvestData) || postHarvestData.length === 0) {
            return res.status(400).json({ message: 'Data tidak lengkap atau tidak valid.' });
        }

        // Looping untuk menyimpan data per lantai
        for (let i = 0; i < postHarvestData.length; i++) {
            const floor = i + 1; // Lantai dimulai dari 1
            const {
                bowl: { weight: bowlWeight, pieces: bowlPieces },
                oval: { weight: ovalWeight, pieces: ovalPieces },
                corner: { weight: cornerWeight, pieces: cornerPieces },
                fracture: { weight: brokenWeight, pieces: brokenPieces }
            } = postHarvestData[i];

            // Eksekusi query untuk menyimpan data
            await db.query(
                `INSERT INTO harvests (
                    user_id,
                    swiftlet_house_id,
                    floor,
                    bowl,
                    bowl_pieces,
                    oval,
                    oval_pieces,
                    corner,
                    corner_pieces,
                    broken,
                    broken_pieces
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    userId,
                    swiftletHouseId,
                    floor,
                    bowlWeight,
                    bowlPieces,
                    ovalWeight,
                    ovalPieces,
                    cornerWeight,
                    cornerPieces,
                    brokenWeight,
                    brokenPieces
                ]
            );
        }

        res.status(201).json({
            message: 'Data panen berhasil disimpan.',
        });
    } catch (error) {
        console.error('Error saving harvest data:', error);
        res.status(500).json({ message: 'Terjadi kesalahan saat menyimpan data panen.' });
    }
};




exports.getHarvests = async (req, res) => {
    const { user_id } = req.params;

    try {
        const [result] = await db.query(
            `SELECT * FROM harvests WHERE user_id = ? ORDER BY floor ASC`,
            [user_id]
        );
        res.json(result);
    } catch (error) {
        console.error("Error fetching harvests:", error);
        res.status(500).json({ error: "Gagal dalam mendapatkan hasil panen." });
    }
};
