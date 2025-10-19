import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

// Componentes globales
import Header from './components/global/Header';
import Footer from './components/global/Footer';

// Componentes públicos
import HomePage from './components/public/HomePage';
import AboutPage from './components/public/AboutPage';
import TermsPage from './components/public/TermsPage';
import AuthPage from './components/public/AuthPage';

// IMPORTAR EL FEEDPAGE UNIFICADO
import FeedPage from '../src/components/shared/feed/FeedPage';

// AGREGAR IMPORT DE RESET PASSWORD PAGE
import ResetPasswordPage from './components/public/ResetPasswordPage';

// Componentes de dashboard
import ClientDashboard from './components/client/ClientDashboard';
import EscortDashboard from './components/escort/EscortDashboard';
import AgencyDashboard from './components/agency/AgencyDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

// Estilos
import './App.css';
import { ROUTES, APP_CONFIG } from './utils/constants';

const AppContent = () => {
  const { currentPage, navigateTo, setCurrentPage } = useApp();
  const { user, isAuthenticated, loading } = useAuth();

  // Estado para controlar el modal de autenticación CON MODO CORRECTO
  const [authModal, setAuthModal] = React.useState({
    isOpen: false,
    mode: 'login'
  });

  // DETERMINAR SI ESTAMOS EN UN DASHBOARD
  const isDashboardPage = () => {
    return [
      ROUTES.CLIENT_DASHBOARD,
      ROUTES.ESCORT_DASHBOARD,
      ROUTES.AGENCY_DASHBOARD,
      ROUTES.ADMIN_DASHBOARD,
      'client-dashboard',
      'escort-dashboard',
      'agency-dashboard',
      'admin-dashboard'
    ].includes(currentPage);
  };

  // CORREGIDO: Inicializar adaptador mobile simple
  useEffect(() => {
    console.log('🎯 Inicializando adaptador mobile simple...');
    
    try {
      // Verificar si la función existe antes de llamarla
      if (typeof initializeUniversalMobileAdapter === 'function') {
        // Inicializar el adaptador cuando la app esté lista
        const adapter = initializeUniversalMobileAdapter();
        
        console.log('✅ Adaptador mobile activado:', adapter.getStatus());
        
        // Hacer disponible globalmente para debugging
        window.mobileAdapter = adapter;
      } else {
        console.log('⚠️ initializeUniversalMobileAdapter no está disponible');
      }
      
    } catch (error) {
      console.error('❌ Error inicializando adaptador mobile:', error);
    }
    
    // Cleanup al desmontar (opcional)
    return () => {
      console.log('🔚 App desmontada, adaptador mobile sigue activo');
    };
  }, []); // Solo ejecutar una vez al montar la app

  // FORZAR HOMEPAGE SIEMPRE - MÉTODO DIRECTO
  useEffect(() => {
    console.log('🏠 App.jsx: FORZANDO HomePage');
    
    // Si NO estamos en home, forzar home
    if (currentPage !== 'home') {
      console.log('🔄 Forzando navegación a home desde:', currentPage);
      setCurrentPage('home');
    }
  }, []); // Solo al cargar la app

  // CORREGIDO: Hook para forzar re-adaptación cuando cambia la página
  useEffect(() => {
    if (currentPage && window.mobileAdapter) {
      // Pequeño delay para que el componente se renderice completamente
      setTimeout(() => {
        console.log(`🔧 Forzando re-adaptación para página: ${currentPage}`);
        try {
          window.mobileAdapter.forceReAdapt();
        } catch (error) {
          console.warn('Error en re-adaptación:', error);
        }
      }, 200);
    }
  }, [currentPage]); // Ejecutar cada vez que cambie la página

  // Hook para agregar clase al body cuando estamos en dashboards
  useEffect(() => {
    // Limpiar todas las clases de dashboard previas
    document.body.classList.remove('client-dashboard-active', 'escort-dashboard-active', 
                                   'agency-dashboard-active', 'admin-dashboard-active');
    document.body.removeAttribute('data-page');
    
    // Agregar clase específica si estamos en un dashboard
    if (isDashboardPage()) {
      document.body.classList.add('in-dashboard');
      document.body.setAttribute('data-page', currentPage);
      
      // Agregar clase específica del dashboard
      switch(currentPage) {
        case 'client-dashboard':
        case ROUTES.CLIENT_DASHBOARD:
          document.body.classList.add('client-dashboard-active');
          break;
        case 'escort-dashboard':
        case ROUTES.ESCORT_DASHBOARD:
          document.body.classList.add('escort-dashboard-active');
          break;
        case 'agency-dashboard':
        case ROUTES.AGENCY_DASHBOARD:
          document.body.classList.add('agency-dashboard-active');
          break;
        case 'admin-dashboard':
        case ROUTES.ADMIN_DASHBOARD:
          document.body.classList.add('admin-dashboard-active');
          break;
      }
    } else {
      document.body.classList.remove('in-dashboard');
    }
    
    return () => {
      // Limpiar al cambiar de página
      document.body.classList.remove('in-dashboard', 'client-dashboard-active', 
                                     'escort-dashboard-active', 'agency-dashboard-active', 
                                     'admin-dashboard-active');
      document.body.removeAttribute('data-page');
    };
  }, [currentPage]);

  // Función para abrir modal de auth CON MODO ESPECÍFICO
  const openAuthModal = (mode = 'login') => {
    setAuthModal({
      isOpen: true,
      mode: mode
    });
  };

  // Función para cerrar modal de auth
  const closeAuthModal = () => {
    setAuthModal({
      isOpen: false,
      mode: 'login'
    });
  };

  // EFECTO PARA ABRIR MODAL CUANDO CURRENTPAGE ES AUTH
  useEffect(() => {
    if (currentPage === ROUTES.AUTH) {
      console.log('App: Detectada ruta AUTH, abriendo modal...');
      openAuthModal('login');
    }
  }, [currentPage]);

  // Interceptor para verificar autenticación en acciones que la requieren
  useEffect(() => {
    const handleClick = (e) => {
      const element = e.target.closest('[data-requires-auth]');
      if (element && !isAuthenticated) {
        e.preventDefault();
        e.stopPropagation();
        openAuthModal('login');
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isAuthenticated]);

  const renderPage = () => {
    // Mostrar loading mientras AuthContext está cargando
    if (loading) {
      return (
        <div className="loading-screen">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando TeloFundi...</p>
          </div>
        </div>
      );
    }

    // Debug: Log para ver qué página se está intentando renderizar
    console.log('Renderizando página:', currentPage, 'Usuario autenticado:', isAuthenticated, 'Tipo:', user?.userType);

    // RUTAS PÚBLICAS - Disponibles para TODOS los usuarios
    switch (currentPage) {
      case ROUTES.HOME:
        console.log('Renderizando HomePage');
        return <HomePage />;
      case ROUTES.ABOUT:
        console.log('Renderizando AboutPage');
        return <AboutPage />;
      case ROUTES.TERMS:
        console.log('Renderizando TermsPage');
        return <TermsPage />;
      case ROUTES.FEED:
        console.log('Renderizando FeedPage unificado');
        // USAR FEEDPAGE UNIFICADO CON FUNCIÓN DE AUTH MODAL
        return <FeedPage onOpenAuthModal={openAuthModal} />;
      
      // AGREGAR RUTA DE RESET PASSWORD
      case ROUTES.RESET_PASSWORD:
        console.log('Renderizando ResetPasswordPage');
        return <ResetPasswordPage />;
        
      case ROUTES.AUTH:
        console.log('Renderizando AuthPage con FeedPage de fondo');
        return <FeedPage onOpenAuthModal={openAuthModal} />;
      default:
        break;
    }

    // Si el usuario está autenticado, mostrar rutas específicas de dashboard
    if (isAuthenticated && user) {
      // NORMALIZAR userType a minúsculas para comparación
      const userType = user.userType ? user.userType.toLowerCase() : null;
      
      switch (currentPage) {
        // DASHBOARD DE CLIENTE
        case 'client-dashboard':
          if (userType !== 'client') {
            console.log(`Usuario ${user.userType} no autorizado para client dashboard, enviando a home`);
            setCurrentPage('home');
            return <HomePage />;
          }
          console.log('Renderizando ClientDashboard para usuario:', user.username);
          return <ClientDashboard />;
        
        // DASHBOARD DE ESCORT
        case 'escort-dashboard':
          if (userType !== 'escort') {
            console.log(`Usuario ${user.userType} no autorizado para escort dashboard, enviando a home`);
            setCurrentPage('home');
            return <HomePage />;
          }
          console.log('Renderizando EscortDashboard para usuario:', user.username);
          return <EscortDashboard />;
          
        // DASHBOARD DE AGENCIA
        case 'agency-dashboard':
          if (userType !== 'agency') {
            console.log(`Usuario ${user.userType} no autorizado para agency dashboard, enviando a home`);
            setCurrentPage('home');
            return <HomePage />;
          }
          console.log('Renderizando AgencyDashboard para usuario:', user.username);
          return <AgencyDashboard />;
          
        // DASHBOARD DE ADMINISTRADOR
        case 'admin-dashboard':
          if (userType !== 'admin') {
            console.log(`Usuario ${user.userType} no autorizado para admin dashboard, enviando a home`);
            setCurrentPage('home');
            return <HomePage />;
          }
          console.log('Renderizando AdminDashboard para usuario:', user.username);
          return <AdminDashboard />;
        
        default:
          // USUARIO AUTENTICADO EN PÁGINA NO ESPECÍFICA = HOMEPAGE
          console.log(`Usuario autenticado en página: ${currentPage}, mostrando HomePage`);
          return <HomePage />;
      }
    }

    // Para usuarios no autenticados que intentan acceder a dashboards
    if (!isAuthenticated) {
      switch (currentPage) {
        case 'client-dashboard':
        case 'escort-dashboard':
        case 'agency-dashboard':
        case 'admin-dashboard':
          console.log('Usuario no autenticado intentando acceder a dashboard, enviando a home');
          setCurrentPage('home');
          return <HomePage />;
        default:
          // USUARIOS NO AUTENTICADOS SIEMPRE VAN A HOMEPAGE
          console.log('Usuario no autenticado, mostrando HomePage');
          return <HomePage />;
      }
    }

    // Fallback final - SIEMPRE HOMEPAGE
    return <HomePage />;
  };

  return (
    <div className="app">
      {/* Header - SOLO MOSTRAR SI NO ESTAMOS EN UN DASHBOARD */}
      {!isDashboardPage() && (
        <Header onOpenAuthModal={openAuthModal} />
      )}
      
      <main className="main-content">
        {renderPage()}
      </main>
      
      {/* Footer - Mostrar en todas las páginas EXCEPTO en dashboards Y reset password */}
      {!isDashboardPage() && currentPage !== ROUTES.RESET_PASSWORD && (
        <Footer />
      )}
      
      {/* Modal de Autenticación */}
      <AuthPage 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
      />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;