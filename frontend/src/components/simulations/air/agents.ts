import type { CitizenState } from "./types";

export class Citizen {
  x: number;
  y: number;
  vx: number;
  height: number;
  state: CitizenState;
  hasMask: boolean;
  coughTimer: number;
  isCoughingNow: boolean;
  coughBubbleTimer: number;
  color: string;
  legCycle: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.height = 18;
    this.state = "healthy";
    this.hasMask = false;
    this.coughTimer = 0;
    this.isCoughingNow = false;
    this.coughBubbleTimer = 0;
    this.color = `hsl(${Math.random() * 360}, 65%, 50%)`;
    this.legCycle = Math.random() * Math.PI * 2;

    this.x = Math.random() * (canvasWidth - 40) + 20;
    this.y = canvasHeight - 18 - Math.random() * 8;
    this.vx = (Math.random() - 0.5) * 1.0;
  }

  draw(ctx: CanvasRenderingContext2D, simTime = 0) {
    ctx.save();
    ctx.translate(this.x, this.y);

    let shakeX = 0;
    if (this.isCoughingNow) {
      shakeX = Math.sin(simTime * 0.8) * 2;
    }

    // Kaki Berjalan
    this.legCycle += Math.abs(this.vx) * 0.25;
    const leftLeg = Math.sin(this.legCycle) * 4;
    const rightLeg = -Math.sin(this.legCycle) * 4;

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(shakeX, 0);
    ctx.lineTo(leftLeg, 6);
    ctx.moveTo(shakeX, 0);
    ctx.lineTo(rightLeg, 6);
    ctx.stroke();

    // Badan
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(shakeX, -6, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Kepala
    ctx.fillStyle = "#fbcfe8";
    ctx.beginPath();
    ctx.arc(shakeX, -14, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Masker Adaptif polusi
    if (this.hasMask) {
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      if (this.vx >= 0) {
        ctx.arc(shakeX + 1.2, -13, 2, 0, Math.PI);
        ctx.lineTo(shakeX + 3.5, -13);
      } else {
        ctx.arc(shakeX - 1.2, -13, 2, 0, Math.PI);
        ctx.lineTo(shakeX - 3.5, -13);
      }
      ctx.fill();

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 0.4;
      ctx.beginPath();
      ctx.moveTo(shakeX, -13.5);
      ctx.lineTo(shakeX - 1.5, -14);
      ctx.stroke();
    }

    // Dialog Batuk Visual
    if (this.isCoughingNow && this.coughBubbleTimer > 0) {
      ctx.fillStyle = "#f43f5e";
      ctx.beginPath();
      ctx.arc(shakeX + 12, -24, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(shakeX + 7, -20);
      ctx.lineTo(shakeX + 3, -15);
      ctx.lineTo(shakeX + 11, -17);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 7px sans-serif";
      ctx.fillText("UHUK!", shakeX + 6, -22);
    }

    ctx.restore();
  }

  update(aqi: number, canvasWidth: number) {
    if (aqi > 100) {
      if (!this.hasMask && Math.random() < 0.05) this.hasMask = true;
    } else {
      if (this.hasMask && Math.random() < 0.01) this.hasMask = false;
    }

    if (aqi > 80) {
      const coughRisk = (aqi / 400) * (this.hasMask ? 0.001 : 0.007);
      if (!this.isCoughingNow && Math.random() < coughRisk) {
        this.isCoughingNow = true;
        this.coughTimer = 45;
        this.coughBubbleTimer = 45;
      }
    }

    if (this.isCoughingNow) {
      this.coughTimer--;
      this.coughBubbleTimer--;
      this.vx *= 0.5;
      if (this.coughTimer <= 0) {
        this.isCoughingNow = false;
        this.vx = (Math.random() - 0.5) * 1.0;
      }
    } else {
      this.x += this.vx;
      if (Math.random() < 0.01) this.vx = (Math.random() - 0.5) * 1.0;
    }

    if (this.x < 10) {
      this.x = 10;
      this.vx *= -1;
    }
    if (this.x > canvasWidth - 10) {
      this.x = canvasWidth - 10;
      this.vx *= -1;
    }
  }
}

export class SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    type: "pabrik" | "sampah" | "kendaraan",
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx + (Math.random() - 0.5) * 0.4;
    this.vy = vy - Math.random() * 0.5;
    this.size = Math.random() * 4 + 2;
    this.alpha = 0.9;
    this.decay = Math.random() * 0.008 + 0.004;

    if (type === "pabrik") this.color = "rgba(71, 85, 105, ";
    else if (type === "sampah") this.color = "rgba(120, 113, 108, ";
    else this.color = "rgba(148, 163, 184, ";
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.color + this.alpha + ")";
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }

  update(windSpeed: number) {
    this.x += this.vx + windSpeed * 0.1;
    this.y += this.vy;
    this.size += 0.1;
    this.alpha -= this.decay;
  }
}

export class Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
  canvasWidth: number;

  constructor(canvasWidth: number) {
    this.canvasWidth = canvasWidth;
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * 60 + 15;
    this.size = Math.random() * 20 + 15;
    this.speed = Math.random() * 0.15 + 0.05;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.arc(
      this.x + this.size * 0.6,
      this.y - this.size * 0.2,
      this.size * 0.8,
      0,
      Math.PI * 2,
    );
    ctx.arc(
      this.x + this.size * 1.2,
      this.y,
      this.size * 0.6,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  update(windSpeed: number) {
    this.x += this.speed * (windSpeed * 0.4 + 0.5);
    if (this.x - this.size * 2 > this.canvasWidth) {
      this.x = -this.size * 2;
      this.y = Math.random() * 60 + 15;
    }
  }
}
