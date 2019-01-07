// colours
var background_colour = "#e0dfd5";
var arm_colour = "#457b9d";
var ball_colour = "#ef6461";
var ball_stroke_colour = "#ef6461";
var light_line_colour = "#cac8b8";

class ArmCanvas {

    getAngle(ix) { return Math.round(this._angles[ix] * rad2deg); }
    setAngle(ix, degrees) {
        this._angles[ix] = degrees * deg2rad;
        this._valid = false;
    }

    getLength(ix) { return this._lengths[ix]; }
    setLength(ix, len) {
        this._lengths[ix] = len;
        this._valid = false;
    }

    constructor(canvas, ballmove_callback, num_segments) {
        // **** First some setup! ****

        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.ctx = canvas.getContext('2d');

        this.ballmove_callback = ballmove_callback;

        this.num_segments = num_segments;

        this.sf = 12; // Scaling from 'units' to pixels.

        this.targetR = 10;

        // Graphical offsets
        this.offX = 200;
        this.offY = -50;

        this.targetX = 10;
        this.targetY = 10;

        // Create default angles/ lengths
        var stAng = 80; var incAng = ((-60) - stAng) / (num_segments-1);
        this._angles  = Array.from({length: num_segments}, (v, k) => (stAng + incAng*k) * deg2rad); 

        var stLen = 20/num_segments; var incLen = (15/num_segments - stLen) / (num_segments-1);
        this._lengths = Array.from({length: num_segments}, (v, k) => stLen + incLen*k); 

        // This complicates things a little but but fixes mouse co-ordinate problems
        // when there's a border or padding. See getMouse for more detail
        var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
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

        // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
        // This is our reference!
        var myState = this;

        var isClicked = false;

        canvas.addEventListener('mousedown', function(e) {
            isClicked = true;
        }, true);

        canvas.addEventListener('mousemove', function(e) {
            if (isClicked) {
                var mouse = myState.getMouse(e);

                myState.targetX = (mouse.x                  - myState.offX) / myState.sf;
                myState.targetY = (myState.height - mouse.y + myState.offY) / myState.sf;

                // Update the graph/ whatever else should the ball move.
                ballmove_callback();

                myState._valid = false;
            }
        }, true);

        canvas.addEventListener('mouseup', function(e) {
            isClicked = false;
        }, true);

        // **** Options! ****
        setInterval(function() { myState.draw(); }, myState.interval);
    }

    // While draw is called as often as the INTERVAL variable demands,
    // It only ever does something if the canvas gets invalidated by our code
    draw() {
        // if our state is invalid, redraw and validate!
        if (!this._valid) {
            var ctx = this.ctx;

            // Colour background!
            ctx.fillStyle = background_colour;
            ctx.fillRect(0, 0, this.width, this.height);

            // Draw grid!
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = light_line_colour;

            // First lines are here.
            var ox = this.offX % this.sf - this.sf;
            var oy = this.offY % this.sf;

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
            ctx.arc(this.offX + this.targetX * this.sf,
                    this.offY + this.height - this.targetY*this.sf, this.targetR, 0, 2 * Math.PI, false);
            ctx.fillStyle = ball_colour;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = ball_stroke_colour;
            ctx.stroke();

            // Draw arm
            ctx.beginPath();

            // Base
            var w = 30;
            ctx.moveTo(this.offX - w, this.offY + this.height);
            ctx.lineTo(this.offX + w, this.offY + this.height);

            // Arm
            var curX = 0,
                curY = 0,
                curA = 0;

            ctx.lineWidth = 7;
            ctx.strokeStyle = arm_colour;
            ctx.moveTo(this.offX, this.offY + this.height);

            // Calculating end positions for each segment of the arm, and drawing to there.
            for (var i = 0; i < this.num_segments; i++) {
                var l = this._lengths[i],
                    a = curA + this._angles[i],
                    endX = curX + l * Math.cos(a),
                    endY = curY + l * Math.sin(a);

                ctx.lineTo(this.offX + endX*this.sf, this.offY + this.height - endY*this.sf);

                curX = endX;
                curY = endY;
                curA = a;
            }

            ctx.stroke();


            // // End point of first arm
            // var aR = deg2rad * a, bR = deg2rad * b;
            // var x1 = l1 * Math.cos(aR);
            // var y1 = l1 * Math.sin(aR);
            // ctx.strokeStyle = arm_colour;
            // ctx.moveTo(this.offX, this.offY + this.height);
            // ctx.lineTo(this.offX + x1*this.sf, this.offY + this.height - y1*this.sf);

            // var x2 = x1 + l2 * Math.cos(aR + bR);
            // var y2 = y1 + l2 * Math.sin(aR + bR);

            // ctx.lineTo(this.offX + x2*this.sf, this.offY + this.height - y2*this.sf);
            // ctx.lineWidth = 7;

            // ctx.stroke();

            this._valid = true;
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
