import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, X, Camera, Heart,
  Loader, AlertTriangle, Grid, List
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { userAPI, postsAPI, handleApiError } from '../../../utils/api';

const EscortProfile = ({ 
  profileId,
  initialData = null,
  onBack,
  userType 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // Estados locales
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [selectedPostImage, setSelectedPostImage] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Estados para datos del backend
  const [loading, setLoading] = useState(false);
  const [profileDetails, setProfileDetails] = useState(initialData);
  const [profilePosts, setProfilePosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ESTILOS MEJORADOS - SOLO GALERÍA
  React.useLayoutEffect(() => {
    const escortProfileCSS = `
      /* ===== ESCORT PROFILE GALLERY - MINIMALIST DARK ===== */
      
      .escort-profile-page {
        width: 100vw !important;
        max-width: 100vw !important;
        min-height: 100vh !important;
        background: #000000 !important;
        overflow-x: hidden !important;
        position: relative !important;
        margin: 0 !important;
        padding: 0 !important;
        padding-top: 8rem !important;
      }
      
      .escort-profile-header {
        position: fixed !important;
        top: 4rem !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 1000 !important;
        background: rgba(0, 0, 0, 0.95) !important;
        backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
        padding: 1rem 1.5rem !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 1rem !important;
        height: 64px !important;
      }
      
      .escort-profile-back-btn {
        padding: 0.7rem 1.5rem !important;
        border-radius: 8px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: white !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s ease !important;
        font-size: 0.95rem !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px !important;
      }
      
      .escort-profile-back-btn:hover {
        background: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.2) !important;
        transform: translateX(-2px) !important;
      }
      
      .escort-profile-title {
        flex: 1 !important;
        color: white !important;
        font-size: 1.1rem !important;
        font-weight: 600 !important;
        margin: 0 !important;
        text-align: center !important;
      }
      
      .escort-profile-content {
        padding: 1rem !important;
        max-width: 1400px !important;
        margin: 0 auto !important;
        position: relative !important;
      }
      
      .escort-profile-view-toggle {
        display: flex !important;
        gap: 0.5rem !important;
        background: rgba(255, 255, 255, 0.05) !important;
        padding: 0.3rem !important;
        border-radius: 8px !important;
      }
      
      .escort-profile-view-btn {
        width: 40px !important;
        height: 40px !important;
        border-radius: 6px !important;
        border: none !important;
        background: transparent !important;
        color: rgba(255, 255, 255, 0.6) !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s ease !important;
      }
      
      .escort-profile-view-btn.active {
        background: white !important;
        color: black !important;
      }
      
      .escort-profile-view-btn:not(.active):hover {
        color: white !important;
      }
      
      /* GRID VIEW */
      .escort-profile-posts-grid {
        display: grid !important;
        gap: 1rem !important;
        margin-bottom: 2rem !important;
      }
      
      @media (min-width: 1400px) {
        .escort-profile-posts-grid {
          grid-template-columns: repeat(5, 1fr) !important;
        }
      }
      
      @media (min-width: 1024px) and (max-width: 1399px) {
        .escort-profile-posts-grid {
          grid-template-columns: repeat(4, 1fr) !important;
        }
      }
      
      @media (min-width: 768px) and (max-width: 1023px) {
        .escort-profile-posts-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
      }
      
      @media (max-width: 767px) {
        .escort-profile-posts-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 0.75rem !important;
        }
      }
      
      /* LIST VIEW - MEJORADA PARA DESKTOP */
      .escort-profile-posts-list {
        display: flex !important;
        flex-direction: column !important;
        gap: 2rem !important;
        margin-bottom: 2rem !important;
      }
      
      @media (min-width: 768px) {
        .escort-profile-posts-list {
          max-width: 900px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
      }
      
      .escort-profile-post-card {
        position: relative !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        cursor: pointer !important;
        background: rgba(255, 255, 255, 0.02) !important;
        transition: all 0.3s ease !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
      }
      
      .escort-profile-post-card.grid-view {
        aspect-ratio: 1 !important;
      }
      
      .escort-profile-post-card.list-view {
        aspect-ratio: 3/2 !important;
        max-height: 600px !important;
      }
      
      @media (max-width: 767px) {
        .escort-profile-post-card.list-view {
          aspect-ratio: 4/3 !important;
          max-height: 400px !important;
        }
      }
      
      .escort-profile-post-card:hover {
        transform: translateY(-4px) !important;
        border-color: rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.8) !important;
      }
      
      .escort-profile-post-image {
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        transition: transform 0.3s ease !important;
      }
      
      .escort-profile-post-card:hover .escort-profile-post-image {
        transform: scale(1.05) !important;
      }
      
      .escort-profile-post-overlay {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%) !important;
        display: flex !important;
        align-items: flex-end !important;
        padding: 1.5rem !important;
        opacity: 0 !important;
        transition: opacity 0.3s ease !important;
      }
      
      .escort-profile-post-card.list-view .escort-profile-post-overlay {
        padding: 2rem !important;
      }
      
      .escort-profile-post-card:hover .escort-profile-post-overlay {
        opacity: 1 !important;
      }
      
      .escort-profile-post-stats {
        display: flex !important;
        align-items: center !important;
        gap: 1rem !important;
        width: 100% !important;
      }
      
      .escort-profile-post-stat {
        display: flex !important;
        align-items: center !important;
        gap: 0.5rem !important;
        color: white !important;
        font-size: 1rem !important;
        font-weight: 600 !important;
        background: rgba(0, 0, 0, 0.7) !important;
        padding: 0.5rem 1rem !important;
        border-radius: 8px !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .escort-profile-post-card.list-view .escort-profile-post-stat {
        font-size: 1.1rem !important;
        padding: 0.6rem 1.2rem !important;
      }
      
      .escort-profile-post-count {
        position: absolute !important;
        top: 1rem !important;
        right: 1rem !important;
        background: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        padding: 0.4rem 0.8rem !important;
        border-radius: 6px !important;
        font-size: 0.9rem !important;
        display: flex !important;
        align-items: center !important;
        gap: 0.4rem !important;
        font-weight: 600 !important;
        backdrop-filter: blur(10px) !important;
      }
      
      .escort-profile-post-card.list-view .escort-profile-post-count {
        top: 1.5rem !important;
        right: 1.5rem !important;
        padding: 0.5rem 1rem !important;
        font-size: 1rem !important;
      }
      
      .escort-profile-loading {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 400px !important;
        flex-direction: column !important;
        gap: 1.5rem !important;
      }
      
      .escort-profile-empty {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-height: 400px !important;
        flex-direction: column !important;
        gap: 1rem !important;
        text-align: center !important;
        padding: 3rem 2rem !important;
        background: rgba(255, 255, 255, 0.02) !important;
        border-radius: 16px !important;
        border: 1px solid rgba(255, 255, 255, 0.05) !important;
      }
      
      /* IMAGE MODAL */
      .escort-profile-modal {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        background: rgba(0, 0, 0, 0.98) !important;
        z-index: 2000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 2rem !important;
      }
      
      .escort-profile-modal-close {
        position: absolute !important;
        top: 1.5rem !important;
        right: 1.5rem !important;
        width: 50px !important;
        height: 50px !important;
        border-radius: 50% !important;
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: white !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 2001 !important;
        transition: all 0.3s ease !important;
      }
      
      .escort-profile-modal-close:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: scale(1.1) !important;
      }
      
      .escort-profile-modal-nav {
        position: absolute !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: 50px !important;
        height: 50px !important;
        border-radius: 50% !important;
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: white !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s ease !important;
      }
      
      .escort-profile-modal-nav:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: translateY(-50%) scale(1.1) !important;
      }
      
      .escort-profile-modal-nav.left {
        left: 1.5rem !important;
      }
      
      .escort-profile-modal-nav.right {
        right: 1.5rem !important;
      }
      
      .escort-profile-modal-image {
        max-width: 100% !important;
        max-height: 100% !important;
        object-fit: contain !important;
        border-radius: 8px !important;
      }
      
      .escort-profile-modal-counter {
        position: absolute !important;
        bottom: 2rem !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: rgba(0, 0, 0, 0.8) !important;
        color: white !important;
        padding: 0.6rem 1.2rem !important;
        border-radius: 8px !important;
        font-size: 0.9rem !important;
        font-weight: 600 !important;
        backdrop-filter: blur(10px) !important;
      }
      
      /* RESPONSIVE */
      @media (max-width: 768px) {
        .escort-profile-page {
          padding-top: 7.5rem !important;
        }
        
        .escort-profile-header {
          padding: 0.75rem 1rem !important;
          height: 56px !important;
        }
        
        .escort-profile-content {
          padding: 0.75rem !important;
        }
        
        .escort-profile-title {
          font-size: 1rem !important;
        }
        
        .escort-profile-back-btn {
          padding: 0.6rem 1.2rem !important;
          font-size: 0.9rem !important;
        }
        
        .escort-profile-modal {
          padding: 1rem !important;
        }
        
        .escort-profile-modal-close {
          top: 1rem !important;
          right: 1rem !important;
          width: 44px !important;
          height: 44px !important;
        }
        
        .escort-profile-modal-nav {
          width: 44px !important;
          height: 44px !important;
        }
        
        .escort-profile-modal-nav.left {
          left: 1rem !important;
        }
        
        .escort-profile-modal-nav.right {
          right: 1rem !important;
        }
      }
      
      @media (max-width: 480px) {
        .escort-profile-post-stat {
          font-size: 0.85rem !important;
          padding: 0.4rem 0.8rem !important;
        }
        
        .escort-profile-post-count {
          font-size: 0.8rem !important;
          padding: 0.3rem 0.6rem !important;
        }
      }
    `;
    
    const existingStyle = document.getElementById('escort-profile-styles');
    if (existingStyle) existingStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'escort-profile-styles';
    style.textContent = escortProfileCSS;
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById('escort-profile-styles');
      if (styleToRemove) styleToRemove.remove();
    };
  }, []);

  // CARGAR POSTS DEL PERFIL
  const loadProfilePosts = async (userId) => {
    try {
      setPostsLoading(true);
      
      console.log('📸 Loading posts for user:', userId);
      
      // Método 1: Búsqueda específica por autor
      try {
        const response = await postsAPI.searchPosts({
          authorId: userId,
          page: 1,
          limit: 100,
          sortBy: 'recent'
        });
        
        if (response.success && response.data.posts && response.data.posts.length > 0) {
          console.log('✅ Posts loaded via search:', response.data);
          const posts = response.data.posts || [];
          
          const userPosts = posts.filter(post => 
            post.author?.id === userId || 
            post.authorId === userId ||
            post.userId === userId
          );
          
          console.log('✅ Filtered posts:', userPosts.length);
          setProfilePosts(userPosts);
          return;
        }
      } catch (searchError) {
        console.warn('⚠️ Search failed, trying fallback:', searchError.message);
      }
      
      // Método 2: Fallback - obtener todos y filtrar
      console.log('📋 Fallback: Loading all posts');
      
      const fallbackResponse = await postsAPI.getFeed({
        page: 1,
        limit: 200,
        sortBy: 'recent'
      });
      
      if (fallbackResponse.success) {
        console.log('✅ All posts loaded:', fallbackResponse.data);
        const allPosts = fallbackResponse.data.posts || [];
        
        const userPosts = allPosts.filter(post => {
          const authorMatch = post.author?.id === userId || 
                             post.authorId === userId ||
                             post.userId === userId;
          return authorMatch;
        });
        
        console.log('✅ Filtered posts (fallback):', userPosts.length);
        setProfilePosts(userPosts);
      } else {
        throw new Error(fallbackResponse.message || 'Error loading posts');
      }
    } catch (error) {
      console.error('❌ Error loading posts:', error);
      setProfilePosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  // Cargar posts al montar
  useEffect(() => {
    if (profileId) {
      console.log('🚀 Loading profile posts for:', profileId);
      loadProfilePosts(profileId);
    }
  }, [profileId]);

  // Expandir imagen
  const expandImage = (post, imageIndex = 0) => {
    setSelectedPost(post);
    setSelectedPostImage({ post, imageIndex });
    setIsImageExpanded(true);
  };

  return (
    <div className="escort-profile-page">
      {/* HEADER */}
      <div className="escort-profile-header">
        <motion.button
          onClick={onBack}
          className="escort-profile-back-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ATRÁS
        </motion.button>
        
        <h1 className="escort-profile-title">
          Galería de Fotos
        </h1>
        
        <div className="escort-profile-view-toggle">
          <button
            onClick={() => setViewMode('grid')}
            className={`escort-profile-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`escort-profile-view-btn ${viewMode === 'list' ? 'active' : ''}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      <div className="escort-profile-content">
        {/* LOADING */}
        {postsLoading && (
          <div className="escort-profile-loading">
            <Loader size={40} className="animate-spin" style={{ color: 'white' }} />
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '1rem', margin: 0 }}>
              Cargando fotos...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && !postsLoading && (
          <div className="escort-profile-loading">
            <AlertTriangle size={40} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
            <h3 style={{ color: 'white', fontSize: '1.1rem', margin: 0 }}>
              Error al cargar
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!postsLoading && !error && profilePosts.length === 0 && (
          <div className="escort-profile-empty">
            <Camera size={48} style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            <h3 style={{ color: 'white', fontSize: '1.2rem', margin: 0 }}>
              No hay fotos
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.95rem', margin: 0 }}>
              Este perfil aún no ha publicado contenido
            </p>
          </div>
        )}

        {/* POSTS GALLERY */}
        {!postsLoading && !error && profilePosts.length > 0 && (
          <div className={viewMode === 'grid' ? 'escort-profile-posts-grid' : 'escort-profile-posts-list'}>
            {profilePosts.map((post, index) => (
              <motion.div
                key={post.id}
                onClick={() => expandImage(post, 0)}
                className={`escort-profile-post-card ${viewMode}-view`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {post.images && post.images.length > 0 ? (
                  <img
                    src={post.images[0]}
                    alt={`Foto ${index + 1}`}
                    className="escort-profile-post-image"
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.03)'
                  }}>
                    <Camera size={32} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
                  </div>
                )}

                <div className="escort-profile-post-overlay">
                  <div className="escort-profile-post-stats">
                    <div className="escort-profile-post-stat">
                      <Heart size={18} style={{ color: 'white' }} />
                      <span>{post.likesCount || 0}</span>
                    </div>
                  </div>
                </div>

                {post.images && post.images.length > 1 && (
                  <div className="escort-profile-post-count">
                    <Camera size={14} />
                    <span>{post.images.length}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* IMAGE MODAL */}
      <AnimatePresence>
        {isImageExpanded && selectedPostImage && (
          <motion.div
            className="escort-profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageExpanded(false)}
          >
            <motion.button
              onClick={() => setIsImageExpanded(false)}
              className="escort-profile-modal-close"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={24} />
            </motion.button>

            <img
              src={selectedPostImage.post.images[selectedPostImage.imageIndex]}
              alt="Imagen expandida"
              className="escort-profile-modal-image"
              onClick={(e) => e.stopPropagation()}
            />

            {selectedPostImage.post.images.length > 1 && (
              <>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = selectedPostImage.imageIndex === 0 
                      ? selectedPostImage.post.images.length - 1 
                      : selectedPostImage.imageIndex - 1;
                    setSelectedPostImage(prev => ({ ...prev, imageIndex: newIndex }));
                  }}
                  className="escort-profile-modal-nav left"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft size={24} />
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = selectedPostImage.imageIndex === selectedPostImage.post.images.length - 1 
                      ? 0 
                      : selectedPostImage.imageIndex + 1;
                    setSelectedPostImage(prev => ({ ...prev, imageIndex: newIndex }));
                  }}
                  className="escort-profile-modal-nav right"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight size={24} />
                </motion.button>

                <div className="escort-profile-modal-counter">
                  {selectedPostImage.imageIndex + 1} / {selectedPostImage.post.images.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EscortProfile;