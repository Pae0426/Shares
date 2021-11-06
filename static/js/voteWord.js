$('.vote-word-modal-btn').on('click', function() {
    let ctx = document.getElementById("chart-word").getContext('2d');
    wordChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [1,2,3,4,5,6,7,8],
            datasets: [
                {
                    label: "投票数",
                    data: [4,8,4,1,10,5,0,6],
                    //backgroundColor: data_color,
                },
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        stepSize: 1,
                        autoSkip: false,
                        maxRotation: 0,
                        minRotation: 0,
                    },
                }],
                yAxes: [{
                    display: false,
                    ticks: {
                        min: 0,
                        max: 100,
                    },
                }],
            },
            hover: {
                mode: 'single'
            },
        }
    });
    $('.vote-word-modal-item').fadeIn();
});

$('.vote-word-modal-close-btn, .vote-word-modal-bg').on('click', function() {
    if (wordChart) {
        wordChart.destroy();
    }
    $('.vote-word-modal-item').fadeOut();
});