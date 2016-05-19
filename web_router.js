
var express = require('express');

var site = require('./controller/site');
var sign = require('./controller/sign');
var topic = require('./controller/topic');

var router = express.Router();

// home page
router.get('/', site.index);

router.get('/signup', sign.showSignup);
router.post('/signup', sign.signup);
router.get('/signin', sign.showLogin);
router.post('/signin', sign.login);


router.get('/topic/create', topic.create);
router.post('/topic/create', topic.put);
router.get('/topic/:tid', topic.index);

module.exports = router;