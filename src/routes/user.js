const router = require('express').Router();
const {User} = require('../handler')
const handler = new User();

router.post("/signup", handler.signup);
router.post("/login", handler.login);
router.put("/user/:id", handler.updateUser);
router.get("/user", handler.getAllUsers);

module.exports = router;