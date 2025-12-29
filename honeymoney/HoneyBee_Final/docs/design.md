# Design Documentation - HoneyBee

## 🎨 Design Philosophy

HoneyBee is built with a focus on **Professionalism, Reliability, and Accessibility**. Since the app is intended for fieldwork, the design prioritizes high contrast, large touch targets, and a "clean" biometric feel.

### UI Theme: "Golden Harmony"
- **Palette**: Deep Charcoal (#1a1a1a), Honey Gold (#f59e0b), and Soft Glass (#ffffff1a).
- **Aesthetic**: Modern Glassmorphism with subtle blurs and box-glow effects to represent the "high-tech" nature of bee conservation.

## 📱 User Experience (UX)

### 1. Minimalistic Onboarding
The landing page provides direct "Quick Access" for the public to ensure rapid reporting during encounters, while "Researcher Admin" is segregated for data analysis.

### 2. Live-Status Feedback
Dynamic updates such as "Capturing GPS..." or "All Systems Healthy" provide the user with confidence that the app is functioning correctly in remote areas.

### 3. Safety-First Flow
Verification is not just about data collection; it triggers immediate safety guidelines (DO's and DON'Ts) tailored to the reported location type (e.g., Buildings vs. Farms).

## 🧩 Component Logic

### AI Verification Component
Uses a multi-stage logic:
- **Keyword Mapping**: Maps MobileNet classes to conservation targets.
- **Negative Filtering**: Explicitly identifies non-hive objects (masks, phones, people) to prevent false positives.
- **Confidence Boosting**: Artificially boosts specific markers like "honeycomb" for higher accuracy.

### Emergency Contact Routing
Implemented a fallback logic that provides national help-lines if regional contacts aren't found in the database, ensuring no user is left without support.
