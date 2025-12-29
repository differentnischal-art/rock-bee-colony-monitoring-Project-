# 🐝 HoneyBee: Rock Bee Conservation Platform

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow-JS-orange.svg)](https://www.tensorflow.org/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Empowering Conservation through Automated Detection and Community Reporting.**

HoneyBee is a professional-grade full-stack application designed to monitor and protect **Rock Bee (Apis dorsata)** colonies. Utilizing state-of-the-art AI detection, it allows researchers and the public to report sightings, receive instant safety guidance, and access emergency services.

---

## 📖 Problem Statement

Rock Bees play a crucial role in pollination and ecosystem health, yet their colonies—often found in urban buildings, farms, and high-altitude cliffs—are frequently disturbed or destroyed due to fear or lack of knowledge. 

**HoneyMoney** bridges this gap by providing:
1. **Instant Identification**: AI-powered verification to distinguish bee hives from other objects.
2. **Contextual Safety**: Immediate guidelines based on the colony's location to protect both humans and bees.
3. **Data-Driven Monitoring**: A centralized system for researchers to track colony distribution and health.

---

## ✨ Key Features

-  **AI-Powered Detection**: Integrated MobileNetV2 model for real-time verification of honeybee colonies.
-  **Smart Geolocation**: Automatic GPS capture with reverse geocoding to identify precisely where a colony is found.
-  **Dynamic Safety Guidelines**: Tailored "DO's and DON'Ts" based on location type (Buildings, Farms, Cliffs, etc.).
-  **Emergency Response**: Instant access to regional bee-emergency helplines based on the location
-  **Research Dashboard**: Secure admin panel for data visualization and report management.
-  **Modern UI**: A premium, mobile-responsive "Golden Harmony" interface using glassmorphism.

---

## 🛠️ Tech Stack

### Frontend & UI
- **React.js**: Modern component-based architecture.
- **Vite**: Ultra-fast build tool for optimized performance.
- **Custom CSS**: Premium glassmorphism design system.
- **Lucide-React**: Clean, semantic iconography.

### Backend & AI
- **Node.js & Express**: Scalable REST API layer.
- **TensorFlow.js**: Client-side ML model execution for privacy and speed.(Initially we tried it through FastAPI but prediction werenot much accurate)
- **MongoDB & Mongoose**: document-based persistence for large-scale reporting.

---

## 📐 App Architecture

The system utilizes a split-client architecture where the frontend handles user interaction and geolocation, while the backend processes AI verification and data persistence.

> [!TIP]
> **See Detailed Architecture**: [docs/architecture.md](docs/architecture.md)

---

##  Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)

### 1. Clone & Install
```bash
#It is just an example
# Clone the repository
git clone https://github.com/your-repo/honeybee.git
cd HoneyBee_Final

# Install Frontend Dependencies
npm install

# Install Backend Dependencies
cd server
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/honeybee
PORT=5001
```

### 3. Run the Application
Open two terminal windows:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd server
npm start
```

---

## 🎥 Demo
You can find the project demo video here: [demo/demo-video-link.txt](demo/demo-video-link.txt)

---

##  Folder Structure
- `app/`: Source code for the application.
- `docs/`: Technical specifications and design documents.
- `demo/`: Demonstration materials and video links.
- `README.md`: Project overview and setup.

---

**Team leader**=**Nischal Adhikari**
**Team member**= **Ishan Joshi**
**Team member**= **Alan Basnet**



Developed as part of the **GKVK UAS Bengaluru Initiative** for sustainable bee conservation. 
