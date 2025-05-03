import React, { useEffect, useRef } from 'react';

const NoiseTexture = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = 200;
    canvas.height = 200;
    
    // Create noise pattern
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Random grayscale value
      const value = Math.floor(Math.random() * 255);
      
      // Set RGB values (all the same for grayscale)
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 15;    // Alpha (very transparent)
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Export the texture
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'noise-texture.png';
    
    // Add to public folder
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'noise-texture.png', { type: 'image/png' });
        console.log('Noise texture generated');
      });
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        display: 'none',
        position: 'absolute',
        pointerEvents: 'none'
      }} 
    />
  );
};

export default NoiseTexture;
