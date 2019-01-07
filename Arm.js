
// Create an arm in that space
var arm = new ArmCanvas(document.getElementById('canvas'), 2);

// slider
$("#ang1").slider({
    min: 0,
    max: 180,
    values: [a],
    slide: function(event, ui) {
        $("#ang1val").text(ui.values[0] + "°")
        a = ui.values[0];
        arm.setAngle(0, ui.values[0]);
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
        arm.setAngle(1, ui.values[0]);
        // UpdateArm();
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
        arm.setLength(0, ui.values[0]);

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
        // l2 = ui.values[0];
        arm.setLength(1, ui.values[0]);
        UpdateArm();
        UpdateGraph();
    }
});
$("#l2val").text(l2 + "m");

function dist(x1, y1, x2, y2) {
    return Math.sqrt(
        (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)
    );
}
