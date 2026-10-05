import type { ReactNode } from 'react';

type Props = { name: 'grid' | 'chart' | 'table' | 'filter' | 'menu' | 'download' | 'chevron' | 'close' };

export function Icon({ name }: Props): ReactNode {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const paths: Record<Props['name'], ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    chart: <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
    table: <><rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M9 4v16"/></>,
    filter: <><path d="M4 5h16l-6 7v5l-4 2v-7z"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    close: <path d="M6 6l12 12M18 6 6 18"/>,
  };
  return <svg {...common} aria-hidden="true">{paths[name]}</svg>;
}
