$('.progressbar').css('width', 'calc(1 / ' + page_total + ' * 100%)');
$('.left-right-limit-input-text').hide();
$('.static-input').hide();
$('.template-sticky-container').hide();
$('.invisible-btn').hide();
$('.explain-modal-item').fadeIn();

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
                let user_id = stickies[i]['user_cookie'];
                let cookie_user_id = $.cookie('user-id');
                let isCreated;
                if(user_id == cookie_user_id) {
                    isCreated = true;
                } else {
                    isCreated = false;
                }

                let sticky = newSticky(id, color, shape, text, page, empathy, isEmpathy, isCreated);
                $('.slide').append(sticky);
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

            $('.sticky').each(function(i) {
                if($(this).hasClass('created-true')) {
                    $(this).draggable({
                        containment: '.slide',
                    });
                } else {
                    $(this).find('.sticky-trash-btn').remove();
                }
            });
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

function loadHighlight() {
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        url: '/get-highlight-info',
    }).done(function(highlightInfo) {
        let exist_id = $('.highlight').map(function() {
            return $(this).data('highlight-id');
        }).toArray();

        let page_count = 1;
        for(i in highlightInfo.sumWidth) {
            let sum_width = highlightInfo.sumWidth[i];
            for(j in highlightInfo.highlights) {
                let id = highlightInfo.highlights[j]['id'];
                let width = highlightInfo.highlights[j]['width'];
                if(exist_id.includes(id)) {
                    continue;
                }
                if(width == 10) {
                    continue
                }
                let page = highlightInfo.highlights[j]['page'];
                if(page == page_count) {
                    let x = highlightInfo.highlights[j]['x'];
                    let y = highlightInfo.highlights[j]['y'];
                    let page_now = parseInt($('.page-now-text').html());
                    let win_width = highlightInfo.highlights[j]['win_width'];
                    let slide_height = highlightInfo.highlights[j]['slide_height'];
                    let slideHeight = Math.round($('.slide').height());
                    if(winWidth != win_width) {
                        let rate_width = winWidth / win_width;
                        x *= rate_width;
                    }
                    if(slideHeight != slide_height) {
                        if(slideHeight > slide_height) {
                            y = Math.round(y*slideHeight/slide_height + 10);
                        } else if(slideHeight < slide_height) {
                            y = Math.round(y*slideHeight/slide_height - 10);
                        }
                        
                    }
                    addHighlight(false, id, width, sum_width, slideHeight, page, x, y, page_now);
                    highlightWidth[id] = width;
                    delete highlightInfo.highlights[j]
                } else {
                    page_count += 1;
                    break;
                }
            }
        }
    }).fail(function() {
        console.log('通信失敗');
    })
}

function loadVotedPage() {
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        url: '/get-vote-page-info',
    }).done(function(vote_info) {
        pageVotedInfo = vote_info.userVotePage;
        if(pageVotedInfo[0] == 1) {
            $('.vote-page-btn').addClass('voted-page');
            $('.vote-page-caption').text('このページの投票をやめる');
        }
    }).fail(function(){
        console.log('通信失敗');
    });
}

// 初期付箋を読み込み
loadSticky();
// 初期ハイライトを読み込み
loadHighlight();
// ページ投票を読み込み
loadVotedPage();
