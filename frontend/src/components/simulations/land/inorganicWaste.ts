export const drawPlasticBottle = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  ctx.fillStyle = "rgba(186, 230, 253, 0.65)";
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = size * 0.03;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-size * 0.12, -size * 0.4);
  ctx.lineTo(size * 0.12, -size * 0.4);
  ctx.lineTo(size * 0.2, -size * 0.25);
  ctx.bezierCurveTo(size * 0.18, -size * 0.1, size * 0.1, -size * 0.05, size * 0.16, size * 0.15);
  ctx.lineTo(size * 0.2, size * 0.4);
  ctx.bezierCurveTo(size * 0.1, size * 0.45, -size * 0.1, size * 0.45, -size * 0.2, size * 0.4);
  ctx.lineTo(-size * 0.16, size * 0.15);
  ctx.bezierCurveTo(-size * 0.1, -size * 0.05, -size * 0.18, -size * 0.1, -size * 0.2, -size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cap
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(-size * 0.14, -size * 0.48, size * 0.28, size * 0.08);

  // Label
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.beginPath();
  ctx.moveTo(-size * 0.14, -size * 0.1);
  ctx.lineTo(size * 0.14, -size * 0.1);
  ctx.lineTo(size * 0.15, size * 0.1);
  ctx.lineTo(-size * 0.15, size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Folds
  ctx.strokeStyle = "rgba(2, 132, 199, 0.5)";
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(-size * 0.16, -size * 0.2);
  ctx.quadraticCurveTo(0, -size * 0.12, size * 0.18, -size * 0.2);
  ctx.moveTo(-size * 0.13, -size * 0.02);
  ctx.quadraticCurveTo(0, size * 0.04, size * 0.14, -size * 0.03);
  ctx.moveTo(-size * 0.16, size * 0.2);
  ctx.quadraticCurveTo(0, size * 0.26, size * 0.18, size * 0.16);
  ctx.stroke();
  ctx.restore();
};

export const drawTinCan = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  const metalGrad = ctx.createLinearGradient(-size * 0.25, 0, size * 0.25, 0);
  metalGrad.addColorStop(0, "#94a3b8");
  metalGrad.addColorStop(0.3, "#cbd5e1");
  metalGrad.addColorStop(0.7, "#cbd5e1");
  metalGrad.addColorStop(1, "#64748b");

  ctx.fillStyle = metalGrad;
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = size * 0.03;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.35);
  ctx.lineTo(size * 0.2, -size * 0.35);
  ctx.bezierCurveTo(size * 0.22, -size * 0.15, size * 0.05, 0, size * 0.18, size * 0.15);
  ctx.lineTo(size * 0.2, size * 0.35);
  ctx.bezierCurveTo(size * 0.1, size * 0.4, -size * 0.1, size * 0.4, -size * 0.2, size * 0.35);
  ctx.bezierCurveTo(-size * 0.05, 0, -size * 0.22, -size * 0.15, -size * 0.2, -size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Lid
  ctx.fillStyle = "#64748b";
  ctx.beginPath();
  ctx.ellipse(0, -size * 0.35, size * 0.2, size * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Tab hole
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(-size * 0.04, -size * 0.35, size * 0.06, size * 0.02, 0, 0, Math.PI * 2);
  ctx.fill();

  // Ridges
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.22);
  ctx.quadraticCurveTo(0, -size * 0.18, size * 0.21, -size * 0.23);
  ctx.moveTo(-size * 0.19, size * 0.22);
  ctx.quadraticCurveTo(0, size * 0.26, size * 0.19, size * 0.23);
  ctx.stroke();

  // Crushes
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = size * 0.03;
  ctx.beginPath();
  ctx.moveTo(-size * 0.21, -size * 0.02);
  ctx.lineTo(size * 0.1, -size * 0.08);
  ctx.lineTo(-size * 0.08, size * 0.08);
  ctx.lineTo(size * 0.18, size * 0.05);
  ctx.stroke();
  ctx.restore();
};

export const drawPlasticCup = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = size * 0.05;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.2);
  ctx.lineTo(size * 0.1, -size * 0.35);
  ctx.lineTo(size * 0.25, -size * 0.45);
  ctx.stroke();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.05;
  ctx.setLineDash([size * 0.06, size * 0.06]);
  ctx.beginPath();
  ctx.moveTo(-size * 0.05, size * 0.2);
  ctx.lineTo(size * 0.1, -size * 0.35);
  ctx.lineTo(size * 0.25, -size * 0.45);
  ctx.stroke();
  ctx.setLineDash([]);

  // Translucent Cup
  ctx.fillStyle = "rgba(241, 245, 249, 0.45)";
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = size * 0.025;
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.ellipse(0, -size * 0.25, size * 0.25, size * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-size * 0.25, -size * 0.25);
  ctx.bezierCurveTo(-size * 0.2, -size * 0.05, -size * 0.1, size * 0.1, -size * 0.14, size * 0.35);
  ctx.lineTo(size * 0.14, size * 0.35);
  ctx.bezierCurveTo(size * 0.1, size * 0.1, size * 0.2, -size * 0.05, size * 0.25, -size * 0.25);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, size * 0.35, size * 0.14, size * 0.03, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Ridges
  ctx.strokeStyle = "rgba(148, 163, 184, 0.6)";
  ctx.lineWidth = size * 0.015;
  ctx.beginPath();
  ctx.moveTo(-size * 0.22, -size * 0.15);
  ctx.lineTo(size * 0.22, -size * 0.15);
  ctx.moveTo(-size * 0.18, -size * 0.02);
  ctx.lineTo(size * 0.18, -size * 0.02);
  ctx.moveTo(-size * 0.15, size * 0.12);
  ctx.lineTo(size * 0.15, size * 0.12);
  ctx.stroke();
  ctx.restore();
};

export const drawBattery = (ctx: CanvasRenderingContext2D, size: number) => {
  ctx.save();
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = size * 0.03;
  ctx.lineJoin = "round";

  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(-size * 0.16, -size * 0.1);
  ctx.lineTo(size * 0.16, -size * 0.1);
  ctx.lineTo(size * 0.16, size * 0.35);
  ctx.lineTo(-size * 0.16, size * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#b45309";
  ctx.beginPath();
  ctx.moveTo(-size * 0.16, -size * 0.35);
  ctx.lineTo(size * 0.16, -size * 0.35);
  ctx.lineTo(size * 0.16, -size * 0.1);
  ctx.lineTo(-size * 0.16, -size * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#94a3b8";
  ctx.beginPath();
  ctx.rect(-size * 0.05, -size * 0.42, size * 0.1, size * 0.07);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.14}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AA", 0, size * 0.02);

  ctx.fillStyle = "#fef08a";
  ctx.font = `bold ${size * 0.15}px sans-serif`;
  ctx.fillText("+", 0, -size * 0.22);

  ctx.fillStyle = "#94a3b8";
  ctx.font = `bold ${size * 0.15}px sans-serif`;
  ctx.fillText("-", 0, size * 0.24);

  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(-size * 0.12, size * 0.1, size * 0.04, 0, Math.PI * 2);
  ctx.arc(size * 0.14, size * 0.28, size * 0.03, 0, Math.PI * 2);
  ctx.arc(-size * 0.04, size * 0.34, size * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};
