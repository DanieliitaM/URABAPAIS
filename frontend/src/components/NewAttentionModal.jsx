import React, { useState } from 'react';
import { X, HeartHandshake, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export const NewAttentionModal = ({ beneficiary, programs, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    beneficiario_id: beneficiary.id,
    programa_id: programs[0]?.id || '',
    fecha_atencion: new Date().toISOString().slice(0, 10),
    tipo_atencion_ayuda: 'Ayuda',
    actividad_recibida: '',
    resultado_asociado: 'R1',
    descripcion: '',
    organizacion: beneficiary.organizacion_responsable || 'COOPI',
    responsable: '',
    resultado: 'Atendido',
    remitido_a: '',
    observaciones: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.descripcion.trim()) {
      setError('Por favor describa la atención o ayuda brindada.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.createAttention({
        ...formData,
        programa_id: formData.programa_id ? Number(formData.programa_id) : null
      });
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error al registrar atención');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px', borderRadius: '8px' }}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', margin: 0 }}>Registrar Atención o Ayuda</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Para: <strong>{beneficiary.nombre_completo}</strong> ({beneficiary.codigo_interno})
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-box danger">
                <span>{error}</span>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha de Atención *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.fecha_atencion}
                  onChange={(e) => setFormData({ ...formData, fecha_atencion: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo de Servicio *</label>
                <select
                  className="form-select"
                  value={formData.tipo_atencion_ayuda}
                  onChange={(e) => setFormData({ ...formData, tipo_atencion_ayuda: e.target.value })}
                >
                  <option value="Ayuda">Ayuda humanitaria general</option>
                  <option value="Kit higiénico">Kit higiénico-sanitario</option>
                  <option value="Kit de dignidad">Kit de dignidad</option>
                  <option value="Kit alimentario">Kit de productos alimenticios</option>
                  <option value="Kit para bebés">Kit para bebés</option>
                  <option value="Salud física">Atención en salud física</option>
                  <option value="Salud mental / Psicosocial">Salud mental / Apoyo psicosocial</option>
                  <option value="Salud sexual y reproductiva">Salud sexual y reproductiva</option>
                  <option value="Asesoría jurídica">Orientación y asesoría legal</option>
                  <option value="Formación / Capacitación">Capacitación / Empleabilidad</option>
                  <option value="Fondo de emergencia">Fondo de emergencias</option>
                  <option value="Remisión">Remisión institucional</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Línea de Resultado Asociada</label>
                <select
                  className="form-select"
                  value={formData.resultado_asociado}
                  onChange={(e) => setFormData({ ...formData, resultado_asociado: e.target.value })}
                >
                  <option value="R1">R1: Asistencia humanitaria y protección</option>
                  <option value="R2">R2: Salud y bienestar</option>
                  <option value="R3">R3: Integración socioeconómica</option>
                  <option value="General">General / Transversal</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Organización que Entrega</label>
                <select
                  className="form-select"
                  value={formData.organizacion}
                  onChange={(e) => setFormData({ ...formData, organizacion: e.target.value })}
                >
                  <option value="COOPI">COOPI Cooperación Internacional</option>
                  <option value="FADV">Fondazione L'Albero della Vita (FADV)</option>
                  <option value="HIAS Colombia">Fundación HIAS Colombia</option>
                  <option value="Humanity & Inclusion (HI)">Humanity and Inclusion (HI)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción de lo Entregado o Realizado *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Ejemplo: Se hace entrega de 1 kit higiénico familiar de 10 piezas y orientación sobre autocuidado."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Estado de la Atención</label>
                <select
                  className="form-select"
                  value={formData.resultado}
                  onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                >
                  <option value="Atendido">Atendido / Entregado</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Remitido">Remitido a otra entidad</option>
                  <option value="Pendiente">Pendiente de completar</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Responsable / Profesional</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre del técnico o enfermero/a"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </div>
            </div>

            {formData.resultado === 'Remitido' && (
              <div className="form-group">
                <label className="form-label">Remitido a (Institución / Centro de Salud)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: Hospital Antonio Roldán Betancur de Apartadó"
                  value={formData.remitido_a}
                  onChange={(e) => setFormData({ ...formData, remitido_a: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (
                <>
                  <CheckCircle size={16} />
                  <span>Guardar Atención</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
