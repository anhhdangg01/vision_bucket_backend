const express = require('express');
const router = express.Router();

//getting all discussions
router.get('/', (req, res) => {
    res.send('Getting all discussions');
})
//getting one discussion
router.get('/:id', (req, res) => {
})
//posting a discussion
router.post('/:id', (req, res) => {
})
//deleting a discussion
router.delete('/:id', (req, res) => {
})
//updating a discussion
router.patch('/', (req, res) => { // maybe use patch instead of update
})



//posting a comment

module.exports = router