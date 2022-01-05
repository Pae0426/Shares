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