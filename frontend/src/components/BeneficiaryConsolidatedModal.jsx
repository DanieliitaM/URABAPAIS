import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Users,
  FolderGit2,
  HeartHandshake,
  Clock,
  Sparkles,
  Plus,
  CheckCircle,
  AlertTriangle,
  MapPin,
  Phone,
  FileCheck,
  Calendar,
  Building,
  Lock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { NewAttentionModal } from './NewAttentionModal';
import { NewFollowupModal } from './NewFollowupModal';

export const BeneficiaryConsolidatedModal = ({ beneficiaryId, onClose, onRefresh, currentRole }) => {
  const canAddFamily = currentRole?.permissions?.canAddFamily !== false;
  const canEnroll = currentRole?.permissions?.canEnrollProgram !== false;
  const canUpdateProgram = currentRole?.permissions?.canUpdateProgramStatus !== false;
  const canAddAttention = currentRole?.permissions?.canAddAttention !== false;
  const canAddFollowup = currentRole?.permissions?.canAddFollowup !== false;
  const canAccessAI = currentRole?.permissions?.canAccessAI !== false;
  const isDataMasked = currentRole?.permissions?.isDataMasked === true;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen'); // resumen, familia, programas, atenciones, seguimientos
  const [aiSummary, setAiSummary] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Modales secundarios
  const [showAttentionModal, setShowAttentionModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [programsList, setProgramsList] = useState([]);

  // Form familiar rápido
  const [familyForm, setFamilyForm] = useState({
    nombre_completo: '',
    parentesco: 'Hijo/a',
    edad: '',
    tipo_documento: 'CC/Documento',
    numero_documento: '',
    observaciones: ''
  });

  // Form vinculación programa
  const [selectedProgramId, setSelectedProgramId] = useState('');

  const loadBeneficiaryData = async () => {
    try {
      setLoading(true);
      const res = await api.getConsolidatedFile(beneficiaryId);
      setData(res.data);
      const progs = await api.getPrograms();
      setProgramsList(progs.data || []);
      if (progs.data && progs.data.length > 0) {
        setSelectedProgramId(progs.data[0].id);
      }
    } catch (err) {
      console.error('Error cargando ficha:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (beneficiaryId) {
      loadBeneficiaryData();
    }
  }, [beneficiaryId]);

  const handleGenerateAiSummary = async () => {
    try {
      setLoadingAi(true);
      const res = await api.getAiSummary(beneficiaryId);
      setAiSummary(res.data);
    } catch (err) {
      console.error('Error generando resumen IA:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!familyForm.nombre_completo.trim()) return;
    try {
      await api.createFamilyMember({
        ...familyForm,
        beneficiario_id: data.id,
        edad: familyForm.edad ? Number(familyForm.edad) : null
      });
      setShowAddFamilyModal(false);
      setFamilyForm({
        nombre_completo: '',
        parentesco: 'Hijo/a',
        edad: '',
        tipo_documento: 'CC/Documento',
        numero_documento: '',
        observaciones: ''
      });
      loadBeneficiaryData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error al agregar familiar');
    }
  };

  const handleEnrollProgram = async (e) => {
    e.preventDefault();
    try {
      await api.enrollProgram({
        beneficiario_id: data.id,
        programa_id: Number(selectedProgramId),
        fecha_vinculacion: new Date().toISOString().slice(0, 10),
        estado: 'Inscrito'
      });
      setShowEnrollModal(false);
      loadBeneficiaryData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error al vincular programa');
    }
  };

  const handleUpdateProgramStatus = async (partId, newStatus) => {
    try {
      await api.updateParticipationStatus(partId, { estado: newStatus });
      loadBeneficiaryData();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err.message || 'Error al actualizar estado');
    }
  };

  if (loading || !data) {
    return (
      <div className="modal-overlay">
        <div className="modal-container" style={{ maxWidth: '600px', padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando ficha consolidada del beneficiario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '960px', height: '90vh' }}>
        {/* Cabecera de la Ficha */}
        <div className="modal-header" style={{ background: '#fdf2f8', padding: '18px 24px', borderBottom: '1px solid rgba(233, 30, 140, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e91e8c, #c2185b)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(233, 30, 140, 0.3)'
              }}
            >
              {data.nombre_completo.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-main)' }}>{data.nombre_completo}</h2>
                <span className="badge-code" title="Código inmutable único">{data.codigo_interno}</span>
                <span className="badge badge-success">Ficha Activa</span>
                {currentRole && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: `${currentRole.color}20`,
                    color: currentRole.color,
                    border: `1px solid ${currentRole.color}40`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ShieldCheck size={11} />
                    {currentRole.shortName} · {isDataMasked ? 'Modo Lectura' : 'Modo Operativo'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>
                  <strong>Doc:</strong> {data.tipo_documento ? (
                    isDataMasked && data.numero_documento ? `${data.tipo_documento} ••••••${data.numero_documento.slice(-3)}` : `${data.tipo_documento} ${data.numero_documento || 'Sin número'}`
                  ) : 'No especificado'}
                </span>
                <span><strong>Edad:</strong> {data.edad ? `${data.edad} años` : 'No registrada'}</span>
                <span><MapPin size={13} style={{ verticalAlign: '-1px' }} /> {data.municipio} ({data.zona || 'Urbana'})</span>
                <span><Building size={13} style={{ verticalAlign: '-1px' }} /> {data.organizacion_responsable}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className={`btn ${canAccessAI ? 'btn-secondary' : 'btn-secondary btn-disabled-role'} btn-sm`}
              onClick={canAccessAI ? handleGenerateAiSummary : () => alert('Asistente IA no disponible para rol Auditor (solo lectura).')}
              title={canAccessAI ? "Generar resumen de caso asistido" : "Asistente IA deshabilitado para rol Auditor"}
              disabled={loadingAi || !canAccessAI}
              style={!canAccessAI ? { opacity: 0.6 } : {}}
            >
              {canAccessAI ? <Sparkles size={14} color="#e91e8c" /> : <Lock size={13} color="#f87171" />}
              <span>{loadingAi ? 'Generando...' : canAccessAI ? 'Asistente IA' : 'IA (Bloqueada)'}</span>
            </button>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Resumen IA si fue solicitado */}
        {aiSummary && (
          <div style={{ background: '#ecfdf5', borderBottom: '1px solid #6ee7b7', padding: '14px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Sparkles size={18} color="#047857" style={{ marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', color: '#065f46', margin: '0 0 4px 0', fontWeight: 700 }}>Síntesis Asistida de Historial</h4>
                  <p style={{ fontSize: '13px', color: '#047857', margin: 0, whiteSpace: 'pre-line' }}>{aiSummary.resumen_texto}</p>
                  <p style={{ fontSize: '11px', color: '#059669', margin: '6px 0 0 0', fontStyle: 'italic' }}>{aiSummary.aviso_legal}</p>
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setAiSummary(null)}
                style={{ background: 'transparent', border: 'none', color: '#065f46' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Sub-navegación por pestañas de la ficha */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 24px', background: '#fafafa' }}>
          <button
            className={`nav-tab-btn ${activeTab === 'resumen' ? 'active' : ''}`}
            onClick={() => setActiveTab('resumen')}
          >
            <User size={15} />
            <span>Datos Personales</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'familia' ? 'active' : ''}`}
            onClick={() => setActiveTab('familia')}
          >
            <Users size={15} />
            <span>Familia ({data.familiares?.length || 0})</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'programas' ? 'active' : ''}`}
            onClick={() => setActiveTab('programas')}
          >
            <FolderGit2 size={15} />
            <span>Programas ({data.participaciones?.length || 0})</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'atenciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('atenciones')}
          >
            <HeartHandshake size={15} />
            <span>Atenciones y Ayudas ({data.atenciones?.length || 0})</span>
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'seguimientos' ? 'active' : ''}`}
            onClick={() => setActiveTab('seguimientos')}
          >
            <Clock size={15} />
            <span>Seguimientos ({data.seguimientos?.length || 0})</span>
          </button>
        </div>

        {/* Contenido de la pestaña */}
        <div className="modal-body">
          {/* 1. RESUMEN Y DATOS PERSONALES */}
          {activeTab === 'resumen' && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ padding: '18px' }}>
                  <h4 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--color-primary)' }}>
                    Información Sociodemográfica
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Sexo / Género:</span> <strong>{data.sexo || 'No especificado'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Nacionalidad:</span> <strong>{data.nacionalidad || 'Colombiana'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Tipo de Población:</span> <strong>{data.tipo_poblacion || 'Comunidad de acogida'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Discapacidad:</span> <strong>{data.tiene_discapacidad ? `Sí (${data.tipo_discapacidad || 'Especificada'})` : 'No registra'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Fecha de Registro:</span> <strong>{data.fecha_registro}</strong></div>
                  </div>
                </div>

                <div className="card" style={{ padding: '18px' }}>
                  <h4 style={{ fontSize: '15px', marginBottom: '14px', color: 'var(--color-primary)' }}>
                    Contacto y Ubicación
                    {isDataMasked && (
                      <span style={{ float: 'right', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>
                        <Lock size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} />
                        Datos Anonimizados
                      </span>
                    )}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                    <div><span style={{ color: 'var(--text-muted)' }}>Municipio:</span> <strong>{data.municipio}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Zona:</span> <strong>{data.zona || 'Urbana'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Dirección:</span> <strong>{isDataMasked ? 'Sector protegido (Ley 1581)' : data.direccion || 'Sector Comunitario'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Teléfono:</span> <strong>{isDataMasked && data.telefono ? `••••••${data.telefono.slice(-4)}` : data.telefono || 'Sin teléfono reportado'}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)' }}>Correo:</span> <strong>{isDataMasked && data.correo ? '••••••@protegido.org' : data.correo || 'No registra'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Habeas Data */}
              <div style={{ marginTop: '20px', padding: '14px 18px', background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileCheck size={22} color="#047857" />
                <div style={{ fontSize: '13px' }}>
                  <strong style={{ color: '#065f46' }}>Autorización de Tratamiento de Datos (Habeas Data) Vigente</strong>
                  <p style={{ margin: 0, color: '#047857' }}>
                    El beneficiario otorgó su consentimiento expreso para la gestión y seguimiento en el marco de la alianza URABÁ-PAÍS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. NÚCLEO FAMILIAR */}
          {activeTab === 'familia' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                  Familiares y dependientes vinculados a la ficha de {data.nombre_completo}.
                </p>
                <button
                  className={`btn ${canAddFamily ? 'btn-primary' : 'btn-secondary btn-disabled-role'} btn-sm`}
                  onClick={() => {
                    if (!canAddFamily) {
                      alert('Función Bloqueada: El rol Auditor tiene permisos exclusivos de lectura.');
                      return;
                    }
                    setShowAddFamilyModal(true);
                  }}
                  title={canAddFamily ? "Agregar familiar" : "Bloqueado para rol Auditor"}
                  style={!canAddFamily ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  {canAddFamily ? <Plus size={15} /> : <Lock size={13} color="#f87171" />}
                  <span>Agregar Familiar</span>
                  {!canAddFamily && <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>(Bloqueado)</span>}
                </button>
              </div>

              {(!data.familiares || data.familiares.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '36px', background: '#fff0f7', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
                  <Users size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No hay integrantes familiares registrados aún.</p>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={() => setShowAddFamilyModal(true)}>
                    + Registrar primer familiar
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nombre Completo</th>
                        <th>Parentesco</th>
                        <th>Edad</th>
                        <th>Documento</th>
                        <th>Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.familiares.map((f) => (
                        <tr key={f.id}>
                          <td><strong>{f.nombre_completo}</strong></td>
                          <td><span className="badge badge-neutral">{f.parentesco}</span></td>
                          <td>{f.edad ? `${f.edad} años` : '-'}</td>
                          <td>{f.tipo_documento ? `${f.tipo_documento} ${f.numero_documento || ''}` : 'Sin documento'}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{f.observaciones || 'Sin novedades'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. PROGRAMAS Y PARTICIPACIÓN */}
          {activeTab === 'programas' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                  Programas y líneas del proyecto donde participa el beneficiario.
                </p>
                <button
                  className={`btn ${canEnroll ? 'btn-primary' : 'btn-secondary btn-disabled-role'} btn-sm`}
                  onClick={() => {
                    if (!canEnroll) {
                      alert('Función Bloqueada: El rol Auditor no puede modificar participaciones.');
                      return;
                    }
                    setShowEnrollModal(true);
                  }}
                  title={canEnroll ? "Vincular a programa" : "Bloqueado para rol Auditor"}
                  style={!canEnroll ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  {canEnroll ? <Plus size={15} /> : <Lock size={13} color="#f87171" />}
                  <span>Vincular a Programa</span>
                  {!canEnroll && <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>(Bloqueado)</span>}
                </button>
              </div>

              {(!data.participaciones || data.participaciones.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '36px', background: '#fff0f7', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
                  <FolderGit2 size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Sin vinculaciones a programas activas.</p>
                  {canEnroll && (
                    <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={() => setShowEnrollModal(true)}>
                      + Vincular ahora
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Programa</th>
                        <th>Línea de Intervención</th>
                        <th>Fecha Vinculación</th>
                        <th>Estado Actual</th>
                        <th>Cambiar Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.participaciones.map((p) => (
                        <tr key={p.id}>
                          <td><span className="badge-code">{p.programa_codigo}</span></td>
                          <td><strong>{p.programa_nombre}</strong></td>
                          <td>{p.linea_trabajo}</td>
                          <td>{p.fecha_vinculacion}</td>
                          <td>
                            <span
                              className={`badge ${
                                p.estado === 'Finalizado' ? 'badge-success' :
                                p.estado === 'En proceso' ? 'badge-info' :
                                p.estado === 'Retirado' ? 'badge-danger' : 'badge-warning'
                              }`}
                            >
                              {p.estado}
                            </span>
                          </td>
                          <td>
                            {canUpdateProgram ? (
                              <select
                                className="form-select"
                                style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                                value={p.estado}
                                onChange={(e) => handleUpdateProgramStatus(p.id, e.target.value)}
                              >
                                <option value="Inscrito">Inscrito</option>
                                <option value="En proceso">En proceso</option>
                                <option value="Finalizado">Finalizado</option>
                                <option value="Retirado">Retirado</option>
                              </select>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Lock size={11} /> Solo lectura
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. ATENCIONES Y AYUDAS ENTREGADAS */}
          {activeTab === 'atenciones' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                  Registro de bienes, kits, atenciones médicas y psicosociales entregadas.
                </p>
                <button
                  className={`btn ${canAddAttention ? 'btn-primary' : 'btn-secondary btn-disabled-role'} btn-sm`}
                  onClick={() => {
                    if (!canAddAttention) {
                      alert('Función Bloqueada: El rol Auditor no tiene autorización para registrar atenciones.');
                      return;
                    }
                    setShowAttentionModal(true);
                  }}
                  title={canAddAttention ? "Registrar atención o ayuda" : "Bloqueado para rol Auditor"}
                  style={!canAddAttention ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  {canAddAttention ? <Plus size={15} /> : <Lock size={13} color="#f87171" />}
                  <span>+ Registrar Atención / Ayuda</span>
                  {!canAddAttention && <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>(Bloqueado)</span>}
                </button>
              </div>

              {(!data.atenciones || data.atenciones.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '36px', background: '#fff0f7', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
                  <HeartHandshake size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No hay atenciones ni ayudas registradas aún.</p>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={() => setShowAttentionModal(true)}>
                    + Registrar primera atención
                  </button>
                </div>
              ) : (
                <div className="timeline">
                  {data.atenciones.map((a) => (
                    <div className="timeline-item" key={a.id}>
                      <div className="timeline-dot" style={{ borderColor: 'var(--color-primary)' }}></div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{a.tipo_atencion_ayuda}</strong>
                            {a.resultado_asociado && <span className="badge-code">{a.resultado_asociado}</span>}
                            <span className="badge badge-success">{a.resultado}</span>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {a.fecha_atencion}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px' }}>
                          {a.descripcion || a.actividad_recibida}
                        </p>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                          <span><strong>Entidad:</strong> {a.organizacion}</span>
                          {a.responsable && <span><strong>Responsable:</strong> {a.responsable}</span>}
                          {a.remitido_a && <span><strong>Remitido a:</strong> {a.remitido_a}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. SEGUIMIENTOS Y PRÓXIMA ACCIÓN */}
          {activeTab === 'seguimientos' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
                  Bitácora de novedades, evolución del caso y compromisos pendientes.
                </p>
                <button
                  className={`btn ${canAddFollowup ? 'btn-primary' : 'btn-secondary btn-disabled-role'} btn-sm`}
                  onClick={() => {
                    if (!canAddFollowup) {
                      alert('Función Bloqueada: El rol Auditor no tiene autorización para registrar seguimientos.');
                      return;
                    }
                    setShowFollowupModal(true);
                  }}
                  title={canAddFollowup ? "Añadir seguimiento" : "Bloqueado para rol Auditor"}
                  style={!canAddFollowup ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
                >
                  {canAddFollowup ? <Plus size={15} /> : <Lock size={13} color="#f87171" />}
                  <span>+ Añadir Seguimiento</span>
                  {!canAddFollowup && <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 700 }}>(Bloqueado)</span>}
                </button>
              </div>

              {(!data.seguimientos || data.seguimientos.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '36px', background: '#fff0f7', borderRadius: '12px', border: '1px dashed var(--border-medium)' }}>
                  <Clock size={32} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No hay seguimientos registrados aún.</p>
                  <button className="btn btn-secondary btn-sm" style={{ marginTop: '10px' }} onClick={() => setShowFollowupModal(true)}>
                    + Añadir primer seguimiento
                  </button>
                </div>
              ) : (
                <div className="timeline">
                  {data.seguimientos.map((s) => (
                    <div className="timeline-item" key={s.id}>
                      <div className="timeline-dot" style={{ borderColor: s.estado_caso === 'Pendiente' ? '#d97706' : '#059669' }}></div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`badge ${s.estado_caso === 'Pendiente' ? 'badge-warning' : 'badge-info'}`}>
                              {s.estado_caso}
                            </span>
                            {s.proximo_contacto && (
                              <span style={{ fontSize: '12px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, border: '1px solid #fcd34d' }}>
                                Próximo contacto: {s.proximo_contacto}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} /> {s.fecha_seguimiento}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '8px' }}>
                          {s.avance_novedad}
                        </p>
                        {s.accion_pendiente && (
                          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', marginBottom: '8px' }}>
                            <strong style={{ color: '#92400e' }}>Acción Pendiente: </strong>
                            <span style={{ color: '#78350f' }}>{s.accion_pendiente}</span>
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {s.responsable && <span><strong>Profesional:</strong> {s.responsable}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar Ficha
          </button>
        </div>
      </div>

      {/* Modal Registrar Atención */}
      {showAttentionModal && (
        <NewAttentionModal
          beneficiary={data}
          programs={programsList}
          onClose={() => setShowAttentionModal(false)}
          onSuccess={() => {
            setShowAttentionModal(false);
            loadBeneficiaryData();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Modal Registrar Seguimiento */}
      {showFollowupModal && (
        <NewFollowupModal
          beneficiary={data}
          onClose={() => setShowFollowupModal(false)}
          onSuccess={() => {
            setShowFollowupModal(false);
            loadBeneficiaryData();
            if (onRefresh) onRefresh();
          }}
        />
      )}

      {/* Modal Agregar Familiar Rápido */}
      {showAddFamilyModal && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', margin: 0 }}>Agregar Integrante al Núcleo Familiar</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAddFamilyModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddFamilyMember}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nombre Completo *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={familyForm.nombre_completo}
                    onChange={(e) => setFamilyForm({ ...familyForm, nombre_completo: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Parentesco *</label>
                    <select
                      className="form-select"
                      value={familyForm.parentesco}
                      onChange={(e) => setFamilyForm({ ...familyForm, parentesco: e.target.value })}
                    >
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Cónyuge/Pareja">Cónyuge/Pareja</option>
                      <option value="Madre/Padre">Madre/Padre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Abuelo/a">Abuelo/a</option>
                      <option value="Nieto/a">Nieto/a</option>
                      <option value="Otro">Otro dependiente</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Edad</label>
                    <input
                      type="number"
                      className="form-input"
                      value={familyForm.edad}
                      onChange={(e) => setFamilyForm({ ...familyForm, edad: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tipo Documento</label>
                    <select
                      className="form-select"
                      value={familyForm.tipo_documento}
                      onChange={(e) => setFamilyForm({ ...familyForm, tipo_documento: e.target.value })}
                    >
                      <option value="CC/Documento">CC / Cédula</option>
                      <option value="TI">Tarjeta de Identidad</option>
                      <option value="RC">Registro Civil</option>
                      <option value="PEP/PPT">PEP / PPT</option>
                      <option value="Sin documento">Sin documento</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Número Documento</label>
                    <input
                      type="text"
                      className="form-input"
                      value={familyForm.numero_documento}
                      onChange={(e) => setFamilyForm({ ...familyForm, numero_documento: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddFamilyModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Guardar Familiar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vincular a Programa */}
      {showEnrollModal && (
        <div className="modal-overlay" style={{ zIndex: 110 }}>
          <div className="modal-container" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', margin: 0 }}>Vincular a Programa o Línea</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEnrollModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleEnrollProgram}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Seleccione el Programa</label>
                  <select
                    className="form-select"
                    value={selectedProgramId}
                    onChange={(e) => setSelectedProgramId(e.target.value)}
                  >
                    {programsList.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        [{prog.codigo}] {prog.nombre} ({prog.linea_trabajo})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="alert-box info" style={{ fontSize: '13px' }}>
                  <span>El beneficiario quedará vinculado en estado <strong>Inscrito</strong> y se contabilizará en los reportes de este programa sin alterar el contador de personas únicas.</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEnrollModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirmar Vinculación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
