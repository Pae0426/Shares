$('.vote-word-modal-btn').on('click', function() {
    $('.vote-word-modal-item').fadeIn();
});

$('.vote-word-modal-close-btn, .vote-word-modal-bg').on('click', function() {
    $('.vote-word-modal-item').fadeOut();
});