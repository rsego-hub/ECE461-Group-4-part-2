import { Octokit } from "@octokit/core";

import { logToFile } from "../logging/logging";

import { calculateBusFactor } from "../metrics/busFactor";
import { calculateCorrectness } from "../metrics/correctness";
import { calculateLicenseCompatibility } from "../metrics/licenseCompatibility";
import { calculateRampUp } from "../metrics/rampUp";
import { calculateResponsiveness } from "../metrics/responsiveness";

import { getCommunityProfile } from "./getCommunityProfile";
import { getIssues } from "./getIssues";
import { getReadme } from "./getReadme";
import { getLicense } from "./getLicense";
import { getContributors } from "./getContributors";
import { getCommits } from "./getCommits";
import { calculateNetScore } from "../metrics/netScore";
import { getPkgGithubURL } from "./getPkgGithubURL";
import { cloneRepo, createTempFolder, deleteClonedRepo } from "./clone";

const parse = require("parse-github-url");
const fs = require("fs");

export class PackageDatabase {
    repository_list:Repository[];
    package_directory_path:string;

    constructor(repository_list:Repository[], package_directory_path:string) {
        this.package_directory_path = package_directory_path;
        this.repository_list = repository_list;
    }

    /**
     * Collects package contents
     * @param package_name string name of package
     * @returns package contents in UNIMLEMENTED format, or null on failure
     */
    get_contents_of(package_name:string) {
        for(let repo of this.repository_list) {
            if(repo.name == package_name) {
                return repo.get_contents(this.package_directory_path);
            }
        }
        return null;
    }

    /**
     * Add new repo to the list, exclude if repo already exists
     * @param new_repo 
     * @returns {boolean} repo added or not
     */
    addPackage(new_repo:Repository) {
        for(let repo of this.repository_list) {
            if(repo.name == new_repo.name) {
                return false;
            }
        }
        this.repository_list.push(new_repo);
        return true;
    }

    // UNIMPLEMENTED
    updatePackage(name:string, new_version:string, new_contents:unknown) {
        return -1;
    }

    /**
     * Get a list of repositories that have a name similar to the input
     * @param queried_name string representing name being searched for
     * @returns list of repositories that match the queried name
     */
    search_by_name(queried_name:string) {
        let name_matched_repo_list:Repository[] = [];
        for(let repo of this.repository_list) {
            // Check if name matches, ignore case
            if(repo.name.toLowerCase().includes(queried_name.toLowerCase())) {
                name_matched_repo_list.push(repo);
            }
        }
        logToFile(name_matched_repo_list.length, 1, "Number Matched Repos");
        return name_matched_repo_list;
    }

    /**
     * Get a list of repositories whos name or readme matches a regular expression
     * @param regexp regular expression being used
     * @returns list of repositories that contain positive result for the regular expression
     */
    async search_by_regex(regexp:RegExp) {
        let regex_matched_repo_list:Repository[] = [];
        for(let repo of this.repository_list) {
            let repo_readme_response = await repo.get_readme()
            let readme_text = Buffer.from(repo_readme_response.data.content, "base64").toString("ascii");
            // Check if regex matches name or readme, ignore case
            if(regexp.test(repo.name) || regexp.test(readme_text)) {
                regex_matched_repo_list.push(repo);
            }
        }
        logToFile(regex_matched_repo_list.length, 1, "Number Matched Repos");
        return regex_matched_repo_list;
    }
}


export class Repository {
    name: string;
    owner: string;
    url: string;
    current_version: string;
    size: Number;
    history_list: History[];

    constructor(name:string, owner: string, url: string, current_version:string, size:Number, history_list:History[]) {
        this.name = name;
        this.owner = owner;
        this.url = url;
        this.current_version = current_version;
        this.size = size;
        this.history_list = history_list;
    }

    /**
     * Given a directory to pull from, find directory with same name and return contents
     * UNIMPLEMENTED
     * @param path Path to directory containing package
     * @returns Package contents OR success status, unsure of exact implementation
     */
    get_contents(path:string) {
        return -1;
    }

    /**
     * Adds history event to repo history
     * @param new_history 
     */
    add_history(new_history:History) {
        this.history_list.push(new_history);
    }

    /**
     * Collects information on github repo and calculates weighted metrics based on repo information
     * @returns {number} 0-1 representing weighted score, -1 on failure
     */
    async get_rating() {

        // create a tmp directory to clone the repos into
        if (!fs.existsSync("./tmp")) {
            try {
                createTempFolder();
            } catch (err) {
                console.error(err);
            }
        }

        try {
            // Get repo features
        	let communityProfileResponse = await getCommunityProfile(this.owner, this.name);
            let issuesResponse = await getIssues(this.owner, this.name);
            let readmeResponse = await getReadme(this.owner, this.name);
            let licenseResponse = await getLicense(this.owner, this.name);
            let contributorsResponse = await getContributors(this.owner, this.name);
            let commitsResponse = await getCommits(this.owner, this.name);
            fs.rmSync(`./tmp/${this.name}`, { recursive: true, force: true });
            await cloneRepo(this.url, `./tmp/${this.name}`);

            //calculate individual metrics
            let busFactor = calculateBusFactor(contributorsResponse, commitsResponse);
            let rampUp = calculateRampUp(communityProfileResponse, readmeResponse);
            let responsiveness = calculateResponsiveness(issuesResponse);
            let licenseCompatibility = calculateLicenseCompatibility(licenseResponse, readmeResponse);
            let correctness = calculateCorrectness(`./tmp/${this.name}`);
            await deleteClonedRepo(`./tmp/${this.name}`);

            // calculate weighted score
            let netScore = calculateNetScore(rampUp, correctness, busFactor, responsiveness, licenseCompatibility);

            return netScore;
        } catch (error) {
            logToFile(error, 0, "ERROR");
        }
        return -1
    }

    /**
     * Collects readme response
     * readme.data should return a string
     * @returns Response to GET request for readme file
     */
    get_readme() {
        return getReadme(this.owner, this.name);
    }
    
    async review_metric() {
        
        // get list of pull requests
        let pullResponse;
        const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
        try {
            pullResponse = await octokit.request('GET /repos/{owner}/{repo}/pulls?state=closed', {
                owner: this.owner,
                repo: this.name,
                per_page: 100,
            });
        } catch (error) {
            console.error(error);
            throw error;
        }
        
        // No pull requests made, score is 0 since all pushes were to main and unreviewed
        if(pullResponse.data.length == 0) {
            return 0;
        }

        // Get list of the review comments urls for each merged pull request
        let review_comments_urls = [];
        for(let pull of pullResponse.data) {
            if(pull.merged_at != null) {
                review_comments_urls.push(pull.review_comments_url)
            }
        }
        
        // Check reviews, add to num reviewed if not empty
        let num_reviewed = 0;
        let review_comment_response;
        for(let url of review_comments_urls) {
            try {
                review_comment_response = await octokit.request('GET '.concat(url));
            } catch (error) {
                console.error(error);
                throw error;
            }

            if(JSON.stringify(review_comment_response.data) != "[]") {
                num_reviewed += 1;
            }
        }

        // return reviewed requests divided by number of all pull requests
        return (num_reviewed/pullResponse.data.length);
    }
    
    /**
     * calculate metric for number of version specific dependencies
     * @returns 0-1, 1 representing all dependencies are version specific, 0 represents none
     */
    pinned_metric() {
        // helper function for detecting if value is unique in list
        function onlyUnique(value:string, index:number, array:string[]) {
            return array.indexOf(value) === index;
        }

        // get all dependencies throughout hisitory, even repeats
        let all_dependencies:string[] = []
        for(let history of this.history_list) {
            for(let dependency of history.dependencies) {
                all_dependencies.push(dependency)
            } 
        }

        let unique_dependencies:string[] = all_dependencies.filter(onlyUnique);
        let unpinned_dependencies:string[] = this.history_list[this.history_list.length - 1].dependencies;

        let num_dependencies = unique_dependencies.length;
        let num_pinned = num_dependencies - unpinned_dependencies.length;

        // if no dependencies, should be 1 since technically all existing dependencies are pinned
        if(num_dependencies == 0) {
            return 1;
        }
        return num_pinned / num_dependencies ;
    }
}

/**
 * Creates a repository object based entirely on information collected from the url
 * @param url to find the repo
 * @returns correctly instantiated repostory object
 */
export async function create_repo_from_url(url: string) {

    // If given npmjs repo, get corresponding github repo
    let true_url = url;
    if (url.includes("npmjs.com")) {
        const [ pkgName ] = url.split("/").slice(-1);
        try {
            true_url = await getPkgGithubURL(pkgName, 'latest');
        } catch (error) {
            console.log(`${url} does not have a github repository`);
            logToFile(url, 1, "URL", "does not have a github repository");
        }
    }
    
    // Collect repo info
    const parsed_repo = parse(true_url);

    // If prexisting version number exists, get it, otherwise declare as first version
    /*
    let true_version = "1.0";
    const regexp = new RegExp('^(\d+\.)?(\d+\.)?(\*|\d+)$');
    if(regexp.test(parsed_repo.branch)) {
        true_version = parsed_repo.branch;
    } 
    */

    const repository = new Repository(parsed_repo.name, parsed_repo.owner, true_url, "1.0", 0, []);
    return repository;
}

export class History {
    action: string;
    version: string;
    username: string;
    dependencies: string[];

    constructor(action:string, version:string, username:string, dependencies:string[]) {
        this.action = action;
        this.version = version;
        this.username = username;
        this.dependencies = dependencies;
    }
}