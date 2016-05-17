
var express = require('express');

var site = require('./controller/site');
var sign = require('./controller/sign');

var router = express.Router();

// home page
router.get('/', site.index);

router.get('/signup', sign.showSignup);
router.post('/signup', sign.signup);

module.exports = router;