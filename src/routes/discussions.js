// routes/discussions.js
const express = require('express');
const router = express.Router();
const { db, collection, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion, deleteDoc } = require('../firebase'); // Use db from firebase.js

// GET http://localhost:5000/discussions/posts (fetches all ID, author, date, title, description)
router.get('/posts', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "Disc_Posts"));
        const posts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                uid: data.uid,
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

// GET http://localhost:5000/discussions/post/KuEuWrfkqHDDMpDY1KqH <- fetches a specific post by ID
router.get('/post/:docId', async (req, res) => {
  try {
    const docId = req.params.docId;
    console.log("Fetching document with ID:", docId);
    
    const docRef = doc(db, "Disc_Posts", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.status(200).json({
      id: docSnap.id,
      ...docSnap.data()
    });
    
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// POST http://localhost:5000/discussions/posting
// Content-Type: application/json

// {
//   "Author": "John Doe",
//   "uid": "KuEuWrfkqHDDMpDY1KqH", // optional, can be added for user tracking
//   "Date": "20250603",
//   "Comments": [
//     {
//     }
//   ],
//   "Title": "New Discussion Topic",
//   "Description": "This is a description of the new discussion topic."
// }


router.post('/posting', async (req, res) => {
  try {
    const { Author, uid, Date, Comments, Title, Description } = req.body;

    // Validate required fields
    if (!Author || !uid || !Date || !Title || !Description) {
      return res.status(400).json({ error: "All fields (Author, Date, Title, Description) are required" });
    }

    // Add a new document to the collection
    const newPost = {
      Author,
      uid,
      Date,
      Comments: Comments || [], // Use provided Comments array or default to empty array
      Title,
      Description
    };

    const docRef = await addDoc(collection(db, "Disc_Posts"), newPost);

    res.status(201).json({ message: "Post created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// POST http://localhost:5000/discussions/post/:docId/comment
router.post('/post/:docId/comment', async (req, res) => {
  try {
    const docId = req.params.docId;
    const { author, uid, content, date } = req.body;
    if (!author || !content || !date) {
      return res.status(400).json({ error: "Author, content, and date are required for comments" });
    }
    const docRef = doc(db, "Disc_Posts", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Discussion post not found" });
    }
    const newComment = {
      author,
      uid,
      content,
      date,
      commentId: Date.now().toString() // Unique identifier for the comment
    };
    await updateDoc(docRef, {
      Comments: arrayUnion(newComment)
    });
    res.status(201).json({ 
      message: "Comment added successfully",
      comment: newComment 
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// DELETE http://localhost:5000/discussions/post/:docId/:uid (deletes a specific post by ID, requires authentication)
router.delete('/post/:docId/:uid', async (req, res) => {
    try {
        const docId = req.params.docId;
        const uid = req.params.uid;

        // Validate that docId and uid are provided
        if (!docId || !uid) {
            return res.status(400).json({ error: "Document ID and User ID are required" });
        }

        const docRef = doc(db, "Disc_Posts", docId);
        const docSnap = await getDoc(docRef);

        // Check if the document exists
        if (!docSnap.exists()) {
            return res.status(404).json({ error: "Discussion post not found" });
        }

        // Check if the user ID matches the post's user ID
        if (docSnap.data().uid !== uid) {
            return res.status(403).json({ error: "Unauthorized: You are not allowed to delete this post" });
        }

        // Delete the document
        await deleteDoc(docRef);

        res.status(200).json({ message: "Discussion post deleted successfully" });

    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: "Failed to delete discussion post" });
    }
});

// DELETE http://localhost:5000/discussions/comment/:docId/:commentId/:uid (deletes a specific comment by ID, requires authentication)
router.delete('/comment/:docId/:commentId/:uid', async (req, res) => {
    try {
        const docId = req.params.docId;
        const commentId = req.params.commentId;
        const uid = req.params.uid;

        // Validate that docId, commentId, and uid are provided
        if (!docId || !commentId || !uid) {
            return res.status(400).json({ error: "Document ID, Comment ID, and User ID are required" });
        }

        const docRef = doc(db, "Disc_Posts", docId);
        const docSnap = await getDoc(docRef);

        // Check if the document exists
        if (!docSnap.exists()) {
            return res.status(404).json({ error: "Discussion post not found" });
        }

        const comments = docSnap.data().Comments;
        if (!comments) {
            return res.status(404).json({ error: "No comments found for this post" });
        }

        // Find the comment to delete
        const commentIndex = comments.findIndex(comment => comment.commentId === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ error: "Comment not found" });
        }

        // Check if the user ID matches the comment's user ID
        if (comments[commentIndex].uid !== uid) {
            return res.status(403).json({ error: "Unauthorized: You are not allowed to delete this comment" });
        }

        // Remove the comment from the array
        comments.splice(commentIndex, 1);

        // Update the document with the modified comments array
        await updateDoc(docRef, { Comments: comments });

        res.status(200).json({ message: "Comment deleted successfully" });

    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
});

// delete a post by ID (auth)

module.exports = router;