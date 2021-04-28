var express = require("express");
var router = express.Router();
var Constant = require("../common/constant.js");
var User = require("../models/User.js");

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  requireLogin,
  isAuth,
  userByIdWithProfile,
  profileById,
  profile,
  read,
  changePassword,
  userById,
  update,
} = require("../controllers/user");

router.get("/login", function (req, res, next) {
  const backURL = req.query['backURL'];
  res.render("login", { backURL });
});
router.get("/signup", function (req, res, next) {
  res.render("signup");
});
router.get("/forgot_password", function (req, res, next) {
  res.render("forgot_password");
});
router.get("/reset_password/:token", function (req, res, next) {
  res.locals.token = req.params.token;
  res.render("reset_password");
});
//profile of 1 public user
router.get("/profile/:user_id/:name", function (req, res, next) {
  var user_id = req.params.user_id;
  var user = new User();
  user.findOne(
    { _id: user_id, is_active: { $ne: 0 } },
    "MariedStatus Objective Height Province Picture Degree LookingFor Profile Name Age Weight Sex",
    function (resp_detail) {
      res.render("profile", { data: resp_detail.data });
    }
  );
});
//get latest users
router.get("/same_related_profile", function (req, res, next) {
  //todo check auth
  var marital_code = parseInt(req.query["marital"]);
  if (marital_code == NaN) {
    marital_code = 0;
  }
  var objective_code = parseInt(req.query["objective"]);
  if (objective_code == NaN) {
    objective_code = 0;
  }
  var province_code = parseInt(req.query["province"]);
  if (province_code == NaN) {
    province_code = 0;
  }
  var sex_code = parseInt(req.query["sex"]);
  if (sex_code == NaN) {
    sex_code = 0;
  }
  var final_response = {};
  get_related_users(
    { is_active: { $ne: 0 }, MariedStatus: marital_code },
    function (resp_marital) {
      final_response["marital"] = resp_marital;
      get_related_users(
        { is_active: { $ne: 0 }, Objective: objective_code },
        function (resp_objective) {
          final_response["objective"] = resp_objective;
          get_related_users(
            { is_active: { $ne: 0 }, Province: province_code },
            function (resp_province) {
              final_response["province"] = resp_province;
              get_related_users(
                { is_active: { $ne: 0 }, Sex: sex_code },
                function (resp_sex) {
                  final_response["sex"] = resp_sex;
                  res.rest.success(final_response);
                }
              );
            }
          );
        }
      );
    }
  );
});
//get latest users
router.get("/get_homepage_list", function (req, res, next) {
  //todo check auth
  var page_index = parseInt(req.query["page"]);
  if (isNaN(page_index) || page_index <= 0) {
    page_index = 1;
  }
  page_index = page_index - 1; //query from 0

  var Sex = req.query["Sex"];
  var MariedStatus = req.query["MariedStatus"];
  var Objective = req.query["Objective"];
  var Province = req.query["Province"];
  var AgeFrom = req.query["AgeFrom"];
  var AgeTo = req.query["AgeTo"];
  const conditions = { is_active: { $ne: 0 } };
  if (MariedStatus) {
    conditions.MariedStatus = parseInt(MariedStatus);
  }
  if (Objective) {
    conditions.Objective = parseInt(Objective);
  }
  if (Province) {
    conditions.Province = parseInt(Province);
  }
  if (Sex) {
    conditions.Sex = parseInt(Sex);
  }
  if (AgeFrom || AgeTo) {
    conditions.Age = {
      $gte: parseInt(AgeFrom || 0),
      $lte: parseInt(AgeTo || 100),
    };
  }

  var user = new User();
  user.countDocuments(conditions, function (resp_total) {
    user.search_by_condition(
      conditions,
      {
        limit: Constant.DEFAULT_PAGE_LENGTH,
        skip: page_index * Constant.DEFAULT_PAGE_LENGTH,
      },
      "Picture LookingFor Name Province Age Sex MariedStatus Objective updated_time",
      { updated_time: -1 },
      function (resp) {
        resp["total"] = resp_total.data;
        res.rest.success(resp); //success
      }
    );
  });
});
//get latest users
router.get("/random_user_by_gender", function (req, res, next) {
  //todo check auth
  var gender_code = parseInt(req.query["code"]);
  var MariedStatus = req.query["MariedStatus"];
  var Objective = req.query["Objective"];
  var Province = req.query["Province"];
  if (isNaN(gender_code) || gender_code < 0 || gender_code > 3) {
    gender_code = 1; //default
  }
  const conditions = { is_active: { $ne: 0 }, Sex: gender_code };
  if (MariedStatus) {
    conditions.MariedStatus = parseInt(MariedStatus);
  }
  if (Objective) {
    conditions.Objective = parseInt(Objective);
  }
  if (Province) {
    conditions.Province = parseInt(Province);
  }

  var user = new User();
  user.search_by_condition(
    conditions,
    { limit: 20, skip: Math.round(Math.random() * 800) },
    "Picture LookingFor Name MariedStatus Objective",
    { updated_time: -1 },
    function (resp) {
      res.rest.success(resp); //success
    }
  );
});

/**
 * author: Viet Ngo
 */
//logined profile
router.get("/me", (req, res) => res.render("me"));
router.get("/change_password", (req, res) => res.render("change_password"));

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot_password", forgotPassword);
router.post("/reset_password", resetPassword);
router.get("/profile_data/:profileId/:userByIdWithProfile", profile);
router.get("/me/:userId", requireLogin, isAuth, read);
router.post("/change_password/:userId", requireLogin, isAuth, changePassword);
router.post("/me/:userId", requireLogin, isAuth, update);

router.param("profileId", profileById);
router.param("userByIdWithProfile", userByIdWithProfile);
router.param("userId", userById);

//functions
function get_related_users(params, callback) {
  var user = new User();
  user.search_by_condition(
    params,
    { limit: 8, skip: Math.round(Math.random() * 800) },
    "Picture LookingFor Name",
    { updated_time: -1 },
    function (resp) {
      callback(resp);
    }
  );
}
//======
module.exports = router;
