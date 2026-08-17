const mobilenet = require('@tensorflow-models/mobilenet');
const tf = require('@tensorflow/tfjs');

(async () => {
    const model = await mobilenet.load();
    console.log("Model object keys:", Object.keys(model));
    console.log("Model prototype keys:", Object.getOwnPropertyNames(Object.getPrototypeOf(model)));
    
    // Let's see if we can find the class names list on the model object or imported modules
    // Or let's just classify a one-hot tensor at index 398 or similar!
    // Since there are 1000 classes, let's try predicting a one-hot tensor for each class and print the class names!
    const numClasses = 1000;
    const classes = [];
    
    // Let's create a dummy input or inspect the internal classification
    // Let's see how classify is implemented:
    console.log("classify function source:", model.classify.toString());
})();
