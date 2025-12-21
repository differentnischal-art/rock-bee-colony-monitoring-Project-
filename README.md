# Rock Bee Colony Detection & Monitoring System

## Project Overview
This project is developed as part of a college initiative in collaboration with **GKVK (University of Agricultural Sciences, Bengaluru)** and related authorities. The objective is to design a **centralized, AI-assisted application** that enables safe reporting, validation, and monitoring of rock bee colonies. The system is intended for **institutional and research use**, supporting ecological conservation while minimizing human–bee conflicts.

---

## Problem Background
Rock bees (*Apis dorsata*) are one of the largest honey bee species found in India. Unlike other honey bees, rock bees exhibit **open nesting behavior**, where colonies are built on exposed surfaces such as rock cliffs, tall trees, and building edges. Due to this behavior, their colonies are highly visible and often located close to human activity.

While rock bees play a critical role in pollination and ecological balance, their proximity to human settlements can lead to safety concerns, panic situations, and improper destruction of colonies. At present, there is **no centralized, technology-driven system** to systematically report, verify, and monitor these colonies.

---

## Need for a Centralized Monitoring System
The absence of a structured monitoring mechanism results in:
- Manual and unverified reporting of colonies  
- Lack of location-based historical data  
- Increased human–bee conflicts  
- Destruction of colonies instead of conservation  
- Limited data availability for researchers and authorities  

A centralized application can bridge this gap by enabling **structured data collection, intelligent validation, and real-time monitoring** for informed decision-making.

---

## Research Summary
The project is based on research into:
- Types of honey bees found in India, with emphasis on rock bees  
- Rock bee habitat, nesting behavior, and seasonal patterns  
- Risks posed by colonies in urban and semi-urban environments  
- Limitations of existing manual and non-digital monitoring approaches  

This research highlights the need for an automated, scalable, and eco-friendly solution.

---

## Problem Breakdown
The overall problem is divided into smaller, manageable challenges:

1. **Unstructured Reporting**  
   - No standardized method to report rock bee colonies  

2. **False or Incorrect Reports**  
   - Images or reports may not actually contain rock bee colonies  

3. **Lack of Monitoring & Visualization**  
   - Authorities lack a centralized view of colony locations. This helps authorities to collect real data through their own app.

4. **Limited Public Awareness**  
   - People often destroy colonies due to fear or misinformation .

---

## Proposed Solution & System Architecture

```mermaid
flowchart TB
    U[Students / Institutions] -->|Incidentally Report| A[Mobile / Web App]

    A -->|Upload Image + Location| AI[AI Validation Layer<br/>CNN Model]

    AI -->|Confidence Score| D[(Central Database)]

    D --> M[Monitoring Dashboard]

    M --> G[GKVK / Authorities]

    G -->|Eco-friendly Action| C[Colony Conservation]

The proposed solution is a **layered system** consisting of:

- **User Reporting Layer**  
  - Students, staff, or trained volunteers report colonies when incidentally encountered.They dont haunt for colonies instead if they see any of such colonies they report on app.

- **AI Validation Layer (Extra Layer)**  
  - Machine Learning model validates uploaded images and assigns confidence scores  (CNN DL model)

- ** Monitoring Layer**  
  - Verified data is stored and visualized on a centralized dashboard .(done by concerned authorities) 

- **Authority Decision Layer**  
  - GKVK and related authorities analyze data and take eco-friendly actions.

This layered approach ensures reliability, scalability, and responsible usage.

---

## AI / Machine Learning Component
The AI component plays a **supportive role**, assisting experts rather than replacing them.

### ML Functions:
- **Image Classification**  
  - Detects whether the uploaded image contains a rock bee colony  
  - Outputs a label and confidence score  

A lightweight CNN-based model ( MobileNet architecture) is suitable for mobile deployment, ensuring efficient and practical inference.

---

## Stakeholders & Usage Model
The application follows a clear role-based usage model:

| Students / Staff or lets say they inform to college or unis and college & unis report in our app.| Report especially when they incidentally encounter colonies

| AI System | Validate images and assign confidence |

| GKVK / Authorities | Monitor data and decide conservation actions |

This structure ensures accountability and realistic deployment.

---

## Scope & Limitations
### Scope:
- Centralized reporting and monitoring  
- AI-assisted validation  
- Support for ecological research and conservation and also for high honey production by knowing their ecological behavioural pattern. 

### Limitations:
- Accuracy depends on image quality (clearer the image higher us the accuracy) 
- ML model performance limited by dataset availability  (dataset of the images from kaggle)
- Final decisions require human expertise  

---

## Future Enhancements
- Advanced bee species classification (not only rockbee but other types of bees are also classified for near future)
- Heatmap-based colony density analysis  (This can be done withib this project only if we get time)
- Seasonal migration prediction (this is advanced but possible) 
- Alert systems for high-risk zones  
 

---

## References
Detailed references and research materials are provided in the `docs/reference-links.txt` file.

---

## Team Details
- **Team Lead:**Nischal Adhikari
- **Team Member:** Ishan Joshi 
- **Team Member:** Alan Basnet


---

## Project Status
Stage-1: Research, problem understanding, and solution design  
Stage-2: Application development and AI integration (planned)

