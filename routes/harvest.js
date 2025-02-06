const express = require("express");
const router = express.Router();
const { addHarvest, getHarvests } = require("../controllers/harvestController");

router.post("/", addHarvest); 
router.get("/:user_id", getHarvests); 

module.exports = router;
