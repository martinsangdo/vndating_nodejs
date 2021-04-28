/**
 * author: Viet Ngo
 */
var express = require("express");
var router = express.Router();
const { requireLogin, isAuth, userById } = require("../controllers/user");
const { create, list } = require("../controllers/subscribe");

router.get("", (req, res) => {
  const backURL = req.query['backURL'];
  res.render("subscribe", { backURL });
});

router.get("/history", (req, res) => {
  res.render("subscribe_history");
});

router.post("/create/:userId", requireLogin, isAuth, create);
router.get("/list/:userId", requireLogin, isAuth, list);

router.param("userId", userById);

//functions

//======
module.exports = router;
