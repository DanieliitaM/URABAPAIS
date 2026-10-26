import React, { useState, useEffect } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { BeneficiaryConsolidatedModal } from './components/BeneficiaryConsolidatedModal';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { PrivacyRestrictedScreen } from './components/PrivacyRestrictedScreen';
import { DashboardView } from './pages/DashboardView';
import { BeneficiaryListView } from './pages/BeneficiaryListView';
import { RegistrationWizardView } from './pages/RegistrationWizardView';
import { ProgramsView } from './pages/ProgramsView';
import { AttentionsView } from './pages/AttentionsView';
import { FollowupsView } from './pages/FollowupsView';
import { PublicPortalView } from './pages/PublicPortalView';
import { LoginView } from './pages/LoginView';
import { api } from './services/api';
import { ROLES, getRoleById, isTabAllowed } from './services/roles';
import {
  CheckCircle,
  AlertCircle,
  LayoutDashboard,
  Users,
  UserPlus,
  FolderOpen,
  HeartHandshake,
  Clock,
  Globe,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LogOut,
  User
} from 'lucide-react';

const PAGE_META = {
  dashboard:       { title: 'Tablero General',          subtitle: 'Indicadores y métricas del sistema', icon: LayoutDashboard },
  beneficiarios:   { title: 'Directorio de Personas',   subtitle: 'Lista y búsqueda de beneficiarios',   icon: Users },
  'nuevo-registro':{ title: 'Nuevo Registro',            subtitle: 'Registro paso a paso de beneficiario', icon: UserPlus },
  programas:       { title: 'Programas y Líneas',        subtitle: 'Gestión de programas humanitarios',    icon: FolderOpen },
  atenciones:      { title: 'Atenciones y Ayudas',       subtitle: 'Registro de servicios prestados',      icon: HeartHandshake },
  seguimientos:    { title: 'Seguimientos y Alertas',    subtitle: 'Control de casos y seguimientos',      icon: Clock },
  'portal-publico':{ title: 'Portal Comunitario Público',subtitle: 'Consulta pública y transparencia',    icon: Globe },
};

export function App() {
  // Manejo de Sesión de Usuario
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uraba_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  // Control de Roles y Restricciones
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('uraba_user_session');
      if (saved) {
        const u = JSON.parse(saved);
        return getRoleById(u.rolId || u.rol);
      }
    } catch (e) {}
    return getRoleById(api.getRole());
  });

  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  // Accesibilidad
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);

  // Aplicar clases de accesibilidad al body
  useEffect(() => {
    document.body.classList.remove('font-lg', 'font-xl', 'high-contrast');
    if (fontSize === 'lg') document.body.classList.add('font-lg');
    if (fontSize === 'xl') document.body.classList.add('font-xl');
    if (highContrast) document.body.classList.add('high-contrast');
  }, [fontSize, highContrast]);

  // Sincronizar rol al iniciar sesión
  useEffect(() => {
    if (currentUser) {
      const matched = getRoleById(currentUser.rolId || currentUser.rol);
      setCurrentRole(matched);
      api.setRole(matched.headerRole);
    }
  }, [currentUser]);

  // Cargar estado del backend
  const checkStatus = async () => {
    try {
      const res = await api.getStatus();
      setDbStatus(res.base_de_datos);
    } catch (err) {
      console.warn('Backend aún no responde en /api/status');
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkStatus();
      const interval = setInterval(checkStatus, 15000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Manejo de Login Exitoso
  const handleLoginSuccess = (user, token) => {
    try {
      localStorage.setItem('uraba_user_session', JSON.stringify(user));
    } catch (e) {}

    const matched = getRoleById(user.rolId || user.rol);
    setCurrentUser(user);
    setCurrentRole(matched);
    api.setRole(matched.headerRole);

    // Si el usuario es de la comunidad, abrir directamente el portal público
    if (matched.id === 'comunidad') {
      setActiveTab('portal-publico');
    } else {
      setActiveTab('dashboard');
    }

    showToast(`¡Bienvenido/a, ${user.nombre}! Ha ingresado como ${matched.name}.`, 'success');
  };

  // Cierre de Sesión
  const handleLogout = () => {
    try {
      localStorage.removeItem('uraba_user_session');
    } catch (e) {}
    setCurrentUser(null);
    showToast('Sesión cerrada. Ingrese con las credenciales del rol que desea operar.', 'info');
  };

  // Cambio de rol dinámico dentro de la sesión activa
  const handleSelectRole = (newRole) => {
    setCurrentRole(newRole);
    api.setRole(newRole.headerRole);

    // Actualizar usuario en sesión
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        rol: newRole.name,
        rolId: newRole.id
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('uraba_user_session', JSON.stringify(updatedUser));
      } catch (e) {}
    }

    // Si la pestaña actual está bloqueada para el nuevo rol, redirigir
    if (!isTabAllowed(newRole.id, activeTab)) {
      if (newRole.id === 'comunidad') {
        setActiveTab('portal-publico');
        showToast(`Operando ahora como: ${newRole.name}. Redirigido al Portal Público por política de privacidad Habeas Data.`, 'info');
      } else {
        setActiveTab('dashboard');
        showToast(`Operando ahora como: ${newRole.name}. Función previa bloqueada para este perfil.`, 'info');
      }
    } else {
      const extraMsg = newRole.restrictions.length > 0
        ? ` (${newRole.restrictions.length} restricciones de privacidad activas)`
        : ' (Acceso total concedido)';
      showToast(`Operando ahora como: ${newRole.name}${extraMsg}`, 'success');
    }
  };

  const handleCompleteRegistration = (newBeneficiary) => {
    showToast(`¡Beneficiario creado! Código: ${newBeneficiary.codigo_interno}`, 'success');
    setSelectedBeneficiaryId(newBeneficiary.id);
    setActiveTab('beneficiarios');
  };

  // Si no hay usuario autenticado, renderizar la pantalla de Login
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const currentMeta = PAGE_META[activeTab] || PAGE_META.dashboard;
  const PageIcon = currentMeta.icon;
  const tabAllowed = isTabAllowed(currentRole.id, activeTab);

  return (
    <div className="app-container">
      {/* Sidebar Lateral */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        currentRole={currentRole}
        currentUser={currentUser}
        onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
        onLogout={handleLogout}
      />

      {/* Área principal a la derecha del sidebar */}
      <div className="main-wrapper">
        {/* Topbar con título de página, usuario y selector de rol */}
        <header className="topbar">
          <div className="topbar-left">
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'linear-gradient(135deg, rgba(26,86,219,0.2), rgba(124,58,237,0.15))',
              border: '1px solid rgba(26,86,219,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
            }}>
              <PageIcon size={18} />
            </div>
            <div>
              <div className="page-title">{currentMeta.title}</div>
              <div className="page-subtitle">{currentMeta.subtitle}</div>
            </div>
          </div>

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Pill de Usuario Conectado */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '12px',
                color: 'var(--text-main)'
              }}
              title={`Sesión activa: ${currentUser.email} (${currentUser.organizacion || ''})`}
            >
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: currentRole.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 800
              }}>
                {currentUser.avatar || currentRole.initials}
              </div>
              <span style={{ fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.nombre}
              </span>
            </div>

            {/* Pill de Rol Activo y Botón de Cambio */}
            <button
              onClick={() => setIsRoleSwitcherOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: `${currentRole.color}15`,
                border: `1px solid ${currentRole.color}50`,
                color: currentRole.color,
                fontWeight: 700,
                fontSize: '12px'
              }}
              title="Clic para cambiar el rol y verificar funciones bloqueadas"
            >
              <ShieldCheck size={14} color={currentRole.color} />
              <span>Rol: <strong>{currentRole.shortName}</strong></span>
              <span style={{
                background: `${currentRole.color}25`,
                padding: '2px 7px',
                borderRadius: '8px',
                fontSize: '10.5px'
              }}>
                {currentRole.tag}
              </span>
              <span style={{ fontSize: '11px', opacity: 0.8, textDecoration: 'underline' }}>
                Cambiar
              </span>
            </button>

            {/* Botón Salir / Logout */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                fontSize: '12px',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
              title="Cerrar sesión actual e ir a pantalla de login"
            >
              <LogOut size={13} />
              <span>Salir</span>
            </button>

            {/* Pill de Origen de Datos */}
            <div className="status-pill mysql" title="Fuente de datos">
              <span className="status-dot" />
              <span>Excel activo</span>
            </div>
          </div>
        </header>

        {/* Contenido dinámico con protección estricta por rol */}
        <main className="main-content">
          {!tabAllowed ? (
            <PrivacyRestrictedScreen
              currentRole={currentRole}
              onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
              onGoToPublicPortal={() => setActiveTab('portal-publico')}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  currentRole={currentRole}
                  onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
                  onNavigateToNew={() => setActiveTab('nuevo-registro')}
                />
              )}

              {activeTab === 'beneficiarios' && (
                <BeneficiaryListView
                  currentRole={currentRole}
                  onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
                  onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
                  onNavigateToNew={() => setActiveTab('nuevo-registro')}
                />
              )}

              {activeTab === 'nuevo-registro' && (
                <RegistrationWizardView
                  currentRole={currentRole}
                  onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
                  onCompleteRegistration={handleCompleteRegistration}
                  onOpenExistingBeneficiary={(id) => setSelectedBeneficiaryId(id)}
                />
              )}

              {activeTab === 'programas' && (
                <ProgramsView
                  currentRole={currentRole}
                  onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
                />
              )}

              {activeTab === 'atenciones' && (
                <AttentionsView
                  currentRole={currentRole}
                  onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
                />
              )}

              {activeTab === 'seguimientos' && (
                <FollowupsView
                  currentRole={currentRole}
                  onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
                />
              )}

              {activeTab === 'portal-publico' && (
                <PublicPortalView
                  currentRole={currentRole}
                  onOpenRoleSwitcher={() => setIsRoleSwitcherOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal para Selector de Roles */}
      <RoleSwitcherModal
        isOpen={isRoleSwitcherOpen}
        onClose={() => setIsRoleSwitcherOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
      />

      {/* Toast de notificación */}
      {toastMessage && (
        <div className="toast-container">
          <div className={`toast ${toastType}`}>
            {toastType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Modal de Ficha Única Consolidada */}
      {selectedBeneficiaryId && (
        <BeneficiaryConsolidatedModal
          beneficiaryId={selectedBeneficiaryId}
          currentRole={currentRole}
          onClose={() => setSelectedBeneficiaryId(null)}
          onRefresh={() => checkStatus()}
        />
      )}
    </div>
  );
}

export default App;
