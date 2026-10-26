import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  Eye,
  Plus,
  MapPin,
  Building,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Lock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { PrivacyRestrictedScreen } from '../components/PrivacyRestrictedScreen';
import { Pagination } from '../components/Pagination';

export const BeneficiaryListView = ({ onSelectBeneficiary, onNavigateToNew, currentRole, onOpenRoleSwitcher }) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [municipioFilter, setMunicipioFilter] = useState('');
  const [poblacionFilter, setPoblacionFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 7; // Máximo 7 registros por página para evitar sobrecarga visual

  const canViewPrivate = currentRole?.permissions?.canViewPrivateData !== false;
  const canRegister = currentRole?.permissions?.canRegisterBeneficiary !== false;
  const isDataMasked = currentRole?.permissions?.isDataMasked === true;

  const loadData = async () => {
    if (!canViewPrivate) return;
    try {
      setLoading(true);
      const res = await api.getBeneficiaries({
        search: searchTerm,
        municipio: municipioFilter,
        tipo_poblacion: poblacionFilter,
        page,
        limit
      });
      setBeneficiaries(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (err) {
      console.error('Error cargando beneficiarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchTerm, municipioFilter, poblacionFilter, page, currentRole]);

  // Si el rol no tiene permitido ver datos personales (ej: Comunidad), mostrar pantalla de bloqueo estricto
  if (!canViewPrivate) {
    return (
      <PrivacyRestrictedScreen
        title="Directorio de Beneficiarios Restringido"
        message="Por mandato de la Ley 1581 de 2012 (Habeas Data) y principios de protección humanitaria, el directorio con nombres completos, cédulas y expedientes individuales no es accesible para el rol Comunidad / Consulta Pública."
        currentRole={currentRole}
        onOpenRoleSwitcher={onOpenRoleSwitcher}
      />
    );
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="animate-fade-in">
      {/* Encabezado con Estado de Rol */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '24px', margin: 0 }}>Directorio de Beneficiarios Únicos</h2>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              background: `${currentRole?.color || '#8b5cf6'}20`,
              color: currentRole?.color || '#8b5cf6',
              fontWeight: 700,
              border: `1px solid ${currentRole?.color || '#8b5cf6'}40`
            }}>
              {currentRole?.shortName}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
            {total} personas registradas con código inmutable en el sistema
            {isDataMasked && ' · Modo de anonimización activa para auditoría'}
          </p>
        </div>

        {/* Botón Nuevo Registro con bloqueo */}
        <button
          className={`btn ${canRegister ? 'btn-primary' : 'btn-secondary btn-disabled-role'}`}
          onClick={() => {
            if (!canRegister) {
              alert(`Función Bloqueada: El rol "${currentRole?.shortName}" no tiene permisos para crear beneficiarios (modo solo lectura).`);
              return;
            }
            onNavigateToNew();
          }}
          title={canRegister ? "+ Registrar nuevo beneficiario" : `Función bloqueada para rol ${currentRole?.shortName}`}
          style={!canRegister ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
        >
          {canRegister ? <Plus size={16} /> : <Lock size={14} color="#f87171" />}
          <span>+ Nuevo Registro (Paso a Paso)</span>
          {!canRegister && <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>(Bloqueado)</span>}
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'center' }}>
          {/* Búsqueda rápida */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Buscar por nombre, código o documento..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Filtro por Municipio */}
          <div>
            <select
              className="form-select"
              value={municipioFilter}
              onChange={(e) => {
                setMunicipioFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Todos los Municipios</option>
              <option value="Apartadó">Apartadó</option>
              <option value="Turbo">Turbo</option>
              <option value="Necoclí">Necoclí</option>
            </select>
          </div>

          {/* Filtro por Población */}
          <div>
            <select
              className="form-select"
              value={poblacionFilter}
              onChange={(e) => {
                setPoblacionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Toda la Población</option>
              <option value="Migrante">Migrante</option>
              <option value="Refugiado/a o solicitante de asilo">Refugiado/a</option>
              <option value="Comunidad de acogida">Comunidad de acogida</option>
              <option value="Retornado/a">Retornado/a</option>
              <option value="Víctima del conflicto">Víctima del conflicto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Beneficiarios */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Cargando personas...</p>
          </div>
        ) : beneficiaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <Users size={36} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
            <h4 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '4px' }}>No se encontraron beneficiarios</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
              Intente con otro término de búsqueda o registre una nueva persona.
            </p>
            <button className="btn btn-primary btn-sm" onClick={onNavigateToNew}>
              + Crear Nuevo Beneficiario
            </button>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código Único</th>
                  <th>Nombre Completo</th>
                  <th>Documento</th>
                  <th>Edad / Sexo</th>
                  <th>Municipio</th>
                  <th>Población</th>
                  <th>Organización</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaries.map((b) => (
                  <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => onSelectBeneficiary(b.id)}>
                    <td>
                      <span className="badge-code">{b.codigo_interno}</span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>{b.nombre_completo}</strong>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {b.tipo_documento ? (
                        isDataMasked && b.numero_documento ? (
                          <span title="Número de documento protegido por Habeas Data en modo auditoría" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontFamily: 'monospace' }}>
                              {b.tipo_documento} ••••••{b.numero_documento.slice(-3)}
                            </span>
                            <span style={{ fontSize: '9px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '1px 4px', borderRadius: '4px', fontWeight: 600 }}>
                              Protegido
                            </span>
                          </span>
                        ) : (
                          `${b.tipo_documento} ${b.numero_documento || ''}`
                        )
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Sin doc</span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      {b.edad ? `${b.edad} años` : '-'} {b.sexo ? `(${b.sexo.charAt(0)})` : ''}
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                        <MapPin size={12} color="var(--text-muted)" />
                        {b.municipio}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                        {b.tipo_poblacion || 'Comunidad'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {b.organizacion_responsable}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBeneficiary(b.id);
                        }}
                      >
                        <Eye size={13} />
                        <span>Ver Ficha</span>
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
          currentCount={beneficiaries.length}
          onPageChange={(newPage) => setPage(newPage)}
          itemLabel="beneficiarios"
        />
      </div>
    </div>
  );
};
