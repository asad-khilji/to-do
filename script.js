let groceries = JSON.parse(localStorage.getItem("groceries")) || [];

function saveToLocalStorage() {
    localStorage.setItem("groceries", JSON.stringify(groceries));
}

function displayList() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    for (let i = 0; i < groceries.length; i++) {
        list.innerHTML += `
            <li>
                <span>${groceries[i]}</span>
                <button class="delete-btn" onclick="removeItem(${i})">
                    ✖
                </button>
            </li>
        `;
    }

    document.getElementById("count").textContent =
        `Total Items: ${groceries.length}`;
}

function addItem() {
    const item = document.getElementById("itemInput").value.trim();

    if (item) {
        groceries.push(item);
        saveToLocalStorage();
        document.getElementById("itemInput").value = "";
        displayList();
    }
}

function removeItem(index) {
    groceries.splice(index, 1);
    saveToLocalStorage();
    displayList();
}

displayList();