const { IMAGENET_CLASSES } = require('@tensorflow-models/mobilenet/dist/imagenet_classes');
for (const [key, value] of Object.entries(IMAGENET_CLASSES)) {
    if (value.toLowerCase().includes('holacanthus') || value.toLowerCase().includes('beauty') || value.toLowerCase().includes('tricolor')) {
        console.log(`Index ${key}: ${value}`);
    }
}
