function play() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const show = new FireworkShow(canvas, ctx);

    function animate() {
        show.update();
        requestAnimationFrame(animate);
    }
    
    animate();
}

class Particle {
   constructor(x,y,vx,vy,hue) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.hue = hue;
    this.alpha = 1;
    this.decay = 0.015;
    this.active = true;
   } 
   
   // aktualizacja parametrów pojedynczej cząsteczki
   update(gravity, canvasHeight) {
    this.x += this.vx;
    this.y += this.vy;

    this.vy += gravity;

    this.vx *= 0.98;
    this.vy *= 0.98;

    this.alpha -= this.decay;

    if (this.alpha <= 0){
        this.active = false;
    }

    if (this.y >= canvasHeight) {
        this.vy *= -0.6;
        this.y = canvasHeight;
    }
   }

   // rysowanie pojedynczej cząsteczki
   draw(ctx) {
    ctx.beginPath();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
    ctx.arc(this.x,this.y,2,0,2*Math.PI);
    ctx.fill();
   }
}

class Firework {
    constructor(startX, startY, targetX, targetY, particleCount) {
        this.x = startX;
        this.y = startY;
        this.targetX = targetX;
        this.targetY = targetY;
        this.active = true;
        this.exploded = false;
        this.speed = 4;
        this.hue = Math.floor(Math.random() * 361);
        this.particleCount = particleCount;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.hypot(dx, dy) || 1;

        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
    }

    // aktualizowanie parametrów fajerwerki 
    update() {
        this.x += this.vx;
        this.y += this.vy;

        const distance = Math.hypot(this.targetX - this.x, this.targetY - this.y);

        if (distance < 5) {
            this.exploded = true;
            this.active = false;
        }
    }

    // rysowanie fajerwerki
    draw(ctx) {
        ctx.beginPath();
        ctx.rect(this.x,this.y - 5,3,10);
        ctx.fillStyle = `hsla(${this.hue}, 100%, 50%)`;
        ctx.fill();  
    }

    // logika eksplozji rakiery 
    explode() {
        const particles = [];

        for (let i = 0; i < this.particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const hue = this.hue + (Math.random() * 40 - 20);

            const p = new Particle(this.x,this.y,vx,vy,hue);
            particles.push(p);
        }

        return particles;
    }
}

class FireworkShow {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.rockets = [];
        this.gravity = 0.15;
        this.particleCount = 200;

        this.autoLaunchSeconds = 1;
        this.autoLaunchTimer = null;

        // nasłuchowanie kliknięcia do wywołania fajerwerki
        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const targetX = event.clientX - rect.left;
            const targetY = event.clientY - rect.top;

            this.launchRocket(targetX,targetY);

            this.rockets.push(rocket);
        });

        this.bindControls();
        this.startAutoLaunch();
    }

    // logika suwaków HTML
    bindControls() {
        const gravitySlider = document.getElementById("gravitySlider");
        const gravityValue = document.getElementById("gravityValue");

        const particleSlider = document.getElementById("particleSlider");
        const particleValue = document.getElementById("particleValue");

        // logika suwaka zmiany grawitacji 
        if (gravitySlider && gravityValue) {
            gravitySlider.value = this.gravity;
            gravityValue.textContent = this.gravity;

            gravitySlider.addEventListener('input', () => {
                this.gravity = parseFloat(gravitySlider.value);
                gravityValue.textContent = this.gravity.toFixed(2);
            });
        }

        // logika suwaka zmiany ilości generowanych cząsteczek
        if (particleSlider && particleValue) {
            particleSlider.value = this.particleCount;
            particleValue.textContent = this.particleCount;

            particleSlider.addEventListener('input', () => {
                this.particleCount = parseInt(particleSlider.value);
                particleValue.textContent = this.particleCount;
            });
        }

    }

    // wystrzelenie fajerwerki
    launchRocket(targetX, targetY){
        const startX = this.canvas.width/2;
        const startY = this.canvas.height;

        const rocket = new Firework(startX,startY,targetX,targetY, this.particleCount);

        this.rockets.push(rocket);
    }

    // losowanie parametrów do automatycznej fajerwerki
    launchRandomRocket() {
        const padding = 50;
        const targetX = Math.random() * (this.canvas.width - 2 * padding) + padding;
        const targetY = Math.random() * (this.canvas.height * 0.5) + 30;

        this.launchRocket(targetX,targetY);
    }

    // automatyczny wystrzał fajerwerki
    startAutoLaunch() {
        if(this.autoLaunchTimer !== null) {
            clearInterval(this.autoLaunchTimer);
        }

        this.autoLaunchTimer = setInterval(() => {
            this.launchRandomRocket();
        }, this.autoLaunchSeconds * 1000);
    }

    update() {
        //this.ctx.fillStyle = 'rgba(0,0,0.15)';
        //this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        this.ctx.clearRect(0,0,this.canvas.width, this.canvas.height);

        // pętla aktualizująca i rysująca fajerwerki
        for(let i = 0; i < this.rockets.length; i++) {

            this.rockets[i].update();
            this.rockets[i].draw(this.ctx);

            // fajerwerka eksploduje => pobiera cząsteczki i dołącza do tablicy 
            if(this.rockets[i].exploded === true){
                const p = this.rockets[i].explode();
                this.particles.push(...p);
            }
        }

        // pętla aklualizująca i rysująca cząsteczki 
        for (let i = 0; i < this.particles.length; i++){
            this.particles[i].update(this.gravity,this.canvas.height);
            this.particles[i].draw(this.ctx);
        }

        // usunięcie nieaktywnych fajerwerek i cząstek 
        this.rockets = this.rockets.filter(r => r.active);
        this.particles = this.particles.filter(p => p.active);

    }
}