const tf = require('@tensorflow/tfjs');
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
    try {
        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);
        
        console.log("Loading model as graph model...");
        const graphModel = await tf.loadGraphModel(localHandler);
        console.log("Graph model loaded successfully!");
        
        const dummyTensor = tf.zeros([1, 224, 224, 3]);
        const output = graphModel.predict(dummyTensor);
        console.log("Output tensor shape:", output.shape);
        const data = await output.data();
        console.log("Output tensor first 10 elements:", Array.from(data).slice(0, 10));
        console.log("Output tensor length:", data.length);
        
        // Find argmax / top values
        const maxVal = tf.max(output);
        const argMax = tf.argMax(output, 1);
        console.log("Max value:", await maxVal.data());
        console.log("ArgMax index:", await argMax.data());
    } catch (err) {
        console.error("Error running model prediction:", err);
    }
})();
