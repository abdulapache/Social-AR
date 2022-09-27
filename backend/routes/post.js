const express = require('express');
const { createPost, likeAndUnlikePost, deletePost, getPostOffFollowing, updateCaption, addComment, deleteComment } = require('../controller/post.js');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.route('/post/upload').post(isAuthenticated,createPost)

router.route('/post/:id')
.get(isAuthenticated, likeAndUnlikePost)
.put(isAuthenticated, updateCaption)
.delete(isAuthenticated, deletePost)

router.route('/post').get(isAuthenticated, getPostOffFollowing)
router.route('/add/comment/:id').put(isAuthenticated, addComment).delete(isAuthenticated, deleteComment)
router.route

module.exports = router;