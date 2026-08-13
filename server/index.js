const express = require('express');
const util = require('util');

// Polyfill for Node v25 compatibility (TensorFlow-node fix)
if (typeof util.isNullOrUndefined === 'undefined') {
    util.isNullOrUndefined = (value) => value === null || value === undefined;
}

const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
require('dotenv').config();

// Load MobileNet Model Once and Reuse
let model;
let modelLoading = false;

async function getModel() {
    if (model) return model;
    if (modelLoading) {
        console.log("Model is already loading, waiting...");
        while (modelLoading) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (model) return model;
        }
    }

    try {
        modelLoading = true;
        console.log("🚀 Initializing MobileNet model...");
        const start = Date.now();
        model = await mobilenet.load({ version: 2, alpha: 1.0 });
        console.log(`✅ MobileNet model loaded successfully in ${(Date.now() - start) / 1000}s!`);
        return model;
    } catch (err) {
        console.error("❌ Failed to load MobileNet:", err);
        return null;
    } finally {
        modelLoading = false;
    }
}

// Initial load
getModel();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
const cameraDir = path.join(__dirname, 'uploads/camera');
const userUploadsDir = path.join(__dirname, 'uploads/user_uploads');

[uploadDir, cameraDir, userUploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/honeybee';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Report Schema
const reportSchema = new mongoose.Schema({
    image: String,
    gps: {
        lat: Number,
        long: Number
    },
    locationType: String,
    userRole: String,
    address: String,
    phoneNumber: String,
    timestamp: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

// --- Local File Storage Fallback ---
const DATA_FILE = path.join(__dirname, 'reports.json');
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

const localStore = {
    async getAll() {
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } catch (e) { return []; }
    },
    async save(reportData) {
        const reports = await this.getAll();
        const newReport = { ...reportData, _id: Date.now().toString(), timestamp: new Date() };
        reports.unshift(newReport);
        fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2));
        return newReport;
    }
};
// -----------------------------------

// Emergency Contact Schema
const emergencyContactSchema = new mongoose.Schema({
    region: { type: String, required: true },
    contactName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    designation: { type: String, required: true },
    city: String,
    state: String,
    createdAt: { type: Date, default: Date.now }
});

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/user_uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'UP',
        modelLoaded: !!model,
        timestamp: new Date().toISOString()
    });
});

// Verify image using TensorFlow MobileNet (Fast & Reliable!)
app.post('/api/verify-image', async (req, res) => {
    try {
        const { imageData, source } = req.body; // source: 'camera' or 'upload'

        if (!imageData) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        const activeModel = await getModel();
        if (!activeModel) {
            return res.status(503).json({ message: 'AI Model failed to initialize. Please try again in a moment.' });
        }

        console.log('Analyzing image with TensorFlow MobileNet...');

        // Extract base64 data and convert to buffer
        const base64Image = imageData.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Image, 'base64');

        // Decode image to Tensor using Sharp (Pure JS Fallback)
        const { data, info } = await sharp(imageBuffer)
            .resize(224, 224) // MobileNet standard size
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const tfImage = tf.tensor3d(new Uint8Array(data), [info.height, info.width, 3]);

        // Classify
        const predictions = await activeModel.classify(tfImage);
        tfImage.dispose(); // Free memory immediately

        console.log('MobileNet Predictions:', predictions);

        let confidence = 0;
        let isHoneybee = false;
        const detectedFeatures = [];

        // Define keywords for Honeybee/Hive (Focus on Rockbee/Honeybee specific markers)
        const positiveKeywords = ['honeycomb', 'bee', 'apiary', 'hive', 'wasp', 'hornet', 'cell'];

        // Define keywords for Rejection (Selfies, People, Objects, unrelated insects)
        const negativeKeywords = ['cellular telephone', 'hand-held computer', 'mirror', 'wig', 'mask', 'sunglasses', 'sunglass', 'monitor', 'screen', 'person', 'groom', 'jersey', 'pajama', 'ant', 'fly', 'spider', 'cockroach'];

        console.log('Classifying image...');
        // 1. Check for Hive/Bee matches
        const beeMatch = predictions.find(p =>
            positiveKeywords.some(keyword => p.className.toLowerCase().includes(keyword))
        );

        // 2. Check for Rejection matches
        const rejectionMatch = predictions.find(p =>
            negativeKeywords.some(keyword => p.className.toLowerCase().includes(keyword))
        );

        if (rejectionMatch && !beeMatch) {
            console.log(`Detected rejection feature: ${rejectionMatch.className}`);
            confidence = 0;
            detectedFeatures.push(`Rejected: Identified as ${rejectionMatch.className}`);
            isHoneybee = false;
        } else if (beeMatch) {
            // Confidence based on probability
            confidence = Math.round(beeMatch.probability * 100);

            // Artificial boost for "honeycomb" or "apiary" specific matches
            if (beeMatch.className.toLowerCase().includes('honeycomb') || beeMatch.className.toLowerCase().includes('apiary')) {
                confidence = Math.max(confidence, 95);
            }

            // Threshold: Rockbees are large and distinct, MobileNet usually tags them as bees or honeycomb
            if (confidence > 35) isHoneybee = true;

            detectedFeatures.push(`Rockbee/Honeybee Detected`);
        } else {
            // No direct match, check top prediction
            const topPrediction = predictions[0];
            confidence = Math.round(topPrediction.probability * 100);

            // If top prediction is still an insect but not specifically matched, label it with caution
            if (topPrediction.className.toLowerCase().includes('insect') || topPrediction.className.toLowerCase().includes('invertebrate')) {
                detectedFeatures.push(`Potential Insect: ${topPrediction.className}`);
                if (confidence > 50) {
                    isHoneybee = true; // Still allow if it's high confidence insect but not ant/fly
                    detectedFeatures.push(`Rockbee/Honeybee (High Confidence Insect)`);
                }
            } else {
                detectedFeatures.push(`Identified: ${topPrediction.className} (Not a hive)`);
                isHoneybee = false;
                confidence = 0;
            }
        }

        console.log(`Final Result: ${isHoneybee ? 'VERIFIED' : 'REJECTED'} (${confidence}%)`);

        res.json({
            isHoneybee,
            confidence: Math.round(confidence),
            labels: detectedFeatures,
            predictions: predictions.slice(0, 3), // Return top 3 for transparency
            message: 'AI Analysis Complete (Enhanced MobileNetV2 logic)'
        });

    } catch (err) {
        console.error('Verification error:', err.message);
        res.status(500).json({
            message: 'Verification failed',
            error: err.message
        });
    }
});

// Get all reports
app.get('/api/reports', async (req, res) => {
    try {
        let reports;
        if (mongoose.connection.readyState === 1) {
            reports = await Report.find().sort({ timestamp: -1 });
        } else {
            console.log('Using local file fallback for fetch');
            reports = await localStore.getAll();
        }
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new report
app.post('/api/reports', upload.single('image'), async (req, res) => {
    try {
        const { gps, locationType, userRole, address, phoneNumber } = req.body;
        let imagePath = '';

        if (req.file) {
            imagePath = `/uploads/user_uploads/${req.file.filename}`;
        } else if (req.body.image && req.body.image.startsWith('data:image')) {
            // Handle base64 captured image
            const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, "");
            const filename = `capture-${Date.now()}.jpg`;
            const fullPath = path.join(cameraDir, filename);
            fs.writeFileSync(fullPath, base64Data, 'base64');
            imagePath = `/uploads/camera/${filename}`;
        }

        const reportData = {
            image: imagePath,
            gps: JSON.parse(gps),
            locationType,
            userRole,
            address,
            phoneNumber
        };

        let newReport;
        if (mongoose.connection.readyState === 1) {
            const report = new Report(reportData);
            newReport = await report.save();
        } else {
            console.log('Using local file fallback for storage');
            newReport = await localStore.save(reportData);
        }

        res.status(201).json(newReport);
    } catch (err) {
        console.error("Server Error:", err);
        res.status(400).json({ message: err.message });
    }
});

// Emergency Contact Routes

// Get emergency contact for location
app.get('/api/emergency-contacts', async (req, res) => {
    try {
        const { lat, long, city } = req.query;

        // Try to find contact by city first, then by state, then default
        let contact = await EmergencyContact.findOne({ city: city });

        if (!contact) {
            // Fallback to any contact (for demo)
            contact = await EmergencyContact.findOne();
        }

        if (!contact) {
            // Return default contact if none found
            return res.json({
                region: 'India',
                contactName: 'National Bee Emergency Helpline',
                phoneNumber: '+91 98765 43212',
                designation: 'Emergency Response Team'
            });
        }

        res.json(contact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all emergency contacts (Admin only)
app.get('/api/emergency-contacts/all', async (req, res) => {
    try {
        const contacts = await EmergencyContact.find().sort({ region: 1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create emergency contact (Admin only)
app.post('/api/emergency-contacts', async (req, res) => {
    try {
        const { region, contactName, phoneNumber, designation, city, state } = req.body;

        const contact = new EmergencyContact({
            region,
            contactName,
            phoneNumber,
            designation,
            city,
            state
        });

        const newContact = await contact.save();
        res.status(201).json(newContact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update emergency contact (Admin only)
app.put('/api/emergency-contacts/:id', async (req, res) => {
    try {
        const { region, contactName, phoneNumber, designation, city, state } = req.body;

        const contact = await EmergencyContact.findByIdAndUpdate(
            req.params.id,
            { region, contactName, phoneNumber, designation, city, state },
            { new: true }
        );

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json(contact);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete emergency contact (Admin only)
app.delete('/api/emergency-contacts/:id', async (req, res) => {
    try {
        const contact = await EmergencyContact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('🐝 AI Detection: TensorFlow MobileNet V2 (Standard ML Model)');
    console.log('✓ Optimized for semantic object recognition');
});
