const repo_api = require("./scripts/out/api/repo");
const clone_api = require("./scripts/out/api/clone");

const AdmZip = require('adm-zip');
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const { create_repo_from_url } = require('./scripts/out/api/repo.js');
const { Repository, PackageDatabase } = require('./scripts/out/api/repo.js');

var dotenv = require('dotenv');
//dotenv.config({ path: path.resolve(process.cwd().substring(0, process.cwd().lastIndexOf('/')), '.env') });
dotenv.config({ path: path.resolve('.env') });

process.env.GITHUB_TOKEN;
process.env.LOG_LEVEL;
process.env.LOG_FILE;

console.log(process.env.GITHUB_TOKEN)



app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use(bodyParser.json());


const packagesFilePath = path.join(__dirname, "package_storage.json");


// On get request for gcp_please
app.get("/gcp_please", (req, res) => {

    let url = "https://github.com/lodash/lodash";
    let username = "username";
    let repository;
    (async () => {
        try {
            // create repository object
            repository = await repo_api.create_repo_from_url(url, username);

            if (!fs.existsSync("./tmp")) {
                try {
                    clone_api.createTempFolder();
                } catch (err) {
                    console.error(err);
                }
            }
            // remove existing repo in temp if it exists, then clone
            await clone_api.deleteClonedRepo(`./tmp/${repository.name}`);
            await clone_api.cloneRepo(repository.url, `./tmp/${repository.name}`);

            // add local folder
            var zip = new AdmZip();
            zip.addLocalFolder(`./tmp/${repository.name}`);

            // get everything as a buffer
            var zipFileContents = zip.toBuffer();
            const fileName = repository.name.concat(".zip");
            const fileType = 'application/zip';
            res.writeHead(200, {
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Type': fileType,
            })
            return res.end(zipFileContents);

        } catch (e) {
            // Deal with the fact the chain failed
            console.log(e)
            //console.log(`${url} does not resolve to a github repository`);
            return;
        }
        // `text` is not available here
    })();

})


// When receiving get request for package_storage
app.get("/package_storage", (req, res) => {
    fs.readFile(packagesFilePath, "utf8", (err, data) => {
        if (err) {
            res.status(500).send({ error: "Error reading packages file." });
            return;
        }

        res.send(JSON.parse(data));
    });
});

// On post request of package_storage
app.post("/package_storage", (req, res) => {
    const newPackage = req.body;

    fs.readFile(packagesFilePath, "utf8", (err, data) => {
        if (err) {
            res.status(500).send({ error: "Error reading packages file." });
            return;
        }

        let packages = JSON.parse(data);
        if(Array.isArray(packages)) {
            packages.push(newPackage);
        } else {
            packages = [newPackage];
        }
        
        fs.writeFile(packagesFilePath, JSON.stringify(packages, null, 2), (err) => {
            if (err) {
                res.status(500).send({ error: "Error writing packages file." });
                return;
            }

            res.status(201).send(newPackage);
        });
    });
});

app.post('/clear_json_file', (req, res) => {
    fs.writeFile(packagesFilePath, JSON.stringify([], null, 2), (err) => {
        if (err) {
            res.status(500).send({ error: "Error clearing JSON file." });
            return;
        }
        res.status(200).send({ message: "JSON file cleared successfully." });
    });
});


app.post('/get_repo_info', async (req, res) => {
    try {

        console.log("Creating repo");
        const url = req.body.url;
        const repoInfo = await create_repo_from_url(url,"username");
        const name = repoInfo.name;

        console.log("Getting rating");
        const rating = await repoInfo.get_rating();
        console.log(rating);
        

        res.json({ name: name, rating: rating });
    } catch (error) {
        console.error("Error getting repository info:", error);
        res.status(500).json({ error: "Error getting repository info" });
    }
});


const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});