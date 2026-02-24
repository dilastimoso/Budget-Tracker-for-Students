// State Management
let budget = parseFloat(localStorage.getItem('budget')) || 0;
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let myChart;

// DOM Elements
const budgetDisplay = document.getElementById('display-budget');
const expenseDisplay = document.getElementById('display-expenses');
const balanceDisplay = document.getElementById('display-balance');
const expenseList = document.getElementById('expense-list');
const rfidStatus = document.getElementById('rfid-status');

// Initialize
function init() {
    updateUI();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('set-budget-btn').onclick = () => {
        const val = prompt("Enter Monthly Budget:", budget);
        if (val) {
            budget = parseFloat(val);
            localStorage.setItem('budget', budget);
            updateUI();
        }
    };

    document.getElementById('add-expense-btn').onclick = () => {
        const desc = prompt("Expense Description:");
        const amt = prompt("Amount:");
        if (desc && amt) addExpense(desc, parseFloat(amt), "Manual");
    };

    // RFID SIMULATION: Pressing "Enter" simulates an RFID tag swipe
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            simulateRFIDScan();
        }
    });
}

function simulateRFIDScan() {
    rfidStatus.innerText = "Scanning... Tag ID: 88:AF:12:0C";
    rfidStatus.style.background = "#2ecc71";
    
    setTimeout(() => {
        // Randomly simulate a canteen or shop expense
        const mockExpenses = [
            {desc: 'Canteen Meal', amt: 55, cat: 'Food'},
            {desc: 'Jeepney Fare', amt: 13, cat: 'Transport'},
            {desc: 'Photocopy', amt: 10, cat: 'School Supplies'}
        ];
        const random = mockExpenses[Math.floor(Math.random() * mockExpenses.length)];
        addExpense(random.desc, random.amt, random.cat);
        
        rfidStatus.innerText = "RFID Scanned: " + random.desc;
        setTimeout(() => {
            rfidStatus.innerText = "Waiting for RFID Scan... (Press 'Enter')";
            rfidStatus.style.background = "#333";
        }, 2000);
    }, 500);
}

function addExpense(desc, amt, cat) {
    expenses.push({ desc, amt, cat, date: new Date().toLocaleDateString() });
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateUI();
}

function updateUI() {
    const totalExp = expenses.reduce((sum, e) => sum + e.amt, 0);
    const balance = budget - totalExp;

    budgetDisplay.innerText = `₱${budget.toLocaleString()}`;
    expenseDisplay.innerText = `₱${totalExp.toLocaleString()}`;
    balanceDisplay.innerText = `₱${balance.toLocaleString()}`;
    balanceDisplay.parentElement.style.color = balance < 0 ? "#e74c3c" : "#2ecc71";

    // Update List
    expenseList.innerHTML = expenses.map(e => `
        <li>
            <span><strong>${e.desc}</strong><br><small>${e.date}</small></span>
            <span>₱${e.amt}</span>
        </li>
    `).reverse().join('');

    updateChart();
}

function updateChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    const categories = [...new Set(expenses.map(e => e.cat))];
    const data = categories.map(c => expenses.filter(e => e.cat === c).reduce((sum, e) => sum + e.amt, 0));

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: data,
                backgroundColor: ['#4a90e2', '#2ecc71', '#f1c40f', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

init();
