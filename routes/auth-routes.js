const router = require('express').Router();
const passport = require('passport');

router.get("/google", passport.authenticate("google"));
router.get("/accepted", passport.authenticate("google", {
    successRedirect: "/setcookie",
    failureRedirect: "/?email=notUCD"
  }));

module.exports = router;