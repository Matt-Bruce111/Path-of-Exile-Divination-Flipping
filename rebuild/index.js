// Import Modules
const express = require('express');
const PORT = process.env.PORT || 4000;

// Init app and set view engine
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('views'));

// Import Routes
const home = require('./routes/home');

app.use('/', home);

app.listen(PORT, () => {
  console.log(`POE Div-Flip Server listening on port ${PORT}`);
});