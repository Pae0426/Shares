$('.add-highlight-btn').on('click', function() {
    isHighlight = true;
});

$('.display-page').on('click', function(e) {
    let x = e.clientX;
    let y = e.clientY;
    if(isHighlight) {
        console.log(x+','+y);
        let highlight = `
        <span class="highlight" style="left:` + x + `px; top:` + y + `px"></span>
        `;
        $('.slide').append(highlight);

        // $('.highlight').resizable({
        //     minHeight: 15,
        //     maxHeight: 15,
        //     autoHide: true
        // });
        
        isHighlight = false;
    }
})