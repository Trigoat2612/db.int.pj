import type { IntegrationMeta } from '../types';
import { ALL } from '../lib/data';
import { Icon } from './Icon';

type Props = {
  integrations: IntegrationMeta[];
  active: string;
  onChange: (name: string) => void;
  open: boolean;
  onClose: () => void;
};

export function Sidebar({ integrations, active, onChange, open, onClose }: Props) {
  const select = (name: string) => {
    onChange(name);
    onClose();
  };

  return (
    <>
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="brand-block">
          <div className="brand-eyebrow">PODER JUDICIAL DEL PERÚ</div>
          <div className="brand-mark">SIJUD</div>
          <div className="brand-sub">Sistema de Justicia Digital</div>
          <div className="program-line"><span className="diamond"/>Integraciones judiciales</div>
        </div>

        <div className="side-section">
          <div className="side-label">NAVEGACIÓN</div>
          <button className={`nav-item ${active === ALL ? 'active' : ''}`} onClick={() => select(ALL)}>
            <span className="nav-num">01</span><Icon name="grid"/><span>Resumen general</span><span className="nav-badge">{integrations.length}</span>
          </button>
          {integrations.map((item, index) => (
            <button key={item.name} className={`nav-item ${active === item.name ? 'active' : ''}`} onClick={() => select(item.name)}>
              <span className="nav-num">{String(index + 2).padStart(2, '0')}</span><Icon name="table"/><span>{item.name}</span><span className="nav-badge">{item.rows}</span>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="side-label">FUENTE</div>
          <div className="source-name">Reporte Estadístico de Integraciones v2</div>
          <div className="source-meta">NORMALIZACIÓN AUTOMÁTICA · 10 HOJAS</div>
        </div>
      </aside>
      {open && <button className="scrim" aria-label="Cerrar menú" onClick={onClose}/>} 
    </>
  );
}
