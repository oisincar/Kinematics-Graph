// Segment lengths
var l1 = 10;
var l2 = 10;

// Arm angles
var a = 45;
var b = 30;

// Ball location
var targetX = 10;
var targetY = 10;

function UpdateGraph() {
    graph.setData(genData());
}
function UpdateArm() {
    arm.valid = false;
}

var deg2rad = Math.PI / 180;
var rad2deg = 180 / Math.PI;
