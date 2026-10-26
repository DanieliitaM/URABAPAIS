import React, { useState, useEffect } from 'react';
import { FolderGit2, Users, HeartHandshake, Target, Building, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../services/api';

export const ProgramsView = ({ onSelectBeneficiary, currentRole }) => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const canManage = currentRole?.permissions?.canManagePrograms === true;

  useEffect(() => {
    api.getPrograms().then((res) => {
      setPrograms(res.data || []);
      setLoading(false);
    });
  }, [currentRole]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando catálogo de programas...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Líneas de Intervención y Programas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Estructura de atención humanitaria del Proyecto URABÁ-PAÍS ejecutado por COOPI, FADV, HIAS y HI.
          </p>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: canManage ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${canManage ? 'rgba(139, 92, 246, 0.3)' : 'var(--border-light)'}`,
          fontSize: '12px',
          color: canManage ? '#a78bfa' : 'var(--text-muted)'
        }}>
          {canManage ? <ShieldCheck size={14} /> : <Lock size={14} />}
          <span>{canManage ? 'Coordinación: Gestión y Edición de Metas' : 'Modo Consulta (Edición restringida a Coordinación)'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {programs.map((p) => {
          const pct = p.meta_estimada > 0 ? ((p.total_inscritos / p.meta_estimada) * 100).toFixed(1) : 0;
          return (
            <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge-code" style={{ fontSize: '14px' }}>{p.codigo}</span>
                  <span className="badge badge-success">Activo</span>
                </div>

                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {p.nombre}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {p.descripcion}
                </p>

                <div style={{ background: 'rgba(233,30,140,0.04)', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '8px' }}>
                    <Building size={14} color="var(--color-primary)" />
                    <span>Organización Líder: <strong>{p.organizacion_lider}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <Target size={14} color="var(--color-accent)" />
                    <span>Línea: <strong>{p.linea_trabajo}</strong></span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Beneficiarios Vinculados:</span>
                  <strong>{p.total_inscritos} / {p.meta_estimada?.toLocaleString()}</strong>
                </div>
                <div className="progress-bar-bg" style={{ marginBottom: '14px' }}>
                  <div className="progress-bar-fill" style={{ width: `${Math.min(100, Math.max(5, pct * 4))}%` }}></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>Total atenciones registradas: <strong>{p.total_atenciones}</strong></span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{pct}% meta</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
