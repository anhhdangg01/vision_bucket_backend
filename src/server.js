const express = require('express');
const discussionsRouter = require('./routes/discussions');

const app = express();

app.use(express.json());
app.use('/discussions', discussionsRouter);

app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
