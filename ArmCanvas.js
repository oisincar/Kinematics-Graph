// colours
var background_colour = "#e0dfd5";
var arm_colour = "#457b9d";
var ball_colour = "#ef6461";
var ball_stroke_colour = "#ef6461";
var light_line_colour = "#cac8b8";

class ArmCanvas {

    addArm(arm) {
        this._arms.push(arm);
        arm._setParent(this);
    }

    constructor(canvas, ballmove_callback) {

        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext('2d');

        this.ballmove_callback = ballmove_callback;

        this._arms = [];

        this.targetX = 10;
        this.targetY = 10;
        // target radius
        this.targetR = 10;

        this.sf = 12; // Scaling from 'units' to pixels.

        // moving the ball!
        var self = this;
        var isClicked = false;

        canvas.addEventListener('mousedown', function(e) {
            isClicked = true;
        }, true);

        canvas.addEventListener('mousemove', function(e) {
            if (isClicked) {
                var mouse = self.getMouse(e);

                // self.targetX = (mouse.x               - self.offX) / self.sf;
                // self.targetY = (self.height - mouse.y + self.offY) / self.sf;
                self.targetX = (mouse.x              ) / self.sf;
                self.targetY = (self.height - mouse.y) / self.sf;

                // Update the graph/ whatever else should the ball move.
                ballmove_callback();

                self._valid = false;
            }
        }, true);

        canvas.addEventListener('mouseup', function(e) {
            isClicked = false;
        }, true);


        // This complicates things a little but but fixes mouse co-ordinate problems
        // when there's a border or padding. See getMouse for more detail
        if (document.defaultView && document.defaultView.getComputedStyle) {
            this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
            this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
            this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
            this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
        }

        // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
        // They will mess up mouse coordinates and this fixes that
        var html = document.body.parentNode;
        this.htmlTop = html.offsetTop;
        this.htmlLeft = html.offsetLeft;

        setInterval(function() { self.draw(); }, self.interval);
    }

    draw() {

        // if our state is invalid, redraw and validate!
        if (!this._valid) {
            this._valid = true;

            var ctx = this.ctx;

            // Colour background!
            ctx.fillStyle = background_colour;
            ctx.fillRect(0, 0, this.width, this.height);

            // Draw grid!
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = light_line_colour;

            // First lines are here.
            // var ox = this.offX % this.sf - this.sf;
            // var oy = this.offY % this.sf;
            // Ensure grid is evenly spaced on the surface.
            var ox = (this.width/2) % this.sf - this.sf;
            var oy = (this.height/2) % this.sf - this.sf;

            while (ox < this.width) {
                ox += this.sf;

                ctx.moveTo(ox, 0);
                ctx.lineTo(ox, this.height);
            }
            while (oy < this.height) {
                oy += this.sf;

                ctx.moveTo(0,          oy);
                ctx.lineTo(this.width, oy);
            }

            ctx.stroke();

            // Draw ball
            ctx.beginPath();
            ctx.arc(this.targetX * this.sf,
                    this.height - this.targetY*this.sf, this.targetR, 0, 2 * Math.PI, false);
            ctx.fillStyle = ball_colour;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = ball_stroke_colour;
            ctx.stroke();

            this._arms.forEach(function(a) {
                a.draw(ctx);
            });
        }
    }

    // Creates an object with x and y defined, set to the mouse position relative to the state's canvas
    // If you wanna be super-correct this can be tricky, we have to worry about padding and borders
    // ArmCanvas.prototype.getMouse = function(e) {
    getMouse(e) {
        var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

        // Compute the total offset
        if (element.offsetParent !== undefined) {
            do {
                offsetX += element.offsetLeft;
                offsetY += element.offsetTop;
            } while ((element = element.offsetParent));
        }

        // Add padding and border style widths to offset
        // Also add the <html> offsets in case there's a position:fixed bar
        offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
        offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

        mx = e.pageX - offsetX;
        my = e.pageY - offsetY;

        // We return a simple javascript object (a hash) with x and y defined
        return {x: mx, y: my};
    }
}
