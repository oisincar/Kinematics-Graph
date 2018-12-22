
// colours
var background_colour = "#e0dfd5";
var arm_colour = "#457b9d";
var ball_colour = "#ef6461";
var ball_stroke_colour = "#ef6461";

// slider
$("#ang1").slider({
    min: 0,
    max: 180,
    values: [a],
    slide: function(event, ui) {
        // $("#ang1val").val(ui.values[0] + "°");
        $("#ang1val").text(ui.values[0] + "°")
        a = ui.values[0];
        UpdateArm();
        UpdateGraph();
    }
});
$("#ang1val").text(a + "°");

$("#ang2").slider({
    min: -160,
    max: 160,
    values: [b],
    slide: function(event, ui) {
        $("#ang2val").text(ui.values[0] + "°");
        b = ui.values[0];
        UpdateArm();
        UpdateGraph();
    }
});
$("#ang2val").text(b + "°");


$("#l1").slider({
    min: 0,
    max: 15,
    step: 0.1,
    values: [l1],
    slide: function(event, ui) {
        $("#l1val").text(ui.values[0] + "m");
        l1 = ui.values[0];
        UpdateArm();
        UpdateGraph();
    }
});
$("#l1val").text(l1 + "m");

$("#l2").slider({
    min: 0,
    max: 15,
    step: 0.1,
    values: [l2],
    slide: function(event, ui) {
        $("#l2val").text(ui.values[0] + "m");
        l2 = ui.values[0];
        UpdateArm();
        UpdateGraph();
    }
});
$("#l2val").text(l2 + "m");

function dist(x1, y1, x2, y2) {
    return Math.sqrt(
        (x1-x2) * (x1-x2) + (y1-y2)*(y1-y2)
    );
}

function CanvasState(canvas) {
    // **** First some setup! ****

    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');

    this.sf = 10; // Scaling from 'units' to pixels.

    this.targetR = 10;

    // Graphical offsets
    this.offX = 200;
    this.offY = -50;

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

            targetX = (mouse.x                  - myState.offX) / myState.sf;
            targetY = (myState.height - mouse.y + myState.offY) / myState.sf;

            UpdateGraph();
            UpdateArm();
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
CanvasState.prototype.draw = function() {
    // if our state is invalid, redraw and validate!
    if (!this.valid) {
        var ctx = this.ctx;

        // Colour background!
        ctx.fillStyle = background_colour;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw ball
        ctx.beginPath();
        ctx.arc(this.offX + targetX * this.sf,
                this.offY + this.height - targetY*this.sf, this.targetR, 0, 2 * Math.PI, false);
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


        // End point of first arm
        var aR = deg2rad * a, bR = deg2rad * b;
        var x1 = l1 * Math.cos(aR);
        var y1 = l1 * Math.sin(aR);
        ctx.strokeStyle = arm_colour;
        ctx.moveTo(this.offX, this.offY + this.height);
        ctx.lineTo(this.offX + x1*this.sf, this.offY + this.height - y1*this.sf);

        var x2 = x1 + l2 * Math.cos(aR + bR);
        var y2 = y1 + l2 * Math.sin(aR + bR);

        ctx.lineTo(this.offX + x2*this.sf, this.offY + this.height - y2*this.sf);
        ctx.lineWidth = 6;

        ctx.stroke();

        this.valid = true;
    }
}

// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
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

var arm = new CanvasState(document.getElementById('canvas'));
