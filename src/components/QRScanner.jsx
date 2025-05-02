import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';

const QRScanner = ({ onScan, onClose }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [isScanning, setIsScanning] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Manejo de la cámara
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Efecto para iniciar/detener cámara
  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [facingMode, isScanning]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleScan = (result) => {
    if (result?.text) {
      setIsScanning(false); // Apagar cámara al escanear
      onScan(result.text);
    }
  };

  const handleClose = () => {
    setIsScanning(false); // Apagar cámara al cerrar
    onClose();
  };

  if (hasPermission === false) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        No se pudo acceder a la cámara. Por favor verifica los permisos.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vista previa de la cámara */}
      <div className="relative" style={{ width: '100%', aspectRatio: '1' }}>
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg bg-gray-200"
            />
            {/* Marco para el área de escaneo */}
            <div className="absolute inset-0 border-4 border-blue-400/30 rounded-lg pointer-events-none flex items-center justify-center">
              <div className="border-2 border-white/70 rounded-md w-3/4 h-3/4"></div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <p>Cámara apagada</p>
          </div>
        )}
      </div>

      {/* Lector QR (solo activo cuando isScanning es true) */}
      {isScanning && (
        <div style={{ display: 'none' }}>
          <QrReader
        constraints={{
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }}
        scanDelay={300}
        onResult={(result) => {
          if (result) {
            onScan(result.text);
          }
        }}
        onError={(error) => console.error(error)}
        videoContainerStyle={{
          width: '100%',
          paddingTop: '100%', // Relación de aspecto 1:1
          position: 'relative'
        }}
        videoStyle={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        ViewFinder={() => (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '4px solid rgba(0, 0, 255, 0.3)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '75%',
              height: '75%',
              border: '2px solid rgba(255, 255, 255, 0.7)',
              borderRadius: '4px'
            }} />
          </div>
        )}
      />
        </div>
      )}

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