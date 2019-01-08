class GradientDescentLongChain {

    constructor() {
        var self = this;

        // Target moved, update target position.
        function UpdateFollow() {
            self.targetX = self.arm.targetX;
            self.targetY = self.arm.targetY;

            self.finished = false;
        }

        this.arm = new ArmCanvas(document.getElementById('multilink_arm_canvas'), UpdateFollow, 5);

        this.targetX = this.arm.targetX;
        this.targetY = this.arm.targetY;

        var doUpdate = true;

        if (doUpdate)
            setInterval(function() { self.update(); }, self.interval);
    }

    // Bring 
    update() {
        // Only do stuff if we're not already at the target.
        if (!self.finished) {

            // Calculate gradient
            // console.log(this.arm._lengths);



        }
    }

}

var b = new GradientDescentLongChain();
