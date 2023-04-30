let packages = [];

const searchInput = document.getElementById("search-input");
const resultsBody = document.getElementById("results-body");
const sortSelect = document.getElementById("sort-select");

function createDownloadButton(packageName) {
    const button = document.createElement("button");
    button.textContent = "Download";
    button.addEventListener("click", () => {
        console.log(`Downloading ${packageName}...`);
        // !!!!!!!!!!!!!!
        // PUT FETCH HERE
        // !!!!!!!!!!!!!!
        window.location.href = "/gcp_please";
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
    
    const filteredPackages = packages.filter(package => package.name.toLowerCase().includes(searchTerm.toLowerCase()));
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
        <input type="number" name="rating" placeholder="Rating" step="0.1" min="0" max="5" required>
        <button type="submit">Add package</button>
    `;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const newPackage = {
            name: event.target.elements.name.value,
            rating: parseFloat(event.target.elements.rating.value),
        };

        fetch("/package_storage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPackage),
        }).then(response => {
            if (response.ok) {
                fetchPackages();
            } else {
                console.error("Error adding package:", response.statusText);
            }
        }).catch(error => console.error("Error adding package:", error));
    });

    return form;
}

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

fetchPackages();
