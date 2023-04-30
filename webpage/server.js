console.log('Current directory: ' + process.cwd());

Object.defineProperty(exports, "__esModule", { value: true });

const repo_api = require("./scripts/out/api/repo");
const clone_api = require("./scripts/out/api/clone");

const AdmZip = require('adm-zip');
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");


app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use(bodyParser.json());


const packagesFilePath = path.join(__dirname, "package_storage.json");


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
            console.log("Process complete");
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


app.get("/package_storage", (req, res) => {
    fs.readFile(packagesFilePath, "utf8", (err, data) => {
        if (err) {
            res.status(500).send({ error: "Error reading packages file." });
            return;
        }

        res.send(JSON.parse(data));
    });
});

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

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});