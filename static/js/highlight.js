$('.add-highlight-btn').on('click', function() {
    if($(this).hasClass('highlighting')) {
        $(this).removeClass('highlighting');
        isHighlight = false;
    } else {
        $(this).addClass('highlighting');
        isHighlight = true;
    }
});


let n = 1;
$('.display-page').on('click', function(e) {
    let x_abs = e.clientX;
    let x_margin = $('.slide-container').outerWidth(true);
    let x_border = $('.slide-container').outerWidth();
    let x_diff = (x_margin - x_border) / 2;
    let y_abs = e.pageY;
    let y_diff = 184;
    let height_slide = $('.slide').height();

    let width_sum = 0;
    for(i=1;i<n;i++) {
        let width = $('.highlight'+i).width();
        if(width == undefined) {
            width = 0;
        }
        width_sum += width;
    }
    let x = Math.round(x_abs - x_diff - width_sum);
    let y = Math.round(y_abs - y_diff - height_slide - 5);

    if(isHighlight) {
        let highlight = `
        <span class="highlight`+n+`" style="left:` + x + `px; top:` + y + `px"></span>
        `;
        $('.slide').append(highlight);

        $('.highlight'+n).resizable({
            minHeight: 10,
            maxHeight: 10,
            handles: "e",
            autoHide: true,
        });
        
        isHighlight = false;
        $('.highlight'+n).removeClass('ui-resizable');
        x = Math.round(x + width_sum);
        y = Math.round(y + height_slide);
        $('.highlight'+n).css({
            position: "absolute",
            left: x+"px",
            top: y+"px",
        });
        $('.add-highlight-btn').removeClass('highlighting');

        n+=1;
    }
});
