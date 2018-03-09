$(function() {
    var TARGET_FPS = 30;
    var TARGET_MS = 1000 / TARGET_FPS;

    var ken = $('.ken');
    var guile = $('.guile');
    var lastFrame = + new Date();
    var prevSleepTime = 0;

    var State = {
        left: 0,
        right: 0,
        moving: 0,
        jumping: 0,
    }

    var gameloop = function(elapsed) {
        var kenPos = ken.offset();

        ken.offset({top: kenPos.top, left: kenPos.left + State.moving * elapsed * 0.15 });


        if (elapsed <= TARGET_MS + prevSleepTime) {
            prevSleepTime = TARGET_MS + prevSleepTime - elapsed;
        }
        else {
            prevSleepTime = 0;
        }

        // console.log('TICK ' + elapsed + ' SLEEPING ' + prevSleepTime);
        setTimeout(ticker, prevSleepTime);
    }

    var ticker = function() {
        var now = + new Date();
        var elapsed = now - lastFrame;
        lastFrame = now;
        
        requestAnimationFrame(() => gameloop(elapsed));
    };

    $(document).on('keydown keyup', function(e) {
        if (e.type == 'keydown') { 
            if (e.keyCode == 37) { 
                State.moving = -1;
                State.left = 1;
            }

            if (e.keyCode == 39) {
                State.moving = +1;
                State.right = 1;
            }
        }
        else {
            if (e.keyCode == 37) {
                State.left = 0;
            }

            if (e.keyCode == 39) {
                State.right = 0;
            }

            if (e.keyCode == 37 || e.keyCode == 39) {
                State.moving = State.right ? 1 : (State.left ? -1 : 0);
            }
        }

        console.log(State);
    });

    console.log("Targetting " + TARGET_FPS + " fps [" + TARGET_MS + "ms]");
    ticker();
});