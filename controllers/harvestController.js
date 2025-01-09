const db = require("../config/db");

exports.addHarvest = async (req, res) => {
    const { user_id, floors } = req.body;

    try {
        const harvestInsertPromises = floors.map((floor) =>
            db.query(
                `INSERT INTO harvests (user_id, floor, bowl, oval, corner, broken, ideal_bowl, ideal_oval, ideal_corner, ideal_broken) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id,
                    floors.indexOf(floor) + 1,
                    floor.bowl,
                    floor.oval,
                    floor.corner,
                    floor.broken,
                    floor.ideal_bowl,
                    floor.ideal_oval,
                    floor.ideal_corner,
                    floor.ideal_broken,
                ]
            )
        );
        await Promise.all(harvestInsertPromises);

        res.status(201).json({ message: "Harvest added successfully" });
    } catch (error) {
        console.error("Error adding harvest:", error);
        res.status(500).json({ error: "Failed to add harvest" });
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
        res.status(500).json({ error: "Failed to fetch harvests" });
    }
};
