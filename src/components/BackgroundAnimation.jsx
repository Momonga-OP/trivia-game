import React, { useEffect, useRef } from 'react';
import './styles/background.css';

function BackgroundAnimation({ isInDiscord = false }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initialize canvas dimensions
    setCanvasDimensions();
    
    // Handle window resize
    window.addEventListener('resize', setCanvasDimensions);
    
    // Particle properties - reduce count and complexity for Discord
    const particles = [];
    const particleCount = isInDiscord ? 25 : 50;
    const connectionDistance = isInDiscord ? 80 : 100;
    const updateFrequency = isInDiscord ? 2 : 1; // Only update every X frames in Discord
    let frameCount = 0;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * (isInDiscord ? 1.5 : 2) + 0.5,
        color: `rgba(${140 + Math.random() * 50}, ${82 + Math.random() * 50}, 255, ${Math.random() * (isInDiscord ? 0.4 : 0.5) + (isInDiscord ? 0.1 : 0.2)})`,
        speedX: Math.random() * (isInDiscord ? 0.3 : 0.5) - (isInDiscord ? 0.15 : 0.25),
        speedY: Math.random() * (isInDiscord ? 0.3 : 0.5) - (isInDiscord ? 0.15 : 0.25)
      });
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      frameCount++;
      const shouldUpdate = frameCount % updateFrequency === 0;
      
      // Update and draw particles
      particles.forEach(particle => {
        // Only update position on certain frames when in Discord to improve performance
        if (shouldUpdate) {
          // Update position
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Boundary check
          if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      // Draw connections between particles - skip some connections in Discord
      if (!isInDiscord || shouldUpdate) {
        // In Discord, only check connections for a subset of particles
        const connectionStep = isInDiscord ? 2 : 1;
        
        for (let i = 0; i < particles.length; i += connectionStep) {
          const particle = particles[i];
          for (let j = i + connectionStep; j < particles.length; j += connectionStep) {
            const dx = particle.x - particles[j].x;
            const dy = particle.y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < connectionDistance) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(140, 82, 255, ${0.2 * (1 - distance / connectionDistance)})`;
              ctx.lineWidth = isInDiscord ? 0.3 : 0.5;
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isInDiscord]);
  
  return (
    <div className={`background-container ${isInDiscord ? 'discord-optimized' : ''}`}>
      <div className="background-color"></div>
      <canvas ref={canvasRef} className="particle-canvas"></canvas>
    </div>
  );
}

export default BackgroundAnimation;
