import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  MessageCircle, 
  Users,
  UserPlus,
  Building2,
  Shield
} from 'lucide-react';

// Importar componentes COMPARTIDOS y específicos de agencia
import FeedPage from '../shared/feed/FeedPage';
import ChatPage from '../shared/chat/ChatPage';
import AgencyEscortsManager from './AgencyEscortsManager';
import AgencyRecruitment from './AgencyRecruitment';
import AgencyVerificationPage from './AgencyVerificationPage';
import AgencyProfile from './AgencyProfile';
import Header from '../global/Header';
import './AgencyDashboard.css';

const AgencyDashboard = () => {
  const [activeView, setActiveView] = useState('feed');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Mock agency data
  const agency = {
    id: 1,
    name: 'Elite Companions',
    email: 'elite@companions.com',
    avatar: 'https://images.unsplash.com/photo-1560472354-b43ff0c44a43?w=100&h=100&fit=crop',
    teloPoints: 2500,
    isPremium: true,
    level: 'Premium',
    totalEscorts: 12,
    verifiedEscorts: 8,
    pendingRequests: 3
  };

  // Función para abrir auth modal
  const handleOpenAuthModal = (type) => {
    console.log('Auth modal requested:', type);
    setShowAuthModal(true);
  };

  // Navegación principal con 6 tabs - INCLUYE VERIFICACIONES
  const mainNavigation = [
    {
      id: 'feed',
      label: 'Para Ti',
      icon: Flame,
      component: () => <FeedPage userType="agency" />,
      description: 'Contenido personalizado',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      id: 'chat',
      label: 'Mensajes',
      icon: MessageCircle,
      component: () => <ChatPage userType="agency" />,
      description: 'Chat con escorts y clientes',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 'escorts',
      label: 'Escorts',
      icon: Users,
      component: AgencyEscortsManager,
      description: 'Gestionar perfiles',
      gradient: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'recruitment',
      label: 'Reclutar',
      icon: UserPlus,
      component: AgencyRecruitment,
      description: 'Solicitudes de unión',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'verifications',
      label: 'Verificar',
      icon: Shield,
      component: AgencyVerificationPage,
      description: 'Verificar escorts',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      id: 'profile',
      label: 'Mi Agencia',
      icon: Building2,
      component: AgencyProfile,
      description: 'Perfil de agencia',
      gradient: 'from-gray-500 to-gray-700'
    }
  ];

  // ✅ FUNCIÓN EXACTA DE CLIENTDASHBOARD - CON CONFIGURACIÓN COMPLETA DE FEED
  const setupOptimizedStyles = () => {
    const style = document.createElement('style');
    style.id = 'agency-dashboard-optimized-styles';
    style.textContent = ``;
    
    const existingStyle = document.getElementById('agency-dashboard-optimized-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  };

  // ✅ EFECTO MEJORADO - COPIADO EXACTAMENTE DE CLIENTDASHBOARD
  useEffect(() => {
    // Aplicar clase al body INMEDIATAMENTE
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
    
    // Configurar header INMEDIATAMENTE con colores de agencia
    const header = document.querySelector('.header');
    if (header) {
      header.classList.remove('hidden');
      header.classList.add('visible-scrolled');
      header.style.transform = 'translateY(0)';
      header.style.position = 'fixed';
      header.style.top = '0';
      header.style.zIndex = '999';
      header.style.background = 'rgba(255, 107, 53, 0.95)'; // Color agencia
      header.style.backdropFilter = 'blur(20px)';
      header.style.borderBottom = '1px solid rgba(255, 107, 53, 0.3)';
      header.style.height = '60px';
    }

    // Aplicar estilos optimizados INMEDIATAMENTE
    setupOptimizedStyles();

    // FORZAR RECALCULO DE LAYOUT DESPUÉS DE UN FRAME
    requestAnimationFrame(() => {
      const feedPage = document.querySelector('.feed-page');
      if (feedPage) {
        feedPage.style.paddingTop = '80px';
        feedPage.style.marginTop = '0';
        feedPage.style.transform = 'translateY(0)';
      }
      
      // Forzar reflow para asegurar aplicación de estilos
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

      const style = document.getElementById('agency-dashboard-optimized-styles');
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
    return <FeedPage userType="agency" />;
  }, [activeView]);

  // 🆕 LISTENER PARA NAVEGACIÓN DESDE EL HEADER
  useEffect(() => {
    const handleDashboardNavigate = (event) => {
      if (event.detail && event.detail.view) {
        console.log('📡 AgencyDashboard recibió comando de navegación:', event.detail.view);
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
      className="agency-dashboard"
      style={{
        width: '100vw',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        margin: 0,
        padding: 0,
        position: 'relative'
      }}
    >
      {/* Header Global */}
      <Header 
        onOpenAuthModal={handleOpenAuthModal}
        hideLogoInDashboard={false}
        showHamburgerInDashboard={true}
        dashboardMode={true}
        userType="agency"
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
          minHeight: 0
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
              position: 'relative'
            }}
          >
            {ActiveComponent}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AgencyDashboard;