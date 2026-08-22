import type { SlideItem } from "./types";

export const LOCAL_STORAGE_KEY = "sizat_materi_max_unlocked_v2";

export const MATERI_SLIDES: SlideItem[] = Array.from({ length: 28 }, (_, i) => {
  const pageNum = i + 1;
  const isVideo = pageNum === 1 || pageNum === 2;
  const ext = isVideo ? "mp4" : "png";
  return {
    id: pageNum,
    type: isVideo ? "video" : "image",
    src:
      pageNum === 4
        ? "/materi/4_polos.png"
        : pageNum === 7
        ? "/materi/7_polos.png"
        : pageNum === 10
        ? "/materi/10_polos.png"
        : pageNum === 14
        ? "/materi/14_polos.png"
        : pageNum === 17
        ? "/materi/17_polos.png"
        : `/materi/${pageNum}.${ext}`,
  };
});

export const PAGE4_OPTIONS = [
  {
    id: "A",
    text: "Air hujan tidak menempati ruang sehingga dapat masuk ke mana saja.",
  },
  {
    id: "B",
    text: "Air hujan memiliki massa, menempati ruang, dan bentuknya mengikuti tempat yang ditempatinya.",
  },
  {
    id: "C",
    text: "Air hujan berubah bentuk karena terkena sinar matahari.",
  },
  {
    id: "D",
    text: "Air hujan berubah menjadi zat baru setelah jatuh ke tanah.",
  },
];

export const PAGE17_OPTIONS = [
  {
    id: "A",
    text: "Membakar sampah plastik daripada mendaur ulang",
  },
  {
    id: "B",
    text: "Menjemur pakaian menggunakan sinar matahari daripada menggunakan mesin pengering",
  },
  {
    id: "C",
    text: "Membuang langsung air bekas cucian ke sungai, tanpa mengolahnya terlebih dahulu",
  },
  {
    id: "D",
    text: "Menebang pohon sembarangan, guna memperbanyak bahan baku produksi",
  },
];

export const PUZZLE_ITEMS = [
  {
    id: "gas",
    image: "/materi/7_kiri_1.png",
    correctSlotId: "slot-gas",
    label: "Partikel Gas",
  },
  {
    id: "padat",
    image: "/materi/7_kiri_2.png",
    correctSlotId: "slot-padat",
    label: "Partikel Padat",
  },
  {
    id: "cair",
    image: "/materi/7_kiri_3.png",
    correctSlotId: "slot-cair",
    label: "Partikel Cair",
  },
];

export const PUZZLE_SLOTS = [
  { id: "slot-padat", title: "Zat Padat", correctItemId: "padat" },
  { id: "slot-cair", title: "Zat Cair", correctItemId: "cair" },
  { id: "slot-gas", title: "Zat Gas", correctItemId: "gas" },
];

export const PAGE14_PUZZLE_ITEMS = [
  {
    id: "menjemur",
    image: "/materi/14_1.png",
    correctSlotId: "slot-menguap",
    label: "Menjemur pakaian",
  },
  {
    id: "mencair",
    image: "/materi/14_2.png",
    correctSlotId: "slot-mencair",
    label: "Es di Kutub mencair",
  },
  {
    id: "dry_ice",
    image: "/materi/14_3.png",
    correctSlotId: "slot-menyublim",
    label: "Dry ice untuk makanan",
  },
  {
    id: "embun",
    image: "/materi/14_4.png",
    correctSlotId: "slot-mengembun",
    label: "Embun di daun",
  },
];

export const PAGE14_PUZZLE_SLOTS = [
  { id: "slot-mencair", title: "Mencair", correctItemId: "mencair" },
  { id: "slot-menyublim", title: "Menyublim", correctItemId: "dry_ice" },
  { id: "slot-mengembun", title: "Mengembun", correctItemId: "embun" },
  { id: "slot-menguap", title: "Menguap", correctItemId: "menjemur" },
];
