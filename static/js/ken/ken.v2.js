$(function() {
    var TARGET_FPS = 30;
    var TARGET_MS = 1000 / TARGET_FPS;

    var TARGET_JMP_MAX = 1;
    var TARGET_JMP_MS = 700;
    var TARGET_JMP_DIST = 200;

    var ken = $('.ken');
    var guile = $('.guile');
    var lastFrame = + new Date();
    var prevSleepTime = 0;

    var INITIAL_Y = ken.offset().top;

    var Animations = {
        stance: {
            diff: 100,
            frames: [
                {'background-position': '0px -80px'},
                {'background-position': '-70px -80px'},
                {'background-position': '-140px -80px'},
                {'background-position': '-210px -80px'}
            ]
        },
        walk: {
            diff: 100,
            frames: [
                {'background-position': '0px -240px'},
                {'background-position': '-70px -240px'},
                {'background-position': '-140px -240px'},
                {'background-position': '-210px -240px'},
                {'background-position': '-280px -240px'}
            ]
        }
    };

    var State = window.State = {
        animation: 'stance',
        frame: 0,
        lastAnimated: lastFrame,

        left: 0,
        right: 0,
        moving: 0,
        jumping: 0,
        grounded: 1,

        velY: 0,
    };

    var gameloop = function(now, elapsed) {
        // Get position now
        var kenPos = ken.offset();
        var guilePos = guile.offset();

        // Calculate jumping position
        var lastTick = false;
        if (!State.grounded) {
            if (State.velY <= 1) {
                kenPos.top = kenPos.top + Math.sign(State.velY) * elapsed * TARGET_JMP_DIST / TARGET_JMP_MS;
                State.velY += elapsed * TARGET_JMP_MAX * 2 / TARGET_JMP_MS;
            }
            
            if (kenPos.top > INITIAL_Y || State.velY > 1) {
                kenPos.top = INITIAL_Y;
                State.grounded = 1;
                lastTick = true;
            }
        }
        else if (State.jumping) {
            State.velY = -1;
            State.grounded = 0;
        }

        // Update position if moving
        if (lastTick || State.moving || !State.grounded) {
            ken.offset({top: kenPos.top, left: kenPos.left + State.moving * elapsed * 0.15 });

            // Are they facing the other way?
            if (kenPos.left > guilePos.left) {
                ken.css({'transform': 'rotateY(-180deg)'});
                guile.css({'transform': ''});
            }
            else {
                ken.css({'transform': ''});
                guile.css({'transform': 'rotateY(-180deg)'});
            }
        }

        // Render/Change animation
        var animation = Animations[State.animation];
        if (now - State.lastAnimated > animation.diff) {
            ken.css(animation.frames[State.frame]);
            State.frame = ++State.frame % animation.frames.length;
            State.lastAnimated = now;
        }

        // console.log('TICK ' + elapsed + ' SLEEPING ' + prevSleepTime);
        setTimeout(ticker, prevSleepTime);
    }

    var ticker = function() {
        var now = + new Date();
        var elapsed = now - lastFrame;
        lastFrame = now;

        gameloop(now, elapsed);
        
        if (elapsed <= TARGET_MS + prevSleepTime) {
            prevSleepTime = TARGET_MS + prevSleepTime - elapsed;
        }
        else {
            prevSleepTime = 0;
        }

        setTimeout(() => requestAnimationFrame(ticker), prevSleepTime);
    };

    $(document).on('keydown keyup', function(e) {
        if (e.type == 'keydown') { 
            if (e.keyCode == 37 && !State.left) { 
                State.moving = -1;
                State.left = 1;
                State.animation = 'walk';
                State.frame = 0;
            }

            if (e.keyCode == 39 && !State.right) {
                State.moving = +1;
                State.right = 1;
                State.animation = 'walk';
                State.frame = 0;
            }

            if (e.keyCode == 38) {
                State.jumping = 1;
                
                if (State.grounded == 1) {
                    State.velY = -1;
                    State.grounded = 0;
                }
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

            if (e.keyCode == 38) {
                State.jumping = 0;
            }

            if (State.moving == 0) {
                State.animation = 'stance';
                State.frame = 0;
            }
        }
    });

    console.log("Targetting " + TARGET_FPS + " fps [" + TARGET_MS + "ms]");
    ticker();
});