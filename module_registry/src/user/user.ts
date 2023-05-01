export class UserDatabase {

    user_list:User[];

    constructor(user_list:User[]) {
        this.user_list = user_list;
    }

    /**
     * Removes all users from list except admin
     * @returns {boolean} indicating deletion success or failure
     */
    reset() {
        let admin_user:User;
        for (let user of this.user_list) {
            if(user.admin_flag) { // Once admin is found, make it the sole entry in user_list
                admin_user = user
                this.user_list = [admin_user];
                return true; // Successful reset
            }
        }

        // correcthorsebatterystaple123(!__+@**(A'"`;DROP TABLE packages;
        this.user_list = [new User('ece30861defaultadminuser','correcthorsebatterystaple123(!__+@**(A\'\"`;DROP TABLE packages;', true)];
        return false; // no admin found, default admin created
    }

    /**
     * Add a new user to the list, exlcude if user already exists
     * @param user 
     * @returns {boolean} indicating user added or not
     */
    addUser(user:User) {
        for(let existing_user of this.user_list) {
            if(existing_user.name == user.name) {
                return false; // do not add user with same name
            }
        }
        this.user_list.push(user);
        return true; // user successfully added
    }

    /**
     * check if given credentials are valid
     * @param given_username 
     * @param given_password 
     * @returns {boolen} indicating validity
     */
    can_login(given_username:string, given_password:string) {
        for(let user of this.user_list) {
            if((user.name == given_username) && (user.password == given_password)) {
                return true; // do not add user with same name
            }
        }
        return false;
    }
}

export class User {
    name: string;
    password: string;
    admin_flag: boolean;

    constructor(name: string, password: string, admin_flag: boolean) {
        this.name = name;
        this.password = password;
        this.admin_flag = admin_flag;
    }
}