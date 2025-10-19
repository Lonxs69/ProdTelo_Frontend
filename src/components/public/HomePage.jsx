import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import './HomePage.css';

// Import de imágenes optimizado
import heroImage1 from '../../assets/images/heroimage 2.avif';
import heroImage2 from '../../assets/images/heroimage 3.avif';
import heroImage3 from '../../assets/images/heroimage 1.avif';
import femaleServiceImage from '../../assets/images/scort female.avif';
import maleServiceImage from '../../assets/images/scort masculino.jpeg';
import transServiceImage from '../../assets/images/scort trans.avif';
import agencyServiceImage from '../../assets/images/vip service.avif';
import premiumServiceImage from '../../assets/images/masaje.jpg';
import companionServiceImg from '../../assets/images/vip service.avif';
import vipServiceImg from '../../assets/images/vip service.avif';
import massageServiceImg from '../../assets/images/masaje.jpg';

const HomePage = () => {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Hooks de navegación y autenticación
  const { navigateTo } = useApp();
  const { isAuthenticated, user } = useAuth();

  const heroImages = useMemo(() => [heroImage1, heroImage2, heroImage3], []);

  // Auto-cambio de imágenes del hero optimizado
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Función para mover el hero section hacia arriba
  useEffect(() => {
    const adjustHeroPosition = () => {
      const heroElement = document.querySelector('.hero-telofundi');
      
      if (heroElement) {
        heroElement.style.marginTop = '-80px';
      }
    };

    adjustHeroPosition();
    
    return () => {
      const heroElement = document.querySelector('.hero-telofundi');
      if (heroElement) {
        heroElement.style.marginTop = '';
      }
    };
  }, []);

  // Comprobar verificación de edad
  useEffect(() => {
    const ageVerified = localStorage?.getItem('ageVerified');
    if (!ageVerified) {
      setShowAgeModal(true);
    }
  }, []);

  // Desactivar scroll cuando modal está abierto
  useEffect(() => {
    if (showAgeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAgeModal]);

  const handleAgeAccept = useCallback(() => {
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('ageVerified', 'true');
    }
    setShowAgeModal(false);
  }, []);

  const handleAgeCancel = useCallback(() => {
    window.location.href = 'https://google.com';
  }, []);

  // FUNCIÓN CORREGIDA: Navegación inteligente al feed
  const navigateToFeed = useCallback(() => {
    console.log('Navegando al feed...');
    console.log('Usuario autenticado:', isAuthenticated);
    console.log('Datos del usuario:', user);
    
    // Si está autenticado, ir a su dashboard correspondiente
    if (isAuthenticated && user) {
      const userType = user.userType?.toLowerCase();
      console.log('Tipo de usuario:', userType);
      
      switch(userType) {
        case 'client':
          console.log('Navegando a client-dashboard');
          navigateTo('client-dashboard');
          break;
        case 'escort':
          console.log('Navegando a escort-dashboard');
          navigateTo('escort-dashboard');
          break;
        case 'agency':
          console.log('Navegando a agency-dashboard');
          navigateTo('agency-dashboard');
          break;
        case 'admin':
          console.log('Navegando a admin-dashboard');
          navigateTo('admin-dashboard');
          break;
        default:
          console.log('Tipo de usuario no reconocido, navegando a feed sin dashboard');
          navigateTo(ROUTES.FEED);
      }
    } else {
      // No autenticado = feed sin dashboard
      console.log('Usuario no autenticado, navegando a feed sin dashboard');
      navigateTo(ROUTES.FEED);
    }
  }, [navigateTo, isAuthenticated, user]);

  // FUNCIÓN CORREGIDA: Abrir modal de registro con tipo específico
  const openRegisterModal = useCallback((userType = 'CLIENT') => {
    console.log(`Navegando a registro como: ${userType}`);
    sessionStorage.setItem('registerUserType', userType);
    navigateTo(ROUTES.AUTH);
  }, [navigateTo]);

  const openFiltersModal = useCallback(() => {
    setShowFiltersModal(true);
  }, []);

  const closeFiltersModal = useCallback(() => {
    setShowFiltersModal(false);
  }, []);

  // Servicios principales memoizados
  const mainServices = useMemo(() => [
    {
      id: 'escorts-femeninas',
      title: 'Escorts Femeninas',
      subtitle: 'Elegancia y sofisticación',
      description: 'Encuentra las publicaciones de las acompañantes más elegantes y sofisticadas de múltiples nacionalidades.',
      image: femaleServiceImage,
      features: ['Verificación Premium', 'Disponibilidad 24/7', 'Encuentros Privados', 'Servicio Personalizado'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      id: 'escorts-masculinos',
      title: 'Escorts Masculinos',
      subtitle: 'Caballeros de clase mundial',
      description: 'Encuentra las publicaciones de los acompañantes masculinos profesionales, discretos y elegantes.',
      image: maleServiceImage,
      features: ['Profesionales', 'Discreción Total', 'Disponibilidad Global', 'Experiencia Premium'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      )
    },
    {
      id: 'escorts-trans',
      title: 'Escorts Trans',
      subtitle: 'Diversidad y autenticidad',
      description: 'Encuentra las publicaciones de los acompañantes transgénero auténticas y elegantes.',
      image: transServiceImage,
      features: ['Perfiles Auténticos', 'Experiencia Única', 'Ambiente Seguro', 'Respeto Total'],
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="m22 2-5 10-5-5 10-5z"/>
        </svg>
      )
    }
  ], []);

  // Servicios especializados memoizados - NUEVAS CATEGORÍAS
  const additionalServices = useMemo(() => [
    {
      id: 'masajes-terapeuticos',
      title: 'Masajes',
      description: 'Masajes sensuales y relajantes que despiertan todos tus sentidos con toque íntimo y personal.',
      image: massageServiceImg,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2a3 3 0 0 0-3 3c0 1.642 1.358 3 3 3s3-1.358 3-3a3 3 0 0 0-3-3z"/>
          <path d="M14 6v7a3 3 0 0 1-3 3 3 3 0 0 1-3-3V6"/>
          <path d="M14 15.5c0 1.381-1.119 2.5-2.5 2.5S9 16.881 9 15.5"/>
        </svg>
      )
    },
    {
      id: 'servicios-vip',
      title: 'Servicios VIP',
      description: 'Experiencias exclusivas de lujo e intimidad personalizada para momentos únicos e irrepetibles.',
      image: vipServiceImg,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      )
    },
    {
      id: 'servicios-compania',
      title: 'Servicios de Compañía',
      description: 'Compañía íntima y personal para momentos especiales donde la conexión y la química son protagonistas.',
      image: companionServiceImg,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      )
    },
    {
      id: 'eventos-sociales',
      title: 'Eventos Sociales',
      description: 'Acompañamiento profesional para cenas, galas, eventos corporativos y ocasiones especiales.',
      image: agencyServiceImage,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      id: 'terapias-holisticas',
      title: 'Terapias Holísticas',
      description: 'Sesiones de bienestar integral que combinan relajación, sanación y conexión espiritual.',
      image: premiumServiceImage,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      )
    },
    {
      id: 'experiencias-premium',
      title: 'Experiencias Premium',
      description: 'Encuentros de alto nivel diseñados para clientes exigentes que buscan momentos exclusivos.',
      image: femaleServiceImage,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )
    },
    {
      id: 'servicios-domicilio',
      title: 'Servicios a Domicilio',
      description: 'Atención personalizada en la comodidad de tu hogar u hotel con total discreción y profesionalismo.',
      image: maleServiceImage,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
      )
    },
    {
      id: 'coaching-intimidad',
      title: 'Coaching de Intimidad',
      description: 'Asesoramiento profesional para mejorar la confianza personal y habilidades sociales.',
      image: transServiceImage,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          <path d="M12 7v5l3 3"/>
        </svg>
      )
    }
  ], []);

  // Tipos de usuarios memoizados
  const userTypes = useMemo(() => [
    {
      name: 'Cliente',
      userType: 'CLIENT',
      description: 'Explora anuncios de manera anónima y segura.',
      features: [
        'Acceso al feed de publicaciones',
        'Chat anónimo',
        'Sistema de favoritos',
        'TeloPoints y recompensas',
        'Búsqueda avanzada',
        'Notificaciones push'
      ],
      cta: 'Crear Cuenta Cliente',
      popular: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
    {
      name: 'Acompañante / Escort',
      userType: 'ESCORT',
      description: 'Verifica tu perfil y conecta con clientes.',
      features: [
        'Perfil profesional verificado',
        'Administración de anuncios',
        'Métricas de rendimiento',
        'Chat prioritario premium',
        'Afiliación con agencias',
        'Recibe regalos'
      ],
      cta: 'Crear Perfil Escort',
      popular: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      )
    },
    {
      name: 'Agencia',
      userType: 'AGENCY',
      description: 'Gestiona tu red de acompañantes.',
      features: [
        'Gestión de escorts asociados',
        'Verificación de perfiles',
        'Gestión de contenido',
        'Panel de administración',
        'Administración de anuncios',
        'Métricas avanzadas'
      ],
      cta: 'Registrar Agencia',
      popular: false,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    }
  ], []);

  return (
    <>
      {/* Modal de verificación de edad */}
      <AnimatePresence>
        {showAgeModal && (
          <motion.div 
            className="age-modal-overlay-telofundi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="age-modal-telofundi"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              style={{
                border: '2px solid #ff6b35',
                borderRadius: '16px'
              }}
            >
              <div className="age-modal-content-telofundi">
                <motion.div 
                  className="age-modal-logo-telofundi"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  <div className="logo-icon-telofundi">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <span>TeloFundi</span>
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Verificación de Edad Requerida
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  TeloFundi es una plataforma exclusiva para adultos mayores de 18 años. Ofrecemos servicios de acompañamiento premium con total discreción y profesionalismo.
                </motion.p>
                
                <motion.p 
                  className="age-modal-disclaimer"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Al continuar, confirmas que eres mayor de edad y aceptas nuestros términos de servicio. Tu privacidad y seguridad son nuestra máxima prioridad.
                </motion.p>
                
                <motion.div 
                  className="age-modal-actions-telofundi"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.button 
                    className="age-accept-telofundi" 
                    onClick={handleAgeAccept}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Soy mayor de 18 años</span>
                    <motion.svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </motion.svg>
                  </motion.button>
                  
                  <motion.button 
                    className="age-cancel-telofundi" 
                    onClick={handleAgeCancel}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Salir del sitio
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section optimizado - SIN CAMBIOS */}
      <motion.section 
        className="hero-telofundi"
        style={{ 
          position: 'relative',
          top: 0,
          marginTop: 0,
          paddingTop: 0,
          zIndex: 1,
          minHeight: '100vh'
        }}
      >
        <div className="hero-background-container-telofundi" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1
        }}>
          <AnimatePresence mode="wait">
            {heroImages.map((image, index) => (
              currentHeroImage === index && (
                <motion.div
                  key={index}
                  className="hero-slide-telofundi active"
                  style={{ backgroundImage: `url(${image})` }}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.5 }}
                />
              )
            ))}
          </AnimatePresence>
        </div>
        
        <div className="hero-overlay-telofundi-light" />

        <motion.div 
          className="hero-content-telofundi"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1 
            className="hero-title-telofundi"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ 
              fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
              lineHeight: '1.1'
            }}
          >
           CONEXIONES<span className="hero-gradient-word-telofundi"> AUTÉNTICAS</span> PARA EXPERIENCIAS REALES
          </motion.h1>

          <motion.p 
            className="hero-description-telofundi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ fontSize: '18px' }}
          >
            Plataforma de anuncios de servicios de acompañantes (escort, masajes eróticos, encuentros íntimos, etc.).
          </motion.p>

          <motion.div 
            className="hero-actions-telofundi"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.button 
              className="cta-primary-telofundi" 
              onClick={navigateToFeed}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
            >
              <span>Ver Publicaciones</span>
              <svg 
                viewBox="0 0 384 512" 
                fill="currentColor"
              >
                <path d="M384 319.1C384 425.9 297.9 512 192 512s-192-86.13-192-192c0-58.67 27.82-106.8 54.57-134.1C69.54 169.3 96 179.8 96 201.5v85.5c0 35.17 27.97 64.5 63.16 64.94C194.9 352.5 224 323.6 224 288c0-88-175.1-96.12-52.15-277.2c13.5-19.72 44.15-10.77 44.15 13.03C215.1 127 384 149.7 384 319.1z"/>
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Servicios Principales - FONDO NEGRO */}
      <section className="main-services-telofundi" style={{ background: '#000000' }}>
        <div className="container-telofundi">
          <div className="section-header-telofundi">
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ff6b35', fontSize: '14px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Servicios Premium</span>
            </div>
            <h2>Acompañantes verificados, anonimato garantizado.</h2>
            <p style={{ fontSize: '18px' }}>
            Ayudamos a conectar a los anunciantes con sus clientes de manera sencilla y segura. Encuentra acompañantes verificados y disfruta de mayor tranquilidad.
            </p>
          </div>

          <div className="services-grid-telofundi mobile-vertical-grid">
            {mainServices.map((service, index) => (
              <div 
                key={service.id} 
                className="main-service-card-telofundi"
                style={{ 
                  '--delay': `${index * 100}ms`,
                  width: '100%',
                  maxWidth: 'none',
                  border: '2px solid #ff6b35',
                  borderRadius: '16px'
                }}
              >
                <div className="service-content-telofundi">
                  <div className="service-header-telofundi">
                    <div className="service-icon-telofundi">
                      {service.icon}
                    </div>
                    <div 
                      className="service-badge-telofundi"
                      style={{
                        borderRadius: '12px',
                        padding: '4px 12px'
                      }}
                    >
                      {service.badge}
                    </div>
                  </div>
                  
                  <div className="service-text-telofundi">
                    <h3>{service.title}</h3>
                    <span className="service-subtitle-telofundi">{service.subtitle}</span>
                    <p style={{ fontSize: '16px' }}>{service.description}</p>
                  </div>

                  <div className="service-metrics-telofundi">
                    <div className="metric-telofundi">
                      <div className="metric-value-telofundi">24/7</div>
                      <div className="metric-label-telofundi">Disponible</div>
                    </div>
                    <div className="metric-telofundi">
                      <div className="metric-value-telofundi">100%</div>
                      <div className="metric-label-telofundi">Verificado</div>
                    </div>
                  </div>

                  <div className="service-features-telofundi">
                    {service.features.map((feature, idx) => (
                      <span key={idx} className="feature-tag-telofundi" style={{ fontSize: '14px' }}>
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button 
                    className="service-cta-telofundi"
                    onClick={navigateToFeed}
                    style={{
                      padding: '16px 32px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      minHeight: '56px',
                      fontWeight: '600'
                    }}
                  >
                    <span>Ver publicaciones</span>
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>

                <div className="service-visual-telofundi">
                  <img src={service.image} alt={service.title} />
                  <div className="service-overlay-telofundi"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .services-grid-telofundi {
              display: flex !important;
              flex-direction: column !important;
              gap: 1.5rem !important;
              overflow: visible !important;
              overflow-x: hidden !important;
              width: 100% !important;
            }
            
            .main-service-card-telofundi {
              width: 100% !important;
              min-width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              flex-shrink: 0 !important;
              box-sizing: border-box !important;
            }

            .main-services-telofundi {
              overflow-x: hidden !important;
            }

            .container-telofundi {
              overflow-x: hidden !important;
              width: 100% !important;
              max-width: 100% !important;
            }

            .service-cta-telofundi {
              padding: 14px 28px !important;
              fontSize: 15px !important;
              minHeight: 52px !important;
            }
          }
        `}</style>
      </section>

      {/* Servicios Especializados - FONDO NEGRO */}
      <section className="all-services-telofundi" style={{ background: '#000000' }}>
        <div className="container-telofundi">
          <div className="section-header-telofundi">
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ff6b35', fontSize: '14px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Categorías</span>
            </div>
            <h2>Elige tus preferencias.</h2>
            <p style={{ fontSize: '18px' }}>Una amplia gama de servicios especializados para satisfacer todas tus necesidades de acompañamiento.</p>
          </div>

          <div className="additional-services-grid-telofundi">
            {additionalServices.map((service, index) => (
              <div 
                key={service.id}
                className="additional-service-card-telofundi"
                style={{ 
                  '--delay': `${index * 80}ms`,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px'
                }}
              >
                <div className="service-card-image">
                  <img src={service.image} alt={service.title} />
                </div>
                
                <div className="service-card-content">
                  <div className="additional-service-icon-telofundi">
                    {service.icon}
                  </div>
                  
                  <h3>{service.title}</h3>
                  
                  <p style={{ fontSize: '16px' }}>{service.description}</p>
                  
                  <button 
                    className="additional-service-btn-telofundi"
                    onClick={navigateToFeed}
                    style={{
                      padding: '14px 28px',
                      fontSize: '15px',
                      borderRadius: '8px',
                      minHeight: '52px',
                      width: '100%',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                  >
                    <span>Conocer más</span>
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7v10"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tipos de Usuario - FONDO NEGRO */}
      <section className="user-types-section-telofundi" style={{ background: '#000000' }}>
        <div className="container-telofundi">
          <div className="section-header-telofundi">
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: '#ff6b35', fontSize: '14px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Únete a TeloFundi</span>
            </div>
            <h2>Elige tu experiencia</h2>
            <p>Crea tu cuenta según tu tipo de usuario y disfruta de todas las funcionalidades diseñadas para ti.</p>
          </div>

          <div className="user-types-grid-telofundi">
            {userTypes.map((userType, index) => (
              <div 
                key={userType.name}
                className={`user-type-card-telofundi ${userType.popular ? 'popular' : ''}`}
                style={{ 
                  '--delay': `${index * 100}ms`,
                  border: userType.popular ? '2px solid #ff6b35' : '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px'
                }}
              >
                {userType.popular && (
                  <div className="popular-badge">
                    Más Popular
                  </div>
                )}
                
                <div className="user-type-icon-telofundi">
                  {userType.icon}
                </div>
                
                <h3>{userType.name}</h3>
                
                <p>{userType.description}</p>
                
                <ul className="user-type-features">
                  {userType.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`user-type-cta ${userType.popular ? 'primary' : ''}`}
                  onClick={() => openRegisterModal(userType.userType)}
                  style={{
                    padding: '16px 32px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    minHeight: '56px',
                    width: '100%',
                    fontWeight: '600'
                  }}
                >
                  <span>{userType.cta}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .user-type-cta {
              padding: 14px 28px !important;
              fontSize: 15px !important;
              minHeight: 52px !important;
            }
          }
        `}</style>
      </section>

      {/* Sección Publicar Anuncio - FONDO NEGRO */}
      <section className="publish-ad-telofundi" style={{ background: '#000000' }}>
        <div className="container-telofundi">
          <div className="publish-ad-content-telofundi">
            <div className="publish-ad-visual-telofundi">
              <div 
                className="ad-preview-telofundi"
                style={{
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px'
                }}
              >
                <div className="ad-preview-header-telofundi">
                  <div className="ad-preview-profile-telofundi">
                    <div className="profile-avatar-telofundi" />
                    <div>
                      <div className="profile-name-telofundi">Sofia Premium</div>
                      <div className="profile-verified-telofundi">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="M9 12l2 2 4-4"/>
                        </svg>
                        <span>Verificada</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ad-preview-image-telofundi" />
                
                <div className="ad-preview-actions-telofundi">
                  <div className="action-item-telofundi">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
                    </svg>
                  </div>
                  <div className="action-item-telofundi">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
                    </svg>
                  </div>
                  <div className="action-item-telofundi">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="publish-ad-text-telofundi" style={{ padding: '0 20px' }}>
              <h2>¿Eres escort profesional?</h2>
              
              <p>
                Únete a la plataforma líder en servicios de acompañamiento premium. Crea tu perfil, publica tus servicios y conecta con clientes de élite en un ambiente seguro y discreto.
              </p>
              
              <div className="publish-benefits-telofundi">
                {[
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    ),
                    text: "Verificación premium y badge de confianza"
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                    ),
                    text: "Gestión completa de publicaciones con galería"
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M18 20V10M12 20V4M6 20v-6"/>
                      </svg>
                    ),
                    text: "Métricas detalladas y estadísticas de perfil"
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ),
                    text: "Acceso a agencias premium y verificación"
                  }
                ].map((benefit, index) => (
                  <div key={index} className="benefit-item-telofundi">
                    <div>{benefit.icon}</div>
                    <span>{benefit.text}</span>
                  </div>
                ))}
              </div>
              
              <div className="publish-actions-telofundi">
                <button 
                  className="publish-primary-btn-telofundi"
                  onClick={() => openRegisterModal('ESCORT')}
                  style={{
                    padding: '16px 32px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    minHeight: '56px',
                    fontWeight: '600'
                  }}
                >
                  <span>Crear mi perfil</span>
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
                
                <div className="publish-guarantee-telofundi">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.5"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>100% seguro • Máxima discreción garantizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 768px) {
            .publish-primary-btn-telofundi {
              padding: 14px 28px !important;
              fontSize: 15px !important;
              minHeight: 52px !important;
            }
            
            .publish-ad-text-telofundi {
              padding: 0 24px !important;
              text-align: center !important;
            }
            
            .publish-ad-text-telofundi h2 {
              text-align: center !important;
              margin-bottom: 20px !important;
            }
            
            .publish-ad-text-telofundi p {
              text-align: center !important;
              max-width: 100% !important;
              margin: 0 auto 24px !important;
            }
            
            .publish-benefits-telofundi {
              padding: 0 !important;
              margin: 24px 0 !important;
            }
            
            .benefit-item-telofundi {
              justify-content: flex-start !important;
              padding-left: 0 !important;
              text-align: left !important;
            }
            
            .publish-actions-telofundi {
              text-align: center !important;
              padding: 0 !important;
            }
            
            .publish-guarantee-telofundi {
              justify-content: center !important;
              text-align: center !important;
              margin-top: 16px !important;
            }
          }
        `}</style>
      </section>

      {/* Modal de filtros */}
      <AnimatePresence>
        {showFiltersModal && (
          <motion.div 
            className="modal-overlay-telofundi" 
            onClick={closeFiltersModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '0px',
              left: '0',
              width: '100%',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(24px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: '100001'
            }}
          >
            <motion.div 
              className="filters-modal-telofundi" 
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.2 }}
              style={{
                border: '2px solid #ff6b35',
                borderRadius: '16px'
              }}
            >
              <div className="modal-header-telofundi">
                <h3>Encuentra tu acompañante ideal</h3>
                <button 
                  className="close-modal-telofundi" 
                  onClick={closeFiltersModal}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="filters-content-telofundi">
                <div className="filter-section-telofundi">
                  <h4>Tipo de acompañante</h4>
                  <div className="filter-options-telofundi">
                    {['Escorts Femeninas', 'Escorts Masculinos', 'Escorts Trans'].map((option, index) => (
                      <button 
                        key={option}
                        className={`filter-option-telofundi ${index === 0 ? 'active' : ''}`}
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px'
                        }}
                      >
                        <span>{option}</span>
                        <div className="option-check-telofundi">
                          ✓
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section-telofundi">
                  <h4>Ubicación</h4>
                  <div className="filter-select-telofundi">
                    <select style={{
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px'
                    }}>
                      <option value="">Toda República Dominicana</option>
                      <option value="santo-domingo">Santo Domingo</option>
                      <option value="santiago">Santiago</option>
                      <option value="punta-cana">Punta Cana</option>
                      <option value="puerto-plata">Puerto Plata</option>
                      <option value="san-pedro">San Pedro de Macorís</option>
                    </select>
                  </div>
                </div>

                <div className="filter-section-telofundi">
                  <h4>Rango de edad</h4>
                  <div className="age-slider-telofundi">
                    <div className="slider-track-telofundi"></div>
                    <div className="slider-range-telofundi" />
                    <div className="slider-thumb-telofundi left" />
                    <div className="slider-thumb-telofundi right" />
                  </div>
                  <div className="age-display-telofundi">
                    18 - 45 años
                  </div>
                </div>

                <div className="filter-section-telofundi">
                  <h4>Servicios especiales</h4>
                  <div className="filter-tags-telofundi">
                    {['Solo verificadas', 'Agencias VIP', 'Disponible ahora', 'Masajes', 'Eventos', 'Multiidioma'].map((tag, index) => (
                      <div 
                        key={tag}
                        className="filter-tag-telofundi"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px'
                        }}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className="apply-filters-telofundi" 
                  onClick={() => {
                    closeFiltersModal();
                    navigateToFeed();
                  }}
                  style={{
                    padding: '16px 32px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    minHeight: '56px',
                    fontWeight: '600',
                    width: '100%'
                  }}
                >
                  <span>Explorar perfiles</span>
                  <svg 
                    viewBox="0 0 384 512" 
                    fill="currentColor"
                  >
                    <path d="M384 319.1C384 425.9 297.9 512 192 512s-192-86.13-192-192c0-58.67 27.82-106.8 54.57-134.1C69.54 169.3 96 179.8 96 201.5v85.5c0 35.17 27.97 64.5 63.16 64.94C194.9 352.5 224 323.6 224 288c0-88-175.1-96.12-52.15-277.2c13.5-19.72 44.15-10.77 44.15 13.03C215.1 127 384 149.7 384 319.1z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePage;