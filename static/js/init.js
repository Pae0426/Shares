$('.progressbar').css('width', 'calc(1 / ' + page_total + ' * 100%)');
$('.template-sticky-container').hide();
$('.invisible-sticky-btn').hide();

// いいね情報をbool型配列で取得
function getEmpathyInfo() {
    return $.ajax({
        dataType: 'json',
        type: 'GET',
        url: '/get-empathy-info',
    })
}

//既に貼られている付箋をDBから取得して表示
function loadSticky() {
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: '/stickies',
    }).done(function(stickies) {
        getEmpathyInfo().done(function(empathyInfo) {
            $('.sticky').remove();
            for(let i in stickies) {
                let id = stickies[i]['id'];
                let color = stickies[i]['color'];
                let shape = stickies[i]['shape'];
                let text = stickies[i]['text'];
                let page_now = stickies[i]['page'];
                let x = stickies[i]['location_x'];
                let y = stickies[i]['location_y'];
                let empathy = stickies[i]['empathy'];
                if (empathy == undefined) {
                    empathy = 0;
                }
                let isEmpathy;
                if (empathyInfo[id] == 1) {
                    isEmpathy = true
                }
                else {
                    isEmpathy = false
                }
                let sticky = newSticky(id, color, shape, text, page_now, empathy, isEmpathy);
                $('.slide').append(sticky);
                $('.sticky').draggable({
                    containment: '.slide',
                });
                $('.init-sticky').css({
                    left: x + 'px',
                    top: y + 'px'
                });
                if(page_now != 1) {
                    $('.init-sticky').hide();
                }
                $('.init-sticky').removeClass('init-sticky');
            }
        }).fail(function() {
            console.log('通信失敗');
        });
    }).fail(function(){
        console.log('通信失敗');
    })
}

function loadStikyIdCallBack(callback) {
    $.ajax({
        dataType: 'json',
        type: 'GET',
        url: '/load-sticky-id',
    }).done(function(id) {
        callback(id);
    }).fail(function() {
        console.log('通信失敗');
        callback(-1);
    });
}

//初期付箋を読み込み
loadSticky();
