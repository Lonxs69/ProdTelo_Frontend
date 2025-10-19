import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Search, 
  User,
  MessageCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  Flame,
  Loader,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { favoritesAPI, handleApiError } from '../../../utils/api';
import EscortProfile from '../Profiles/EscortModal';
import ChatPage from '../chat/ChatPage';
import '../feed/FeedPageDesign.css';
import './FavoritesPage.css';

// Componente de icono verificado
const VerifiedBadge = ({ size = 16, className = '' }) => (
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

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
  </svg>
);

const FavoritesPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [currentView, setCurrentView] = useState('favorites');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [userLikesAndFavorites, setUserLikesAndFavorites] = useState(new Set());
  const [likeAnimations, setLikeAnimations] = useState({});
  const [mobilePostsVisible, setMobilePostsVisible] = useState({});
  
  const [chatTargetUserId, setChatTargetUserId] = useState(null);
  const [chatTargetUserData, setChatTargetUserData] = useState(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userType: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });

  const loadFavorites = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      setError(null);

      // Construir parámetros de búsqueda (sin q, filtraremos en frontend)
      const requestParams = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      
      // Agregar filtros opcionales solo si tienen valor
      if (filters.userType) {
        requestParams.userType = filters.userType;
      }
      
      const response = await favoritesAPI.getFavorites(requestParams);
      
      if (response.success && response.data) {
        if (response.data.favorites && Array.isArray(response.data.favorites)) {
          const postsFromFavorites = response.data.favorites.map((fav) => {
            const post = fav.post;
            const author = post.author;
            
            return {
              id: post.id,
              authorId: author.id,
              title: post.title,
              description: post.description,
              images: post.images || [],
              services: Array.isArray(post.services) ? post.services : [],
              phone: post.phone,
              location: post.locationRef ? {
                city: post.locationRef.city,
                country: post.locationRef.country,
                state: post.locationRef.state
              } : null,
              age: author.escort?.age || null,
              sexo: post.sexo || 'No especificado',
              verified: author.escort?.isVerified || author.agency?.isVerified || false,
              premium: post.premiumOnly || false,
              isActive: post.isActive,
              createdAt: post.createdAt,
              updatedAt: post.updatedAt,
              likesCount: post._count?.likes || 0,
              favoritesCount: post._count?.favorites || 0,
              views: post.views || 0,
              score: post.score || 0,
              engagementRate: post.engagementRate || 0,
              isLiked: true,
              isFavorited: true,
              author: {
                id: author.id,
                username: author.username,
                firstName: author.firstName,
                lastName: author.lastName,
                avatar: author.avatar,
                userType: author.userType,
                isActive: author.isActive,
                isBanned: author.isBanned,
                escort: author.escort,
                agency: author.agency
              },
              favoriteId: fav.id,
              favoriteCreatedAt: fav.createdAt,
              isNotified: fav.isNotified
            };
          });
          
          console.log('✅ Posts procesados:', postsFromFavorites.length);
          
          setFavorites(postsFromFavorites);
          
          if (response.data.pagination) {
            setPagination(response.data.pagination);
          }

          const favoritedIds = new Set(postsFromFavorites.map(post => post.id));
          setUserLikesAndFavorites(favoritedIds);
        } else {
          setFavorites([]);
          setPagination(prev => ({ ...prev, total: 0, pages: 0 }));
        }
      } else {
        setFavorites([]);
        setError(response.message || 'Error cargando favoritos');
      }
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      setError(error.message || 'Error de conexión al cargar favoritos');
      setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit, filters.sortBy, filters.sortOrder, filters.userType, searchTerm]);

  const handleToggleLikeAndFavorite = async (postId) => {
    try {
      const originalFavorites = [...favorites];
      const originalTotal = pagination.total;
      
      const updatedFavorites = favorites.filter(fav => fav.id !== postId);
      setFavorites(updatedFavorites);
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      
      setUserLikesAndFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });

      const response = await favoritesAPI.removeFromFavorites(postId);
      
      if (!response.success) {
        setFavorites(originalFavorites);
        setPagination(prev => ({ ...prev, total: originalTotal }));
        setUserLikesAndFavorites(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
        throw new Error(response.message || 'Error removiendo favorito');
      }
    } catch (error) {
      setError(handleApiError(error));
    }
  };

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
            <User size={className?.includes('instagram-profile-image') ? 20 : 40} />
          </div>
        )}
      </div>
    );
  });

  const nextImage = (postId) => {
    const post = favorites.find(p => p.id === postId);
    if (!post || !post.images || post.images.length <= 1) return;
    const currentIndex = currentImageIndex[postId] || 0;
    const nextIndex = (currentIndex + 1) % post.images.length;
    setCurrentImageIndex(prev => ({ ...prev, [postId]: nextIndex }));
  };

  const prevImage = (postId) => {
    const post = favorites.find(p => p.id === postId);
    if (!post || !post.images || post.images.length <= 1) return;
    const currentIndex = currentImageIndex[postId] || 0;
    const prevIndex = currentIndex === 0 ? post.images.length - 1 : currentIndex - 1;
    setCurrentImageIndex(prev => ({ ...prev, [postId]: prevIndex }));
  };

  const handleProfileClick = (post) => {
    const userId = post.authorId || post.userId || post.author?.id;
    if (!userId) return;
    
    const initialProfileData = {
      id: userId, authorId: userId, userId: userId,
      name: post.author ? `${post.author.firstName} ${post.author.lastName}` : post.name,
      firstName: post.author?.firstName || '', lastName: post.author?.lastName || '',
      username: post.author?.username || '', avatar: post.author?.avatar || post.profileImage || post.images?.[0] || '',
      age: post.age || post.author?.escort?.age || null,
      sexo: post.sexo || 'No especificado',
      location: post.location || post.author?.location || 'República Dominicana',
      phone: post.phone || post.author?.phone || '', bio: post.description || post.author?.bio || '',
      title: post.title || post.name || '', verified: post.verified || post.author?.escort?.isVerified || post.author?.agency?.isVerified || false,
      premium: post.premium || post.author?.isPremium || false,
      userType: post.type || post.userType || post.author?.userType || 'ESCORT',
      rating: post.rating || post.author?.escort?.rating || 0,
      reviewsCount: post.reviewsCount || post.author?.escort?.reviewsCount || 0,
      services: post.services || post.author?.escort?.services || [],
      rates: post.rates || post.author?.escort?.rates || {},
      availability: post.availability || post.author?.escort?.availability || {},
      languages: post.languages || post.author?.escort?.languages || ['Español'],
      isOnline: post.isOnline || Math.random() > 0.5,
      lastSeen: post.lastSeen || post.author?.lastActiveAt || new Date().toISOString(),
      createdAt: post.createdAt || post.author?.createdAt || new Date().toISOString(),
      agency: post.agency || post.author?.agency || null,
      canJoinAgency: post.canJoinAgency || (!post.author?.agency && post.author?.userType === 'ESCORT'),
      profileViews: post.profileViews || post.author?.profileViews || 0,
      images: post.images || [], author: post.author
    };
    
    setSelectedProfileId(userId);
    setSelectedProfileData(initialProfileData);
    setCurrentView('profile');
  };

  const handleBackToFeed = useCallback(() => {
    setCurrentView('favorites');
    setSelectedProfileId(null);
    setSelectedProfileData(null);
    setChatTargetUserId(null);
    setChatTargetUserData(null);
    setIsCreatingChat(false);
  }, []);

  const handleBackToFeedFromChat = useCallback(() => {
    setCurrentView('favorites');
    setChatTargetUserId(null);
    setChatTargetUserData(null);
    setIsCreatingChat(false);
  }, []);

  const isMobile = () => window.innerWidth <= 768;

  const handleMobilePostToggle = (postId, event) => {
    if (!isMobile()) return;
    const target = event.target;
    const clickedOnButton = target.closest('button') || target.closest('.modern-action-btn') || target.closest('.elegant-arrow') || target.closest('[data-interactive="true"]');
    if (clickedOnButton) return;
    setMobilePostsVisible(prev => ({ ...prev, [postId]: !prev[postId] }));
    event.stopPropagation();
  };

  const handleLikeWithAnimation = (postId, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.instagram-post-container');
    const containerRect = container.getBoundingClientRect();
    
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;
    const animationId = `${postId}-${Date.now()}`;
    
    const hearts = Array.from({ length: 15 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 15;
      const distance = 30 + Math.random() * 40;
      return {
        id: `${animationId}-${i}`,
        x: x + Math.cos(angle) * distance + (Math.random() - 0.5) * 30,
        y: y + Math.sin(angle) * distance + (Math.random() - 0.5) * 30,
        delay: i * 50,
        heart: '💔',
        size: 0.8 + Math.random() * 0.7,
        rotation: Math.random() * 360,
        duration: 2.5 + Math.random() * 1.5,
        curve: Math.random() > 0.5 ? 1 : -1
      };
    });
    
    setLikeAnimations(prev => ({ ...prev, [postId]: hearts }));
    setTimeout(() => setLikeAnimations(prev => { const newAnimations = { ...prev }; delete newAnimations[postId]; return newAnimations; }), 4500);
    
    handleToggleLikeAndFavorite(postId);
  };

  const handleChatAction = useCallback((post) => {
    if (isCreatingChat) return;
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
  }, [isCreatingChat]);

  const handleWhatsApp = (phone) => {
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  // Filtro temporal en el frontend (hasta que se arregle el backend)
  const filteredFavorites = React.useMemo(() => {
    if (!searchTerm.trim()) {
      return favorites;
    }
    
    const search = searchTerm.toLowerCase().trim();
    return favorites.filter(post => {
      const fullName = `${post.author?.firstName || ''} ${post.author?.lastName || ''}`.toLowerCase();
      const title = (post.title || '').toLowerCase();
      const description = (post.description || '').toLowerCase();
      const location = (post.location?.city || '').toLowerCase();
      const services = (post.services || []).join(' ').toLowerCase();
      
      return fullName.includes(search) ||
             title.includes(search) ||
             description.includes(search) ||
             location.includes(search) ||
             services.includes(search);
    });
  }, [favorites, searchTerm]);

  const renderPostsGrid = () => (
    <div className="favorites-posts-grid">
      {filteredFavorites.map((post, index) => (
        <motion.div
          key={post.id}
          className={`favorites-post-card ${mobilePostsVisible[post.id] ? 'mobile-active' : ''}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
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
                  {(post.verified || post.author?.escort?.isVerified || post.author?.agency?.isVerified) && (
                    <VerifiedBadge size={16} className="verified-icon" />
                  )}
                  {(post.age || post.author?.escort?.age) && (
                    <span className="profile-age">
                      • {post.age || post.author?.escort?.age} años
                    </span>
                  )}
                </h3>
                
                {post.location?.city && (
                  <div className="instagram-profile-location">
                    <MapPin className='Mapa' size={12} />
                    <span>{post.location.city}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="instagram-image-container">
              {post.images?.length > 0 ? (
                <img
                  src={post.images[currentImageIndex[post.id] || 0]}
                  alt={`${post.author?.firstName || post.title} - Imagen`}
                  className="instagram-post-image"
                />
              ) : (
                <div className="instagram-no-image"><User size={64} /></div>
              )}
              
              {post.images?.length > 1 && (
                <>
                  <motion.div
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevImage(post.id); }}
                    className="elegant-arrow elegant-prev"
                    data-interactive="true"
                    whileHover={{ scale: 1.1, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ChevronLeft size={20} color="white" strokeWidth={2.5} />
                  </motion.div>

                  <motion.div
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextImage(post.id); }}
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
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(prev => ({ ...prev, [post.id]: imageIndex })); }}
                      className={`instagram-indicator ${imageIndex === (currentImageIndex[post.id] || 0) ? 'active' : ''}`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      data-interactive="true"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="modern-actions-overlay" data-interactive="true">
              <div className="action-buttons-left">
                <motion.button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (isCreatingChat) return; handleChatAction(post); }}
                  className={`modern-action-btn chat-btn ${isCreatingChat ? 'disabled' : ''}`}
                  disabled={isCreatingChat}
                  whileHover={isCreatingChat ? {} : { scale: 1.1, y: -2 }}
                  whileTap={isCreatingChat ? {} : { scale: 0.95 }}
                  title={isCreatingChat ? 'Creando chat...' : 'Chatear'}
                >
                  <MessageCircle size={20} />
                  {isCreatingChat && (
                    <motion.div
                      className="chat-loading-spinner"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </motion.button>

                {post.phone && (
                  <motion.button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWhatsApp(post.phone); }}
                    className="modern-action-btn whatsapp-btn"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title="WhatsApp"
                  >
                    <WhatsAppIcon size={20} />
                  </motion.button>
                )}

                <motion.button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLikeWithAnimation(post.id, e); }}
                  className="modern-action-btn flame-btn active"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  title="Quitar de favoritos"
                >
                  <Flame size={24} />
                </motion.button>
              </div>

              {post.likesCount > 0 && (
                <div className="likes-counter-right">
                  <Heart size={12} />
                  <span>{post.likesCount}</span>
                </div>
              )}
            </div>

            <div className="instagram-content">
              {post.title && <h4 className="instagram-title">{post.title}</h4>}
              {post.description && (
                <div className="instagram-description-container">
                  <p className="instagram-description">
                    {post.description.length > 100 ? `${post.description.substring(0, 100)}...` : post.description}
                  </p>
                </div>
              )}
              {post.sexo && post.sexo !== 'No especificado' && (
                <div className="instagram-sexo">
                  <span className="instagram-sexo-tag">{post.sexo}</span>
                </div>
              )}
              {post.services?.length > 0 && (
                <div className="instagram-services">
                  {post.services.slice(0, 3).map((service, idx) => (
                    <span key={idx} className="instagram-service-tag">#{service.toLowerCase().replace(/\s+/g, '')}</span>
                  ))}
                  {post.services.length > 3 && (
                    <span className="instagram-more-services">+{post.services.length - 3} más</span>
                  )}
                </div>
              )}
            </div>

            {likeAnimations[post.id] && (
              <div className="like-hearts-container">
                {likeAnimations[post.id].map((heart) => (
                  <motion.div
                    key={heart.id}
                    className="floating-heart"
                    style={{ fontSize: `${20 * heart.size}px`, transform: `rotate(${heart.rotation}deg)` }}
                    initial={{ x: heart.x, y: heart.y, opacity: 0, scale: 0, rotate: heart.rotation }}
                    animate={{ 
                      x: heart.x + (heart.curve * 50), 
                      y: heart.y - 150 - (Math.random() * 100),
                      opacity: [0, 1, 1, 0.8, 0], 
                      scale: [0, heart.size * 1.5, heart.size * 1.2, heart.size * 0.8, 0],
                      rotate: heart.rotation + (heart.curve * 180)
                    }}
                    transition={{ duration: heart.duration, delay: heart.delay / 1000, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    {heart.heart}
                  </motion.div>
                ))}
                
                <motion.div
                  className="explosion-center"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2, 0], opacity: [0, 1, 0], rotate: [0, 180] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ left: likeAnimations[post.id][0]?.x || 0, top: likeAnimations[post.id][0]?.y || 0 }}
                >
                  💥
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    loadFavorites(true);
  }, [mounted, isAuthenticated, user, loadFavorites]);

  useEffect(() => {
    if (!mounted || !isAuthenticated || !user) return;
    
    const timeoutId = setTimeout(() => {
      // Resetear a página 1 cuando cambia la búsqueda
      setPagination(prev => {
        if (prev.page !== 1) {
          return { ...prev, page: 1 };
        }
        return prev;
      });
      
      // Forzar recarga inmediata
      loadFavorites(false);
    }, 500);
    
    return () => clearTimeout(timeoutId);
    // Solo dependemos de searchTerm para evitar loops infinitos
  }, [searchTerm]);

  if (!mounted) {
    return (
      <div className="loading-container">
        <Loader className="animate-spin loading-spinner" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="empty-state-container">
        <User size={64} className="empty-icon" />
        <h3>No Autenticado</h3>
        <p>Debes iniciar sesión para ver tus favoritos.</p>
      </div>
    );
  }

  if (currentView === 'chat' && chatTargetUserId) {
    return (
      <ChatPage
        userType={user?.userType?.toLowerCase() || 'client'}
        targetUserId={chatTargetUserId}
        onBack={handleBackToFeedFromChat}
      />
    );
  }

  if (currentView === 'profile' && selectedProfileId) {
    return (
      <EscortProfile
        profileId={selectedProfileId}
        initialData={selectedProfileData}
        onBack={handleBackToFeed}
        onStartChat={() => handleBackToFeed()}
        onToggleLike={(postData) => postData?.id && handleToggleLikeAndFavorite(postData.id)}
        onWhatsApp={handleWhatsApp}
        userType={user?.userType || 'CLIENT'}
      />
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-content">
        <AnimatePresence mode="wait">
          <motion.div 
            className="favorites-overview-container"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="favorites-main-content">
              {/* Buscador siempre visible */}
              <div className="favorites-search-container">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  className="favorites-search-input"
                  placeholder="Buscar en favoritos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="search-clear-btn" onClick={() => setSearchTerm('')}>
                    <X size={16} />
                  </button>
                )}
              </div>

              {loading && (
                <div className="loading-container">
                  <Loader className="animate-spin loading-spinner" size={40} />
                  <p className="loading-error">Cargando favoritos...</p>
                </div>
              )}

              {error && (
                <div className="loading-container">
                  <AlertCircle size={40} className="empty-icon error" />
                  <p className="loading-error">{error}</p>
                  <motion.button
                    onClick={() => loadFavorites(true)}
                    className="retry-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RefreshCw size={16} />
                    Reintentar
                  </motion.button>
                </div>
              )}

              {!loading && !error && favorites.length > 0 && renderPostsGrid()}

              {!loading && !error && favorites.length === 0 && (
                <div className="empty-state-container">
                  <Heart size={48} className="empty-icon" />
                  <h3>No tienes favoritos</h3>
                  <p className="empty-description">
                    {searchTerm 
                      ? `No se encontraron favoritos que coincidan con "${searchTerm}"`
                      : 'Aún no has marcado ninguna publicación como favorita'
                    }
                  </p>
                </div>
              )}

              {!loading && pagination.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem', padding: '1rem' }}>
                  <motion.button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={!pagination.hasPrev || loading}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
                      background: pagination.hasPrev ? '#ff6b35' : 'rgba(107, 114, 128, 0.5)', 
                      color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', 
                      cursor: pagination.hasPrev ? 'pointer' : 'not-allowed'
                    }}
                    whileHover={pagination.hasPrev ? { scale: 1.05 } : {}}
                    whileTap={pagination.hasPrev ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft size={16} />
                    Anterior
                  </motion.button>
                  
                  <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Página {pagination.page} de {pagination.pages}
                  </span>
                  
                  <motion.button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNext || loading}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', 
                      background: pagination.hasNext ? '#ff6b35' : 'rgba(107, 114, 128, 0.5)', 
                      color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.875rem', 
                      cursor: pagination.hasNext ? 'pointer' : 'not-allowed'
                    }}
                    whileHover={pagination.hasNext ? { scale: 1.05 } : {}}
                    whileTap={pagination.hasNext ? { scale: 0.95 } : {}}
                  >
                    Siguiente
                    <ChevronRight size={16} />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FavoritesPage;