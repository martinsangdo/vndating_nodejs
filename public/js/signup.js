/**
 * author: Viet Ngo
 Manage signup
 */
//========== CLASS
function Signup() { }

//post signup data
Signup.prototype.postSignup = function () {
    const form = $('#form-signup')
    let params = getFormData(form);
    const {LastName, FirstName, Email, Password, RePassword} = params
    //validate params
    if (!LastName 
        || !FirstName
        || !Email
        || !Password
        || !RePassword) {
            toastr.error('Please enter all required fields!')
            return false;
    }
    if (!common.isValidEmail(Email)) {
        toastr.error('Invalid email!')
        return false;
    }
    if (Password.length < 8) {
        toastr.error('Password must have at least 8 characters!')
        return false;
    }
    if (Password != RePassword) {
        toastr.error('Password and Re-password are not match!')
        return false;
    }

    params.rePassword = undefined
    params.Name = FirstName + LastName
    common.ajaxPost(API_URI.POST_SIGNUP, params, function(resp){
        if (resp.message == CONST.OK_CODE && resp.data != null){
            //cache the data of 500 users??? dont need, usually they always looking for new person
            common.redirect(API_URI.HOME_LIST)
        } else {

        }
    });
};

function getFormData($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

//==========
var signup = new Signup();		//global object
