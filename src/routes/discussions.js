// routes/discussions.js
const express = require('express');
const router = express.Router();
const { db, collection, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion } = require('../firebase'); // Use db from firebase.js

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
    const { Author, Date, Comments, Title, Description } = req.body;

    // Validate required fields
    if (!Author || !Date || !Title || !Description) {
      return res.status(400).json({ error: "All fields (Author, Date, Title, Description) are required" });
    }

    // Add a new document to the collection
    const newPost = {
      Author,
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
    const { author, content, date } = req.body;

    // Validate required fields
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

// delete a post by ID (auth)
module.exports = router;