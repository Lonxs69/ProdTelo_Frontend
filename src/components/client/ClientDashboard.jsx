import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  MessageCircle, 
  User, 
  LogOut
} from 'lucide-react';

// Importar componentes COMPARTIDOS de las páginas
import FeedPage from '../shared/feed/FeedPage';
import ChatPage from '../shared/chat/ChatPage';
import ClientProfile from './ClientProfile';
import Header from '../global/Header';
import './ClientDashboard.css';

const ClientDashboard = () => {
  const [activeView, setActiveView] = useState('feed');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  // Mock función para abrir auth modal
  const handleOpenAuthModal = (type) => {
    console.log('Auth modal requested:', type);
    setShowAuthModal(true);
  };

  // Navegación principal - SIN TIENDA, 3 BOTONES PRINCIPALES CON COLOR NARANJA OSCURO
  const mainNavigation = [
    {
      id: 'chat',
      label: 'Mensajes',
      icon: MessageCircle,
      component: () => <ChatPage userType="client" />,
      description: 'Tus conversaciones',
      color: '#D2421A' // Naranja oscuro
    },
    {
      id: 'feed',
      label: 'Anuncios',
      icon: Flame,
      component: () => <FeedPage userType="client" />,
      description: 'Contenido personalizado',
      color: '#D2421A' // Naranja oscuro - EN EL CENTRO
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      component: ClientProfile,
      description: 'Configuración personal ',
      color: '#D2421A' // Naranja oscuro
    }
  ];

  // ✅ FUNCIÓN CORREGIDA - SIN FONDO NEGRO EN EL BODY
  const setupOptimizedStyles = () => {
    const style = document.createElement('style');
    style.id = 'client-dashboard-optimized-styles';
    style.textContent = `
      /* RESET Y BASE */
      * {
        box-sizing: border-box !important;
      }
      
      body, html {
        overflow-x: hidden !important;
        max-width: 100vw !important;
        margin: 0 !important;
        padding: 0 !important;
        scroll-behavior: smooth !important;
        -webkit-overflow-scrolling: touch !important;
      }
      
      /* DASHBOARD CONTAINER */
      .client-dashboard {
        width: 100vw !important;
        max-width: 100vw !important;
        overflow-x: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        scroll-behavior: smooth !important;
        -webkit-overflow-scrolling: touch !important;
        background: #000 !important;
        min-height: 100vh !important;
      }
      
      /* MAIN CONTENT */
      .dashboard-main {
        width: 100vw !important;
        max-width: 100vw !important;
        overflow-x: hidden !important;
        overflow-y: auto !important;
        padding: 0 !important;
        margin: 0 !important;
        scroll-behavior: smooth !important;
        -webkit-overflow-scrolling: touch !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
        background: #000 !important;
      }

      /* Ocultar scrollbar en webkit browsers */
      .dashboard-main::-webkit-scrollbar {
        display: none !important;
      }
      
      /* PAGE CONTAINER */
      .page-container-full {
        width: 100vw !important;
        max-width: 100vw !important;
        overflow-x: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        scroll-behavior: smooth !important;
        -webkit-overflow-scrolling: touch !important;
        background: #000 !important;
      }

     
      /* OTROS COMPONENTES */
      .chat-page, 
      .client-profile {
        width: 100vw !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
        padding: 1rem !important;
        padding-top: 80px !important;
        min-height: 100vh !important;
        background: #000 !important;
      }
      
      /* HEADER - CORREGIDO PARA EVITAR INTERFERENCIAS */
      .header {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 999 !important;
        height: 60px !important;
        background: rgba(20, 20, 20, 0.95) !important;
        backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      
      /* FORZAR RECALCULO DEL PADDING EN COMPONENTES DESPUÉS DEL HEADER */
      .feed-page,
      .chat-page,
      .client-profile {
        margin-top: 0 !important;
        transform: translateY(0) !important;
      }
    `;
    
    const existingStyle = document.getElementById('client-dashboard-optimized-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  };

  // ✅ EFECTO CORREGIDO - SIN APLICAR BACKGROUND AL BODY
  useEffect(() => {
    // Aplicar clase al body INMEDIATAMENTE
    document.body.classList.add('in-dashboard');
    document.body.style.overflowX = 'hidden';
    document.body.style.width = '100%';
    document.body.style.maxWidth = '100vw';
    document.body.style.boxSizing = 'border-box';
    document.body.style.scrollBehavior = 'smooth';
    document.body.style.webkitOverflowScrolling = 'touch';
    // NO aplicar background al body
    
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.width = '100%';
    document.documentElement.style.maxWidth = '100vw';
    document.documentElement.style.boxSizing = 'border-box';
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.webkitOverflowScrolling = 'touch';
    
    // Aplicar estilos optimizados INMEDIATAMENTE
    setupOptimizedStyles();
    
    // ✅ CONFIGURACIÓN DEL HEADER MEJORADA
    const headerTimeout = setTimeout(() => {
      const header = document.querySelector('.header');
      if (header) {
        header.classList.remove('hidden');
        header.classList.add('visible-scrolled', 'dashboard-mode');
        header.style.transform = 'translateY(0)';
        header.style.position = 'fixed';
        header.style.top = '0';
        header.style.zIndex = '999';
        // Los estilos del header ya están en el CSS, no sobrescribir aquí
        header.style.transition = 'all 0.3s ease';
      }
    }, 50);

    // FORZAR RECALCULO DE LAYOUT DESPUÉS DE UN FRAME
    const layoutTimeout = requestAnimationFrame(() => {
      const feedPage = document.querySelector('.feed-page');
      if (feedPage) {
        feedPage.style.paddingTop = '80px';
        feedPage.style.marginTop = '0';
        feedPage.style.transform = 'translateY(0)';
        feedPage.style.background = '#000';
      }
      
      // Forzar reflow para asegurar aplicación de estilos
      document.body.offsetHeight;
    });

    return () => {
      // Limpiar timeouts
      clearTimeout(headerTimeout);
      cancelAnimationFrame(layoutTimeout);
      
      document.body.classList.remove('in-dashboard');
      
      const header = document.querySelector('.header');
      if (header) {
        header.classList.remove('visible-scrolled', 'dashboard-mode');
        header.style.transform = '';
        header.style.position = '';
        header.style.top = '';
        header.style.zIndex = '';
        header.style.transition = '';
      }
      
      document.body.style.overflowX = '';
      document.body.style.width = '';
      document.body.style.maxWidth = '';
      document.body.style.scrollBehavior = '';
      document.body.style.webkitOverflowScrolling = '';
      document.documentElement.style.overflowX = '';
      document.documentElement.style.width = '';
      document.documentElement.style.maxWidth = '';
      document.documentElement.style.scrollBehavior = '';
      document.documentElement.style.webkitOverflowScrolling = '';

      const style = document.getElementById('client-dashboard-optimized-styles');
      if (style) {
        style.remove();
      }
    };
  }, []);

  // Efecto adicional para FORZAR padding correcto al cambiar de vista
  useEffect(() => {
    if (activeView === 'feed') {
      setTimeout(() => {
        const feedPage = document.querySelector('.feed-page');
        if (feedPage) {
          feedPage.style.paddingTop = '80px';
          feedPage.style.marginTop = '0';
          feedPage.style.transform = 'translateY(0)';
        }
      }, 0);
    }
  }, [activeView]);

  // ✅ MEMORIZAR COMPONENTE ACTIVO
  const ActiveComponent = React.useMemo(() => {
    const activeItem = mainNavigation.find(item => item.id === activeView);
    if (activeItem && activeItem.component) {
      const Component = activeItem.component;
      return <Component />;
    }
    return <FeedPage userType="client" />;
  }, [activeView]);

  // ✅ FUNCIÓN PARA FORZAR VISIBILIDAD DE NAVBAR
  const forceNavbarVisibility = () => {
    const navbar = document.querySelector('.enhanced-bottom-nav');
    if (navbar) {
      navbar.style.visibility = navVisible ? 'visible' : 'hidden';
      navbar.style.display = 'flex';
      navbar.style.opacity = navVisible ? '1' : '0';
      navbar.style.transform = navVisible 
        ? 'translateX(-50%) translateY(0px)' 
        : 'translateX(-50%) translateY(100px)';
      navbar.style.pointerEvents = navVisible ? 'auto' : 'none';
    }
  };

  // Effect para manejar visibilidad
  useEffect(() => {
    const handleResize = () => {
      forceNavbarVisibility();
    };
    
    const handleOrientationChange = () => {
      setTimeout(() => {
        forceNavbarVisibility();
      }, 100);
    };
    
    // Listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Forzar visibilidad inicial
    setTimeout(forceNavbarVisibility, 50);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [navVisible]);

  // Reset scroll al cambiar de vista con smooth scroll
  useEffect(() => {
    const mainContent = document.querySelector('.dashboard-main');
    if (mainContent) {
      requestAnimationFrame(() => {
        mainContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Asegurar navbar visible después del cambio de vista
    setTimeout(forceNavbarVisibility, 100);
  }, [activeView]);

  // 🆕 LISTENER PARA NAVEGACIÓN DESDE EL HEADER
  useEffect(() => {
    const handleDashboardNavigate = (event) => {
      if (event.detail && event.detail.view) {
        console.log('📡 ClientDashboard recibió comando de navegación:', event.detail.view);
        setActiveView(event.detail.view);
      }
    };

    window.addEventListener('dashboard:navigate', handleDashboardNavigate);

    return () => {
      window.removeEventListener('dashboard:navigate', handleDashboardNavigate);
    };
  }, []);

  return (
    <div 
      className="client-dashboard"
      style={{
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        background: '#000'
      }}
    >
      {/* Header Global */}
      <Header 
        onOpenAuthModal={handleOpenAuthModal}
        hideLogoInDashboard={false}
        showHamburgerInDashboard={true}
        dashboardMode={true}
        userType="client"
      />

      {/* Main Content */}
      <main 
        className="dashboard-main"
        style={{
          width: '100vw',
          maxWidth: '100vw',
          overflowX: 'hidden',
          overflowY: 'auto',
          boxSizing: 'border-box',
          flex: 1,
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          margin: 0,
          padding: 0,
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
          backfaceVisibility: 'hidden',
          perspective: 1000,
          background: '#000'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="page-container-full"
            style={{
              width: '100vw',
              maxWidth: '100vw',
              overflowX: 'hidden',
              boxSizing: 'border-box',
              minHeight: '100vh',
              margin: 0,
              padding: 0,
              background: '#000'
            }}
          >
            {ActiveComponent}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ClientDashboard;