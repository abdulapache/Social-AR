const express = require('express');
const { register, login, followUser, logout, updatePassword, updateProfile, deleteUser, myProfile, userProfile, allUser, forgetPassword, resetPassword } = require('../controller/user');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/follow/:id").get(isAuthenticated, followUser)
router.route("/logout").get(logout)
router.route("/update/password").put(isAuthenticated, updatePassword)
router.route("/update/profile").put(isAuthenticated, updateProfile)
router.route("/delete/me").delete(isAuthenticated, deleteUser)
router.route("/profile/me").get(isAuthenticated, myProfile)
router.route("/user/profile/:id").get(isAuthenticated, userProfile)
router.route("/all/user").get(isAuthenticated, allUser)
router.route("/forget/password").post(forgetPassword)

router.route("/password/reset/:token").put(resetPassword)
module.exports = router