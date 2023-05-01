
exports.admin_check = exports.go_to_login = exports.go_to_search = void 0;

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
    var isAdmin = Boolean(sessionStorage.getItem("isAdmin") == "true");
    if (!isAdmin) {
        return
    }
    window.location.href = "register.html";
}
exports.admin_check = admin_check;

/**
 * redirect to login page
 */
function go_to_login() {
    window.location.href = "authenticate.html";
}
exports.go_to_login = go_to_login;

/**
 * redirect to login page
 */
function go_to_search() {
    window.location.href = "packages.html";
}
exports.go_to_search = go_to_search;


// ------------------ Main Script ------------------------------

if (sessionStorage.getItem("loggedIn") != "true") {
    window.location.href = "authenticate.html";
}