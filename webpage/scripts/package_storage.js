let packages = [];

const searchInput = document.getElementById("search-input");
const resultsBody = document.getElementById("results-body");

function createDownloadButton(packageName) {
    const button = document.createElement("button");
    button.textContent = "Download";
    button.addEventListener("click", () => {
        console.log(`Downloading ${packageName}...`);

    });
    return button;
}

function updateTable(searchTerm) {
    resultsBody.innerHTML = "";

    if(!Array.isArray(packages)) {
        packages = [];
    }

    const filteredPackages = packages.filter(package => package.name.toLowerCase().includes(searchTerm.toLowerCase()));

    for (const package of filteredPackages) {
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

        fetch("/package_storage.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newPackage),
        })
            .then(response => {
                if (response.ok) {
                    fetchPackages();
                } else {
                    console.error("Error adding package:", response.statusText);
                }
            })
            .catch(error => console.error("Error adding package:", error));
    });

    return form;
}

function fetchPackages() {
    fetch("/package_storage.json")
        .then(response => {
            response.json()
            
        })
        .then(data => {
            console.log(data)
            packages = data;
            updateTable("");
        })
        .catch(error => console.error("Error fetching package data:", error));
}

searchInput.addEventListener("input", (event) => {
    updateTable(event.target.value);
});

document.getElementById("add-package-form-container").appendChild(createAddPackageForm());

fetchPackages();