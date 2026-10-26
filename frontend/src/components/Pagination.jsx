import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 7,
  currentCount = 0,
  onPageChange,
  itemLabel = 'registros'
}) => {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + currentCount - 1, totalItems);

  // Generar lista de números de página inteligente con elipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 20px',
        borderTop: '1px solid var(--border-light)',
        background: '#ffffff',
        flexWrap: 'wrap',
        gap: '12px'
      }}
    >
      {/* Resumen del rango actual */}
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        Mostrando <strong>{startItem}</strong> - <strong>{endItem}</strong> de <strong>{totalItems}</strong> {itemLabel}
        <span style={{ color: 'var(--text-muted)', marginLeft: '6px', fontSize: '12px' }}>
          (Página {currentPage} de {totalPages})
        </span>
      </div>

      {/* Botones de navegación y números de página */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {/* Ir a la primera página si hay muchas */}
        {totalPages > 4 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            title="Primera página"
            style={{
              padding: '6px 8px',
              minWidth: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage <= 1 ? 0.45 : 1,
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        {/* Botón Anterior */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '6px 12px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12.5px',
            fontWeight: 600,
            opacity: currentPage <= 1 ? 0.45 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
          }}
        >
          <ChevronLeft size={14} />
          <span>Anterior</span>
        </button>

        {/* Números de página */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  style={{
                    padding: '0 4px',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    userSelect: 'none'
                  }}
                >
                  •••
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  padding: '0 8px',
                  borderRadius: '8px',
                  border: isActive ? 'none' : '1px solid #e2e8f0',
                  background: isActive ? 'linear-gradient(135deg, #e91e8c, #c2185b)' : '#ffffff',
                  color: isActive ? '#ffffff' : '#334155',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive ? '0 2px 8px rgba(233, 30, 140, 0.3)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '6px 12px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12.5px',
            fontWeight: 600,
            opacity: currentPage >= totalPages ? 0.45 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          <span>Siguiente</span>
          <ChevronRight size={14} />
        </button>

        {/* Ir a la última página si hay muchas */}
        {totalPages > 4 && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            title="Última página"
            style={{
              padding: '6px 8px',
              minWidth: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: currentPage >= totalPages ? 0.45 : 1,
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
