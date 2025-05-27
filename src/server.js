const express = require('express');
const discussions = require('./routes/discussions');

const app = express();

app.use(express.json());
app.use('/discussions', discussions);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
