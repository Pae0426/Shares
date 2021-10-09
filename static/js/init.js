
$('.progressbar').css('width', 'calc(1 / ' + page_total + ' * 100%)');
$('.template-sticky-container').hide();
$('.invisible-sticky-btn').hide();

//WebSocketデータ取得
if(!window["WebSocket"]) {
    alert("エラー: WebSocketに対応していないブラウザです。");
} else {
    socket = new WebSocket("ws://" + location.host + "/room");
    socket.onclose = function() {
        alert("接続が終了しました。");
    }
    socket.onmessage = function(e) {
        let socket_slice = e.data.split(',');
        let socket_action = socket_slice[0];
        if (socket_action == 'move') {
            let socket_id = socket_slice[1];
            let socket_x = socket_slice[2];
            let socket_y = socket_slice[3];
            $('[data-sticky-id="'+ socket_id +'"]').animate({
                'left': socket_x + 'px',
                'top': socket_y + 'px'
            })
        }
        else if (socket_action == 'create') {
            let id = parseInt(socket_slice[1]);
            let color = socket_slice[2];
            let shape = socket_slice[3];
            let text = socket_slice[4];
            let new_sticky_page = socket_slice[5];
            let page_now = $('.page-now-text').html();
            let sticky = newSticky(id+1, color, shape, text, new_sticky_page, 0, false);
            $('.slide').append(sticky);
            $('.sticky').draggable({
                containment: '.slide',
            });
            if (new_sticky_page != page_now) {
                $('.init-sticky').hide();
            }
            $('.init-sticky').css({
                left: 0,
                top: 0
            });
            $('.init-sticky').removeClass('init-sticky');
        }
        else if (socket_action == 'remove') {
            let id = parseInt(socket_slice[1]);
            $('[data-sticky-id="' + id + '"]').remove();
        }
    }
}

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
