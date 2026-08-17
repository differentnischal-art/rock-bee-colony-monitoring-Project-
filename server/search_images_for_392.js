const tf = require('@tensorflow/tfjs');
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

async function checkImage(graphModel, imgPath) {
    const imageBuffer = fs.readFileSync(imgPath);
    const { data, info } = await sharp(imageBuffer)
        .resize(224, 224)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const rawTensor = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3]);
    const inputTensor = rawTensor.expandDims(0).toFloat();

    // Try normalization C [-1, 1] which is standard for MobileNet
    const outC = graphModel.predict(inputTensor.div(127.5).sub(1.0));
    const probC = tf.softmax(outC);
    const probArray = probC.dataSync();
    
    // Find top 3 classes
    const indices = Array.from(probArray).map((p, i) => ({prob: p, idx: i}));
    indices.sort((a, b) => b.prob - a.prob);
    
    // If top class is 392 (rock beauty) or probability of 392 is > 0.05
    const prob392 = probArray[392];
    if (indices[0].idx === 392 || prob392 > 0.05) {
        console.log(`Image: ${path.basename(imgPath)}`);
        console.log(`  Top 3 classes:`, indices.slice(0, 3));
        console.log(`  Class 392 prob: ${prob392.toFixed(4)}`);
    }

    rawTensor.dispose();
    inputTensor.dispose();
    outC.dispose();
    probC.dispose();
}

(async () => {
    try {
        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);
        const graphModel = await tf.loadGraphModel(localHandler);

        console.log("Checking all images in uploads/user_uploads...");
        const uploadsDir = path.resolve(__dirname, 'uploads/user_uploads');
        const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
        for (const file of files) {
            await checkImage(graphModel, path.join(uploadsDir, file));
        }
        console.log("Done checking uploads.");

    } catch (err) {
        console.error(err);
    }
})();
