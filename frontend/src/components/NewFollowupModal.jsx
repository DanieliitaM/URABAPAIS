import React, { useState } from 'react';
import { X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const NewFollowupModal = ({ beneficiary, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    beneficiario_id: beneficiary.id,
    fecha_seguimiento: new Date().toISOString().slice(0, 10),
    avance_novedad: '',
    observacion: '',
    estado_caso: 'En seguimiento',
    accion_pendiente: '',
    proximo_contacto: '',
    responsable: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.avance_novedad.trim() || !formData.accion_pendiente.trim()) {
      setError('Por favor detalle el avance o novedad y la acción pendiente.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.createFollowup(formData);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Error al registrar seguimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '8px', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', margin: 0 }}>Registrar Seguimiento y Novedad</h3>
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
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="alert-box info" style={{ fontSize: '13px', padding: '10px 14px' }}>
              <span>
                💡 <strong>Recordatorio metodológico:</strong> El seguimiento registra los cambios en la situación del beneficiario y define compromisos o acciones pendientes concretas.
              </span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha de Seguimiento *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.fecha_seguimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_seguimiento: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Estado del Caso *</label>
                <select
                  className="form-select"
                  value={formData.estado_caso}
                  onChange={(e) => setFormData({ ...formData, estado_caso: e.target.value })}
                >
                  <option value="En seguimiento">En seguimiento (Caso activo con pasos pendientes)</option>
                  <option value="Pendiente">Pendiente urgente</option>
                  <option value="Atendido">Atendido satisfactoriamente</option>
                  <option value="Finalizado">Proceso finalizado con éxito</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Avance, Cambio o Novedad Observada *</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Ejemplo: Se constata mejoría en las condiciones del hogar tras entrega de insumos. La familia reporta estabilidad en Apartadó."
                value={formData.avance_novedad}
                onChange={(e) => setFormData({ ...formData, avance_novedad: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Acción Pendiente o Próximo Compromiso *</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Ejemplo: Coordinar remisión a taller de emprendimiento socioeconómico para el próximo mes."
                value={formData.accion_pendiente}
                onChange={(e) => setFormData({ ...formData, accion_pendiente: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fecha Estimada Próximo Contacto</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.proximo_contacto}
                  onChange={(e) => setFormData({ ...formData, proximo_contacto: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profesional Responsable</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre de trabajador/a social"
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : (
                <>
                  <CheckCircle size={16} />
                  <span>Guardar Seguimiento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
