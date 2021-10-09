$('.sticky').draggable({
    containment: '.slide',
});

//スライド上に新しい付箋を追加
function newSticky(id, color, shape, text, page_now, empathy, isEmpathy) {
    if(shape == 'left') {
        return `
            <span class="init-sticky sticky sticky-left sticky-page` + page_now + ` change-color-left-` + color + `" data-sticky-id="` + id + `" data-color="` + color + `" data-shape="` + shape + `">
                <div class="sticky-text">` + text + `</div>
                <div class="empathy-container">
                    <i class="fas fa-heart empathy-`+ isEmpathy +`" data-empathy-id="` + id + `"></i>
                    <span class="empathy-count empathy-`+ isEmpathy +`">` + empathy + `</span>
                    <i class="fas fa-trash-alt trash-btn" data-trash-id="` + id + `"></i>
                </div>
            </span>
        `
    }
    else if(shape == 'right') {
        return `
            <span class="init-sticky sticky sticky-right sticky-page` + page_now + ` change-color-right-` + color + `" data-sticky-id="` + id + `" data-color="` + color + `" data-shape="` + shape + `">
                <div class="sticky-text">` + text + `</div>
                <div class="empathy-container">
                    <i class="fas fa-heart empathy-`+ isEmpathy +`" data-empathy-id="` + id + `"></i>
                    <span class="empathy-count empathy-`+ isEmpathy +`">` + empathy + `</span>
                    <i class="fas fa-trash-alt trash-btn" data-trash-id="` + id + `"></i>
                </div>
            </span>
        `
    }
    else {
        return `
            <span class="init-sticky sticky sticky-page` + page_now + `" data-sticky-id="` + id + `" data-color="` + color + `" data-shape="` + shape + `">
                <div class="sticky-text">` + text + `</div>
                <div class="empathy-container">
                    <i class="fas fa-heart empathy-`+ isEmpathy +`" data-empathy-id="` + id + `"></i>
                    <span class="empathy-count empathy-`+ isEmpathy +`">` + empathy + `</span>
                    <i class="fas fa-trash-alt trash-btn" data-trash-id="` + id + `"></i>
                </div>
            </span>
        `
    }
}

function createSticky(page_now, color, shape, text) {
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/create-sticky',
        data : JSON.stringify({
            page: parseInt(page_now),
            color: color,
            shape: shape,
            location_x: 0,
            location_y: 0,
            text: text,
            empathy: 0
        })
    }).done(function() {
    }).fail(function() {
        console.log('通信失敗');
    });
}

function updateSticy(id, location_x, location_y) {
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/update-sticky',
        data : JSON.stringify({
            "id": id,
            "location_x": parseInt(location_x),
            "location_y": parseInt(location_y)
        })
    }).done(function() {
    }).fail(function() {
        console.log('通信失敗');
    });
}

//付箋モデルの形を変更した際に、テキストエリアとモデル内の文字をその形に合った文字数に変更
function changeTextAreaSize(shape) {
    let input_text = $('.create-sticky-textarea').val();
    let textarea_size;
    switch(shape) {
        case 'square':
            textarea_size = 22;
            break;
        case 'rectangle':
            textarea_size = 110;
            break;
        case 'left':
        case 'right':
            textarea_size = 16;
            break;
    }

    if (input_text.length >= textarea_size) {
        input_text = input_text.slice(0, textarea_size);
    }
    $('.create-sticky-textarea').val(input_text);
    $('.create-sticky-model-text').html(input_text);
    $('.create-sticky-textarea').attr('maxlength', '' + textarea_size);
}

//付箋作成モーダルの表示・非表示
$('.close-modal-btn').on('click', function() {
    $('.new-sticky-modal-item').fadeOut();
});
$('.add-sticky-btn').on('click', function() {
    $('.new-sticky-modal-item').fadeIn();
});
$('.new-sticky-modal-bg').on('click', function() {
    $('.new-sticky-modal-item').fadeOut();
});

$('.create-sticky-title').on('click', function() {
    $('.template-sticky-container').hide();
    $('.create-sticky-container').show();
});

$('.template-sticky-title').on('click', function() {
    $('.create-sticky-container').hide();
    $('.template-sticky-container').show();
});

//色の変更
$('[class^=create-sticky-color-]').on('click', function() {
    if($(this).hasClass("selected-color")) {
        return;
    }

    let new_color = $(this).attr('class').replace('create-sticky-color-', '');
    let old_color = $('.create-sticky-model').attr('data-color');
    let shape = $('.create-sticky-model').attr('data-shape');

    $('.create-sticky-model').attr('data-color', new_color);

    //選択表示の切り替え
    $('.selected-color').removeClass('selected-color');
    $(this).addClass('selected-color');

    //矢印付箋の三角形とbeforeをリセット
    $('.create-sticky-model').removeClass('change-color-left-' + old_color);
    $('.create-sticky-model').removeClass('change-color-right-' + old_color);

    if(shape == 'left') {
        $('.create-sticky-model').addClass('change-color-left-' + new_color);
    }
    else if(shape == 'right') {
        $('.create-sticky-model').addClass('change-color-right-' + new_color);
    }
});

//形の変更
$('[class^=create-sticky-shape-]').on('click', function() {
    if($(this).hasClass("selected-shape") || $(this).hasClass("selected-shape-left") || $(this).hasClass("selected-shape-right")) {
        return;
    }
    let shape = $(this).attr('class').replace('create-sticky-shape-', '');
    let color = $('.create-sticky-model').attr('data-color');

    //選択表示を消去
    $('.selected-shape').removeClass('selected-shape');
    $('.selected-shape-left').removeClass('selected-shape-left');
    $('.selected-shape-right').removeClass('selected-shape-right');
    $('.selected-shape-triangle-left').removeClass('selected-shape-triangle-left');
    $('.selected-shape-triangle-right').removeClass('selected-shape-triangle-right');

    //矢印付箋の三角形とbeforeをリセット
    $('.create-sticky-model').removeClass('change-color-left-' + color);
    $('.create-sticky-model').removeClass('change-color-right-' + color);

    if(/square$/.test(shape)) {
        $(this).addClass('selected-shape');
        $('.create-sticky-model').attr('data-shape', 'square');

        changeTextAreaSize('square');
    }
    else if(/rectangle$/.test(shape)) {
        $(this).addClass('selected-shape');
        $('.create-sticky-model').attr('data-shape', 'rectangle');

        changeTextAreaSize('rectangle');
    }
    else if(/left$/.test(shape)) {
        $('.create-sticky-shape-left').addClass('selected-shape selected-shape-left');
        $('.create-sticky-shape-triangle-left').addClass('selected-shape-triangle-left');

        $('.create-sticky-model').attr('data-shape', 'left');
        $('.create-sticky-model').addClass('change-color-left-' + color);

        changeTextAreaSize('left');
    }
    else if(/right$/.test(shape)) {
        $('.create-sticky-shape-right').addClass('selected-shape selected-shape-right');
        $('.create-sticky-shape-triangle-right').addClass('selected-shape-triangle-right');

        $('.create-sticky-model').attr('data-shape', 'right');
        $('.create-sticky-model').addClass('change-color-right-' + color);

        changeTextAreaSize('right');
    }
});

$(document).on('input', '.create-sticky-textarea', function() {
    $('.create-sticky-model-text').text($('.create-sticky-textarea').val());
});

$('.template-sticky-title').on('click', function() {
    $(this).addClass('selected-title');
    $('.create-sticky-title').removeClass('selected-title');
    $('.new-sticky-btn').removeClass('create-mode');
    $('.new-sticky-btn').addClass('template-mode');
});

$('.create-sticky-title').on('click', function() {
    $(this).addClass('selected-title');
    $('.template-sticky-title').removeClass('selected-title');
    $('.new-sticky-btn').removeClass('template-mode');
    $('.new-sticky-btn').addClass('create-mode');
});

//新しい付箋の作成
$('.new-sticky-btn').on('click', function() {
    let id;
    let callback = function(result) {
        console.log('result:' + result);
        id = result;
        console.log(id);

        if($('.new-sticky-btn').hasClass('create-mode')) {
            let color = $('.create-sticky-model').attr('data-color');
            let shape = $('.create-sticky-model').attr('data-shape');
            let text = $('.create-sticky-model-text').text();
            let page_now = $('.page-now-text').html();
            let sticky = newSticky(id+1, color, shape, text, page_now, 0, false);
            $('.slide').append(sticky);
            createSticky(page_now, color, shape, text);
            socket.send("create," + id + "," + color + "," + shape + "," + text + "," + page_now);
        }
        else if($('.new-sticky-btn').hasClass('template-mode')) {
            let color = $('.selected-template').data('color').replace('light-', '');
            let shape = $('.selected-template').data('shape');
            let text = $('.selected-template > .template-sticky-text').text();
            let page_now = $('.page-now-text').html();
            let sticky = newSticky(id+1, color, shape, text, page_now, 0, false);
            $('.slide').append(sticky);
            createSticky(page_now, color, shape, text);
        }

        $('.sticky').draggable({
            containment: '.slide',
        });
        $('.init-sticky').css({
            left: 0,
            top: 0
        });
        $('.init-sticky').removeClass('init-sticky');

        $('.new-sticky-modal-item').fadeOut();
    }
    loadStikyIdCallBack(callback);
});

$("[class^='template-sticky-model-']").on('click', function() {
    $('.selected-template').removeClass('selected-template');
    $(this).addClass('selected-template');
});

//説明モーダルの表示・非表示
$('.question-btn').on('click', function() {
    $('.explain-modal-item').fadeIn();
});
$('.explain-modal-bg').on('click', function() {
    $('.explain-modal-item').fadeOut();
});
