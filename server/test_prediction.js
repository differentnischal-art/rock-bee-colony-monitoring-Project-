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

        console.log("--- 1. Testing with @tensorflow-models/mobilenet ---");
        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);
        const model = await mobilenet.load({
            version: 2,
            alpha: 1.0,
            modelUrl: localHandler
        });
        
        // classify expects Tensor3D
        const predictions = await model.classify(tfImage);
        console.log("mobilenet classify predictions:", predictions);

        console.log("--- 2. Testing directly with tf.loadGraphModel ---");
        const graphModel = await tf.loadGraphModel(localHandler);
        // predict expects 4D tensor [1, 224, 224, 3] with normalization?
        // Wait, does graphModel expect [0, 1] or [-1, 1] normalized values, or [0, 255]?
        // MobileNet pre-trained typically expects normalization. Let's see:
        const tfImage4D = tfImage.expandDims(0).toFloat();
        
        // Let's test different pre-processings:
        // A: No normalization (0 to 255)
        const outA = graphModel.predict(tfImage4D);
        const maxIdxA = outA.argMax(1);
        console.log("A (0-255) - ArgMax:", await maxIdxA.data(), "Max val:", await tf.max(outA).data());

        // B: [0, 1] normalization
        const tfImage4D_B = tfImage4D.div(255.0);
        const outB = graphModel.predict(tfImage4D_B);
        const maxIdxB = outB.argMax(1);
        console.log("B (0-1) - ArgMax:", await maxIdxB.data(), "Max val:", await tf.max(outB).data());

        // C: [-1, 1] normalization (typical for MobileNetV2)
        const tfImage4D_C = tfImage4D.div(127.5).sub(1.0);
        const outC = graphModel.predict(tfImage4D_C);
        const maxIdxC = outC.argMax(1);
        console.log("C (-1 to 1) - ArgMax:", await maxIdxC.data(), "Max val:", await tf.max(outC).data());

    } catch (err) {
        console.error("Test prediction error:", err);
    }
})();
