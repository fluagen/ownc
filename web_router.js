
var express = require('express');

var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });

var auth = require('./middleware/auth');

var site = require('./controller/site');
var sign = require('./controller/sign');
var topic = require('./controller/topic');
var reply = require('./controller/reply');

var router = express.Router();

// home page
router.get('/', site.index);

router.get('/signup', sign.showSignup);
router.post('/signup', sign.signup);
router.get('/signin', sign.showLogin);
router.post('/signin', sign.login);


router.get('/topic/create', auth.userRequired, topic.create);
router.post('/topic/create', auth.userRequired, topic.put);
router.get('/topic/:tid', topic.index);

router.post('/:tid/reply', auth.userRequired, reply.add);
router.get('/reply/:reply_id/edit', auth.userRequired, reply.showEdit);
router.post('/reply/:reply_id/edit', auth.userRequired, reply.update);

router.post('/upload', upload.single('file_image'), site.upload);

module.exports = router;