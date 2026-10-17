export const drawRealisticLeaf = (
  ctx: CanvasRenderingContext2D,
  length: number,
  width: number,
  health: number,
) => {
  ctx.save();
  let leafColor = "#22c55e";
  let veinColor = "#16a34a";

  if (health <= 20) {
    leafColor = "#78716c";
    veinColor = "#44403c";
  } else if (health <= 40) {
    leafColor = "#a16207";
    veinColor = "#713f12";
  } else if (health <= 70) {
    leafColor = "#eab308";
    veinColor = "#ca8a04";
  }

  ctx.fillStyle = leafColor;
  ctx.strokeStyle = veinColor;
  ctx.lineWidth = length * 0.04;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-width * 0.6, -length * 0.3, -width * 0.4, -length * 0.8, 0, -length);
  ctx.bezierCurveTo(width * 0.4, -length * 0.8, width * 0.6, -length * 0.3, 0, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -length * 0.9);
  ctx.stroke();

  ctx.lineWidth = length * 0.02;
  ctx.beginPath();
  ctx.moveTo(0, -length * 0.25);
  ctx.lineTo(-width * 0.3, -length * 0.45);
  ctx.moveTo(0, -length * 0.5);
  ctx.lineTo(-width * 0.35, -length * 0.7);
  ctx.moveTo(0, -length * 0.25);
  ctx.lineTo(width * 0.3, -length * 0.45);
  ctx.moveTo(0, -length * 0.5);
  ctx.lineTo(width * 0.35, -length * 0.7);
  ctx.stroke();
  ctx.restore();
};

export const drawRealisticRoot = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  length: number,
  angle: number,
  depth: number,
  health: number,
) => {
  if (depth <= 0) return;
  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);

  let rootColor = "#fef08a";
  if (health <= 40) {
    rootColor = "#334155";
  } else if (health <= 75) {
    rootColor = "#d97706";
  }

  ctx.strokeStyle = rootColor;
  ctx.lineWidth = depth * 1.2;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(0, 0);
  const midY = length * 0.5;
  const wiggleX = Math.sin(startY * 0.05 + depth) * length * 0.15;
  ctx.quadraticCurveTo(wiggleX, midY, 0, length);
  ctx.stroke();

  if (depth > 1) {
    drawRealisticRoot(
      ctx,
      wiggleX * 0.5,
      midY,
      length * 0.7,
      -Math.PI / 6 + Math.sin(startY * 0.1) * 0.1,
      depth - 1,
      health,
    );
    drawRealisticRoot(
      ctx,
      wiggleX * 0.5,
      midY,
      length * 0.7,
      Math.PI / 6 + Math.cos(startY * 0.1) * 0.1,
      depth - 1,
      health,
    );
  } else if (health > 60) {
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, length);
    ctx.lineTo(-length * 0.3, length + length * 0.2);
    ctx.moveTo(0, length);
    ctx.lineTo(length * 0.3, length + length * 0.2);
    ctx.stroke();
  }
  ctx.restore();
};
