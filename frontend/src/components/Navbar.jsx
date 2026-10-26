import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FolderGit2,
  HeartHandshake,
  Clock,
  Globe,
  FileSpreadsheet,
  Type,
  Eye,
  ShieldCheck
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  dbStatus,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
  userRole,
  setUserRole
}) => {
  const toggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('xl');
    else setFontSize('normal');
  };

  return (
    <header className="main-header">
      {/* Barra superior con branding y controles de accesibilidad */}
      <div className="topbar-branding">
        <div className="brand-wrapper">
          <div className="brand-logo-badge">UP</div>
          <div className="brand-text">
            <h1>
              URABÁ-PAÍS
              <span style={{ fontSize: '11px', fontWeight: 600, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>
                Hackathon 2026
              </span>
            </h1>
            <p>Alianza Humanitaria: COOPI · FADV · HIAS Colombia · Humanity & Inclusion</p>
          </div>
        </div>

        <div className="topbar-actions">
          {/* Origen de Datos: Archivo Excel */}
          <div className="status-pill mysql" title={dbStatus?.tipo || 'Cargado directamente de Excel'}>
            <span className="status-dot"></span>
            <FileSpreadsheet size={13} />
            <span>Excel: Base_Beneficiarios_Hackathon.xlsx</span>
          </div>

          {/* Accesibilidad: Tamaño de Letra */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={toggleFontSize}
            title="Cambiar tamaño de texto para facilitar lectura"
            style={{ fontWeight: 700 }}
          >
            <Type size={14} />
            <span>A {fontSize === 'normal' ? 'Normal' : fontSize === 'lg' ? 'Grande (+15%)' : 'Extra (+28%)'}</span>
          </button>

          {/* Accesibilidad: Alto Contraste */}
          <button
            className={`btn btn-sm ${highContrast ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setHighContrast(!highContrast)}
            title="Alternar modo de alto contraste para visibilidad"
          >
            <Eye size={14} />
            <span>{highContrast ? 'Contraste Activo' : 'Contraste'}</span>
          </button>

          {/* Rol del Usuario */}
          <div
            className="btn btn-secondary btn-sm"
            onClick={() => setUserRole(userRole === 'Administrador' ? 'Funcionario de Campo' : 'Administrador')}
            title="Haga clic para alternar rol de demostración"
            style={{ cursor: 'pointer', background: '#f8fafc' }}
          >
            <ShieldCheck size={14} color="#0d7685" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>{userRole}</span>
          </div>
        </div>
      </div>

      {/* Menú de Navegación comprensible para movilizarse de un lugar a otro */}
      <nav className="nav-bar" aria-label="Navegación principal">
        <button
          className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Tablero de Indicadores</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'beneficiarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('beneficiarios')}
        >
          <Users size={18} />
          <span>Directorio de Personas</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'nuevo-registro' ? 'active' : ''}`}
          onClick={() => setActiveTab('nuevo-registro')}
          style={{ background: activeTab === 'nuevo-registro' ? 'var(--color-primary-light)' : '#fef3c7', color: activeTab === 'nuevo-registro' ? 'var(--color-primary)' : '#92400e' }}
        >
          <UserPlus size={18} />
          <span>+ Nuevo Registro (Paso a Paso)</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'programas' ? 'active' : ''}`}
          onClick={() => setActiveTab('programas')}
        >
          <FolderGit2 size={18} />
          <span>Programas y Líneas</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'atenciones' ? 'active' : ''}`}
          onClick={() => setActiveTab('atenciones')}
        >
          <HeartHandshake size={18} />
          <span>Atenciones y Ayudas</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'seguimientos' ? 'active' : ''}`}
          onClick={() => setActiveTab('seguimientos')}
        >
          <Clock size={18} />
          <span>Seguimientos y Alertas</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'portal-publico' ? 'active' : ''}`}
          onClick={() => setActiveTab('portal-publico')}
        >
          <Globe size={18} />
          <span>Portal Comunitario Público</span>
        </button>
      </nav>
    </header>
  );
};
