function newVoteWord(id, word, empathy, isEmpathy) {
    return `
    <div class="voted-word" data-word-id=` + id + `>
        <span class="word-text">` + word + `</span>
        <div class="word-empathy-container">
            <i class="fas fa-heart word-empathy-`+ isEmpathy +`" data-word-empathy-id="` + id + `"></i>
            <span class="word-empathy-count word-empathy-`+ isEmpathy +`">` + empathy + `</span>
            <i class="fas fa-trash-alt trash-btn" data-trash-id="` + id + `"></i>
        </div>
    </div>`
}

function getWordEmpathyInfo() {
    return $.ajax({
        dataType: 'json',
        type: 'GET',
        url: '/get-word-empathy-info',
    });
}

$('.vote-word-modal-btn').on('click', function() {
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'GET',
        url: '/get-vote-word-info',
    }).done(function(voteWords) {
        getWordEmpathyInfo().done(function(wordEmpathyInfo) {
            console.log(wordEmpathyInfo);
            for(let i in voteWords) {
                let id = voteWords[i]['id'];
                let word = voteWords[i]['word'];
                let empathy = voteWords[i]['empathy'];
                let isEmpathy;
                if(wordEmpathyInfo[id] == 1) {
                    isEmpathy = true;
                } else {
                    isEmpathy = false;
                }
                let voteWord = newVoteWord(id, word, empathy, isEmpathy);
                $('.voted-word-container').append(voteWord);
            }
            $('.vote-word-modal-item').fadeIn();
        }).fail(function() {
            console.log('通信失敗');
        });
    }).fail(function() {
        console.log('通信失敗');
    });
});

//いいね機能
$(document).on('click', '.word-empathy-false', function(e) {
    $(this).addClass('word-empathy-true');
    $(this).removeClass('word-empathy-false');
    $(this).next('.word-empathy-count').addClass('word-empathy-true');
    $(this).next('.word-empathy-count').removeClass('word-empathy-false');
    let empathy_count = $(this).next('.word-empathy-count').text();
    empathy_count = parseInt(empathy_count) + 1;
    $(this).next('.word-empathy-count').text(empathy_count);

    let id = $(this).data("word-empathy-id");
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/increment-word-empathy',
        data: JSON.stringify({
            id: id,
        })
    }).done(function() {
    }).fail(function() {
        console.log('通信失敗');
    });
});

$(document).on('click', '.word-empathy-true', function(e) {
    $(this).addClass('word-empathy-false');
    $(this).removeClass('word-empathy-true');
    $(this).next('.word-empathy-count').addClass('word-empathy-false');
    $(this).next('.word-empathy-count').removeClass('word-empathy-true');
    let empathy_count = $(this).next('.word-empathy-count').text();
    empathy_count = parseInt(empathy_count) - 1;
    $(this).next('.word-empathy-count').text(empathy_count);
    
    let id = $(this).data("word-empathy-id");
    $.ajax({
        dataType: 'json',
        contentType: 'application/json',
        type: 'POST',
        url: '/decrement-word-empathy',
        data: JSON.stringify({
            id: id,
        })
    }).done(function() {
    }).fail(function() {
        console.log('通信失敗');
    });
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