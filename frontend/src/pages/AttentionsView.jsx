import React, { useState, useEffect } from 'react';
import { HeartHandshake, Calendar, Building, Eye, Filter, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../services/api';
import { PrivacyRestrictedScreen } from '../components/PrivacyRestrictedScreen';
import { Pagination } from '../components/Pagination';

export const AttentionsView = ({ onSelectBeneficiary, currentRole, onOpenRoleSwitcher }) => {
  const [attentions, setAttentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lineaFilter, setLineaFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 7; // Máximo 7 registros por página para evitar sobrecarga visual

  const canViewPrivate = currentRole?.permissions?.canViewPrivateData !== false;

  const loadAttentions = async () => {
    if (!canViewPrivate) return;
    try {
      setLoading(true);
      const res = await api.getAttentions({
        resultado_asociado: lineaFilter,
        organizacion: orgFilter,
        page,
        limit
      });
      setAttentions(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error('Error cargando atenciones:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttentions();
  }, [lineaFilter, orgFilter, page, currentRole]);

  if (!canViewPrivate) {
    return (
      <PrivacyRestrictedScreen
        title="Historial de Atenciones Protegido"
        message="El registro individual de entregas de kits, ayudas de emergencia y atenciones médicas contiene datos protegidos por Habeas Data y confidencialidad humanitaria. No está disponible para consulta pública."
        currentRole={currentRole}
        onOpenRoleSwitcher={onOpenRoleSwitcher}
      />
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Registro de Atenciones y Ayudas Entregadas</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Historial de bienes, kits y asistencias provistas a la población beneficiaria ({total} registros)
          </p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={lineaFilter}
            onChange={(e) => {
              setLineaFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las Líneas</option>
            <option value="R1">R1: Asistencia Humanitaria</option>
            <option value="R2">R2: Salud y Bienestar</option>
            <option value="R3">R3: Integración Socioeconómica</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={orgFilter}
            onChange={(e) => {
              setOrgFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Todas las Entidades</option>
            <option value="COOPI">COOPI</option>
            <option value="FADV">FADV</option>
            <option value="HIAS Colombia">HIAS Colombia</option>
            <option value="Humanity & Inclusion (HI)">Humanity & Inclusion (HI)</option>
          </select>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Cargando atenciones...</p>
          </div>
        ) : attentions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <HeartHandshake size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>No se encontraron atenciones registradas con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Beneficiario</th>
                  <th>Tipo de Atención / Ayuda</th>
                  <th>Descripción</th>
                  <th>Línea</th>
                  <th>Entidad</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Ficha</th>
                </tr>
              </thead>
              <tbody>
                {attentions.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        {a.fecha_atencion}
                      </span>
                    </td>
                    <td>
                      <div>
                        <strong>{a.beneficiario_nombre}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.beneficiario_codigo}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral">{a.tipo_atencion_ayuda}</span>
                    </td>
                    <td style={{ maxWidth: '320px', fontSize: '13px' }}>
                      {a.descripcion || a.actividad_recibida}
                    </td>
                    <td>
                      <span className="badge-code">{a.resultado_asociado || 'R1'}</span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{a.organizacion}</td>
                    <td>
                      <span className="badge badge-success">{a.resultado}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectBeneficiary(a.beneficiario_id)}
                      >
                        <Eye size={13} />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación con límite de 7 */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          itemsPerPage={limit}
          currentCount={attentions.length}
          onPageChange={(newPage) => setPage(newPage)}
          itemLabel="atenciones"
        />
      </div>
    </div>
  );
};
