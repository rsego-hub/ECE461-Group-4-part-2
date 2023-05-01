Object.defineProperty(exports, "__esModule", { value: true });

const User = exports.User;
const UserDatabase = exports.UserDatabase;
const get_users = exports.get_users;
sessionStorage.clear();

/**
 * check if requirements met to login, give failure message to page if not met
 * @param {*} event 
 */
function login_checks(event) {
    const errorElement = document.getElementById("error");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    let messages = [];
    if (username.value === "" || username.value === null) {
        messages.push("Username is required");
    } else if (password.value.length < 5) {
        messages.push("Password should be at least 5 characters");
    } else if(username.value === null || password.value === null) {
        messages.push("Null username and password");
    } else if (!database.can_login(username.value, password.value)) {
        messages.push("Incorrect username or password");
    }

    // if there is a message, login did not succeed
    if (messages.length > 0) {
        event.preventDefault();
        errorElement.innerText = messages.join(",");
    } else {
        sessionStorage.setItem("isAdmin", username.value=="ece30861defaultadminuser");
        sessionStorage.setItem("loggedIn", "true");
        event.preventDefault();
        window.location.href = "mainMenu.html";
    }
}


// ------------------ Main Script ------------------------------

// If user has entered login page, they are not logged in, and are not an admin
sessionStorage.setItem("loggedIn", "false");
sessionStorage.setItem("isAdmin", "false");

// Read in file lines
const file_lines = get_users("user_list.txt")

// create database from users read in, also add admin
var database = new UserDatabase([]); // Create database, create admin but don't add
const adminUser = new User('ece30861defaultadminuser','correcthorsebatterystaple123(!__+@**(A\'\"`;DROP TABLE packages;',true)
database.addUser(adminUser);
for(const line of file_lines) {
    var user_vals = line.split(" ")
    database.addUser(new User(user_vals[0], user_vals[1], false));
}

// get page info, attach login logic to login button
const form = document.getElementById("form");
if(form != null) {
    form.addEventListener("submit", login_checks);
}