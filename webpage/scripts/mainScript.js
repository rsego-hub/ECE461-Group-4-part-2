
exports.admin_check = exports.go_to_login = void 0;

//const imported_func = exports.imported_func;

/**
 * placeholder
 */
function performSearch() {

}

/**
 * placeholder
 */
function uploadFile() {

}

/**
 * check if current user is admin
 * @returns 
 */
function admin_check() {

    // Check if user is an admin
    var isAdmin = Boolean(sessionStorage.getItem("isAdmin")=="true");
    if(!isAdmin) {
        return
    }
    window.location.href = "register.html";
}
exports.admin_check = admin_check;

/**
 * redirect to login page
 */
function go_to_login() {
    window.location.href = "login.html";
}
exports.go_to_login = go_to_login;


// ------------------ Main Script ------------------------------

if(sessionStorage.getItem("loggedIn") == "false") {
    window.location.href = "login.html";
}