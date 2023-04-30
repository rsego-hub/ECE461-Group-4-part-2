exports.loadFile = exports.get_users = exports.set_users = void 0;

/**
 * loads any file in without fs
 * @param {*} filePath 
 * @returns contents of file
 */
function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}
exports.loadFile = loadFile;

/**
 * gets contents of user storage, converts to string
 * @param {*} path to user file
 * @returns each line of file as string
 */
function get_users() {
    /*
    const file_data = loadFile(path);
    const file_lines = file_data.split('\n');
    return file_lines;
    */
    if (localStorage.getItem("credentials_list") === null) {
        localStorage.setItem("credentials_list", "");
        return "";
    }
    return localStorage.getItem("credentials_list").split('\n');
}
exports.get_users = get_users;

/**
 * sets content of user storage, takes string input of following format
 * "
 * user1 pass1\n
 * user2 pass2\n
 * user3 pass3\n
 * "
 * @param {*} path 
 * @returns 
 */
function set_users(credentials) {
    localStorage.setItem("credentials_list", credentials);
}
exports.set_users = set_users;
