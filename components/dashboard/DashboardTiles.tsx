
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface Tile {
  name: string;
  path: string;
  icon: LucideIcon;
  key: string;
}

interface DashboardTilesProps {
  tiles: Tile[];
}

const DashboardTiles: React.FC<DashboardTilesProps> = ({ tiles }) => {
  return (
    <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-16 gap-x-8 md:gap-y-24 md:gap-x-16 py-10">
      {tiles.map((tile) => (
        <Link key={tile.name + tile.path} to={tile.path} className="group flex flex-col items-center justify-center transition-all duration-300 active:scale-95">
          <div className={`mb-4 md:mb-8 transform transition-transform duration-500 group-hover:-translate-y-4 ${tile.key === 'partner_hub' ? 'text-amber-500' : 'text-slate-800'}`}>
            <tile.icon className="w-14 h-14 md:w-24 md:h-24" strokeWidth={1} />
          </div>
          <div className="text-center px-2">
            <h3 className={`text-[11px] md:text-sm font-black tracking-widest uppercase leading-tight group-hover:text-slate-900 transition-colors ${tile.key === 'partner_hub' ? 'text-amber-600' : 'text-slate-400'}`}>{tile.name}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DashboardTiles;
