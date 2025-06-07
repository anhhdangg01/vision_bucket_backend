const express = require('express');
const router = express.Router();
const { db, collection, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion } = require('../firebase'); // Use db from firebase.js

// CREATE http://localhost:5000/profile/data (creates a new user profile data)

// GET http://localhost:5000/profile/data (fetches all user profile data)
router.get('/data', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "Users"));
        const profile = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                Data: data.Data,
                Last_online: data.Last_online,
                Joined: data.Joined,
                Username: data.Username
            };
        });

        res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({error: "Failed to fetch user data"});
    }
});

// // UPDATE http://localhost:5000/profile/data:id (updates an existing user profile data)
// router.patch('/data/:id', async (req, res) => {
//     if (req.body.Username != null) {
//         res.data.Username = req.body.Username
//     }
//     if (req.body.Last_online != null) {
//         res.data.Last_online = req.body.Last_online
//     }
//     try {
//         const querySnapshot = await getDocs(collection(db, "Users"));
//         const profile = querySnapshot.docs.
//         const updatedUserData = await res.user_data.save()
//         res.json(updatedUserData)
//     } catch (error) {
//         res.status(400).json({ message: error.message})
//     }
// })

// DELETE http://localhost:5000/profile/data/:id (deletes the selected user data based on ID)
// router.delete('/data/id', async (req, res) => {
//     try {
//         profile = await 
//     } catch {

//     }
// })

module.exports = router;