import { drawRealisticLeaf, drawRealisticRoot } from "./leafAndRootRenderers";

export { drawRealisticLeaf, drawRealisticRoot };

export const drawPlant = (
  ctx: CanvasRenderingContext2D,
  plantX: number,
  scale: number,
  phase: number,
  rootHealth: number,
  time: number,
) => {
  const groundY = 100;
  const windSpeed = 0.04;
  const swayAmount = 4 * scale;
  const sway = Math.sin(time * windSpeed + phase) * swayAmount;

  const droop = Math.max(0, (100 - rootHealth) / 100);
  const plantHeight = (55 + ((phase * 10) % 15)) * scale * (1 - droop * 0.15);

  ctx.save();

  // 1. Draw organic root branches
  drawRealisticRoot(ctx, plantX, groundY, 15 * scale, 0, 3, rootHealth);
  drawRealisticRoot(ctx, plantX - 2 * scale, groundY, 12 * scale, -Math.PI / 5, 3, rootHealth);
  drawRealisticRoot(ctx, plantX + 2 * scale, groundY, 12 * scale, Math.PI / 5, 3, rootHealth);

  // 2. Draw stems
  ctx.lineWidth = 3.5 * scale;
  let stemColor = "#15803d";
  if (rootHealth <= 20) {
    stemColor = "#57534e";
  } else if (rootHealth <= 40) {
    stemColor = "#854d0e";
  } else if (rootHealth <= 75) {
    stemColor = "#16a34a";
  }
  ctx.strokeStyle = stemColor;
  ctx.lineCap = "round";

  const tipX = plantX + sway - droop * 15 * scale;
  const tipY = groundY - plantHeight;
  const midX = plantX + sway * 0.6 - droop * 8 * scale;
  const midY = groundY - plantHeight * 0.55;

  ctx.beginPath();
  ctx.moveTo(plantX, groundY);
  ctx.quadraticCurveTo(midX, midY, tipX, tipY);
  ctx.stroke();

  // Side branch left
  const branchStartX = midX;
  const branchStartY = midY;
  const branchTipX = branchStartX - 15 * scale + sway * 0.3;
  const branchTipY = branchStartY - 12 * scale + droop * 12 * scale;
  ctx.lineWidth = 2.2 * scale;
  ctx.beginPath();
  ctx.moveTo(branchStartX, branchStartY);
  ctx.quadraticCurveTo(
    (branchStartX + branchTipX) / 2 - 3 * scale,
    (branchStartY + branchTipY) / 2,
    branchTipX,
    branchTipY,
  );
  ctx.stroke();

  // Side branch right
  const branch2StartX = midX + (tipX - midX) * 0.3;
  const branch2StartY = midY - (midY - tipY) * 0.3;
  const branch2TipX = branch2StartX + 12 * scale + sway * 0.3;
  const branch2TipY = branch2StartY - 8 * scale + droop * 8 * scale;
  ctx.lineWidth = 1.8 * scale;
  ctx.beginPath();
  ctx.moveTo(branch2StartX, branch2StartY);
  ctx.quadraticCurveTo(
    (branch2StartX + branch2TipX) / 2 + 2 * scale,
    (branch2StartY + branch2TipY) / 2,
    branch2TipX,
    branch2TipY,
  );
  ctx.stroke();

  // 3. Draw realistic leaves
  ctx.save();
  ctx.translate(tipX, tipY);
  const topAngle = Math.atan2(tipY - midY, tipX - midX) + Math.PI / 2;
  ctx.rotate(topAngle + (droop * Math.PI) / 4);
  drawRealisticLeaf(ctx, 14 * scale, 8 * scale, rootHealth);
  ctx.restore();

  ctx.save();
  ctx.translate(branchTipX, branchTipY);
  ctx.rotate(-Math.PI / 3 - (droop * Math.PI) / 6);
  drawRealisticLeaf(ctx, 12 * scale, 7 * scale, rootHealth);
  ctx.restore();

  ctx.save();
  ctx.translate(branch2TipX, branch2TipY);
  ctx.rotate(Math.PI / 3 + (droop * Math.PI) / 6);
  drawRealisticLeaf(ctx, 10 * scale, 6 * scale, rootHealth);
  ctx.restore();

  ctx.save();
  ctx.translate(midX, midY);
  ctx.rotate(-Math.PI / 2 + (droop * Math.PI) / 4);
  drawRealisticLeaf(ctx, 11 * scale, 6 * scale, rootHealth);
  ctx.restore();

  // 4. Draw flower/fruit representing yield
  const flowerX = tipX + 5 * scale;
  const flowerY = tipY + 2 * scale;
  if (rootHealth > 40) {
    ctx.save();
    ctx.translate(flowerX, flowerY);
    if (rootHealth > 75) {
      const fruitSize = Math.max(1, 4 * scale * (rootHealth / 100));
      ctx.fillStyle = "#ef4444";
      ctx.strokeStyle = "#b91c1c";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, fruitSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#16a34a";
      ctx.beginPath();
      ctx.moveTo(-2 * scale, -fruitSize * 0.8);
      ctx.lineTo(2 * scale, -fruitSize * 0.8);
      ctx.lineTo(0, -fruitSize * 1.2);
      ctx.closePath();
      ctx.fill();
    } else {
      const petalSize = 2.5 * scale;
      ctx.fillStyle = "#eab308";
      for (let i = 0; i < 5; i++) {
        ctx.rotate((Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.ellipse(petalSize, 0, petalSize, petalSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#ca8a04";
      ctx.beginPath();
      ctx.arc(0, 0, petalSize * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
};
