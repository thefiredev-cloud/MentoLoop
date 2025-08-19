import React, { useEffect, useRef } from 'react';
import './MentoLoopBackground.css'; // Import the CSS file

const MentoLoopBackground = ({ children, className = '', showIcons = true }) => {
  const canvas1Ref = useRef(null);
  const canvas2Ref = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const initCanvas = (canvasRef) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      
      const particles = [];
      const particleCount = 50;
      
      // Create particles
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
      
      let animationId;
      
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
          // Update position
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width;
          if (particle.x > canvas.width) particle.x = 0;
          if (particle.y < 0) particle.y = canvas.height;
          if (particle.y > canvas.height) particle.y = 0;
          
          // Draw particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
          ctx.fill();
        });
        
        animationId = requestAnimationFrame(animate);
      };
      
      animate();
      
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    };

    const cleanup1 = initCanvas(canvas1Ref);
    const cleanup2 = setTimeout(() => initCanvas(canvas2Ref), 100);

    return () => {
      if (cleanup1) cleanup1();
      clearTimeout(cleanup2);
    };
  }, []);

  useEffect(() => {
    const createFloatingParticle = () => {
      if (!containerRef.current) return;
      
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * window.innerWidth + 'px';
      particle.style.bottom = '0px';
      particle.style.animationDelay = Math.random() * 6 + 's';
      containerRef.current.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 6000);
    };

    const interval = setInterval(createFloatingParticle, 2000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`mentoloop-background ${className}`}
    >
      {/* Canvas Layers */}
      <canvas 
        ref={canvas1Ref}
        className="canvas-layer canvas-layer-1"
      />
      <canvas 
        ref={canvas2Ref}
        className="canvas-layer canvas-layer-2"
      />
      
      {/* Floating Icons */}
      {showIcons && (
        <div className="floating-icons">
          <div className="floating-icon">
            <HeartIcon />
          </div>
          <div className="floating-icon">
            <UsersIcon />
          </div>
          <div className="floating-icon">
            <StethoscopeIcon />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="content-overlay">
        {children}
      </div>
    </div>
  );
};

// Icon Components
const HeartIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const StethoscopeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
    <circle cx="20" cy="10" r="2"/>
  </svg>
);

export default MentoLoopBackground;

// Usage Example:
/*
import MentoLoopBackground from './components/MentoLoopBackground';

function App() {
  return (
    <MentoLoopBackground>
      <h1>Your App Content</h1>
      <p>This content will appear over the beautiful MentoLoop background</p>
    </MentoLoopBackground>
  );
}
*/