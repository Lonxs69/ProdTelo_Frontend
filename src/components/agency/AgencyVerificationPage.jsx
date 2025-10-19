import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Search, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  X,
  Verified,
  Clock,
  Star,
  Calendar,
  AlertTriangle,
  Loader,
  Crown,
  RefreshCw,
  CreditCard,
  Lock
} from 'lucide-react';

import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

import { useAuth } from '../../context/AuthContext';
import { agencyAPI, pointsAPI, handleApiError } from '../../utils/api';
import config from '../../config/config.js';
import './AgencyVerificationPage.css';

const stripePromise = loadStripe(config.stripe.publicKey);

// Modal de Pago Simulado
const SimulatedPaymentModal = ({ escort, onSuccess, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState('');

  const escortName = escort?.escort?.user?.firstName && escort?.escort?.user?.lastName
    ? `${escort.escort.user.firstName} ${escort.escort.user.lastName}`
    : escort?.name || 'Escort';

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace('/', '').length <= 4) {
      setExpiry(formatted);
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Número de tarjeta inválido');
      return false;
    }
    if (expiry.replace('/', '').length !== 4) {
      setError('Fecha de expiración inválida');
      return false;
    }
    if (cvv.length < 3) {
      setError('CVV inválido');
      return false;
    }
    if (cardName.trim().length < 3) {
      setError('Nombre del titular requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');

    if (!validateCard()) {
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      const mockTransactionId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      onSuccess({
        escortId: escort.escort?.id || escort.escortId,
        escortName: escortName,
        transactionId: mockTransactionId,
        amountCharged: '$1.00',
        paymentConfirmed: true,
        pointsAdded: 0,
        newBalance: 0,
        verificationData: {
          pricingId: 'verification_special_1',
          verificationNotes: `Verificación pagada (SIMULADO) - $1.00 cobrado. Transaction: ${mockTransactionId}`
        },
        pricingId: 'verification_special_1',
        stripePaymentId: mockTransactionId,
        isSimulated: true
      });
      
      setProcessing(false);
    }, 2000);
  };

  return (
    <motion.div 
      className="verification-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div 
        className="verification-modal-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="verification-modal-header">
          <button onClick={onCancel} className="verification-modal-close-btn">
            <X size={16} />
          </button>
          
          <div className="verification-modal-icon">
            <CreditCard size={20} color="#b6390cff" />
          </div>
          <div className="verification-modal-title-section">
            <h2 className="verification-modal-title">Pago Simulado</h2>
            <p className="verification-modal-subtitle">Verificación de Escort</p>
          </div>
        </div>

        <div className="verification-modal-content">
          <div className="verification-escort-summary">
            <img 
              src={escort?.escort?.user?.avatar || '/default-avatar.png'} 
              alt={escortName}
              className="verification-escort-summary-avatar"
            />
            <div className="verification-escort-summary-info">
              <h3 className="verification-escort-summary-name">{escortName}</h3>
              <p className="verification-escort-summary-label">Verificación completa</p>
            </div>
            <div className="verification-escort-summary-price">
              <div className="verification-price-amount">$1.00</div>
              <div className="verification-price-currency">USD</div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} color="#f59e0b" />
            <span style={{ fontSize: '13px', color: '#92400e' }}>
              Modo de prueba - No se realizará ningún cargo real
            </span>
          </div>

          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#f3f4f6',
                marginBottom: '6px'
              }}>
                Nombre del titular
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Juan Pérez"
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#f3f4f6',
                marginBottom: '6px'
              }}>
                Número de tarjeta
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  style={{
                    width: '100%',
                    padding: '12px',
                    paddingRight: '40px',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <CreditCard 
                  size={20} 
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9CA3AF'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#f3f4f6',
                  marginBottom: '6px'
                }}>
                  Fecha de expiración
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#f3f4f6',
                  marginBottom: '6px'
                }}>
                  CVV
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '40px',
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <Lock 
                    size={16} 
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#9CA3AF'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="verification-benefits-box" style={{ marginBottom: '20px' }}>
              <div className="verification-benefits-header">
                <Shield size={14} color="#b6390cff" />
                <span className="verification-benefits-title">Incluye:</span>
              </div>
              <ul className="verification-benefits-list">
                <li>Badge verificado oficial</li>
                <li>Mayor confianza de clientes</li>
                <li>Prioridad en búsquedas</li>
                <li>Certificado digital</li>
              </ul>
            </div>

            {error && (
              <div className="verification-payment-error" style={{ marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
                <button 
                  type="button"
                  onClick={() => setError('')} 
                  className="verification-modal-close-btn"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="verification-payment-actions">
              <motion.button 
                type="button"
                onClick={onCancel}
                className="verification-payment-btn verification-payment-btn-cancel"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={processing}
              >
                Cancelar
              </motion.button>
              <motion.button 
                type="button"
                onClick={handleSubmit}
                disabled={processing}
                className="verification-payment-btn verification-payment-btn-submit"
                whileHover={{ scale: processing ? 1 : 1.02 }}
                whileTap={{ scale: processing ? 1 : 0.98 }}
              >
                {processing && <Loader size={16} className="spin" />}
                {processing ? 'Procesando...' : 'Pagar $1.00'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AgencyVerificationPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('pending');
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [showPerfilEscort, setShowPerfilEscort] = useState(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  const [escorts, setEscorts] = useState([]);
  const [verificationPricing, setVerificationPricing] = useState([]);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [loading, setLoading] = useState({
    escorts: false,
    pricing: false,
    verification: false
  });
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthenticated || user?.userType !== 'AGENCY') {
    return (
      <div className="verification-page">
        <div className="verification-loading-container">
          <AlertTriangle size={64} color="#ef4444" />
          <h2 className="verification-empty-title">Acceso Restringido</h2>
          <p className="verification-empty-description">Esta página es solo para agencias autenticadas.</p>
        </div>
      </div>
    );
  }

  const setLoadingState = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  const setError = useCallback((key, error) => {
    setErrors(prev => ({ 
      ...prev, 
      [key]: error?.message || error || 'Error desconocido' 
    }));
  }, []);

  const clearError = useCallback((key) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const fetchActiveEscorts = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingState('escorts', true);
      clearError('escorts');
      
      const activeResponse = await agencyAPI.getAgencyEscorts({
        page: 1,
        limit: 50,
        status: 'active',
        search: searchTerm
      });
      
      if (activeResponse.success && activeResponse.data?.escorts) {
        setEscorts(activeResponse.data.escorts);
      } else {
        setEscorts([]);
      }
      
    } catch (error) {
      setError('escorts', handleApiError(error));
      setEscorts([]);
    } finally {
      setLoadingState('escorts', false);
    }
  }, [isAuthenticated, searchTerm, setLoadingState, clearError, setError]);

  const fetchVerificationPricing = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoadingState('pricing', true);
      clearError('pricing');
      
      const hardcodedPricing = [
        {
          id: 'verification_special_1',
          name: 'Verificación Especial',
          cost: 1.00,
          description: 'Verificación completa de escort por solo $1.00',
          features: ['Badge verificado', 'Mayor confianza', 'Prioridad en búsquedas', 'Certificado digital'],
          isActive: true,
          isSpecial: true
        }
      ];
      
      setVerificationPricing(hardcodedPricing);
      setSelectedPricing(hardcodedPricing[0]);
      
    } catch (error) {
      setError('pricing', 'Error configurando precios');
    } finally {
      setLoadingState('pricing', false);
    }
  }, [isAuthenticated, setLoadingState, clearError, setError]);

  const handleVerifyEscort = async (escortData) => {
    try {
      setLoadingState('verification', true);
      setVerificationInProgress(true);
      
      const verificationData = {
        pricingId: selectedPricing.id,
        verificationNotes: escortData.isSimulated 
          ? `Verificación SIMULADA - ${escortData.amountCharged}. Transaction: ${escortData.transactionId}`
          : `Verificación pagada - ${escortData.amountCharged} cobrado. Transaction: ${escortData.transactionId}`
      };
      
      const response = await agencyAPI.verifyEscort(escortData.escortId, verificationData);
      
      if (response.success) {
        setEscorts(prev => prev.map(e => {
          const escortId = e.escort?.id || e.escortId;
          
          if (escortId === escortData.escortId) {
            return {
              ...e,
              escort: {
                ...e.escort,
                isVerified: true,
                verifiedAt: new Date().toISOString(),
                verificationData: response.data
              }
            };
          }
          return e;
        }));
        
        setSuccessMessage(
          `¡Verificación completada! ${escortData.escortName} ha sido verificado exitosamente.${escortData.isSimulated ? ' (Modo simulado)' : ''}`
        );
        setShowSuccessModal(true);
      } else {
        throw new Error(response.message || 'Error en la verificación');
      }
      
    } catch (error) {
      if (escortData.paymentConfirmed) {
        const errorMessage = `El pago de ${escortData.amountCharged} fue procesado exitosamente, pero hubo un error en la verificación. Por favor contacta soporte con el ID: ${escortData.transactionId}`;
        alert(errorMessage);
      } else {
        alert(`Error: ${handleApiError(error)}`);
      }
    } finally {
      setLoadingState('verification', false);
      setVerificationInProgress(false);
      setShowPaymentModal(null);
    }
  };

  const handleStartVerification = (escort) => {
    if (!selectedPricing || !selectedPricing.id) {
      alert('Error: No se pudo cargar la información de precios. Por favor, recarga la página.');
      return;
    }
    
    setShowPaymentModal(escort);
  };

  const handleViewProfile = (escort) => {
    setShowPerfilEscort(escort);
  };

  const handlePaymentSuccess = async (result) => {
    setShowPaymentModal(null);
    await handleVerifyEscort(result);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(null);
  };

  const handleSearch = useCallback((searchValue) => {
    setSearchTerm(searchValue);
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'AGENCY') {
      fetchVerificationPricing();
      fetchActiveEscorts();
    }
  }, [isAuthenticated, user, fetchVerificationPricing, fetchActiveEscorts]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isAuthenticated && user?.userType === 'AGENCY') {
        fetchActiveEscorts();
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isAuthenticated, user?.userType, fetchActiveEscorts]);

  const filteredEscorts = escorts.filter(escort => {
    const escortData = escort.escort || {};
    const userData = escortData.user || {};
    const name = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : userData.firstName || userData.lastName || 'Sin nombre';
    
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'pending') {
      return matchesSearch && !escortData.isVerified;
    }
    if (selectedFilter === 'verified') {
      return matchesSearch && escortData.isVerified;
    }
    
    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const SuccessModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowSuccessModal(false)}
      className="verification-modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="verification-success-modal"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="verification-success-icon"
        >
          <Shield size={40} color="white" />
        </motion.div>
        
        <h2 className="verification-success-title">¡Verificación Completada!</h2>
        <p className="verification-success-message">{successMessage}</p>
        
        <div className="verification-success-details">
          <CheckCircle size={20} color="#22c55e" />
          <div>
            <div className="verification-success-amount">$1.00 Cobrado</div>
            <div className="verification-success-label">Verificación en BD</div>
          </div>
        </div>
        
        <motion.button
          onClick={() => setShowSuccessModal(false)}
          className="verification-success-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continuar
        </motion.button>
      </motion.div>
    </motion.div>
  );

  const PerfilEscort = ({ escort, isOpen, onClose }) => {
    if (!isOpen) return null;

    const escortData = escort?.escort || {};
    const userData = escortData.user || {};
    const name = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : userData.firstName || userData.lastName || 'Sin nombre';

    return (
      <motion.div 
        className="verification-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="verification-modal-container"
        >
          <div className="verification-profile-image-container">
            <img 
              src={userData.avatar || '/default-avatar.png'} 
              alt={name}
              className="verification-profile-image"
            />
            <button onClick={onClose} className="verification-modal-close-btn">
              <X size={16} />
            </button>
            {escortData.isVerified && (
              <div className="verification-profile-verified-badge">
                <Verified size={12} />
                Verificada
              </div>
            )}
          </div>
          
          <div className="verification-profile-details">
            <h2 className="verification-profile-name">{name}</h2>
            
            <div className="verification-profile-date">
              <Calendar size={14} />
              <span>Miembro desde {formatDate(escort.joinedAt || escort.createdAt)}</span>
            </div>
            
            <div className="verification-profile-stats">
              <div className="verification-profile-stat">
                <Star size={14} color="#fbbf24" />
                <span>{escortData.rating || 4.5}/5.0</span>
              </div>
              <div className="verification-profile-stat">
                <Crown size={14} color="#ce410eff" />
                <span>{escort.role || 'MEMBER'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="verification-page">
      <div className="verification-hero">
        <div className="verification-hero-content">
          <motion.div 
            className="verification-balance-card"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="verification-balance-main">
              <div className="verification-balance-info">
                <div className="verification-icon-large">
                  <Shield size={28} />
                </div>
                <div className="verification-balance-details">
                  <h1 className="verification-balance-title">Verificaciones</h1>
                  <p className="verification-balance-subtitle">
                    Verifica tus escorts para generar mas confianza y atraer más clientes.
                  </p>
                  <div className="verification-info-badge">
                    <span className="verification-info-text">
                      {filteredEscorts.length} escorts disponibles
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {(errors.escorts || errors.pricing || errors.verification) && (
        <div className="verification-error-banner">
          <div className="verification-error-content">
            <AlertTriangle size={16} />
            <span className="verification-error-text">
              {errors.escorts || errors.pricing || errors.verification}
            </span>
          </div>
        </div>
      )}

      <div className="verification-controls">
        <div className="verification-search-filter-container">
          <div className="verification-search-wrapper">
            <Search className="verification-search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar escorts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="verification-search-input"
            />
          </div>
          
          <div className="verification-filter-tabs">
            {[
              { id: 'pending', label: 'Pendientes' },
              { id: 'verified', label: 'Verificad@s' }
            ].map((filter) => (
              <motion.button
                key={filter.id}
                className={`verification-filter-tab ${selectedFilter === filter.id ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="verification-content">
        {loading.escorts ? (
          <div className="verification-loading-container">
            <Loader className="verification-loading-spinner spin" size={48} />
            <p className="verification-loading-text">Cargando escorts...</p>
          </div>
        ) : (
          <div className="verification-grid">
            {filteredEscorts.map((escort, index) => {
              const escortData = escort.escort || {};
              const userData = escortData.user || {};
              const name = userData.firstName && userData.lastName 
                ? `${userData.firstName} ${userData.lastName}` 
                : userData.firstName || userData.lastName || 'Sin nombre';

              return (
                <motion.div
                  key={escort.membershipId || escort.id || index}
                  className="verification-escort-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className="verification-escort-avatar-section"
                    onClick={() => handleViewProfile(escort)}
                  >
                    <img 
                      src={userData.avatar || '/default-avatar.png'} 
                      alt={name} 
                      className="verification-escort-avatar" 
                    />
                    {escortData.isVerified && (
                      <div className="verification-verified-badge">
                        <Verified size={12} />
                      </div>
                    )}
                    <div className="verification-online-indicator" />
                  </div>
                  
                  <h3 className="verification-escort-name">{name}</h3>
                  <p className="verification-escort-location">Miembro de la agencia</p>
                  
                  
                  
                  {escortData.isVerified ? (
                    <div className="verification-verified-status">
                      <CheckCircle size={16} />
                      <span>Verificada {escortData.verifiedAt ? `el ${formatDate(escortData.verifiedAt)}` : ''}</span>
                    </div>
                  ) : (
                    <div className="verification-actions">
                      <motion.button
                        className="verification-btn-primary"
                        onClick={() => handleStartVerification(escort)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading.verification || loading.pricing}
                      >
                        <Shield size={14} />
                        {loading.pricing ? 'Cargando...' : 'Verificar '}
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
        
        {!loading.escorts && filteredEscorts.length === 0 && (
          <div className="verification-empty-state">
            <Shield className="verification-empty-icon" size={64} color="#6B7280" />
            <h3 className="verification-empty-title">No se encontraron escorts</h3>
          </div>
        )}
      </div>

      <AnimatePresence>
        {verificationInProgress && (
          <motion.div
            className="verification-loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="verification-loading-box">
              <div className="verification-loading-spinner-box" />
              <h3 className="verification-loading-title">Procesando verificación...</h3>
              <p className="verification-loading-description">Verificando pago y guardando</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPaymentModal && (
          <SimulatedPaymentModal
            escort={showPaymentModal}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && <SuccessModal />}
      </AnimatePresence>

      <AnimatePresence>
        {showPerfilEscort && (
          <PerfilEscort 
            escort={showPerfilEscort} 
            isOpen={!!showPerfilEscort}
            onClose={() => setShowPerfilEscort(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyVerificationPage;