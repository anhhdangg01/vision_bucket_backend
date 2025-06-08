const express = require('express');
const cors = require('cors');
const discussionsRouter = require('./routes/discussions');
const newsRouter = require('./routes/news');
const profileRouter = require('./routes/profile');
const reviewsRouter = require('./routes/reviews'); // Import the reviews router

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000' // Replace with your frontend's origin
};

app.use(cors(corsOptions)); // Enable CORS for specific origin
app.use(express.json());
app.use('/discussions', discussionsRouter);
app.use('/news', newsRouter);
app.use('/profile', profileRouter);
app.use("/reviews", reviewsRouter); 

app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
