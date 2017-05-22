'use strict';

var express = require('express');
var controller = require('./post.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/', controller.recent);
//Show recent posts for a logged in user
router.get('/logged', auth.isAuthenticated(), controller.recentLoggedIn);
//Show posts for a specific user
router.get('/user/:id', controller.showUser);
//Show posts for a specific user while logged in
router.get('/userlogged/:id', auth.isAuthenticated(), controller.showLoggedUser);
//Like a post
router.put('/like/:id', auth.isAuthenticated(), controller.likePost);
//Repost a post
router.put('/repost/:id', auth.isAuthenticated(), controller.repostPost);
router.post('/', auth.isAuthenticated(), controller.create);
//Delete if Own
router.delete('/:id', auth.isAuthenticated(), controller.markDelete);

module.exports = router;
