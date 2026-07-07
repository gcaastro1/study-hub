const Jimp = require('jimp');

async function removeBackground(inputPath, outputPath) {
  try {
    const image = await Jimp.read(inputPath);
    const bgColor = image.getPixelColor(0, 0); // Get top-left pixel color

    // Give a small tolerance since jpeg/ai artifacts might exist
    const bgR = Jimp.intToRGBA(bgColor).r;
    const bgG = Jimp.intToRGBA(bgColor).g;
    const bgB = Jimp.intToRGBA(bgColor).b;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];

      const tolerance = 15;
      if (Math.abs(r - bgR) <= tolerance && Math.abs(g - bgG) <= tolerance && Math.abs(b - bgB) <= tolerance) {
        this.bitmap.data[idx + 3] = 0; // Make transparent
      }
    });

    await image.writeAsync(outputPath);
    console.log("Success! Background removed.");
  } catch (error) {
    console.error("Error:", error);
  }
}

removeBackground('public/pet.png', 'public/pet_transparent.png');
