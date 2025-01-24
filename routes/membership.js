const express = require('express');
const router = express.Router();
const {
    getMemberships,
    getEligibleUsers,
    addMembership,
    deleteMembership,
    updateMembership,
    getMembershipById,
    getMembershipStatusById
} = require('../controllers/membershipController');

router.get('/', getMemberships);
router.get('/eligible-users', getEligibleUsers);
router.post('/', addMembership);
router.delete('/:id', deleteMembership);
router.put('/:id', updateMembership);
router.get('/:id', getMembershipById);
router.get('/user/:id', getMembershipStatusById);

module.exports = router;
