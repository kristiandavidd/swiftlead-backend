const express = require('express');
const router = express.Router();
const { getAllUser } = require('../controllers/userController');

router.get('/', getAllUser);

router.get('/:id', (req, res) => {
    const user = users.find(user => user.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).send('The user with the given ID was not found');
    }
    res.json(user);
});

router.post('/', (req, res) => {
    const newUser = {
        id: users.length + 1,
        username: req.body.username,
        email: req.body.email,
    };
    users.push(newUser);
    res.json(newUser);
});

router.put('/:id', (req, res) => {
    const user = users.find(user => user.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).send('The user with the given ID was not found');
    }
    user.username = req.body.username;
    user.email = req.body.email;
    res.json(user);
});

router.delete('/:id', (req, res) => {
    const user = users.find(user => user.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).send('The user with the given ID was not found');
    }
    const index = users.indexOf(user);
    users.splice(index, 1);
    res.json(user);
});

module.exports = router;



