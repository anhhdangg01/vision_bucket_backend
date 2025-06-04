const express = require('express');
const router = express.Router();
const { db, collection, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion } = require('../firebase');

// GET http://localhost:5000/news/posts (fetches all ID, author, date, title, description)
router.get('/posts', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "News_Posts"));
        const posts = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                Author: data.Author,
                Date: data.Date,
                Title: data.Title,
                Description: data.Description
            };
        });
        
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching documents: ", error);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// GET http://localhost:5000/news/post/:docId
router.get('/post/:docId', async (req, res) => {
  try {
    const docId = req.params.docId;
    console.log("Fetching document with ID:", docId);
    
    const docRef = doc(db, "News_Posts", docId);
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

// POST http://localhost:5000/news/posting
// Content-Type: application/json
// 
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

    if (!Author || !Date || !Title || !Description) {
      return res.status(400).json({ error: "All fields (Author, Date, Title, Description) are required" });
    }

    const newPost = {
      Author,
      Date,
      Comments: Comments || [],
      Title,
      Description
    };

    const docRef = await addDoc(collection(db, "News_Posts"), newPost);

    res.status(201).json({ message: "Post created successfully", id: docRef.id });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// POST http://localhost:5000/news/post/:docId/comment
router.post('/post/:docId/comment', async (req, res) => {
  try {
    const docId = req.params.docId;
    const { author, content, date } = req.body;
    if (!author || !content || !date) {
      return res.status(400).json({ error: "Author, content, and date are required for comments" });
    }
    const docRef = doc(db, "News_Posts", docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return res.status(404).json({ error: "News post not found" });
    }
    const newComment = {
      author,
      content,
      date,
      commentId: Date.now().toString()
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

module.exports = router;