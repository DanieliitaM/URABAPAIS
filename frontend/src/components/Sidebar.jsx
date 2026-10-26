import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderOpen,
  HeartHandshake,
  Clock,
  Globe,
  FileSpreadsheet,
  Type,
  Eye,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Lock,
  Shield,
  ArrowRightLeft
} from 'lucide-react';
import { isTabAllowed, getRoleById } from '../services/roles';

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Tablero General',
    icon: LayoutDashboard,
    section: 'PRINCIPAL',
  },
  {
    id: 'beneficiarios',
    label: 'Directorio de Personas',
    icon: Users,
    section: 'GESTIÓN',
  },
  {
    id: 'nuevo-registro',
    label: 'Nuevo Registro',
    icon: UserPlus,
    section: 'GESTIÓN',
    highlight: true,
  },
  {
    id: 'programas',
    label: 'Programas y Líneas',
    icon: FolderOpen,
    section: 'GESTIÓN',
  },
  {
    id: 'atenciones',
    label: 'Atenciones y Ayudas',
    icon: HeartHandshake,
    section: 'OPERACIONES',
  },
  {
    id: 'seguimientos',
    label: 'Seguimientos y Alertas',
    icon: Clock,
    section: 'OPERACIONES',
  },
  {
    id: 'portal-publico',
    label: 'Portal Comunitario',
    icon: Globe,
    section: 'COMUNIDAD',
  },
];

export const Sidebar = ({
  activeTab,
  setActiveTab,
  dbStatus,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  currentRole,
  currentUser,
  onOpenRoleSwitcher,
  onLogout
}) => {
  const roleObj = currentRole?.id ? currentRole : getRoleById(currentRole);

  const toggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('xl');
    else setFontSize('normal');
  };

  const fontLabel = fontSize === 'normal' ? 'A Normal' : fontSize === 'lg' ? 'A Grande' : 'A Extra';

  // Group nav items by section
  const sections = NAV_ITEMS.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  const displayName = currentUser?.nombre || roleObj.name;
  const displayRole = currentUser?.cargo || roleObj.shortName;

  return (
    <aside className="sidebar" aria-label="Menú de navegación principal">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-inner">
          <div className="logo-badge">UP</div>
          <div className="logo-text">
            <div className="logo-title">URABÁ-PAÍS</div>
            <div className="logo-subtitle">COOPI · FADV · HIAS · HI</div>
          </div>
        </div>
      </div>

      {/* Status: Base de Datos + Rol Activo */}
      <div className="sidebar-status" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div className="status-chip" title="Fuente de datos activa">
          <span className="status-dot-live" />
          <FileSpreadsheet size={11} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '10.5px' }}>
            Base_Beneficiarios.xlsx
          </span>
        </div>

        {/* Indicador de rol en la barra */}
        <div
          onClick={onOpenRoleSwitcher}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 8px',
            borderRadius: '8px',
            background: `${roleObj.color}15`,
            border: `1px solid ${roleObj.color}35`,
            fontSize: '11px',
            color: roleObj.color,
            transition: 'all 0.2s ease'
          }}
          title="Clic para cambiar rol y verificar restricciones"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleObj.color }} />
            {roleObj.shortName}
          </span>
          <span style={{ fontSize: '10px', textDecoration: 'underline', opacity: 0.85 }}>Cambiar</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Secciones del sistema">
        {Object.entries(sections).map(([sectionName, items]) => (
          <div key={sectionName}>
            <div className="nav-section-label">{sectionName}</div>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = isTabAllowed(roleObj.id, item.id);

              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''} ${item.highlight && !isActive && isAllowed ? 'nav-highlight' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={!isAllowed ? `${item.label} (Bloqueado para rol ${roleObj.shortName})` : item.label}
                  style={!isAllowed ? { opacity: 0.55 } : {}}
                >
                  <span className="nav-icon">
                    <Icon size={18} />
                  </span>
                  <span className="nav-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.label}
                  </span>
                  
                  {!isAllowed && (
                    <span
                      title="Acceso bloqueado por restricciones de rol / privacidad"
                      style={{
                        marginLeft: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontSize: '9.5px',
                        fontWeight: 700,
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <Lock size={10} />
                      Bloq
                    </span>
                  )}

                  {isAllowed && item.highlight && !isActive && (
                    <Sparkles size={13} style={{ color: '#a78bfa', flexShrink: 0 }} />
                  )}
                  {isActive && (
                    <ChevronRight size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: User + Accessibility */}
      <div className="sidebar-bottom">
        {/* Hackathon badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(26,86,219,0.15), rgba(124,58,237,0.1))',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: '10px',
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          marginBottom: '4px',
        }}>
          <Sparkles size={13} color="#a78bfa" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa' }}>Hackathon 2026</span>
        </div>

        {/* Accessibility */}
        <div className="access-row">
          <button
            className={`access-btn ${fontSize !== 'normal' ? 'active' : ''}`}
            onClick={toggleFontSize}
            title="Cambiar tamaño de texto"
          >
            <Type size={13} />
            <span>{fontLabel}</span>
          </button>
          <button
            className={`access-btn ${highContrast ? 'active' : ''}`}
            onClick={() => setHighContrast(!highContrast)}
            title="Alto contraste"
          >
            <Eye size={13} />
            <span>{highContrast ? 'HC Activo' : 'Contraste'}</span>
          </button>
        </div>

        {/* User Card con Selector de Rol y Botón de Salir */}
        <div
          className="user-card"
          onClick={onOpenRoleSwitcher}
          title="Clic para cambiar de rol o ver restricciones"
          style={{
            cursor: 'pointer',
            border: `1px solid ${roleObj.color}40`,
            background: `linear-gradient(135deg, ${roleObj.color}15, rgba(255,255,255,0.02))`
          }}
        >
          <div
            className="user-avatar"
            style={{
              background: roleObj.color,
              boxShadow: `0 2px 8px ${roleObj.color}50`
            }}
          >
            {currentUser?.avatar || roleObj.initials}
          </div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px' }}>{displayName}</span>
            </div>
            <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: roleObj.color, fontWeight: 600, fontSize: '10.5px' }}>
              <ShieldCheck size={10} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayRole}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLogout();
              }}
              title="Cerrar sesión"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '5px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowRightLeft size={12} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
