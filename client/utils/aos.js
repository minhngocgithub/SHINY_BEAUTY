import AOS from 'aos'
import '../src/assets/scss/aos.css'

// Custom AOS configuration cho ecommerce
export const initializeAOS = () => {
  AOS.init({
    // Animation settings
    duration: 1000,           
    delay: 0,                
    once: true,              
    mirror: false,           
    
    // Offset và easing
    offset: 120,            
    easing: 'ease-out-cubic', // Smooth easing
    
    // Performance optimization
    disable: function() {
      // Disable AOS on mobile devices with low performance
      const maxWidth = 768
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
      
      return window.innerWidth < maxWidth || reducedMotion.matches
    },
    
    // Throttle
    debounceDelay: 50,
    throttleDelay: 99,
    
    // Advanced settings for SEO
    startEvent: 'DOMContentLoaded',
    initClassName: 'aos-init',
    animatedClassName: 'aos-animate',
    useClassNames: false,
    disableMutationObserver: false
  })
}

// Performance monitoring
export const AOSPerformance = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  
  // Check device performance
  isLowEndDevice: () => {
    if (typeof window === 'undefined') return false
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    const memory = navigator.deviceMemory
    
    if (memory && memory < 4) return true
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) return true
    
    return false
  }
}

// Predefined animation sets for consistency
export const AOSAnimations = {
  // Hero section animations
  hero: {
    title: {
      'data-aos': 'fade-up',
      'data-aos-duration': '1000',
      'data-aos-delay': '200'
    },
    subtitle: {
      'data-aos': 'fade-up', 
      'data-aos-duration': '800',
      'data-aos-delay': '400'
    },
    cta: {
      'data-aos': 'zoom-in',
      'data-aos-duration': '600',
      'data-aos-delay': '600'
    }
  },
  
  // Product showcase animations
  product: {
    container: {
      'data-aos': 'fade-up',
      'data-aos-duration': '1000',
      'data-aos-once': 'true'
    },
    image: {
      'data-aos': 'fade-right',
      'data-aos-duration': '1000',
      'data-aos-delay': '300'
    },
    content: {
      'data-aos': 'fade-left', 
      'data-aos-duration': '1000',
      'data-aos-delay': '400'
    },
    badge: {
      'data-aos': 'fade-down',
      'data-aos-duration': '600',
      'data-aos-delay': '800'
    }
  },
  
  // Grid animations (for product lists)
  grid: {
    item: (index) => ({
      'data-aos': 'fade-up',
      'data-aos-duration': '600',
      'data-aos-delay': String(index * 100)
    })
  },
  
  // Form animations
  form: {
    field: (index) => ({
      'data-aos': 'fade-right',
      'data-aos-duration': '500',
      'data-aos-delay': String(index * 150)
    })
  }
}

// SEO-optimized refresh function
export const refreshAOS = () => {
  if (typeof window !== 'undefined' && window.AOS) {
    // Use requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
      window.AOS.refresh()
    })
  }
}

// Custom hook for Vue components
export const useAOS = () => {
  const refresh = () => refreshAOS()
  
  const applyAnimation = (element, animation) => {
    if (!element || !animation) return
    
    Object.keys(animation).forEach(attr => {
      element.setAttribute(attr, animation[attr])
    })
  }
  
  return {
    refresh,
    applyAnimation,
    animations: AOSAnimations
  }
}

// Export default object
export default {
  initializeAOS,
  AOSPerformance,
  AOSAnimations,
  refreshAOS,
  useAOS
}