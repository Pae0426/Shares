$('.vote-page-modal-btn').on('click', function() {
    $('.vote-page-modal-item').fadeIn();
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        url: '/get-vote-page-info',
    }).done(function(vote_data) {
        //ページ投票グラフ表示
        let data_label = [];
        for(let i=1;i<=page_total;i++) {
            data_label.push(i.toString());
        }
        let ctx = document.getElementById("chart").getContext('2d');
        myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data_label,
                datasets: [
                    {
                        label: "投票数",
                        data: vote_data,
                        backgroundColor: "blue",
                    },
                ]
            },
            options: {
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
    }).fail(function() {
        console.log('通信失敗');
    });
});
$('.vote-page-modal-close-btn, .vote-page-modal-bg').on('click', function() {
    if (myChart) {
        myChart.destroy();
    }
    $('.vote-page-modal-item').fadeOut();
});