import type { FishState } from "./types";

export class Fish {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  colorHue: number;
  state: FishState;
  wiggleFactor: number;
  wiggleSpeed: number;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    stateType: FishState = "alive",
  ) {
    this.x = Math.random() * (canvasWidth - 60) + 30;
    this.y = Math.random() * (canvasHeight - 60) + 40;
    this.size = Math.random() * 6 + 10;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.colorHue = Math.floor(Math.random() * 20) + 15;
    this.state = stateType;
    this.wiggleFactor = Math.random() * 10;
    this.wiggleSpeed = 0.15;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    let angle = Math.atan2(this.vy, this.vx);
    if (this.state === "dead") {
      angle = Math.PI;
    }
    ctx.rotate(angle);

    this.wiggleFactor += this.wiggleSpeed;
    const tailWiggle = Math.sin(this.wiggleFactor) * 4;

    let fishBodyColor = `hsl(${this.colorHue}, 90%, 55%)`;
    let eyeColor = "#000000";

    if (this.state === "struggling") {
      fishBodyColor = `hsl(${this.colorHue}, 60%, 65%)`;
    } else if (this.state === "dead") {
      fishBodyColor = `#cbd5e1`;
      eyeColor = "#f43f5e";
    }

    // Ekor
    ctx.beginPath();
    ctx.fillStyle = fishBodyColor;
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(-this.size * 1.5, -this.size * 0.4 + tailWiggle);
    ctx.lineTo(-this.size * 1.3, 0);
    ctx.lineTo(-this.size * 1.5, this.size * 0.4 + tailWiggle);
    ctx.closePath();
    ctx.fill();

    // Badan
    ctx.beginPath();
    ctx.fillStyle = fishBodyColor;
    ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mata
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(
      this.size * 0.5,
      -this.size * 0.15,
      this.size * 0.15,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = eyeColor;
    ctx.arc(
      this.size * 0.52,
      -this.size * 0.15,
      this.size * 0.08,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.restore();
  }

  update(
    waterDO: number,
    waterPH: number,
    canvasWidth: number,
    canvasHeight: number,
    simTime = 0,
  ) {
    if (waterDO < 3.8 || waterPH < 5.6 || waterPH > 8.4) {
      if (this.state === "alive") {
        this.state = "struggling";
      }
      const hazard = (4.0 - waterDO) * 0.0006 + (5.6 - waterPH) * 0.0009;
      if (
        this.state === "struggling" &&
        Math.random() < Math.max(0, hazard)
      ) {
        this.state = "dead";
        this.vy = -0.4;
        this.vx = (Math.random() - 0.5) * 0.1;
      }
    } else {
      if (this.state === "struggling") {
        this.state = "alive";
      }
    }

    if (this.state === "alive") {
      this.x += this.vx;
      this.y += this.vy;
      if (Math.random() < 0.01) {
        this.vx = (Math.random() - 0.5) * 1.8;
        this.vy = (Math.random() - 0.5) * 0.8;
      }
      if (this.x < 20) {
        this.x = 20;
        this.vx *= -1;
      }
      if (this.x > canvasWidth - 20) {
        this.x = canvasWidth - 20;
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
      this.x += this.vx * 0.5;
      this.y += this.vy * 0.5;
      if (this.y > 45) this.vy -= 0.03;
      if (Math.random() < 0.03) {
        this.vx = (Math.random() - 0.5) * 1.0;
        this.vy = (Math.random() - 0.5) * 0.5;
      }
      if (this.x < 20) {
        this.x = 20;
        this.vx *= -1;
      }
      if (this.x > canvasWidth - 20) {
        this.x = canvasWidth - 20;
        this.vx *= -1;
      }
      if (this.y < 25) {
        this.y = 25;
        this.vy = 0.2;
      }
      if (this.y > canvasHeight - 15) {
        this.y = canvasHeight - 15;
        this.vy = -0.2;
      }
    } else if (this.state === "dead") {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > 20) {
        this.vy = -0.4;
      } else {
        this.vy = 0;
        this.vx = Math.sin(simTime * 0.05) * 0.08;
      }
      if (this.x < 15) this.x = 15;
      if (this.x > canvasWidth - 15) this.x = canvasWidth - 15;
    }
  }
}

export class WasteParticle {
  source: "industri" | "domestik";
  x: number;
  y: number;
  color: string;
  size: number;
  vx: number;
  vy: number;
  decay: number;
  alpha: number;

  constructor(sourceType: "industri" | "domestik", dischargeRate: number) {
    this.source = sourceType;
    if (sourceType === "industri") {
      this.x = 45;
      this.y = 30;
      this.color = `hsla(${Math.random() * 30 + 65}, 80%, 45%, 0.6)`;
      this.size = Math.random() * 3 + 2;
    } else {
      this.x = 85;
      this.y = 30;
      this.color = `rgba(148, 163, 184, ${Math.random() * 0.4 + 0.3})`;
      this.size = Math.random() * 4 + 2;
    }
    const speed = (dischargeRate / 100) * 3 + 1.5;
    this.vx = (Math.random() * 0.4 + 0.1) * speed;
    this.vy = (Math.random() * 1.2 + 0.4) * speed;
    this.decay = Math.random() * 0.007 + 0.003;
    this.alpha = 1.0;
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
    this.vx += (Math.random() - 0.4) * 0.08;
    this.vy += 0.04;
    if (this.y > 45) {
      this.alpha -= this.decay;
    }
  }
}

export class OxygenBubble {
  x: number = 0;
  y: number = 0;
  size: number = 0;
  speed: number = 0;
  wobble: number = 0;
  canvasWidth: number;
  canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
    this.y = Math.random() * canvasHeight;
  }

  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = this.canvasHeight + 5;
    this.size = Math.random() * 2 + 0.8;
    this.speed = Math.random() * 0.8 + 0.3;
    this.wobble = Math.random() * 2 * Math.PI;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(2, 132, 199, 0.35)";
    ctx.lineWidth = 0.5;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.stroke();
  }

  update(waterDO: number) {
    this.y -= this.speed * (waterDO / 8 + 0.4);
    this.wobble += 0.06;
    this.x += Math.sin(this.wobble) * 0.15;
    if (this.y < 25) {
      this.reset();
    }
  }
}
