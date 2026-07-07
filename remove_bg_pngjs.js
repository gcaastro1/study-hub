const fs = require('fs');
const { PNG } = require('pngjs');

fs.createReadStream('public/pet.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function() {
    // Get top-left pixel color
    const bgR = this.data[0];
    const bgG = this.data[1];
    const bgB = this.data[2];
    const tolerance = 15;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];

        if (Math.abs(r - bgR) <= tolerance && 
            Math.abs(g - bgG) <= tolerance && 
            Math.abs(b - bgB) <= tolerance) {
          this.data[idx + 3] = 0; // Set alpha to 0
        }
      }
    }

    this.pack().pipe(fs.createWriteStream('public/pet_transparent.png'))
      .on('finish', () => console.log('Successfully removed background using pngjs.'));
  })
  .on('error', (err) => console.error("Error reading image:", err));
