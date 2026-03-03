function play(){
    const canvas = document.getElementById("canvas");

    const clock = new Clock(canvas);
    clock.start();
}

class Hand {
    constructor(lenght, width, color) {
        this.lenght = lenght;
        this.width = width;
        this.color = color;
    }

    draw(ctx){

        //console.log("funkcja draw");

        ctx.save();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;

        ctx.beginPath();

        ctx.moveTo(0,0);
        ctx.lineTo(0, - this.lenght);

        ctx.stroke();

        ctx.closePath();

        ctx.restore();
    }
}

class Clock {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.cx = canvas.width / 2;
        this.cy = canvas.height / 2;

        this.isPaused = false;
        this.frozenTime = null;

        this.hourHand = new Hand(50,6,"black");
        this.minuteHand = new Hand(90,3,"grey");
        this.secondHand = new Hand(140,1,"red");

        this._bindEvents();
    }

    _bindEvents() {
        window.addEventListener("keydown", (e) => {
          if (e.code === "Space") {
            e.preventDefault();
            this.togglePause();
          }
        });
      }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
          this.frozenTime = new Date();
        } else {
          this.frozenTime = null;
        }
    }

    start() {
        const tick = () => {
          this.render();
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    _now() {
        return this.isPaused && this.frozenTime ? this.frozenTime : new Date();
    }

    render() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawDial();

        const now = this._now();
        const h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds() + now.getMilliseconds() / 1000;

        const secAngle = (2 * Math.PI) * (s / 60);
        const minAngle = (2 * Math.PI) * ((m + s / 60) / 60);
        const hourAngle = (2 * Math.PI) * (((h % 12) + m / 60 + s / 3600) / 12);

        ctx.save();
        ctx.translate(this.cx,this.cy);

        ctx.save();
        ctx.rotate(hourAngle);
        this.hourHand.draw(ctx);
        ctx.restore();

        ctx.save();
        ctx.rotate(minAngle);
        this.minuteHand.draw(ctx);
        ctx.restore();

        ctx.save();
        ctx.rotate(secAngle);
        this.secondHand.draw(ctx);
        ctx.restore();

        ctx.restore();
    }

    drawDial() {
        const ctx = this.ctx;
        const radius = Math.min(this.cx, this.cy) - 5;

        ctx.save();
        ctx.translate(this.cx, this.cy);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();

        for (let i = 0; i < 60; i++) {

            const angle = (2 * Math.PI) * (i / 60);

            ctx.save();
            ctx.rotate(angle);

            ctx.beginPath();

            if (i % 5 === 0) {
                ctx.lineWidth = 4;
                ctx.moveTo(0, -radius);
                ctx.lineTo(0, -radius + 15);
            } else {
                ctx.lineWidth = 1;
                ctx.moveTo(0, -radius);
                ctx.lineTo(0, -radius + 8);
            }

            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }

        ctx.restore();
    }
}