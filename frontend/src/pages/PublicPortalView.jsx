import React from 'react';
import { Globe, Shield, HeartHandshake, MapPin, Phone, Mail, Award, CheckCircle, UserCheck } from 'lucide-react';

export const PublicPortalView = ({ currentRole, onOpenRoleSwitcher }) => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Banner de Presentación */}
      <div
        style={{
          background: 'linear-gradient(135deg, #e91e8c 0%, #c2185b 100%)',
          color: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>
            <Globe size={14} />
            <span>Portal de Información Comunitaria y Transparencia</span>
          </div>

          {onOpenRoleSwitcher && (
            <button
              onClick={onOpenRoleSwitcher}
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.25)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontSize: '12px' }}
            >
              <UserCheck size={14} />
              <span>Rol actual: {currentRole?.shortName || 'Comunidad'} · Cambiar</span>
            </button>
          )}
        </div>

        <h1 style={{ fontSize: '32px', color: 'white', marginBottom: '12px', lineHeight: 1.2 }}>
          Iniciativa Humanitaria URABÁ-PAÍS
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.95, maxWidth: '720px', lineHeight: 1.6, margin: 0 }}>
          Alianza estratégica entre <strong>COOPI Cooperación Internacional</strong>, <strong>Fondazione L'Albero della Vita (FADV)</strong>, <strong>Fundación HIAS Colombia</strong> y <strong>Humanity &amp; Inclusion (HI)</strong> para la protección, salud e integración socioeconómica en el Urabá antioqueño.
        </p>
      </div>

      {/* Compromiso de Protección de Datos */}
      <div className="alert-box info" style={{ marginBottom: '32px' }}>
        <Shield size={22} style={{ flexShrink: 0 }} />
        <div>
          <strong>Política de Privacidad y Protección de Datos Personales (Ley 1581)</strong>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>
            Este portal de consulta comunitaria <strong>no publica nombres, documentos de identidad ni información sensible</strong> de ninguna persona atendida, garantizando el estricto cumplimiento de la Ley 1581 de Habeas Data y el respeto a la dignidad humana.
          </p>
        </div>
      </div>

      {/* Las 3 Líneas de Acción */}
      <div style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Nuestras 3 Líneas de Trabajo</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card">
            <span className="badge-code" style={{ marginBottom: '12px' }}>Línea 1 · R1</span>
            <h4 style={{ fontSize: '16px', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Asistencia Humanitaria y Protección
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              Orientación frente a necesidades urgentes, entrega de kits de higiene familiar, kits de dignidad y alimentos, y fondos para situaciones de emergencia.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Liderado por: <strong>COOPI</strong></div>
          </div>

          <div className="card">
            <span className="badge-code" style={{ marginBottom: '12px' }}>Línea 2 · R2</span>
            <h4 style={{ fontSize: '16px', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Salud y Bienestar Integral
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              Atención médica general, primeros auxilios psicológicos, apoyo en salud mental comunitaria y acompañamiento en derechos sexuales y reproductivos.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Liderado por: <strong>FADV</strong></div>
          </div>

          <div className="card">
            <span className="badge-code" style={{ marginBottom: '12px' }}>Línea 3 · R3</span>
            <h4 style={{ fontSize: '16px', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Integración Socioeconómica
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              Formación para el empleo, inclusión financiera, fortalecimiento asociativo, microemprendimientos y cohesión con las comunidades de acogida.
            </p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Liderado por: <strong>HIAS Colombia &amp; HI</strong></div>
          </div>
        </div>
      </div>

      {/* Puntos de Atención y Rutas en Urabá */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--color-primary)" />
          <span>Puntos de Orientación y Atención Comunitaria en Urabá</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(233,30,140,0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ fontSize: '15px' }}>Sede Apartadó</strong>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px 0' }}>Centro Comunitario y Psicosocial</p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lunes a Viernes: 8:00 AM - 5:00 PM</div>
          </div>

          <div style={{ background: 'rgba(233,30,140,0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ fontSize: '15px' }}>Punto de Acogida Turbo</strong>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px 0' }}>Ruta Humanitaria y Legal</p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lunes a Viernes: 8:00 AM - 4:30 PM</div>
          </div>

          <div style={{ background: 'rgba(233,30,140,0.04)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
            <strong style={{ fontSize: '15px' }}>Punto Fronterizo Necoclí</strong>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 10px 0' }}>Unidad Móvil de Salud y Protección</p>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lunes a Domingo: Turnos de guardia</div>
          </div>
        </div>
      </div>
    </div>
  );
};
