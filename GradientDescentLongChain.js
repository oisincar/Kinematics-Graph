class GradientDescentLongChain {

    constructor() {
        var self = this;

        this.arm = new ArmCanvas(
            document.getElementById('multilink_arm_canvas'),
            function(){self.finished = false;},
            20);
        this.arm.sf *= 2;


        this.targetX = this.arm.targetX;
        this.targetY = this.arm.targetY;

        var doUpdate = true;

        if (doUpdate)
            setInterval(function() { self.update(); }, self.interval);
    }

    // Bring 
    update() {
        // Only do stuff if we're not already at the target.
        if (!this.finished) {
            var grads = this.arm.calculateCurrentGradients();

            // Update arm angles!
            for (var i = 0; i < grads.length; i++) {
                this.arm.changeAngle(i, -grads[i]*0.001);
            }

            // If we're now close enough, don't update til we have to again.
            if (this.arm.getCurrentError() < 0.5) {
                this.finished = true;
            }
        }
    }

}

var b = new GradientDescentLongChain();
