//スライド上に新しい付箋を追加
function newSticky(id, color, shape, text, page_now, empathy, isEmpathy, isCreated) {
    if(shape == 'left') {
        return `
            <span class="init-sticky sticky sticky-left sticky-page` + page_now + ` change-color-left-` + color + ` created-` + isCreated + `" data-sticky-id="` + id + `" data-color="` + color + `" data-shape="` + shape + `">
                <div class="sticky-text">` + text + `</div>
                <div class="empathy-container">
                    <i class="fas fa-heart empathy-`+ isEmpathy +`" data-empathy-id="` + id + `"></i>
                    <span class="empathy-count empathy-count-`+ isEmpathy +` empathy` + id + `">` + empathy + `</span>
                    <i class="fas fa-trash-alt sticky-trash-btn" data-sticky-trash-id="` + id + `"></i>
                </div>
            </span>
        `
    }
    else if(shape == 'right') {
        return `
            <span class="init-sticky sticky sticky-right sticky-page` + page_now + ` change-color-right-` + color + ` created-` + isCreated + `" data-sticky-id="` + id + `" data-color="` + color + `" data-shape="` + shape + `">
                <div class="sticky-text">` + text + `</div>
                <div class="empathy-container">
                    <i class="fas fa-heart empathy-`+ isEmpathy +`" data-empathy-id="` + id + `"></i>
                    <span class="empathy-count empathy-count-`+ isEmpathy +` empathy` + id + `">` + empathy + `</span>
                    <i class="fas fa-trash-alt sticky-trash-btn" data-sticky-trash-id="` + id + `"></i>
                </div>
            </span>
        `
    }
    else {
        return `
            <span class="init-sticky sticky sticky-page` + page_now + ` created-` + isCreated + `" data-sticky-id="` + id + `" data-color="` + color + `" data-shape="` + shape + `">
                <div class="sticky-text">` + text + `</div>
                <div class="empathy-container">
                    <i class="fas fa-heart empathy-`+ isEmpathy +`" data-empathy-id="` + id + `"></i>
                    <span class="empathy-count empathy-count-`+ isEmpathy +` empathy` + id + `">` + empathy + `</span>
                    <i class="fas fa-trash-alt sticky-trash-btn" data-sticky-trash-id="` + id + `"></i>
                </div>
            </span>
        `
    }
}

function createSticky(page_now, color, shape, text, height) {
    let slide_height = Math.round($('.slide').height());
    let slide_width = Math.round($('.slide').width());
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/create-sticky',
        data : JSON.stringify({
            page: parseInt(page_now),
            color: color,
            shape: shape,
            location_x: 1,
            location_y: 1,
            text: text,
            empathy: 0,
            height: height,
            slide_height, slide_height,
            slide_width: slide_width,
        })
    }).done(function() {
        loadSticky();
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
    let input_text;
    let textarea_size;
    switch(shape) {
        case 'square':
            input_text = $('.static-input').val();
            textarea_size = 22;
            break;
        case 'rectangle':
            textarea_size = 110;
            break;
        case 'left':
        case 'right':
            input_text = $('.dynamic-input').val();
            textarea_size = 16;
            break;
    }

    if (input_text.length >= textarea_size) {
        input_text = input_text.slice(0, textarea_size);
    }
    $('.dynamic-input').val(input_text);
    $('.static-input').val(input_text);
    $('.create-sticky-model-text').html(input_text);
    $('.create-sticky-textarea').attr('maxlength', '' + textarea_size);
}

function resetDesign() {
    let color = $('.create-sticky-model').attr('data-color');
    $('.selected-color').removeClass('selected-color');
    $('.create-sticky-color-blue').addClass('selected-color');
    $('.selected-shape').removeClass('selected-shape');
    $('.selected-shape-left').removeClass('selected-shape-left');
    $('.selected-shape-triangle-left').removeClass('selected-shape-triangle-left');
    $('.selected-shape-right').removeClass('selected-shape-right');
    $('.selected-shape-triangle-right').removeClass('selected-shape-triangle-right');
    $('.create-sticky-shape-square').addClass('selected-shape');
    $('.create-sticky-textarea').val('');
    $('.create-sticky-model').attr('data-color', 'blue');
    $('.create-sticky-model').attr('data-shape', 'square');
    $('.create-sticky-model').removeClass('change-color-left-' + color);
    $('.create-sticky-model').removeClass('change-color-right-' + color);
    $('.create-sticky-model-text').text('');
    $('.square-limit-input-text').show();
    $('.left-right-limit-input-text').hide();
    $('.create-sticky-model').css({
        height: '50px'
    });
    $('.dynamic-input').attr('maxlength', '22');
}

//付箋作成モーダルの表示・非表示
$('.add-sticky-modal-btn').on('click', function() {
    $('.new-sticky-modal-item').fadeIn();
});
$('.new-sticky-modal-close-btn, .new-sticky-modal-bg').on('click', function() {
    $('.new-sticky-modal-item').fadeOut(function() {
        resetDesign();
    });
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
        $('.dynamic-input').show();
        $('.static-input').hide();
        $('.square-limit-input-text').show();
        $('.left-right-limit-input-text').hide();

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
        $('.dynamic-input').hide();
        $('.static-input').show();
        $('.square-limit-input-text').hide();
        $('.left-right-limit-input-text').show();

        $('.create-sticky-model').attr('data-shape', 'left');
        $('.create-sticky-model').addClass('change-color-left-' + color);
        $('.create-sticky-model').css({
            height: '50px'
        });

        changeTextAreaSize('left');
    }
    else if(/right$/.test(shape)) {
        $('.create-sticky-shape-right').addClass('selected-shape selected-shape-right');
        $('.create-sticky-shape-triangle-right').addClass('selected-shape-triangle-right');
        $('.dynamic-input').hide();
        $('.static-input').show();
        $('.square-limit-input-text').hide();
        $('.left-right-limit-input-text').show();

        $('.create-sticky-model').attr('data-shape', 'right');
        $('.create-sticky-model').addClass('change-color-right-' + color);
        $('.create-sticky-model').css({
            height: '50px'
        });

        changeTextAreaSize('right');
    }
});

$(document).on('input', '.dynamic-input', function() {
    $('.create-sticky-model-text').text($('.dynamic-input').val());
    let count = $(this).val().length;
    let maxlength = parseInt($(this).attr('maxlength'));
    if(count <= 110) {
        if(count > maxlength) {
            maxlength += 11;
            $(this).attr('maxlength', '' + maxlength);
            $('.create-sticky-model').css({
                height: '+=16px'
            });
        }
    }
    if(maxlength > 22 && count <= maxlength-11) {
        maxlength -= 11;
        $(this).attr('maxlength', '' + maxlength);
        $('.create-sticky-model').css({
            height: '-=16px'
        });
    }
});
$(document).on('input', '.static-input', function() {
    $('.create-sticky-model-text').text($('.static-input').val());
});

$('.template-sticky-title').on('click', function() {
    $(this).addClass('selected-title');
    $('.create-sticky-title').removeClass('selected-title');
    $('.add-sticky-btn').removeClass('create-mode');
    $('.add-sticky-btn').addClass('template-mode');
});

$('.create-sticky-title').on('click', function() {
    $(this).addClass('selected-title');
    $('.template-sticky-title').removeClass('selected-title');
    $('.add-sticky-btn').removeClass('template-mode');
    $('.add-sticky-btn').addClass('create-mode');
});

//新しい付箋の作成
$('.add-sticky-btn').on('click', function() {
    let id;
    let callback = function(result) {
        id = result;

        if($('.add-sticky-btn').hasClass('create-mode')) {
            let color = $('.create-sticky-model').attr('data-color');
            let shape = $('.create-sticky-model').attr('data-shape');
            let text = $('.create-sticky-model-text').text();
            let page_now = $('.page-now-text').html();
            let height = $('.create-sticky-model').css('height');
            let sticky = newSticky(id+1, color, shape, text, page_now, 0, false, true);
            $('.slide').append(sticky);
            createSticky(page_now, color, shape, text, height);
            $('.init-sticky').css({
                left: '1px',
                top: '1px',
                height: height,
            });
        }
        else if($('.add-sticky-btn').hasClass('template-mode')) {
            let color = $('.selected-template').data('color').replace('light-', '');
            let shape = $('.selected-template').data('shape');
            let text = $('.selected-template > .template-sticky-text').text();
            let page_now = $('.page-now-text').html();
            let sticky = newSticky(id+1, color, shape, text, page_now, 0, false, true);
            $('.slide').append(sticky);
            createSticky(page_now, color, shape, text, "50px");
            $('.init-sticky').css({
                left: '1px',
                top: '1px',
            });
        }

        $('.init-sticky').draggable({
            containment: '.slide',
        });

        $('.init-sticky').removeClass('init-sticky');

        $('.new-sticky-modal-item').fadeOut(function() {
            resetDesign();
        });
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
$('.explain-modal-close-btn, .explain-modal-bg').on('click', function() {
    $('.explain-modal-item').fadeOut(function() {
        $('.explain-app-title-container-init').hide();
        $('.explain-app-item').hide();
        $('.explain-app-title-container').show();
        $('.explain-function-item').show();

        $('.explain-function-default').show();
        $('.explain-function-title, .explain-app-title').removeClass('selected-title');
        $('.explain-function-title').addClass('selected-title');
        $('.explain-text').hide();
        $('.add-highlight-icon').attr('src', '/static/img/highlight-black.png');
        $('.vote-page-icon, .add-highlight-icon, .add-sticky-icon, .visible-sticky-icon, .show-graph-icon, .question-icon').removeClass('explain-default-icon');
        $('.vote-page-icon, .add-highlight-icon, .add-sticky-icon, .visible-sticky-icon, .show-graph-icon, .question-icon').addClass('explain-default-icon');
    });
});

$('.explain-app-title').on('click', function() {
    $('.explain-function-title').removeClass('selected-title');
    $(this).addClass('selected-title');
    $('.explain-function-item').hide();
    $('.explain-app-item').show();
});
$('.explain-function-title').on('click', function() {
    $('.explain-app-title').removeClass('selected-title');
    $(this).addClass('selected-title');
    $('.explain-app-item').hide();
    $('.explain-function-item').show();
});

$('.vote-page-icon, .add-highlight-icon, .add-sticky-icon, .visible-sticky-icon, .show-graph-icon, .question-icon').on('click', function() {
    if($(this).hasClass('add-highlight-icon')) {
        $(this).attr('src', '/static/img/highlight-black.png');
    } else {
        $('.add-highlight-icon').attr('src', '/static/img/highlight-gray.png');
    }
    $('.explain-default-icon').removeClass('explain-default-icon');
    $('.explain-function-default').hide();
    $('.selected-explain-icon').removeClass('selected-explain-icon');
    $(this).addClass('selected-explain-icon');


    if($(this).hasClass('vote-page-icon')) {
        $('.explain-text').hide();
        $('.explain-vote-page-text').show();
    } else if($(this).hasClass('add-highlight-icon')) {
        $('.explain-text').hide();
        $('.explain-add-highlight-text').show();
    } else if($(this).hasClass('add-sticky-icon')) {
        $('.explain-text').hide();
        $('.explain-add-sticky-text').show();
    } else if($(this).hasClass('visible-sticky-icon')) {
        $('.explain-text').hide();
        $('.explain-visible-sticky-text').show();
    } else if($(this).hasClass('show-graph-icon')) {
        $('.explain-text').hide();
        $('.explain-show-graph-text').show();
    } else if($(this).hasClass('question-icon')) {
        $('.explain-text').hide();
        $('.explain-question-text').show();
    }
});