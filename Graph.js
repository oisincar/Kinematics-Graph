
var graph = null;

function custom(x, y) {
    return (Math.sin(x * deg2rad) * Math.cos(y * deg2rad) * 50 + 50);
}

// Distance to the goal with angles a and b.
function distance(a, b) {
    a *= deg2rad;
    b *= deg2rad;

    // Apply forward kinematics!

    // End point of first arm
    var x1 = l1 * Math.cos(a);
    var y1 = l1 * Math.sin(a);
    b = a + b;
    var x2 = x1 + l2 * Math.cos(b);
    var y2 = y1 + l2 * Math.sin(b);

    // dist to target
    var yt = 10;
    return Math.sqrt(
        (targetX - x2) * (targetX - x2) +
            (targetY - y2) * (targetY - y2)
    );
}

// Called when the Visualization API is loaded.

function genData() {

    // Create and populate a data table.
    var data = new vis.DataSet();

    var steps = 50; // Num steps sampled in x/y.

    for (var i = 0; i < steps; i++) {
        for (var j = 0; j < steps; j++) {
            var a = i/steps * 360 - 180, b = j*1.0/steps * 360 - 180;
            var value = distance(a, b);
            data.add({
                x: a,
                y: b,
                z: value,
                style: value
            });
        }
    }
    return data;
}

function drawVisualization() {
    var data = genData();
    // specify options
    var options = {
        width: '600px',
        height: '600px',
        style: 'surface',
        showPerspective: true,
        showGrid: true,
        showShadow: false,
        keepAspectRatio: true,
        verticalRatio: 0.5
    };

    // create a graph3d
    var container = document.getElementById('mygraph');
    graph = new vis.Graph3d(container, data, options);
}

drawVisualization();
