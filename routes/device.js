const express = require('express');
const {
    getAllDevices,
    getDeviceData,
    generateCode,
    addDevice,
    updateStatusDevice,
    deleteDevice,
    getUserHousesAndDevices,
    deleteHouse,
    editHouse,
    updateDevice,
    getDeviceDataByDeviceId
} = require('../controllers/deviceController');
const router = express.Router();

// Route untuk mendapatkan data swiftlet house dan floor
router.get("/generate-code", generateCode);
router.get('/user/:userId', getDeviceData);
router.get("/:id", getDeviceDataByDeviceId);
router.put("/update/:deviceId/status", updateStatusDevice);
router.delete("/delete/:deviceId", deleteDevice);
router.put("/update/:id", updateDevice);
router.get("/", getAllDevices);

router.post("/", addDevice);
router.get("/house/:userId", getUserHousesAndDevices);
router.delete("/house/:houseId", deleteHouse);
router.put("/house/:houseId", editHouse);



module.exports = router;
