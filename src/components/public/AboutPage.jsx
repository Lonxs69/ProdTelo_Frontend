import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './AboutPage.css';

const AboutPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [containerWidth, setContainerWidth] = useState('100%');
  const { scrollY } = useScroll();

  // Function to calculate optimal container width and fix spacing
  const calculateOptimalLayout = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get all containers and adjust their width
    const containers = document.querySelectorAll('.container');
    const missionContent = document.querySelector('.mission-content');
    const valuesGrid = document.querySelector('.values-grid');
    const timeline = document.querySelector('.timeline');
    const heroContent = document.querySelector('.hero-content');
    
    // Calculate optimal widths based on viewport
    let optimalContainerWidth;
    let optimalPadding;
    
    if (viewportWidth <= 480) {
      // Mobile small
      optimalContainerWidth = '100%';
      optimalPadding = '0.75rem';
    } else if (viewportWidth <= 768) {
      // Mobile large
      optimalContainerWidth = '100%';
      optimalPadding = '1rem';
    } else if (viewportWidth <= 1024) {
      // Tablet
      optimalContainerWidth = '95%';
      optimalPadding = '1.5rem';
    } else if (viewportWidth <= 1440) {
      // Desktop
      optimalContainerWidth = '90%';
      optimalPadding = '2rem';
    } else {
      // Large desktop
      optimalContainerWidth = '85%';
      optimalPadding = '2.5rem';
    }
    
    // Apply calculated styles
    containers.forEach(container => {
      container.style.width = optimalContainerWidth;
      container.style.maxWidth = 'none';
      container.style.padding = `0 ${optimalPadding}`;
      container.style.margin = '0 auto';
    });
    
    // Fix hero content centering for desktop
    if (heroContent) {
      if (viewportWidth > 768) {
        heroContent.style.position = 'relative';
        heroContent.style.zIndex = '2';
        heroContent.style.textAlign = 'center';
        heroContent.style.maxWidth = '800px';
        heroContent.style.margin = '0 auto';
        heroContent.style.display = 'flex';
        heroContent.style.flexDirection = 'column';
        heroContent.style.alignItems = 'center';
        heroContent.style.justifyContent = 'center';
        heroContent.style.width = '100%';
        heroContent.style.padding = '0 2rem';
      } else {
        heroContent.style.padding = '0 1rem';
        heroContent.style.maxWidth = '100%';
      }
    }
    
    // Fix mission content grid
    if (missionContent && viewportWidth > 768) {
      missionContent.style.display = 'grid';
      missionContent.style.gridTemplateColumns = '1fr 1fr';
      missionContent.style.gap = viewportWidth > 1024 ? '4rem' : '2rem';
      missionContent.style.width = '100%';
      missionContent.style.alignItems = 'center';
    } else if (missionContent) {
      missionContent.style.display = 'flex';
      missionContent.style.flexDirection = 'column';
      missionContent.style.gap = '2rem';
      missionContent.style.textAlign = 'center';
    }
    
    // Fix values grid
    if (valuesGrid) {
      if (viewportWidth <= 768) {
        valuesGrid.style.gridTemplateColumns = '1fr';
      } else if (viewportWidth <= 1024) {
        valuesGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      } else {
        valuesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
      }
      valuesGrid.style.width = '100%';
      valuesGrid.style.gap = viewportWidth <= 768 ? '1.5rem' : '2rem';
    }
    
    // Fix timeline
    if (timeline) {
      timeline.style.width = '100%';
      timeline.style.maxWidth = viewportWidth > 1024 ? '1000px' : '100%';
    }
    
    // Fix mission visual
    const missionVisual = document.querySelector('.mission-visual');
    if (missionVisual) {
      if (viewportWidth <= 768) {
        missionVisual.style.width = '100%';
        missionVisual.style.height = '250px';
        missionVisual.style.margin = '0';
      } else {
        missionVisual.style.width = '100%';
        missionVisual.style.height = '400px';
      }
    }
    
    console.log(`Layout optimized for viewport: ${viewportWidth}x${viewportHeight}`);
  };

  // Detect mobile and calculate layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      calculateOptimalLayout();
    };
    
    checkMobile();
    
    // Debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        checkMobile();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkMobile, 200);
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkMobile);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Re-run layout calculation when component mounts and after DOM updates
  useEffect(() => {
    const timer = setTimeout(calculateOptimalLayout, 100);
    return () => clearTimeout(timer);
  }, []);

  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const values = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
      title: "Seguridad y Privacidad",
      description: "Protegemos tu información con los más altos estándares de seguridad y privacidad."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      title: "Comunidad Inclusiva", 
      description: "Creamos un espacio donde todas las personas se sientan bienvenidas y respetadas."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ),
      title: "Excelencia en Servicio",
      description: "Ofrecemos la mejor experiencia posible con servicios de calidad premium."
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      ),
      title: "Transparencia Total",
      description: "Operamos con total transparencia en todos nuestros procesos y políticas."
    }
  ];

  const timeline = [
    {
      region: "América Latina",
      title: "Mercado Principal",
      description: "Nuestro punto de partida, donde establecemos los más altos estándares de calidad."
    },
    {
      region: "Caribe", 
      title: "Expansión Regional",
      description: "Expandiremos nuestros servicios premium a las principales islas del Caribe."
    },
    {
      region: "Norteamérica",
      title: "Visión Continental", 
      description: "Convertirnos en la plataforma de referencia en América del Norte."
    },
    {
      region: "Global",
      title: "Alcance Mundial",
      description: "Conectar experiencias auténticas en los principales mercados mundiales."
    }
  ];

  return (
    <div className="about-page">
      {/* Progress Bar */}
      <motion.div
        className="progress-bar"
        style={{
          scaleX: useTransform(scrollY, [0, document.body.scrollHeight - window.innerHeight], [0, 1])
        }}
      />

      {/* Hero Section */}
      <motion.section 
        className="hero"
        style={{ y: isMobile ? 0 : heroY, opacity: isMobile ? 1 : heroOpacity }}
      >
        <div className="hero-background">
          <div className="hero-shapes">
            <motion.div 
              className="shape shape-1"
              animate={{ 
                y: [-20, 20, -20],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
            <motion.div 
              className="shape shape-2"
              animate={{ 
                y: [20, -20, 20],
                rotate: [360, 180, 0]
              }}
              transition={{ 
                duration: 25, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </div>
        </div>
        
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="badge-dot" />
              <span>Conectando experiencias auténticas</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.div>
            
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Conoce más sobre{' '}
              <span className="gradient-text">TeloFundi</span>
            </motion.h1>
            
            <motion.p 
              className="hero-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Somos la plataforma líder para conectar personas, construida sobre los pilares 
              de seguridad, discreción y calidad excepcional.
            </motion.p>
          </motion.div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <section className="mission">
        <div className="container">
          <motion.div 
            className="mission-content"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="mission-text">
              <motion.div 
                className="section-badge"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Nuestra Misión
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Conectar personas
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                En TeloFundi, creemos que las personas merecen acceder a un medio para publicar 
                sus servicios en un entorno seguro y discreto. Nuestra misión es conectar a 
                personas que buscan experiencias auténticas.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              >
                Trabajamos incansablemente para eliminar los estigmas y crear una plataforma 
                donde la elegancia, el respeto y la profesionalidad sean los estándares.
              </motion.p>
            </div>
            
            <motion.div 
              className="mission-visual"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="mission-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values">
        <div className="container">
          <motion.div 
            className="values-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="section-badge">Nuestros Valores</div>
            <h2>Los principios que nos guían</h2>
            <p>
              Cada decisión que tomamos está fundamentada en valores sólidos que garantizan 
              una experiencia excepcional para todos los miembros de nuestra comunidad.
            </p>
          </motion.div>

          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="value-icon">
                  {value.icon}
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="container">
          <motion.div 
            className="timeline-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <div className="section-badge">Nuestra Presencia</div>
            <h2>Conectando a nivel global</h2>
            <p>
              TeloFundi está diseñado para expandirse y conectar personas de calidad en todo el mundo, 
              estableciendo los más altos estándares de servicio.
            </p>
          </motion.div>

          <div className="timeline">
            {!isMobile && <div className="timeline-line" />}
            
            {timeline.map((item, index) => (
              <motion.div 
                key={index}
                className={`timeline-item ${index % 2 === 1 ? 'timeline-item-right' : ''}`}
                initial={{ opacity: 0, x: isMobile ? 0 : (index % 2 === 0 ? -100 : 100) }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className="timeline-content">
                  <div className="timeline-region">{item.region}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                {!isMobile && (
                  <div className="timeline-dot">
                    <div className="timeline-dot-inner" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          className="scroll-top"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M7 14l5-5 5 5"/>
          </svg>
        </motion.button>
      )}
    </div>
  );
};

export default AboutPage;