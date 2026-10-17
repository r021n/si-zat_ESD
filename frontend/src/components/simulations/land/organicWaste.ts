export const drawAppleCore = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  ctx.strokeStyle = "#5c4033";
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.3);
  ctx.quadraticCurveTo(size * 0.1, -size * 0.5, size * 0.2, -size * 0.45);
  ctx.stroke();

  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.ellipse(size * 0.1, -size * 0.4, size * 0.15, size * 0.08, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.3, Math.PI, 0, false);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.3, 0, Math.PI, false);
  ctx.fill();

  ctx.fillStyle = "#fef08a";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.18, size * 0.28, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, size * 0.18, size * 0.28, size * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.1, -size * 0.18);
  ctx.bezierCurveTo(-size * 0.04, -size * 0.05, -size * 0.04, size * 0.05, -size * 0.1, size * 0.18);
  ctx.lineTo(size * 0.1, size * 0.18);
  ctx.bezierCurveTo(size * 0.04, size * 0.05, size * 0.04, -size * 0.05, size * 0.1, -size * 0.18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.ellipse(-size * 0.03, -size * 0.02, size * 0.03, size * 0.05, -Math.PI / 8, 0, Math.PI * 2);
  ctx.ellipse(size * 0.03, size * 0.02, size * 0.03, size * 0.05, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

export const drawBananaPeel = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  ctx.fillStyle = "#eab308";
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = size * 0.04;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(0, size * 0.2);
  ctx.bezierCurveTo(-size * 0.3, size * 0.2, -size * 0.5, 0, -size * 0.5, -size * 0.2);
  ctx.bezierCurveTo(-size * 0.35, -size * 0.1, -size * 0.15, size * 0.1, 0, size * 0.2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, size * 0.2);
  ctx.bezierCurveTo(size * 0.3, size * 0.2, size * 0.5, 0, size * 0.5, -size * 0.2);
  ctx.bezierCurveTo(size * 0.35, -size * 0.1, size * 0.15, size * 0.1, 0, size * 0.2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-size * 0.1, size * 0.2);
  ctx.bezierCurveTo(-size * 0.15, -size * 0.1, -size * 0.05, -size * 0.4, 0, -size * 0.45);
  ctx.bezierCurveTo(size * 0.05, -size * 0.4, size * 0.15, -size * 0.1, size * 0.1, size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#713f12";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, -size * 0.38);
  ctx.bezierCurveTo(0, -size * 0.42, 0, -size * 0.45, 0, -size * 0.45);
  ctx.bezierCurveTo(0, -size * 0.45, size * 0.02, -size * 0.42, size * 0.05, -size * 0.38);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.42, -size * 0.15);
  ctx.lineTo(-size * 0.5, -size * 0.2);
  ctx.lineTo(-size * 0.45, -size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.42, size * -0.15);
  ctx.lineTo(size * 0.5, size * -0.2);
  ctx.lineTo(size * 0.45, size * -0.1);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.arc(0, size * 0.2, size * 0.1, 0, Math.PI, false);
  ctx.fill();
  ctx.restore();
};

export const drawWitheredLeaf = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  const grad = ctx.createLinearGradient(-size * 0.3, -size * 0.3, size * 0.3, size * 0.3);
  grad.addColorStop(0, "#a16207");
  grad.addColorStop(1, "#713f12");

  ctx.fillStyle = grad;
  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = size * 0.03;

  ctx.beginPath();
  ctx.moveTo(-size * 0.4, 0);
  ctx.quadraticCurveTo(-size * 0.2, -size * 0.3, -size * 0.1, -size * 0.2);
  ctx.lineTo(-size * 0.05, -size * 0.35);
  ctx.lineTo(size * 0.1, -size * 0.2);
  ctx.lineTo(size * 0.2, -size * 0.35);
  ctx.quadraticCurveTo(size * 0.3, -size * 0.1, size * 0.5, 0);
  ctx.quadraticCurveTo(size * 0.3, size * 0.1, size * 0.2, size * 0.35);
  ctx.lineTo(size * 0.1, size * 0.2);
  ctx.lineTo(-size * 0.05, size * 0.35);
  ctx.lineTo(-size * 0.1, size * 0.2);
  ctx.quadraticCurveTo(-size * 0.2, size * 0.3, -size * 0.4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = size * 0.04;
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, 0);
  ctx.lineTo(size * 0.45, 0);
  ctx.stroke();

  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, 0);
  ctx.lineTo(-size * 0.1, -size * 0.15);
  ctx.moveTo(-size * 0.2, 0);
  ctx.lineTo(-size * 0.1, size * 0.15);
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.12, -size * 0.18);
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.12, size * 0.18);
  ctx.moveTo(size * 0.2, 0);
  ctx.lineTo(size * 0.3, -size * 0.12);
  ctx.moveTo(size * 0.2, 0);
  ctx.lineTo(size * 0.3, size * 0.12);
  ctx.stroke();
  ctx.restore();
};

export const drawWatermelonSlice = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  ctx.fillStyle = "#15803d";
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.5, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#bbf7d0";
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.44, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(0, -size * 0.2, size * 0.38, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ef4444";
  ctx.fillRect(-size * 0.5, -size * 0.22, size, size * 0.05);

  ctx.fillStyle = "#1e293b";
  const seedPositions = [
    { x: -size * 0.2, y: size * 0.02, rot: -Math.PI / 4 },
    { x: -size * 0.07, y: size * 0.12, rot: -Math.PI / 12 },
    { x: size * 0.07, y: size * 0.12, rot: Math.PI / 12 },
    { x: size * 0.2, y: size * 0.02, rot: Math.PI / 4 },
  ];
  for (const pos of seedPositions) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(pos.rot);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.02, size * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
};
