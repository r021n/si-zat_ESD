export const drawCitySkyline = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  carX: number,
  checkSampah: boolean,
) => {
  // Bukit Jauh
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.quadraticCurveTo(width * 0.3, height - 80, width * 0.6, height);
  ctx.moveTo(width * 0.4, height);
  ctx.quadraticCurveTo(width * 0.75, height - 60, width, height);
  ctx.fill();

  // Pohon / Taman kota
  ctx.fillStyle = "#10b981";
  ctx.beginPath();
  ctx.arc(100, height - 25, 12, 0, Math.PI * 2);
  ctx.arc(115, height - 30, 15, 0, Math.PI * 2);
  ctx.arc(130, height - 25, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#047857";
  ctx.fillRect(112, height - 25, 6, 12);

  // Trotoar & Jalan Raya
  ctx.fillStyle = "#cbd5e1";
  ctx.fillRect(0, height - 25, width, 25);
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(0, height - 18, width, 5);

  // Pabrik Industri
  ctx.fillStyle = "#64748b";
  ctx.fillRect(width - 120, height - 85, 80, 60);
  ctx.fillStyle = "#475569";
  ctx.fillRect(width - 100, height - 45, 20, 20);

  // Cerobong asap
  ctx.fillStyle = "#475569";
  ctx.fillRect(width - 65, height - 125, 16, 50);
  ctx.fillStyle = "#f43f5e";
  ctx.fillRect(width - 65, height - 120, 16, 6);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(width - 65, height - 114, 16, 6);

  // Tong sampah terbakar
  ctx.fillStyle = "#78716c";
  ctx.fillRect(180, height - 40, 25, 22);
  if (checkSampah) {
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(182, height - 40);
    ctx.lineTo(192.5, height - 52);
    ctx.lineTo(203, height - 40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(186, height - 40);
    ctx.lineTo(192.5, height - 48);
    ctx.lineTo(199, height - 40);
    ctx.closePath();
    ctx.fill();
  }

  // Mobil bergerak
  ctx.fillStyle = "#3b82f6";
  ctx.fillRect(carX, height - 35, 34, 12);
  ctx.fillStyle = "#1d4ed8";
  ctx.fillRect(carX + 6, height - 43, 20, 9);
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(carX + 8, height - 23, 4, 0, Math.PI * 2);
  ctx.arc(carX + 26, height - 23, 4, 0, Math.PI * 2);
  ctx.fill();
};

export const drawSmogOverlay = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  aqi: number,
) => {
  const opacity = Math.min(0.72, aqi / 400);
  if (opacity > 0.05) {
    ctx.fillStyle = `rgba(100, 95, 90, ${opacity})`;
    ctx.fillRect(0, 0, width, height);
  }
};
