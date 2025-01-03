const express = require('express');
const router = express.Router();
const {
    getAllUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    updateUserStatus,
    getUserById
} = require('../controllers/userController');


router.get('/', getAllUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/role', updateUserRole);
router.put('/:id/membership', updateUserStatus);
router.get('/:id', getUserById);

module.exports = router;



