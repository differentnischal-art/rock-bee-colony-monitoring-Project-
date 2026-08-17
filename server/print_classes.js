const classes = require('@tensorflow-models/mobilenet/dist/imagenet_classes');
console.log("IMAGENET CLASSES TYPE:", typeof classes);
console.log("IMAGENET CLASSES KEYS/KEYS COUNT:", Object.keys(classes).length);
console.log("IMAGENET CLASSES Sample (first 10):", Object.entries(classes).slice(0, 10));

// Let's search for "Holacanthus tricolor" or "Rock Beauty" in the classes object
for (const [key, value] of Object.entries(classes)) {
    if (value.toLowerCase().includes('holacanthus') || value.toLowerCase().includes('beauty') || value.toLowerCase().includes('bee') || value.toLowerCase().includes('honeycomb')) {
        console.log(`Index ${key}: ${value}`);
    }
}
