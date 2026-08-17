const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

(async () => {
    try {
        const imagePath = path.resolve(__dirname, '../images/hives.png');
        const imageBuffer = fs.readFileSync(imagePath);
        
        const { data, info } = await sharp(imageBuffer)
            .resize(224, 224)
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const tfImage = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3]);

        console.log("--- Loading standard MobileNet from Google ---");
        const model = await mobilenet.load({
            version: 2,
            alpha: 1.0
        });
        
        const predictions = await model.classify(tfImage);
        console.log("Standard MobileNet predictions:", predictions);

    } catch (err) {
        console.error("Error:", err);
    }
})();
