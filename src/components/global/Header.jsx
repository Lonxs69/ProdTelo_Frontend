import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  LogOut, 
  Crown, 
  Menu,
  // Iconos para navegación de dashboards
  MessageCircle,
  Flame,
  Building,
  Users,
  UserPlus,
  Shield,
  Building2,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import logo from '../../assets/images/logo png mejora.png';
import './Header.css';

const Header = ({ 
  onOpenAuthModal, 
  hideLogoInDashboard = false, 
  showHamburgerInDashboard = true,
  dashboardMode = false,
  onMenuClick
}) => {
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [headerState, setHeaderState] = React.useState('visible');
  const [lastScrollY, setLastScrollY] = React.useState(0);
  const { currentPage, navigateTo } = useApp();
  const { user, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    if (dashboardMode) {
      setHeaderState('visible-scrolled');
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Control del header
      if (currentScrollY <= 50) {
        setHeaderState('visible');
      }
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderState('hidden');
        setShowSidebar(false);
      }
      else if (currentScrollY < lastScrollY && currentScrollY > 50) {
        setHeaderState('visible-scrolled');
      }
      
      setLastScrollY(currentScrollY);
    };

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [lastScrollY, dashboardMode]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setShowSidebar(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSidebar]);

  const handleNavigation = (route) => {
    console.log('🧭 Navigate to:', route);
    navigateTo(route);
    setShowSidebar(false);
  };

  // 🆕 FUNCIÓN PARA MANEJAR NAVEGACIÓN INTERNA DE DASHBOARDS
  const handleDashboardNavigation = (dashboardType, view) => {
    console.log(`🎯 Navegando a ${dashboardType} dashboard, vista: ${view}`);
    
    // Primero asegurarse de estar en el dashboard correcto
    const dashboardRoute = `${dashboardType}-dashboard`;
    
    // Si ya estamos en el dashboard, solo cambiar la vista
    if (currentPage === dashboardRoute) {
      // Disparar evento personalizado para que el dashboard cambie la vista
      window.dispatchEvent(new CustomEvent('dashboard:navigate', { 
        detail: { view } 
      }));
    } else {
      // Si no estamos en el dashboard, navegar y luego cambiar vista
      navigateTo(dashboardRoute);
      // Dar tiempo para que se monte el dashboard y luego cambiar vista
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dashboard:navigate', { 
          detail: { view } 
        }));
      }, 100);
    }
    
    setShowSidebar(false);
  };

  const handleAuthAction = (action) => {
    console.log('Auth action:', action);
    if (action === 'login') {
      onOpenAuthModal && onOpenAuthModal('login');
    } else if (action === 'register') {
      onOpenAuthModal && onOpenAuthModal('register');
    } else if (action === 'logout') {
      logout();
      navigateTo(ROUTES.HOME);
    }
    setShowSidebar(false);
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const closeSidebar = () => {
    setShowSidebar(false);
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      client: 'Cliente',
      escort: 'Escort',
      agency: 'Agencia',
      admin: 'Administrador',
      CLIENT: 'Cliente',
      ESCORT: 'Escort',
      AGENCY: 'Agencia',
      ADMIN: 'Administrador'
    };
    return labels[type] || 'Usuario';
  };

  const navigateToDashboard = () => {
    if (!isAuthenticated || !user) {
      console.log('❌ No hay usuario autenticado para navegar a dashboard');
      return;
    }
    
    const userType = (user.userType || '').toLowerCase();
    console.log('🚀 Navegando a dashboard para usuario:', user.userType, '→ normalizado:', userType);
    
    switch (userType) {
      case 'client':
        navigateTo(ROUTES.CLIENT_DASHBOARD);
        break;
      case 'escort':
        navigateTo(ROUTES.ESCORT_DASHBOARD);
        break;
      case 'agency':
        navigateTo(ROUTES.AGENCY_DASHBOARD);
        break;
      case 'admin':
        navigateTo(ROUTES.ADMIN_DASHBOARD);
        break;
      default:
        navigateTo(ROUTES.FEED);
    }
    setShowSidebar(false);
  };

  const getHeaderClasses = () => {
    const baseClass = 'header';
    if (dashboardMode) {
      return `${baseClass} visible-scrolled dashboard-mode`;
    }
    
    switch (headerState) {
      case 'hidden':
        return `${baseClass} hidden`;
      case 'visible-scrolled':
        return `${baseClass} visible-scrolled`;
      case 'visible':
      default:
        return `${baseClass} visible`;
    }
  };

  // 🎯 FUNCIÓN PRINCIPAL: Obtener items de navegación según usuario
  const getNavigationItems = () => {
    const sections = [];

    // ✅ SECCIÓN DE DASHBOARD (solo si está autenticado)
    if (isAuthenticated && user) {
      const userType = (user.userType || '').toLowerCase();
      
      const dashboardSection = {
        section: 'Mi Dashboard',
        items: []
      };

      // 👤 OPCIONES PARA CLIENTE
      if (userType === 'client') {
        dashboardSection.items = [
          {
            action: () => handleDashboardNavigation('client', 'chat'),
            label: 'Mensajes',
            icon: <MessageCircle size={20} />,
            description: 'Tus conversaciones',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('client', 'feed'),
            label: 'Anuncios',
            icon: <Flame size={20} />,
            description: 'Contenido personalizado',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('client', 'profile'),
            label: 'Mi Perfil',
            icon: <User size={20} />,
            description: 'Configuración personal',
            requiresAuth: true,
            dashboardView: true
          }
        ];
      }

      // 💃 OPCIONES PARA ESCORT
      if (userType === 'escort') {
        dashboardSection.items = [
          {
            action: () => handleDashboardNavigation('escort', 'chat'),
            label: 'Mensajes',
            icon: <MessageCircle size={20} />,
            description: 'Tus conversaciones',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('escort', 'agency'),
            label: 'Agencias',
            icon: <Building size={20} />,
            description: 'Estado de agencia',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('escort', 'feed'),
            label: 'Anuncios',
            icon: <Flame size={20} />,
            description: 'Contenido personalizado',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('escort', 'profile'),
            label: 'Perfil',
            icon: <User size={20} />,
            description: 'Configuración personal',
            requiresAuth: true,
            dashboardView: true
          }
        ];
      }

      // 🏢 OPCIONES PARA AGENCIA
      if (userType === 'agency') {
        dashboardSection.items = [
          {
            action: () => handleDashboardNavigation('agency', 'feed'),
            label: 'Anuncios',
            icon: <Flame size={20} />,
            description: 'Contenido personalizado',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('agency', 'chat'),
            label: 'Mensajes',
            icon: <MessageCircle size={20} />,
            description: 'Chat con escorts y clientes',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('agency', 'escorts'),
            label: 'Escorts',
            icon: <Users size={20} />,
            description: 'Gestionar perfiles',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('agency', 'recruitment'),
            label: 'Solicitudes de Unión',
            icon: <UserPlus size={20} />,
            description: 'Solicitudes de unión',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('agency', 'verifications'),
            label: 'Verificar',
            icon: <Shield size={20} />,
            description: 'Verificar escorts',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('agency', 'profile'),
            label: 'Mi Agencia',
            icon: <Building2 size={20} />,
            description: 'Perfil de agencia',
            requiresAuth: true,
            dashboardView: true
          }
        ];
      }

      // 👑 OPCIONES PARA ADMIN
      if (userType === 'admin') {
        dashboardSection.items = [
          {
            action: () => handleDashboardNavigation('admin', 'feed'),
            label: 'Anuncios',
            icon: <Flame size={20} />,
            description: 'Feed de publicaciones',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('admin', 'chat'),
            label: 'Mensajes',
            icon: <MessageCircle size={20} />,
            description: 'Chat administrativo',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('admin', 'agencies'),
            label: 'Solicitudes',
            icon: <Building2 size={20} />,
            description: 'Solicitudes de agencias',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('admin', 'moderation'),
            label: 'Moderación',
            icon: <Users size={20} />,
            description: 'Gestión y moderación',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('admin', 'analytics'),
            label: 'Analíticas',
            icon: <BarChart3 size={20} />,
            description: 'Estadísticas del sistema',
            requiresAuth: true,
            dashboardView: true
          },
          {
            action: () => handleDashboardNavigation('admin', 'profile'),
            label: 'Perfil',
            icon: <UserCheck size={20} />,
            description: 'Configuración de admin',
            requiresAuth: true,
            dashboardView: true
          }
        ];
      }

      if (dashboardSection.items.length > 0) {
        sections.push(dashboardSection);
      }
    }

    // ✅ SECCIÓN EXPLORAR
    const explorarItems = [
      {
        route: ROUTES.HOME,
        label: 'Inicio',
        requiresAuth: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        )
      }
    ];

    // ⚠️ SOLO agregar "Ver Publicaciones" si el usuario NO está autenticado
    if (!isAuthenticated) {
      explorarItems.push({
        route: ROUTES.FEED,
        label: 'Ver Publicaciones',
        requiresAuth: false,
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="15" x2="12" y2="15"/>
          </svg>
        )
      });
    }

    sections.push({
      section: 'Explorar',
      items: explorarItems
    });

    // ✅ SECCIÓN COMPAÑÍA (para todos)
    sections.push({
      section: 'Compañía',
      items: [
        {
          route: ROUTES.ABOUT,
          label: 'Sobre Nosotros',
          requiresAuth: false,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          )
        },
        {
          route: ROUTES.TERMS,
          label: 'Términos y Condiciones',
          requiresAuth: false,
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          )
        }
      ]
    });

    return sections;
  };

  const handleItemClick = (item) => {
    console.log('🖱️ Click en item:', item.label);
    
    // Si tiene action personalizada (para vistas de dashboard)
    if (item.action) {
      item.action();
      return;
    }
    
    // Si tiene onClick personalizado
    if (item.onClick) {
      item.onClick();
      return;
    }
    
    // Si requiere auth y no está autenticado
    if (item.requiresAuth === true && !isAuthenticated) {
      onOpenAuthModal && onOpenAuthModal('login');
      return;
    }
    
    // Navegación normal por ruta
    if (item.route && (item.requiresAuth === false || isAuthenticated)) {
      handleNavigation(item.route);
      return;
    }
  };

  const shouldShowPremiumElements = () => {
    if (!isAuthenticated || !user) return false;
    const userType = (user.userType || '').toLowerCase();
    return userType === 'escort';
  };

  // Animaciones
  const sidebarVariants = {
    hidden: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const overlayVariants = {
    hidden: {
      opacity: 0,
      backdropFilter: "blur(0px)",
      transition: {
        duration: 0.3
      }
    },
    visible: {
      opacity: 1,
      backdropFilter: "blur(8px)",
      transition: {
        duration: 0.4
      }
    }
  };

  const navSectionVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const navItemVariants = {
    hidden: {
      opacity: 0,
      x: -30,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <>
      <header className={getHeaderClasses()}>
        <div className="header-container mobile-optimized">
          {!hideLogoInDashboard && (
            <div 
              className="logo mobile-small" 
              onClick={() => handleNavigation(ROUTES.HOME)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={logo} 
                alt="TeloFundi" 
                className="logo-image mobile-small"
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          <div className="header-spacer"></div>

          {(!dashboardMode || showHamburgerInDashboard) && (
            <button 
              className={`hamburger-menu modern mobile-small ${showSidebar ? 'active' : ''}`}
              onClick={toggleSidebar}
              aria-label="Abrir menú"
              aria-expanded={showSidebar}
            >
              <div className="hamburger-line mobile-small" />
              <div className="hamburger-line mobile-small" />
              <div className="hamburger-line mobile-small" />
            </button>
          )}
        </div>
      </header>

      {/* Sidebar mejorado */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <>
            <motion.div 
              className="sidebar open modern mobile-optimized"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="sidebar-content modern">
                {/* Header del Sidebar limpio */}
                <motion.div 
                  className="sidebar-header modern clean"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                />

                {/* Sección de autenticación */}
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '20px'
                }}>
                  <p style={{ 
                    color: '#fff', 
                    fontSize: '14px',
                    margin: 0,
                    opacity: 0.9,
                    marginBottom: '15px'
                  }}>
                    {isAuthenticated 
                      ? `Bienvenido, ${user?.username || 'Usuario'}` 
                      : 'Conéctate ahora o únete gratis en segundos.'}
                  </p>

                  {/* Botones de autenticación */}
                  <div style={{
                    display: 'flex',
                    gap: '10px'
                  }}>
                    {!isAuthenticated ? (
                      <>
                        <motion.button
                          onClick={() => handleAuthAction('login')}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #b6390cff, #b6390cff)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          <span>Iniciar Sesión</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleAuthAction('register')}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          <span>Crear Cuenta</span>
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          onClick={navigateToDashboard}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #b6390cff,#b6390cff)',
                            border: 'none',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <User size={16} />
                          <span>Mi Dashboard</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => handleAuthAction('logout')}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '6px',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <LogOut size={16} />
                          <span>Cerrar Sesión</span>
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Info de usuario */}
                  {isAuthenticated && user && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{
                        marginTop: '12px',
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      <span>@{user.username}</span>
                      {shouldShowPremiumElements() && user.isPremium && (
                        <Crown size={12} style={{ marginLeft: '5px', color: '#ffd700', display: 'inline' }} />
                      )}
                      <span style={{ marginLeft: '8px' }}>• {getUserTypeLabel(user.userType)}</span>
                    </motion.div>
                  )}
                </div>

                {/* Navigation mejorada */}
                <motion.nav 
                  className="sidebar-nav modern"
                  variants={navSectionVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {getNavigationItems().map((section, sectionIndex) => (
                    <motion.div 
                      key={section.section} 
                      className="nav-section modern"
                      variants={navSectionVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: sectionIndex * 0.1 }}
                    >
                      <motion.div 
                        className="nav-section-title modern"
                        variants={navItemVariants}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + sectionIndex * 0.1 }}
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.5)',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          marginBottom: '8px',
                          paddingLeft: '20px'
                        }}
                      >
                        {section.section}
                      </motion.div>
                      {section.items.map((item, itemIndex) => (
                        <motion.button
                          key={item.label}
                          className={`nav-item modern ${item.route === currentPage ? 'active' : ''}`}
                          onClick={() => handleItemClick(item)}
                          variants={navItemVariants}
                          initial={{ opacity: 0, x: -30, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ 
                            delay: 0.4 + sectionIndex * 0.1 + itemIndex * 0.05,
                            type: "spring",
                            stiffness: 400,
                            damping: 25
                          }}
                          whileHover={{ 
                            scale: 1.03, 
                            x: 15,
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            transition: { type: "spring", stiffness: 400, damping: 25 }
                          }}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            width: '100%',
                            padding: '12px 20px',
                            background: item.route === currentPage ? 'rgba(255,255,255,0.1)' : 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            transition: 'all 0.3s ease',
                            textAlign: 'left'
                          }}
                        >
                          <motion.span 
                            className="nav-icon"
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            style={{ width: '20px', height: '20px', opacity: 0.9 }}
                          >
                            {item.icon}
                          </motion.span>
                          <span className="nav-label">{item.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  ))}
                </motion.nav>
              </div>
            </motion.div>

            {/* Overlay */}
            <motion.div 
              className="sidebar-overlay open modern"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={closeSidebar}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;