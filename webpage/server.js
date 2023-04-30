const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
console.log(__dirname)

app.use(bodyParser.json());

const packagesFilePath = path.join(__dirname, "package_storage.json");
console.log(packagesFilePath)

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

        const packages = JSON.parse(data);
        packages.push(newPackage);

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



const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});