// Tab Switching Logic
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked
            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId)?.classList.add('active');
        });
    });

    // Initialize Charts (expecting Chart.js to be loaded)
    initCharts();
});

function initCharts() {
    if (typeof Chart === 'undefined') return;

    // Data is injected via global variable 'REPORT_DATA'
    const data = window.REPORT_DATA;
    if (!data) return;

    // 1. Coverage Donut Chart
    const covCtx = document.getElementById('coverageChart')?.getContext('2d');
    if (covCtx) {
        new Chart(covCtx, {
            type: 'doughnut',
            data: {
                labels: ['已覆盖', '未覆盖'],
                datasets: [{
                    data: [data.coverage.coveredLines, data.coverage.totalLines - data.coverage.coveredLines],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: '增量行覆盖率' }
                },
                cutout: '70%'
            }
        });
    }
}
