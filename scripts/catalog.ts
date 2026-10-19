// Starter catalogue built from the photo folders in "Soft Home/".
// Prices, stock and texts are placeholders: the client edits them in /admin.

export type SeedVariant = { name: string; colorHex?: string; image?: string };
export type SeedProduct = {
  slug: string;
  name: string;
  price: number; // cents
  compareAtPrice?: number;
  optionLabel?: string;
  featured?: boolean;
  description: string;
  details: string;
  images: string[]; // source paths relative to the "Soft Home" folder
  variants: SeedVariant[];
};
export type SeedCategory = {
  slug: string;
  name: string;
  description: string;
  image: string;
  skuPrefix: string;
  products: SeedProduct[];
};

const towelDetails =
  "Material: 100% pambuk\nPesha: 500 g/m²\nMadhësitë: 50×90 cm, 70×140 cm\nLarje: deri në 60°C";

const towelColors: [string, string, string][] = [
  ["Tirkiz", "#1fa7b8", "Peshkira/Finale/4T0A1200-turquoise.png"],
  ["Blu", "#4a7fd0", "Peshkira/Finale/4T0A1205-blue.png"],
  ["Rozë", "#e8c3c6", "Peshkira/Finale/4T0A1209-pink.png"],
  ["Rozë pudër", "#e4b9c2", "Peshkira/Finale/4T0A1211-blush-pink.png"],
  ["Fildish", "#efe8dc", "Peshkira/Finale/4T0A1218-ivory.png"],
  ["Bezhë", "#c8b9a3", "Peshkira/Finale/4T0A1230-beige.png"],
  ["Kafe e hirtë", "#857a70", "Peshkira/Finale/4T0A1234-taupe.png"],
  ["Gri-blu", "#6f8394", "Peshkira/Finale/4T0A1242-grey-blue.png"],
  ["Gri e çelët", "#a9a9a7", "Peshkira/Finale/4T0A1254-light-grey.png"],
  ["Mustardë", "#d4a21c", "Peshkira/Finale/4T0A1264-mustard-yellow.png"],
  ["Ulliri", "#6d7560", "Peshkira/Finale/exec-cbcb9be4-83de-4c97-ba9d-d94ba2313c9f.png"],
];

const bedColors: [string, string, string][] = [
  ["Blu qielli", "#b7cde3", "Qarqaf/Finale/Change_bed_sheet_color_2K_20260924155705.jpeg"],
  ["Pjeshkë", "#efc4b6", "Qarqaf/Finale/Change_bed_sheet_color_2K_20260924155711.jpeg"],
  ["Gri", "#9b9a98", "Qarqaf/Finale/Change_bed_sheet_color_2K_20260924155729.jpeg"],
  ["Mente", "#bcdcc8", "Qarqaf/Finale/Change_bed_sheet_color_2K_20260924155736.jpeg"],
  ["Krem", "#e9e1d2", "Qarqaf/Finale/Change_bed_sheet_color_2K_20260924155737.jpeg"],
  ["Rozë pudër", "#f0c9c4", "Qarqaf/Finale/Replace_bed_set_in_image_2K_20260924110838 Topaz Gigapixel 2x scale.jpg"],
];

const bathMats: [string, string][] = [
  ["Set banjoje Abstrakt", "Një motiv abstrakt në tone të buta gri dhe bezhë."],
  ["Set banjoje Pelush Karamel", "Pelush i butë në ngjyrë karameli, i ngrohtë nën këmbë."],
  ["Set banjoje Gjeometrik", "Linja gjeometrike me detaje në blu dhe okër."],
  ["Set banjoje Valë", "Motiv valësh me reliev, në gri të çelët."],
  ["Set banjoje Labirint", "Motiv modern krem me shirita bezhë."],
  ["Set banjoje Pelush Gri", "Pelush i dendur gri, minimal dhe elegant."],
  ["Set banjoje Rrathë", "Reliev me rrathë të butë në ngjyrë rëre."],
  ["Set banjoje Mozaik", "Motiv mozaiku në kafe dhe bezhë."],
  ["Set banjoje Gjethe", "Linja të lira si gjethe, në tone natyrale."],
  ["Set banjoje Art Deco", "Forma art deco në gri dhe krem."],
  ["Set banjoje Shirita", "Shirita diagonalë në gri të errët dhe të çelët."],
  ["Set banjoje Lule", "Lule të vogla shumëngjyrëshe mbi sfond gri."],
  ["Set banjoje Melanzh", "Thurje melanzh në kafe dhe krem."],
  ["Set banjoje Motiv Tradicional", "Motiv tradicional me detaje të kuqe dhe blu."],
  ["Set banjoje Pelush Çokollatë", "Pelush i butë në kafe të errët."],
  ["Set banjoje Reliev Gri", "Reliev i imët në gri të çelët."],
  ["Set banjoje Vintage Blu", "Motiv vintage me lule në blu dhe portokalli."],
];

const pillowCovers: [string, string, string][] = [
  ["Mbështjellëse jastëku Kadife Kafe", "Kadife e butë në kafe të ngrohtë.", "4T0A1279"],
  ["Mbështjellëse jastëku Krem", "Pëlhurë me teksturë të lehtë në krem.", "4T0A1283"],
  ["Mbështjellëse jastëku Motiv Tradicional Gri", "Qëndisje tradicionale me thekë dhe xhufka.", "4T0A1291"],
  ["Mbështjellëse jastëku Kadife Blu", "Kadife blu e zbehtë, freskuese për çdo divan.", "4T0A1296"],
  ["Mbështjellëse jastëku Liri i Bardhë", "Pamje lirit në të bardhë të ngrohtë.", "4T0A1304"],
  ["Mbështjellëse jastëku Motiv Tradicional Krem", "Qëndisje tradicionale mbi sfond krem.", "4T0A1312"],
  ["Mbështjellëse jastëku Satin Rrjetë", "Satin me motiv rrjete në kafe të artë.", "4T0A1319"],
];

export const catalog: SeedCategory[] = [
  {
    slug: "peshqire",
    name: "Peshqirë",
    description: "Peshqirë të trashë prej pambuku, që thithin shpejt dhe mbeten të butë larje pas larjeje.",
    image: "Peshkira/Finale/4T0A1161-multicolor.png",
    skuPrefix: "PSH",
    products: [
      {
        slug: "peshqir-pambuku",
        name: "Peshqir pambuku",
        price: 750,
        featured: true,
        description:
          "Peshqir klasik prej pambuku 100%, i trashë dhe shumë thithës. Bordura e thurur i jep një pamje të pastër, ndërsa fijet e gjata e mbajnë të butë edhe pas shumë larjeve.",
        details: towelDetails,
        images: [
          "Peshkira/Finale/4T0A1161-multicolor.png",
          ...towelColors.map((c) => c[2]),
          "Peshkira/Finale/exec-3c292331-afe6-485a-ba2e-aa4634d08648.png",
          "Peshkira/Finale/exec-73d35154-6f9e-4a85-a124-c19023906ea0.png",
        ],
        variants: towelColors.map(([name, colorHex, image]) => ({ name, colorHex, image })),
      },
    ],
  },
  {
    slug: "carcafe",
    name: "Çarçafë",
    description: "Sete çarçafësh që marrin frymë, për gjumë të qetë në çdo stinë.",
    image: "Qarqaf/Finale/Change_bed_sheet_color_2K_20260924155705.jpeg",
    skuPrefix: "CRC",
    products: [
      {
        slug: "set-carcafesh-pambuku",
        name: "Set çarçafësh pambuku",
        price: 3900,
        compareAtPrice: 4500,
        featured: true,
        description:
          "Set i plotë çarçafësh në ngjyra të buta pastel: mbulesë jorgani, çarçaf dhe dy këllëfë jastëku. Pëlhura e pambukut është e lehtë, e freskët dhe bëhet më e butë me çdo larje.",
        details:
          "Përmban: 1 mbulesë jorgani, 1 çarçaf, 2 këllëfë jastëku\nMaterial: 100% pambuk\nMadhësitë: teke, dopio\nLarje: deri në 40°C",
        images: bedColors.map((c) => c[2]),
        variants: bedColors.map(([name, colorHex, image]) => ({ name, colorHex, image })),
      },
    ],
  },
  {
    slug: "sete-banjoje",
    name: "Sete banjoje",
    description: "Sete tapetësh banjoje me bazë kundër rrëshqitjes, në dhjetëra motive.",
    image: "Set Banjo/Finale/1.png",
    skuPrefix: "BNJ",
    products: bathMats.map(([name, text], i) => ({
      slug: `${name.toLowerCase().replace(/ë/g, "e").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-")}`,
      name,
      price: 1990,
      featured: [0, 2, 13].includes(i),
      description: `${text} Seti përbëhet nga dy copë dhe ka bazë kundër rrëshqitjes, që qëndron e sigurt në pllaka.`,
      details: "Përmban: 2 copë (60×100 cm dhe 50×60 cm)\nBaza: kundër rrëshqitjes\nLarje: deri në 30°C",
      images: [`Set Banjo/Finale/${i + 1}.png`],
      variants: [{ name: "Standard" }],
    })),
  },
  {
    slug: "sete-jorgani",
    name: "Sete jorgani",
    description: "Jorganë të lehtë dhe jastëkë të butë, gati për netë të ngrohta.",
    image: "Set jorgani_/4T0A1191.jpg",
    skuPrefix: "JRG",
    products: [
      {
        slug: "set-jorgani-i-bardhe",
        name: "Set jorgani i bardhë",
        price: 4900,
        featured: true,
        description:
          "Jorgan i kapitonuar me dy jastëkë në të bardhë të pastër. I lehtë por i ngrohtë, me mbushje që nuk grumbullohet.",
        details: "Përmban: 1 jorgan, 2 jastëkë\nMbushje: fibër silikoni\nMadhësitë: teke, dopio",
        images: ["Set jorgani_/4T0A1191.jpg", "Set jorgani_/4T0A1188.jpg", "Set jorgani_/4T0A1195.jpg"],
        variants: [{ name: "Teke" }, { name: "Dopio" }],
        optionLabel: "Madhësia",
      },
      {
        slug: "set-jorgani-mente",
        name: "Set jorgani mente",
        price: 4900,
        description:
          "Jorgan dhe dy jastëkë në një nuancë të freskët mente. Pëlhurë e butë dhe mbushje e lehtë për gjumë të rehatshëm.",
        details: "Përmban: 1 jorgan, 2 jastëkë\nMbushje: fibër silikoni\nMadhësitë: teke, dopio",
        images: ["Set jorgani_/4T0A1340.jpg", "Set jorgani_/4T0A1332.jpg", "Set jorgani_/4T0A1338.jpg"],
        variants: [{ name: "Teke" }, { name: "Dopio" }],
        optionLabel: "Madhësia",
      },
    ],
  },
  {
    slug: "mbeshtjellese-dysheku",
    name: "Mbështjellëse dysheku",
    description: "Çarçafë me llastik që e mbështjellin dyshekun pa rrudha.",
    image: "Mbeshtjelles dysheku_/4T0A1172.jpg",
    skuPrefix: "DSH",
    products: [
      {
        slug: "mbeshtjellese-dysheku-me-llastik",
        name: "Mbështjellëse dysheku me llastik",
        price: 1490,
        featured: true,
        description:
          "Çarçaf me llastik rreth e rrotull që e mban dyshekun të mbuluar dhe të rregullt gjithë natën. Pambuk i butë në gjashtë ngjyra.",
        details: "Material: pambuk\nMadhësitë: 90×200, 140×200, 160×200 cm\nLarje: deri në 40°C",
        images: [
          "Mbeshtjelles dysheku_/4T0A1172.jpg",
          "Mbeshtjelles dysheku_/4T0A1169.jpg",
          "Mbeshtjelles dysheku_/4T0A1175.jpg",
          "Mbeshtjelles dysheku_/4T0A1181.jpg",
        ],
        variants: [
          { name: "Pjeshkë", colorHex: "#f2c2a2" },
          { name: "Rozë", colorHex: "#e59a98", image: "Mbeshtjelles dysheku_/4T0A1181.jpg" },
          { name: "Blu", colorHex: "#9fb4d8" },
          { name: "Mente", colorHex: "#bfe0cf" },
          { name: "Gri", colorHex: "#8f8a90" },
          { name: "Krem", colorHex: "#efe6d3" },
        ],
      },
    ],
  },
  {
    slug: "mbeshtjellese-jastek",
    name: "Mbështjellëse jastëku",
    description: "Mbështjellëse dekorative jastëku që i japin karakter divanit dhe shtratit.",
    image: "Mbeshtjelles jasteku_/Finale/4T0A1291-commercial.png",
    skuPrefix: "JST",
    products: pillowCovers.map(([name, text, file], i) => ({
      slug: name.toLowerCase().replace(/ë/g, "e").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-"),
      name,
      price: 1290,
      featured: [2, 5].includes(i),
      description: `${text} Me zinxhir të fshehur, lehtë për t'u hequr dhe larë.`,
      details: "Madhësia: 45×45 cm\nMbyllja: zinxhir i fshehur\nPërmban vetëm mbështjellësen (pa jastëk)",
      images: [`Mbeshtjelles jasteku_/Finale/${file}-commercial.png`],
      variants: [{ name: "Standard" }],
      optionLabel: "Modeli",
    })),
  },
];
