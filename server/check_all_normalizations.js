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

async function testImage(graphModel, imgPath) {
    const imageBuffer = fs.readFileSync(imgPath);
    const { data, info } = await sharp(imageBuffer)
        .resize(224, 224)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const rawTensor = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3]);
    const inputTensor = rawTensor.expandDims(0).toFloat();
    
    // Test Raw [0-255]
    const outRaw = graphModel.predict(inputTensor);
    const probRaw = tf.softmax(outRaw);
    const maxIdxRaw = probRaw.argMax(1).dataSync()[0];
    const maxValRaw = probRaw.dataSync()[maxIdxRaw];
    const val392Raw = probRaw.dataSync()[392];

    // Test Div [0-1]
    const outB = graphModel.predict(inputTensor.div(255.0));
    const probB = tf.softmax(outB);
    const maxIdxB = probB.argMax(1).dataSync()[0];
    const maxValB = probB.dataSync()[maxIdxB];
    const val392B = probB.dataSync()[392];

    // Test Norm [-1, 1]
    const outC = graphModel.predict(inputTensor.div(127.5).sub(1.0));
    const probC = tf.softmax(outC);
    const maxIdxC = probC.argMax(1).dataSync()[0];
    const maxValC = probC.dataSync()[maxIdxC];
    const val392C = probC.dataSync()[392];

    const matchRaw = maxIdxRaw === 392 || val392Raw > 0.05;
    const matchB = maxIdxB === 392 || val392B > 0.05;
    const matchC = maxIdxC === 392 || val392C > 0.05;

    if (matchRaw || matchB || matchC) {
        console.log(`Image: ${path.basename(imgPath)}`);
        if (matchRaw) console.log(`  Raw [0-255]: top_idx=${maxIdxRaw} top_val=${maxValRaw.toFixed(4)} class392=${val392Raw.toFixed(4)}`);
        if (matchB)   console.log(`  Div [0-1]  : top_idx=${maxIdxB} top_val=${maxValB.toFixed(4)} class392=${val392B.toFixed(4)}`);
        if (matchC)   console.log(`  Norm[-1,1] : top_idx=${maxIdxC} top_val=${maxValC.toFixed(4)} class392=${val392C.toFixed(4)}`);
    }

    rawTensor.dispose();
    inputTensor.dispose();
    outRaw.dispose();
    probRaw.dispose();
    outB.dispose();
    probB.dispose();
    outC.dispose();
    probC.dispose();
}

(async () => {
    try {
        const modelDir = path.resolve(__dirname, 'model');
        const localHandler = new LocalIOHandler(modelDir);
        const graphModel = await tf.loadGraphModel(localHandler);

        console.log("Checking hives.png...");
        await testImage(graphModel, path.resolve(__dirname, '../images/hives.png'));

        console.log("Checking all images in uploads/user_uploads...");
        const uploadsDir = path.resolve(__dirname, 'uploads/user_uploads');
        const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
        for (const file of files) {
            await testImage(graphModel, path.join(uploadsDir, file));
        }
        console.log("Done checking.");

    } catch (err) {
        console.error(err);
    }
})();
