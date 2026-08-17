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

        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);

        console.log("--- Loading with local handler (Default, incorrect normalization) ---");
        const modelDefault = await mobilenet.load({
            version: 2,
            alpha: 1.0,
            modelUrl: localHandler
        });
        const predsDefault = await modelDefault.classify(tfImage);
        console.log("Predictions:", predsDefault);

        console.log("--- Loading with local handler AND inputRange: [0, 1] ---");
        const modelCorrect = await mobilenet.load({
            version: 2,
            alpha: 1.0,
            modelUrl: localHandler,
            inputRange: [0, 1]
        });
        const predsCorrect = await modelCorrect.classify(tfImage);
        console.log("Predictions:", predsCorrect);

    } catch (err) {
        console.error("Error:", err);
    }
})();
