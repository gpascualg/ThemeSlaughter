$(function(){
    function cast(el, which) {
        let $el = $(el);
        let $theme = $el.closest('.theme');
        let $name = $theme.find('.name');
        let name = $name.data('name');

        let data = {id: name, cast: which};
        $.post(location.url, JSON.stringify(data), (data, text, _) => {
            $el.siblings('.btn').removeClass('active')
            $el.addClass('active');
        }, 'json')
    }

    $('.btn.yes').click((e) => cast(e.target, 'yes'));
    $('.btn.neutral').click((e) => cast(e.target, 'neutral'));
    $('.btn.no').click((e) => cast(e.target, 'no'));
});