function newVoteWord(id, word, empathy) {
    return '<div class="voted-word" data-word-id=' + id + '><span class="word-text">' + word + '</span></div>'
}

$('.vote-word-modal-btn').on('click', function() {
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        url: '/get-vote-word-info',
    }).done(function(voteWords) {
        for(let i in voteWords) {
            let id = voteWords[i]['id'];
            let word = voteWords[i]['word'];
            let empathy = voteWords[i]['empathy'];

            let voteWord = newVoteWord(id, word, empathy);
            $('.voted-word-container').append(voteWord);
        }
    }).fail(function() {
        console.log('通信失敗');
    });

    $('.vote-word-modal-item').fadeIn();
});

$('.vote-word-modal-close-btn, .vote-word-modal-bg').on('click', function() {
    $('.voted-word').remove();
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