import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle, Eye, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../services/api';
import { PrivacyRestrictedScreen } from '../components/PrivacyRestrictedScreen';

export const FollowupsView = ({ onSelectBeneficiary, currentRole, onOpenRoleSwitcher }) => {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  const canViewPrivate = currentRole?.permissions?.canViewPrivateData !== false;

  const loadFollowups = async () => {
    if (!canViewPrivate) return;
    try {
      setLoading(true);
      const res = await api.getFollowups({
        estado_caso: statusFilter,
        limit: 50
      });
      setFollowups(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error('Error cargando seguimientos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowups();
  }, [statusFilter, currentRole]);

  if (!canViewPrivate) {
    return (
      <PrivacyRestrictedScreen
        title="Bandeja de Seguimientos Confidencial"
        message="Las novedades de protección, alertas psicosociales y compromisos familiares son de estricta reserva humanitaria y están protegidas por la Ley de Habeas Data. No están disponibles para consulta pública."
        currentRole={currentRole}
        onOpenRoleSwitcher={onOpenRoleSwitcher}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Bandeja de Seguimientos y Novedades</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Alertas de acciones pendientes, evolución del bienestar y próximos contactos ({total} registros)
          </p>
        </div>

        {/* Filtro por Estado */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Todos los Estados</option>
            <option value="En seguimiento">En seguimiento (Casos Activos)</option>
            <option value="Pendiente">Pendiente Urgente</option>
            <option value="Atendido">Atendido</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Cargando seguimientos...</p>
          </div>
        ) : followups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Clock size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No hay seguimientos registrados con el criterio seleccionado.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Beneficiario</th>
                  <th>Avance / Novedad Observada</th>
                  <th>Acción Pendiente</th>
                  <th>Próximo Contacto</th>
                  <th>Estado</th>
                  <th>Responsable</th>
                  <th style={{ textAlign: 'right' }}>Ficha</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        {s.fecha_seguimiento}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{s.beneficiario_nombre}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.beneficiario_codigo}</div>
                      </div>
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '13px' }}>
                      {s.avance_novedad}
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '13px' }}>
                      {s.accion_pendiente ? (
                        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', color: '#92400e', fontWeight: 600 }}>
                          {s.accion_pendiente}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Ninguna</span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {s.proximo_contacto ? (
                        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                          {s.proximo_contacto}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          s.estado_caso === 'Pendiente' ? 'badge-warning' :
                          s.estado_caso === 'En seguimiento' ? 'badge-info' : 'badge-success'
                        }`}
                      >
                        {s.estado_caso}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {s.responsable || 'Técnico de campo'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectBeneficiary(s.beneficiario_id)}
                      >
                        <Eye size={13} />
                        <span>Ficha</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
