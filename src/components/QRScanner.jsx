import React, { useState, useRef } from 'react';
import { WebcamQrScanner } from 'react-webcam-qr-scanner';

const QRScanner = ({ onScan, onClose }) => {
  const [facingMode, setFacingMode] = useState('environment');
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef(null);

  const handleScan = (result) => {
    if (result?.data) {
      setIsScanning(false);
      onScan(result.data);
    }
  };

  const handleError = (error) => {
    console.error("Error en el escáner QR:", error);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleClose = () => {
    setIsScanning(false);
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Vista del escáner QR */}
      <div className="relative" style={{ width: '100%', aspectRatio: '1' }}>
        {isScanning ? (
          <WebcamQrScanner
            ref={scannerRef}
            onDecode={handleScan}
            onError={handleError}
            scannerOptions={{
              delayBetweenScanAttempts: 300,
              constraints: {
                facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
              }
            }}
            webcamContainerStyle={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '0.5rem',
              backgroundColor: '#e5e7eb'
            }}
            webcamStyle={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            overlayStyle={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: '4px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            innerOverlayStyle={{
              width: '75%',
              height: '75%',
              border: '2px solid rgba(255, 255, 255, 0.7)',
              borderRadius: '0.25rem'
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <p>Cámara apagada</p>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        <button
          onClick={toggleCamera}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
          disabled={!isScanning}
        >
          Cambiar cámara
        </button>
        <button
          onClick={handleClose}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar escáner
        </button>
      </div>
    </div>
  );
};

export default QRScanner;