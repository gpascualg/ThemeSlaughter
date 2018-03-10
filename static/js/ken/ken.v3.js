let Animations = {
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
    },
    punch: {
        diff: 100,
        grounded: 0,
        frames: [
            {'background-position': '0px -160px'},
            {'background-position': '-70px -160px'},
            {'background-position': '-140px -160px'}
        ]
    },
    kick: {
        diff: 100,
        grounded: 1,
        frames: [
            {'background-position': '0px -480px'},
            {'background-position': '-70px -480px'},
            {'background-position': '-140px -480px'},
            {'background-position': '-210px -480px'},
            {'background-position': '-280px -480px'}
        ]
    },
    jump: {
        diff: [50, 75, 100, 100, 100, 75, 50],
        frames: [
            {'background-position': '0px -640px'},
            {'background-position': '-70px -640px'},
            {'background-position': '-140px -640px'},
            {'background-position': '-210px -640px'},
            {'background-position': '-280px -640px'},
            {'background-position': '-350px -640px'},
            {'background-position': '-420px -640px'}
        ]
    },
    shoryuken: {
        diff: 100,
        sprite: 'ken-shoryuken',
        dy: -30,
        frames: [
            {'background-position': '0px 0px'},
            {'background-position': '-70px 0px'},
            {'background-position': '-140px 0px'},
            {'background-position': '-210px 0px'},
            {'background-position': '-280px 0px'},
            {'background-position': '-350px 0px'},
            {'background-position': '-420px 0px'},
            {'background-position': '-490px 0px'}
        ]
    },
    kneel: {
        diff: 100,
        grounded: 1,
        frames: [
            {'background-position': '0px -720px'}
        ]
    }
};

var circular = new Array();
var maxLength = 4;
var addElementToQueue = function(element){
    if(circular.length == maxLength){
        circular.pop();
    }
    circular.unshift(element);
};

class StreetFighter extends Game {
    constructor() {
        super();

        this.TARGET_JMP_MAX = 1;
        this.TARGET_JMP_MS = 700;
        this.TARGET_JMP_DIST = 200;

        this.ken = $('.ken');
        this.kenShadow = $('.ken .shadow');
        this.guile = $('.guile');

        let position = this.ken.offset();
        this.ground = position.top;

        this.state = {
            animation: 'stance',
            frame: 0,
            lastAnimated: 0,
            switchOnEnd: false,

            position: position,
            direction: 1,
    
            locked: 0,
            left: 0,
            right: 0,
            moving: 0,
            jumping: 0,
            kneeled: 0,
            grounded: 1,
            kicksNotGrounded: 0,
    
            velY: 0,
        };

        this.must_draw = false;
    }

    update(delta) {
        var position = {top: this.state.position.top, left: this.state.position.left}
        var lastTick = false;

        if (!this.state.locked) {
            if (!this.state.grounded) {
                if (this.state.velY <= 1) {
                    position.top += Math.sign(this.state.velY) * delta * this.TARGET_JMP_DIST / this.TARGET_JMP_MS;
                    this.state.velY += delta * this.TARGET_JMP_MAX * 2 / this.TARGET_JMP_MS;
                }
                
                if (position.top > this.ground || this.state.velY > 1) {
                    position.top = this.ground;
                    this.state.grounded = 1;
                    this.state.kicksNotGrounded = 0;
                    lastTick = true;
                }
            }
            else if (this.state.jumping) {
                this.state.velY = -1;
                this.state.grounded = 0;
            }

            if (lastTick || this.state.moving || !this.state.grounded) {
                position.left += this.state.moving * delta * 0.15;
                this.state.position = position;
                this.must_draw = true;
            }
        }
    }

    draw(delta) {            
        // Render/Change animation
        let animation = Animations[this.state.animation];
        let diff = typeof animation.diff == 'object' ? animation.diff[this.state.frame] : animation.diff;
        if (this.now - this.state.lastAnimated > diff) {
            if (!this.state.frame && animation.sprite) {
                this.ken.toggleClass(animation.sprite);
            }

            this.ken.css(animation.frames[this.state.frame]);
            this.state.frame = ++this.state.frame % animation.frames.length;
            this.state.lastAnimated = this.now;

            if (!this.state.frame && animation.sprite) {
                this.ken.toggleClass(animation.sprite);
            }

            if (!this.state.frame && this.state.switchOnEnd) {
                let newAnimation = this.state.switchOnEnd;
                this.state.locked = false;
                this.state.switchOnEnd = false;
                this.switchAnimation(newAnimation);
            }
        }

        if (this.must_draw) {
            if (animation.dy) {
                this.ken.offset({
                    top: this.state.position.top + animation.dy,
                    left: this.state.position.left
                });
            }
            else {
                this.ken.offset(this.state.position);
                this.kenShadow.css({
                    bottom: - 2 - (this.ground - this.state.position.top)
                });
            }
            
            // Are they facing the other way?
            var oldDir = this.state.direction;
            if (this.state.position.left > this.guile.offset().left) {
                this.state.direction = -1;
            }
            else {
                this.state.direction = 1;
            }

            if (oldDir != this.state.direction) {
                if (this.state.direction == -1) {
                    this.ken.css({'transform': 'rotateY(-180deg)'});
                    this.guile.css({'transform': ''});
                }
                else {
                    this.ken.css({'transform': ''});
                    this.guile.css({'transform': 'rotateY(-180deg)'});
                }
            }
        }
    }

    doLockingAction(animation, switchOnEnd) {
        if (!this.state.grounded &&
                (this.state.kicksNotGrounded > 0 || Animations[animation].grounded)) {
            return false;
        }

        if (this.switchAnimation(animation, switchOnEnd)) {
            if (!this.state.grounded) {
                ++this.state.kicksNotGrounded;
                this.state.velY = 0; // Fall now
            }

            this.state.locked = true;
        }
    }

    switchAnimation(animation, switchOnEnd, actionName) {
        if (!this.state.locked) {
            // Switch to stance/kneel/walk in function of state
            if (animation == 'stance') {
                if (this.state.kneeled) {
                    animation = 'kneel';
                }
                else if (this.state.moving) {
                    animation = 'walk';
                }
            }

            this.state.animation = animation;
            this.state.switchOnEnd = switchOnEnd;
            this.state.frame = 0;

            if (animation != 'stance') {
                addElementToQueue(actionName || animation);
            }

            return true;
        }

        return false;
    }

    onKeyDown(key) {
        if (this.state.locked) {
            return;
        }

        if (key == 37 && !this.state.left) { 
            this.state.moving = -1;
            this.state.left = 1;
            this.switchAnimation('walk', null, 'left');
        }

        if (key == 39 && !this.state.right) {
            this.state.moving = +1;
            this.state.right = 1;
            this.switchAnimation('walk', null, 'right');
        }

        if (key == 38) {
            this.state.jumping = 1;
            
            if (this.state.grounded == 1 && !this.state.locked) {
                this.state.velY = -1;
                this.state.grounded = 0;
                this.switchAnimation('jump', 'stance');
            }
        }

        if (key == 40 && !this.state.moving) {
            this.state.kneeled = 1;
            this.switchAnimation('kneel');
        }

        if (key == 65) {
            if ((this.state.direction == 1 && 
                    circular[0] == 'right' && circular[1] == 'kneel' && circular[2] == 'right') ||
                (this.state.direction == -1 && 
                    circular[0] == 'left' && circular[1] == 'kneel' && circular[2] == 'left')) {
                console.log('shoryuken');
                this.doLockingAction('shoryuken', 'stance');
            }
            else {
                this.doLockingAction('punch', 'stance');
            }
        }

        if (key == 90) {
            this.doLockingAction('kick', 'stance');
        }
    }

    onKeyUp(key) {
        if (key == 37) {
            this.state.left = 0;
        }

        if (key == 39) {
            this.state.right = 0;
        }

        if (key == 37 || key == 39) {
            this.state.moving = this.state.right ? 1 : (this.state.left ? -1 : 0);
        }

        if (key == 38) {
            this.state.jumping = 0;
        }

        if (key == 40) {
            this.state.kneeled = 0;
        }

        if (this.state.moving == 0) {
            this.switchAnimation('stance');
        }
    }
}

let game = new StreetFighter();
let engine = new Engine(game, 60);
engine.start();


var $mute = $('.mute');
var $unmute = $('.unmute');

if (JSON.parse(localStorage.muted)) { $mute.hide(); $unmute.show(); }
$mute.click(function() { $mute.hide(); $unmute.show(); soundManager.mute(); localStorage.muted = true; })
$unmute.click(function() { $unmute.hide(); $mute.show(); soundManager.unmute(); localStorage.muted = false; })
