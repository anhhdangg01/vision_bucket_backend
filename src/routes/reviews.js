const express = require('express');
const router = express.Router();
const { db, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where } = require('../firebase');

// POST http://localhost:5000/reviews/post
router.post('/post', async (req, res) => {
    try {
        const { movieId, author, content, rating, uid } = req.body;

        // Validate input
        if (!movieId || !author || !content || !rating || !uid) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Create new review object
        const newReview = {
            movieId: parseInt(movieId), // Ensure movieId is an integer
            author,
            content,
            rating: parseInt(rating), // Ensure rating is an integer
            uid
        };

        // Add the new review to the "Reviews" collection
        const docRef = await addDoc(collection(db, "Reviews"), newReview);

        // Respond with success message and the new review data
        res.status(201).json({ message: "Review added successfully", reviewId: docRef.id, review: newReview });

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ error: "Failed to add review" });
    }
});

// GET http://localhost:5000/reviews/movie/:movieId
router.get('/movie/:movieId', async (req, res) => {
    try {
        const movieId = parseInt(req.params.movieId);

        if (isNaN(movieId)) {
            return res.status(400).json({ error: "Invalid Movie ID" });
        }

        const reviewsRef = collection(db, "Reviews");
        const q = query(reviewsRef, where("movieId", "==", movieId));
        const querySnapshot = await getDocs(q);

        const reviews = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(reviews);

    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// PUT http://localhost:5000/reviews/update/:reviewId
router.put('/update/:reviewId', async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const { content, rating } = req.body;

        // Validate input
        if (!content || !rating) {
            return res.status(400).json({ error: "Content and rating are required for updates" });
        }

        const reviewRef = doc(db, "Reviews", reviewId);
        const reviewSnap = await getDoc(reviewRef);

        if (!reviewSnap.exists()) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Update the review
        await updateDoc(reviewRef, {
            content,
            rating: parseInt(rating)
        });

        res.status(200).json({ message: "Review updated successfully" });

    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ error: "Failed to update review" });
    }
});

// DELETE http://localhost:5000/reviews/delete/:reviewId/:uid
router.delete('/delete/:reviewId/:uid', async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const uid = req.params.uid;

        // Validate input
        if (!reviewId || !uid) {
            return res.status(400).json({ error: "Review ID and User ID are required" });
        }

        const reviewRef = doc(db, "Reviews", reviewId);
        const reviewSnap = await getDoc(reviewRef);

        if (!reviewSnap.exists()) {
            return res.status(404).json({ error: "Review not found" });
        }

        // Verify user ownership
        if (reviewSnap.data().uid !== uid) {
            return res.status(403).json({ error: "Unauthorized: You are not allowed to delete this review" });
        }

        // Delete the review
        await deleteDoc(reviewRef);

        res.status(200).json({ message: "Review deleted successfully" });

    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ error: "Failed to delete review" });
    }
});

module.exports = router;