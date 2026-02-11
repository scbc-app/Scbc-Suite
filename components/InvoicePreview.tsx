
import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, Download, ArrowLeft, Printer, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';
import { Invoice } from '../types';

interface InvoicePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  previewHtml: string | null;
  invoice: Partial<Invoice>;
  onDownload: () => void;
  onEdit: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  isOpen, onClose, previewHtml, invoice, onDownload, onEdit
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);
  const [fitToWidth, setFitToWidth] = useState(true);

  // Responsive sizing logic
  useEffect(() => {
    if (isOpen && containerRef.current && fitToWidth) {
      const updateZoom = () => {
        const containerWidth = containerRef.current?.clientWidth || 0;
        // On mobile, we allow the document to be wider than the screen to trigger horizontal scroll for readability
        // We set 800px as our "base" readable A4 width.
        const baseWidth = 800; 
        if (containerWidth < 640) {
          // Mobile: Fix zoom to a readable level and let horizontal scroll handle it
          setZoom(85); 
        } else if (containerWidth < baseWidth) {
          const newZoom = Math.floor((containerWidth / baseWidth) * 100) - 5;
          setZoom(Math.max(50, newZoom));
        } else {
          setZoom(100);
        }
      };

      updateZoom();
      window.addEventListener('resize', updateZoom);
      return () => window.removeEventListener('resize', updateZoom);
    }
  }, [isOpen, fitToWidth]);

  useEffect(() => {
    if (isOpen && previewHtml && iframeRef.current) {
      const frame = iframeRef.current;
      const resize = () => {
        if (frame.contentWindow && frame.contentWindow.document.body) {
          const height = frame.contentWindow.document.documentElement.scrollHeight;
          frame.style.height = `${height + 100}px`;
        }
      };
      const timer = setTimeout(resize, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, previewHtml, zoom]);

  if (!isOpen || !previewHtml) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/98 backdrop-blur-xl flex items-center justify-center p-0 sm:p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-slate-800 w-full max-w-6xl h-full sm:h-[95vh] sm:rounded-[2.5rem] flex flex-col shadow-2xl overflow-hidden border border-slate-700/50 relative">
        
        {/* TOP NAVIGATION BAR */}
        <div className="px-6 py-4 flex flex-wrap justify-between items-center border-b border-slate-700/50 bg-slate-800/80 backdrop-blur-md gap-4 z-20">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onClose} 
              className="group p-2.5 bg-slate-700 hover:bg-slate-600 rounded-2xl text-white transition-all active:scale-95 flex items-center gap-2 pr-5 shadow-lg border border-slate-600"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
            </button>
            <div className="flex flex-col">
              <h3 className="font-black text-xs text-white uppercase tracking-widest leading-none">Document Preview</h3>
              <p className="text-[9px] text-slate-400 font-black tracking-[0.3em] uppercase mt-1">REF: {invoice.InvoiceID}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
             {/* Zoom Controls */}
             <div className="hidden sm:flex items-center bg-slate-900/50 rounded-2xl border border-slate-700 p-1 mr-2">
                <button onClick={() => { setZoom(z => Math.max(30, z - 10)); setFitToWidth(false); }} className="p-2 text-slate-400 hover:text-white transition-colors" title="Zoom Out"><ZoomOut size={16}/></button>
                <span className="text-[10px] font-black text-slate-500 w-12 text-center">{zoom}%</span>
                <button onClick={() => { setZoom(z => Math.min(200, z + 10)); setFitToWidth(false); }} className="p-2 text-slate-400 hover:text-white transition-colors" title="Zoom In"><ZoomIn size={16}/></button>
                <button onClick={() => setFitToWidth(!fitToWidth)} className={`ml-1 p-2 rounded-xl transition-all ${fitToWidth ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`} title="Toggle Auto-Fit">
                  {fitToWidth ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
                </button>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={onEdit} className="hidden md:block px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-600 transition-all active:scale-95">
                Modify Data
              </button>

              <button onClick={onDownload} className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border border-indigo-500">
                <Printer size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Print / PDF</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* THE PREVIEW CANVAS (With Horizontal Scroll Capability) */}
        <div 
          ref={containerRef} 
          className="flex-1 bg-slate-900/50 overflow-auto flex flex-col items-center p-4 sm:p-12 no-scrollbar scroll-smooth"
        >
          {/* Document container with readable minimum width to force horizontal scroll on mobile */}
          <div 
            className="relative bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] transition-all duration-500 transform-gpu origin-top flex flex-col mb-20"
            style={{ 
              transform: `scale(${zoom / 100})`, 
              marginBottom: `calc(100px - ${100 - zoom}%)`,
              width: '800px', // Standardized A4-ish preview width
              minWidth: '800px' // Hard minimum to ensure we get horizontal scroll rather than squishing
            }}
          >
            {/* Page header indicator */}
            <div className="absolute -top-8 left-0 right-0 flex justify-between items-center px-2 opacity-40">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Document Node Start</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">A4 Scale: {zoom}%</span>
            </div>

            {/* The actual rendered content */}
            <iframe 
              ref={iframeRef}
              srcDoc={previewHtml} 
              className="w-full border-none block bg-white" 
              style={{ height: 'auto', minHeight: '100vh' }}
              title="Digital Invoice" 
              scrolling="no"
            />

            {/* Realistic Page Shadow/Separation at bottom */}
            <div className="absolute -bottom-1 left-4 right-4 h-1 bg-slate-300/20 blur-sm rounded-full"></div>
          </div>
          
          {/* Bottom padding for floating UI elements */}
          <div className="h-24 w-full shrink-0"></div>
        </div>

        {/* Mobile Navigation Hint (shows only when horizontal scrolling might be needed) */}
        <div className="sm:hidden absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-30 flex flex-col items-center gap-2">
            <div className="bg-slate-800/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700 shadow-2xl flex items-center gap-3">
               <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></div>
               <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Scroll Horizontally to Read</span>
            </div>
        </div>

        {/* Document End Badge */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 hidden xl:block opacity-20 hover:opacity-100 transition-opacity">
           <div className="flex flex-col items-center gap-4 py-8 px-2 bg-slate-800 border border-slate-700 rounded-full text-slate-500">
              <span className="rotate-90 text-[8px] font-black uppercase tracking-widest whitespace-nowrap">End of Document</span>
              <div className="w-px h-20 bg-gradient-to-b from-slate-700 to-transparent"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
