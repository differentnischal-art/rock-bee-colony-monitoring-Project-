const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
(async () => {
    const model = await mobilenet.load();
    console.log("normalizationConstant:", model.normalizationConstant);
    console.log("inputMin:", model.inputMin);
    console.log("inputMax:", model.inputMax);
})();
