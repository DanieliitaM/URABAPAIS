import React, { useState, useEffect } from 'react';
import {
  Users,
  FolderOpen,
  HeartHandshake,
  Clock,
  Download,
  Target,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  Lock,
  ShieldCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export const DashboardView = ({ onNavigateToNew, currentRole, onOpenRoleSwitcher }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const canExport = currentRole?.permissions?.canExportCSV !== false;
  const canRegister = currentRole?.permissions?.canRegisterBeneficiary !== false;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Error cargando indicadores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentRole]);

  const handleExportCSV = async () => {
    if (!canExport) {
      alert(`Función Bloqueada: La exportación masiva de datos está restringida para el rol "${currentRole?.shortName || 'actual'}" para proteger la confidencialidad de la población beneficiaria.`);
      return;
    }

    try {
      const exportRes = await api.getExportData();
      const exportData = exportRes.data;

      let csvContent = 'data:text/csv;charset=utf-8,';
      csvContent += 'REPORTE AGREGADO PROYECTO URABA-PAIS\n';
      csvContent += `Generado el: ${new Date().toLocaleString()}\n`;
      csvContent += `Rol Operador: ${currentRole?.name || 'Administrador'}\n\n`;

      csvContent += 'INDICADOR,VALOR\n';
      csvContent += `Beneficiarios Unicos Registrados,${exportData.resumen_ejecutivo.beneficiarios_unicos}\n`;
      csvContent += `Meta Global del Proyecto,${exportData.resumen_ejecutivo.meta_global_proyecto}\n`;
      csvContent += `Total Participaciones en Programas,${exportData.resumen_ejecutivo.total_participaciones}\n`;
      csvContent += `Total Atenciones y Ayudas Entregadas,${exportData.resumen_ejecutivo.total_atenciones}\n`;
      csvContent += `Seguimientos Pendientes / En Proceso,${exportData.resumen_ejecutivo.seguimientos_pendientes}\n\n`;

      csvContent += 'PROGRAMA,LINEA,META ESTIMADA,VINCULACIONES,BENEFICIARIOS UNICOS\n';
      (exportData.programas || []).forEach(p => {
        csvContent += `"${p.nombre}","${p.linea_trabajo}",${p.meta_estimada},${p.total_participaciones},${p.beneficiarios_unicos}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `reporte_indicadores_uraba_pais_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Error exportando reporte: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '16px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(26,86,219,0.2)',
          borderTopColor: '#1a56db',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>
          Cargando indicadores del proyecto...
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const resumen = data?.resumen || {};
  const metaGlobal = 11447;
  const progresoPct = metaGlobal > 0 ? ((resumen.beneficiarios_unicos / metaGlobal) * 100).toFixed(1) : 0;

  return (
    <div className="animate-fade-in">
      {/* Barra Informativa de Rol Activo y Restricciones */}
      <div style={{
        background: `linear-gradient(90deg, ${currentRole?.color || '#8b5cf6'}15, rgba(255,255,255,0.02))`,
        border: `1px solid ${currentRole?.color || '#8b5cf6'}40`,
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={18} color={currentRole?.color || '#8b5cf6'} />
          <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
            Operando como: <strong>{currentRole?.name || 'Administrador'}</strong>
            <span style={{
              marginLeft: '8px',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: `${currentRole?.color || '#8b5cf6'}25`,
              color: currentRole?.color || '#8b5cf6',
              fontWeight: 700
            }}>
              {currentRole?.tag || 'Acceso Total'}
            </span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {currentRole?.restrictions?.length > 0 ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              color: '#f87171',
              background: 'rgba(239,68,68,0.1)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              <Lock size={11} />
              {currentRole.restrictions.length} restricciones de privacidad activas
            </span>
          ) : (
            <span style={{ fontSize: '11.5px', color: '#34d399' }}>
              ✓ Sin restricciones activas
            </span>
          )}

          {onOpenRoleSwitcher && (
            <button
              onClick={onOpenRoleSwitcher}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 8px', fontSize: '11px' }}
            >
              Cambiar Rol
            </button>
          )}
        </div>
      </div>

      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{
            fontSize: '24px',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '5px',
            fontFamily: 'var(--font-display)',
          }}>
            Tablero de Control e Indicadores
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={13} color="#fbbf24" />
            Monitoreo en tiempo real · Proyecto URABÁ-PAÍS (Apartadó, Turbo y Necoclí)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {/* Botón Exportar CSV con control de rol */}
          <button
            className={`btn ${canExport ? 'btn-secondary' : 'btn-secondary btn-disabled-role'}`}
            onClick={handleExportCSV}
            title={canExport ? "Descargar reporte agregado oficial en formato CSV" : `Función bloqueada para rol ${currentRole?.shortName}. Requiere perfil Administrador o Auditor.`}
            style={!canExport ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {canExport ? <Download size={15} /> : <Lock size={14} color="#f87171" />}
            <span>Exportar CSV</span>
            {!canExport && <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>(Bloqueado)</span>}
          </button>

          {/* Botón Nuevo Registro con control de rol */}
          <button
            className={`btn ${canRegister ? 'btn-primary' : 'btn-secondary btn-disabled-role'}`}
            onClick={() => {
              if (!canRegister) {
                alert(`Función Bloqueada: El rol "${currentRole?.shortName}" no tiene permisos para dar de alta nuevos beneficiarios.`);
                return;
              }
              onNavigateToNew();
            }}
            title={canRegister ? "Iniciar registro paso a paso de beneficiario" : `Función de registro bloqueada para rol ${currentRole?.shortName}`}
            style={!canRegister ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
          >
            {canRegister ? (
              <>
                <span>+ Nuevo Registro</span>
                <ArrowUpRight size={15} />
              </>
            ) : (
              <>
                <Lock size={14} color="#f87171" />
                <span>+ Nuevo Registro</span>
                <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>(Bloqueado)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 KPIs Principales */}
      <div className="kpi-grid">
        {/* KPI 1: Beneficiarios */}
        <div className="kpi-card teal">
          <div className="kpi-header">
            <span className="kpi-title">Personas Beneficiarias</span>
            <div className="kpi-icon-wrap teal">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{resumen.beneficiarios_unicos?.toLocaleString()}</div>
          <div className="kpi-subtext">
            Meta: <strong style={{ color: '#60a5fa' }}>{metaGlobal.toLocaleString()}</strong> personas · {progresoPct}% alcanzado
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(5, progresoPct * 8))}%` }} />
          </div>
        </div>

        {/* KPI 2: Participaciones */}
        <div className="kpi-card amber">
          <div className="kpi-header">
            <span className="kpi-title">Participaciones en Programas</span>
            <div className="kpi-icon-wrap amber">
              <FolderOpen size={20} />
            </div>
          </div>
          <div className="kpi-value">{resumen.total_participaciones?.toLocaleString()}</div>
          <div className="kpi-subtext">
            Promedio: <strong style={{ color: '#fbbf24' }}>
              {(resumen.total_participaciones / (resumen.beneficiarios_unicos || 1)).toFixed(1)}
            </strong> líneas por beneficiario
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            * Una persona puede estar en múltiples líneas
          </div>
        </div>

        {/* KPI 3: Atenciones */}
        <div className="kpi-card emerald">
          <div className="kpi-header">
            <span className="kpi-title">Atenciones y Ayudas</span>
            <div className="kpi-icon-wrap emerald">
              <HeartHandshake size={20} />
            </div>
          </div>
          <div className="kpi-value">{resumen.total_atenciones?.toLocaleString()}</div>
          <div className="kpi-subtext">Servicios, kits y atenciones de salud provistas</div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#047857', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} /> Registro individualizado sin duplicar personas
          </div>
        </div>

        {/* KPI 4: Seguimientos */}
        <div className="kpi-card purple">
          <div className="kpi-header">
            <span className="kpi-title">Seguimientos Pendientes</span>
            <div className="kpi-icon-wrap purple">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">{resumen.seguimientos_pendientes?.toLocaleString()}</div>
          <div className="kpi-subtext">Casos con compromisos o próximas acciones activas</div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: '#a78bfa', fontWeight: 600 }}>
            Total registrados: {resumen.total_seguimientos}
          </div>
        </div>
      </div>

      {/* Grid de Reportes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Avance por Líneas */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">
              <div className="section-title-accent" />
              <Target size={17} color="#60a5fa" />
              Avance por Líneas de Intervención
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 9px', borderRadius: '999px', border: '1px solid var(--border-light)' }}>
              3 Líneas
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(data?.programas || []).map((prog) => {
              const pct = prog.meta_estimada > 0 ? ((prog.beneficiarios_unicos / prog.meta_estimada) * 100).toFixed(1) : 0;
              return (
                <div key={prog.codigo} style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background 0.18s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge-code">{prog.codigo}</span>
                      <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{prog.nombre}</strong>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#60a5fa' }}>
                      {prog.beneficiarios_unicos} / {prog.meta_estimada?.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>{prog.linea_trabajo}</span>
                    <span style={{ color: pct >= 50 ? '#047857' : '#b45309', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-bg" style={{ height: '4px' }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(4, pct * 4))}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución Territorial */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">
              <div className="section-title-accent" />
              <MapPin size={17} color="#60a5fa" />
              Distribución Territorial en Urabá
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '3px 9px', borderRadius: '999px', border: '1px solid var(--border-light)' }}>
              Municipios Foco
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(data?.por_municipio || []).map((m, idx) => {
              const totalAll = resumen.beneficiarios_unicos || 1;
              const munPct = ((m.total / totalAll) * 100).toFixed(1);
              const colors = ['#e91e8c', '#8b5cf6', '#047857', '#d97706'];
              return (
                <div key={m.municipio} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background 0.18s',
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: colors[idx % colors.length],
                    boxShadow: `0 0 8px ${colors[idx % colors.length]}60`,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{m.municipio}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Antioquia, Colombia</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: colors[idx % colors.length] }}>{m.total.toLocaleString()}</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{munPct}% del total</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desglose Poblacional */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        {/* Tipo de Población */}
        <div className="card">
          <h4 style={{ fontSize: '14px', marginBottom: '14px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
            <Users size={15} /> Enfoque Diferencial: Tipo de Población
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {(data?.por_poblacion || []).slice(0, 6).map((p) => (
              <div key={p.tipo} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '9px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{p.tipo}</span>
                <strong style={{ color: 'var(--text-main)' }}>{p.total?.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Género */}
        <div className="card">
          <h4 style={{ fontSize: '14px', marginBottom: '14px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
            <TrendingUp size={15} /> Enfoque de Género
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {(data?.por_genero || []).map((g) => (
              <div key={g.sexo} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '9px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{g.sexo}</span>
                <strong style={{ color: 'var(--text-main)' }}>{g.total?.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Zona */}
        <div className="card">
          <h4 style={{ fontSize: '14px', marginBottom: '14px', color: '#047857', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)' }}>
            <MapPin size={15} /> Distribución por Zona
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {(data?.por_zona || []).map((z) => (
              <div key={z.zona} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '9px 0', borderBottom: '1px solid var(--border-light)', fontSize: '13px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>Zona {z.zona}</span>
                <strong style={{ color: 'var(--text-main)' }}>{z.total?.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
