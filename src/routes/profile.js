const express = require('express');
const router = express.Router();
const { db, collection, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion } = require('../firebase'); // Use db from firebase.js

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

module.exports = router;