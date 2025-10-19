import React, { useState, useEffect } from 'react';
import { Building2, Image, Loader, AlertCircle } from 'lucide-react';

// Importar los componentes separados
import AgencyInfo from './AgencyInfo';
import PostsManager from './PostsManager';

// Importar API y contextos
import { useAuth } from '../../context/AuthContext';
import { userAPI, handleApiError } from '../../utils/api';

const AgencyProfile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Estado del perfil real desde la API - Solo campos visibles
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    description: '',
    avatar: '',
    website: '',
    accountInfo: {
      isVerified: false,
      totalEscorts: 0,
      activeEscorts: 0,
      verifiedEscorts: 0,
    },
  });

  // Estado para edición - Campos específicos de agencia
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    website: '',
    locationId: '',
  });

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar perfil al montar el componente
  useEffect(() => {
    if (user && user.userType === 'AGENCY') {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoadingProfile(true);
      setError(null);

      const response = await userAPI.getProfile();

      if (response.success && response.data) {
        const userData = response.data;

        // Establecer campos específicos de agencia en profileData
        setProfileData({
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location?.city || userData.location?.country || '',
          description: userData.bio || '',
          avatar: userData.avatar || '',
          website: userData.website || '',
          accountInfo: {
            isVerified: userData.agency?.isVerified || false,
            totalEscorts: userData.agency?.totalEscorts || 0,
            activeEscorts: userData.agency?.activeEscorts || 0,
            verifiedEscorts: userData.agency?.verifiedEscorts || 0,
          },
        });

        // Mantener todos los campos en editData para preservar la estructura del backend
        setEditData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          website: userData.website || '',
          locationId: userData.locationId || '',
        });

        console.log('✅ Perfil de agencia cargado exitosamente:', userData);
      }
    } catch (error) {
      console.error('❌ Error cargando perfil de agencia:', error);
      setError(handleApiError(error));
    } finally {
      setLoadingProfile(false);
    }
  };

  if (loadingProfile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <Loader style={{ animation: 'spin 1s linear infinite' }} size={32} color="#b6390cff" />
        <p style={{ color: '#9ca3af' }}>Cargando perfil de agencia...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000000',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Error Display */}
      {error && (
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: isMobile ? '0 1rem' : '0 2rem'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '1rem',
            color: '#ef4444',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: isMobile ? '0.75rem 1rem' : '1rem 2rem',
        marginTop: '60px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          gap: isMobile ? '0.5rem' : '0.75rem',
          justifyContent: 'center'
        }}>
          {[
            { id: 'posts', label: 'Mis Anuncios', icon: <Image size={14} /> },
            { id: 'personal', label: 'Mi Agencia', icon: <Building2 size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.25rem',
                borderRadius: '8px',
                border: activeTab === tab.id ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: activeTab === tab.id ? '#b6390cff' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#9ca3af'
              }}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              {tab.icon}
              {!isMobile && <span>{tab.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Content */}
      <div style={{ 
        padding: isMobile ? '1rem' : '2rem',
        background: '#000000',
        minHeight: 'calc(100vh - 200px)'
      }}>
        {activeTab === 'posts' && (
          <div style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <PostsManager 
              user={user}
              onError={setError}
            />
          </div>
        )}

        {activeTab === 'personal' && (
          <div style={{
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <AgencyInfo
              user={user}
              updateUser={updateUser}
              profileData={profileData}
              editData={editData}
              setEditData={setEditData}
              loadUserProfile={loadUserProfile}
              onError={setError}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AgencyProfile;