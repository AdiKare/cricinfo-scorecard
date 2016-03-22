'use strict';

var express = require('express');
var controller = require('./classify.controller');

var router = express.Router();

router.post('/', controller.index);
router.post('/tweets', controller.classifyTweets);

module.exports = router;
