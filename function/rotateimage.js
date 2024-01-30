const sharp = require('sharp');

async function rotateImage(inputImagePath, outputImagePath, rotationAngle) {
  try {
    await sharp(inputImagePath)
      .rotate(rotationAngle)
      .toFile(outputImagePath);
    return 'success';
  } catch (err) {
    console.error(err);
    return 'error';
  }
}

module.exports = {
  rotateImage
}

