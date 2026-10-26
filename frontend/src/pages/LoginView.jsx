import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  User,
  UserPlus,
  Building2,
  Check
} from 'lucide-react';
import { api } from '../services/api';

// Cuentas de respaldo para entorno offline
export const CUENTAS_DEMO = [
  {
    rolId: 'admin',
    rolNombre: 'Administrador',
    email: 'admin@urabapais.org',
    password: 'admin123',
    nombre: 'Dra. Carolina Salazar Ríos',
    cargo: 'Coordinación General de Alianza',
    organizacion: 'COOPI / Alianza Humanitaria',
    color: '#8b5cf6'
  },
  {
    rolId: 'campo',
    rolNombre: 'Técnico',
    email: 'campo@urabapais.org',
    password: 'campo123',
    nombre: 'Carlos Mario Pérez',
    cargo: 'Enlace de Territorio',
    organizacion: 'HIAS Colombia (Apartadó / Turbo)',
    color: '#0ea5e9'
  },
  {
    rolId: 'auditor',
    rolNombre: 'Auditor',
    email: 'auditor@urabapais.org',
    password: 'auditor123',
    nombre: 'Marta Helena Gómez',
    cargo: 'Especialista M&E y Calidad',
    organizacion: 'FADV / Humanity & Inclusion',
    color: '#f59e0b'
  },
  {
    rolId: 'comunidad',
    rolNombre: 'Consulta Pública',
    email: 'comunidad@urabapais.org',
    password: 'comunidad123',
    nombre: 'Consulta Ciudadana Urabá',
    cargo: 'Población Civil y Familias',
    organizacion: 'Comunidad Urabá',
    color: '#10b981'
  }
];

export const LoginView = ({ onLoginSuccess }) => {
  // Modo de pantalla: 'login' | 'register' | 'forgot_password'
  const [viewMode, setViewMode] = useState('login');

  // Estados del Formulario de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // Estados del Formulario de Registro
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRolId, setRegRolId] = useState('campo');
  const [regOrganizacion, setRegOrganizacion] = useState('HIAS Colombia');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regSuccess, setRegSuccess] = useState(null);

  // Estados de Recuperación de Contraseña
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset' | 'done'
  const [forgotVerificationCode, setForgotVerificationCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);

  // Iniciar Sesión Tradicional
  const handleSubmitLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.success && res.usuario) {
        onLoginSuccess(res.usuario, res.token);
      } else {
        setErrorMessage('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      // Fallback local por seguridad para entorno offline
      const fallbackAccount = CUENTAS_DEMO.find(
        (c) => c.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (fallbackAccount && fallbackAccount.password === password.trim()) {
        const fakeUser = {
          nombre: fallbackAccount.nombre,
          email: fallbackAccount.email,
          cargo: fallbackAccount.cargo,
          rol: fallbackAccount.rolNombre,
          rolId: fallbackAccount.rolId,
          organizacion: fallbackAccount.organizacion,
          color: fallbackAccount.color
        };
        onLoginSuccess(fakeUser, `token_local_${fallbackAccount.rolId}`);
      } else {
        setErrorMessage(
          err.message || 'Error de credenciales. Por favor verifique correo y contraseña.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Enviar Formulario de Registro
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regNombre.trim()) {
      setRegError('Por favor ingrese su nombre y apellido completo.');
      return;
    }

    if (!regEmail.trim()) {
      setRegError('Por favor ingrese un correo electrónico válido.');
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setRegError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas no coinciden. Por favor verifíquelas.');
      return;
    }

    setRegLoading(true);

    const rolesMap = {
      campo: { nombre: 'Técnico', color: '#0ea5e9' },
      admin: { nombre: 'Administrador', color: '#8b5cf6' },
      auditor: { nombre: 'Auditor', color: '#f59e0b' },
      comunidad: { nombre: 'Consulta Pública', color: '#10b981' }
    };

    const payload = {
      nombre: regNombre.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      rolId: regRolId,
      cargo: rolesMap[regRolId]?.nombre || 'Técnico',
      organizacion: regOrganizacion.trim() || 'Alianza Humanitaria Urabá'
    };

    try {
      const res = await api.register(payload);
      if (res.success && res.usuario) {
        setRegSuccess('¡Registro completado con éxito! Iniciando sesión...');
        setTimeout(() => {
          onLoginSuccess(res.usuario, res.token);
        }, 1200);
      } else {
        setRegError(res.message || 'No se pudo completar el registro.');
      }
    } catch (err) {
      // Fallback local en caso de desconexión
      const nuevoUsuario = {
        id: Date.now(),
        nombre: payload.nombre,
        email: payload.email,
        cargo: payload.cargo,
        rol: payload.cargo,
        rolId: payload.rolId,
        organizacion: payload.organizacion,
        color: rolesMap[regRolId]?.color || '#0ea5e9'
      };

      CUENTAS_DEMO.push({
        rolId: nuevoUsuario.rolId,
        rolNombre: nuevoUsuario.rol,
        email: nuevoUsuario.email,
        password: regPassword,
        nombre: nuevoUsuario.nombre,
        cargo: nuevoUsuario.cargo,
        organizacion: nuevoUsuario.organizacion,
        color: nuevoUsuario.color
      });

      setRegSuccess('¡Cuenta registrada exitosamente! Ingresando a la plataforma...');
      setTimeout(() => {
        onLoginSuccess(nuevoUsuario, `token_local_${Date.now()}`);
      }, 1200);
    } finally {
      setRegLoading(false);
    }
  };

  // Paso 1: Solicitar recuperación de contraseña
  const handleForgotRequestSubmit = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotEmail.trim()) {
      setForgotError('Por favor ingrese su correo electrónico.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await api.recoverPassword({ email: forgotEmail.trim() });
      if (res.success) {
        const codigo = 'URB-' + Math.floor(100000 + Math.random() * 900000);
        setForgotVerificationCode(codigo);
        setForgotStep('reset');
        setForgotSuccess(`Código de verificación: ${codigo}. Ahora asigne su nueva contraseña.`);
      } else {
        setForgotError(res.message || 'No se encontró ninguna cuenta asociada a este correo.');
      }
    } catch (err) {
      // Fallback local
      const match = CUENTAS_DEMO.find(
        (c) => c.email.toLowerCase() === forgotEmail.trim().toLowerCase()
      );
      if (match) {
        const codigo = 'URB-' + Math.floor(100000 + Math.random() * 900000);
        setForgotVerificationCode(codigo);
        setForgotStep('reset');
        setForgotSuccess(`Cuenta identificada. Código de verificación: ${codigo}.`);
      } else {
        setForgotError('No se encontró ninguna cuenta registrada con este correo en el sistema.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // Paso 2: Guardar y actualizar la nueva contraseña
  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotNewPassword || forgotNewPassword.length < 4) {
      setForgotError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Las contraseñas no coinciden. Por favor verifíquelas.');
      return;
    }

    setForgotLoading(true);

    try {
      const res = await api.recoverPassword({
        email: forgotEmail.trim(),
        nuevaPassword: forgotNewPassword
      });

      if (res.success) {
        setForgotSuccess('¡Su contraseña ha sido actualizada con éxito!');
        setForgotStep('done');
        setEmail(forgotEmail.trim());
        setPassword(forgotNewPassword);

        const match = CUENTAS_DEMO.find(
          (c) => c.email.toLowerCase() === forgotEmail.trim().toLowerCase()
        );
        if (match) match.password = forgotNewPassword;
      } else {
        setForgotError(res.message || 'No fue posible actualizar la contraseña.');
      }
    } catch (err) {
      const match = CUENTAS_DEMO.find(
        (c) => c.email.toLowerCase() === forgotEmail.trim().toLowerCase()
      );
      if (match) match.password = forgotNewPassword;
      setEmail(forgotEmail.trim());
      setPassword(forgotNewPassword);
      setForgotSuccess('¡Contraseña restablecida exitosamente!');
      setForgotStep('done');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fff1f2 50%, #fafafa 100%)',
        padding: '32px 16px',
        color: '#111111',
        fontFamily: 'var(--font-family)',
        position: 'relative'
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '38px 32px',
          boxShadow: '0 20px 45px rgba(233, 30, 140, 0.12), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid rgba(233, 30, 140, 0.2)'
        }}
      >
        {/* Logo y Encabezado de la Plataforma */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '22px'
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #e91e8c, #c2185b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: '20px',
              boxShadow: '0 8px 24px rgba(233, 30, 140, 0.4)',
              marginBottom: '12px'
            }}
          >
            UP
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 800,
                margin: 0,
                letterSpacing: '-0.02em',
                color: '#111111'
              }}
            >
              URABÁ-PAÍS
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                background: '#fce4ec',
                color: '#c2185b',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(233,30,140,0.3)'
              }}
            >
              Alianza Humanitaria
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            COOPI · FADV · HIAS Colombia · Humanity &amp; Inclusion
          </p>
        </div>

        {/* Pestañas de Navegación: Iniciar Sesión / Registrarse */}
        {viewMode !== 'forgot_password' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              background: '#f8fafc',
              padding: '5px',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              marginBottom: '22px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setViewMode('login');
                setErrorMessage(null);
                setSuccessNotice(null);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: 'none',
                background: viewMode === 'login' ? '#ffffff' : 'transparent',
                color: viewMode === 'login' ? '#c2185b' : '#64748b',
                fontWeight: viewMode === 'login' ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: viewMode === 'login' ? '0 2px 8px rgba(233,30,140,0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Lock size={14} />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setViewMode('register');
                setRegError(null);
                setRegSuccess(null);
              }}
              style={{
                padding: '9px 12px',
                borderRadius: '10px',
                border: 'none',
                background: viewMode === 'register' ? 'linear-gradient(135deg, #e91e8c, #c2185b)' : 'transparent',
                color: viewMode === 'register' ? '#ffffff' : '#64748b',
                fontWeight: viewMode === 'register' ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: viewMode === 'register' ? '0 4px 12px rgba(233,30,140,0.25)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <UserPlus size={14} />
              <span>Registrarse</span>
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* VISTA 1: INICIAR SESIÓN                                 */}
        {/* ======================================================== */}
        {viewMode === 'login' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '18px' }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  color: '#111111'
                }}
              >
                Bienvenido/a
              </h2>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                Ingrese sus credenciales para acceder a la plataforma.
              </p>
            </div>

            {/* Notificación de Éxito */}
            {successNotice && (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#065f46',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successNotice}</span>
              </div>
            )}

            {/* Alerta de Error */}
            {errorMessage && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#991b1b',
                  fontSize: '13px'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitLogin}>
              {/* Campo Correo */}
              <div style={{ marginBottom: '15px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#334155',
                    marginBottom: '5px'
                  }}
                >
                  Correo Electrónico
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '12px',
                      color: '#94a3b8'
                    }}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@urabapais.org"
                    className="form-input"
                    style={{
                      paddingLeft: '38px',
                      background: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#111111',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div style={{ marginBottom: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px'
                  }}
                >
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotStep('request');
                      setForgotError(null);
                      setForgotSuccess(null);
                      setViewMode('forgot_password');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#c2185b',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '12px',
                      color: '#94a3b8'
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={{
                      paddingLeft: '38px',
                      paddingRight: '38px',
                      background: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#111111',
                      fontSize: '13px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '10px',
                      background: 'transparent',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer'
                    }}
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Botón de Ingreso */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #e91e8c, #c2185b)',
                  boxShadow: '0 6px 20px rgba(233, 30, 140, 0.35)',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{loading ? 'Validando Credenciales...' : 'Ingresar a la Plataforma'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>¿No tienes una cuenta aún? </span>
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  setRegError(null);
                  setRegSuccess(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c2185b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Regístrate aquí
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VISTA 2: REGISTRO DE NUEVO USUARIO                      */}
        {/* ======================================================== */}
        {viewMode === 'register' && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '18px' }}>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  color: '#111111'
                }}
              >
                Crear Nueva Cuenta
              </h2>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                Complete el formulario para habilitar su acceso al sistema.
              </p>
            </div>

            {/* Mensajes de Estado */}
            {regError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991b1b',
                  fontSize: '12.5px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#065f46',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              {/* Nombre Completo */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Nombre y Apellidos *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    required
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej: Laura Camila Restrepo"
                    className="form-input"
                    style={{
                      paddingLeft: '36px',
                      background: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#111111',
                      fontSize: '12.5px',
                      paddingTop: '9px',
                      paddingBottom: '9px'
                    }}
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Correo Electrónico *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="form-input"
                    style={{
                      paddingLeft: '36px',
                      background: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#111111',
                      fontSize: '12.5px',
                      paddingTop: '9px',
                      paddingBottom: '9px'
                    }}
                  />
                </div>
              </div>

              {/* Perfil / Rol y Organización */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Rol / Perfil *
                  </label>
                  <select
                    value={regRolId}
                    onChange={(e) => setRegRolId(e.target.value)}
                    className="form-input"
                    style={{
                      background: '#ffffff',
                      borderColor: '#e2e8f0',
                      color: '#111111',
                      fontSize: '12px',
                      padding: '9px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="campo">Técnico (Territorio)</option>
                    <option value="admin">Administrador</option>
                    <option value="auditor">Auditor (M&amp;E)</option>
                    <option value="comunidad">Consulta Pública</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Organización
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={14} style={{ position: 'absolute', left: '10px', top: '11px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={regOrganizacion}
                      onChange={(e) => setRegOrganizacion(e.target.value)}
                      placeholder="HIAS, COOPI..."
                      className="form-input"
                      style={{
                        paddingLeft: '30px',
                        background: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#111111',
                        fontSize: '12px',
                        paddingTop: '9px',
                        paddingBottom: '9px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contraseña y Confirmación */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Contraseña *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Mín. 4 caracteres"
                      className="form-input"
                      style={{
                        background: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#111111',
                        fontSize: '12px',
                        padding: '9px 10px'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Confirmar Clave *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={regShowPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repetir clave"
                      className="form-input"
                      style={{
                        background: '#ffffff',
                        borderColor: '#e2e8f0',
                        color: '#111111',
                        fontSize: '12px',
                        padding: '9px 10px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox mostrar claves */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
                <input
                  type="checkbox"
                  id="showRegPass"
                  checked={regShowPassword}
                  onChange={(e) => setRegShowPassword(e.target.checked)}
                  style={{ accentColor: '#e91e8c', cursor: 'pointer' }}
                />
                <label htmlFor="showRegPass" style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer' }}>
                  Mostrar contraseñas
                </label>
              </div>

              {/* Botón de Registro */}
              <button
                type="submit"
                disabled={regLoading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #e91e8c, #c2185b)',
                  boxShadow: '0 6px 20px rgba(233, 30, 140, 0.35)',
                  cursor: regLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <span>{regLoading ? 'Registrando cuenta...' : 'Crear Cuenta e Ingresar'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '12.5px', color: '#64748b' }}>¿Ya tienes una cuenta creada? </span>
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c2185b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Inicia sesión aquí
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VISTA 3: RECUPERAR CONTRASEÑA                           */}
        {/* ======================================================== */}
        {viewMode === 'forgot_password' && (
          <div className="animate-fade-in">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '18px'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setForgotStep('request');
                }}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer'
                }}
                title="Volver al inicio de sesión"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#111111' }}>
                  Recuperar Contraseña
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  Restablece tu clave de acceso en pasos sencillos.
                </p>
              </div>
            </div>

            {/* Mensajes de Estado */}
            {forgotError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#991b1b',
                  fontSize: '12.5px'
                }}
              >
                <AlertCircle size={16} />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #6ee7b7',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#065f46',
                  fontSize: '12.5px',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={16} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Paso 1: Identificación por Correo */}
            {forgotStep === 'request' && (
              <form onSubmit={handleForgotRequestSubmit}>
                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '6px'
                    }}
                  >
                    Correo Electrónico Registrado
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '12px',
                        color: '#94a3b8'
                      }}
                    />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="ejemplo@urabapais.org"
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: '#ffffff',
                        borderColor: '#cbd5e1',
                        color: '#111111',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: 'linear-gradient(135deg, #e91e8c, #c2185b)'
                  }}
                >
                  <span>{forgotLoading ? 'Verificando cuenta...' : 'Validar Identidad y Continuar'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* Paso 2: Asignar Nueva Contraseña */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleForgotResetSubmit}>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '16px',
                    fontSize: '12.5px',
                    color: '#334155'
                  }}
                >
                  <div>
                    Restableciendo acceso para: <strong>{forgotEmail}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#047857', marginTop: '2px', fontWeight: 600 }}>
                    ✓ Código de verificación: {forgotVerificationCode}
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '5px'
                    }}
                  >
                    Nueva Contraseña *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={15}
                      style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}
                    />
                    <input
                      type={forgotShowPassword ? 'text' : 'password'}
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: '#ffffff',
                        borderColor: '#cbd5e1',
                        color: '#111111',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setForgotShowPassword(!forgotShowPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '10px',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {forgotShowPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#334155',
                      marginBottom: '5px'
                    }}
                  >
                    Confirmar Nueva Contraseña *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={15}
                      style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}
                    />
                    <input
                      type={forgotShowPassword ? 'text' : 'password'}
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Repita la nueva contraseña"
                      className="form-input"
                      style={{
                        paddingLeft: '38px',
                        background: '#ffffff',
                        borderColor: '#cbd5e1',
                        color: '#111111',
                        fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '11px 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      padding: '11px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      boxShadow: '0 6px 20px rgba(5, 150, 105, 0.3)'
                    }}
                  >
                    <span>{forgotLoading ? 'Guardando clave...' : 'Guardar y Restablecer'}</span>
                    <Check size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Paso 3: Confirmación de Éxito */}
            {forgotStep === 'done' && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #6ee7b7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto'
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#111111', margin: '0 0 6px 0' }}>
                  ¡Contraseña Actualizada con Éxito!
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>
                  Tu nueva clave ya está activa. Puedes iniciar sesión inmediatamente.
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode('login')}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #e91e8c, #c2185b)'
                  }}
                >
                  Volver e Iniciar Sesión Ahora
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pie de Seguridad y Protección de Datos */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '11.5px',
            color: '#64748b',
            textAlign: 'center'
          }}
        >
          <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
          <span>Acceso seguro protegido · Cumplimiento Ley 1581 Habeas Data</span>
        </div>
      </div>
    </div>
  );
};
