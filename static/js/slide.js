//スライドの遷移を制御
function pageControl(action) {
    let page_now = $('.page-now-text').html();
    page_now = parseInt(page_now);
    if(action == 'next') {
        //最終ページか否かで処理を分岐
        if (page_now == PAGE_TOTAL) {
            $('.fa-chevron-right').css('color', '#C0C0C0');
            $('.next-slide-btn').prop('disabled', true);
            return;
        }else if(page_now + 1 == PAGE_TOTAL) {
            $('.fa-chevron-right').css('color', '#C0C0C0');
            $('.next-slide-btn').prop('disabled', true);
            $('.sticky-page' + page_now).hide();
        } else {
            $('.fa-chevron-left').css('color', '#fff');
            $('.prev-slide-btn').prop('disabled', false);
            $('.sticky-page' + page_now).hide();
        }
        page_now += 1;
    } else if(action == 'prev') {
        //初期ページか否かで処理を分岐
        if (page_now == 1) {
            $('.fa-chevron-left').css('color', '#C0C0C0');
            $('.prev-slide-btn').prop('disabled', true);
            return;
        } else if(page_now - 1 == 1) {
            $('.fa-chevron-left').css('color', '#C0C0C0');
            $('.prev-slide-btn').prop('disabled', true);
            $('.sticky-page' + page_now).hide();
        } else {
            $('.fa-chevron-right').css('color', '#fff');
            $('.next-slide-btn').prop('disabled', false);
            $('.sticky-page' + page_now).hide();
        }
        page_now -= 1;
    }
    let next_jpeg_file_path = '/static/pdf/' + PDF_DIR + '/' + page_now + '.jpeg';
    $('.display-page').attr('src', next_jpeg_file_path);
    $('.progressbar').css('width', 'calc(' + page_now + ' / ' + PAGE_TOTAL + ' * 100%)');
    $('.page-now-text').html(page_now);
    $('.page-now-vote').html(page_now);
    if(isVisible) {
        $('.sticky-page' + page_now).show();
    }
}

//スライドの遷移操作
$('.next-slide-btn').on('click', function() {
    pageControl('next');
});
$('.prev-slide-btn').on('click', function() {
    pageControl('prev');
});

//付箋表示・非表示切り替え
$('.visible-sticky-btn').on('click', function() {
    let page_now = $('.page-now-text').html();
    page_now = parseInt(page_now);
    $(this).hide();
    $('.sticky-page' + page_now).hide();
    $('.invisible-sticky-btn').show();
    isVisible = false;
});
$('.invisible-sticky-btn').on('click', function() {
    let page_now = $('.page-now-text').html();
    page_now = parseInt(page_now);
    $(this).hide();
    $('.sticky-page' + page_now).show();
    $('.visible-sticky-btn').show();
    isVisible = true;
});

$(document).on('mouseup', '.sticky', function() {
    let id = $(this).data('sticky-id');
    let style_str = $(this).attr('style');
    let style_list = style_str.match(/[0-9]+/g);
    let location_x = style_list[0];
    let location_y = style_list[1];
    updateSticy(id, location_x, location_y);

    if(!socket) {
        alert("エラー: WebSocket通信が行われていません。");
        return false;
    }
    socket.send("move," + id + "," + location_x + "," + location_y);
});

//いいね機能
$(document).on('click', '.empathy-false', function(e) {
    $(this).addClass('empathy-true');
    $(this).removeClass('empathy-false');
    $(this).next('.empathy-count').addClass('empathy-true');
    $(this).next('.empathy-count').removeClass('empathy-false');
    let empathy_count = $(this).next('.empathy-count').text();
    empathy_count = parseInt(empathy_count) + 1;
    $(this).next('.empathy-count').text(empathy_count);

    let id = $(this).data("empathy-id");
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/increment-empathy',
        data: JSON.stringify({
            id: id,
        })
    }).done(function() {
    }).fail(function() {
        console.log('通信失敗');
    });
});
$(document).on('click', '.empathy-true', function(e) {
    $(this).addClass('empathy-false');
    $(this).removeClass('empathy-true');
    $(this).next('.empathy-count').addClass('empathy-false');
    $(this).next('.empathy-count').removeClass('empathy-true');
    let empathy_count = $(this).next('.empathy-count').text();
    empathy_count = parseInt(empathy_count) - 1;
    $(this).next('.empathy-count').text(empathy_count);
    
    let id = $(this).data("empathy-id");
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/decrement-empathy',
        data: JSON.stringify({
            id: id,
        })
    }).done(function() {
    }).fail(function() {
        console.log('通信失敗');
    });
});

$(document).on('click', '.trash-btn', function() {
    let id = $(this).data("trash-id");
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/remove-sticky',
        data: JSON.stringify({
            id: id,
        })
    }).done(function() {
        $('[data-sticky-id="' + id + '"]').remove();
        socket.send("remove," + id);
    }).fail(function() {
        console.log('通信失敗');
    });
});
