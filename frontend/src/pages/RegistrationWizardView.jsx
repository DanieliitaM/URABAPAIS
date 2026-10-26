import React, { useState, useEffect } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Users,
  FolderGit2,
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';
import { PrivacyRestrictedScreen } from '../components/PrivacyRestrictedScreen';

export const RegistrationWizardView = ({ onCompleteRegistration, onOpenExistingBeneficiary, currentRole, onOpenRoleSwitcher }) => {
  const canRegister = currentRole?.permissions?.canRegisterBeneficiary !== false;

  if (!canRegister) {
    return (
      <PrivacyRestrictedScreen
        title="Módulo de Registro Deshabilitado para este Rol"
        message={`El rol "${currentRole?.name || 'actual'}" tiene perfil de ${currentRole?.tag || 'solo lectura'}. Para registrar nuevos beneficiarios, núcleos familiares y apoyos iniciales, active el rol de Técnico o Administrador.`}
        currentRole={currentRole}
        onOpenRoleSwitcher={onOpenRoleSwitcher}
      />
    );
  }

  const [currentStep, setCurrentStep] = useState(1);

  // Paso 1: Búsqueda previa y validación de duplicados
  const [searchParams, setSearchParams] = useState({
    tipo_documento: 'CC/Documento',
    numero_documento: '',
    nombre_completo: '',
    telefono: '',
    edad: ''
  });

  const [searchStatus, setSearchStatus] = useState(null); // null, 'searching', 'duplicate_found', 'similar_warning', 'clean'
  const [duplicateData, setDuplicateData] = useState(null);

  // Paso 2: Datos Básicos y Habeas Data
  const [formData, setFormData] = useState({
    tipo_documento: 'CC/Documento',
    numero_documento: '',
    nombre_completo: '',
    sexo: 'Mujer',
    edad: '',
    fecha_nacimiento: '',
    telefono: '',
    correo: '',
    municipio: 'Apartadó',
    zona: 'Urbana',
    direccion: '',
    nacionalidad: 'Colombiana',
    tipo_poblacion: 'Comunidad de acogida',
    organizacion_responsable: 'COOPI',
    tiene_discapacidad: false,
    tipo_discapacidad: '',
    autorizacion_datos: true // Habeas Data
  });

  // Paso 3: Núcleo Familiar
  const [familiares, setFamiliares] = useState([]);
  const [newFamilyMember, setNewFamilyMember] = useState({
    nombre_completo: '',
    parentesco: 'Hijo/a',
    edad: '',
    tipo_documento: 'TI',
    numero_documento: '',
    observaciones: ''
  });

  // Paso 4: Programas
  const [programsList, setProgramsList] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState('');

  // Paso 5: Primera Atención o Ayuda
  const [atencionInicial, setAtencionInicial] = useState({
    registrar_atencion: true,
    tipo_atencion_ayuda: 'Kit higiénico',
    descripcion: 'Entrega inicial de kit higiénico-sanitario familiar y orientación sobre derechos y servicios del proyecto URABÁ-PAÍS.',
    responsable: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  // Cargar programas disponibles
  useEffect(() => {
    api.getPrograms().then((res) => {
      setProgramsList(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedProgramId(res.data[0].id);
      }
    });
  }, []);

  // Función de búsqueda de duplicados (Paso 1)
  const handleCheckDuplicates = async (e) => {
    if (e) e.preventDefault();
    if (!searchParams.numero_documento && !searchParams.nombre_completo) {
      alert('Por favor ingrese al menos el número de documento o el nombre para verificar en la base de datos.');
      return;
    }

    try {
      setSearchStatus('searching');
      const res = await api.checkDuplicates(searchParams);
      const result = res.data;

      if (result.duplicateFound) {
        setSearchStatus('duplicate_found');
        setDuplicateData(result);
      } else if (result.hasSimilarWarnings) {
        setSearchStatus('similar_warning');
        setDuplicateData(result);
      } else {
        setSearchStatus('clean');
        setDuplicateData(result);
        // Pre-cargar datos verificados al formulario del paso 2
        setFormData((prev) => ({
          ...prev,
          tipo_documento: searchParams.tipo_documento,
          numero_documento: searchParams.numero_documento,
          nombre_completo: searchParams.nombre_completo || prev.nombre_completo,
          telefono: searchParams.telefono || prev.telefono,
          edad: searchParams.edad || prev.edad
        }));
      }
    } catch (err) {
      alert('Error verificando duplicados: ' + err.message);
      setSearchStatus(null);
    }
  };

  // Añadir familiar a la lista temporal
  const handleAddFamilyMember = (e) => {
    e.preventDefault();
    if (!newFamilyMember.nombre_completo.trim()) return;

    setFamiliares([...familiares, { ...newFamilyMember, edad: newFamilyMember.edad ? Number(newFamilyMember.edad) : null }]);
    setNewFamilyMember({
      nombre_completo: '',
      parentesco: 'Hijo/a',
      edad: '',
      tipo_documento: 'TI',
      numero_documento: '',
      observaciones: ''
    });
  };

  const handleRemoveFamilyMember = (index) => {
    setFamiliares(familiares.filter((_, i) => i !== index));
  };

  // Envío final del registro completo (Paso 5)
  const handleFinalSubmit = async () => {
    if (!formData.autorizacion_datos) {
      setSubmissionError('Es obligatorio contar con la autorización de tratamiento de datos personales (Habeas Data).');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionError('');

      const payload = {
        ...formData,
        edad: formData.edad ? Number(formData.edad) : null,
        programa_id: selectedProgramId ? Number(selectedProgramId) : null,
        familiares: familiares.length > 0 ? familiares : undefined,
        actividad_inicial: atencionInicial.registrar_atencion ? {
          tipo_atencion_ayuda: atencionInicial.tipo_atencion_ayuda,
          descripcion: atencionInicial.descripcion,
          responsable: atencionInicial.responsable
        } : undefined
      };

      const res = await api.createBeneficiary(payload);
      const created = res.data;
      onCompleteRegistration(created);
    } catch (err) {
      setSubmissionError(err.message || 'Error al completar registro');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Encabezado */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '26px', color: 'var(--text-main)', marginBottom: '6px' }}>
          Asistente de Registro Único de Beneficiarios
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Recorrido guiado de 5 pasos para el registro, vinculación a programas y primera atención sin duplicados.
        </p>
      </div>

      {/* Stepper Visual de los 5 Pasos */}
      <div className="stepper-container">
        <div className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 1 ? '✓' : '1'}</div>
          <span className="step-label">Búsqueda Previa</span>
        </div>
        <div className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 2 ? '✓' : '2'}</div>
          <span className="step-label">Datos &amp; Habeas Data</span>
        </div>
        <div className={`step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 3 ? '✓' : '3'}</div>
          <span className="step-label">Núcleo Familiar</span>
        </div>
        <div className={`step-item ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`}>
          <div className="step-circle">{currentStep > 4 ? '✓' : '4'}</div>
          <span className="step-label">Programa</span>
        </div>
        <div className={`step-item ${currentStep === 5 ? 'active' : ''}`}>
          <div className="step-circle">5</div>
          <span className="step-label">Primera Atención</span>
        </div>
      </div>

      {/* Contenedor del Paso Activo */}
      <div className="card" style={{ padding: '32px' }}>
        {/* ========================================================================= */}
        {/* PASO 1: BÚSQUEDA PREVIA Y CONTROL DE DUPLICADOS (OBLIGATORIO SECCIÓN 5.1) */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Search size={22} color="var(--color-primary)" />
              <h3 style={{ fontSize: '18px', margin: 0 }}>Paso 1: Verificación de Duplicados en Base de Datos</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              De acuerdo con las reglas oficiales del proyecto, <strong>antes de crear un registro debe buscarse a la persona</strong>.
              Si coinciden tipo y documento, el sistema impedirá el duplicado y le permitirá abrir la ficha existente.
            </p>

            <form onSubmit={handleCheckDuplicates} style={{ background: 'rgba(233,30,140,0.03)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Tipo de Documento</label>
                  <select
                    className="form-select"
                    value={searchParams.tipo_documento}
                    onChange={(e) => setSearchParams({ ...searchParams, tipo_documento: e.target.value })}
                  >
                    <option value="CC/Documento">CC / Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PEP/PPT">PEP / PPT (Permiso por Protección Temporal)</option>
                    <option value="Sin documento">Sin documento de identidad</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Número de Documento *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: FIC-200001 o 104523412"
                    value={searchParams.numero_documento}
                    onChange={(e) => setSearchParams({ ...searchParams, numero_documento: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombres y Apellidos (Opcional para búsqueda fonética/similar)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Mariana Córdoba"
                    value={searchParams.nombre_completo}
                    onChange={(e) => setSearchParams({ ...searchParams, nombre_completo: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Teléfono de Contacto (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: 3101234567"
                    value={searchParams.telefono}
                    onChange={(e) => setSearchParams({ ...searchParams, telefono: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Search size={16} />
                <span>Verificar Disponibilidad en el Sistema</span>
              </button>
            </form>

            {/* Resultado: Duplicado Encontrado */}
            {searchStatus === 'duplicate_found' && duplicateData?.existingBeneficiary && (
              <div className="alert-box danger animate-slide-down" style={{ marginTop: '20px' }}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--color-danger)', margin: '0 0 6px 0' }}>
                    ¡Beneficiario Ya Existente Encontrado! (Regla Anti-Duplicados)
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                    {duplicateData.message}
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{duplicateData.existingBeneficiary.nombre_completo}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Código: <span className="badge-code">{duplicateData.existingBeneficiary.codigo_interno}</span> | Municipio: {duplicateData.existingBeneficiary.municipio}
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onOpenExistingBeneficiary(duplicateData.existingBeneficiary.id)}
                    >
                      <ExternalLink size={14} />
                      <span>Abrir Ficha Existente</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resultado: Coincidencias Similares */}
            {searchStatus === 'similar_warning' && (
              <div className="alert-box warning animate-slide-down" style={{ marginTop: '20px' }}>
                <AlertTriangle size={24} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--color-warning)', margin: '0 0 6px 0' }}>
                    Advertencia: Posibles Coincidencias Detectadas
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>
                    Se encontraron registros con nombres o teléfonos parecidos. Verifique si se trata de la misma persona antes de crear un nuevo registro:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    {(duplicateData.matches || []).map((m) => (
                      <div key={m.id} style={{ background: 'rgba(255,255,255,0.06)', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px' }}>
                          <strong>{m.nombre_completo}</strong> ({m.codigo_interno}) - Tel: {m.telefono || 'Sin tel'} - {m.municipio}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => onOpenExistingBeneficiary(m.id)}
                        >
                          Ver Ficha
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        tipo_documento: searchParams.tipo_documento,
                        numero_documento: searchParams.numero_documento,
                        nombre_completo: searchParams.nombre_completo || prev.nombre_completo,
                        telefono: searchParams.telefono || prev.telefono
                      }));
                      setCurrentStep(2);
                    }}
                  >
                    Confirmar que es una persona distinta y continuar →
                  </button>
                </div>
              </div>
            )}

            {/* Resultado: Persona Nueva Verificada */}
            {searchStatus === 'clean' && (
              <div className="alert-box success animate-slide-down" style={{ marginTop: '20px' }}>
                <CheckCircle size={22} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--color-success)', margin: '0 0 4px 0' }}>
                    Verificación Exitosa: Persona no registrada previamente
                  </h4>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
                    No existen duplicados para este documento. El sistema generará automáticamente un <strong>Código Interno Inmutable</strong> al completar el registro.
                  </p>
                  <button className="btn btn-primary" onClick={() => setCurrentStep(2)}>
                    <span>Continuar al Paso 2: Datos Personales</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 2: DATOS BÁSICOS Y AUTORIZACIÓN HABEAS DATA                          */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Paso 2: Datos Personales y Autorización de Datos</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombres y Apellidos"
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sexo / Género</label>
                <select
                  className="form-select"
                  value={formData.sexo}
                  onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                >
                  <option value="Mujer">Mujer</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Intersexual">Intersexual</option>
                  <option value="No binario">No binario</option>
                  <option value="Prefiero no responder">Prefiero no responder</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Edad (años)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Ej: 32"
                  value={formData.edad}
                  onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Municipio *</label>
                <select
                  className="form-select"
                  value={formData.municipio}
                  onChange={(e) => setFormData({ ...formData, municipio: e.target.value })}
                  required
                >
                  <option value="Apartadó">Apartadó</option>
                  <option value="Turbo">Turbo</option>
                  <option value="Necoclí">Necoclí</option>
                  <option value="Carepa">Carepa</option>
                  <option value="Chigorodó">Chigorodó</option>
                  <option value="Mutatá">Mutatá</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Zona</label>
                <select
                  className="form-select"
                  value={formData.zona}
                  onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
                >
                  <option value="Urbana">Urbana</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tipo de Población (Enfoque Diferencial)</label>
                <select
                  className="form-select"
                  value={formData.tipo_poblacion}
                  onChange={(e) => setFormData({ ...formData, tipo_poblacion: e.target.value })}
                >
                  <option value="Migrante">Población Migrante</option>
                  <option value="Refugiado/a o solicitante de asilo">Refugiado/a o Solicitante de asilo</option>
                  <option value="Retornado/a">Retornado/a</option>
                  <option value="Comunidad de acogida">Comunidad de acogida</option>
                  <option value="Víctima del conflicto">Víctima del conflicto armado</option>
                  <option value="Desplazada">Población desplazada</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Organización que Realiza el Registro</label>
                <select
                  className="form-select"
                  value={formData.organizacion_responsable}
                  onChange={(e) => setFormData({ ...formData, organizacion_responsable: e.target.value })}
                >
                  <option value="COOPI">COOPI Cooperación Internacional</option>
                  <option value="FADV">Fondazione L'Albero della Vita (FADV)</option>
                  <option value="HIAS Colombia">Fundación HIAS Colombia</option>
                  <option value="Humanity & Inclusion (HI)">Humanity and Inclusion (HI)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teléfono de Contacto</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: 3109876543"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Dirección o Sector</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Barrio / Vereda / Comunidad"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
            </div>

            {/* Habeas Data Checkbox Card Obligatorio */}
            <div
              className="checkbox-card"
              style={{
                marginTop: '16px',
                borderColor: formData.autorizacion_datos ? 'var(--color-success-border)' : 'var(--color-danger-border)',
                background: formData.autorizacion_datos ? '#f0fdf4' : '#fef2f2'
              }}
              onClick={() => setFormData({ ...formData, autorizacion_datos: !formData.autorizacion_datos })}
            >
              <input
                type="checkbox"
                checked={formData.autorizacion_datos}
                onChange={(e) => setFormData({ ...formData, autorizacion_datos: e.target.checked })}
                style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
              />
              <div>
                <strong style={{ fontSize: '14px', color: formData.autorizacion_datos ? '#166534' : 'var(--color-danger)' }}>
                  Autorización Expresa para el Tratamiento de Datos Personales (Habeas Data) *
                </strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Manifiesto que la persona ha sido informada sobre el propósito humanitario del proyecto URABÁ-PAÍS y autoriza el registro seguro de su información.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px' }}>
              <button className="btn btn-secondary" onClick={() => setCurrentStep(1)}>
                <ArrowLeft size={16} />
                <span>Volver a Búsqueda</span>
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!formData.nombre_completo.trim()) {
                    alert('Por favor ingrese el nombre completo.');
                    return;
                  }
                  if (!formData.autorizacion_datos) {
                    alert('Es obligatorio el consentimiento de tratamiento de datos.');
                    return;
                  }
                  setCurrentStep(3);
                }}
              >
                <span>Siguiente: Núcleo Familiar</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 3: NÚCLEO FAMILIAR (REQUISITO OBLIGATORIO SECCIÓN 5)                 */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Paso 3: Información del Núcleo Familiar</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Relacione al menos un integrante familiar dependiente para contextualizar las necesidades del beneficiario.
            </p>

            {/* Formulario para añadir familiar */}
            <form onSubmit={handleAddFamilyMember} style={{ background: 'rgba(233,30,140,0.03)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--color-primary)' }}>+ Agregar Integrante Familiar</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre del Familiar *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre completo"
                    value={newFamilyMember.nombre_completo}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, nombre_completo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parentesco *</label>
                  <select
                    className="form-select"
                    value={newFamilyMember.parentesco}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, parentesco: e.target.value })}
                  >
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Cónyuge/Pareja">Cónyuge/Pareja</option>
                    <option value="Madre/Padre">Madre/Padre</option>
                    <option value="Hermano/a">Hermano/a</option>
                    <option value="Abuelo/a">Abuelo/a</option>
                    <option value="Otro">Otro familiar dependiente</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Edad</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej: 8"
                    value={newFamilyMember.edad}
                    onChange={(e) => setNewFamilyMember({ ...newFamilyMember, edad: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-secondary btn-sm">
                <Plus size={15} />
                <span>Agregar a la Lista Familiar</span>
              </button>
            </form>

            {/* Lista de familiares añadidos */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Integrantes Registrados ({familiares.length}):</h4>
              {familiares.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Aún no ha agregado integrantes. Puede agregar uno ahora o continuar si el beneficiario vive solo.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {familiares.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(233,30,140,0.04)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                      <div>
                        <strong>{f.nombre_completo}</strong> – <span className="badge badge-neutral">{f.parentesco}</span> {f.edad ? `(${f.edad} años)` : ''}
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--color-danger)', border: 'none' }}
                        onClick={() => handleRemoveFamilyMember(i)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setCurrentStep(2)}>
                <ArrowLeft size={16} />
                <span>Volver a Datos Personales</span>
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentStep(4)}>
                <span>Siguiente: Vinculación a Programa</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 4: VINCULACIÓN A PROGRAMA (REQUISITO OBLIGATORIO SECCIÓN 5)          */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Paso 4: Vinculación a Programas del Proyecto</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Vincule al beneficiario con al menos un programa de las 3 líneas de trabajo de URABÁ-PAÍS.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              {programsList.map((p) => {
                const isSelected = String(selectedProgramId) === String(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProgramId(p.id)}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--border-light)'}`,
                      background: isSelected ? 'var(--color-primary-subtle)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge-code">{p.codigo}</span>
                        <strong style={{ fontSize: '15px' }}>{p.nombre}</strong>
                      </div>
                      <span className="badge badge-info">Organización líder: {p.organizacion_lider}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                      {p.descripcion}
                    </p>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Estado inicial de participación: <strong>Inscrito</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setCurrentStep(3)}>
                <ArrowLeft size={16} />
                <span>Volver a Núcleo Familiar</span>
              </button>
              <button className="btn btn-primary" onClick={() => setCurrentStep(5)}>
                <span>Siguiente: Primera Atención</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PASO 5: PRIMERA ATENCIÓN O AYUDA Y FINALIZACIÓN (FLUJO COMPLETO)          */}
        {/* ========================================================================= */}
        {currentStep === 5 && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Paso 5: Primera Atención o Ayuda Entregada</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
              Complete el recorrido registrando la primera ayuda entregada o servicio prestado.
            </p>

            <div className="checkbox-card" style={{ marginBottom: '18px' }} onClick={() => setAtencionInicial({ ...atencionInicial, registrar_atencion: !atencionInicial.registrar_atencion })}>
              <input
                type="checkbox"
                checked={atencionInicial.registrar_atencion}
                onChange={(e) => setAtencionInicial({ ...atencionInicial, registrar_atencion: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <strong>Registrar primera atención / entrega en este momento</strong>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                  Añade un registro en el historial con fecha de hoy.
                </p>
              </div>
            </div>

            {atencionInicial.registrar_atencion && (
              <div style={{ background: 'rgba(233,30,140,0.03)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Tipo de Atención o Ayuda Entregada</label>
                  <select
                    className="form-select"
                    value={atencionInicial.tipo_atencion_ayuda}
                    onChange={(e) => setAtencionInicial({ ...atencionInicial, tipo_atencion_ayuda: e.target.value })}
                  >
                    <option value="Kit higiénico">1.1.1 Kits higiénico-sanitarios familiares</option>
                    <option value="Kit de dignidad">1.1.2 Kits de dignidad</option>
                    <option value="Kit alimentario">1.1.3 Kits con productos alimenticios</option>
                    <option value="Kit para bebés">1.1.4 Kits para bebés</option>
                    <option value="Salud física">2.1 Atención de salud básica y equipamiento</option>
                    <option value="Salud mental / Psicosocial">2.2 Salud mental y apoyo psicosocial</option>
                    <option value="Formación / Capacitación">3.1 Formación para empleabilidad e inclusión</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción de la Acción Realizada *</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    value={atencionInicial.descripcion}
                    onChange={(e) => setAtencionInicial({ ...atencionInicial, descripcion: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Profesional Responsable</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nombre del técnico o responsable en campo"
                    value={atencionInicial.responsable}
                    onChange={(e) => setAtencionInicial({ ...atencionInicial, responsable: e.target.value })}
                  />
                </div>
              </div>
            )}

            {submissionError && (
              <div className="alert-box danger">
                <span>{submissionError}</span>
              </div>
            )}

            {/* Resumen Final */}
            <div style={{ background: 'rgba(5,150,105,0.08)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(5,150,105,0.2)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', marginBottom: '4px' }}>
                <CheckCircle size={18} />
                <strong>Todo listo para crear la ficha inmutable</strong>
              </div>
              <p style={{ fontSize: '13px', color: '#14532d', margin: 0 }}>
                Se creará el registro de <strong>{formData.nombre_completo}</strong> en el municipio de <strong>{formData.municipio}</strong> con {familiares.length} familiar(es) vinculado(s) y asignación al programa seleccionado.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setCurrentStep(4)} disabled={isSubmitting}>
                <ArrowLeft size={16} />
                <span>Volver a Programa</span>
              </button>
              <button className="btn btn-primary btn-lg" onClick={handleFinalSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando en Base de Datos...' : (
                  <>
                    <CheckCircle size={18} />
                    <span>Confirmar y Finalizar Registro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
