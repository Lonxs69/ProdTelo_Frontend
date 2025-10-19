import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  MessageCircle, 
  Building2,
  Users,
  UserCheck,
  Crown,
  Bell,
  BarChart3,
  MoreHorizontal
} from 'lucide-react';

// Importar componentes COMPARTIDOS y específicos del admin
import FeedPage from '../shared/feed/FeedPage';
import ChatPage from '../shared/chat/ChatPage';
import AdminModerationPage from './AdminModerationPage';
import AdminAnalytics from './AdminAnalytics';
import AdminProfile from './AdminProfile';
import AdminAgencyApproval from './AdminAgencyApproval';
import Header from '../global/Header';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeView, setActiveView] = useState('feed');
  const [showAuthModal, setShowAuthModal] = useState(false);


  // Función para abrir auth modal
  const handleOpenAuthModal = (type) => {
    console.log('Auth modal requested:', type);
    setShowAuthModal(true);
  };

  // Navegación principal sin favoritos, igual estructura que EscortDashboard
  const mainNavigation = [
    {
      id: 'feed',
      label: 'Para Ti',
      icon: Flame,
      component: () => <FeedPage userType="admin" />,
      description: 'Feed de publicaciones',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'chat',
      label: 'Mensajes',
      icon: MessageCircle,
      component: () => <ChatPage userType="admin" />,
      description: 'Chat administrativo con usuarios',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 'agencies',
      label: 'Solicitudes',
      icon: Building2,
      component: AdminAgencyApproval,
      description: 'Solicitudes De Agencias',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'moderation',
      label: 'Moderación',
      icon: Users,
      component: AdminModerationPage,
      description: 'Gestión y moderación',
      gradient: 'from-red-500 to-red-700'
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      icon: BarChart3,
      component: AdminAnalytics,
      description: 'Estadísticas del sistema',
      gradient: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: UserCheck,
      component: AdminProfile,
      description: 'Configuración de admin',
      gradient: 'from-gray-500 to-gray-700'
    }
  ];

  // ✅ FUNCIÓN EXACTA DE ESCORTDASHBOARD - CON CONFIGURACIÓN COMPLETA DE FEED
  const setupOptimizedStyles = () => {
    const style = document.createElement('style');
    style.id = 'admin-dashboard-optimized-styles';
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
      .admin-dashboard {
        width: 100vw !important;
        max-width: 100vw !important;
        overflow-x: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        scroll-behavior: smooth !important;
        -webkit-overflow-scrolling: touch !important;
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
      }
      
      /* FEED PAGE ESPECÍFICO - COPIADO EXACTO DE ESCORTDASHBOARD */
      .feed-page {
        width: 100vw !important;
        max-width: 100vw !important;
        min-height: 100vh !important;
        overflow-x: hidden !important;
        margin: 0 !important;
        padding: 0 !important;
        padding-top: 80px !important;
        box-sizing: border-box !important;
      }
      
      /* ASEGURAR QUE EL PADDING-TOP SE APLIQUE EN TODAS LAS CARGAS */
      body.in-dashboard .feed-page {
        padding-top: 80px !important;
      }
      
      /* FEED CONTENT */
      .feed-content {
        width: 100vw !important;
        max-width: 100vw !important;
        margin: 0 !important;
        padding: 1rem !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
      }
      
      /* CONTENEDOR PRINCIPAL CENTRADO */
      .feed-overview-container {
        width: 100% !important;
        max-width: 1200px !important;
        margin: 0 auto !important;
        padding: 0 1rem !important;
        box-sizing: border-box !important;
      }
      
      /* POSTS CONTAINER */
      .feed-main-content {
        max-width: 600px !important;
        margin: 0 auto !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      .feed-posts-container {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 2rem !important;
        width: 100% !important;
        margin-bottom: 100px !important;
      }
      
      /* SIDEBAR - SOLO DESKTOP */
      .feed-sidebar-container {
        display: none !important;
      }
      
      @media (min-width: 1024px) {
        .feed-sidebar-container {
          display: block !important;
          position: fixed !important;
          right: 20px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          width: 300px !important;
          max-height: 80vh !important;
          overflow-y: auto !important;
          z-index: 100 !important;
        }
        
        .feed-overview-container {
          max-width: calc(100vw - 350px) !important;
          margin: 0 auto !important;
        }
      }
      
      /* RESPONSIVE FEED */
      @media (max-width: 768px) {
        .feed-page {
          padding-top: 70px !important;
        }
        
        body.in-dashboard .feed-page {
          padding-top: 70px !important;
        }
        
        .feed-content {
          padding: 0.5rem !important;
        }
        
        .feed-posts-container {
          gap: 1.5rem !important;
          margin-bottom: 90px !important;
        }
      }
      
      @media (max-width: 480px) {
        .feed-page {
          padding-top: 60px !important;
        }
        
        body.in-dashboard .feed-page {
          padding-top: 60px !important;
        }
        
        .feed-content {
          padding: 0.25rem !important;
        }
        
        .feed-posts-container {
          margin-bottom: 80px !important;
        }
      }
      
      /* OTROS COMPONENTES */
      .chat-page, 
      .admin-moderation-page,
      .admin-profile,
      .admin-analytics,
      .admin-agency-approval {
        width: 100vw !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
        padding: 1rem !important;
        padding-top: 80px !important;
        min-height: 100vh !important;
      }
      
      /* IMPORTANTE: ASEGURAR QUE EL HEADER NO INTERFIERA */
      .header {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 999 !important;
        height: 60px !important;
      }
      
      /* FORZAR RECALCULO DEL PADDING EN COMPONENTES DESPUÉS DEL HEADER */
      .feed-page,
      .chat-page,
      .admin-moderation-page,
      .admin-profile,
      .admin-analytics,
      .admin-agency-approval {
        margin-top: 0 !important;
        transform: translateY(0) !important;
      }
    `;
    
    const existingStyle = document.getElementById('admin-dashboard-optimized-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  };

  // ✅ EFECTO MEJORADO - COPIADO EXACTAMENTE DE ESCORTDASHBOARD
  useEffect(() => {
    document.body.classList.add('in-dashboard');
    document.body.style.overflowX = 'hidden';
    document.body.style.width = '100%';
    document.body.style.maxWidth = '100vw';
    document.body.style.boxSizing = 'border-box';
    document.body.style.scrollBehavior = 'smooth';
    document.body.style.webkitOverflowScrolling = 'touch';
    
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.width = '100%';
    document.documentElement.style.maxWidth = '100vw';
    document.documentElement.style.boxSizing = 'border-box';
    document.documentElement.style.scrollBehavior = 'smooth';
    document.documentElement.style.webkitOverflowScrolling = 'touch';
    
    const header = document.querySelector('.header');
    if (header) {
      header.classList.remove('hidden');
      header.classList.add('visible-scrolled');
      header.style.transform = 'translateY(0)';
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.zIndex = '999';
      header.style.background = 'rgba(220, 38, 38, 0.95)';
      header.style.backdropFilter = 'blur(20px)';
      header.style.borderBottom = '1px solid rgba(220, 38, 38, 0.3)';
      header.style.height = '60px';
    }

    setupOptimizedStyles();

    requestAnimationFrame(() => {
      const feedPage = document.querySelector('.feed-page');
      if (feedPage) {
        feedPage.style.paddingTop = '80px';
        feedPage.style.marginTop = '0';
        feedPage.style.transform = 'translateY(0)';
      }
      
      document.body.offsetHeight;
    });

    return () => {
      document.body.classList.remove('in-dashboard');
      
      if (header) {
        header.classList.remove('visible-scrolled');
        header.style.transform = '';
        header.style.position = '';
        header.style.top = '';
        header.style.zIndex = '';
        header.style.background = '';
        header.style.backdropFilter = '';
        header.style.borderBottom = '';
        header.style.height = '';
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

      const style = document.getElementById('admin-dashboard-optimized-styles');
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
    return <FeedPage userType="admin" />;
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
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
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
    
    setTimeout(forceNavbarVisibility, 100);
  }, [activeView]);

  // 🆕 LISTENER PARA NAVEGACIÓN DESDE EL HEADER
  useEffect(() => {
    const handleDashboardNavigate = (event) => {
      if (event.detail && event.detail.view) {
        console.log('📡 AdminDashboard recibió comando de navegación:', event.detail.view);
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
      className="admin-dashboard"
      style={{
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0
      }}
    >
      {/* Header Global */}
      <Header 
        onOpenAuthModal={handleOpenAuthModal}
        hideLogoInDashboard={false}
        showHamburgerInDashboard={false}
        dashboardMode={true}
        userType="admin"
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
          perspective: 1000
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
              padding: 0
            }}
          >
            {ActiveComponent}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;