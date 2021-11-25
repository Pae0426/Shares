$('.progressbar').css('width', 'calc(1 / ' + page_total + ' * 100%)');
$('.static-input').hide();
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
            let exist_id = $('.sticky').map(function() {
                return $(this).data('sticky-id');
            }).toArray();

            for(let i in stickies) {
                let id = stickies[i]['id'];
                let x = stickies[i]['location_x'];
                let y = stickies[i]['location_y'];
                let height = stickies[i]['height'];
                
                if(exist_id.includes(id)) {
                    $('[data-sticky-id="'+ id +'"]').animate({
                        'left': x + 'px',
                        'top': y + 'px',
                        'height': height
                    });
                    exist_id[$.inArray(id, exist_id)] = -1;
                    continue;
                }

                let color = stickies[i]['color'];
                let shape = stickies[i]['shape'];
                let text = stickies[i]['text'];
                let page = stickies[i]['page'];
                let page_now = parseInt($('.page-now-text').html());
                let empathy = stickies[i]['empathy'];
                if (empathy == undefined) {
                    empathy = 0;
                }
                let isEmpathy;
                if (empathyInfo[id] == 1) {
                    isEmpathy = true
                } else {
                    isEmpathy = false
                }

                let sticky = newSticky(id, color, shape, text, page, empathy, isEmpathy);
                $('.slide').append(sticky);
                $('.sticky').draggable({
                    containment: '.slide',
                });
                $('.init-sticky').css({
                    left: x + 'px',
                    top: y + 'px',
                    height: height
                });
                if(page != page_now) {
                    $('.init-sticky').hide();
                }
                $('.init-sticky').removeClass('init-sticky');
            }

            for(i in exist_id) {
                if(exist_id[i] >= 0) {
                    $('[data-sticky-id="' + exist_id[i] + '"]').remove();
                }
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
