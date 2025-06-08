const express = require('express');
const router = express.Router();
const { db, collection, getDoc, doc, addDoc, updateDoc, deleteDoc } = require('../firebase');

// POST http://localhost:5000/reviews/posting
router.post('/posting', async (req, res) => {
    try {
        const { movieId, Author, content, rating, uid } = req.body;

        // Validate input
        if (!movieId || !Author || !content || !rating || !uid) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Create new review object
        const newReview = {
            movieId: parseInt(movieId), // Ensure movieId is an integer
            date: new Date().toISOString(), // Store the current date
            Author,
            content,
            rating: parseInt(rating), // Ensure rating is an integer
            uid
        };

        // Add the new review to the "Reviews" collection
        const docRef = await addDoc(collection(db, "Reviews"), newReview);

        res.status(201).json({ message: "Review added successfully", id: docRef.id, review: newReview });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Failed to add review" });
    }
});

// DELETE /reviews/:docId/:uid - Delete a review if uid matches
router.delete('/:docId/:uid', async (req, res) => {
    const { docId, uid } = req.params;
    try {
        const reviewRef = doc(db, "Reviews", docId);
        const reviewSnap = await getDoc(reviewRef);

        if (!reviewSnap.exists()) {
            return res.status(404).json({ error: "Review not found" });
        }

        const reviewData = reviewSnap.data();
        if (reviewData.uid !== uid) {
            return res.status(403).json({ error: "Unauthorized: UID does not match" });
        }

        await deleteDoc(reviewRef);
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Failed to delete review" });
    }
});

// PATCH /reviews/:docId/:uid - Update content and rating if uid matches
router.patch('/:docId/:uid', async (req, res) => {
    const { docId, uid } = req.params;
    const { content, rating } = req.body;
    try {
        const reviewRef = doc(db, "Reviews", docId);
        const reviewSnap = await getDoc(reviewRef);

        if (!reviewSnap.exists()) {
            return res.status(404).json({ error: "Review not found" });
        }

        const reviewData = reviewSnap.data();
        if (reviewData.uid !== uid) {
            return res.status(403).json({ error: "Unauthorized: UID does not match" });
        }

        const updateData = {};
        if (content !== undefined) updateData.content = content;
        if (rating !== undefined) updateData.rating = parseInt(rating);

        await updateDoc(reviewRef, updateData);
        res.status(200).json({ message: "Review updated successfully" });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ error: "Failed to update review" });
    }
});

module.exports = router;