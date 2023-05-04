const { getDivCards } = require('../models/divCards');

const homeView = async (req, res) => {
  // Get all the divcards and their respective price data
  const divCards = await getDivCards();

  res.render('index', { data: divCards });
}

module.exports = {
  homeView
}