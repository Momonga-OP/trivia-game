import React, { useEffect, useRef, useState } from 'react';
import './styles/AnimatedCharacter.css';

function AnimatedCharacter() {
  const characterRef = useRef(null);
  const [direction, setDirection] = useState('right');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(true);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  
  // Initialize character position
  useEffect(() => {
    if (characterRef.current) {
      const container = characterRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const characterRect = characterRef.current.getBoundingClientRect();
      
      // Start at a random position
      const maxX = containerRect.width - characterRect.width;
      const maxY = containerRect.height - characterRect.height;
      const initialX = Math.random() * maxX;
      const initialY = Math.random() * maxY;
      
      setPosition({ x: initialX, y: initialY });
      setNewTarget();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);
  
  // Set a new random target position
  const setNewTarget = () => {
    if (characterRef.current) {
      const container = characterRef.current.parentElement;
      const containerRect = container.getBoundingClientRect();
      const characterRect = characterRef.current.getBoundingClientRect();
      
      // Generate random position
      const maxX = containerRect.width - characterRect.width;
      const maxY = containerRect.height - characterRect.height;
      const newX = Math.random() * maxX;
      const newY = Math.random() * maxY;
      
      setTargetPosition({ x: newX, y: newY });
      
      // Set direction based on target position
      if (newX > position.x) {
        setDirection('right');
      } else {
        setDirection('left');
      }
      
      setIsMoving(true);
    }
  };
  
  // Animation loop for smooth movement
  useEffect(() => {
    if (!isMoving) return;
    
    const moveStep = () => {
      setPosition(prevPos => {
        // Calculate distance to target
        const dx = targetPosition.x - prevPos.x;
        const dy = targetPosition.y - prevPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If we're close enough to the target, set a new target
        if (distance < 5) {
          // Pause briefly before moving again
          setTimeout(() => {
            setNewTarget();
          }, 1000 + Math.random() * 1000);
          setIsMoving(false);
          return prevPos;
        }
        
        // Move towards target
        const speed = 2;
        const vx = (dx / distance) * speed;
        const vy = (dy / distance) * speed;
        
        // Update direction
        if (vx > 0) {
          setDirection('right');
        } else if (vx < 0) {
          setDirection('left');
        }
        
        return {
          x: prevPos.x + vx,
          y: prevPos.y + vy
        };
      });
      
      animationFrameRef.current = requestAnimationFrame(moveStep);
    };
    
    animationFrameRef.current = requestAnimationFrame(moveStep);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMoving, targetPosition]);

  return (
    <div className="animated-character-container">
      <div 
        className={`spartan-character ${direction} ${isMoving ? 'walking' : 'idle'}`} 
        ref={characterRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: 'none'
        }}
      >
        <div className="spartan-head">
          <div className="spartan-helmet"></div>
          <div className="spartan-face"></div>
        </div>
        <div className="spartan-body">
          <div className="spartan-cape"></div>
          <div className="spartan-armor"></div>
          <div className="spartan-shield"></div>
          <div className="spartan-spear"></div>
          <div className="spartan-leg left"></div>
          <div className="spartan-leg right"></div>
        </div>
      </div>
    </div>
  );
}

export default AnimatedCharacter;
