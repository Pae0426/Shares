//ページ投票グラフ表示
let data_label = [];
for(let i=1;i<47;i++) {
    data_label.push(i.toString());
}
let ctx = document.getElementById("chart").getContext('2d');
let myChart = new Chart(ctx, {
    type: "bar",
    data: {
        labels: data_label,
        datasets: [
            {
                label: "投票数",
                data: [10, 22, 10, 9, 12, 6],
                backgroundColor: "blue",
            },
        ]
    },
    options: {
        responsive: true,
        scales: {
            xAxes: [{
                ticks: {
                    stepSize: 1,
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
            //ホバー時の動作（single, label, dataset）
            mode: 'single'
        },
    }
});

$('.vote-page-btn').on('click', function() {
    $('.vote-page-modal-item').fadeIn();
});
$('.vote-page-modal-bg').on('click', function() {
    $('.vote-page-modal-item').fadeOut();
});