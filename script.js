let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let myChart;

const form = document.getElementById('transaction-form');
const list = document.getElementById('transaction-list');
const balanceDisplay = document.getElementById('total-balance');

function updateUI() {
    list.innerHTML = '';
    let total = 0;
    const categoryData = {
        Food: 0, Transport: 0, Education: 0, 
        Entertainment: 0, Utilities: 0, Other: 0
    };

    transactions.forEach((t, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${t.description} - ₱${t.amount.toFixed(2)} <span>${t.category}</span>`;
        list.appendChild(li);
        total += t.amount;
        categoryData[t.category] += t.amount;
    });

    balanceDisplay.innerText = `₱${total.toFixed(2)}`;
    updateChart(categoryData);
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function updateChart(data) {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // FIXED: Allows the chart to follow CSS height
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    transactions.push({ description, amount, category });
    updateUI();
    form.reset();
});

// Initial Load
updateUI();
