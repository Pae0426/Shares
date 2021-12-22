function createHighlight(page_now, width, width_sum, height_slide, x, y) {
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/add-highlight',
        data: JSON.stringify({
           page: page_now,
           width: width,
           x: x + width_sum,
           y: y,
           win_width: winWidth,
           win_height: winHeight,
        })
    }).done(function(id) {
        addHighlight(true, id, width, width_sum, height_slide, page_now, x, y, page_now);
    }).fail(function() {
        console.log('通信失敗');
    });
}

function addHighlight(isCreate, id, width, width_sum, height_slide, page, x, y, page_now) {
    let highlight;
    if(page == page_now){
        highlight = `
        <span class="highlight highlight-page` + page + `" data-highlight-id="` + id + `" style="width:` + width + `px;height:10px;left:` + x + `px; top:` + y + `px"></span>
        `;
    } else {
        highlight = `
        <span class="highlight` + id + ` highlight-page` + page + `" data-highlight-id="` + id + `" style="width:` + width + `px;height:10px;left:` + x + `px; top:` + y + `px;display:none"></span>
        `;
    }
    $('.slide').append(highlight);

    $('[data-highlight-id="' + id + '"]').resizable({
        minHeight: 10,
        maxHeight: 10,
        handles: "e",
        autoHide: true,
    });
    
    isHighlight = false;
    $('[data-highlight-id="' + id + '"]').removeClass('ui-resizable');

    x = Math.round(x + width_sum);
    y = Math.round(y + height_slide);
    if(!(isCreate)) {
        // let x_margin = $('.slide-container').outerWidth(true);
        // let x_border = $('.slide-container').outerWidth();
        // let x_diff = (x_margin - x_border) / 2;
        x -= width_sum;
    }
    $('[data-highlight-id="' + id + '"]').css({
        position: "absolute",
        left: x + "px",
        top: y + "px",
    });

    $('.add-highlight-btn').removeClass('highlighting');
    highlightWidth[id] = width;
}

function updateHighlight() {
    console.log(highlightWidth);
    for(let id in highlightWidth) {
        console.log(highlightWidth[id]);
        if($('[data-highlight-id="' + id + '"').width() != highlightWidth[id]) {
            console.log('------------');
            $.ajax({
                dataType: 'json',
                contentType: 'application/json',
                type: 'POST',
                url: '/update-highlight',
                data: JSON.stringify({
                    id: parseInt(id),
                    width: parseInt($('[data-highlight-id="' + id + '"').width()),
                }),
            }).done(function() {
                highlightWidth[id] = $('[data-highlight-id="' + id + '"').width();
            }).fail(function() {
                console.log('通信失敗');
            });
        }
    }
}

$('.add-highlight-btn').on('click', function() {
    if($(this).hasClass('highlighting')) {
        $(this).removeClass('highlighting');
        isHighlight = false;
    } else {
        $(this).addClass('highlighting');
        isHighlight = true;
    }
});

$('.display-page').on('click', function(e) {
    if(isHighlight) {
        let page_now = parseInt($('.page-now-text').html());
        let x_abs = e.clientX;
        let x_margin = $('.slide-container').outerWidth(true);
        let x_border = $('.slide-container').outerWidth();
        let x_diff = (x_margin - x_border) / 2;
        let y_abs = e.pageY;
        let y_diff = 184;
        let height_slide = $('.slide').height();

        let page_highlights = [];
        $('.highlight-page' + page_now).each(function() {
            page_highlights.push($(this).data('highlight-id'));
        });
    
        let width_sum = 0;
        for(i=0;i<page_highlights.length;i++) {
            let width = $('[data-highlight-id="' + page_highlights[i] + '"]').width();
            if(width == undefined) {
                width = 0;
            }
            width_sum += width;
        }
        let x = Math.round(x_abs - x_diff - width_sum);
        let y = Math.round(y_abs - y_diff - height_slide - 5);
        console.log(width_sum);

        createHighlight(page_now, 10, width_sum, height_slide, x, y);
    }
});

$(document).on('dblclick', '[class^="highlight"]', function() {
    let id = $(this).data('highlight-id');
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/remove-highlight',
        data: JSON.stringify({
            id: parseInt(id),
        })
    }).done(function() {
        $('[data-highlight-id="' + id + '"]').remove();
    }).fail(function() {
        console.log('通信失敗');
    });
});
