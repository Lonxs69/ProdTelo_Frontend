import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, User, ChevronLeft, ChevronRight, Verified, MapPin, 
  Search, Heart, Send, Star, X, Users, RefreshCw, Loader, Check, UserPlus, Ban, TrendingUp, Shield, Building2, Flame, Zap, Lock, AlertCircle, Award, Crown, Sparkles
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import EscortProfile from '../Profiles/EscortModal';
import ChatPage from '../chat/ChatPage';
import './FeedPageDesign.css';

// Componente de icono verificado personalizado
const VerifiedBadge = ({ size = 24, className = 'Verified-icon' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M12 2L15.09 5.26L19.18 5.27L20.64 9.14L23.5 12L20.64 14.86L19.18 18.73L15.09 18.74L12 22L8.91 18.74L4.82 18.73L3.36 14.86L0.5 12L3.36 9.14L4.82 5.27L8.91 5.26L12 2Z" 
      fill="#3b82f6"
    />
    <path 
      d="M9 12L11 14L15 10" 
      stroke="white" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// ===================================================================
// 🎯 NUEVO COMPONENTE: PLAN BADGE
// ===================================================================
const PlanBadge = React.memo(({ plan, size = 'small', showIcon = true, className = '' }) => {
  if (!plan || plan === 'FREE') return null;

  const planConfig = {
    PREMIUM: {
      icon: Crown,
      label: 'Premium',
      className: 'plan-badge-premium',
      gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      glow: '0 0 20px rgba(255, 215, 0, 0.5)'
    },
    BASIC: {
      icon: Sparkles,
      label: 'Basic',
      className: 'plan-badge-basic',
      gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
      glow: '0 0 15px rgba(59, 130, 246, 0.4)'
    }
  };

  const config = planConfig[plan];
  if (!config) return null;

  const Icon = config.icon;
  const sizeMap = {
    small: { icon: 10, padding: '2px 6px', fontSize: '9px' },
    medium: { icon: 12, padding: '3px 8px', fontSize: '10px' },
    large: { icon: 14, padding: '4px 10px', fontSize: '11px' }
  };

  const sizing = sizeMap[size] || sizeMap.small;

  return (
    <motion.div
      className={`plan-badge ${config.className} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        background: config.gradient,
        boxShadow: config.glow,
        padding: sizing.padding,
        fontSize: sizing.fontSize
      }}
      whileHover={{ scale: 1.05 }}
    >
      {showIcon && <Icon size={sizing.icon} />}
      <span>{config.label}</span>
    </motion.div>
  );
});

// ===================================================================
// 🎯 NUEVO COMPONENTE: PLAN STATS BANNER
// ===================================================================
const PlanStatsBanner = React.memo(({ planStats, planDistribution, activeTab }) => {
  if (!planStats || planStats.total === 0) return null;

  const getPercentage = (count) => {
    return planStats.total > 0 ? ((count / planStats.total) * 100).toFixed(0) : 0;
  };

  return (
    <motion.div
      className="plan-stats-banner"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="plan-stats-container">
        <div className="plan-stat-item premium">
          <Crown size={14} />
          <span className="plan-stat-count">{planStats.premium}</span>
          <span className="plan-stat-label">Premium</span>
          <span className="plan-stat-percent">{getPercentage(planStats.premium)}%</span>
        </div>

        <div className="plan-stat-divider" />

        <div className="plan-stat-item basic">
          <Sparkles size={14} />
          <span className="plan-stat-count">{planStats.basic}</span>
          <span className="plan-stat-label">Basic</span>
          <span className="plan-stat-percent">{getPercentage(planStats.basic)}%</span>
        </div>

        <div className="plan-stat-divider" />

        <div className="plan-stat-item free">
          <Star size={14} />
          <span className="plan-stat-count">{planStats.free}</span>
          <span className="plan-stat-label">Free</span>
          <span className="plan-stat-percent">{getPercentage(planStats.free)}%</span>
        </div>
      </div>

      <div className="plan-stats-total">
        <span>Total: {planStats.total} posts</span>
      </div>
    </motion.div>
  );
});

// Componente de buscador minimalista
const SmartSearchBar = React.memo(({ 
  posts, 
  onSearchChange,
  onSearchClear
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInputRef = React.useRef(null);

  // Debounce búsqueda
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase().trim();
        
        const filteredResults = posts.filter(post => {
          const authorName = `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.toLowerCase();
          const title = (post.title || '').toLowerCase();
          const location = (post.location?.city || post.location || '').toLowerCase();
          const description = (post.description || '').toLowerCase();
          const services = (post.services || post.author?.escort?.services || [])
            .map(s => s.toLowerCase())
            .join(' ');

          return authorName.includes(lowerQuery) ||
                 title.includes(lowerQuery) ||
                 location.includes(lowerQuery) ||
                 description.includes(lowerQuery) ||
                 services.includes(lowerQuery);
        });
        
        onSearchChange(filteredResults, searchQuery);
      } else {
        onSearchClear();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, posts, onSearchChange, onSearchClear]);

  // Limpiar búsqueda
  const handleClearSearch = React.useCallback(() => {
    setSearchQuery('');
    onSearchClear();
    searchInputRef.current?.blur();
  }, [onSearchClear]);

  return (
    <div className="smart-search-container">
      <Search className="search-icon" size={18} />
      <input
        ref={searchInputRef}
        type="text"
        className="search-input"
        placeholder="Buscar por nombre, ubicación, servicios..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && (
        <button className="search-clear-btn" onClick={handleClearSearch}>
          <X size={14} />
        </button>
      )}
    </div>
  );
});

export const FeedPageDesign = (props) => {
  const { isAuthenticated, user } = useAuth();
  
  // Estados locales
  const [currentView, setCurrentView] = React.useState('feed');
  const [selectedProfileId, setSelectedProfileId] = React.useState(null);
  const [selectedProfileData, setSelectedProfileData] = React.useState(null);
  const [likeAnimations, setLikeAnimations] = React.useState({});
  const [mobilePostsVisible, setMobilePostsVisible] = React.useState({});
  const [showAuthModal, setShowAuthModal] = React.useState(null);
  const [expandedDescriptions, setExpandedDescriptions] = React.useState({});
  const [chatTargetUserId, setChatTargetUserId] = React.useState(null);
  const [chatTargetUserData, setChatTargetUserData] = React.useState(null);
  const [isCreatingChat, setIsCreatingChat] = React.useState(false);
  const [showBoostInfo, setShowBoostInfo] = React.useState({});
  const [boostAnimations, setBoostAnimations] = React.useState({});
  const [imageDimensions, setImageDimensions] = React.useState({});
  
  // Estados para búsqueda
  const [isSearching, setIsSearching] = React.useState(false);
  const [filteredPosts, setFilteredPosts] = React.useState([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Destructuring props
  const {
    userType, customTitle, customSubtitle, customIcon, posts, loading, error, 
    refreshing, activeTab, currentImageIndex, userLikesAndFavorites, 
    showBanModal, setShowBanModal, setCurrentImageIndex, getUserConfig, 
    handleRefresh, handleTabChange, nextImage, prevImage, handleToggleLikeAndFavorite,
    handleStartChat, handleShare, handleProfileClick: originalHandleProfileClick,
    handleRecommendedProfileClick, handleSendJoinRequest, handleBanUser,
    confirmBan, onOpenAuthModal, shouldShowButton,
    boostStats, hasAccessToDiscover,
    showWhatsAppVerification, pendingWhatsAppPhone, isVerifying, isVerified,
    verificationError, humanBehavior, handleWhatsAppWithVerification,
    handleVerifyRobot, handleCloseVerificationModal,
    planStats, planDistribution
  } = props;

  const config = getUserConfig(customTitle, customSubtitle, customIcon);
  const isMobile = () => window.innerWidth <= 768;
  const actualUserType = user?.userType || userType || 'CLIENT';

  // Posts a mostrar (filtrados o todos)
  const displayPosts = React.useMemo(() => {
    return isSearching && filteredPosts.length >= 0 ? filteredPosts : posts;
  }, [isSearching, filteredPosts, posts]);

  // Manejar cambios de búsqueda
  const handleSearchChange = React.useCallback((results, query) => {
    setFilteredPosts(results);
    setSearchQuery(query);
    setIsSearching(true);
  }, []);

  // Manejar carga de imágenes para obtener dimensiones reales
  const handleImageLoad = React.useCallback((postId, event) => {
    const img = event.target;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    setImageDimensions(prev => ({
      ...prev,
      [postId]: {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: aspectRatio
      }
    }));
  }, []);
  
  // Funciones de layout
  const updateLayoutPositions = React.useCallback(() => {
    const navElement = document.querySelector('.feed-navigation');
    const feedContent = document.querySelector('.feed-content');
    
    if (!navElement || !feedContent) return;

    const isMobileDevice = window.innerWidth <= 768;
    
    if (isMobileDevice) {
      navElement.style.top = isAuthenticated ? '70px' : '40px';
      navElement.style.position = 'absolute';
      navElement.style.left = '0';
      navElement.style.right = '0';
      navElement.style.zIndex = '999';
      navElement.style.background = 'transparent';
      navElement.style.backdropFilter = 'blur(20px)';
      navElement.style.padding = '0.3rem';
      
      feedContent.style.marginTop = isAuthenticated ? '180px' : '155px';
    } else {
      navElement.style.top = isAuthenticated ? '70px' : '60px';
      navElement.style.position = 'absolute';
      navElement.style.left = '0';
      navElement.style.right = '0';
      navElement.style.zIndex = '999';
      navElement.style.padding = '0.5rem 1rem';
      
      feedContent.style.marginTop = isAuthenticated ? '270px' : '320px';
    }
  }, [isAuthenticated]);

  // Efectos
  React.useEffect(() => {
    updateLayoutPositions();
    
    const handleResize = () => updateLayoutPositions();
    const handleOrientationChange = () => setTimeout(updateLayoutPositions, 200);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [updateLayoutPositions, posts, activeTab]);

  React.useEffect(() => {
    if (posts.length > 0) {
      setTimeout(updateLayoutPositions, 200);
    }
  }, [posts, updateLayoutPositions]);

  // Componente Avatar
  const ProfileAvatar = React.memo(({ src, alt, className, style, onClick }) => {
    const [imageState, setImageState] = React.useState({ loaded: false, error: false, validSrc: false });

    React.useEffect(() => {
      if (!src?.trim()) {
        setImageState({ loaded: false, error: false, validSrc: false });
        return;
      }

      setImageState(prev => ({ ...prev, validSrc: true, loaded: false, error: false }));
      const img = new Image();
      img.onload = () => setImageState(prev => ({ ...prev, loaded: true, error: false }));
      img.onerror = () => setImageState(prev => ({ ...prev, loaded: false, error: true }));
      img.src = src;

      return () => { img.onload = null; img.onerror = null; };
    }, [src]);

    const showImage = imageState.validSrc && !imageState.error && imageState.loaded;
    const showPlaceholder = !showImage;

    return (
      <div className={`profile-avatar-wrapper ${onClick ? 'clickable' : ''}`} style={style} onClick={onClick}>
        {showImage && <img src={src} alt={alt} className={className} />}
        {showPlaceholder && (
          <div className={`${className} profile-avatar-placeholder`}>
            <User size={className?.includes('modern-profile-image') ? 20 : 40} />
          </div>
        )}
      </div>
    );
  });

  // Componente Boost Indicator
  const BoostIndicator = React.memo(({ post, className = '' }) => {
    if (!post.isBoostActive) return null;

    const boostLevel = post.boostAmount > 100 ? 'high' : post.boostAmount > 50 ? 'medium' : 'low';

    return (
      <motion.div
        className={`boost-indicator boost-${boostLevel} ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onMouseEnter={() => setShowBoostInfo(prev => ({ ...prev, [post.id]: true }))}
        onMouseLeave={() => setShowBoostInfo(prev => ({ ...prev, [post.id]: false }))}
      >
        <Zap size={12} />
        <span>BOOST</span>
        
        <AnimatePresence>
          {showBoostInfo[post.id] && (
            <motion.div
              className="boost-info-tooltip"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div>💰 Boost: ${post.boostAmount}</div>
              {post.boostExpiry && (
                <div>⏰ Expira: {new Date(post.boostExpiry).toLocaleDateString()}</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  });

  // WhatsApp Icon
  const WhatsAppIcon = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
    </svg>
  );

  // Funciones de interacción
  const handleProfileClick = React.useCallback((post) => {
    const userId = post.authorId || post.userId || post.author?.id;
    if (!userId) return;
    
    const initialProfileData = {
      id: userId, authorId: userId, userId: userId,
      name: post.author ? `${post.author.firstName} ${post.author.lastName}` : post.name,
      firstName: post.author?.firstName || '', lastName: post.author?.lastName || '',
      username: post.author?.username || '', avatar: post.author?.avatar || post.profileImage || post.images?.[0] || '',
      age: post.age || post.author?.escort?.age || null, sexo: post.sexo || 'No especificado',
      plan: post.plan || 'FREE',
      location: post.location || post.author?.location || 'República Dominicana',
      phone: post.phone || post.author?.phone || '', bio: post.description || post.author?.bio || '',
      title: post.title || post.name || '', verified: post.verified || post.author?.escort?.isVerified || post.author?.agency?.isVerified || false,
      userType: post.type || post.userType || post.author?.userType || 'ESCORT',
      rating: post.rating || post.author?.escort?.rating || 0, reviewsCount: post.reviewsCount || post.author?.escort?.reviewsCount || 0,
      services: post.services || post.author?.escort?.services || [], rates: post.rates || post.author?.escort?.rates || {},
      availability: post.availability || post.author?.escort?.availability || {}, languages: post.languages || post.author?.escort?.languages || ['Español'],
      isOnline: post.isOnline || Math.random() > 0.5, lastSeen: post.lastSeen || post.author?.lastActiveAt || new Date().toISOString(),
      createdAt: post.createdAt || post.author?.createdAt || new Date().toISOString(),
      agency: post.agency || post.author?.agency || null, canJoinAgency: post.canJoinAgency || (!post.author?.agency && post.author?.userType === 'ESCORT'),
      profileViews: post.profileViews || post.author?.profileViews || 0, images: post.images || [], author: post.author,
      isBoostActive: post.isBoostActive || false,
      boostAmount: post.boostAmount || 0,
      boostExpiry: post.boostExpiry || null
    };
    
    setSelectedProfileId(userId);
    setSelectedProfileData(initialProfileData);
    setCurrentView('profile');
    originalHandleProfileClick?.(post);
  }, [originalHandleProfileClick]);

  const handleRecommendedProfileClickNavigation = React.useCallback((profile) => {
    const userId = profile.id || profile.authorId || profile.userId;
    if (!userId) return;
    setSelectedProfileId(userId);
    setSelectedProfileData({ 
      ...profile, 
      sexo: profile.sexo || 'No especificado',
      plan: profile.plan || 'FREE'
    });
    setCurrentView('profile');
    handleRecommendedProfileClick?.(profile);
  }, [handleRecommendedProfileClick]);

  const handleBackToFeed = React.useCallback(() => {
    setCurrentView('feed');
    setSelectedProfileId(null);
    setSelectedProfileData(null);
    setChatTargetUserId(null);
    setChatTargetUserData(null);
    setIsCreatingChat(false);
  }, []);

  const handleBackToFeedFromChat = React.useCallback(() => {
    setCurrentView('feed');
    setChatTargetUserId(null);
    setChatTargetUserData(null);
    setIsCreatingChat(false);
  }, []);

  const handleAuthRequiredAction = React.useCallback((actionType = 'general') => {
    if (!isAuthenticated) { setShowAuthModal('login'); return false; }
    return true;
  }, [isAuthenticated]);

  const handleMobilePostToggle = React.useCallback((postId, event) => {
    if (!isMobile()) return;
    const target = event.target;
    const clickedOnButton = target.closest('button') || target.closest('.modern-action-btn') || target.closest('.modern-nav-button') || target.closest('[data-interactive="true"]');
    if (clickedOnButton) return;
    setMobilePostsVisible(prev => ({ ...prev, [postId]: !prev[postId] }));
    event.stopPropagation();
  }, []);

  const handleChatAction = React.useCallback((post) => {
    if (isCreatingChat) return;
    if (!handleAuthRequiredAction('chat')) return;
    
    const targetUserId = post.author?.id || post.authorId || post.userId;
    if (!targetUserId) return;

    setIsCreatingChat(true);
    
    const targetUserData = {
      id: targetUserId, firstName: post.author?.firstName || '', lastName: post.author?.lastName || '',
      username: post.author?.username || '', avatar: post.author?.avatar || post.profileImage || post.images?.[0] || '',
      userType: post.author?.userType || 'ESCORT', isActive: true,
      phone: post.phone || post.author?.phone || '', location: post.location || post.author?.location || 'República Dominicana'
    };
    
    setChatTargetUserId(targetUserId);
    setChatTargetUserData(targetUserData);
    setCurrentView('chat');
    
    setTimeout(() => setIsCreatingChat(false), 1000);
    if (handleStartChat && typeof handleStartChat === 'function') handleStartChat(post);
  }, [isCreatingChat, handleAuthRequiredAction, handleStartChat]);

  const handleLikeWithAnimation = React.useCallback((postId, event) => {
    if (!handleAuthRequiredAction('like')) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.instagram-post-container');
    const containerRect = container.getBoundingClientRect();
    
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;
    const animationId = `${postId}-${Date.now()}`;
    
    const currentPost = displayPosts.find(p => p.id === postId);
    const isBoostActive = currentPost?.isBoostActive || false;
    const isPremium = currentPost?.plan === 'PREMIUM';
    const isBasic = currentPost?.plan === 'BASIC';
    
    let heartTypes, heartCount, distance;
    if (isPremium) {
      heartTypes = ['👑', '💎', '⭐', '✨', '🌟', '💫', '🔥', '💥'];
      heartCount = 35;
      distance = 60;
    } else if (isBasic) {
      heartTypes = ['💙', '💜', '🩵', '💗', '🩷', '💖', '✨', '⚡'];
      heartCount = 28;
      distance = 45;
    } else if (isBoostActive) {
      heartTypes = ['⚡', '💫', '✨', '🌟', '💎', '🔥', '💥', '🚀'];
      heartCount = 30;
      distance = 50;
    } else {
      heartTypes = ['❤️', '🧡', '💖', '💕', '💗', '💓', '♥️', '💘', '💝', '❣️'];
      heartCount = 25;
      distance = 35;
    }
    
    const hearts = Array.from({ length: heartCount }, (_, i) => {
      const angle = (Math.PI * 2 * i) / heartCount;
      const finalDistance = distance + Math.random() * (distance * 0.5);
      return {
        id: `${animationId}-${i}`, 
        x: x + Math.cos(angle) * finalDistance + (Math.random() - 0.5) * 40,
        y: y + Math.sin(angle) * finalDistance + (Math.random() - 0.5) * 40, 
        delay: i * (isPremium ? 25 : isBasic ? 35 : 50),
        heart: heartTypes[Math.floor(Math.random() * heartTypes.length)], 
        size: (isPremium ? 1.2 : isBasic ? 1.0 : 0.8) + Math.random() * 0.8,
        rotation: Math.random() * 360, 
        duration: (isPremium ? 3.5 : isBasic ? 3.0 : 2.5) + Math.random() * 1.5, 
        curve: Math.random() > 0.5 ? 1 : -1
      };
    });
    
    setLikeAnimations(prev => ({ ...prev, [postId]: hearts }));
    setTimeout(() => setLikeAnimations(prev => { 
      const newAnimations = { ...prev }; 
      delete newAnimations[postId]; 
      return newAnimations; 
    }), isPremium ? 7000 : isBasic ? 6000 : isBoostActive ? 6000 : 4500);
    
    handleToggleLikeAndFavorite?.(postId);
  }, [handleAuthRequiredAction, handleToggleLikeAndFavorite, displayPosts]);

  const toggleDescriptionExpansion = React.useCallback((postId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedDescriptions(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  // Configuración de botones de acción
  const actionButtonsConfig = React.useMemo(() => ({
    chat: { Component: MessageCircle, className: 'chat-btn', size: 20, handler: handleChatAction, title: 'Chatear' },
    like: { Component: Flame, className: 'flame-btn', size: 24, handler: handleLikeWithAnimation, title: 'Me gusta' },
    whatsapp: { Component: WhatsAppIcon, className: 'whatsapp-btn', size: 20, handler: (post) => handleWhatsAppWithVerification(post.phone || post.author?.phone), title: 'WhatsApp' },
    invite: { Component: UserPlus, className: 'invite-btn', size: 20, handler: handleSendJoinRequest, title: 'Enviar solicitud' },
    ban: { Component: Ban, className: 'ban-btn', size: 20, handler: handleBanUser, title: 'Banear usuario' }
  }), [handleChatAction, handleLikeWithAnimation, handleWhatsAppWithVerification, handleSendJoinRequest, handleBanUser]);

  const renderActionButtons = React.useCallback((post) => {
    const isOwnPost = post.author?.id === user?.id;
    
    if (isOwnPost) {
      return (
        <div className="modern-actions-overlay single-button" data-interactive="true">
          <div className={`own-post-indicator ${post.isBoostActive ? 'boosted' : ''} ${post.plan === 'PREMIUM' ? 'premium' : post.plan === 'BASIC' ? 'basic' : ''}`}>
            {post.plan === 'PREMIUM' && <Crown size={12} />}
            {post.plan === 'BASIC' && <Sparkles size={12} />}
            {post.isBoostActive && <Zap size={14} />}
            {post.plan === 'FREE' && !post.isBoostActive && <User size={14} />}
            <span>
              {post.plan === 'PREMIUM' ? 'Premium' : post.plan === 'BASIC' ? 'Basic' : 'Tu publicación'}
              {post.isBoostActive && ' (Boost)'}
            </span>
          </div>
        </div>
      );
    }

    let validButtons = config.actionButtons.filter(buttonType => shouldShowButton(buttonType, post));
    
    if (actualUserType === 'AGENCY') {
      validButtons = validButtons.filter(buttonType => 
        buttonType === 'chat' || buttonType === 'whatsapp'
      );
    }
    
    if (validButtons.length === 0) return null;

    const buttons = validButtons.map(buttonType => {
      const btnConfig = actionButtonsConfig[buttonType];
      if (!btnConfig) return null;
      
      const { Component, className, size, handler, title } = btnConfig;
      const isActive = buttonType === 'like' && ((post.isLiked && post.isFavorited) || userLikesAndFavorites.has(post.id));
      const isDisabled = buttonType === 'chat' && isCreatingChat;
      
      return (
        <motion.button
          key={buttonType}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isDisabled) return;
            handler(buttonType === 'like' ? post.id : post, e);
          }}
          className={`modern-action-btn ${className} ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
          disabled={isDisabled}
          whileHover={isDisabled ? {} : { scale: 1.1, y: -2 }}
          whileTap={isDisabled ? {} : { scale: 0.95 }}
          title={isDisabled ? 'Creando chat...' : title}
        >
          <Component size={size} />
          {buttonType === 'chat' && isDisabled && (
            <motion.div
              className="chat-loading-spinner"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          )}
        </motion.button>
      );
    }).filter(Boolean);

    const containerClass = `modern-actions-overlay ${buttons.length === 1 ? 'single-button' : buttons.length === 2 ? 'two-buttons' : 'multiple-buttons'}`;
    return (
      <div className={containerClass} data-interactive="true">
        <div className="action-buttons-left">
          {buttons}
        </div>
        {post.likesCount > 0 && (
          <div className={`likes-counter-right ${post.isBoostActive ? 'boosted' : ''} ${post.plan === 'PREMIUM' ? 'premium' : post.plan === 'BASIC' ? 'basic' : ''}`}>
            <Heart size={12} />
            <span>{post.likesCount}</span>
            {post.isBoostActive && <Zap size={10} />}
            {post.plan === 'PREMIUM' && <Crown size={10} />}
            {post.plan === 'BASIC' && <Sparkles size={10} />}
          </div>
        )}
      </div>
    );
  }, [user?.id, config.actionButtons, shouldShowButton, actionButtonsConfig, userLikesAndFavorites, isCreatingChat, actualUserType]);

  // Renderización de posts grid
  const renderPostsGrid = React.useCallback((postsArray) => (
    <div className="feed-posts-container">
      {postsArray.map((post, index) => {
        const dimensions = imageDimensions[post.id];
        const containerStyle = dimensions ? {
          aspectRatio: `${dimensions.aspectRatio}`
        } : {};

        return (
          <motion.div
            key={post.id}
            data-post-id={post.id}
            className={`feed-post-card ${mobilePostsVisible[post.id] ? 'mobile-active' : ''} ${post.isBoostActive ? 'boosted-post' : ''} ${post.plan === 'PREMIUM' ? 'premium-post' : post.plan === 'BASIC' ? 'basic-post' : 'free-post'}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ 
              opacity: 1, 
              y: 0
            }}
            transition={{ 
              delay: index * 0.1,
              duration: post.plan === 'PREMIUM' ? 0.9 : post.plan === 'BASIC' ? 0.7 : post.isBoostActive ? 0.8 : 0.6,
              ease: post.plan === 'PREMIUM' ? [0.25, 0.46, 0.45, 0.94] : "easeOut"
            }}
            onClick={(e) => handleMobilePostToggle(post.id, e)}
          >
            <div className="instagram-post-container">
              <div className="instagram-header" data-interactive="true">
                <ProfileAvatar
                  src={post.author?.avatar || post.profileImage || post.images?.[0]}
                  alt={post.author ? `${post.author.firstName} ${post.author.lastName}` : post.name}
                  className="instagram-profile-image"
                  onClick={() => handleProfileClick(post)}
                />
                
                <div className="instagram-profile-info">
                  <h3 onClick={() => handleProfileClick(post)} className="instagram-profile-name" data-interactive="true">
                    {post.author ? `${post.author.firstName} ${post.author.lastName}` : post.name}
                    {(post.age || post.author?.escort?.age) && (
                      <span className="profile-age">
                        • {post.age || post.author?.escort?.age} años
                      </span>
                    )}
                    {(post.verified || post.author?.escort?.isVerified || post.author?.agency?.isVerified) && (
                      <VerifiedBadge size={1} className="verified-icon" />
                    )}
                    <PlanBadge plan={post.plan} size="small" />
                    {post.isBoostActive && (
                      <motion.div 
                        className="profile-boost-badge"
                        animate={{ 
                          boxShadow: [
                            '0 2px 8px rgba(255, 107, 53, 0.3)',
                            '0 4px 16px rgba(255, 107, 53, 0.5)',
                            '0 2px 8px rgba(255, 107, 53, 0.3)'
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap size={10} />
                        BOOST
                      </motion.div>
                    )}
                  </h3>
                  
                  <div className="instagram-profile-location">
                    <MapPin className='Mapa' size={12} />
                    <span>{post.location?.city || post.location || 'República Dominicana'}</span>
                  </div>
                </div>
              </div>

              <div className="instagram-image-container" style={containerStyle}>
                <BoostIndicator post={post} />
                
                {post.images?.length > 0 ? (
                  <img
                    src={post.images[currentImageIndex[post.id] || 0]}
                    alt={`${post.author?.firstName || post.title} - Imagen`}
                    className="instagram-post-image"
                    onLoad={(e) => handleImageLoad(post.id, e)}
                  />
                ) : (
                  <div className="instagram-no-image"><User size={64} /></div>
                )}
                
                {post.images?.length > 1 && (
                  <>
                    <motion.div
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(post.id, post.images.length); }}
                      className="elegant-arrow elegant-prev"
                      data-interactive="true"
                      whileHover={{ scale: 1.1, x: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft size={20} color="white" strokeWidth={2.5} />
                    </motion.div>

                    <motion.div
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(post.id, post.images.length); }}
                      className="elegant-arrow elegant-next"
                      data-interactive="true"
                      whileHover={{ scale: 1.1, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight size={20} color="white" strokeWidth={2.5} />
                    </motion.div>
                  </>
                )}

                {post.images?.length > 1 && (
                  <div className="instagram-image-indicators" data-interactive="true">
                    {post.images.map((_, imageIndex) => (
                      <motion.div
                        key={imageIndex}
                        onClick={(e) => {
                          e.preventDefault(); e.stopPropagation();
                          setCurrentImageIndex(prev => ({ ...prev, [post.id]: imageIndex }));
                        }}
                        className={`instagram-indicator ${imageIndex === (currentImageIndex[post.id] || 0) ? 'active' : ''} ${post.plan === 'PREMIUM' && imageIndex === (currentImageIndex[post.id] || 0) ? 'premium' : post.plan === 'BASIC' && imageIndex === (currentImageIndex[post.id] || 0) ? 'basic' : post.isBoostActive && imageIndex === (currentImageIndex[post.id] || 0) ? 'boosted' : ''}`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }} 
                        data-interactive="true"
                      />
                    ))}
                  </div>
                )}
              </div>

              {renderActionButtons(post)}

              <div className="instagram-content">
                {post.title && <h4 className="instagram-title">{post.title}</h4>}

                {post.description && (
                  <div className="instagram-description-container">
                    <p className="instagram-description">
                      {expandedDescriptions[post.id] 
                        ? post.description 
                        : (post.description.length > 100 
                            ? `${post.description.substring(0, 100)}...` 
                            : post.description)
                      }
                      {post.description.length > 100 && (
                        <motion.button
                          onClick={(e) => toggleDescriptionExpansion(post.id, e)}
                          className="instagram-read-more"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          data-interactive="true"
                        >
                          {expandedDescriptions[post.id] ? ' mostrar menos' : ' más'}
                        </motion.button>
                      )}
                    </p>
                  </div>
                )}

                {post.sexo && post.sexo !== 'No especificado' && (
                  <div className="instagram-sexo">
                    <span className="instagram-sexo-tag">{post.sexo}</span>
                  </div>
                )}

                {(post.services || post.author?.escort?.services)?.length > 0 && (
                  <div className="instagram-services">
                    {(post.services || post.author?.escort?.services).slice(0, 3).map((service, index) => (
                      <span key={index} className="instagram-service-tag">
                        #{service.toLowerCase().replace(/\s+/g, '')}
                      </span>
                    ))}
                    {(post.services || post.author?.escort?.services).length > 3 && (
                      <span className="instagram-more-services">
                        +{(post.services || post.author?.escort?.services).length - 3} más
                      </span>
                    )}
                  </div>
                )}
              </div>

              {likeAnimations[post.id] && (
                <div className="like-hearts-container">
                  {likeAnimations[post.id].map((heart) => (
                    <motion.div
                      key={heart.id} 
                      className={`floating-heart ${post.isBoostActive ? 'boosted' : ''} ${post.plan === 'PREMIUM' ? 'premium' : post.plan === 'BASIC' ? 'basic' : ''}`}
                      style={{ 
                        fontSize: `${20 * heart.size}px`, 
                        transform: `rotate(${heart.rotation}deg)`
                      }}
                      initial={{ x: heart.x, y: heart.y, opacity: 0, scale: 0, rotate: heart.rotation }}
                      animate={{ 
                        x: heart.x + (heart.curve * 50), y: heart.y - 150 - (Math.random() * 100),
                        opacity: [0, 1, 1, 0.8, 0], scale: [0, heart.size * 1.5, heart.size * 1.2, heart.size * 0.8, 0],
                        rotate: heart.rotation + (heart.curve * 180)
                      }}
                      transition={{ duration: heart.duration, delay: heart.delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                      {heart.heart}
                    </motion.div>
                  ))}
                  
                  <motion.div
                    className={`explosion-center ${post.isBoostActive ? 'boosted' : ''} ${post.plan === 'PREMIUM' ? 'premium' : post.plan === 'BASIC' ? 'basic' : ''}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, post.plan === 'PREMIUM' ? 3.0 : post.plan === 'BASIC' ? 2.5 : post.isBoostActive ? 2.5 : 2, 0], 
                      opacity: [0, 1, 0], 
                      rotate: [0, 180] 
                    }}
                    transition={{ duration: post.plan === 'PREMIUM' ? 1.2 : post.plan === 'BASIC' ? 1.0 : post.isBoostActive ? 1.0 : 0.8, ease: "easeOut" }}
                    style={{
                      left: likeAnimations[post.id][0]?.x || 0, 
                      top: likeAnimations[post.id][0]?.y || 0
                    }}
                  >
                    {post.plan === 'PREMIUM' ? '👑' : post.plan === 'BASIC' ? '💙' : post.isBoostActive ? '⚡' : '💥'}
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  ), [mobilePostsVisible, currentImageIndex, imageDimensions, handleMobilePostToggle, handleProfileClick, handleImageLoad, prevImage, nextImage, setCurrentImageIndex, renderActionButtons, expandedDescriptions, toggleDescriptionExpansion, likeAnimations]);

  // Componente Modal de Verificación Anti-Bot
  const SimpleRobotCheckModal = React.memo(() => {
    return (
      <motion.div 
        className="verification-modal-overlay"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        onClick={handleCloseVerificationModal}
      >
        <motion.div 
          className="verification-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 30 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="verification-modal-header">
            <motion.button 
              onClick={handleCloseVerificationModal} 
              className="verification-close-btn"
              whileHover={{ background: 'rgba(255, 255, 255, 0.15)', scale: 1.1 }} 
              whileTap={{ scale: 0.95 }}
            >
              <X size={14} />
            </motion.button>
            
            <h3>Verificación de Seguridad</h3>
            <p>Confirma que eres humano para continuar</p>
          </div>

          <div className="verification-modal-body">
            <div className="whatsapp-contact-info">
              <WhatsAppIcon size={18} />
              <div>
                <div className="contact-number">Contactar: {pendingWhatsAppPhone}</div>
                <div className="contact-redirect">Serás redirigido automáticamente</div>
              </div>
            </div>

            <div className="verification-checkbox-container">
              <motion.div 
                className={`verification-checkbox ${isVerified ? 'verified' : ''}`}
                whileHover={!isVerified && !isVerifying ? { 
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                } : {}}
                onClick={!isVerified && !isVerifying ? handleVerifyRobot : undefined}
              >
                <motion.div 
                  className="checkbox-icon"
                  animate={{
                    scale: isVerifying ? [1, 1.1, 1] : 1
                  }}
                  transition={{
                    scale: { duration: 0.6, repeat: isVerifying ? Infinity : 0 }
                  }}
                >
                  {isVerifying && (
                    <motion.div
                      className="checkbox-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {isVerified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    >
                      <Check size={20} color="white" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>
                
                <div className="checkbox-label">
                  <motion.div 
                    className="checkbox-text"
                    animate={{
                      color: isVerified ? '#10b981' : 'white'
                    }}
                  >
                    {isVerified ? '✅ Verificado correctamente' : 
                     isVerifying ? 'Verificando...' : 'No soy un robot'}
                  </motion.div>
                </div>
              </motion.div>

              <AnimatePresence>
                {verificationError && (
                  <motion.div 
                    className="verification-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    ⚠️ {verificationError}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="verification-footer">
              🛡️ Sistema de seguridad TeloFundi
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  });

  // Componente Modal de Autenticación
  const AuthModal = React.memo(() => (
    <motion.div 
      className="auth-modal-overlay"
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      onClick={() => setShowAuthModal(null)}
    >
      <motion.div 
        className="auth-modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 300 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 300 }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="auth-modal-header">
          <motion.button 
            onClick={() => setShowAuthModal(null)} 
            className="auth-close-btn"
            whileHover={{ background: 'rgba(255, 255, 255, 0.2)' }} 
            whileTap={{ scale: 0.95 }}
          >
            <X size={16} />
          </motion.button>
          <div className="auth-logo">TF</div>
          <h3>¡Únete a TeloFundi!</h3>
          <p>Para chatear y contactar con los perfiles necesitas una cuenta</p>
        </div>
        
        <div className="auth-modal-body">
          <div className="auth-benefits">
            <div className="benefits-title">
              <Star size={16} />
              <span>Beneficios de tener cuenta:</span>
            </div>
            <ul className="benefits-list">
              <li>Chat directo con escorts y agencias</li>
              <li>Contacto por WhatsApp verificado</li>
              <li>Favoritos y historial personalizado</li>
              <li>Contenido de alta calidad</li>
              <li>🚀 Boost para destacar tus anuncios</li>
            </ul>
          </div>
          
          <div className="auth-buttons">
            <motion.button 
              onClick={() => { setShowAuthModal(null); if (onOpenAuthModal) onOpenAuthModal('register'); }} 
              className="auth-btn register-btn"
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <UserPlus size={18} />
              Crear Cuenta Gratis
            </motion.button>
            
            <motion.button 
              onClick={() => { setShowAuthModal(null); if (onOpenAuthModal) onOpenAuthModal('login'); }} 
              className="auth-btn login-btn"
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
            >
              <User size={18} />
              Ya tengo cuenta - Iniciar Sesión
            </motion.button>
          </div>
          
          <p className="auth-footer-text">Es rápido, seguro y completamente gratis</p>
        </div>
      </motion.div>
    </motion.div>
  ));

  // Componentes de estado
  const LoadingComponent = React.memo(({ showError = true }) => (
    <div className="loading-container">
      <Loader size={40} className="animate-spin loading-spinner" />
      {showError && error && (
        <>
          <p className="loading-error">{error}</p>
          <motion.button 
            onClick={handleRefresh} 
            className="retry-btn"
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} />
            Reintentar
          </motion.button>
        </>
      )}
    </div>
  ));

  const EmptyPostsComponent = React.memo(() => (
    <div className="empty-state-container">
      <Search size={48} className="empty-icon" />
      <h3>No hay posts disponibles</h3>
      <p>
        {activeTab === 'trending' ? 'No hay posts en tendencia en este momento' : 
         activeTab === 'discover' ? 'No hay posts para descubrir en este momento' : 'No se encontraron posts'}
      </p>
    </div>
  ));

  const EmptyTrendingComponent = React.memo(() => (
    <div className="empty-state-container">
      <TrendingUp size={48} className="empty-icon trending" />
      <h3>No hay tendencias disponibles</h3>
      <p className="empty-description">
        Los posts en tendencias se ordenan por: <strong>planes primero (PREMIUM {'>'} BASIC {'>'} FREE)</strong>, luego por engagement.
      </p>
      
      <div className="trending-algorithm-box">
        <div className="algorithm-title">
          <Zap size={16} />
          <span>Algoritmo de Trending:</span>
        </div>
        <ol className="algorithm-list">
          <li>👑 Posts PREMIUM (60%)</li>
          <li>✨ Posts BASIC (30%)</li>
          <li>⭐ Posts FREE (10%)</li>
          <li>❤️ Ordenados por likes dentro de cada plan</li>
        </ol>
      </div>
      
      <motion.button 
        onClick={handleRefresh} 
        className="retry-btn"
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
      >
        <TrendingUp size={16} />
        Actualizar Tendencias
      </motion.button>
    </div>
  ));

  const UnauthenticatedDiscoverComponent = React.memo(() => (
    <div className="empty-state-container">
      <Star size={48} className="empty-icon" />
      <h3>Contenido personalizado</h3>
      <p className="empty-description">
        Para ver el contenido personalizado "Para Ti" necesitas tener una cuenta. 
        Nuestro algoritmo usa tu historial e interacciones para recomendarte el mejor contenido.
      </p>
      
      <div className="discover-benefits-box">
        <div className="benefits-box-title">
          <Star size={16} />
          <span>Con tu cuenta tendrás:</span>
        </div>
        <ul className="benefits-box-list">
          <li>🎯 Recomendaciones personalizadas con IA</li>
          <li>💬 Chat directo con perfiles</li>
          <li>❤️ Guarda tus favoritos</li>
          <li>👑 Acceso a contenido Premium y Basic</li>
        </ul>
      </div>
      
      <motion.button 
        onClick={() => setShowAuthModal('register')} 
        className="create-account-btn"
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }}
      >
        <UserPlus size={16} />
        Crear Cuenta Gratis
      </motion.button>
    </div>
  ));

  // Contenido de pestañas
  const tabContent = {
    discover: () => {
      if (!hasAccessToDiscover || !hasAccessToDiscover()) {
        return <UnauthenticatedDiscoverComponent />;
      }
      
      if (loading && !refreshing) return <LoadingComponent />;
      if (error) return <LoadingComponent />;
      if (displayPosts.length === 0) return (
        <div className="empty-state-container">
          <Star size={48} className="empty-icon" />
          <h3>No hay posts recomendados</h3>
          <p>Explora más contenido para recibir recomendaciones personalizadas (50% Premium, 30% Basic, 20% Free).</p>
          {planStats && planStats.total > 0 && (
            <PlanStatsBanner 
              planStats={planStats} 
              planDistribution={planDistribution} 
              activeTab={activeTab} 
            />
          )}
        </div>
      );
      return renderPostsGrid(displayPosts);
    },
    
    overview: () => {
      if (loading && !refreshing) return <LoadingComponent />;
      if (error) return <LoadingComponent />;
      if (displayPosts.length === 0) return <EmptyPostsComponent />;
      return renderPostsGrid(displayPosts);
    },
    
    trending: () => {
      if (loading && !refreshing) return <LoadingComponent />;
      
      if (error) {
        return (
          <div className="empty-state-container">
            <TrendingUp size={48} className="empty-icon error" />
            <h3>Error cargando tendencias</h3>
            <p>{error}</p>
            <motion.button 
              onClick={handleRefresh} 
              className="retry-btn"
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} />
              Reintentar
            </motion.button>
          </div>
        );
      }
      
      if (displayPosts.length === 0) return <EmptyTrendingComponent />;
      return renderPostsGrid(displayPosts);
    }
  };

  // Manejar limpieza de búsqueda
  const handleSearchClear = React.useCallback(() => {
    setFilteredPosts([]);
    setIsSearching(false);
    setSearchQuery('');
  }, []);

  // Renderizado condicional principal
  if (currentView === 'profile' && selectedProfileId) {
    return (
      <EscortProfile
        profileId={selectedProfileId}
        initialData={selectedProfileData}
        onBack={handleBackToFeed}
        onStartChat={() => handleBackToFeed()}
        onToggleLike={(postData) => postData?.id && handleToggleLikeAndFavorite(postData.id)}
        onWhatsApp={handleWhatsAppWithVerification}
        onBanUser={(profile) => {
          if (actualUserType === 'ADMIN') {
            setShowBanModal(profile);
            handleBackToFeed();
          }
        }}
        userType={actualUserType}
      />
    );
  }

  if (currentView === 'chat' && chatTargetUserId) {
    return (
      <ChatPage
        userType={actualUserType.toLowerCase()}
        targetUserId={chatTargetUserId}
        onBack={handleBackToFeedFromChat}
      />
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-page-background" />

      <div className="feed-navigation">
        <SmartSearchBar
          posts={posts}
          onSearchChange={handleSearchChange}
          onSearchClear={handleSearchClear}
        />
        
        <div className="feed-tabs-container">
          {config.tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`feed-tab-button ${activeTab === tab.id ? 'active' : 'inactive'}`}
              onClick={() => handleTabChange(tab.id)}
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              {tab.icon === 'Heart' && <Heart size={16} style={{ color: activeTab === tab.id ? 'white' : '#e91e63' }} />}
              {tab.icon === 'Search' && <Search size={16} style={{ color: activeTab === tab.id ? 'white' : '#2196f3' }} />}
              {tab.icon === 'Star' && <Star size={16} style={{ color: activeTab === tab.id ? 'white' : '#ff9800' }} />}
              {tab.icon === 'TrendingUp' && <TrendingUp size={16} style={{ color: activeTab === tab.id ? 'white' : '#4caf50' }} />}
              {tab.icon === 'Shield' && <Shield size={16} style={{ color: activeTab === tab.id ? 'white' : '#9e9e9e' }} />}
              {tab.icon === 'Building2' && <Building2 size={16} style={{ color: activeTab === tab.id ? 'white' : '#9c27b0' }} />}
              <span>{tab.label}</span>
              {planStats && planStats.total > 0 && (tab.id === 'trending' || tab.id === 'discover') && (
                <motion.div
                  className="tab-plan-badge"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Crown size={10} />
                  {planStats.premium}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {planStats && planStats.total > 0 && (
          <PlanStatsBanner 
            planStats={planStats} 
            planDistribution={planDistribution} 
            activeTab={activeTab} 
          />
        )}
      </div>

      <div className="feed-content">
        <AnimatePresence mode="wait">
          {(['discover', 'overview', 'trending'].includes(activeTab)) && (
            <motion.div 
              key={activeTab} 
              className="feed-overview-container"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="feed-main-content">
                {isSearching && filteredPosts.length === 0 && (
                  <motion.div 
                    className="search-active-banner"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Search size={16} />
                    <span>No se encontraron resultados para "{searchQuery}"</span>
                    <motion.button
                      className="clear-search-banner-btn"
                      onClick={handleSearchClear}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X size={14} />
                      Limpiar
                    </motion.button>
                  </motion.div>
                )}
                {tabContent[activeTab]()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAuthModal && <AuthModal />}
        {showWhatsAppVerification && <SimpleRobotCheckModal />}
        
        {showBanModal && (
          <motion.div
            className="ban-modal-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setShowBanModal(null)}
          >
            <motion.div
              className="ban-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 50 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ban-modal-header">
                <Ban size={48} className="ban-icon" />
                <h3>Banear Usuario</h3>
                <p>
                  ¿Estás seguro de que quieres banear a {showBanModal.author?.firstName || showBanModal.name}?
                </p>
              </div>

              <div className="ban-modal-buttons">
                <motion.button
                  onClick={() => setShowBanModal(null)}
                  className="ban-cancel-btn"
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={confirmBan}
                  className="ban-confirm-btn"
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                >
                  Banear
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedPageDesign;