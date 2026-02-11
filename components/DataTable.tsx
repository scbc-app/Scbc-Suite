
import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { ModulePermissions } from '../types';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  title: string;
  actionButtonLabel?: string;
  onAction?: () => void;
  permissions?: ModulePermissions;
}

function DataTable<T extends { [key: string]: any }>({ 
  data, columns, onEdit, onDelete, onView, title, actionButtonLabel, onAction, permissions
}: DataTableProps<T>) {
  
  const canCreate = permissions ? permissions.create : true;
  const canEdit = permissions ? permissions.update : true;
  const canDelete = permissions ? permissions.delete : true;

  return (
    <div className="space-y-4">
      {/* Action Header Only */}
      {actionButtonLabel && onAction && canCreate && (
        <div className="flex justify-end px-1 md:px-0 mb-2">
          <button 
            onClick={onAction}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white text-[9px] font-medium uppercase tracking-[0.3em] rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            {actionButtonLabel}
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-gray-100">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-8 py-5 text-[9px] font-medium text-slate-400 uppercase tracking-widest ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
                <th className="px-8 py-5 text-right text-[9px] font-medium text-slate-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length > 0 ? (
                data.map((item, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors group">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-8 py-5 text-sm font-normal text-slate-700 ${colIdx === 0 ? 'text-slate-900 font-medium' : ''}`}>
                        {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                      </td>
                    ))}
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-1 opacity-20 group-hover:opacity-100 transition-all">
                        {onView && (
                          <button onClick={() => onView(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="View"><Eye size={16} /></button>
                        )}
                        {onEdit && canEdit && (
                          <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Edit"><Edit2 size={16} /></button>
                        )}
                        {onDelete && canDelete && (
                          <button onClick={() => onDelete(item)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="px-8 py-24 text-center text-slate-300 text-[10px] font-medium uppercase tracking-widest">Database Record Empty</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified Mobile & Tablet View */}
      <div className="lg:hidden flex flex-col gap-3">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm hover:border-indigo-100 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{columns[0].header}</p>
                   <div className="text-base font-medium text-slate-900 leading-tight tracking-tight">
                      {typeof columns[0].accessor === 'function' ? columns[0].accessor(item) : item[columns[0].accessor]}
                   </div>
                </div>
                <div className="text-right">
                   {columns.length > 4 ? (
                     <div className="scale-90 origin-right">
                       {typeof columns[4].accessor === 'function' ? columns[4].accessor(item) : item[columns[4].accessor]}
                     </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4 mb-4">
                {columns.slice(1, 3).map((col, cIdx) => (
                  <div key={cIdx}>
                    <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mb-1.5 leading-none">{col.header}</p>
                    <div className="text-sm font-normal text-slate-600 truncate tracking-tight">
                       {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex gap-2">
                   {columns.length > 3 && (
                     <div className="text-[9px] font-medium text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1.5 rounded-lg leading-none">
                        {typeof columns[3].accessor === 'function' ? columns[3].accessor(item) : item[columns[3].accessor]}
                     </div>
                   )}
                </div>
                <div className="flex gap-0.5">
                  {onView && <button onClick={() => onView(item)} className="p-2.5 text-slate-400 hover:text-indigo-600 rounded-xl active:bg-indigo-50 transition-all"><Eye size={18} /></button>}
                  {onEdit && canEdit && <button onClick={() => onEdit(item)} className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl active:bg-slate-50 transition-all"><Edit2 size={18} /></button>}
                  {onDelete && canDelete && <button onClick={() => onDelete(item)} className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl active:bg-red-50 transition-all"><Trash2 size={18} /></button>}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[1.5rem] border border-gray-100 p-16 text-center">
            <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest">Zero Records Found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
