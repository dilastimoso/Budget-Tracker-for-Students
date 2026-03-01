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

    // Update List with dynamic DELETE buttons (Feature 2 Patch)
    expenseList.innerHTML = expenses.map((e, index) => ` 
        <li> 
            <span><strong>${e.desc}</strong><br><small>${e.date}</small></span> 
            <span>₱${e.amt} <button onclick="deleteExpense(${index})" style="background:none; color:#e74c3c; padding:0; margin-left:10px;">✕</button></span> 
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

// --- START OF PROGRESS REPORT PATCHES ---

// Feature: Individual Delete function
function deleteExpense(index) {
    if(confirm("Delete this entry?")) {
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateUI();
    }
}

// Feature: Clear All Reset function
const clearBtn = document.createElement('button');
clearBtn.innerText = "Clear All";
clearBtn.className = "nav-btn logout";
clearBtn.style.marginLeft = "10px";
clearBtn.onclick = () => {
    if(confirm("Reset everything?")) {
        localStorage.clear();
        location.reload();
    }
};
document.querySelector('.actions').appendChild(clearBtn);

// Feature: Profile Modal (Replaces old alert)
document.getElementById('profile-trigger').onclick = () => {
    const modal = document.createElement('div');
    modal.style = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:30px;border-radius:12px;box-shadow:0 0 20px rgba(0,0,0,0.2);z-index:10001;text-align:center;min-width:300px;";
    modal.innerHTML = `
        <h3 style="margin-top:0">Student Profile</h3>
        <p><strong>Names:</strong><br>Dennis Isaiah Lastimoso<br>Karyl Kaye P. Tumala</p>
        <p><strong>Project:</strong> CS-01</p>
        <button onclick="this.parentElement.remove()" style="background:#4a90e2;color:white;border-radius:5px;width:100%">Close</button>
    `;
    document.body.appendChild(modal);
};

init();
