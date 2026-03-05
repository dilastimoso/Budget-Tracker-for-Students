let budget = parseFloat(localStorage.getItem('budget')) || 0; 
let expenses = JSON.parse(localStorage.getItem('expenses')) || []; 
let myChart; 

const budgetDisplay = document.getElementById('display-budget'); 
const expenseDisplay = document.getElementById('display-expenses'); 
const balanceDisplay = document.getElementById('display-balance'); 
const expenseList = document.getElementById('expense-list'); 
const rfidStatus = document.getElementById('rfid-status'); 

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        const loginOverlay = document.createElement('div');
        loginOverlay.id = 'login-overlay';
        loginOverlay.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:var(--bg);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;";
        loginOverlay.innerHTML = `
            <div style="background:white;padding:40px;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.1);text-align:center;">
                <h2>Welcome to StudentBudget</h2>
                <p>Please enter your name to login:</p>
                <input type="text" id="login-name" style="padding:10px;font-size:1.2rem;width:80%;margin-bottom:20px;border:1px solid #ccc;border-radius:5px;">
                <br>
                <button id="login-btn" style="background:#2ecc71;color:white;padding:12px 30px;font-size:1.2rem;border:none;border-radius:5px;cursor:pointer;">Login</button>
            </div>
        `;
        document.body.appendChild(loginOverlay);
        document.getElementById('login-btn').onclick = () => {
            const name = document.getElementById('login-name').value.trim();
            if (name) {
                localStorage.setItem('currentUser', name);
                document.getElementById('login-overlay').remove();
                init();
            } else {
                alert("Please enter a name.");
            }
        };
        return false;
    }
    return true;
}

function init() { 
    if (!checkAuth()) return;
    updateUI(); 
    setupEventListeners(); 
} 

function setupEventListeners() { 
    document.getElementById('set-budget-btn').onclick = () => { 
        const val = prompt("Enter Monthly Budget:", budget); 
        if (val !== null && val.trim() !== "") { 
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) {
                budget = parsed; 
                localStorage.setItem('budget', budget); 
                updateUI(); 
            } else {
                alert("Please enter a valid number for the budget.");
            }
        } 
    }; 

    document.getElementById('add-expense-btn').onclick = () => { 
        const desc = prompt("Expense Description:"); 
        const amt = prompt("Amount:"); 
        if (desc && amt) {
            const parsedAmt = parseFloat(amt);
            if (!isNaN(parsedAmt)) {
                addExpense(desc, parsedAmt, "Manual"); 
            } else {
                alert("Please enter a valid number for the amount.");
            }
        }
    }; 

    window.addEventListener('keydown', (e) => { 
        if (e.key === 'Enter') { 
            simulateRFIDScan(); 
        } 
    }); 

    document.querySelector('.logout').onclick = (e) => {
        e.preventDefault();
        if(confirm("Are you sure you want to logout?")) {
            localStorage.removeItem('currentUser');
            location.reload();
        }
    };
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
    const formatOptions = { minimumFractionDigits: 2, maximumFractionDigits: 2 };

    budgetDisplay.innerText = `₱${budget.toLocaleString('en-US', formatOptions)}`; 
    expenseDisplay.innerText = `₱${totalExp.toLocaleString('en-US', formatOptions)}`; 
    balanceDisplay.innerText = `₱${balance.toLocaleString('en-US', formatOptions)}`; 
    balanceDisplay.parentElement.style.color = balance < 0 ? "#e74c3c" : "#2ecc71"; 

    expenseList.innerHTML = expenses.map((e, index) => ` 
        <li> 
            <span><strong>${e.desc}</strong><br><small>${e.date}</small></span> 
            <span>₱${e.amt.toLocaleString('en-US', formatOptions)} <button onclick="deleteExpense(${index})" style="background:none; color:#e74c3c; padding:0; margin-left:10px; font-size:1.2rem;">✕</button></span> 
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
            plugins: { 
                legend: { 
                    position: 'bottom',
                    labels: {
                        font: { size: 16 },
                        padding: 20
                    }
                },
                tooltip: {
                    bodyFont: { size: 18 },
                    titleFont: { size: 18 },
                    padding: 15
                }
            } 
        } 
    }); 
} 

function deleteExpense(index) {
    if(confirm("Delete this entry?")) {
        expenses.splice(index, 1);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        updateUI();
    }
}

const clearBtn = document.createElement('button');
clearBtn.innerText = "Clear All";
clearBtn.className = "nav-btn logout";
clearBtn.style.marginLeft = "10px";
clearBtn.onclick = () => {
    if(confirm("Reset everything?")) {
        localStorage.removeItem('budget');
        localStorage.removeItem('expenses');
        location.reload();
    }
};
document.querySelector('.actions').appendChild(clearBtn);

document.getElementById('profile-trigger').onclick = () => {
    const currentUser = localStorage.getItem('currentUser') || "";
    const modal = document.createElement('div');
    modal.style = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:40px;border-radius:12px;box-shadow:0 0 20px rgba(0,0,0,0.2);z-index:10001;text-align:center;min-width:350px;font-size:1.2rem;";
    modal.innerHTML = `
        <h3 style="margin-top:0;font-size:1.8rem;">Student Profile</h3>
        <div style="margin-bottom: 15px; text-align: left;">
            <strong>Name:</strong><br>
            <input type="text" id="edit-profile-name" value="${currentUser}" style="padding:10px;font-size:1.1rem;width:100%;box-sizing:border-box;margin-top:5px;border:1px solid #ccc;border-radius:5px;">
        </div>
        <p><strong>Project:</strong> CS-01</p>
        <button id="save-profile-btn" style="background:#2ecc71;color:white;border-radius:5px;width:100%;padding:15px;font-size:1.2rem;cursor:pointer;border:none;margin-top:10px;">Save Profile</button>
        <button onclick="this.parentElement.remove()" style="background:#e74c3c;color:white;border-radius:5px;width:100%;padding:15px;font-size:1.2rem;cursor:pointer;border:none;margin-top:10px;">Close</button>
    `;
    document.body.appendChild(modal);

    document.getElementById('save-profile-btn').onclick = () => {
        const newName = document.getElementById('edit-profile-name').value.trim();
        if(newName) {
            localStorage.setItem('currentUser', newName);
            alert("Profile saved successfully!");
            modal.remove();
        } else {
            alert("Name cannot be empty.");
        }
    };
};

init();
