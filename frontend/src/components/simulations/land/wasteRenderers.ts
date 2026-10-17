import type { WasteSprite } from "./types";
import { drawAppleCore, drawBananaPeel, drawWitheredLeaf, drawWatermelonSlice } from "./organicWaste";
import { drawPlasticBottle, drawTinCan, drawPlasticCup, drawBattery } from "./inorganicWaste";

export {
  drawAppleCore,
  drawBananaPeel,
  drawWitheredLeaf,
  drawWatermelonSlice,
  drawPlasticBottle,
  drawTinCan,
  drawPlasticCup,
  drawBattery,
};

export const drawWasteSprite = (ctx: CanvasRenderingContext2D, item: WasteSprite) => {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);

  switch (item.subtype) {
    case "apple":
      drawAppleCore(ctx, item.size);
      break;
    case "banana":
      drawBananaPeel(ctx, item.size);
      break;
    case "leaf":
      drawWitheredLeaf(ctx, item.size);
      break;
    case "watermelon":
      drawWatermelonSlice(ctx, item.size);
      break;
    case "bottle":
      drawPlasticBottle(ctx, item.size);
      break;
    case "can":
      drawTinCan(ctx, item.size);
      break;
    case "cup":
      drawPlasticCup(ctx, item.size);
      break;
    case "battery":
      drawBattery(ctx, item.size);
      break;
    default:
      ctx.fillStyle = "#475569";
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
};
