$(function(){
    function cast(el, which) {
        let $el = $(el);
        let $theme = $el.closest('.theme');
        let $name = $theme.find('.name');
        let name = $name.data('name');

        let data = {id: name, cast: which};
        $.post(location.url, JSON.stringify(data), (data, text, _) => {
            if (data['result'] == 'ok') {
                $el.siblings('.btn').removeClass('active')
                $el.addClass('active');
            }
            else {
                $('#' + data['result'] + '-modal').quickModal('open');
            }
        }, 'json');
    }

    function submit(el) {
        var $el = $(el);
        var theme = $('.input').val();

        $el.attr('disabled', true);
        $el.addClass('disabled');

        let data = {theme: theme};
        $.post(location.url, JSON.stringify(data), (data, text, _) => {
            $el.attr('disabled', false);
            $el.removeClass('disabled');

            $('#' + data['result'] + '-modal').quickModal('open');
        }, 'json');
    }

    // Voting
    $('.btn.yes:not(.disabled)').click((e) => cast(e.target, 'yes'));
    $('.btn.neutral:not(.disabled)').click((e) => cast(e.target, 'neutral'));
    $('.btn.no:not(.disabled)').click((e) => cast(e.target, 'no'));
    
    // Proposing
    $('.btn-large.yes').click((e) => submit(e.target));
    $('.input').keypress((e) => { if (e.which == 13) submit($('.btn-large.yes')); });

    // Login
    $('.login').click(() => location.href = 'do-login');
});
