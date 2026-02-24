const ctx = document.getElementById('expenseChart').getContext('2d');

let myChart = new Chart(ctx, {
    type: 'bar', // or 'doughnut' based on your preference
    data: {
        labels: ['Food', 'Transport', 'School Supplies'],
        datasets: [{
            label: 'Expenses',
            data: [12, 19, 3],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        // PATCH: Stops the automatic growing bug
        maintainAspectRatio: false, 
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
