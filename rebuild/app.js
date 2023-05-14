// Import Modules
const express = require('express')
require('dotenv').config()
const PORT = Number(process.env.PORT)
const { auth } = require('express-openid-connect')

// Init app and set view engine
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('views'))
const { config } = require('./config/auth')

// Import Routes
const home = require('./routes/home')

// Auth0
app.use(auth(config))

app.use('/', home)

app.listen(PORT, () => {
  console.log(`POE Flipping Assistant Server listening on port ${PORT}`)
})