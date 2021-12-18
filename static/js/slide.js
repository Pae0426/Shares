$(function() {
    setInterval(function() {
        loadSticky();
    }, 20000);
})

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
    $('.vote-page-btn').removeClass('voted-page');
    $('.vote-page-caption').text('このページに投票する');
    if(pageVotedInfo[page_now-1] == 1) {
        $('.vote-page-btn').addClass('voted-page');
        $('.vote-page-caption').text('このページの投票をやめる');
    }
}

//スライドの遷移操作
$('.next-slide-btn').on('click', function() {
    pageControl('next');
});
$('.prev-slide-btn').on('click', function() {
    pageControl('prev');
});
$('html').keyup(function(e) {
    switch(e.which) {
        case 39:
            pageControl('next');
        break;
        case 37:
            pageControl('prev');
        break;
    }
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
});

//いいね機能
$(document).on('click', '.empathy-false', function(e) {
    $(this).addClass('empathy-true');
    $(this).removeClass('empathy-false');
    $(this).next('.empathy-count').addClass('empathy-count-true');
    $(this).next('.empathy-count').removeClass('empathy-count-false');
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
    $(this).next('.empathy-count').addClass('empathy-count-false');
    $(this).next('.empathy-count').removeClass('empathy-count-true');
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

$(document).on('click', '.sticky-trash-btn', function() {
    let id = $(this).data("sticky-trash-id");
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
    }).fail(function() {
        console.log('通信失敗');
    });
});

$('.vote-page-btn').hover(function() {
    $(this).next('.vote-page-caption').show();
}, function() {
    $(this).next('.vote-page-caption').hide();
});

$('.add-highlight-btn').hover(function() {
    $(this).next('.add-highlight-caption').show();
}, function() {
    $(this).next('.add-highlight-caption').hide();
});

$('.add-sticky-modal-btn').hover(function() {
    $(this).next('.add-sticky-caption').show();
}, function() {
    $(this).next('.add-sticky-caption').hide();
});

$('.visible-sticky-btn').hover(function() {
    $(this).next('.visible-sticky-caption').show();
}, function() {
    $(this).next('.visible-sticky-caption').hide();
});

$('.invisible-sticky-btn').hover(function() {
    $(this).next('.visible-sticky-caption').show();
}, function() {
    $(this).next('.visible-sticky-caption').hide();
});

$('.show-graph-btn').hover(function() {
    $(this).next('.show-graph-caption').show();
}, function() {
    $(this).next('.show-graph-caption').hide();
});

$('.question-btn').hover(function() {
    $(this).next('.question-caption').show();
}, function() {
    $(this).next('.question-caption').hide();
});


// let oldX = null;//始点
// let oldY = null;//始点
// let moveX = null;
// let moveY = null;
// let pX = null;//終点
// let pY = null;//終点
// let can_mouse_event = false;
// let storedLines = [];

// const can = document.getElementById("can");
// const ctx = can.getContext("2d");

// can.onmousedown = function(e){
//     oldX = e.offsetX;
//     oldY = e.offsetY;
//     can_mouse_event = true;
// };

// can.onmousemove = function(e){
//     if(can_mouse_event == true){
//         Redraw();
//         moveX = e.offsetX;
//         moveY = e.offsetY;
//         ctx.strokeStyle = "#000";
//         ctx.lineWidth = 1;
//         ctx.lineJoin  = "round";
//         ctx.lineCap   = "round";
//         ctx.beginPath();
//         ctx.moveTo(oldX,oldY);
//         ctx.lineTo(moveX,moveY);
//         ctx.stroke();
//     }
// };

// function Redraw(){
//     ctx.clearRect(0,0,can.width,can.height);
//     if(storedLines.length == 0){
//         return;
//     }
//     for(let i = 0; i<storedLines.length; i++){
//         ctx.beginPath();
//         ctx.moveTo(storedLines[i].x1, storedLines[i].y1);
//         ctx.lineTo(storedLines[i].x2, storedLines[i].y2);
//         ctx.stroke();
//     }
// }

// can.onmouseup = function(e){
//     can_mouse_event = false;
//     pX = e.offsetX;
//     pY = e.offsetY;
//     storedLines.push({
//         x1:oldX,
//         y1:oldY,
//         x2:pX,
//         y2:pY
//     })
// };

// can.onmouseout = function(){
//     can_mouse_event = false;
// };

// let c_width = $('.slide').width();
// let c_height = $('.slide').height();
// $('#can').attr('width', c_width);
// $('#can').attr('height', c_height);

// let img = new Image();
// img.src = "/static/pdf/12/1.jpeg"
// ctx.drawImage(img, 0, 0, c_width, c_height);