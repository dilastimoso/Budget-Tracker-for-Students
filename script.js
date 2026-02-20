// Sample student database (RFID UID mapped to student)
let students = {
    "A1B2C3D4": { name: "Juan Dela Cruz", balance: 1000 },
    "X9Y8Z7W6": { name: "Maria Santos", balance: 1500 }
};

let currentUID = null;

// Simulate RFID Scan
function simulateScan() {
    const uids = Object.keys(students);
    currentUID = uids[Math.floor(Math.random() * uids.length)];

    document.getElementById("uidDisplay").innerText = currentUID;
    loadStudent(currentUID);
}

// Load student data
function loadStudent(uid) {
    if (students[uid]) {
        document.getElementById("studentName").innerText = students[uid].name;
        document.getElementById("studentBalance").innerText = students[uid].balance.toFixed(2);
    }
}

// Deduct purchase
function deductAmount() {
    if (!currentUID) {
        alert("Scan RFID first!");
        return;
    }

    let amount = parseFloat(document.getElementById("purchaseAmount").value);

    if (isNaN(amount) || amount <= 0) {
        alert("Enter valid amount.");
        return;
    }

    if (students[currentUID].balance < amount) {
        alert("Insufficient balance!");
        return;
    }

    students[currentUID].balance -= amount;

    document.getElementById("studentBalance").innerText =
        students[currentUID].balance.toFixed(2);

    addLog(students[currentUID].name, amount, students[currentUID].balance);
}

// Add transaction log
function addLog(name, amount, balance) {
    const table = document.getElementById("logTable");
    const row = table.insertRow();

    row.insertCell(0).innerText = name;
    row.insertCell(1).innerText = "₱" + amount.toFixed(2);
    row.insertCell(2).innerText = "₱" + balance.toFixed(2);
    row.insertCell(3).innerText = new Date().toLocaleString();
}
