const express = require('express');
const {
    addSwiftletHouse,
    requestInstallation,
    getAllInstallation,
    getAllMaintenance,
    getAllUninstallation,
    getInstallationById,
    getMaintenanceById,
    getUninstallationById,
    updateInstallationStatus,
    updateMaintenanceStatus,
    updateUninstallationStatus,
    requestMaintenance,
    requestUninstallation,
    getTrackingData,
    cancelRequest,
    rescheduleRequest
} = require('../controllers/requestController');
const router = express.Router();

// Route untuk mendapatkan data swiftlet house dan floor
router.post('/add', addSwiftletHouse);
router.post("/installation", requestInstallation);
router.post("/uninstallation", requestUninstallation);
router.post("/maintenance", requestMaintenance);
router.get("/installation", getAllInstallation);
router.get("/uninstallation", getAllUninstallation);
router.get("/maintenance", getAllMaintenance);
router.get("/installation/:id", getInstallationById);
router.get("/uninstallation/:id", getUninstallationById);
router.get("/maintenance/:id", getMaintenanceById);
router.put("/installation/:id/status", updateInstallationStatus);
router.put("/maintenance/:id/status", updateMaintenanceStatus);
router.put("/uninstallation/:id/status", updateUninstallationStatus);
router.get("/tracking/:userId", getTrackingData);
router.put("/reschedule", rescheduleRequest);
router.put("/cancel/:id", cancelRequest);

module.exports = router;
