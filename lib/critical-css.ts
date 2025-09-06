/**
 * Critical CSS utilities for performance optimization
 * This module helps with critical CSS extraction and inlining
 */

export const criticalStyles = `
/* Critical styles that should be inlined */
.mentoloop-background {
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #003D99 0%, #003D99 40%, #338BFF 100%);
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
}

.glass-navbar-enhanced {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.08) 0%, 
    rgba(255, 255, 255, 0.03) 100%);
  backdrop-filter: blur(25px) saturate(200%);
  -webkit-backdrop-filter: blur(25px) saturate(200%);
  border: 1px solid;
  border-image: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.2) 0%, 
    rgba(255, 255, 255, 0.08) 100%) 1;
}

/* Critical mobile styles */
@media (max-width: 768px) {
  .mentoloop-background {
    min-height: 100svh; /* Use small viewport height on mobile */
  }
  
  .glass-navbar-enhanced {
    backdrop-filter: blur(10px) saturate(150%);
    -webkit-backdrop-filter: blur(10px) saturate(150%);
  }
}
`;

// Function to inject critical CSS into document head
export function injectCriticalCSS(styles: string = criticalStyles) {
  if (typeof document === 'undefined') return;
  
  const styleElement = document.createElement('style');
  styleElement.setAttribute('data-critical', 'true');
  styleElement.textContent = styles;
  
  // Insert before the first external stylesheet to ensure highest priority
  const firstLink = document.querySelector('link[rel="stylesheet"]');
  if (firstLink && firstLink.parentNode) {
    firstLink.parentNode.insertBefore(styleElement, firstLink);
  } else {
    document.head.appendChild(styleElement);
  }
}

// Remove non-critical CSS after load to improve performance
export function deferNonCriticalCSS() {
  if (typeof document === 'undefined') return;
  
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  
  stylesheets.forEach((link) => {
    const href = (link as HTMLLinkElement).href;
    if (href) {
      // Change rel to preload to defer parsing
      (link as HTMLLinkElement).rel = 'preload';
      (link as HTMLLinkElement).as = 'style';
      
      // Load stylesheet asynchronously
      setTimeout(() => {
        (link as HTMLLinkElement).rel = 'stylesheet';
      }, 0);
    }
  });
}

// Preload critical resources
export function preloadCriticalResources() {
  if (typeof document === 'undefined') return;
  
  const criticalResources = [
    // Critical fonts
    '/fonts/inter-var.woff2',
    // Critical images (if any)
    // '/images/hero-background.webp',
  ];
  
  criticalResources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    
    if (resource.includes('.woff2') || resource.includes('.woff')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (resource.includes('.webp') || resource.includes('.jpg') || resource.includes('.png')) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
}

// CSS purging utility for removing unused styles
export function removeUnusedCSS() {
  if (typeof document === 'undefined' || process.env.NODE_ENV !== 'production') return;
  
  // This is a simple implementation - in production you'd want to use PurgeCSS
  const allElements = document.querySelectorAll('*');
  const usedClasses = new Set<string>();
  
  // Collect all used classes
  allElements.forEach((element) => {
    if (element.className && typeof element.className === 'string') {
      element.className.split(' ').forEach((className) => {
        if (className.trim()) {
          usedClasses.add(className.trim());
        }
      });
    }
  });
  
  // Log unused classes for debugging (build context always production)
  // console.info('Used CSS classes:', usedClasses.size);
}

// Font loading optimization
export function optimizeFontLoading() {
  if (typeof document === 'undefined') return;
  
  // Add font-display: swap to improve FCP
  const fontFaces = `
    @font-face {
      font-family: 'Inter';
      src: url('/fonts/inter-var.woff2') format('woff2-variations');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
  `;
  
  const styleElement = document.createElement('style');
  styleElement.textContent = fontFaces;
  document.head.appendChild(styleElement);
}

// Complete CSS optimization setup
export function setupCSSOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Inject critical CSS immediately
  injectCriticalCSS();
  
  // Optimize font loading
  optimizeFontLoading();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Defer non-critical CSS after load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', deferNonCriticalCSS);
  } else {
    deferNonCriticalCSS();
  }
  
  // Remove unused CSS in production
  if (window.requestIdleCallback) {
    window.requestIdleCallback(removeUnusedCSS);
  } else {
    setTimeout(removeUnusedCSS, 1000);
  }
}