import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PostsManager.css';
import { Country, State, City } from 'country-state-city';

import {
  Plus, ImageIcon, Heart, Edit3, Trash2, Loader, Phone, Star, X, Save, AlertTriangle, MapPin, User, Camera, CheckCircle, Rocket, Zap, Crown, Globe, CreditCard
} from 'lucide-react';

import { postsAPI, handleApiError } from '../../utils/api.js';

const VALID_SEXO_VALUES = ['Hombre', 'Mujer', 'Trans', 'Otro'];

const PostsManager = ({ user, onError }) => {
  const [modals, setModals] = useState({ 
    post: false, 
    delete: false,
    success: false,
    promotion: false,
    payment: false  // ✅ NUEVO
  });

  const [editingPost, setEditingPost] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [promotingPost, setPromotingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [postLimitsInfo, setPostLimitsInfo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentData, setPaymentData] = useState(null); // ✅ NUEVO

  useEffect(() => { 
    if (user?.userType === 'AGENCY' || user?.userType === 'ESCORT') {
      loadUserPosts(); 
    }
  }, [user]);

  const loadUserPosts = async () => {
    try {
      setLoadingPosts(true);
      onError(null);
      if (!postsAPI?.getMyPostsWithOptions) throw new Error('API de posts no está disponible');
      
      const response = await postsAPI.getMyPostsWithOptions({ status: 'active', page: 1, limit: 50, sortBy: 'recent' });
      if (response.success && response.data) {
        const posts = response.data.posts || [];
        setUserPosts(posts);
      } else setUserPosts([]);

      if (user?.userType === 'AGENCY') {
        try {
          const limitsResponse = await postsAPI.checkPostLimits();
          if (limitsResponse.success) {
            setPostLimitsInfo(limitsResponse.data);
          }
        } catch (error) {
          console.error('Error loading post limits:', error);
        }
      }

    } catch (error) {
      console.error('Error cargando posts:', error);
      onError('Error cargando tus anuncios: ' + handleApiError(error));
      setUserPosts([]);
    } finally { setLoadingPosts(false); }
  };

  const toggleModal = (type, state, data = null) => {
    console.log('🔄 toggleModal:', { type, state, hasData: !!data });
    
    setModals(prev => ({ ...prev, [type]: state }));
    
    if (type === 'post') {
      setEditingPost(state ? data : null);
    }
    
    if (type === 'delete') {
      setDeletingPost(state ? data : null);
    }
    
    if (type === 'promotion') {
      console.log('🚀 Abriendo modal promoción para:', data?.title);
      setPromotingPost(state ? data : null);
      setSelectedPlan(null);
      setLoading(false);
    }

    if (type === 'payment') {
      setLoading(false);
    }
    
    console.log('✅ Modal actualizado');
  };

  const handleSavePost = async (postFormData) => {
    try {
      setLoading(true);
      onError(null);
      
      if (!postsAPI) throw new Error('API de posts no está disponible');
      if (!(postFormData instanceof FormData)) throw new Error('Los datos no son FormData válido');

      if (editingPost) {
        const response = await postsAPI.updatePost(editingPost.id, postFormData);
        if (response?.success) {
          await loadUserPosts();
          toggleModal('post', false);
          setSuccessMessage(`¡Perfecto! Tu anuncio "${response.data.title}" ha sido actualizado exitosamente.`);
          toggleModal('success', true);
        } else {
          throw new Error(response?.message || 'Error actualizando el post');
        }
      } else {
        const response = await postsAPI.createPost(postFormData);
        if (response?.success) {
          await loadUserPosts();
          toggleModal('post', false);
          setSuccessMessage(`¡Perfecto! Tu anuncio "${response.data.title}" ha sido creado y publicado exitosamente.`);
          toggleModal('success', true);
        } else {
          throw new Error(response?.message || 'Error creando el post');
        }
      }

    } catch (error) {
      console.error('Error guardando post:', error);
      onError(handleApiError ? handleApiError(error) : error.message || 'Error guardando el anuncio');
    } finally {
      setLoading(false);
    }
  };

  const handlePromotePost = (post) => {
    console.log('🚀 handlePromotePost:', post?.id, post?.title);
    
    setLoading(false);
    setSelectedPlan(null);
    
    toggleModal('promotion', true, post);
  };

  const handleSelectPlan = (plan) => {
    console.log('📋 Plan seleccionado:', plan);
    setSelectedPlan(plan);
  };

  const handleContinueToPayment = () => {
    if (!selectedPlan || !promotingPost) {
      console.error('❌ No hay plan o post seleccionado');
      return;
    }

    const planPrices = {
      BASIC: 5.00,
      PREMIUM: 10.00
    };

    const planNames = {
      BASIC: 'Plan Básico',
      PREMIUM: 'Plan Premium'
    };

    setPaymentData({
      postId: promotingPost.id,
      postTitle: promotingPost.title,
      plan: selectedPlan,
      planName: planNames[selectedPlan],
      amount: planPrices[selectedPlan]
    });

    toggleModal('promotion', false);
    toggleModal('payment', true);
  };

  const handleConfirmPayment = async () => {
    if (!paymentData) {
      console.error('❌ No hay datos de pago');
      return;
    }

    try {
      setLoading(true);
      onError(null);

      console.log('💳 Procesando pago:', paymentData);

      // 1. Crear pago simulado
      const paymentResponse = await postsAPI.promotePost(paymentData.postId, paymentData.plan);
      
      console.log('📦 Respuesta de pago:', paymentResponse);

      if (!paymentResponse?.success) {
        throw new Error(paymentResponse?.message || 'Error procesando el pago');
      }

      const paymentId = paymentResponse.data.paymentId;
      console.log('✅ PaymentId obtenido:', paymentId);

      // 2. Confirmar promoción y actualizar plan
      console.log('🔄 Confirmando promoción...');

      const confirmResponse = await postsAPI.confirmPromotePost(
        paymentId,
        paymentData.postId,
        paymentData.plan
      );

      console.log('📦 Respuesta de confirmación:', confirmResponse);

      if (!confirmResponse?.success) {
        throw new Error(confirmResponse?.message || 'Error confirmando la promoción');
      }

      console.log('✅ Post actualizado:', confirmResponse.data.post);

      // 3. Actualizar lista de posts
      await loadUserPosts();

      // 4. Cerrar modal de pago
      toggleModal('payment', false);
      setPaymentData(null);

      // 5. Mostrar mensaje de éxito
      setSuccessMessage(
        `¡Perfecto! Tu anuncio "${paymentData.postTitle}" ha sido promocionado al ${paymentData.planName} exitosamente. El pago de $${paymentData.amount.toFixed(2)} ha sido procesado.`
      );
      toggleModal('success', true);

    } catch (error) {
      console.error('❌ Error en pago:', error);
      onError(handleApiError ? handleApiError(error) : error.message || 'Error procesando el pago');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletePost = async () => {
    if (!deletingPost) return;
    
    try {
      setLoading(true);
      onError(null);
      
      if (!postsAPI?.deletePost) {
        throw new Error('API de eliminación no está disponible');
      }
      
      const response = await postsAPI.deletePost(deletingPost.id);
      
      if (response?.success) {
        await loadUserPosts();
        toggleModal('delete', false);
        onError(null);
      } else {
        const errorMsg = response?.message || response?.error || 'Error eliminando el post';
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      console.error('Error eliminando post:', error);
      const errorMessage = handleApiError ? handleApiError(error) : error.message;
      onError(`Error eliminando el anuncio: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPosts) {
    return (
      <div className="posts-loading-container">
        <div className="posts-loading-content">
          <Loader className="animate-spin" size={32} color="#ff6b35" />
          <p className="posts-loading-text">Cargando anuncios...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="posts-manager-container">
        <div className="posts-grid">
          <CreatePostCard onOpen={() => toggleModal('post', true)} userPosts={userPosts} user={user} postLimitsInfo={postLimitsInfo} />
          {userPosts.map((post, index) => (
            <PostCard 
              key={post.id} 
              post={post} 
              index={index}
              onEdit={() => toggleModal('post', true, post)}
              onPromote={() => handlePromotePost(post)}
              onDelete={() => toggleModal('delete', true, post)}
              loading={loading} 
            />
          ))}
        </div>
      </div>

      {modals.post && createPortal(
        <ModalOverlay onClose={() => toggleModal('post', false)}>
          <PostFormModal editingPost={editingPost} onSave={handleSavePost} onClose={() => toggleModal('post', false)} loading={loading} user={user} />
        </ModalOverlay>, document.body
      )}
      
      {modals.delete && createPortal(
        <ModalOverlay onClose={() => toggleModal('delete', false)}>
          <DeleteModal post={deletingPost} onConfirm={confirmDeletePost} onCancel={() => toggleModal('delete', false)} loading={loading} />
        </ModalOverlay>, document.body
      )}

      {modals.promotion && promotingPost && createPortal(
        <ModalOverlay onClose={() => toggleModal('promotion', false)}>
          <PromotionModal 
            post={promotingPost} 
            selectedPlan={selectedPlan}
            onSelectPlan={handleSelectPlan}
            onContinue={handleContinueToPayment}
            onClose={() => toggleModal('promotion', false)} 
            loading={loading} 
          />
        </ModalOverlay>, document.body
      )}

      {modals.payment && paymentData && createPortal(
        <ModalOverlay onClose={() => toggleModal('payment', false)}>
          <PaymentModal 
            paymentData={paymentData}
            onConfirm={handleConfirmPayment}
            onCancel={() => {
              toggleModal('payment', false);
              setPaymentData(null);
            }}
            loading={loading}
          />
        </ModalOverlay>, document.body
      )}

      {modals.success && createPortal(
        <ModalOverlay onClose={() => toggleModal('success', false)}>
          <ModalContainer maxWidth="small" onClick={(e) => e.stopPropagation()}>
            <div className="success-modal-content">
              <div className="success-icon-circle">
                <CheckCircle size={50} color="white" />
              </div>
              
              <h2 className="success-title">
                ¡Perfecto!
              </h2>
              <p className="success-message">
                {successMessage}
              </p>
              
              <button
                onClick={() => toggleModal('success', false)}
                className="success-btn"
              >
                ¡Continuar!
              </button>
            </div>
          </ModalContainer>
        </ModalOverlay>, document.body
      )}
    </>
  );
};

const ModalOverlay = ({ children, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      {children}
    </div>
  );
};

const ModalContainer = ({ children, maxWidth = 'medium', onClick }) => {
  const sizeClass = maxWidth === 'small' ? 'small' : maxWidth === 'medium' ? 'medium' : maxWidth === 'mobile' ? 'mobile' : 'large';
  return (
    <div className={`modal-container ${sizeClass}`} onClick={onClick}>
      {children}
    </div>
  );
};

const CreatePostCard = ({ onOpen, userPosts, user, postLimitsInfo }) => (
  <div className="create-post-card" onClick={onOpen}>
    <div className="create-post-icon">
      <Plus size={32} style={{ color: '#ff6b35' }} />
    </div>
    <h3 className="create-post-title">Crear Nuevo Anuncio</h3>
    <p className="create-post-description">Publica anuncios de tus servicios</p>
    {user?.userType === 'AGENCY' && (
      <div className="create-post-info">
        <div className="create-post-badge">
          {userPosts.length} anuncios activos
        </div>
      </div>
    )}
  </div>
);

const PostCard = ({ post, index, onEdit, onPromote, onDelete, loading }) => {
  const hasActivePlan = post.plan && post.plan !== 'FREE';
  
  return (
    <div className="post-card">
      <div className="post-card-image-container">
        <img 
          src={post.images?.[0] || 'https://via.placeholder.com/400x260?text=Sin+Imagen'} 
          alt="Post" 
          className="post-card-image"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400x260?text=Sin+Imagen'; }} 
        />
        <div className="post-card-likes">
          <div className="post-likes-badge">
            <Heart size={12} style={{ color: '#ff6b35' }} />
            {post.likesCount || 0}
          </div>
        </div>
        {hasActivePlan && (
          <div className="post-plan-badge" data-plan={post.plan}>
            {post.plan === 'BASIC' ? '⚡ Básico' : '👑 Premium'}
          </div>
        )}
      </div>
      <div className="post-card-content">
        <h4 className="post-card-title">
          {post.title}
        </h4>
        <p className="post-card-description">
          {post.description}
        </p>
        
        {(post.age || post.sexo || post.location) && (
          <div className="post-card-meta">
            {post.age && (
              <div className="post-meta-item">
                <User size={12} style={{ color: '#ff6b35' }} />
                <span className="post-meta-text">{post.age} años</span>
              </div>
            )}
            {post.sexo && (
              <div className="post-meta-item">
                <User size={12} style={{ color: '#ff6b35' }} />
                <span className="post-meta-text">{post.sexo}</span>
              </div>
            )}
            {post.location && (
              <div className="post-meta-item">
                <MapPin size={12} style={{ color: '#ff6b35' }} />
                <span className="post-meta-text">{post.location}</span>
              </div>
            )}
          </div>
        )}

        {post.phone && (
          <div className="post-card-phone">
            <Phone size={14} style={{ color: '#ff6b35' }} />
            <span className="post-phone-text">{post.phone}</span>
          </div>
        )}

        {post.services && Array.isArray(post.services) && post.services.length > 0 && (
          <div className="post-card-services">
            <div className="post-services-list">
              {post.services.slice(0, 3).map((service, idx) => (
                <span key={idx} className="post-service-tag">
                  {service}
                </span>
              ))}
              {post.services.length > 3 && (
                <span className="post-services-more">
                  +{post.services.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        <div className="post-card-actions">
          <button 
            onClick={onEdit} 
            disabled={loading}
            className="post-action-btn-edit"
          >
            <Edit3 size={14} />Editar
          </button>
          <button 
            onClick={onPromote} 
            disabled={loading || hasActivePlan}
            className="post-action-btn promote"
            title={hasActivePlan ? `Ya tiene plan ${post.plan}` : 'Promocionar anuncio'}
          >
            <Rocket size={14} />
            {hasActivePlan ? 'Promocionado' : 'Promocionar'}
          </button>
          <button 
            onClick={onDelete} 
            disabled={loading}
            className="post-action-btn delete"
          >
            <Trash2 size={14} />Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const PromotionModal = ({ post, selectedPlan, onSelectPlan, onContinue, onClose, loading }) => {
  const isMobile = window.innerWidth < 768;
  
  const plans = [
    {
      id: 'BASIC',
      name: 'Plan Básico',
      price: 5.00,
      duration: '7 días',
      icon: Zap,
      color: '#3b82f6',
      features: [
        'Aparece en sección destacados',
        'Mayor visibilidad por 7 días',
        'Badge de "Destacado"',
        'Prioridad en búsquedas'
      ]
    },
    {
      id: 'PREMIUM',
      name: 'Plan Premium',
      price: 10.00,
      duration: '14 días',
      icon: Crown,
      color: '#fbbf24',
      features: [
        'Aparece primero en resultados',
        'Máxima visibilidad por 14 días',
        'Badge de "Premium"',
        'Top en todas las búsquedas',
        'Destacado en página principal'
      ],
      popular: true
    }
  ];

  return (
    <ModalContainer maxWidth={isMobile ? "mobile" : "medium"} onClick={(e) => e.stopPropagation()}>
      <div className={`modal-header orange ${isMobile ? 'mobile' : ''}`}>
        <div className="modal-header-left">
          <div className="modal-header-icon">
            <Rocket size={18} style={{ color: '#ff6b35' }} />
          </div>
          <h2 className={`modal-header-title ${isMobile ? 'mobile' : ''}`}>
            Promocionar Anuncio
          </h2>
        </div>
        <button 
          onClick={onClose} 
          disabled={loading} 
          className="modal-close-btn"
        >
          ×
        </button>
      </div>

      <div className={`promotion-modal-content ${isMobile ? 'mobile' : ''}`}>
        <div className="promotion-post-preview">
          <img 
            src={post?.images?.[0] || 'https://via.placeholder.com/80?text=Post'} 
            alt="Post preview"
            className="promotion-post-image"
          />
          <div className="promotion-post-info">
            <h4 className="promotion-post-title">{post?.title}</h4>
            <p className="promotion-post-description">{post?.description}</p>
          </div>
        </div>

        <div className="promotion-plans-grid">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <div 
                key={plan.id}
                className={`promotion-plan-card ${isSelected ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                onClick={() => onSelectPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="plan-popular-badge">
                    Más Popular
                  </div>
                )}
                
                <div className="plan-header">
                  <div className="plan-icon" style={{ background: `${plan.color}20`, color: plan.color }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="plan-name">{plan.name}</h3>
                </div>

                <div className="plan-price">
                  <span className="price-amount">${plan.price}</span>
                  <span className="price-duration">/ {plan.duration}</span>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="plan-feature">
                      <CheckCircle size={16} style={{ color: plan.color }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`plan-select-btn ${isSelected ? 'selected' : ''}`}
                  style={{ 
                    background: isSelected ? plan.color : 'transparent',
                    borderColor: plan.color,
                    color: isSelected ? 'white' : plan.color
                  }}
                >
                  {isSelected ? 'Seleccionado' : 'Seleccionar'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="promotion-actions">
          <button 
            onClick={onClose}
            disabled={loading}
            className="promotion-btn promotion-btn-cancel"
          >
            Cancelar
          </button>
          <button 
            onClick={onContinue}
            disabled={!selectedPlan || loading}
            className="promotion-btn promotion-btn-confirm"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard size={16} />
                Continuar al Pago
              </>
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

const PaymentModal = ({ paymentData, onConfirm, onCancel, loading }) => {
  const isMobile = window.innerWidth < 768;

  return (
    <ModalContainer maxWidth={isMobile ? "mobile" : "small"} onClick={(e) => e.stopPropagation()}>
      <div className={`modal-header orange ${isMobile ? 'mobile' : ''}`}>
        <div className="modal-header-left">
          <div className="modal-header-icon">
            <CreditCard size={18} style={{ color: '#ff6b35' }} />
          </div>
          <h2 className={`modal-header-title ${isMobile ? 'mobile' : ''}`}>
            Confirmar Pago
          </h2>
        </div>
        <button 
          onClick={onCancel} 
          disabled={loading} 
          className="modal-close-btn"
        >
          ×
        </button>
      </div>

      <div className={`payment-modal-content ${isMobile ? 'mobile' : ''}`}>
        <div className="payment-summary">
          <div className="payment-summary-header">
            <h3>Resumen de Pago</h3>
          </div>

          <div className="payment-summary-item">
            <span className="payment-label">Anuncio:</span>
            <span className="payment-value">{paymentData.postTitle}</span>
          </div>

          <div className="payment-summary-item">
            <span className="payment-label">Plan:</span>
            <span className="payment-value">{paymentData.planName}</span>
          </div>

          <div className="payment-summary-divider"></div>

          <div className="payment-summary-item total">
            <span className="payment-label">Total a pagar:</span>
            <span className="payment-value">${paymentData.amount.toFixed(2)} USD</span>
          </div>
        </div>

        <div className="payment-info-box">
          <AlertTriangle size={16} style={{ color: '#fbbf24' }} />
          <p className="payment-info-text">
            Este es un pago simulado. En producción, aquí se integraría con Stripe u otro procesador de pagos.
          </p>
        </div>

        <div className="payment-method">
          <h4 className="payment-method-title">Método de Pago (Simulado)</h4>
          <div className="payment-card-icon">
            <CreditCard size={32} style={{ color: '#ff6b35' }} />
            <span>Tarjeta de Crédito/Débito</span>
          </div>
        </div>

        <div className={`payment-modal-actions ${isMobile ? 'mobile' : ''}`}>
          <button 
            onClick={onCancel} 
            disabled={loading} 
            className="payment-btn payment-btn-cancel"
          >
            <X size={14} />Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="payment-btn payment-btn-confirm"
          >
            {loading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                Confirmar Pago
              </>
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

const LocationInput = ({ country, state, city, onCountryChange, onStateChange, onCityChange, placeholder }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (country) {
      setIsLoadingStates(true);
      const countryStates = State.getStatesOfCountry(country);
      setStates(countryStates);
      setIsLoadingStates(false);
      
      if (state && !countryStates.find(s => s.isoCode === state)) {
        onStateChange('');
        onCityChange('');
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [country]);

  useEffect(() => {
    if (country && state) {
      setIsLoadingCities(true);
      const stateCities = City.getCitiesOfState(country, state);
      setCities(stateCities);
      setIsLoadingCities(false);
      
      if (city && !stateCities.find(c => c.name === city)) {
        onCityChange('');
      }
    } else {
      setCities([]);
    }
  }, [country, state]);

  return (
    <div className="location-input-wrapper">
      <div className="location-select-row">
        <div className="location-select-field">
          <label className="location-select-label">
            <Globe size={12} style={{ color: '#ff6b35' }} />
            País *
          </label>
          <select
            value={country || ''}
            onChange={(e) => {
              onCountryChange(e.target.value);
              onStateChange('');
              onCityChange('');
            }}
            className="location-select"
          >
            <option value="">Selecciona un país</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {country && states.length > 0 && (
          <div className="location-select-field">
            <label className="location-select-label">
              <MapPin size={12} style={{ color: '#ff6b35' }} />
              Estado/Provincia *
            </label>
            <select
              value={state || ''}
              onChange={(e) => {
                onStateChange(e.target.value);
                onCityChange('');
              }}
              disabled={isLoadingStates}
              className="location-select"
            >
              <option value="">Selecciona un estado</option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {country && state && cities.length > 0 && (
          <div className="location-select-field">
            <label className="location-select-label">
              <MapPin size={12} style={{ color: '#ff6b35' }} />
              Ciudad *
            </label>
            <select
              value={city || ''}
              onChange={(e) => onCityChange(e.target.value)}
              disabled={isLoadingCities}
              className="location-select"
            >
              <option value="">Selecciona una ciudad</option>
              {cities.map((c, idx) => (
                <option key={`${c.name}-${idx}`} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

const ServicesInput = ({ services, onChange, maxServices, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const safeServices = Array.isArray(services) ? services : [];

  const addService = () => {
    if (inputValue.trim() && safeServices.length < maxServices) {
      onChange([...safeServices, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeService = (index) => onChange(safeServices.filter((_, i) => i !== index));
  const handleKeyPress = (e) => { if (e.key === 'Enter') { e.preventDefault(); addService(); } };

  return (
    <div className="services-input-container">
      <div className={`services-input-row ${safeServices.length > 0 ? '' : 'no-margin'}`}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          onKeyPress={handleKeyPress} 
          placeholder={safeServices.length >= maxServices ? `Máximo ${maxServices} servicios` : placeholder} 
          disabled={safeServices.length >= maxServices} 
          className="post-form-input services-input-field"
          style={{ opacity: safeServices.length >= maxServices ? 0.5 : 1 }} 
        />
        <button 
          type="button" 
          onClick={addService} 
          disabled={!inputValue.trim() || safeServices.length >= maxServices} 
          className="services-add-btn"
        >
          <Plus size={16} />
        </button>
      </div>

      {safeServices.length > 0 && (
        <div className="services-list">
          {safeServices.map((service, index) => (
            <div key={index} className="services-tag">
              <span>{service}</span>
              <button 
                type="button" 
                onClick={() => removeService(index)} 
                className="services-remove-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="services-counter">
        {safeServices.length}/{maxServices} servicios
      </div>
    </div>
  );
};

const parseLocationString = (locationString) => {
  if (!locationString) return { country: '', state: '', city: '' };
  const parts = locationString.split(',').map(p => p.trim());
  
  if (parts.length === 3) {
    return { city: parts[0], state: parts[1], country: parts[2] };
  } else if (parts.length === 2) {
    return { city: parts[0], state: '', country: parts[1] };
  } else if (parts.length === 1) {
    return { city: parts[0], state: '', country: '' };
  }
  
  return { country: '', state: '', city: '' };
};

const findCountryCode = (countryName) => {
  if (!countryName) return '';
  const allCountries = Country.getAllCountries();
  const found = allCountries.find(c => 
    c.name.toLowerCase() === countryName.toLowerCase()
  );
  return found ? found.isoCode : '';
};

const findStateCode = (stateName, countryCode) => {
  if (!stateName || !countryCode) return '';
  const states = State.getStatesOfCountry(countryCode);
  const found = states.find(s => 
    s.name.toLowerCase() === stateName.toLowerCase()
  );
  return found ? found.isoCode : '';
};

const PostFormModal = ({ editingPost, onSave, onClose, loading, user }) => {
  const initialLocationData = editingPost?.location 
    ? parseLocationString(editingPost.location)
    : { country: '', state: '', city: '' };
  
  const initialCountryCode = editingPost?.location 
    ? findCountryCode(initialLocationData.country)
    : '';
  
  const initialStateCode = editingPost?.location && initialCountryCode
    ? findStateCode(initialLocationData.state, initialCountryCode)
    : '';

  const [formData, setFormData] = useState({ 
    title: editingPost?.title || '', 
    description: editingPost?.description || '', 
    phone: editingPost?.phone || '', 
    services: Array.isArray(editingPost?.services) ? editingPost.services : [], 
    images: [], 
    currentImages: editingPost?.images || [], 
    removeImages: [], 
    age: editingPost?.age || '', 
    country: initialCountryCode,
    state: initialStateCode,
    city: initialLocationData.city,
    sexo: editingPost?.sexo || ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const postFileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.title?.trim()) errors.title = 'El título es obligatorio';
    else if (formData.title.length < 5) errors.title = 'El título debe tener al menos 5 caracteres';
    else if (formData.title.length > 200) errors.title = 'El título no puede exceder 200 caracteres';
    if (!formData.description?.trim()) errors.description = 'La descripción es obligatoria';
    else if (formData.description.length < 10) errors.description = 'La descripción debe tener al menos 10 caracteres';
    else if (formData.description.length > 500) errors.description = 'La descripción no puede exceder 500 caracteres';
    if (!formData.phone?.trim()) errors.phone = 'El teléfono es obligatorio';
    if (!formData.age) errors.age = 'La edad es obligatoria';
    else if (formData.age < 18) errors.age = 'Debes ser mayor de 18 años';
    else if (formData.age > 80) errors.age = 'Edad máxima permitida: 80 años';
    
    if (!formData.country?.trim()) errors.location = 'Debes seleccionar un país';
    else if (!formData.city?.trim()) errors.location = 'Debes seleccionar una ciudad';
    
    if (!formData.sexo?.trim()) {
      errors.sexo = 'El sexo es obligatorio';
    } else if (!VALID_SEXO_VALUES.includes(formData.sexo.trim())) {
      errors.sexo = `El sexo debe ser uno de: ${VALID_SEXO_VALUES.join(', ')}`;
    }
    
    if (formData.services.length === 0) errors.services = 'Agrega al menos un servicio';
    else if (formData.services.length > 3) errors.services = 'Máximo 3 servicios permitidos';
    const totalImages = formData.images.length + formData.currentImages.length - formData.removeImages.length;
    if (totalImages === 0) errors.images = 'Debes tener al menos una imagen';
    else if (totalImages > 5) errors.images = 'Máximo 5 imágenes permitidas';
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setTimeout(() => scrollToFirstError(errors), 100);
    }
    
    return Object.keys(errors).length === 0;
  };

  const scrollToFirstError = (errors) => {
    const errorOrder = ['images', 'title', 'description', 'phone', 'age', 'location', 'sexo', 'services'];
    const firstErrorField = errorOrder.find(field => errors[field]);
    
    if (firstErrorField) {
      let element = null;
      
      if (firstErrorField === 'images') {
        element = document.querySelector('.images-section');
      } else if (firstErrorField === 'title') {
        element = document.querySelector('input[placeholder*="Título"]');
      } else if (firstErrorField === 'description') {
        element = document.querySelector('input[placeholder*="Describe"]');
      } else if (firstErrorField === 'phone') {
        element = document.querySelector('.PhoneInputInput');
      } else if (firstErrorField === 'age') {
        element = document.querySelector('input[type="number"]');
      } else if (firstErrorField === 'location') {
        element = document.querySelector('.location-select');
      } else if (firstErrorField === 'sexo') {
        element = document.querySelector('select[name="sexo"]');
      } else if (firstErrorField === 'services') {
        element = document.querySelector('input[placeholder*="Acompañante"]');
      }
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (element.focus) {
          setTimeout(() => element.focus(), 300);
        }
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    if ((field === 'country' || field === 'city') && validationErrors.location) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.location;
        return newErrors;
      });
    }
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxFiles = 5 - (formData.currentImages.length - formData.removeImages.length);
    if (files.length > maxFiles) { alert(`Solo puedes agregar ${maxFiles} imágenes más`); return; }

    const validFiles = files.filter(file => {
      if (file.size > 8 * 1024 * 1024) { alert(`El archivo ${file.name} es muy grande. Máximo 8MB por imagen.`); return false; }
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) { alert(`El archivo ${file.name} no es un formato de imagen válido.`); return false; }
      return true;
    });

    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
    event.target.value = '';
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const postFormData = new FormData();
      
      if (!formData.sexo || formData.sexo.trim() === '') {
        alert('Error: El campo sexo es obligatorio y está vacío');
        return;
      }

      if (!VALID_SEXO_VALUES.includes(formData.sexo.trim())) {
        alert(`Error: Valor de sexo inválido. Debe ser uno de: ${VALID_SEXO_VALUES.join(', ')}`);
        return;
      }

      const countryName = Country.getCountryByCode(formData.country)?.name || '';
      const stateName = formData.state ? (State.getStateByCodeAndCountry(formData.state, formData.country)?.name || '') : '';
      const locationString = [formData.city, stateName, countryName].filter(Boolean).join(', ');

      postFormData.append('title', formData.title.trim());
      postFormData.append('description', formData.description.trim());
      postFormData.append('phone', formData.phone.trim());
      postFormData.append('age', formData.age.toString());
      postFormData.append('location', locationString);
      postFormData.append('country', formData.country);
      postFormData.append('state', formData.state || '');
      postFormData.append('city', formData.city);
      postFormData.append('sexo', formData.sexo.trim());
      
      if (formData.services?.length > 0) postFormData.append('services', JSON.stringify(formData.services));
      
      formData.images.forEach((image, index) => {
        postFormData.append('images', image);
      });
      
      if (editingPost && formData.removeImages.length > 0) postFormData.append('removeImages', JSON.stringify(formData.removeImages));

      await onSave(postFormData);
      
    } catch (error) { 
      console.error('Error en handleSubmit:', error); 
    }
  };

  const currentVisibleImages = formData.currentImages.filter(img => !formData.removeImages.includes(img));
  const totalImages = formData.images.length + currentVisibleImages.length;

  return (
    <ModalContainer maxWidth={isMobile ? "mobile" : "large"} onClick={(e) => e.stopPropagation()}>
      <div className={`modal-header orange ${isMobile ? 'mobile' : ''}`}>
        <div className="modal-header-left">
          <div className="modal-header-icon">
            <ImageIcon size={18} style={{ color: '#ff6b35' }} />
          </div>
          <h2 className={`modal-header-title ${isMobile ? 'mobile' : ''}`}>
            {editingPost ? 'Editar Anuncio' : 'Nuevo Anuncio'}
          </h2>
        </div>
        <button 
          onClick={onClose} 
          disabled={loading} 
          className="modal-close-btn"
        >
          ×
        </button>
      </div>

      <div className={`post-form-content ${isMobile ? 'mobile' : ''}`}>
        
        <div className={`post-form-images images-section ${isMobile ? 'mobile' : ''}`}>
          <h3 className="post-form-images-title">
            <Camera size={16} style={{ color: '#ff6b35' }} />
            Imágenes ({totalImages}/5)
          </h3>
          
          <div 
            className={`post-form-upload-area ${isMobile ? 'mobile' : ''} ${totalImages >= 5 ? 'disabled' : ''}`}
            onClick={() => totalImages < 5 && postFileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={postFileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              multiple 
              style={{ display: 'none' }} 
              disabled={totalImages >= 5 || loading} 
            />
            <ImageIcon size={isMobile ? 24 : 28} className="post-form-upload-icon" />
            <div className="post-form-upload-title">
              {totalImages === 0 ? 'Subir Fotos' : `${totalImages}/5 fotos`}
            </div>
            <div className="post-form-upload-subtitle">
              {totalImages < 5 ? 'JPG, PNG hasta 8MB' : 'Máximo alcanzado'}
            </div>
            {totalImages < 5 && (
              <button 
                onClick={(e) => { e.stopPropagation(); postFileInputRef.current?.click(); }} 
                disabled={loading} 
                className="post-form-upload-btn"
              >
                <Plus size={12} />
                {loading ? 'Subiendo...' : 'Agregar'}
              </button>
            )}
          </div>

          {(formData.images.length > 0 || currentVisibleImages.length > 0) && (
            <div className={`post-form-images-grid ${isMobile ? 'mobile' : ''}`}>
              {editingPost && currentVisibleImages.map((imageUrl, index) => (
                <div key={`current-${index}`} className="post-form-image-item">
                  <img 
                    src={imageUrl} 
                    alt={`${index + 1}`} 
                    className="post-form-image-preview"
                  />
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, removeImages: [...prev.removeImages, imageUrl] }))} 
                    disabled={loading} 
                    className="post-form-image-remove"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              {formData.images.map((file, index) => (
                <div key={`new-${index}`} className="post-form-image-item new">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`${index + 1}`} 
                    className="post-form-image-preview"
                  />
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))} 
                    disabled={loading} 
                    className="post-form-image-remove"
                  >
                    ×
                  </button>
                  <div className="post-form-image-badge">
                    Nueva
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {validationErrors.images && (
            <div className="post-form-images-error">
              <AlertTriangle size={14} />
              {validationErrors.images}
            </div>
          )}
        </div>

        <div className={`post-form-fields ${isMobile ? 'mobile' : ''}`}>
          <div className="post-form-sections">
            
            <div className={`post-form-section basic ${isMobile ? 'mobile' : ''}`}>
              <h3 className="post-form-section-title orange">
                <Edit3 size={16} />
                Información Básica
              </h3>

              <div className="post-form-grid">
                <div className="post-form-field">
                  <label className="post-form-label">
                    Título del anuncio *
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Servicios profesionales de acompañamiento" 
                    value={formData.title} 
                    onChange={(e) => handleInputChange('title', e.target.value)} 
                    maxLength={200} 
                    className={`post-form-input ${validationErrors.title ? 'error' : ''}`}
                  />
                  <div className="post-form-field-footer">
                    {validationErrors.title && <span className="post-form-error-text">{validationErrors.title}</span>}
                    <span className="post-form-counter">{formData.title.length}/200</span>
                  </div>
                </div>

                <div className="post-form-field">
                  <label className="post-form-label">
                    Descripción breve *
                  </label>
                  <input 
                    type="text"
                    placeholder="Describe brevemente tus servicios..." 
                    value={formData.description} 
                    maxLength={500} 
                    onChange={(e) => handleInputChange('description', e.target.value)} 
                    className={`post-form-input ${validationErrors.description ? 'error' : ''}`}
                  />
                  <div className="post-form-field-footer">
                    {validationErrors.description && <span className="post-form-error-text">{validationErrors.description}</span>}
                    <span className="post-form-counter">{formData.description.length}/500</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`post-form-section personal ${isMobile ? 'mobile' : ''}`}>
              <h3 className="post-form-section-title green">
                <User size={16} />
                Información Personal
              </h3>

              <div className="post-form-grid">
                <div className={`post-form-row ${isMobile ? 'mobile' : ''}`}>
                  <div className="post-form-field">
                    <label className="post-form-label-inline">
                      <Phone size={14} style={{ color: '#22c55e' }} />
                      Contacto *
                    </label>
                    <PhoneInput 
                      placeholder="+1-829-555-0123" 
                      value={formData.phone} 
                      onChange={(value) => handleInputChange('phone', value || '')} 
                      defaultCountry="DO" 
                      international 
                      countryCallingCodeEditable={false}
                      className={validationErrors.phone ? 'phone-input-error' : ''}
                    />
                    {validationErrors.phone && <span className="post-form-error-text" style={{ marginTop: '4px', display: 'block' }}>{validationErrors.phone}</span>}
                  </div>

                  <div className="post-form-field">
                    <label className="post-form-label">Edad *</label>
                    <input 
                      type="number" 
                      placeholder="25" 
                      value={formData.age} 
                      min={18} 
                      max={80} 
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')} 
                      className={`post-form-input center ${validationErrors.age ? 'error' : ''}`}
                    />
                    {validationErrors.age && <span className="post-form-error-text" style={{ marginTop: '4px', display: 'block' }}>{validationErrors.age}</span>}
                  </div>
                </div>

                <div className="post-form-field">
                  <LocationInput 
                    country={formData.country}
                    state={formData.state}
                    city={formData.city}
                    onCountryChange={(value) => handleInputChange('country', value)}
                    onStateChange={(value) => handleInputChange('state', value)}
                    onCityChange={(value) => handleInputChange('city', value)}
                  />
                  {validationErrors.location && <span className="post-form-error-text" style={{ marginTop: '4px', display: 'block' }}>{validationErrors.location}</span>}
                </div>

                <div className="post-form-field">
                  <label className="post-form-label">Género *</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={(e) => handleInputChange('sexo', e.target.value)}
                    className={`post-form-select ${validationErrors.sexo ? 'error' : ''}`}
                  >
                    <option value="" style={{ background: '#1a1a1a', color: '#9ca3af' }}>
                      Selecciona
                    </option>
                    {VALID_SEXO_VALUES.map((sexoOption) => (
                      <option 
                        key={sexoOption} 
                        value={sexoOption}
                        style={{ background: '#1a1a1a', color: 'white' }}
                      >
                        {sexoOption}
                      </option>
                    ))}
                  </select>
                  {validationErrors.sexo && <span className="post-form-error-text" style={{ marginTop: '4px', display: 'block' }}>{validationErrors.sexo}</span>}
                </div>
              </div>
            </div>

            <div className={`post-form-section services ${isMobile ? 'mobile' : ''}`}>
              <h3 className="post-form-section-title purple">
                <Star size={16} />
                Servicios
              </h3>

              <div className="post-form-grid">
                <div className="post-form-field">
                  <label className="post-form-label">
                    Servicios principales (máx 3) *
                  </label>
                  <ServicesInput 
                    services={formData.services} 
                    onChange={(value) => handleInputChange('services', value)} 
                    maxServices={3} 
                    placeholder="Ej: Acompañante, Masajes, Eventos" 
                  />
                  {validationErrors.services && <span className="post-form-error-text" style={{ marginTop: '4px', display: 'block' }}>{validationErrors.services}</span>}
                </div>
              </div>
            </div>

            <div className={`post-form-actions ${isMobile ? 'mobile' : ''}`}>
              <button 
                onClick={onClose} 
                disabled={loading} 
                className="post-form-btn post-form-btn-cancel"
              >
                <X size={16} />Cancelar
              </button>
              
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="post-form-btn post-form-btn-submit"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    {editingPost ? 'Actualizando...' : 'Publicando...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingPost ? 'Actualizar Anuncio' : 'Publicar Anuncio'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

const DeleteModal = ({ post, onConfirm, onCancel, loading }) => {
  const isMobile = window.innerWidth < 768;
  
  return (
    <ModalContainer maxWidth={isMobile ? "mobile" : "small"} onClick={(e) => e.stopPropagation()}>
      <div className={`modal-header red ${isMobile ? 'mobile' : ''}`}>
        <h2 className={`modal-header-title ${isMobile ? 'small' : ''}`}>
          <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          Eliminar
        </h2>
        <button 
          onClick={!loading ? onCancel : undefined} 
          disabled={loading} 
          className="modal-close-btn small"
        >
          ×
        </button>
      </div>

      <div className={`delete-modal-content ${isMobile ? 'mobile' : ''}`}>
        <div className="delete-post-preview">
          <img 
            src={post?.images?.[0] || 'https://via.placeholder.com/150?text=Sin+Imagen'} 
            alt="Post" 
            className="delete-post-image"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen'; }} 
          />
          <div className="delete-post-info">
            <h4 className="delete-post-title">
              {post?.title || 'Anuncio'}
            </h4>
            <p className="delete-post-description">
              {post?.description || 'Sin descripción'}
            </p>
          </div>
        </div>

        <div className="delete-confirmation">
          <div className="delete-icon-circle">
            <Trash2 size={20} style={{ color: '#ef4444' }} />
          </div>
          <h3 className="delete-confirmation-title">
            ¿Eliminar este anuncio?
          </h3>
          <p className="delete-confirmation-text">
            Esta acción es permanente y no se puede deshacer.
          </p>
        </div>

        <div className={`delete-modal-actions ${isMobile ? 'mobile' : ''}`}>
          <button 
            onClick={onCancel} 
            disabled={loading} 
            className="delete-btn delete-btn-cancel"
          >
            <X size={14} />Cancelar
          </button>
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="delete-btn delete-btn-confirm"
          >
            {loading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default PostsManager;