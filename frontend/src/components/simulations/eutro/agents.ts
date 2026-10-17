import type { FishState } from "./types";

export class Fish {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  colorHue: number;
  state: FishState;
  wiggle: number;
  wiggleSpeed: number;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    health: FishState = "alive",
  ) {
    this.x = Math.random() * (canvasWidth - 80) + 40;
    this.y = Math.random() * (canvasHeight - 60) + 40;
    this.size = Math.random() * 4 + 10;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.colorHue = Math.floor(Math.random() * 15) + 20;
    this.state = health;
    this.wiggle = Math.random() * 100;
    this.wiggleSpeed = 0.12;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    let angle = Math.atan2(this.vy, this.vx);
    if (this.state === "dead") angle = Math.PI;
    ctx.rotate(angle);

    this.wiggle += this.wiggleSpeed;
    const tailOscillation = Math.sin(this.wiggle) * 3;

    let bodyColor = `hsl(${this.colorHue}, 85%, 55%)`;
    let eyeColor = "#000000";

    if (this.state === "struggling") {
      bodyColor = `hsl(${this.colorHue}, 50%, 65%)`;
    } else if (this.state === "dead") {
      bodyColor = "#cbd5e1";
      eyeColor = "#ef4444";
    }

    // Ekor
    ctx.beginPath();
    ctx.fillStyle = bodyColor;
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(-this.size * 1.4, -this.size * 0.4 + tailOscillation);
    ctx.lineTo(-this.size * 1.2, 0);
    ctx.lineTo(-this.size * 1.4, this.size * 0.4 + tailOscillation);
    ctx.closePath();
    ctx.fill();

    // Tubuh
    ctx.beginPath();
    ctx.fillStyle = bodyColor;
    ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mata
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(this.size * 0.5, -this.size * 0.15, this.size * 0.14, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = eyeColor;
    ctx.arc(this.size * 0.53, -this.size * 0.15, this.size * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  update(waterDO: number, canvasWidth: number, canvasHeight: number, simTime = 0) {
    if (waterDO < 3.0) {
      if (this.state === "alive") this.state = "struggling";
      const mortalityRisk = (3.0 - waterDO) * 0.0012;
      if (this.state === "struggling" && Math.random() < mortalityRisk) {
        this.state = "dead";
        this.vy = -0.3;
        this.vx = (Math.random() - 0.5) * 0.08;
      }
    } else {
      if (this.state === "struggling") this.state = "alive";
    }

    if (this.state === "alive") {
      this.x += this.vx;
      this.y += this.vy;
      if (Math.random() < 0.015) {
        this.vx = (Math.random() - 0.5) * 1.6;
        this.vy = (Math.random() - 0.5) * 0.7;
      }
      if (this.x < 30) {
        this.x = 30;
        this.vx *= -1;
      }
      if (this.x > canvasWidth - 30) {
        this.x = canvasWidth - 30;
        this.vx *= -1;
      }
      if (this.y < 35) {
        this.y = 35;
        this.vy *= -1;
      }
      if (this.y > canvasHeight - 15) {
        this.y = canvasHeight - 15;
        this.vy *= -1;
      }
    } else if (this.state === "struggling") {
      this.x += this.vx * 0.4;
      this.y += this.vy * 0.4;
      if (this.y > 45) this.vy -= 0.02;
      if (Math.random() < 0.03) {
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.4;
      }
      if (this.x < 30) {
        this.x = 30;
        this.vx *= -1;
      }
      if (this.x > canvasWidth - 30) {
        this.x = canvasWidth - 30;
        this.vx *= -1;
      }
      if (this.y < 30) {
        this.y = 30;
        this.vy = 0.2;
      }
      if (this.y > canvasHeight - 15) {
        this.y = canvasHeight - 15;
        this.vy = -0.2;
      }
    } else if (this.state === "dead") {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > 28) {
        this.vy = -0.3;
      } else {
        this.vy = 0;
        this.vx = Math.sin(simTime * 0.04) * 0.06;
      }
      if (this.x < 20) this.x = 20;
      if (this.x > canvasWidth - 20) this.x = canvasWidth - 20;
    }
  }
}

export class Rain {
  x: number;
  y: number;
  length: number;
  speed: number;
  alpha: number;
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = Math.random() * canvasWidth;
    this.y = -10;
    this.length = Math.random() * 8 + 8;
    this.speed = Math.random() * 5 + 10;
    this.alpha = Math.random() * 0.3 + 0.2;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = `rgba(14, 165, 233, ${this.alpha})`;
    ctx.lineWidth = 1;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - 1, this.y + this.length);
    ctx.stroke();
    ctx.restore();
  }

  update(intensity: number) {
    this.y += this.speed * (0.6 + intensity * 0.2);
    this.x -= 0.5;
    if (this.y > this.canvasHeight) {
      this.y = -10;
      this.x = Math.random() * this.canvasWidth;
    }
  }
}

export class RunoffParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;

  constructor(fertilizerLevel: number) {
    this.x = 40;
    this.y = 20;
    this.size = Math.random() * 2 + 1.5;
    this.color = `rgba(${Math.floor(Math.random() * 40 + 190)}, ${Math.floor(
      Math.random() * 30 + 150,
    )}, 60, ${Math.random() * 0.4 + 0.4})`;
    this.vx = (Math.random() * 0.8 + 0.3) * (fertilizerLevel * 0.7);
    this.vy = (Math.random() * 1.0 + 0.5) * (fertilizerLevel * 0.7);
    this.alpha = 1.0;
    this.decay = Math.random() * 0.005 + 0.003;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.03;
    if (this.y > 35) {
      this.alpha -= this.decay;
    }
  }
}

export class AlgaeBloomVisual {
  xPercent: number;
  yPercent: number;
  size: number;
  wobble: number;

  constructor() {
    this.xPercent = Math.random();
    this.yPercent = Math.random();
    this.size = Math.random() * 8 + 4;
    this.wobble = Math.random() * 10;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    algaeDensity: number,
    canvasWidth: number,
  ) {
    const strength = Math.min(0.9, algaeDensity / 100);
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = `rgba(16, 185, 129, ${strength * 0.55})`;
    this.wobble += 0.015;
    const dynamicSize = this.size + Math.sin(this.wobble) * 2;

    const posX = this.xPercent * canvasWidth;
    const posY = 35 + this.yPercent * 30;

    ctx.arc(
      posX,
      posY + Math.sin(this.wobble) * 1.5,
      dynamicSize,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }
}
