class Game {
    constructor() {
        this.now = 0;
    }

    update(delta) {}
    draw(delta) {}
    panic() { console.log('PANIC!'); }

    onKeyDown(key) {}
    onKeyUp(key) {}
}

class Engine {
    constructor(game, maxFPS) {
        this.game = game;

        this.started = false;
        this.running = false;

        this.maxFPS = maxFPS;
        this.fps = 0;
        this.delta = 0;
        this.lastFrameTimeMs = this.now();
        this.lastFpsUpdate = this.now();
        this.framesThisSecond = 0;
        this.frameID = 0;

        this.timestep = 1000 / this.maxFPS;

        this.boundMainLoop = this.mainLoop.bind(this);
    }

    mainLoop(timestamp) {
        if (!this.running) {
            return;
        }
        
        if (timestamp > this.lastFpsUpdate + 1000) { // update every second
            this.fps = 0.25 * this.framesThisSecond + (1 - 0.25) * this.fps; // compute the new FPS
     
            this.lastFpsUpdate = timestamp;
            this.framesThisSecond = 0;
        }
        this.framesThisSecond++;

        // Throttle the frame rate
        if (timestamp < this.lastFrameTimeMs + (1000 / this.fps)) {
            this.frameID = requestAnimationFrame(this.boundMainLoop);
            return;
        }

        this.game.now = timestamp;
        this.delta += timestamp - this.lastFrameTimeMs;
        this.lastFrameTimeMs = timestamp;

        let numUpdateSteps = 0;
        while (this.delta >= this.timestep) {
            this.game.update(this.timestep);
            
            this.delta -= this.timestep;
            if (++numUpdateSteps >= 240) {
                this.game.panic();
                this.delta = 0;
                break;
            }
        }
    
        this.game.draw();
        this.frameID = requestAnimationFrame(this.boundMainLoop)
    }

    // @ isaacsukin.com
    start() {
        if (!this.started) {
            let self = this;
            this.started = true;

            // Input
            $(document).on('keydown', e => this.game.onKeyDown(e.keyCode));
            $(document).on('keyup', e => this.game.onKeyUp(e.keyCode));

            // Dummy frame to get our timestamps and initial drawing right.
            // Track the frame ID so we can cancel it if we stop quickly.
            this.frameID = requestAnimationFrame(function(timestamp) {
                self.game.draw(1);
                self.running = true;

                // reset some time tracking variables
                self.lastFrameTimeMs = timestamp;
                self.lastFpsUpdate = timestamp;
                self.framesThisSecond = 0;
                // actually start the main loop
                self.frameID = requestAnimationFrame(self.boundMainLoop);
            });
        }
    }

    stop() {
        if (this.running) {
            console.log('STOP');
            this.running = false;
            this.started = false;
            cancelAnimationFrame(this.frameID);
        }
    }

    now() {
        return (window.performance && window.performance.now) ? window.performance.now() : + new Date();
    }
}
