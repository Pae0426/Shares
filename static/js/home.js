$(function() {
    let page_total = $('.progressbar').data('total-progress');
    const PAGE_TOTAL = parseInt(page_total);
    $('.sticky').draggable({
        containment: '.slide',
    });
    $('.progressbar').css('width', 'calc(1 / ' + page_total + ' * 100%)');

    
    function newSticky(color, text) {
        let page_now = $('.page-now-text').html();
        return '<span class="sticky sticky-page' + page_now + '" data-color="' + color + '">' + '<span class="sticky-text">' + text +'</span></span>';
    }

    function pageControl(action) {
        let page_now = $('.page-now-text').html();
        page_now = parseInt(page_now);
        if(action == 'next') {
            //最終ページか否かで処理を分岐
            if (page_now == PAGE_TOTAL) {
                $('.fa-chevron-right').css('color', '#C0C0C0');
                $('.slide-button-next').prop('disabled', true);
                return;
            }else if(page_now + 1 == PAGE_TOTAL) {
                $('.fa-chevron-right').css('color', '#C0C0C0');
                $('.slide-button-next').prop('disabled', true);
                $('.sticky-page' + page_now).hide();
            } else {
                $('.fa-chevron-left').css('color', '#fff');
                $('.slide-button-prev').prop('disabled', false);
                $('.sticky-page' + page_now).hide();
            }
            page_now += 1;
        } else if(action == 'prev') {
            //初期ページか否かで処理を分岐
            if (page_now == 1) {
                $('.fa-chevron-left').css('color', '#C0C0C0');
                $('.slide-button-prev').prop('disabled', true);
                return;
            } else if(page_now - 1 == 1) {
                $('.fa-chevron-left').css('color', '#C0C0C0');
                $('.slide-button-prev').prop('disabled', true);
                $('.sticky-page' + page_now).hide();
            } else {
                $('.fa-chevron-right').css('color', '#fff');
                $('.slide-button-next').prop('disabled', false);
                $('.sticky-page' + page_now).hide();
            }
            page_now -= 1;
        }
        let next_jpeg_file_path = '/static/pdf/1/' + page_now + '.jpeg';
        $('.display-page').attr('src', next_jpeg_file_path);
        $('.progressbar').css('width', 'calc(' + page_now + ' / ' + PAGE_TOTAL + ' * 100%)');
        $('.page-now-text').html(page_now);
        $('.sticky-page' + page_now).show();
    }


    $('.add-sticky').on('click', function() {
        $('.add-sticky-modal-item').fadeIn();
    });
    $('.add-sticky-modal-bg').on('click', function() {
        $('.add-sticky-modal-item').fadeOut();
    });

    //色の変更
    $('[class^=new-sticky-color-]').on('click', function() {
        if($(this).hasClass("selected-color")) {
            return;
        }
        let new_color = $(this).attr('class').replace('new-sticky-color-', '');
        let old_color = $('.new-sticky-design').attr('data-color');
        let shape = $('.new-sticky-design').attr('data-shape');

        $('.new-sticky-design').attr('data-color', new_color);
        $('.selected-color').removeClass('selected-color');
        $(this).addClass('selected-color');

        $('.new-sticky-design').removeClass('change-color-left-' + old_color);
        $('.new-sticky-design').removeClass('change-color-right-' + old_color);

        if(shape == 'left') {
            $('.new-sticky-design').addClass('change-color-left-' + new_color);
        }
        else if(shape == 'right') {
            $('.new-sticky-design').addClass('change-color-right-' + new_color);
        }
    });

    //形の変更
    $('[class^=new-sticky-shape-]').on('click', function() {
        if($(this).hasClass("selected-shape") || $(this).hasClass("selected-shape-left") || $(this).hasClass("selected-shape-right")) {
            return;
        }
        let shape = $(this).attr('class').replace('new-sticky-shape-', '');
        let color = $('.new-sticky-design').attr('data-color');

        //選択表示を消去
        $('.selected-shape').removeClass('selected-shape');
        $('.selected-shape-left').removeClass('selected-shape-left');
        $('.selected-shape-right').removeClass('selected-shape-right');
        $('.selected-shape-triangle-left').removeClass('selected-shape-triangle-left');
        $('.selected-shape-triangle-right').removeClass('selected-shape-triangle-right');

        //矢印付箋の三角形とbeforeをリセット
        $('.new-sticky-design').removeClass('change-color-left-' + color);
        $('.new-sticky-design').removeClass('change-color-right-' + color);

        if(/square$/.test(shape)) {
            $(this).addClass('selected-shape');
            $('.new-sticky-design').attr('data-shape', 'square');
        }
        else if(/rectangle$/.test(shape)) {
            $(this).addClass('selected-shape');
            $('.new-sticky-design').attr('data-shape', 'rectangle');
        }
        else if(/left$/.test(shape)) {
            $('.new-sticky-shape-left').addClass('selected-shape selected-shape-left');
            $('.new-sticky-shape-triangle-left').addClass('selected-shape-triangle-left');

            $('.new-sticky-design').attr('data-shape', 'left');
            $('.new-sticky-design').addClass('change-color-left-' + color);
        }
        else if(/right$/.test(shape)) {
            $('.new-sticky-shape-right').addClass('selected-shape selected-shape-right');
            $('.new-sticky-shape-triangle-right').addClass('selected-shape-triangle-right');

            $('.new-sticky-design').attr('data-shape', 'right');
            $('.new-sticky-design').addClass('change-color-right-' + color);
        }
    });

    $(document).on('input', '#new-sticky-textarea', function() {
        $('.new-sticky-design-text').text($('#new-sticky-textarea').val());
    });

    $('.new-sticky-btn').on('click', function() {
        let color = $('.new-sticky-design').data('color');
        let text = $('.new-sticky-design-text').text();
        let sticky = newSticky(color, text);
        $('.slide').append(sticky);
        $('.sticky').draggable({
            containment: '.slide',
        });
        $('.add-sticky-modal-item').fadeOut();
    });

    $('.slide-button-next').on('click', function() {
        pageControl('next');
    });
    $('.slide-button-prev').on('click', function() {
        pageControl('prev');
    });
});