import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, RefreshCw } from 'lucide-react';

const CameraCapture = ({ onCapture }) => {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (isCameraOpen && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCameraOpen, stream]);

    const startCamera = async (mode = facingMode) => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: mode }
            });
            setStream(mediaStream);
            setFacingMode(mode);
            setIsCameraOpen(true);
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Unable to access camera. Please check permissions.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsCameraOpen(false);
    };

    const toggleCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        startCamera(newMode);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvasRef.current.toDataURL('image/jpeg');
            onCapture(dataUrl);
            stopCamera();
        }
    };

    return (
        <>
            <div className="upload-dropzone camera-trigger" onClick={() => startCamera()}>
                <div className="upload-icon">
                    <Camera size={24} />
                </div>
                <span className="upload-small-text">Camera</span>
            </div>

            {isCameraOpen && (
                <div className="camera-overlay">
                    <div className="camera-container glass">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className={`camera-video ${facingMode === 'user' ? 'mirrored' : ''}`}
                        />
                        <div className="camera-controls">
                            <button type="button" className="btn-circle cancel" onClick={stopCamera}>
                                <X size={24} />
                            </button>
                            <button type="button" className="btn-capture" onClick={capturePhoto}></button>
                            <button type="button" className="btn-circle switch" onClick={toggleCamera}>
                                <RefreshCw size={24} />
                            </button>
                        </div>
                    </div>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            )}
        </>
    );
};

export default CameraCapture;
