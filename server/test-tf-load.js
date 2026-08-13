const tf = require('@tensorflow/tfjs-node');
const mobilenet = require('@tensorflow-models/mobilenet');

(async () => {
    console.log("Testing TensorFlow MobileNet Loading...");
    try {
        const start = Date.now();
        console.log("Attempting to load model (Version 2, Alpha 1.0)...");
        const model = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log(`Success! Model loaded in ${(Date.now() - start) / 1000}s`);
    } catch (err) {
        console.error("❌ Model Loading Failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Full Error:", err);
    }
})();
