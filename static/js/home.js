$(function() {
    function newSticky(color, text) {
        return '<span class="sticky ' + color + '">' + text + '</span>';
    }

    $('.sticky').draggable({
        containment: '.sd-item',
    });

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
        $('.sd-item').append(sticky);
        $('.sticky').draggable({
            containment: '.sd-item',
        });
        $('.add-sticky-modal-item').fadeOut();
    });
});