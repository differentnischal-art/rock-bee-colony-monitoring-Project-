const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

class LocalIOHandler {
    constructor(modelDir) {
        this.modelDir = modelDir;
    }

    async load() {
        const modelJsonPath = path.join(this.modelDir, 'model.json');
        const modelJsonContent = fs.readFileSync(modelJsonPath, 'utf8');
        const modelJson = JSON.parse(modelJsonContent);

        const modelTopology = modelJson.modelTopology;
        const weightSpecs = [];
        const buffers = [];

        if (modelJson.weightsManifest) {
            for (const group of modelJson.weightsManifest) {
                if (group.weights) {
                    weightSpecs.push(...group.weights);
                }
                for (const shardPath of group.paths) {
                    const fullShardPath = path.join(this.modelDir, shardPath);
                    const buffer = fs.readFileSync(fullShardPath);
                    buffers.push(buffer);
                }
            }
        }

        const combinedBuffer = Buffer.concat(buffers);
        const weightData = combinedBuffer.buffer.slice(
            combinedBuffer.byteOffset,
            combinedBuffer.byteOffset + combinedBuffer.byteLength
        );

        return {
            modelTopology,
            weightSpecs,
            weightData
        };
    }
}

async function classifyImage(model, imgPath) {
    const imageBuffer = fs.readFileSync(imgPath);
    const { data, info } = await sharp(imageBuffer)
        .resize(224, 224)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const tfImage = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3]);
    const predictions = await model.classify(tfImage);
    tfImage.dispose();

    // Check if any class contains "beauty" or "holacanthus" or "tricolor"
    const beautyPrediction = predictions.find(p => 
        p.className.toLowerCase().includes('beauty') || 
        p.className.toLowerCase().includes('holacanthus') ||
        p.className.toLowerCase().includes('fish') ||
        p.className.toLowerCase().includes('tricolor')
    );

    if (beautyPrediction || predictions[0].className.toLowerCase().includes('beauty') || predictions[0].className.toLowerCase().includes('fish')) {
        console.log(`Image: ${path.basename(imgPath)}`);
        console.log(`  Predictions:`, predictions);
    }
}

(async () => {
    try {
        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);
        const model = await mobilenet.load({
            version: 2,
            alpha: 1.0,
            modelUrl: localHandler
        });

        console.log("Classifying all upload images...");
        const uploadsDir = path.resolve(__dirname, 'uploads/user_uploads');
        const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
        for (const file of files) {
            await classifyImage(model, path.join(uploadsDir, file));
        }
        console.log("Finished classification check.");

    } catch (err) {
        console.error(err);
    }
})();
