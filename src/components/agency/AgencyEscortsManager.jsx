import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  Eye,
  Shield,
  X,
  MoreVertical,
  Trash2,
  UserX,
  BarChart3,
  Star,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader,
  Crown
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { agencyAPI, handleApiError } from '../../utils/api';

const AgencyEscortsManager = () => {
  const { user, isAuthenticated } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showMetricsModal, setShowMetricsModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  
  // Estados del backend
  const [escorts, setEscorts] = useState([]);
  const [agencyStats, setAgencyStats] = useState(null);
  const [loading, setLoading] = useState({
    escorts: false,
    stats: false,
    action: false
  });
  const [errors, setErrors] = useState({});
  
  // Paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
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

  // Verificar permisos
  if (!isAuthenticated || user?.userType !== 'AGENCY') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle size={64} color="#ef4444" />
          <h2 style={{ margin: '1rem 0', color: '#ef4444' }}>Acceso Restringido</h2>
          <p style={{ color: '#9CA3AF' }}>Esta página es solo para agencias autenticadas.</p>
        </div>
      </div>
    );
  }

  // Helper: Setear loading
  const setLoadingState = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // Helper: Setear errores
  const setError = useCallback((key, error) => {
    setErrors(prev => ({ 
      ...prev, 
      [key]: error?.message || error || 'Error desconocido' 
    }));
  }, []);

  // Helper: Limpiar error
  const clearError = useCallback((key) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  // Obtener escorts desde el backend
  const fetchActiveEscorts = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingState('escorts', true);
      clearError('escorts');
      
      const response = await agencyAPI.getAgencyEscorts({
        page: pagination.page,
        limit: pagination.limit,
        status: 'active',
        search: searchTerm
      });
      
      if (response.success && response.data) {
        const escortsData = response.data.escorts || [];
        
        const transformedEscorts = escortsData.map(escortMembership => {
          const escort = escortMembership.escort;
          const user = escort.user;
          
          return {
            id: escort.id,
            membershipId: escortMembership.membershipId,
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            avatar: user.avatar || '/default-avatar.png',
            age: escort.age || 25,
            location: `República Dominicana, Santo Domingo`,
            description: user.bio || 'Escort profesional',
            verified: escort.isVerified || false,
            status: escortMembership.status?.toLowerCase() || 'active',
            joinDate: escortMembership.joinedAt,
            role: escortMembership.role,
            commissionRate: escortMembership.commissionRate,
            services: escort.services || ['Acompañamiento'],
            phone: user.phone || '+1-829-XXX-XXXX',
            rating: escort.rating || 4.5,
            totalRatings: escort.totalRatings || 0,
            metrics: {
              profileViews: user.profileViews || 0,
              totalInteractions: user.profileViews || 0
            }
          };
        });
        
        setEscorts(transformedEscorts);
        setPagination(response.data.pagination || pagination);
      } else {
        throw new Error(response.message || 'Error obteniendo escorts');
      }
    } catch (error) {
      console.error('❌ Error fetching escorts:', error);
      setError('escorts', handleApiError(error));
      setEscorts([]);
    } finally {
      setLoadingState('escorts', false);
    }
  }, [isAuthenticated, pagination.page, pagination.limit, searchTerm, setLoadingState, clearError, setError]);

  // Obtener estadísticas
  const fetchAgencyStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingState('stats', true);
      clearError('stats');
      
      const response = await agencyAPI.getAgencyStats();
      
      if (response.success && response.data) {
        setAgencyStats(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas');
      }
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setError('stats', handleApiError(error));
    } finally {
      setLoadingState('stats', false);
    }
  }, [isAuthenticated, setLoadingState, clearError, setError]);

  // Manejar búsqueda
  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Efectos de inicialización
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'AGENCY') {
      fetchActiveEscorts();
      fetchAgencyStats();
    }
  }, [isAuthenticated, user, fetchActiveEscorts, fetchAgencyStats]);

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isAuthenticated && user?.userType === 'AGENCY') {
        fetchActiveEscorts();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isAuthenticated, user?.userType, fetchActiveEscorts]);

  // Filtrar escorts
  const filteredEscorts = escorts.filter(escort => {
    const matchesSearch = escort.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         escort.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'verified') return matchesSearch && escort.verified;
    
    return matchesSearch;
  });

  // Métricas calculadas
  const agencyMetrics = agencyStats ? {
    totalEscorts: agencyStats.memberships?.active || 0,
    activeEscorts: agencyStats.memberships?.active || 0,
    totalViews: escorts.reduce((sum, e) => sum + (e.metrics?.profileViews || 0), 0)
  } : {
    totalEscorts: escorts.length,
    activeEscorts: escorts.filter(e => e.status === 'active').length,
    totalViews: escorts.reduce((sum, e) => sum + (e.metrics?.profileViews || 0), 0)
  };

  // Handlers
  const handleViewMetrics = (escort) => {
    setShowMetricsModal(escort);
  };

  const handleRemoveEscort = (escort) => {
    setShowConfirmModal({
      type: 'remove',
      escort: escort,
      title: '¿Remover Escort?',
      message: `¿Estás seguro de que quieres remover a ${escort.name} de tu agencia? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          setLoadingState('action', true);
          setEscorts(prev => prev.filter(e => e.id !== escort.id));
          alert(`${escort.name} ha sido removida de la agencia`);
        } catch (error) {
          console.error('❌ Error removing escort:', error);
          alert(`Error: ${handleApiError(error)}`);
        } finally {
          setLoadingState('action', false);
          setShowConfirmModal(null);
        }
      }
    });
  };

  // Helpers
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-DO').format(number || 0);
  };

  // Modal de Confirmación
  const ConfirmationModal = ({ modalData, onClose }) => (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '500px',
          width: '100%',
          background: '#0e0d0dff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: '1.125rem' }}>{modalData.title}</h2>
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <img 
                src={modalData.escort.avatar} 
                alt={modalData.escort.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid #b6390cff'
                }}
              />
            </div>
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>{modalData.escort.name}</h3>
            <p style={{ color: '#9CA3AF', marginBottom: '1.5rem', lineHeight: '1.5' }}>{modalData.message}</p>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: '1rem', 
              justifyContent: 'center' 
            }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#D1D5DB',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={modalData.onConfirm}
                disabled={loading.action}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  background: loading.action ? 'rgba(239, 68, 68, 0.5)' : '#ef4444',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: loading.action ? 'not-allowed' : 'pointer',
                  opacity: loading.action ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}
              >
                {loading.action ? (
                  <>
                    <Loader style={{ animation: 'spin 1s linear infinite' }} size={16} />
                    Removiendo...
                  </>
                ) : (
                  <>
                    <UserX size={16} />
                    Sí, Remover
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal de Métricas
  const MetricsModal = ({ escort, onClose }) => (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '600px',
          width: '100%',
          background: '#0e0d0dff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          background: '#0e0d0dff',
          zIndex: 10
        }}>
          <h2 style={{ color: 'white', margin: 0, fontSize: isMobile ? '1rem' : '1.125rem' }}>
            Métricas de {escort.name}
          </h2>
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {/* Info básica */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: '1rem', 
            marginBottom: '2rem',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <img 
              src={escort.avatar} 
              alt={escort.name}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #b6390cff',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <h3 style={{ color: 'white', margin: '0 0 0.25rem 0' }}>{escort.name}, {escort.age}</h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                {escort.location}
              </p>
              <p style={{ color: '#9CA3AF', margin: '0', fontSize: '0.875rem' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
                Miembro desde {formatDate(escort.joinDate)}
              </p>
            </div>
            {escort.verified && (
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <Shield size={16} />
                  Verificada
                </div>
              </div>
            )}
          </div>

          {/* Métricas */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.05)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Eye size={20} color="white" />
              </div>
              <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
                {formatNumber(escort.metrics.profileViews)}
              </h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Vistas de Perfil
              </p>
              <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '500' }}>
                +8% este mes
              </span>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#10b981',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Star size={20} color="white" />
              </div>
              <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
                {escort.rating}/5.0
              </h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Rating Promedio
              </p>
              <span style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: '500' }}>
                {escort.totalRatings} reseñas
              </span>
            </div>

            <div style={{
              background: 'rgba(182, 57, 12, 0.05)',
              border: '1px solid rgba(182, 57, 12, 0.2)',
              borderRadius: '12px',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#b6390cff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Crown size={20} color="white" />
              </div>
              <h3 style={{ color: 'white', margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: '700' }}>
                {(escort.commissionRate * 100).toFixed(0)}%
              </h3>
              <p style={{ color: '#9CA3AF', margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600' }}>
                Comisión
              </p>
              <span style={{ color: '#9CA3AF', fontSize: '0.75rem', fontWeight: '500' }}>
                Rol: {escort.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      marginTop: '4rem',
      background: '#000000', 
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Hero Section */}
      <div style={{ 
        background: '#000000', 
        padding: isMobile ? '1.5rem 1rem' : '2rem' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: '#0e0d0dff',
            borderRadius: '12px',
            padding: isMobile ? '1.5rem' : '2rem',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #b6390cff, #a82f0aff)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Users size={24} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ 
                  margin: '0 0 0.5rem 0', 
                  fontSize: isMobile ? '1.5rem' : '2rem',
                  fontWeight: '700' 
                }}>
                  Gestión de Escorts
                </h1>
                <p style={{ margin: '0', color: '#9ca3af', fontSize: isMobile ? '0.875rem' : '1rem' }}>
                  Administra tu equipo de acompañantes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errors.escorts && (
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 1rem 1rem' : '0 2rem 1rem'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#ef4444',
            fontSize: '0.875rem'
          }}>
            <AlertTriangle size={16} />
            <span>{errors.escorts}</span>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div style={{ 
        padding: isMobile ? '1rem' : '2rem', 
        background: '#000000' 
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{
            background: '#0e0d0dff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: '#10b981',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Users size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'white', margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: '700' }}>
                {formatNumber(agencyMetrics.totalEscorts)}
              </h3>
              <p style={{ color: '#9CA3AF', margin: '0', fontSize: '0.875rem' }}>Total Escorts</p>
              <span style={{ color: '#10b981', fontSize: '0.75rem' }}>
                {agencyMetrics.activeEscorts} activas
              </span>
            </div>
          </div>
          
          
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div style={{
        padding: isMobile ? '1rem' : '1rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '1rem',
          alignItems: isMobile ? 'stretch' : 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ 
            position: 'relative', 
            flex: isMobile ? 'none' : '1',
            maxWidth: isMobile ? '100%' : '400px'
          }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}
            />
            <input
              type="text"
              placeholder="Buscar escorts por nombre..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '0.875rem',
                outline: 'none',
                background: '#0e0d0dff',
                color: 'white',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { id: 'all', label: 'Tod@s', count: filteredEscorts.length },
              { id: 'verified', label: 'Verificad@s', count: filteredEscorts.filter(e => e.verified).length }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  background: selectedFilter === filter.id ? '#b6390cff' : '#0e0d0dff',
                  color: selectedFilter === filter.id ? 'white' : '#9ca3af',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
              >
                {filter.label}
                <span style={{
                  background: selectedFilter === filter.id ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de escorts */}
      <div style={{ 
        padding: isMobile ? '1rem' : '2rem' 
      }}>
        {loading.escorts ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            color: '#9CA3AF'
          }}>
            <Loader style={{ animation: 'spin 1s linear infinite' }} size={48} />
            <p style={{ marginTop: '1rem' }}>Cargando escorts...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {filteredEscorts.map((escort, index) => (
              <div
                key={escort.id}
                style={{
                  background: '#0e0d0dff',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = 'rgba(182, 57, 12, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '1.5rem 1.5rem 0'
                }}>
                  <div style={{ cursor: 'pointer', position: 'relative' }}>
                    <img 
                      src={escort.avatar} 
                      alt={escort.name} 
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #b6390cff'
                      }}
                    />
                    {escort.verified && (
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '24px',
                        height: '24px',
                        background: '#3b82f6',
                        border: '2px solid #0e0d0dff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Shield size={12} color="white" />
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveEscort(escort)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9CA3AF',
                      cursor: 'pointer',
                      padding: '0.5rem',
                      borderRadius: '6px'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
                
                <div style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                  <h3 style={{
                    color: 'white',
                    margin: '0 0 0.25rem 0',
                    fontSize: '1.125rem',
                    fontWeight: '600'
                  }}>
                    {escort.name}, {escort.age}
                  </h3>
                  <p style={{
                    color: '#9CA3AF',
                    margin: '0 0 0.75rem 0',
                    fontSize: '0.875rem'
                  }}>
                    {escort.location.split(', ')[1] || escort.location}
                  </p>
                  <p style={{
                    color: '#D1D5DB',
                    margin: '0 0 1rem 0',
                    fontSize: '0.875rem',
                    lineHeight: '1.4',
                    maxHeight: '40px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {escort.description}
                  </p>
                  
                  {/* Métricas rápidas */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    marginTop: '1rem',
                    fontSize: '0.75rem',
                    color: '#9CA3AF',
                    justifyContent: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Eye size={12} />
                      {formatNumber(escort.metrics.profileViews)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Star size={12} />
                      {escort.rating}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Crown size={12} />
                      {(escort.commissionRate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                <div style={{
                  padding: '1rem 1.5rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => handleViewMetrics(escort)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 1.25rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                    }}
                  >
                    <BarChart3 size={16} />
                    Ver Métricas
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading.escorts && filteredEscorts.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: '#9CA3AF'
          }}>
            <Users size={64} color="#6B7280" />
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#D1D5DB',
              margin: '1rem 0 0.5rem'
            }}>
              No se encontraron escorts
            </h3>
            <p style={{ color: '#6B7280', maxWidth: '400px' }}>
              {searchTerm ? 
                'Ajusta los filtros de búsqueda para ver más resultados' : 
                'No tienes escorts activas en tu agencia aún'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showMetricsModal && (
        <MetricsModal 
          escort={showMetricsModal} 
          onClose={() => setShowMetricsModal(null)} 
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal 
          modalData={showConfirmModal} 
          onClose={() => setShowConfirmModal(null)} 
        />
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AgencyEscortsManager;