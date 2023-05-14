const express = require('express');
const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:4000',
  clientID: 'F08wheiLVFiv8XKGsBI5tp8p6cqoLN2J',
  issuerBaseURL: 'https://dev-4dyl6nqbktqkege5.au.auth0.com'
};

module.exports = { config }