import React from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Check,
  Lock,
  X,
  UserCheck,
  Users,
  Eye,
  Globe,
  Sparkles,
  Info
} from 'lucide-react';
import { ROLE_LIST } from '../services/roles';

export const RoleSwitcherModal = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={onClose}>
      <div
        className="modal-container role-switcher-modal"
        style={{ maxWidth: '880px', width: '92%', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(233, 30, 140, 0.2), rgba(124, 58, 237, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-main)', fontWeight: 800 }}>
                Control de Roles y Restricciones de Privacidad
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Seleccione el rol operativo para activar sus permisos y bloquear automáticamente las funciones restringidas.
              </p>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        {/* Aviso de Habeas Data */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.08), rgba(2, 132, 199, 0.06))',
          borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '12.5px',
          color: 'var(--text-secondary)'
        }}>
          <Info size={16} color="#10b981" style={{ flexShrink: 0 }} />
          <span>
            <strong>Cumplimiento Normativo (Ley 1581 de Habeas Data):</strong> Las funciones que exponen datos personales individuales quedan estrictamente bloqueadas para roles sin autorización operativa.
          </span>
        </div>

        {/* Grid de Roles */}
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
          {ROLE_LIST.map((role) => {
            const isCurrent = currentRole.id === role.id;
            return (
              <div
                key={role.id}
                className={`card role-card ${isCurrent ? 'role-card-active' : ''}`}
                style={{
                  position: 'relative',
                  border: isCurrent ? `2px solid ${role.color}` : '1px solid var(--border-light)',
                  boxShadow: isCurrent ? `0 8px 24px ${role.color}25` : 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '20px',
                  background: isCurrent ? 'rgba(255,255,255,0.04)' : undefined,
                  transition: 'all 0.2s ease'
                }}
              >
                <div>
                  {/* Badge de Rol y Estado Activo */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: `${role.color}20`,
                        border: `1px solid ${role.color}50`,
                        color: role.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '13px'
                      }}>
                        {role.initials}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                          {role.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {role.organization}
                        </div>
                      </div>
                    </div>

                    {isCurrent ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={12} />
                        Activo Ahora
                      </span>
                    ) : (
                      <span className="badge" style={{ background: `${role.color}15`, color: role.color, border: `1px solid ${role.color}35` }}>
                        {role.tag}
                      </span>
                    )}
                  </div>

                  {/* Descripción */}
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                    {role.description}
                  </p>

                  {/* Capacidades Permitidas */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Check size={12} />
                      Funciones Habilitadas
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {role.capabilities.map((cap, i) => (
                        <li key={i} style={{ marginBottom: '3px' }}>{cap}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Restricciones / Bloqueos */}
                  {role.restrictions.length > 0 && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.06)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Lock size={12} />
                        Funciones Bloqueadas en este Rol
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#f87171', lineHeight: 1.45 }}>
                        {role.restrictions.map((res, i) => (
                          <li key={i} style={{ marginBottom: '2px' }}>{res}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Botón de Selección */}
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                  {isCurrent ? (
                    <button
                      className="btn btn-secondary btn-block"
                      disabled
                      style={{ width: '100%', opacity: 0.8, cursor: 'default' }}
                    >
                      <Check size={15} color="#10b981" />
                      <span>Rol Operando Actualmente</span>
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-block"
                      style={{
                        width: '100%',
                        background: role.color,
                        borderColor: role.color
                      }}
                      onClick={() => {
                        onSelectRole(role);
                        onClose();
                      }}
                    >
                      <UserCheck size={15} />
                      <span>Operar como {role.shortName}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Puede cambiar de rol en cualquier momento durante la auditoría o demostración.
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
