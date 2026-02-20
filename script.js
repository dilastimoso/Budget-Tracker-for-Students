let totalBudget = 0;
let totalExpenses = 0;
let remainingBalance = 0;

let expenses = [
    { category: "Food", amount: 0 },
    { category: "Transport", amount: 0 },
    { category: "School Supplies", amount: 0 }
];

const totalBudgetEl = document.getElementById("totalBudget");
const totalExpensesEl = document.getElementById("totalExpenses");
const remainingBalanceEl = document.getElementById("remainingBalance");
const expenseListEl = document.getElementById("expenseList");

// Chart setup
const ctx = document.getElementById('expenseChart').getContext('2d');
const expenseChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: expenses.map(e => e.category),
        datasets: [{
            label: 'Expenses',
            data: expenses.map(e => e.amount),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

function updateDashboard() {
    totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    remainingBalance = totalBudget - totalExpenses;

    totalBudgetEl.innerText = `₱${totalBudget.toFixed(2)}`;
    totalExpensesEl.innerText = `₱${totalExpenses.toFixed(2)}`;
    remainingBalanceEl.innerText = `₱${remainingBalance.toFixed(2)}`;

    // Update chart
    expenseChart.data.datasets[0].data = expenses.map(e => e.amount);
    expenseChart.update();

    // Update list
    expenseListEl.innerHTML = "";
    expenses.forEach(e => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between";
        li.innerText = e.category;
        const span = document.createElement("span");
        span.innerText = `₱${e.amount.toFixed(2)}`;
        li.appendChild(span);
        expenseListEl.appendChild(li);
    });
}

// Set Budget Button Patch
document.getElementById("setBudgetBtn").addEventListener("click", () => {
    const budgetStr = prompt("Enter total budget:");
    const budget = parseFloat(budgetStr);

    if (isNaN(budget) || budget < 0) {
        alert("Invalid budget. Please enter a positive number.");
        return;
    }

    if (budget < totalExpenses) {
        alert(`Budget cannot be less than current total expenses (₱${totalExpenses.toFixed(2)}).`);
        return;
    }

    totalBudget = budget;
    updateDashboard();
});

// Add Expense Button Patch
document.getElementById("addExpenseBtn").addEventListener("click", () => {
    const category = prompt("Enter category (Food, Transport, School Supplies):");
    if (!category) return;

    const exp = expenses.find(e => e.category.toLowerCase() === category.toLowerCase());
    if (!exp) {
        alert("Invalid category. Please choose Food, Transport, or School Supplies.");
        return;
    }

    const amountStr = prompt(`Enter expense amount for ${exp.category}:`);
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount < 0) {
        alert("Invalid amount. Please enter a positive number.");
        return;
    }

    // Optional: prevent expense from exceeding budget
    if (totalExpenses + amount > totalBudget) {
        alert("Warning: This expense exceeds your total budget!");
    }

    exp.amount += amount; // keep accumulation behavior
    updateDashboard();
});

updateDashboard();
