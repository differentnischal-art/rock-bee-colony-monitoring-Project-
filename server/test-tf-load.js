const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
const path = require('path');
const fs = require('fs');

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
    console.log("Testing TensorFlow MobileNet Custom Local IOHandler Loading...");
    try {
        const start = Date.now();
        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);
        
        console.log("Attempting to load model from local handler...");
        const model = await mobilenet.load({
            version: 2,
            alpha: 1.0,
            modelUrl: localHandler
        });
        console.log(`Success! Model loaded in ${(Date.now() - start) / 1000}s`);

        // Run a dummy inference to ensure it actually works
        console.log("Running a test inference to verify weights are loaded correctly...");
        const dummyTensor = tf.zeros([224, 224, 3]);
        const predictions = await model.classify(dummyTensor);
        console.log("Test classification success. Predictions:", predictions);
        dummyTensor.dispose();
    } catch (err) {
        console.error("❌ Model Loading Failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Full Error:", err);
    }
})();


