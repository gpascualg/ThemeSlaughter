let KenAnimations = {
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

let GuileAnimations = {
    stance: {
        diff: 100,
        frames: [
            {'background-position': '0px -0px'},
            {'background-position': '-90px -0px'},
            {'background-position': '-180px -0px'}
        ]
    },
    walk: {
        diff: 100,
        frames: [
            {'background-position': '-270px -0px'},
            {'background-position': '-360px -0px'},
            {'background-position': '-0px -100px'},
            {'background-position': '-90px -100px'},
            {'background-position': '-180px -100px'}
        ]
    },
    punch: {
        diff: 100,
        grounded: 0,
        frames: [
            {'background-position': '-270px -100px'},
            {'background-position': '-360px -100px'},
            {'background-position': '-0px -200px'}
        ]
    },
    kick: {
        diff: 100,
        grounded: 1,
        frames: [
            {'background-position': '-90px -200px'},
            {'background-position': '-180px -200px'},
            {'background-position': '-270px -200px'}
        ]
    },
    jump: {
        diff: [50, 75, 100, 100, 100, 75, 50],
        frames: [
            {'background-position': '-360px -200px'},
            {'background-position': '-0px -300px'},
            {'background-position': '-90px -300px'},
            {'background-position': '-180px -300px'},
            {'background-position': '-270px -300px'}
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
            {'background-position': '-360px -300px'}
        ]
    }
};


class CircularArray {
    constructor(maxElements) {
        this.buffer = new Array(maxElements);
        this.maxElements = maxElements;
    }

    push(element) {
        if (this.buffer.length == this.maxElements) {
            this.buffer.pop();
        }
        this.buffer.unshift(element);
    }

    at(i) {
        if (i >= this.maxElements) {
            return undefined;
        }

        return this.buffer[i];
    }
}

class Fighter {
    constructor(fighter, shadow, keymap, animationSet, direction) {
        this.TARGET_JMP_MAX = 1;
        this.TARGET_JMP_MS = 700;
        this.TARGET_JMP_DIST = 200;

        this.fighter = fighter;
        this.shadow = shadow;
        this.keymap = keymap;
        this.actions = new CircularArray(4);

        let position = this.fighter.offset();
        this.ground = position.top;

        this.animationSet = animationSet;
        this.state = {
            animation: 'stance',
            frame: 0,
            lastAnimated: 0,
            switchOnEnd: false,

            position: position,
            direction: direction || 1,
    
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

    update(now, delta) {
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

    draw(now, delta) { 
        // Render/Change animation
        let animation = this.animationSet[this.state.animation];
        let diff = typeof animation.diff == 'object' ? animation.diff[this.state.frame] : animation.diff;
        
        if (now - this.state.lastAnimated > diff) {
            if (!this.state.frame && animation.sprite) {
                this.fighter.toggleClass(animation.sprite);
            }

            this.fighter.css(animation.frames[this.state.frame]);
            this.state.frame = ++this.state.frame % animation.frames.length;
            this.state.lastAnimated = now;

            if (!this.state.frame && animation.sprite) {
                this.fighter.toggleClass(animation.sprite);
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
                this.fighter.offset({
                    top: this.state.position.top + animation.dy,
                    left: this.state.position.left
                });
            }
            else {
                this.fighter.offset(this.state.position);
                this.shadow.css({
                    bottom: - 2 - (this.ground - this.state.position.top)
                });
            }
        }
    }

    doLockingAction(animation, switchOnEnd) {
        if (!this.state.grounded &&
                (this.state.kicksNotGrounded > 0 || this.animationSet   [animation].grounded)) {
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
                this.actions.push(actionName || animation);
            }

            return true;
        }

        return false;
    }

    onKeyDown(key) {
        if (this.state.locked) {
            return;
        }

        if (key == this.keymap.left && !this.state.left) { 
            this.state.moving = -1;
            this.state.left = 1;
            this.switchAnimation('walk', null, 'left');
        }

        if (key == this.keymap.right && !this.state.right) {
            this.state.moving = +1;
            this.state.right = 1;
            this.switchAnimation('walk', null, 'right');
        }

        if (key == this.keymap.jump) {
            this.state.jumping = 1;
            
            if (this.state.grounded == 1 && !this.state.locked) {
                this.state.velY = -1;
                this.state.grounded = 0;
                this.switchAnimation('jump', 'stance');
            }
        }

        if (key == this.keymap.kneel && !this.state.moving) {
            this.state.kneeled = 1;
            this.switchAnimation('kneel');
        }

        if (key == this.keymap.punch) {
            if ((this.state.direction == 1 && 
                    this.actions.at(0) == 'right' && this.actions.at(1) == 'kneel' && this.actions.at(2) == 'right') ||
                (this.state.direction == -1 && 
                    this.actions.at(0) == 'left' && this.actions.at(1) == 'kneel' && this.actions.at(2) == 'left')) {
                console.log('shoryuken');
                this.doLockingAction('shoryuken', 'stance');
            }
            else {
                this.doLockingAction('punch', 'stance');
            }
        }

        if (key == this.keymap.kick) {
            this.doLockingAction('kick', 'stance');
        }
    }

    onKeyUp(key) {
        if (key == this.keymap.left) {
            this.state.left = 0;
        }

        if (key == this.keymap.right) {
            this.state.right = 0;
        }

        if (key == this.keymap.left || key == this.keymap.right) {
            this.state.moving = this.state.right ? 1 : (this.state.left ? -1 : 0);
        }

        if (key == this.keymap.jump) {
            this.state.jumping = 0;
        }

        if (key == this.keymap.kneel) {
            this.state.kneeled = 0;
        }

        if (this.state.moving == 0) {
            this.switchAnimation('stance');
        }
    }
}

class StreetFighter extends Game {
    constructor() {
        super();

        this.fighters = [
            new Fighter($('.ken'), $('.ken .shadow'), {
                left: 81,
                right: 69,
                jump: 87,
                kneel: 83,
                punch: 68,
                kick: 65
            }, KenAnimations),
            
            new Fighter($('.guile'), $('.guile .shadow'), {
                left: 85,
                right: 79,
                jump: 73,
                kneel: 75,
                punch: 74,
                kick: 76
            }, GuileAnimations, -1)
        ];
    }

    update(delta) {
        this.fighters.forEach(fighter => {
            fighter.update(this.now, delta);
        });
    }

    draw(delta) {
        this.fighters.forEach(fighter => {
            fighter.draw(this.now, delta);
        });

        let fighter1 = this.fighters[0];
        let fighter2 = this.fighters[1];
        let oldDir = fighter1.state.direction;

        if (fighter1.state.position.left * fighter1.state.direction > fighter2.state.position.left * fighter1.state.direction) {
            fighter1.state.direction *= -1;
            fighter2.state.direction *= -1;
        }
        
        if (oldDir != fighter1.state.direction) {
            let current = fighter1.fighter.css('transform');

            if (current != '' && current != 'none') {
                fighter1.fighter.css({'transform': ''});
                fighter2.fighter.css({'transform': 'rotateY(-180deg)'});
            }
            else {
                fighter2.fighter.css({'transform': ''});
                fighter1.fighter.css({'transform': 'rotateY(-180deg)'});
            }
        }
    }

    onKeyDown(key) {
        this.fighters.forEach(fighter => {
            fighter.onKeyDown(key);
        });
    }

    onKeyUp(key) {
        this.fighters.forEach(fighter => {
            fighter.onKeyUp(key);
        });
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
