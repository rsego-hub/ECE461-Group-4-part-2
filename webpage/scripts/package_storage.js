// Object.defineProperty(exports, "__esModule", { value: true });
// const { create_repo_from_url } = require('./out/api/repo.js');
// import { create_repo_from_url } from './out/api/repo.js';

let packages = [];

const searchInput = document.getElementById("search-input");
const resultsBody = document.getElementById("results-body");
const sortSelect = document.getElementById("sort-select");

function createDownloadButton(packageName) {
    var messages = [];
    var messageElement = document.getElementById("messages");

    const button = document.createElement("button");
    button.textContent = "Download";
    button.addEventListener("click", () => {
        console.log(`Downloading ${packageName}...`);

        // Auto send get request for gcp_please
        window.location.href = "/gcp_please";
        messages.push('Downloading');

        // Display download message
        messageElement.innerText = messages.join(",");

        /*
        fetch("/download", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
            //body: JSON.stringify(packageName),
        }).then(response => {
            if (response.ok) {
                window.location.href = "gcp_please";
            } else {
                console.error("Error Downloading package:", response.statusText);
            }
        }).catch(error => console.error("Error Downloading Package:", error));
        */
    });
    return button;
}

function sortPackages(packages, sortMethod) {
    switch (sortMethod) {
        case "name-asc":
            return packages.sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
            return packages.sort((a, b) => b.name.localeCompare(a.name));
        case "rating-asc":
            return packages.sort((a, b) => a.rating - b.rating);
        case "rating-desc":
            return packages.sort((a, b) => b.rating - a.rating);
        default:
            return packages;
    }
}

function updateTable(searchTerm, sortMethod) {
    resultsBody.innerHTML = "";

    if(!Array.isArray(packages)) {
        packages = [];
    }
    
    const filteredPackages = packages.filter(package => {
        try {
            const regex = new RegExp(searchTerm, "i");
            return regex.test(package.name);
        } catch (error) {
            return false;
        }
    });
    
    const sortedPackages = sortPackages(filteredPackages, sortMethod);


    for (const package of sortedPackages) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = package.name;
        row.appendChild(nameCell);

        const ratingCell = document.createElement("td");
        ratingCell.textContent = package.rating;
        row.appendChild(ratingCell);

        const downloadCell = document.createElement("td");
        downloadCell.appendChild(createDownloadButton(package.name));
        row.appendChild(downloadCell);

        resultsBody.appendChild(row);
    }
}

searchInput.addEventListener("input", (event) => {
    updateTable(event.target.value);
});

sortSelect.addEventListener("change", () => {
    updateTable(searchInput.value, sortSelect.value);
});


function createAddPackageForm() {
    
    const form = document.createElement("form");
    form.innerHTML = `
        <input type="text" name="name" placeholder="Package name" required>
        <input type="url" name="url" placeholder="Package URL" required>
        <button type="submit">Add package</button>
    `;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const url = event.target.elements.url.value;
        
        try {
            const response = await fetch('/get_repo_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (response.ok) {
                const { name, rating } = await response.json();
                const newPackage = {
                    name,
                    rating
                };

                // Post the newPackage to /package_storage
                const addResponse = await fetch("/package_storage", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newPackage),
                });

                if (addResponse.ok) {
                    fetchPackages();
                } else {
                    console.error("Error adding package:", addResponse.statusText);
                }
            } else {
                console.error("Error getting repo info:", response.statusText);
            }
        } catch (error) {
            console.error("Error getting repo info:", error);
        }
    });

    return form;
}

// function createAddPackageForm() {
    
//     const form = document.createElement("form");
//     form.innerHTML = `
//         <input type="text" name="name" placeholder="Package name" required>
//         <input type="url" name="url" placeholder="Package URL" required>
//         <button type="submit">Add package</button>
//     `;

//     form.addEventListener("submit", (event) => {
//         event.preventDefault();
//         const url = event.target.elements.url.value;

//         const newPackage = {
//             name: event.target.elements.name.value,
//             // rating: parseFloat(event.target.elements.rating.value),
//         };

//         fetch("/package_storage", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify(newPackage),
//         })
//             .then(response => {
//                 if (response.ok) {
//                     fetchPackages();
//                 } else {
//                     console.error("Error adding package:", response.statusText);
//                 }
//             })
//             .catch(error => console.error("Error adding package:", error));
//     });

//     return form;
// }

document.getElementById("add-package-form-container").appendChild(createAddPackageForm());

function fetchPackages() {
    fetch("/package_storage")
        .then(response => response.json())
        .then(data => {
            packages = data;
            updateTable("");
        })
        .catch(error => console.error("Error fetching package data:", error));
}
function admin_check_clear() {

    // Check if user is an admin
    var isAdmin = Boolean(sessionStorage.getItem("isAdmin")=="true");
    if(!isAdmin) {
        return
    }
    fetch('/clear_json_file', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        fetchPackages(); // Fetch the updated package list and update the table
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


// ------------------ Main Script ------------------------------

if(sessionStorage.getItem("loggedIn") != "true") {
    window.location.href = "index.html";
}

fetchPackages();