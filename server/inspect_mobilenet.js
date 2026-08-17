const mobilenet = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs');

(async () => {
    // We can inspect the module by requiring it and looking at its class map
    // Let's load the model or just inspect the imported module's exported/internal classes
    console.log(Object.keys(mobilenet));
    // Let's load a mock/dummy model or see if the class name map is exposed
    // Wait, let's load mobilenet using standard load and inspect its classes if possible
})();
