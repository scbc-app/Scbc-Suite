
import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, Download, PenTool, ArrowLeft, Printer, ZoomIn, ZoomOut, Send } from 'lucide-react';
import { Contract } from '../types';

interface ContractPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  previewHtml: string | null;
  contract: Partial<Contract>;
  userRole: string;
  onInitiateSigning: (role: 'Provider' | 'Client') => void;
  onDownload: () => void;
  onShare: () => void;
  onDispatch?: () => void; 
}

const ContractPreview: React.FC<ContractPreviewProps> = ({
  isOpen, onClose, previewHtml, contract, userRole, onInitiateSigning, onDownload, onShare, onDispatch
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);

  // Auto-fit zoom logic for responsiveness
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updateZoom = () => {
        const containerWidth = containerRef.current?.clientWidth || 0;
        if (containerWidth < 850) { 
          const newZoom = Math.floor((containerWidth / 850) * 100) - 2;
          setZoom(Math.max(30, newZoom));
        } else {
          setZoom(100);
        }
      };

      updateZoom();
      window.addEventListener('resize', updateZoom);
      return () => window.removeEventListener('resize', updateZoom);
    }
  }, [isOpen]);

  // Auto-resize iframe to content height
  useEffect(() => {
    if (isOpen && previewHtml && iframeRef.current) {
      const frame = iframeRef.current;
      const resize = () => {
        if (frame.contentWindow && frame.contentWindow.document.body) {
          const height = frame.contentWindow.document.documentElement.scrollHeight;
          frame.style.height = `${height + 50}px`;
        }
      };

      const timer = setTimeout(resize, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, previewHtml, zoom]);

  if (!isOpen || !previewHtml) return null;

  // Multi-key resolution for status checks
  const isAgentSigned = !!(contract.ProviderSign || contract.ProviderSignImage);
  const isClientSigned = !!(contract.ClientSign || contract.ClientSignImage);
  const isFullyExecuted = isAgentSigned && isClientSigned;
  const isClientView = userRole?.toLowerCase() === 'client';

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-10 animate-in fade-in duration-300">
      <div className="bg-slate-800 w-full max-w-6xl h-full sm:h-[95vh] sm:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden border border-slate-700/50 relative">
        
        {/* Modern Glass Header */}
        <div className="px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-xl gap-4 z-30">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onClose} 
              className="group p-2.5 bg-slate-700 hover:bg-slate-600 rounded-2xl text-white transition-all active:scale-95 flex items-center gap-2 pr-5 shadow-lg border border-slate-600"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Preview</span>
            </button>
            <div className="h-10 w-px bg-slate-700/50 mx-2 hidden sm:block"></div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-2xl text-indigo-400 hidden sm:block border border-indigo-500/20">
                <FileText size={20}/>
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-sm text-white tracking-tight truncate uppercase tracking-widest">Document Authorization</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em] mt-0.5">REF: {contract.ContractID || 'PENDING'}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center bg-slate-900/50 rounded-2xl border border-slate-700 p-1 mr-2">
              <button onClick={() => setZoom(z => Math.max(30, z - 10))} className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomOut size={16}/></button>
              <span className="text-[10px] font-black text-slate-500 w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-2 text-slate-400 hover:text-white transition-colors"><ZoomIn size={16}/></button>
            </div>

            <div className="flex items-center space-x-2">
              {/* Role-Aware Signing Control */}
              {isClientView ? (
                // Client View Actions
                !isClientSigned && (
                  <button 
                    onClick={() => onInitiateSigning('Client')} 
                    className="flex items-center px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border border-amber-500"
                  >
                    <PenTool size={16} className="sm:mr-2"/> Authorize Now
                  </button>
                )
              ) : (
                // Admin/Agent View Actions
                !isAgentSigned ? (
                  <button 
                    onClick={() => onInitiateSigning('Provider')} 
                    className="flex items-center px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border border-amber-500"
                  >
                    <PenTool size={16} className="sm:mr-2"/> Sign Agreement
                  </button>
                ) : (
                  // Only show Dispatch if NOT already fully signed
                  !isFullyExecuted && (
                    <button 
                      onClick={onDispatch} 
                      className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border border-indigo-500 animate-in zoom-in"
                    >
                      <Send size={16} className="sm:mr-2 animate-pulse"/> Dispatch Authorized Agreement
                    </button>
                  )
                )
              )}
              
              <button 
                onClick={onDownload} 
                className="flex items-center px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border border-slate-700"
              >
                <Printer size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Print Document</span>
              </button>
            </div>
          </div>
        </div>
        
        <div ref={containerRef} className="flex-1 bg-slate-950 overflow-y-auto overflow-x-hidden flex flex-col items-center p-4 sm:p-12 no-scrollbar relative scroll-smooth">
          <div 
            className="bg-white w-full max-w-4xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] transition-all duration-300 transform-gpu origin-top rounded-sm"
            style={{ transform: `scale(${zoom / 100})`, marginBottom: `-${100 - zoom}%` }}
          >
            <iframe 
              ref={iframeRef}
              srcDoc={previewHtml} 
              className="w-full border-none block" 
              style={{ height: 'auto', minHeight: '100vh' }}
              title="Contract Preview" 
              scrolling="no"
            />
          </div>
          <div className="h-32 w-full shrink-0"></div>
        </div>

        <div className="absolute bottom-10 right-10 z-40 animate-bounce hidden md:block">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 p-4 rounded-full shadow-2xl">
               <div className="flex flex-col items-center gap-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">End of Doc</span>
                  <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPreview;
