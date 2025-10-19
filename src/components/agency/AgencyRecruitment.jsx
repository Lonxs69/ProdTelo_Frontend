import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Search, CheckCircle, XCircle, Clock, Calendar, X, Eye, Verified, AlertTriangle,
  Loader, Check, Info, Inbox, Users, Filter, Star, Phone, MapPin, Award, Shield, Lock,
  RefreshCw, Settings, AlertCircle, Trash2, Bug
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { agencyAPI, handleApiError } from '../../utils/api';
import './AgencyRecruitment.css';

const AgencyRecruitment = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('');
  const [showCandidateModal, setShowCandidateModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [showPerfilEscort, setShowPerfilEscort] = useState(null);
  const [showDebugModal, setShowDebugModal] = useState(false);
  
  // Sistema de notificaciones
  const [notification, setNotification] = useState(null);
  const [processingResults, setProcessingResults] = useState(null);
  
  // Estados del backend
  const [receivedCandidates, setReceivedCandidates] = useState([]);
  const [loading, setLoading] = useState({ received: false, action: false, cleanup: false });
  const [errors, setErrors] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);
  
  // Paginación
  const [pagination, setPagination] = useState({
    page: 1, limit: 20, total: 0, pages: 0, hasNext: false, hasPrev: false
  });

  // Configuración de debugging
  const [debugMode, setDebugMode] = useState(false);
  const [lastFetchInfo, setLastFetchInfo] = useState(null);

  // Verificar permisos
  if (!isAuthenticated || user?.userType !== 'AGENCY') {
    return (
      <div className="agency-recruitment-page">
        <div className="access-restricted">
          <AlertTriangle size={64} className="restricted-icon" />
          <h2 className="restricted-title">Acceso Restringido</h2>
          <p className="restricted-text">Esta página es solo para agencias autenticadas.</p>
        </div>
      </div>
    );
  }

  // Función para mostrar notificaciones
  const showNotification = useCallback((type, title, message, extraData = null) => {
    console.log('📢 Showing notification:', { type, title, message, extraData });
    setNotification({ type, title, message, extraData });
    setTimeout(() => setNotification(null), 8000);
  }, []);

  // Validar candidato antes de mostrar
  const validateCandidate = useCallback((candidate) => {
    const issues = [];
    
    if (!candidate.membershipId) issues.push('Missing membershipId');
    if (!candidate.escortId) issues.push('Missing escortId');
    if (!candidate.name) issues.push('Missing name');
    if (candidate.hasActiveMembership === true) issues.push('Has active membership elsewhere');
    if (candidate.status !== 'PENDING') issues.push(`Status is ${candidate.status}, not PENDING`);
    
    return {
      isValid: issues.length === 0,
      issues,
      candidate
    };
  }, []);

  // Obtener solicitudes recibidas desde el backend
  const fetchReceivedCandidates = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, received: true }));
      setErrors(prev => ({ ...prev, received: null }));
      
      console.log('🔍 === FETCHING RECEIVED CANDIDATES (ENHANCED) ===');
      
      const requestParams = {
        page: pagination.page,
        limit: pagination.limit,
        status: 'pending',
        search: searchTerm
      };
      
      const response = await agencyAPI.getAgencyEscorts(requestParams);
      
      if (response.success && response.data) {
        const candidatesData = response.data.escorts || [];
        
        const validatedCandidates = candidatesData.map(candidate => {
          const validation = validateCandidate(candidate);
          if (!validation.isValid && debugMode) {
            console.warn('⚠️ Invalid candidate filtered:', {
              name: candidate.name,
              issues: validation.issues,
              candidate
            });
          }
          return { ...candidate, ...validation };
        }).filter(candidate => candidate.isValid);
        
        setReceivedCandidates(validatedCandidates);
        setPagination(response.data.pagination || pagination);
        
        setLastFetchInfo({
          timestamp: new Date().toISOString(),
          requestParams,
          totalReceived: candidatesData.length,
          validAfterFiltering: validatedCandidates.length,
          filteredOut: candidatesData.length - validatedCandidates.length,
          pagination: response.data.pagination
        });
        
        if (candidatesData.length > validatedCandidates.length) {
          const filteredCount = candidatesData.length - validatedCandidates.length;
          console.warn(`⚠️ Filtered out ${filteredCount} invalid candidate(s)`);
          
          if (debugMode) {
            showNotification('warning', 'Candidatos Filtrados', 
              `Se filtraron ${filteredCount} candidato(s) que ya podrían estar en otras agencias.`);
          }
        }
        
      } else {
        throw new Error(response.message || 'Error obteniendo solicitudes recibidas');
      }
    } catch (error) {
      console.error('❌ === ERROR FETCHING RECEIVED CANDIDATES ===', error);
      setErrors(prev => ({ ...prev, received: handleApiError(error) }));
      setReceivedCandidates([]);
      
      if (error.status === 500) {
        showNotification('error', 'Error del Servidor', 
          'Hubo un problema al obtener las solicitudes. Inténtalo de nuevo en unos momentos.');
      } else if (error.status === 403) {
        showNotification('error', 'Sin Permisos', 
          'No tienes permisos para ver las solicitudes de esta agencia.');
      } else {
        showNotification('error', 'Error de Conexión', handleApiError(error));
      }
    } finally {
      setLoading(prev => ({ ...prev, received: false }));
    }
  }, [pagination.page, pagination.limit, searchTerm, user, validateCandidate, debugMode, showNotification]);

  // Aprobar candidata
  const handleApproveCandidate = async (candidate) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      
      console.log('📤 === APPROVING CANDIDATE ===');
      
      const validation = validateCandidate(candidate);
      if (!validation.isValid) {
        throw new Error(`No se puede aprobar: ${validation.issues.join(', ')}`);
      }
      
      if (!candidate.membershipId) {
        throw new Error('ID de membresía no encontrado en los datos del candidato');
      }
      
      const requestData = {
        action: 'approve',
        message: 'Bienvenida a nuestra agencia',
        commissionRate: 0.15
      };
      
      const response = await agencyAPI.manageMembershipRequest(
        candidate.membershipId,
        requestData
      );
      
      if (response.success) {
        setReceivedCandidates(prev => 
          prev.filter(c => c.membershipId !== candidate.membershipId)
        );
        
        const cancelledCount = response.data?.cancelledOtherRequests || 0;
        let notificationMessage = `${candidate.name} ha sido aprobada y añadida a tu agencia exitosamente.`;
        
        if (cancelledCount > 0) {
          notificationMessage += ` Se han cancelado automáticamente ${cancelledCount} solicitud(es) pendiente(s) que tenía con otras agencias.`;
        }
        
        showNotification(
          'success',
          '¡Candidata Aprobada!',
          notificationMessage,
          {
            candidateName: candidate.name,
            cancelledRequests: cancelledCount,
            newMember: true,
            escortId: candidate.escortId
          }
        );
        
        setTimeout(() => fetchReceivedCandidates(), 1500);
        
      } else {
        throw new Error(response.message || 'Error aprobando candidata');
      }
    } catch (error) {
      console.error('❌ === ERROR APPROVING CANDIDATE ===', error);
      
      if (error.status === 409) {
        if (error.message?.includes('ya fue aceptada') || error.message?.includes('ESCORT_ALREADY_ACCEPTED_ELSEWHERE')) {
          showNotification('warning', 'Candidata ya Aceptada', 
            `${candidate.name} ya fue aceptada por otra agencia mientras procesábamos su solicitud.`);
          
          setReceivedCandidates(prev => 
            prev.filter(c => c.membershipId !== candidate.membershipId)
          );
        } else {
          showNotification('warning', 'Conflicto', error.message);
        }
      } else if (error.status === 404) {
        showNotification('warning', 'Solicitud no Encontrada', 
          'Esta solicitud ya no existe o fue procesada por otra agencia.');
        
        setReceivedCandidates(prev => 
          prev.filter(c => c.membershipId !== candidate.membershipId)
        );
      } else {
        showNotification('error', 'Error al Aprobar', handleApiError(error));
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setShowCandidateModal(null);
      setShowConfirmModal(null);
    }
  };

  // Rechazar candidata
  const handleRejectCandidate = async (candidate) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      
      if (!candidate.membershipId) {
        throw new Error('ID de membresía no encontrado en los datos del candidato');
      }
      
      const response = await agencyAPI.manageMembershipRequest(
        candidate.membershipId,
        {
          action: 'reject',
          message: 'En este momento no podemos proceder con tu solicitud.'
        }
      );
      
      if (response.success) {
        setReceivedCandidates(prev => 
          prev.filter(c => c.membershipId !== candidate.membershipId)
        );
        
        showNotification(
          'info',
          'Solicitud Rechazada',
          `La solicitud de ${candidate.name} ha sido rechazada.`
        );
        
        setTimeout(() => fetchReceivedCandidates(), 1000);
      } else {
        throw new Error(response.message || 'Error rechazando candidata');
      }
    } catch (error) {
      console.error('❌ === ERROR REJECTING CANDIDATE ===');
      
      if (error.status === 404) {
        showNotification('warning', 'Solicitud no Encontrada', 
          'Esta solicitud ya no está disponible o ha sido procesada.');
        
        setReceivedCandidates(prev => 
          prev.filter(c => c.membershipId !== candidate.membershipId)
        );
      } else {
        showNotification('error', 'Error al Rechazar', handleApiError(error));
      }
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
      setShowCandidateModal(null);
      setShowConfirmModal(null);
    }
  };

  // Función de limpieza manual
  const handleCleanupObsoleteRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, cleanup: true }));
      
      showNotification('info', 'Refrescando Datos', 
        'Actualizando la lista de solicitudes...');
      
      await fetchReceivedCandidates();
      
      showNotification('success', 'Datos Actualizados', 
        'La lista ha sido actualizada.');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
      showNotification('error', 'Error en Limpieza', handleApiError(error));
    } finally {
      setLoading(prev => ({ ...prev, cleanup: false }));
    }
  };

  // Manejar búsqueda
  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  // Efectos
  useEffect(() => {
    if (isAuthenticated && user?.userType === 'AGENCY') {
      fetchReceivedCandidates();
    }
  }, [isAuthenticated, user, fetchReceivedCandidates]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isAuthenticated && user?.userType === 'AGENCY') {
        fetchReceivedCandidates();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [pagination.page, searchTerm, isAuthenticated, user?.userType, fetchReceivedCandidates]);

  // Filtrar candidatos localmente
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return receivedCandidates;
    
    const searchLower = searchTerm.toLowerCase();
    return receivedCandidates.filter(candidate => {
      return (
        candidate.name?.toLowerCase().includes(searchLower) ||
        candidate.location?.toLowerCase().includes(searchLower) ||
        candidate.description?.toLowerCase().includes(searchLower)
      );
    });
  }, [receivedCandidates, searchTerm]);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  // Componente de Notificación
  const NotificationModal = ({ notification, onClose }) => {
    const getIcon = () => {
      switch (notification.type) {
        case 'success': return <CheckCircle size={48} />;
        case 'error': return <XCircle size={48} />;
        case 'warning': return <AlertTriangle size={48} />;
        case 'info': default: return <Info size={48} />;
      }
    };

    return (
      <div className="notification-modal-overlay" onClick={onClose}>
        <motion.div 
          className={`notification-modal notification-${notification.type}`}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="notification-icon">
            {getIcon()}
          </div>
          
          <h3 className="notification-title">{notification.title}</h3>
          <p className="notification-message">{notification.message}</p>

          {notification.extraData?.cancelledRequests > 0 && (
            <div className="notification-extra-info">
              <div className="extra-info-header">
                <Lock size={16} />
                <span>Auto-cancelación de Solicitudes</span>
              </div>
              <p className="extra-info-text">
                {notification.extraData.candidateName} tenía {notification.extraData.cancelledRequests} solicitud(es) 
                pendiente(s) con otras agencias que fueron canceladas automáticamente. 
                Ahora es miembro exclusivo de tu agencia.
              </p>
            </div>
          )}
          
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="notification-btn"
          >
            <Check size={16} />
            Entendido
          </motion.button>
        </motion.div>
      </div>
    );
  };

  // Modal de Confirmación
  const ConfirmationModal = ({ candidate, action, onConfirm, onCancel }) => (
    <div className="recruitment-modal-overlay" onClick={onCancel}>
      <motion.div 
        className="confirmation-modal"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-content">
          <div className="confirmation-icon">
            {action === 'approve' ? (
              <CheckCircle size={48} className="icon-success" />
            ) : (
              <AlertTriangle size={48} className="icon-error" />
            )}
          </div>
          
          <h3 className="confirmation-title">
            {action === 'approve' ? 'Aprobar Candidata' : 'Rechazar Solicitud'}
          </h3>
          
          <p className="confirmation-text">
            {action === 'approve' 
              ? `¿Estás seguro de que quieres aprobar a ${candidate.name} y añadirla a tu agencia?` 
              : `¿Estás seguro de que quieres rechazar la solicitud de ${candidate.name}?`
            }
          </p>

          {action === 'approve' && (
            <div className="confirmation-warning">
              <div className="warning-header">
                <Info size={16} />
                <span>Importante</span>
              </div>
              <p className="warning-text">
                Al aprobar esta solicitud, cualquier otra solicitud pendiente que tenga esta escort 
                con otras agencias será cancelada automáticamente.
              </p>
            </div>
          )}
          
          <div className="candidate-preview">
            <img src={candidate.avatar} alt={candidate.name} className="candidate-preview-img" />
            <div>
              <span className="candidate-preview-name">
                {candidate.name}, {candidate.age}
              </span>
              <span className="candidate-preview-location">
                {candidate.location}
              </span>
            </div>
          </div>
          
          <div className="confirmation-actions">
            <motion.button
              onClick={onCancel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading.action}
              className="btn-cancel"
            >
              Cancelar
            </motion.button>
            
            <motion.button
              onClick={onConfirm}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading.action}
              className={`btn-confirm btn-${action}`}
            >
              {loading.action ? (
                <>
                  <Loader className="spinner" size={16} />
                  Procesando...
                </>
              ) : (
                <>
                  {action === 'approve' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {action === 'approve' ? 'Sí, Aprobar' : 'Sí, Rechazar'}
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // Modal de Candidato
  const CandidateModal = ({ candidate, onClose }) => (
    <div className="recruitment-modal-overlay" onClick={onClose}>
      <motion.div 
        className="recruitment-modal"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Solicitud de {candidate.name}</h2>
          <motion.button 
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="btn-close"
          >
            <X size={20} />
          </motion.button>
        </div>
        
        <div className="modal-body">
          <div className="candidate-info">
            <div className="candidate-avatar-section">
              <img src={candidate.avatar} alt={candidate.name} className="candidate-avatar" />
              {candidate.verified && (
                <span className="verified-badge">Verificada</span>
              )}
            </div>
            
            <div className="candidate-details">
              <h3 className="candidate-name">{candidate.name}, {candidate.age}</h3>
              <p className="candidate-location">{candidate.location}</p>
              <div className="candidate-meta">
                <strong>Idiomas:</strong> {candidate.languages?.join(', ') || 'No especificado'}
              </div>
              <div className="candidate-meta">
                <strong>Disponibilidad:</strong> {candidate.availability || 'No especificado'}
              </div>
              <div className="candidate-meta">
                <strong>Estado:</strong> {candidate.status}
              </div>
            </div>
          </div>
          
          <div className="candidate-section">
            <h4 className="section-title">Descripción del perfil:</h4>
            <div className="description-box">
              {candidate.description || 'Sin descripción disponible'}
            </div>
          </div>
          
          {candidate.services && candidate.services.length > 0 && (
            <div className="candidate-section">
              <h4 className="section-title">Servicios:</h4>
              <div className="services-list">
                {candidate.services.map((service, index) => (
                  <span key={index} className="service-tag">{service}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="application-date">
            <span>Fecha de solicitud:</span>
            <span className="date-value">{formatDate(candidate.applicationDate)}</span>
          </div>
          
          <div className="modal-actions">
            <motion.button
              onClick={() => setShowConfirmModal({ candidate, action: 'reject' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading.action}
              className="btn-reject-modal"
            >
              <XCircle size={16} />
              Rechazar
            </motion.button>
            
            <motion.button
              onClick={() => setShowConfirmModal({ candidate, action: 'approve' })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading.action}
              className="btn-approve-modal"
            >
              <CheckCircle size={16} />
              Aprobar y Añadir
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="agency-recruitment-page">
      

      {/* Controles */}
      <div className="controls-section">
        <div className="container">
          {/* Header con contador */}
          <div className="requests-counter">
            <div className="counter-card">
              <Inbox size={20} />
              <span className="counter-label">Solicitudes Pendientes</span>
              <span className="counter-badge">{filteredCandidates.length}</span>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar candidatas..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errors.received && (
        <div className="container">
          <div className="error-banner">
            <AlertTriangle size={16} />
            <span>{errors.received}</span>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="main-content">
        {loading.received ? (
          <div className="loading-state">
            <Loader className="spinner" size={48} />
            <p>Cargando solicitudes recibidas...</p>
          </div>
        ) : (
          <>
            {filteredCandidates.length > 0 ? (
              <div className="candidates-grid">
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.membershipId || candidate.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="candidate-card"
                  >
                    <div className="card-header">
                      <div className="avatar-section">
                        <motion.img 
                          src={candidate.avatar} 
                          alt={candidate.name}
                          onClick={() => setShowCandidateModal(candidate)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="avatar"
                        />
                        {candidate.verified && (
                          <div className="verified-icon">
                            <Verified size={12} />
                          </div>
                        )}
                      </div>
                      
                      <div className="date-section">
                        <div className="date-info">
                          <Calendar size={12} />
                          {formatDate(candidate.applicationDate)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-body">
                      <h3 className="card-name">{candidate.name}, {candidate.age}</h3>
                      <p className="card-location">
                        {candidate.location?.split(', ')[1] || candidate.location}
                      </p>
                      
                      <div className="card-description">
                        {candidate.description || 'Sin descripción disponible'}
                      </div>
                    </div>
                    
                    <div className="card-actions">
                      <motion.button
                        onClick={() => setShowConfirmModal({ candidate, action: 'reject' })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading.action}
                        className="btn-card-reject"
                      >
                        <XCircle size={14} />
                        Rechazar
                      </motion.button>
                      
                      <motion.button
                        onClick={() => setShowConfirmModal({ candidate, action: 'approve' })}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading.action}
                        className="btn-card-approve"
                      >
                        <CheckCircle size={14} />
                        Aprobar
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <UserPlus size={64} />
                <h3 className="empty-title">No hay solicitudes pendientes</h3>
                <p className="empty-text">
                  Cuando recibas nuevas solicitudes para unirse a tu agencia, aparecerán aquí.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modales */}
      <AnimatePresence>
        {showCandidateModal && (
          <CandidateModal 
            candidate={showCandidateModal} 
            onClose={() => setShowCandidateModal(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmationModal
            candidate={showConfirmModal.candidate}
            action={showConfirmModal.action}
            onConfirm={() => {
              if (showConfirmModal.action === 'approve') {
                handleApproveCandidate(showConfirmModal.candidate);
              } else {
                handleRejectCandidate(showConfirmModal.candidate);
              }
            }}
            onCancel={() => setShowConfirmModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <NotificationModal
            notification={notification}
            onClose={() => setNotification(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyRecruitment;