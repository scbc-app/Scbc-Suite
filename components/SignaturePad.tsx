
import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, Pen, Type, ShieldCheck, RefreshCw } from 'lucide-react';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'Provider' | 'Client';
  onConfirm: (name: string, title: string, image: string, mode: 'draw' | 'type') => void;
  defaultName: string;
  defaultTitle?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ 
  isOpen, onClose, role, onConfirm, defaultName, defaultTitle = '' 
}) => {
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw');
  const [signatureName, setSignatureName] = useState(defaultName);
  const [signatureTitle, setSignatureTitle] = useState(defaultTitle);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSignatureName(defaultName);
      setSignatureTitle(defaultTitle);
      setHasDrawn(false);
      setTimeout(clearCanvas, 100);
    }
  }, [isOpen, defaultName, defaultTitle]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleConfirm = () => {
    let signatureImage = '';
    if (signatureMode === 'draw' && canvasRef.current) {
      signatureImage = canvasRef.current.toDataURL('image/png');
    }
    onConfirm(signatureName, signatureTitle, signatureImage, signatureMode);
  };

  if (!isOpen) return null;

  const isProvider = role === 'Provider';
  const isClient = role === 'Client';

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <PenTool className="mr-2 text-blue-600" size={24} /> 
            {isProvider ? 'Authorized Representative' : 'Client Representative'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
        </div>
        
        <div className="flex space-x-2 mb-4 bg-gray-100 p-1 rounded-lg self-start">
          <button 
            onClick={() => setSignatureMode('draw')} 
            className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${signatureMode === 'draw' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Pen size={12} className="mr-2"/> Draw
          </button>
          <button 
            onClick={() => setSignatureMode('type')} 
            className={`flex items-center px-3 py-1.5 text-xs font-bold rounded-md transition-all ${signatureMode === 'type' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
          >
            <Type size={12} className="mr-2"/> Type
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Signatory Name</label>
              <input 
                type="text" 
                value={signatureName} 
                onChange={(e) => !isProvider && !isClient && setSignatureName(e.target.value)} 
                readOnly={isProvider || isClient}
                className={`w-full p-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none mt-1 ${(isProvider || isClient) ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-slate-900'}`} 
                placeholder="Full Name" 
              />
              {(isProvider || isClient) && <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">Authenticated ID Locked</p>}
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Signatory Title</label>
              <input 
                type="text" 
                value={signatureTitle} 
                onChange={(e) => setSignatureTitle(e.target.value)} 
                className="w-full p-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none mt-1" 
                placeholder="e.g. Director" 
              />
            </div>
          </div>
          
          {signatureMode === 'draw' ? (
            <div className="relative border border-gray-300 rounded-xl overflow-hidden bg-white touch-none">
              <canvas 
                ref={canvasRef}
                width={450}
                height={200}
                className="w-full h-[200px] bg-gray-50 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="absolute top-2 right-2">
                <button onClick={clearCanvas} className="text-[10px] bg-white/80 hover:bg-white border border-gray-200 px-2 py-1 rounded shadow-sm text-gray-600 flex items-center">
                  <RefreshCw size={10} className="mr-1"/> Clear
                </button>
              </div>
              {!hasDrawn && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-300 text-xs font-black uppercase tracking-widest select-none">Draw your signature here</div>}
            </div>
          ) : (
            <div className="p-10 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center h-[200px] flex items-center justify-center overflow-hidden">
              <p className="text-4xl text-slate-800 truncate px-4" style={{ fontFamily: 'cursive' }}>{signatureName || 'Your Name'}</p>
            </div>
          )}

          <div className="flex items-start bg-blue-50 p-3 rounded-lg border border-blue-100">
            <ShieldCheck className="text-blue-600 shrink-0 mt-0.5 mr-2" size={16} />
            <p className="text-[10px] text-blue-800 font-medium">I verify that this electronic signature is intended to be my legally binding signature for this agreement.</p>
          </div>
          
          <button 
            onClick={handleConfirm} 
            disabled={!signatureName || (signatureMode === 'draw' && !hasDrawn)} 
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm uppercase tracking-widest"
          >
            Confirm Signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
