const express = require('express');
const router = express.Router();
const { db, collection, getDocs, query, where, doc, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } = require('../firebase'); // Use db from firebase.js

// Middleware to handle errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// GET http://localhost:5000/profile/data/:uid (fetches user profile data by uid)
router.get('/data/:uid', async (req, res) => {
    try {
        const uid = req.params.uid;
        console.log("Fetching user data with UID:", uid);

        const userRef = doc(db, "Users", uid);
        const docSnap = await getDoc(userRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(docSnap.data());

    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
});

// PUT http://localhost:5000/profile/update/:uid/last_online
router.put('/update/:uid/last_online', asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const { last_online } = req.body;
    if (!last_online) {
        return res.status(400).json({ error: "Last_online is required" });
    }
    const userRef = doc(db, "Users", uid);
    await updateDoc(userRef, { Last_online: new Date(last_online) });
    res.status(200).json({ message: "Last online updated successfully" });
}));

// PUT http://localhost:5000/profile/update/:uid/:status/add_movie
router.put('/update/:uid/:status/add_movie', asyncHandler(async (req, res) => {
    const { uid, status } = req.params;
    const { movieId } = req.body;
    if (!movieId) {
        return res.status(400).json({ error: "MovieId is required" });
    }
    const validStatuses = ['Completed', 'Dropped', 'On_hold', 'Plan_to_watch', 'Rewatched'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }
    const userRef = doc(db, "Users", uid);
    await updateDoc(userRef, { [status]: arrayUnion(movieId) });
    res.status(200).json({ message: "Movie added successfully" });
}));

// PUT http://localhost:5000/profile/update/:uid/:status/remove_movie
router.put('/update/:uid/:status/remove_movie', asyncHandler(async (req, res) => {
    const { uid, status } = req.params;
    const { movieId } = req.body;
    if (!movieId) {
        return res.status(400).json({ error: "MovieId is required" });
    }
    const validStatuses = ['Completed', 'Dropped', 'On_hold', 'Plan_to_watch', 'Rewatched'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }
    const userRef = doc(db, "Users", uid);
    await updateDoc(userRef, { [status]: arrayRemove(movieId) });
    res.status(200).json({ message: "Movie removed successfully" });
}))


// PUT http://localhost:5000/profile/update/:uid/add_review
router.put('/update/:uid/add_review', asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const { reviewId } = req.body;
    if (!reviewId) {
        return res.status(400).json({ error: "ReviewId is required" });
    }
    const userRef = doc(db, "Users", uid);
    await updateDoc(userRef, { reviews: arrayUnion(reviewId) });
    res.status(200).json({ message: "Review added successfully" });
}));

// PUT http://localhost:5000/profile/update/:uid/remove_review
router.put('/update/:uid/remove_review', asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const { reviewId } = req.body;
    if (!reviewId) {
        return res.status(400).json({ error: "ReviewId is required" });
    }
    const userRef = doc(db, "Users", uid);
    await updateDoc(userRef, { reviews: arrayRemove(reviewId) });
    res.status(200).json({ message: "Review removed successfully" });
}));

// POST http://localhost:5000/profile/create/:uid
router.post('/create/:uid', asyncHandler(async (req, res) => {
    const { uid } = req.params;
    const userData = req.body;

    try {
        await setDoc(doc(db, "Users", uid), userData);
        console.log("Document written with ID: ", uid);
        res.status(201).json({ message: "User created successfully", uid: uid });
    } catch (e) {
        console.error("Error adding document: ", e);
        res.status(500).json({ error: "Failed to create user" });
    }
}));

module.exports = router;