import React from 'react';
import { ShieldAlert, Lock, UserCheck, ArrowRight, FileCheck, Globe } from 'lucide-react';

export const PrivacyRestrictedScreen = ({
  title = "Módulo Restringido por Política de Privacidad",
  message = "En cumplimiento de la Ley Estatutaria 1581 de 2012 (Habeas Data) y los protocolos humanitarios de protección a la niñez, personas migrantes y comunidades de acogida, este módulo contiene datos personales sensibles y no está disponible para el rol actual.",
  currentRole,
  onOpenRoleSwitcher,
  onGoToPublicPortal
}) => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '760px', margin: '40px auto', padding: '0 16px' }}>
      <div className="card" style={{
        padding: '36px 32px',
        textAlign: 'center',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.04) 0%, rgba(15, 23, 42, 0.02) 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
      }}>
        {/* Icono de Seguridad */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'rgba(239, 68, 68, 0.12)',
          border: '2px solid rgba(239, 68, 68, 0.25)',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)'
        }}>
          <ShieldAlert size={36} />
        </div>

        {/* Rol Activo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 700, marginBottom: '14px' }}>
          <Lock size={13} />
          <span>Restricción Activa para: {currentRole?.name || 'Comunidad'}</span>
        </div>

        {/* Título */}
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '12px' }}>
          {title}
        </h2>

        {/* Explicación Legal y de Protección */}
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto 24px' }}>
          {message}
        </p>

        {/* Detalle normativo */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-light)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'left',
          marginBottom: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          fontSize: '12.5px',
          color: 'var(--text-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', fontWeight: 700 }}>
            <FileCheck size={16} color="#10b981" />
            <span>Garantías de Seguridad y Confidencialidad Activas:</span>
          </div>
          <div>• Nombres completos, cédulas y documentos migratorios protegidos contra consulta pública.</div>
          <div>• Direcciones de residencia, números de teléfono y grupos familiares completamente blindados.</div>
          <div>• Historial de atenciones médicas, psicosociales y ayudas reservado a funcionarios acreditados.</div>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {onOpenRoleSwitcher && (
            <button className="btn btn-primary" onClick={onOpenRoleSwitcher}>
              <UserCheck size={16} />
              <span>Cambiar a Rol Operativo / Administrador</span>
            </button>
          )}

          {onGoToPublicPortal && (
            <button className="btn btn-secondary" onClick={onGoToPublicPortal}>
              <Globe size={16} />
              <span>Ir al Portal Comunitario y Rutas</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
