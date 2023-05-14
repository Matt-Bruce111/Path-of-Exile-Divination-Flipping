// Import Modules
const express = require('express');
const router = express.Router();

// Import div model
const { getDivCards } = require('../models/divCards');

router.get('/', async (req, res) => {
  // Get all the divcards and their respective price data
  const divCards = await getDivCards();

  // Log whether the user is logged in or not
  console.log(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
  var user = req.oidc.user
  //console.log(req.oidc.user)

  // Render the index page with the divcards and the user's login status
  res.render('index', { 
    data: divCards,
    isAuthenticated: req.oidc.isAuthenticated(),
    user: user 
  });
});

// Exports
module.exports = router;