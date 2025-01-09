const express = require("express");
const router = express.Router();
const { addHarvest, getHarvests } = require("../controllers/harvestController");

router.post("/", addHarvest); // Add harvest
router.get("/:user_id", getHarvests); // Get harvests for a user

module.exports = router;
