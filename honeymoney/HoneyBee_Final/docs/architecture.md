# System Architecture - HoneyBee

HoneyBee is designed as a full-stack application for automated Rock Bee (Apis dorsata) colony detection and conservation monitoring.

## 🏗️ Architecture Overview

The system follows a standard Client-Server architecture with integrated AI/ML processing.

```mermaid
graph TD
    User([User/Researcher]) -->|HTTP/HTTPS| Frontend[React Web App]
    
    subgraph "Frontend (Vite + React)"
        Frontend -->|Capture/Upload| UI[User Interface]
        UI -->|Geolocation API| GPS[GPS Coordinator]
        UI -->|State Management| State[React Hooks]
    end

    Frontend -->|REST API| Backend[Express Server]

    subgraph "Backend (Node.js/Express)"
        Backend -->|Image Data| AI[TensorFlow.js + MobileNetV2]
        AI -->|Classification| Results[Verification Results]
        Backend -->|File Ops| Storage[Local Uploads Storage]
        Backend -->|Queries| Mongoose[Mongoose ODM]
    end

    Mongoose -->|Persistent Data| Mongo[MongoDB Database]

    subgraph "External Services"
        GPS -.-> OSM[OpenStreetMap Reverse Geocoding]
    end
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom Glassmorphism Design)
- **Icons**: Lucide React
- **APIs**: Browser Geolocation, OpenStreetMap Nominatim

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI/ML**: TensorFlow.js Core, MobileNetV2 Model
- **Image Processing**: Sharp
- **Database**: MongoDB with Mongoose ODM
- **Middleware**: Multer (File uploads), CORS, Dotenv

## 🔄 Core Workflow (Verification Flow)

1. **Input**: User uploads an image or captures it via camera.
2. **Context**: GPS coordinates are fetched and reverse-geocoded to an address.
3. **Transmission**: Image and metadata are sent to the `/api/verify-image` endpoint.
4. **Processing**:
    - Backend uses `sharp` to convert the image buffer into a raw tensor.
    - `MobileNetV2` analyzes the tensor for bee/hive features.
    - Confidence score is calculated based on semantic markers.
5. **Output**: System provides safety guidelines and emergency contacts based on the detection result and location.
6. **Persistence**: Verified reports are saved to MongoDB for research analytics.
