$(function() {
    let page_total = $('.progressbar').data('total-progress');
    const PAGE_TOTAL = parseInt(page_total);
    $('.sticky').draggable({
        containment: '.slide',
    });
    $('.progressbar').css('width', 'calc(1 / ' + page_total + ' * 100%)');

    
    function newSticky(color, text) {
        let page_now = $('.page-now-text').html();
        return '<span class="sticky ' + color + ' sticky-page' + page_now + '">' + text + '</span>';
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

    $('[class^=new-sticky-color-]').on('click', function() {
        let color_rgb = ($(this).css('background-color'));
        $('.new-sticky-design').css('background-color', color_rgb);
        let color_name = $(this).attr('class').replace('new-sticky-color-', '');
        console.log(color_name);
        $('.new-sticky-design').data('color', color_name);
        $('.selected-color').removeClass('selected-color');
        $(this).addClass('selected-color');
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