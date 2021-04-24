/**
 * author: Viet Ngo
 */
var express = require("express");
var router = express.Router();
const { requireLogin, isAuth, userById } = require("../controllers/user");
const { create } = require("../controllers/subscribe");

router.get("", (req, res) => {
  res.render("subscribe");
});

router.get("/history", (req, res) => {
  res.render("subscribe_history");
});

router.post("/create/:userId", requireLogin, isAuth, create);

router.param("userId", userById);

//functions

//======
module.exports = router;
