
exports.go_to_main = void 0;

var get_users = exports.get_users;
var set_users = exports.set_users;

/**
 * when credentials are entered, add them to username password storage method and 
 * return to main menu
 * @param {*} event 
 */
function handleRegisterSubmit(event) {
    var errorElement = document.getElementById("error");
    var username = (document.getElementById("username"));
    var password = (document.getElementById("password"));
    var messages = [];

    // call whatever storage method and get line by line strings of user credential pairs 
    const user_lines = get_users();
    if (username.value === '' || username.value === null) {
        messages.push('Username is required');
    } else if (password.value.length < 5) {
        messages.push('Password should be at least 5 characters');
    } else {
        for(let line of user_lines) {
            // don't allow users to have same username as others or admin
            if(line.split(" ")[0] == username.value || "ece30861defaultadminuser" == username.value) {
                messages.push('Username already exists');
                break;
            }
        }
    }

    if (messages.length > 0) {
        event.preventDefault();
        errorElement.innerText = messages.join(",");
    } else {

        // Make new file contents by attaching new users to old file
        let new_contents = "";
        for(let line of user_lines) {
            if(line != "") {
                new_contents = new_contents.concat(line, "\n");
            }
        }
        new_contents = new_contents.concat(username.value, " ", password.value, "\n")

        // call whatever storage method
        set_users(new_contents);

        event.preventDefault();
        window.location.href = "mainMenu.html";
    }
}

/**
 * redirect to main menu
 */
function go_to_main() {
    window.location.href = "mainMenu.html";
}
exports.go_to_main = go_to_main;


// ------------------ Main Script ------------------------------

if(sessionStorage.getItem("loggedIn") != "true") {
    window.location.href = "index.html";
}

var form_R = document.getElementById("form-R");
if(form_R != null) {
    form_R.addEventListener("submit", handleRegisterSubmit);
}