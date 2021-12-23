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
                let shape = stickies[i]['shape'];
                let height = stickies[i]['height'];
                let slideWidth = Math.round($('.slide').width());
                let slideHeight = Math.round($('.slide').height());
                let slide_width = stickies[i]['slide_width'];
                let slide_height = stickies[i]['slide_height'];
                if(slideWidth != slide_width) {
                    let rate_slide_width = slideWidth / slide_width;
                    x = Math.round(x * rate_slide_width);
                    if(shape == 'right') {
                        x += 100;
                    }
                }
                let half_height = parseInt(height.replace('px', '')) / 2;
                if(slideHeight != slide_height) {
                    let rate_slide_height = slideHeight / slide_height;
                    if(slideHeight < slide_height) {
                        y = Math.round((y * rate_slide_height) - half_height);
                    } else if(slideHeight > slide_height) {
                        y = Math.round((y * rate_slide_height) + half_height);
                    }
                    
                }
                
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
        let not_remove_highlight = [];
        for(i in highlightInfo.sumWidth) {
            let sum_width = highlightInfo.sumWidth[i];
            for(j in highlightInfo.highlights) {
                let id = highlightInfo.highlights[j]['id'];
                let width = highlightInfo.highlights[j]['width'];
                if(exist_id.includes(id)) {
                    not_remove_highlight.push(exist_id[j]);
                    continue;
                }
                if(width == 10) {
                    not_remove_highlight.push(exist_id[j]);
                    continue;
                }
                let page = highlightInfo.highlights[j]['page'];
                if(page == page_count) {
                    let x = highlightInfo.highlights[j]['x'];
                    let y = highlightInfo.highlights[j]['y'];
                    let page_now = parseInt($('.page-now-text').html());
                    let win_width = highlightInfo.highlights[j]['win_width'];
                    let slide_height = highlightInfo.highlights[j]['slide_height'];
                    let slide_width = highlightInfo.highlights[j]['slide_width'];
                    let slideHeight = Math.round($('.slide').height());
                    let slideWidth = Math.round($('.slide').width());

                    // ハイライト登録時と現在のウィンドウサイズが異なる場合、位置を調整する
                    if(winWidth != win_width) {
                        let rate_width = winWidth / win_width;
                        x = Math.round(x * rate_width);
                    }
                    if(slideHeight != slide_height) {
                        if(slideHeight > slide_height) {
                            y = Math.round(y * slideHeight/slide_height + 10);
                        } else if(slideHeight < slide_height) {
                            y = Math.round(y * slideHeight/slide_height - 10);
                        }
                        
                    }

                    // ハイライト登録時と現在のウィンドウサイズが異なる場合、長さを調整する
                    if(slideWidth != slide_width) {
                        let rate_slide_width = slideWidth / slide_width;
                        width = Math.round(width*rate_slide_width);
                    }

                    addHighlight(false, id, width, sum_width, slideHeight, page, x, y, page_now);
                    highlightWidth[id] = width;
                    delete highlightInfo.highlights[j];
                    not_remove_highlight.push(exist_id[j]);
                } else {
                    page_count += 1;
                    break;
                }
            }
        }
        let remove_highlight = exist_id.filter(item => 
            not_remove_highlight.indexOf(item) == -1
        )
        for(let i in remove_highlight) {
            $('[data-highlight-id="' + remove_highlight[i] + '"]').remove();
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
