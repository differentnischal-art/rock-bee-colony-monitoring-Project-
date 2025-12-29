import React, { useState, useRef, useEffect } from 'react';
import {
  Beaker,
  MapPin,
  ShieldCheck,
  ArrowRight,
  LogIn,
  UserPlus,
  Search,
  AlertTriangle,
  Info,
  Menu,
  X,
  Lock,
  User,
  LayoutDashboard
} from 'lucide-react';
import './App.css';
import CameraCapture from './components/CameraCapture';

// Simple Router Hook
const useNavigation = () => {
  const [page, setPage] = useState('welcome');
  return { page, navigate: setPage };
};

const API_URL = 'http://localhost:5001';

const ReportForm = ({ onReport }) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  const [gps, setGps] = useState(null);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [userRole, setUserRole] = useState('General Public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  // Effect to attach stream to video element when it becomes available
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [isCameraOpen, stream]);

  const locationOptions = ['Buildings', 'Farm', 'Tall Cliffs/Tree', 'Bridges', 'Other'];
  const roleOptions = ['Farmer', 'General Public', 'Authorized Person', 'Researcher', 'Student'];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
      setImagePreview(URL.createObjectURL(file));
      setCapturedImage(null);
      // Automatically capture GPS for file uploads to fix location tracking failure
      captureGps();
    }
  };

  // Camera logic moved to CameraCapture component

  const fetchAddress = async (lat, lon) => {
    setIsFetchingAddress(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, {
        headers: { 'User-Agent': 'HoneyBee Conservation App' }
      });
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsFetchingAddress(false);
    }
  };

  const captureGps = () => {
    setIsCapturingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const coords = {
          lat: position.coords.latitude,
          long: position.coords.longitude
        };
        console.log("GPS Location captured:", coords);
        setGps(coords);
        setIsCapturingGps(false);
        fetchAddress(coords.lat, coords.long);
      }, (error) => {
        console.error("GPS Error:", error);
        // Fallback for demo
        const fallbackCoords = { lat: 12.9716, long: 77.5946 };
        setGps(fallbackCoords);
        setIsCapturingGps(false);
        fetchAddress(fallbackCoords.lat, fallbackCoords.long);
      });
    } else {
      setIsCapturingGps(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !selectedLocation) return;

    setIsSubmitting(true);

    // Get image data for verification
    let imageDataForVerification = capturedImage;
    if (imageFile && !capturedImage) {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        imageDataForVerification = reader.result;
        await proceedWithVerification(imageDataForVerification);
      };
      reader.readAsDataURL(imageFile);
    } else {
      await proceedWithVerification(imageDataForVerification);
    }
  };

  const proceedWithVerification = async (imageData) => {
    const reportData = {
      imageData,
      imageFile,
      capturedImage,
      gps: gps || { lat: 12.9716, long: 77.5946 },
      locationType: selectedLocation === 'Other' ? otherLocation : selectedLocation,
      userRole,
      address,
      phoneNumber
    };

    onReport(reportData);
    setIsSubmitting(false);
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div className="upload-options-grid">
        <div className="upload-dropzone">
          <input
            type="file"
            id="colony-upload"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden-input"
          />
          <label htmlFor="colony-upload" className="upload-label">
            <div className="upload-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            </div>
            <span className="upload-small-text">Upload</span>
          </label>
        </div>

        <CameraCapture onCapture={(dataUrl) => {
          setCapturedImage(dataUrl);
          setImage('Captured Image');
          setImageFile(null);
          captureGps();
        }} />
      </div>

      <div className="image-status-preview">
        {image && <span className="upload-text-status">{image}</span>}
        {isCapturingGps && <span className="gps-status">Capturing GPS...</span>}
        {isFetchingAddress && <span className="gps-status">Fetching Address...</span>}
        {address && <span className="address-preview slide-in">{address}</span>}
        {gps && !address && <span className="gps-status success">GPS Linked: {gps.lat.toFixed(2)}, {gps.long.toFixed(2)}</span>}
      </div>

      {capturedImage && (
        <div className="captured-preview-container slide-in">
          <img
            src={capturedImage}
            alt="Captured colony"
            className="captured-image"
          />
          <button type="button" className="btn-retake" onClick={() => setCapturedImage(null)}>Retake</button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="form-group">
        <label className="group-label">Found At:</label>
        <div className="checkbox-grid">
          {locationOptions.map(loc => (
            <label key={loc} className={`checkbox-item ${selectedLocation === loc ? 'active' : ''}`}>
              <input
                type="radio"
                name="location"
                checked={selectedLocation === loc}
                onChange={() => setSelectedLocation(loc)}
                style={{ display: 'none' }}
              />
              {loc}
            </label>
          ))}
        </div>
      </div>

      {selectedLocation === 'Other' && (
        <div className="form-group slide-in">
          <label className="group-label">Specify Location / Address:</label>
          <input
            type="text"
            className="custom-input"
            placeholder="Enter the address or description..."
            value={otherLocation}
            onChange={(e) => setOtherLocation(e.target.value)}
            required
          />
        </div>
      )}

      <div className="form-group">
        <label className="group-label">Your Role:</label>
        <select
          className="custom-select"
          value={userRole}
          onChange={(e) => setUserRole(e.target.value)}
        >
          {roleOptions.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="group-label">Phone Number:</label>
        <div className="input-with-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <input
            type="tel"
            className="custom-input"
            placeholder="Enter your mobile number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary submit-btn"
        disabled={!image || !selectedLocation || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  );
};

const LandingPage = ({ onNavigate }) => (
  <div className="landing-wrapper">
    <div className="landing-container glass">
      <div className="landing-header">
        <img src="/logo.png" alt="HoneyBee Logo" className="landing-logo animate-float" />
        <h1 className="landing-title">HoneyBee.</h1>
        <p className="landing-subtitle">The Professional Interface for Rock Bee Conservation</p>
      </div>

      <div className="auth-options">
        <button className="auth-card-btn login-btn" onClick={() => onNavigate('dashboard')}>
          <div className="icon-circle">
            <User size={24} />
          </div>
          <div className="btn-text-content">
            <span className="btn-label">Quick Access</span>
            <span className="btn-desc">Login to view public data</span>
          </div>
          <ArrowRight size={20} className="arrow-icon" />
        </button>

        <button className="auth-card-btn admin-btn" onClick={() => onNavigate('admin-login')}>
          <div className="icon-circle">
            <Lock size={24} />
          </div>
          <div className="btn-text-content">
            <span className="btn-label">Researcher Admin</span>
            <span className="btn-desc">Manage colonies & research</span>
          </div>
          <ArrowRight size={20} className="arrow-icon" />
        </button>
      </div>

      <div className="landing-footer">
        <p>© 2025 GKVK UAS Bengaluru Initiative</p>
      </div>
    </div>
  </div>
);

const AdminLoginPage = ({ onNavigate, onAuthSuccess }) => (
  <div className="auth-container">
    <div className="auth-card glass animate-fade-in">
      <div className="auth-header">
        <div className="admin-badge">ADMIN ACCESS</div>
        <h2>Researcher Login</h2>
        <p>Enter your credentials to access the admin panel</p>
      </div>
      <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onAuthSuccess(); }}>
        <div className="form-group">
          <label>Researcher Email</label>
          <div className="input-with-icon">
            <User size={18} />
            <input type="email" placeholder="researcher@gkvk.edu.in" required />
          </div>
        </div>
        <div className="form-group">
          <label>Password</label>
          <div className="input-with-icon">
            <Lock size={18} />
            <input type="password" placeholder="••••••••" required />
          </div>
        </div>
        <button type="submit" className="btn-primary-full">
          Sign In as Admin
        </button>
      </form>
      <button className="btn-back" onClick={() => onNavigate('welcome')}>
        <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Welcome
      </button>
    </div>
  </div>
);

// Safety Guidelines Generator (inline to avoid import issues)
const getSafetyGuidelines = (locationType, userRole) => {
  const guidelines = { dos: [], donts: [] };

  // Location-based guidelines
  switch (locationType) {
    case 'Buildings':
      guidelines.dos.push('Keep a safe distance of at least 10 meters');
      guidelines.dos.push('Alert building residents immediately');
      guidelines.dos.push('Contact professional bee removal services');
      guidelines.donts.push('Do not attempt to remove the hive yourself');
      guidelines.donts.push('Do not use water or fire to disperse bees');
      break;
    case 'Farm':
      guidelines.dos.push('Protect nearby crops and livestock');
      guidelines.dos.push('Consider beekeeping opportunities');
      guidelines.donts.push('Do not use pesticides near the hive');
      guidelines.donts.push('Do not disturb during peak activity hours');
      break;
    case 'Tall Cliffs/Tree':
    case 'Bridges':
      guidelines.dos.push('Mark the area with warning signs');
      guidelines.dos.push('Contact specialized high-altitude bee removal teams');
      guidelines.donts.push('NEVER attempt removal without proper equipment');
      guidelines.donts.push('Do not climb or approach the hive');
      break;
    default:
      guidelines.dos.push('Maintain a safe distance');
      guidelines.dos.push('Call emergency services if threatened');
      guidelines.donts.push('Do not provoke or disturb the bees');
      guidelines.donts.push('Do not make sudden movements');
  }

  // Role-specific guidelines
  if (userRole === 'Farmer') {
    guidelines.dos.push('Consider sustainable beekeeping practices');
  } else if (userRole === 'General Public') {
    guidelines.dos.push('Report to local authorities immediately');
  } else if (userRole === 'Authorized Person') {
    guidelines.dos.push('Wear full protective gear (bee suit, gloves, veil)');
  } else if (userRole === 'Student') {
    guidelines.dos.push('Observe only under supervisor guidance');
    guidelines.donts.push('Do not approach without instructor permission');
  }

  return guidelines;
};

const VerificationPage = ({ reportData, onVerified, onRetry }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [autoStoreTimer, setAutoStoreTimer] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState(null);
  const [safetyGuidelines, setSafetyGuidelines] = useState(null);

  useEffect(() => {
    verifyImage();
    fetchEmergencyContact();
    // Generate safety guidelines
    const guidelines = getSafetyGuidelines(reportData.locationType, reportData.userRole);
    setSafetyGuidelines(guidelines);
  }, []);

  const fetchEmergencyContact = async () => {
    try {
      const cityName = reportData.address ? reportData.address.split(',')[0] : '';
      const response = await fetch(`${API_URL}/api/emergency-contacts?lat=${reportData.gps.lat}&long=${reportData.gps.long}&city=${cityName}`);
      if (response.ok) {
        const contact = await response.json();
        setEmergencyContact(contact);
      }
    } catch (err) {
      console.error('Failed to fetch emergency contact:', err);
    }
  };

  const verifyImage = async () => {
    try {
      setIsVerifying(true);
      const response = await fetch(`${API_URL}/api/verify-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: reportData.imageData,
          source: reportData.capturedImage ? 'camera' : 'upload'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI Verification result:', result);
      setVerificationResult(result);
      setIsVerifying(false);

      // If verified, start countdown and auto-store timer
      if (result.isHoneybee) {
        console.log('Verification Success: Rockbee/Honeybee detected');
        const timer = setTimeout(() => {
          storeReport(result);
        }, 60000); // 60 seconds
        setAutoStoreTimer(timer);

        // Start countdown
        let count = 60;
        const countdownInterval = setInterval(() => {
          count--;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('CRITICAL: Verification error:', err);
      // Log more details about the error to help debug "Failed to fetch"
      const errorMessage = err.name === 'TypeError' && err.message === 'Failed to fetch'
        ? 'Network Error: Cannot reach AI Server at ' + API_URL + '. Ensure the backend is running on port 5001.'
        : err.message || 'Verification failed';

      setError(errorMessage);
      setIsVerifying(false);
    }
  };

  const storeReport = async (verificationResult) => {
    try {
      const formData = new FormData();

      if (reportData.imageFile) {
        formData.append('image', reportData.imageFile);
      } else if (reportData.capturedImage) {
        formData.append('image', reportData.capturedImage);
      }

      formData.append('gps', JSON.stringify(reportData.gps));
      formData.append('locationType', reportData.locationType);
      formData.append('userRole', reportData.userRole);
      formData.append('address', reportData.address);
      formData.append('confidence', verificationResult.confidence);

      const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Storage failed');

      const newReport = await response.json();
      onVerified(newReport);
    } catch (err) {
      console.error('Storage error:', err);
      setError('Failed to store report');
    }
  };

  const handleManualContinue = () => {
    if (autoStoreTimer) {
      clearTimeout(autoStoreTimer);
    }
    if (verificationResult) {
      storeReport(verificationResult);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card glass animate-fade-in">
        <h2 className="verification-title">🔍 Verifying Image</h2>

        <div className="verification-image-preview">
          <img src={reportData.imageData} alt="Preview" className="preview-img" />
        </div>

        {isVerifying && (
          <div className="verification-loading">
            <div className="spinner"></div>
            <p>Analyzing image with AI...</p>
          </div>
        )}

        {error && (
          <div className="verification-error">
            <p>❌ {error}</p>
            <button className="btn-retry" onClick={onRetry}>Try Again</button>
          </div>
        )}

        {!isVerifying && verificationResult && (
          <div className="verification-results">
            <div className={`confidence-meter ${verificationResult.isHoneybee ? 'success' : 'failure'}`}>
              <div className="confidence-label">Confidence Score</div>
              <div className="confidence-value">{verificationResult.confidence.toFixed(1)}%</div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${verificationResult.confidence}%` }}
                ></div>
              </div>
            </div>

            {verificationResult.labels && verificationResult.labels.length > 0 && (
              <div className="detected-labels">
                <h4>Detected:</h4>
                <div className="labels-list">
                  {verificationResult.labels.map((label, idx) => (
                    <span key={idx} className="label-tag">{label}</span>
                  ))}
                </div>
              </div>
            )}

            {safetyGuidelines && verificationResult.isHoneybee && (
              <div className="safety-guidelines glass">
                <h3 className="safety-title">⚠️ Safety Guidelines</h3>
                <div className="guidelines-grid">
                  <div className="guideline-section">
                    <h4 className="guideline-header dos">✓ DO's</h4>
                    <ul className="guideline-list">
                      {safetyGuidelines.dos.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="guideline-section">
                    <h4 className="guideline-header donts">✗ DON'Ts</h4>
                    <ul className="guideline-list">
                      {safetyGuidelines.donts.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {emergencyContact && verificationResult.isHoneybee && (
              <div className="emergency-contact glass">
                <h3 className="emergency-title">📞 Emergency Contact</h3>
                <div className="contact-card">
                  <div className="contact-info">
                    <div className="contact-name">{emergencyContact.contactName}</div>
                    <div className="contact-designation">{emergencyContact.designation}</div>
                    <div className="contact-region">📍 {emergencyContact.region}</div>
                  </div>
                  <a href={`tel:${emergencyContact.phoneNumber}`} className="contact-phone">
                    <span className="phone-icon">📱</span>
                    <span className="phone-number">{emergencyContact.phoneNumber}</span>
                  </a>
                </div>
              </div>
            )}

            <div className={`verification-status ${verificationResult.isHoneybee ? 'verified' : 'rejected'}`}>
              {verificationResult.isHoneybee ? (
                <>
                  <div className="status-icon">✅</div>
                  <h3>Honeybee Hive Verified!</h3>
                  <p>This image has been confirmed as a honeybee hive and will be stored in the database.</p>
                  <div className="auto-save-notice">
                    <p>Auto-saving in {countdown} seconds...</p>
                    <button className="btn-retry" onClick={handleManualContinue}>Save Now</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="status-icon">❌</div>
                  <h3>Not a Honeybee Hive</h3>
                  <p>This image doesn't appear to be a honeybee hive (Confidence: {verificationResult.confidence}%). Please capture a clearer image of a honeybee hive.</p>
                  <button className="btn-retry" onClick={onRetry}>Capture New Image</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [pendingReport, setPendingReport] = useState(null);

  const handleReportSubmit = (reportData) => {
    setPendingReport(reportData);
    setShowVerification(true);
  };

  const handleVerified = (newReport) => {
    setShowVerification(false);
    setPendingReport(null);
    // Success is already shown in the verification page
    // Just return to dashboard
  };

  const handleRetry = () => {
    setShowVerification(false);
    setPendingReport(null);
  };

  if (showVerification && pendingReport) {
    return (
      <VerificationPage
        reportData={pendingReport}
        onVerified={handleVerified}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="mobile-app-container">
      {/* Mobile Header */}
      <header className="mobile-header glass">
        <div className="header-left">
          <img src="/logo.png" alt="Logo" className="header-logo" />
          <h1 className="header-title">HoneyBee</h1>
        </div>
        <div className="header-right">
          <button className="icon-btn" onClick={() => setShowMenu(!showMenu)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </button>

          {showMenu && (
            <div className="dropdown-menu glass">
              <button onClick={() => { /* No longer sets activeTab */ setShowMenu(false); }}>Settings</button>
              <button onClick={() => { /* No longer sets activeTab */ setShowMenu(false); }}>History</button>
              <div className="menu-divider"></div>
              <button className="logout-item" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area - Single Page Flow */}
      <main className="mobile-content">
        {/* Section 1: Environment Status */}
        <section className="dashboard-section">
          <div className="status-banner glass box-glow">
            <div className="status-content">
              <span className="status-label">Environment Status</span>
              <h2 className="status-title">All Systems Healthy</h2>
              <p className="status-desc">Population levels are stable across the monitored region. No critical threats detected in the last 24 hours.</p>
            </div>
            <div className="status-badge">Live</div>
          </div>
        </section>

        {/* Section 2: Colony Reporting Form */}
        <section className="dashboard-section glass section-card">
          <div className="section-header-flex">
            <h2 className="section-title">New Colony Report</h2>
            <div className="live-indicator">
              <span className="dot"></span> Live GPS
            </div>
          </div>
          <ReportForm onReport={handleReportSubmit} />
        </section>
      </main>
    </div>
  );
};

const LocationAnalyticsChart = ({ reports }) => {
  const locationCounts = reports.reduce((acc, report) => {
    const loc = report.locationType;
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(locationCounts), 1);
  const chartData = Object.entries(locationCounts).sort((a, b) => b[1] - a[1]);
  const totalReports = reports.length;

  return (
    <div className="analytics-full-view">
      <div className="analytics-header">
        <h2 className="analytics-main-title">Location Analytics</h2>
        <p className="analytics-subtitle">Distribution of {totalReports} colony reports across different locations</p>
      </div>

      <div className="analytics-chart-container glass">
        <h3 className="chart-title">Colony Distribution by Location</h3>
        <div className="chart-bars">
          {chartData.map(([location, count]) => {
            const percentage = (count / maxCount) * 100;
            const reportPercentage = ((count / totalReports) * 100).toFixed(1);
            return (
              <div key={location} className="bar-item">
                <div className="bar-header">
                  <div className="bar-label">{location}</div>
                  <div className="bar-stats">
                    <span className="bar-percentage">{reportPercentage}%</span>
                  </div>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${percentage}%` }}
                    data-count={count}
                  >
                    <span className="bar-count">{count} reports</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="analytics-summary glass">
        <h3 className="summary-title">Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Most Common</span>
            <span className="summary-value">{chartData[0]?.[0] || 'N/A'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Locations</span>
            <span className="summary-value">{chartData.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Reports</span>
            <span className="summary-value">{totalReports}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ onLogout }) => {
  const [reports, setReports] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('database');

  useEffect(() => {
    fetch(`${API_URL}/api/reports`)
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setIsLoading(false);
      });

    // Fetch contacts
    fetch(`${API_URL}/api/emergency-contacts/all`)
      .then(res => res.json())
      .then(data => setContacts(data))
      .catch(err => console.error("Contacts fetch error:", err));
  }, []);

  const stats = {
    total: reports.length,
    today: reports.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length,
    locations: [...new Set(reports.map(r => r.locationType))].length
  };

  return (
    <div className="admin-container animate-fade-in">
      <header className="admin-header">
        <div>
          <h1 className="header-title" style={{ fontSize: '2rem' }}>Research Repository</h1>
          <p style={{ color: '#71717a' }}>Monitoring {stats.total} global active colonies</p>
        </div>
        <button className="btn-logout-small" onClick={onLogout}>
          <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Logout
        </button>
      </header>

      <div className="admin-stats-grid">
        <div className="stat-card glass box-glow">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Reports</span>
        </div>
        <div className="stat-card glass box-glow">
          <span className="stat-value">{stats.today}</span>
          <span className="stat-label">New Today</span>
        </div>
        <div className="stat-card glass box-glow">
          <span className="stat-value">{stats.locations}</span>
          <span className="stat-label">Hotspots</span>
        </div>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
          onClick={() => setActiveTab('database')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
          Database
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
          Analytics
        </button>
        <button
          className={`tab-btn ${activeTab === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          Authorized
        </button>
      </div>

      {
        activeTab === 'contacts' ? (
          <div className="table-container glass animate-fade-in">
            <div className="section-header-flex" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className="section-title">Authorized Emergency Personnel</h2>
            </div>
            {contacts.length === 0 ? (
              <div className="empty-state">No authorized contacts found.</div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Region</th>
                      <th>Contact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr key={contact._id}>
                        <td style={{ fontWeight: 500 }}>{contact.contactName}</td>
                        <td>
                          <span className="role-badge authorized">{contact.designation}</span>
                        </td>
                        <td>{contact.region}</td>
                        <td>
                          <a href={`tel:${contact.phoneNumber}`} className="contact-link">
                            <span style={{ marginRight: '6px' }}>📞</span>
                            {contact.phoneNumber}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'analytics' ? (
          <LocationAnalyticsChart reports={reports} />
        ) : (
          <div className="section-container">
            <h2 className="section-title" style={{ marginBottom: '24px' }}>Live Field Observations</h2>
            {isLoading ? (
              <div className="loading-state">Loading reports...</div>
            ) : (
              <div className="admin-reports-grid">
                {reports.map((report) => (
                  <div key={report._id} className="admin-report-card glass">
                    <div className="card-image-wrapper">
                      <img
                        src={`${API_URL}${report.image}`}
                        alt="Colony"
                        className="admin-card-img"
                        onError={(e) => { e.target.src = '/logo.png'; }}
                      />
                      <div className="card-badge glass">{report.locationType}</div>
                    </div>
                    <div className="card-content">
                      <div className="card-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {report.locationType} Observation
                      </div>
                      <div className="card-address">
                        {report.address || `${report.gps.lat.toFixed(4)}, ${report.gps.long.toFixed(4)}`}
                      </div>
                      <div className="card-footer">
                        <div className="footer-item">
                          <User size={14} /> {report.userRole}
                        </div>
                        <div className="footer-item">
                          {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }
    </div>
  );
};

function App() {
  const { page, navigate } = useNavigation();
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('isAdmin') === 'true');

  const handleAdminAuth = () => {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true');
    navigate('admin-dashboard');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
    navigate('welcome');
  };

  return (
    <div className="app">
      {page === 'welcome' && <LandingPage onNavigate={navigate} />}
      {page === 'admin-login' && <AdminLoginPage onNavigate={navigate} onAuthSuccess={handleAdminAuth} />}
      {page === 'dashboard' && <Dashboard onLogout={handleLogout} />}
      {page === 'admin-dashboard' && <AdminDashboard onLogout={handleLogout} />}
    </div>
  );
}

export default App;
