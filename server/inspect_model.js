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
        console.log("Inputs:", graphModel.inputs.map(i => ({name: i.name, shape: i.shape})));
        console.log("Outputs:", graphModel.outputs.map(o => ({name: o.name, shape: o.shape})));
    } catch (err) {
        console.error("Failed to load as graph model:", err.message);
    }

    try {
        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);
        
        console.log("Loading model as layers model...");
        const layersModel = await tf.loadLayersModel(localHandler);
        console.log("Layers model loaded successfully!");
        layersModel.summary();
    } catch (err) {
        console.error("Failed to load as layers model:", err.message);
    }
})();
