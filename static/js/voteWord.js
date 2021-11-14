$('.vote-word-modal-btn').on('click', function() {
    $('.vote-word-modal-item').fadeIn();
});

$('.vote-word-modal-close-btn, .vote-word-modal-bg').on('click', function() {
    $('.vote-word-modal-item').fadeOut();
});

$('.vote-word-btn').on('click', function() {
    let word = $('.vote-word-input').val();
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/vote-word',
        data: JSON.stringify({
            word: word,
        })
    }).done(function() {
        console.log('通信成功');
    }).fail(function() {
        console.log('通信失敗');
    });
});