import type { FishState, TrashType } from "./types";
import { getSurfaceY } from "./types";

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
    const minX = canvasWidth * 0.65;
    const maxX = canvasWidth - 20;
    const minY = 120;
    const maxY = canvasHeight - 15;

    this.x = Math.random() * (maxX - minX) + minX;
    this.y = Math.random() * (maxY - minY) + minY;
    this.size = Math.random() * 5 + 8;
    this.vx = (Math.random() - 0.5) * 1.2;
    this.vy = (Math.random() - 0.5) * 0.6;
    this.colorHue = Math.floor(Math.random() * 20) + 15;
    this.state = stateType;
    this.wiggleFactor = Math.random() * 10;
    this.wiggleSpeed = 0.12;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    let angle = Math.atan2(this.vy, this.vx);
    if (this.state === "dead") angle = Math.PI;
    ctx.rotate(angle);

    this.wiggleFactor += this.wiggleSpeed;
    const tailWiggle = Math.sin(this.wiggleFactor) * 3;

    let fishBodyColor = `hsl(${this.colorHue}, 90%, 55%)`;
    let eyeColor = "#000000";

    if (this.state === "struggling") {
      fishBodyColor = `hsl(${this.colorHue}, 50%, 65%)`;
    } else if (this.state === "dead") {
      fishBodyColor = `#cbd5e1`;
      eyeColor = "#f43f5e";
    }

    // Ekor
    ctx.beginPath();
    ctx.fillStyle = fishBodyColor;
    ctx.moveTo(-this.size, 0);
    ctx.lineTo(-this.size * 1.4, -this.size * 0.4 + tailWiggle);
    ctx.lineTo(-this.size * 1.2, 0);
    ctx.lineTo(-this.size * 1.4, this.size * 0.4 + tailWiggle);
    ctx.closePath();
    ctx.fill();

    // Tubuh
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

  update(waterToxicity: number, canvasWidth: number, canvasHeight: number, simTime = 0) {
    const minX = canvasWidth * 0.65;
    const maxX = canvasWidth - 20;
    const minY = 120;
    const maxY = canvasHeight - 15;

    if (waterToxicity > 40) {
      if (this.state === "alive") this.state = "struggling";
      const hazard = (waterToxicity - 40) * 0.0008;
      if (this.state === "struggling" && Math.random() < hazard) {
        this.state = "dead";
        this.vy = -0.3;
        this.vx = (Math.random() - 0.5) * 0.05;
      }
    } else {
      if (this.state === "alive" || this.state === "struggling")
        this.state = "alive";
    }

    if (this.state === "alive") {
      this.x += this.vx;
      this.y += this.vy;
      if (Math.random() < 0.01) {
        this.vx = (Math.random() - 0.5) * 1.4;
        this.vy = (Math.random() - 0.5) * 0.6;
      }
      if (this.x < minX) {
        this.x = minX;
        this.vx *= -1;
      }
      if (this.x > maxX) {
        this.x = maxX;
        this.vx *= -1;
      }
      if (this.y < minY + 10) {
        this.y = minY + 10;
        this.vy *= -1;
      }
      if (this.y > maxY) {
        this.y = maxY;
        this.vy *= -1;
      }
    } else if (this.state === "struggling") {
      this.x += this.vx * 0.5;
      this.y += this.vy * 0.5;
      if (this.y > minY + 15) this.vy -= 0.02;
      if (Math.random() < 0.02) {
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.4;
      }
      if (this.x < minX) {
        this.x = minX;
        this.vx *= -1;
      }
      if (this.x > maxX) {
        this.x = maxX;
        this.vx *= -1;
      }
      if (this.y < minY + 5) {
        this.y = minY + 5;
        this.vy = 0.1;
      }
      if (this.y > maxY) {
        this.y = maxY;
        this.vy = -0.1;
      }
    } else if (this.state === "dead") {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > minY + 5) {
        this.vy = -0.3;
      } else {
        this.vy = 0;
        this.vx = Math.sin(simTime * 0.05) * 0.05;
      }
      if (this.x < minX) this.x = minX;
      if (this.x > maxX) this.x = maxX;
    }
  }
}

export class RainParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  length: number;

  constructor(canvasWidth: number) {
    this.x = Math.random() * canvasWidth;
    this.y = -10;
    this.vy = Math.random() * 4 + 5;
    this.vx = -1;
    this.length = Math.random() * 8 + 6;
  }

  draw(ctx: CanvasRenderingContext2D, pondStartX: number, time: number) {
    const surfaceY = getSurfaceY(this.x, pondStartX, time);
    if (this.y >= surfaceY) return;

    const endY = Math.min(this.y + this.vy, surfaceY);
    const endX = this.x + (this.vx * (endY - this.y)) / this.vy;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = "rgba(14, 165, 233, 0.4)";
    ctx.lineWidth = 1;
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
}

export class SeepageParticle {
  x: number;
  y: number;
  vy: number;
  vx: number;
  color: string;
  size: number;

  constructor(startX: number, currentTrash: TrashType) {
    this.x = startX + (Math.random() - 0.5) * 20;
    this.y = 105;
    this.vy = Math.random() * 0.5 + 0.3;
    this.vx = Math.random() * 0.4 + 0.2;
    this.color =
      currentTrash === "anorganik"
        ? `rgba(244, 63, 94, ${Math.random() * 0.6 + 0.2})`
        : `rgba(120, 113, 108, ${Math.random() * 0.5 + 0.2})`;
    this.size = Math.random() * 2 + 1.5;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  update() {
    this.y += this.vy;
    this.x += this.vx;
  }
}
