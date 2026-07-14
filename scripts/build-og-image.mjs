import sharp from "sharp";

const W = 1200;
const H = 630;

const svgOverlay = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.15"/>
      <stop offset="55%" stop-color="#000000" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.94"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C6A052"/>
      <stop offset="100%" stop-color="#D4AF37"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <text x="72" y="470" font-family="Georgia, 'Iowan Old Style', serif" font-size="52" font-weight="700" fill="#ECE9E3">
    <tspan x="72" dy="0">Six digits. One house.</tspan>
    <tspan x="72" dy="60">Nobody else.</tspan>
  </text>
  <text x="72" y="580" font-family="Georgia, serif" font-style="italic" font-size="22" fill="url(#gold)">
    Connecting the right property to the right people.
  </text>
</svg>
`;

const logoMark = await sharp("assets/logo-mark-128.png").resize(52, 52).toBuffer();

await sharp("assets/images/source/hero-dusk-facade.jpg")
  .resize(W, H, { fit: "cover", position: "attention" })
  .composite([
    { input: Buffer.from(svgOverlay) },
    { input: logoMark, left: 72, top: 46 },
  ])
  .jpeg({ quality: 88 })
  .toFile("assets/images/og-image.jpg");

console.log("OG image built");
