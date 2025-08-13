const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the build directory
app.use(express.static('build'));

// Handle React Router - send all requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
