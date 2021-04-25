/**
 * author: Viet Ngo
 */
var express = require("express");
var router = express.Router();

router.get("", (req, res) => {
  res.render("search");
});

//functions

//======
module.exports = router;
