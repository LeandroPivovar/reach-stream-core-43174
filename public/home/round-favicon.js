const fs = require('fs');
const img = fs.readFileSync('assets/favico.png');
const base64 = img.toString('base64');
const svg = `<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="circleView">
      <circle cx="256" cy="256" r="256" />
    </clipPath>
  </defs>
  <image width="512" height="512" href="data:image/png;base64,${base64}" clip-path="url(#circleView)" />
</svg>`;
fs.writeFileSync('assets/favico-rounded.svg', svg);
console.log('Saved SVG');
