import React, { useState, useRef, useEffect } from 'react';
import { Camera, Edit3, Save, Shield, Loader, X, AlertCircle } from 'lucide-react';
import { userAPI, handleApiError } from '../../utils/api';

const ProfileInfo = ({ 
  user, 
  updateUser, 
  profileData, 
  editData, 
  setEditData, 
  loadUserProfile, 
  onError 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef(null);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleInputChange = (field, value) => {
    console.log(`🔄 Cambiando ${field}:`, `"${value}" (${typeof value})`);
    
    setEditData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log(`🔄 editData actualizado para ${field}:`, newData[field]);
      return newData;
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    console.log('🔍 === DEBUGGING FORM SUBMIT ===');
    console.log('🔍 editData completo:', editData);
    console.log('🔍 user.userType:', user?.userType);
    console.log('🔍 isEditing:', isEditing);

    try {
      setLoading(true);
      onError(null);

      const updateData = {};

      console.log('📝 Procesando campos básicos...');
      
      if (editData.firstName?.trim()) {
        updateData.firstName = editData.firstName.trim();
        console.log('✅ firstName:', updateData.firstName);
      }
      
      if (editData.lastName?.trim()) {
        updateData.lastName = editData.lastName.trim();
        console.log('✅ lastName:', updateData.lastName);
      }
      
      if (editData.bio !== undefined) {
        updateData.bio = editData.bio?.trim() || null;
        console.log('✅ bio:', updateData.bio);
      }
      
      // Campos ocultos pero preservados para el backend
      if (editData.phone?.trim()) {
        updateData.phone = editData.phone.trim();
        console.log('✅ phone (hidden):', updateData.phone);
      }
      
      if (editData.website?.trim()) {
        updateData.website = editData.website.trim();
        console.log('✅ website (hidden):', updateData.website);
      }

      // Campos específicos de escort
      if (user?.userType === 'ESCORT') {
        console.log('🏷️ Procesando campos de ESCORT...');
        
        if (editData.age && !isNaN(editData.age)) {
          updateData.age = parseInt(editData.age);
          console.log('✅ age (hidden):', updateData.age);
        }
        
        if (editData.height && !isNaN(editData.height)) {
          updateData.height = parseInt(editData.height);
          console.log('✅ height:', updateData.height);
        }
        
        if (editData.weight && !isNaN(editData.weight)) {
          updateData.weight = parseInt(editData.weight);
          console.log('✅ weight:', updateData.weight);
        }
        
        if (editData.bodyType) {
          updateData.bodyType = editData.bodyType;
          console.log('✅ bodyType:', updateData.bodyType);
        }
        
        if (editData.ethnicity) {
          updateData.ethnicity = editData.ethnicity;
          console.log('✅ ethnicity:', updateData.ethnicity);
        }
        
        if (editData.hairColor) {
          updateData.hairColor = editData.hairColor;
          console.log('✅ hairColor:', updateData.hairColor);
        }
        
        if (editData.eyeColor) {
          updateData.eyeColor = editData.eyeColor;
          console.log('✅ eyeColor:', updateData.eyeColor);
        }
        
        if (editData.experience) {
          updateData.experience = editData.experience;
          console.log('✅ experience:', updateData.experience);
        }
        
        if (editData.preferredClientType) {
          updateData.preferredClientType = editData.preferredClientType;
          console.log('✅ preferredClientType:', updateData.preferredClientType);
        }
        
        if (editData.aboutMe?.trim()) {
          updateData.aboutMe = editData.aboutMe.trim();
          console.log('✅ aboutMe:', updateData.aboutMe);
        }
        
        if (editData.education?.trim()) {
          updateData.education = editData.education.trim();
          console.log('✅ education:', updateData.education);
        }
        
        if (editData.incallLocation?.trim()) {
          updateData.incallLocation = editData.incallLocation.trim();
          console.log('✅ incallLocation:', updateData.incallLocation);
        }

        // Arrays
        if (editData.services && Array.isArray(editData.services) && editData.services.length > 0) {
          updateData.services = editData.services;
          console.log('✅ services:', updateData.services);
        }
        
        if (editData.languages && Array.isArray(editData.languages) && editData.languages.length > 0) {
          updateData.languages = editData.languages;
          console.log('✅ languages:', updateData.languages);
        }

        // Objetos
        if (editData.rates && typeof editData.rates === 'object' && Object.keys(editData.rates).length > 0) {
          updateData.rates = editData.rates;
          console.log('✅ rates:', updateData.rates);
        }
        
        if (editData.availability && typeof editData.availability === 'object' && Object.keys(editData.availability).length > 0) {
          updateData.availability = editData.availability;
          console.log('✅ availability:', updateData.availability);
        }
      }

      console.log('📤 === DATOS FINALES ===');
      console.log('📤 updateData completo:', JSON.stringify(updateData, null, 2));
      console.log('📤 Número de campos:', Object.keys(updateData).length);

      if (Object.keys(updateData).length === 0) {
        console.log('❌ No hay cambios para guardar');
        onError('No hay cambios para guardar');
        return;
      }

      console.log('🚀 Enviando petición al backend...');
      const response = await userAPI.updateProfile(updateData);
      
      console.log('✅ Respuesta recibida:', response);

      if (response.success) {
        console.log('✅ Actualizando contexto de usuario...');
        await updateUser(response.data);
        
        console.log('✅ Recargando perfil...');
        await loadUserProfile();
        
        setIsEditing(false);
        console.log('✅ ¡Perfil actualizado exitosamente!');
      } else {
        console.log('❌ Respuesta no exitosa:', response);
        onError(response.message || 'Error desconocido');
      }
    } catch (error) {
      console.error('❌ === ERROR COMPLETO ===');
      console.error('❌ Error:', error);
      console.error('❌ Message:', error.message);
      console.error('❌ Stack:', error.stack);
      console.error('❌ Status:', error.status);
      console.error('❌ Response:', error.response);
      onError(handleApiError(error));
    } finally {
      setLoading(false);
      console.log('🏁 Finalizando handleFormSubmit');
    }
  };

  const handleCancelEdit = () => {
    loadUserProfile();
    setIsEditing(false);
    onError(null);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const response = await userAPI.uploadAvatar(file);

        if (response.success) {
          await updateUser(response.data.user);
          await loadUserProfile();
          setAvatarError(false);
          console.log('✅ Avatar actualizado exitosamente');
        }
      } catch (error) {
        console.error('❌ Error subiendo avatar:', error);
        onError(handleApiError(error));
      } finally {
        setLoading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: isMobile ? '1rem' : '2rem' 
    }}>
      <form
        onSubmit={handleFormSubmit}
        style={{ 
          background: '#0e0d0dff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px', 
          padding: isMobile ? '1rem' : '1.5rem',
          maxWidth: isMobile ? '100%' : '520px',
          margin: isMobile ? '60px auto 0' : '70px auto',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Sección de avatar */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            padding: '0.75rem',
            background: '#1b1a1aff',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flex: isMobile ? 'none' : 1
          }}>
            <div style={{ position: 'relative', width: '50px', height: '50px', flexShrink: 0 }}>
              {profileData.avatar && !avatarError ? (
                <img
                  src={profileData.avatar}
                  alt="Profile Avatar"
                  onError={handleAvatarError}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #0f0e0eff',
                    display: 'block',
                  }}
                />
              ) : (
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: '#181717ff',
                  border: '2px solid #0f0e0eff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af'
                }}>
                  <Camera size={24} />
                </div>
              )}
              {profileData.accountInfo?.isVerified && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '20px',
                    height: '20px',
                    background: '#3b82f6',
                    border: '2px solid #000',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <Shield size={10} />
                </div>
              )}
              {loading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Loader style={{ animation: 'spin 1s linear infinite' }} size={16} color="#b6390cff" />
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: '600',
                  color: 'white',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {profileData.name || 'Usuario'}
              </div>
            </div>
          </div>
          <button
            type="button"
            style={{
              background: loading ? '#b6390cff' : '#b6390cff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: isMobile ? '0.6rem 1rem' : '0.4rem 0.8rem',
              fontSize: isMobile ? '0.85rem' : '0.8rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              width: isMobile ? '100%' : 'auto',
              flexShrink: 0,
              opacity: loading ? 0.7 : 1
            }}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            {loading ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={12} />}
            Cambiar foto
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            style={{ display: 'none' }}
            disabled={loading}
          />
        </div>

        {/* Formulario responsivo */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '1rem' : '1rem 1.5rem',
            alignItems: 'start',
          }}
        >
          {/* NOMBRE */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.4rem',
              }}
            >
              Nombre
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={editData.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: '#000000ff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.8rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Tu nombre"
              />
            ) : (
              <div
                style={{
                  padding: '0.6rem',
                  background: '#000000ff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#d1d5db',
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {editData.firstName || 'No especificado'}
              </div>
            )}
          </div>

          {/* APELLIDO */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.4rem',
              }}
            >
              Apellido
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={editData.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: '#000000ff',
                  border: '1px solid #373636ff',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.8rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Tu apellido"
              />
            ) : (
              <div
                style={{
                  padding: '0.6rem',
                  background: '#000000ff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#d1d5db',
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {editData.lastName || 'No especificado'}
              </div>
            )}
          </div>

          {/* DESCRIPCIÓN - Ocupa toda la fila */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.4rem',
              }}
            >
              Descripción
            </label>
            {isEditing ? (
              <div style={{ position: 'relative' }}>
                <textarea
                  name="bio"
                  value={editData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  maxLength={500}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: '#000000ff',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '0.8rem',
                    resize: 'none',
                    fontFamily: 'inherit',
                    minHeight: `${Math.max(60, Math.ceil((editData.bio || '').length / 60) * 20 + 40)}px`,
                    height: 'auto',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Cuéntanos sobre ti..."
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.4rem',
                    right: '0.6rem',
                    fontSize: '0.7rem',
                    color: '#6b7280',
                  }}
                >
                  {(editData.bio || '').length} / 500
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '0.6rem',
                  background: '#000000ff',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#d1d5db',
                  fontSize: '0.8rem',
                  minHeight: `${Math.max(60, Math.ceil((editData.bio || '').length / 60) * 20 + 20)}px`,
                  lineHeight: '1.5',
                }}
              >
                {editData.bio || 'No especificado'}
              </div>
            )}
          </div>

          {/* EMAIL - Solo lectura */}
          <div style={{ gridColumn: '1 / -1' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'white',
                marginBottom: '0.4rem',
              }}
            >
              Email
            </label>
            <div
              style={{
                padding: '0.6rem',
                background: '#000000ff',
                border: '1px solid #504d4dff',
                borderRadius: '8px',
                color: '#9ca3af',
                fontSize: '0.8rem',
                opacity: 0.7,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {profileData.email || 'No especificado'}
            </div>
            {isEditing && (
              <p
                style={{
                  fontSize: '0.7rem',
                  color: '#6b7280',
                  margin: '0.4rem 0 0 0',
                  lineHeight: '1.4',
                }}
              >
                El email no se puede modificar por seguridad
              </p>
            )}
          </div>

          {/* BOTONES */}
          {isEditing ? (
            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#d1d5db',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: loading ? 0.5 : 1
                }}
                onClick={handleCancelEdit}
                disabled={loading}
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: loading ? 'rgba(182, 57, 12, 0.7)' : '#b6390cff',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Guardar
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              style={{
                gridColumn: '1 / -1',
                width: '100%',
                padding: '0.75rem',
                background: '#b6390cff',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={16} />
              Editar Perfil
            </button>
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #333',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              textAlign: 'center',
              margin: '0',
              lineHeight: '1.4',
            }}
          >
            Cierta información del perfil, como tu nombre, bio y enlaces, es visible para todos.
          </p>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileInfo;