// MentoLoop Background Animation Script
// For vanilla HTML/CSS/JS projects

class MentoLoopBackground {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      particleCount: options.particleCount || 50,
      showIcons: options.showIcons !== false,
      enableParticles: options.enableParticles !== false,
      ...options
    };
    
    this.animationIds = [];
    this.intervals = [];
    
    this.init();
  }

  init() {
    this.createCanvasLayers();
    if (this.options.showIcons) {
      this.createFloatingIcons();
    }
    if (this.options.enableParticles) {
      this.startParticleEffect();
    }
    this.setupResponsive();
  }

  createCanvasLayers() {
    // Create first canvas layer
    const canvas1 = document.createElement('canvas');
    canvas1.className = 'canvas-layer canvas-layer-1';
    canvas1.id = 'mentoloop-canvas-1';
    this.container.appendChild(canvas1);

    // Create second canvas layer
    const canvas2 = document.createElement('canvas');
    canvas2.className = 'canvas-layer canvas-layer-2';
    canvas2.id = 'mentoloop-canvas-2';
    this.container.appendChild(canvas2);

    // Initialize canvas animations
    this.initCanvas(canvas1);
    setTimeout(() => this.initCanvas(canvas2), 100);
  }

  initCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    
    // Create particles
    for (let i = 0; i < this.options.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
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
      
      const animationId = requestAnimationFrame(animate);
      this.animationIds.push(animationId);
    };
    
    animate();
  }

  createFloatingIcons() {
    const iconsHtml = `
      <div class="floating-icons">
        <div class="floating-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
        <div class="floating-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div class="floating-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/>
            <circle cx="20" cy="10" r="2"/>
          </svg>
        </div>
      </div>
    `;
    
    this.container.insertAdjacentHTML('beforeend', iconsHtml);
  }

  startParticleEffect() {
    const createFloatingParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * window.innerWidth + 'px';
      particle.style.bottom = '0px';
      particle.style.animationDelay = Math.random() * 6 + 's';
      this.container.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.remove();
        }
      }, 6000);
    };

    const interval = setInterval(createFloatingParticle, 2000);
    this.intervals.push(interval);
  }

  setupResponsive() {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    
    const handleMobile = (e) => {
      const icons = this.container.querySelector('.floating-icons');
      if (icons) {
        icons.style.display = e.matches ? 'none' : 'block';
      }
    };

    mediaQuery.addListener(handleMobile);
    handleMobile(mediaQuery);
  }

  destroy() {
    // Clean up animations
    this.animationIds.forEach(id => cancelAnimationFrame(id));
    this.intervals.forEach(interval => clearInterval(interval));
    
    // Remove event listeners
    window.removeEventListener('resize', this.resizeHandler);
    
    // Clear container
    this.container.innerHTML = '';
  }

  // Public methods for customization
  updateParticleCount(count) {
    this.options.particleCount = count;
    // Reinitialize canvas with new particle count
    const canvases = this.container.querySelectorAll('canvas');
    canvases.forEach(canvas => canvas.remove());
    this.createCanvasLayers();
  }

  toggleIcons(show) {
    const icons = this.container.querySelector('.floating-icons');
    if (icons) {
      icons.style.display = show ? 'block' : 'none';
    }
  }
}

// Initialize background when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Auto-initialize if element with class 'mentoloop-background' exists
  const autoInit = document.querySelector('.mentoloop-background[data-auto-init]');
  if (autoInit) {
    new MentoLoopBackground(autoInit.id || 'mentoloop-background');
  }
});

// Usage examples:

/*
// Basic usage
const background = new MentoLoopBackground('my-background-container');

// With options
const background = new MentoLoopBackground('my-background-container', {
  particleCount: 30,
  showIcons: true,
  enableParticles: true
});

// Customization
background.updateParticleCount(100);
background.toggleIcons(false);

// Cleanup when needed
background.destroy();
*/

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MentoLoopBackground;
}

// Global assignment for script tag usage
if (typeof window !== 'undefined') {
  window.MentoLoopBackground = MentoLoopBackground;
}