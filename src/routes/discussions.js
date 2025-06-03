// routes/discussions.js
const express = require('express');
const router = express.Router();
const { db, collection, getDocs, doc, getDoc } = require('../firebase.js'); // Import doc and getDoc

// GET http://localhost:5000/discussions/posts (fetches all ID, author, date, title, description)
router.get('/posts', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "Disc_Posts"));
        const posts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                Author: data.Author,   // Author name
                Date: data.Date,       // Post date
                Title: data.Title,      // Post title
                Description: data.Description // Post description
            };
        });
        
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching documents: ", error);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// GET http://localhost:5000/discussions/post/:postId
router.get('/post/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    
    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    const docRef = doc(db, "Disc_Posts", postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.status(200).json({
      id: docSnap.id,
      Title: docSnap.data().Title,
      Description: docSnap.data().Description,
      Author: docSnap.data().Author,
      Date: docSnap.data().Date
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});
module.exports = router;