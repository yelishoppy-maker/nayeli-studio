import React, { useState } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { Button } from './components/Button';
import { UploadedImage, ProcessingStatus, CompositionConfig } from './types';
import { generateComposition } from './services/geminiService';

export default function App() {
  const [backdrop, setBackdrop] = useState<UploadedImage | null>(null);
  const [asset, setAsset] = useState<UploadedImage | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [instruction, setInstruction] = useState<string>('');

  const handleGenerate = async () => {
    if (!backdrop || !asset) return;

    setStatus(ProcessingStatus.PROCESSING);
    setErrorMsg(null);

    const config: CompositionConfig = {
      matchLighting: true,
      matchColorTemp: true,
      softShadows: true,
      instruction: instruction.trim(),
    };

    try {
      const generatedImageBase64 = await generateComposition(backdrop, asset, config);
      setResultImage(generatedImageBase64);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `lumina-composition-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary-500/30">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </div>
                <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Lumina Studio AI
                </h1>
            </div>
            <div className="hidden sm:block">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                    Powered by Gemini 2.5
                </span>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
        
        {/* Intro */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">Composición Fotográfica Perfecta</h2>
            <p className="text-slate-400 text-lg">
                Sube un fondo y un objeto. Nuestra IA eliminará el fondo del objeto, 
                lo integrará en la escena y ajustará la iluminación automáticamente.
            </p>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            
            {/* Left Column: Inputs */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Backdrop Input */}
                    <div className="h-80">
                        <ImageUpload 
                            label="1. Fondo (Backdrop)" 
                            image={backdrop} 
                            onImageChange={setBackdrop}
                            description="Escena, estudio o paisaje"
                            icon={(
                                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                        />
                    </div>

                    {/* Asset Input */}
                    <div className="h-80">
                        <ImageUpload 
                            label="2. Sujeto (Asset)" 
                            image={asset} 
                            onImageChange={setAsset}
                            description="Persona u objeto"
                            icon={(
                                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}
                        />
                    </div>
                </div>

                {/* Additional Settings */}
                <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Instrucciones Opcionales</label>
                    <textarea 
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none h-24 text-sm"
                        placeholder="Ej: Haz que la luz venga desde la derecha, añade un reflejo suave en el suelo..."
                        value={instruction}
                        onChange={(e) => setInstruction(e.target.value)}
                    />
                    
                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-800 pt-6">
                       <div className="flex flex-col">
                         <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Motor AI</span>
                         <span className="text-sm text-slate-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Match Exposure & Temp
                         </span>
                       </div>
                       <Button 
                            onClick={handleGenerate} 
                            disabled={!backdrop || !asset}
                            isLoading={status === ProcessingStatus.PROCESSING}
                            className="w-full sm:w-auto min-w-[200px]"
                        >
                            Generar Composición
                       </Button>
                    </div>
                </div>
            </div>

            {/* Right Column: Result */}
            <div className="lg:sticky lg:top-28">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">Resultado</label>
                    {status === ProcessingStatus.COMPLETED && (
                        <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
                            Renderizado Completo
                        </span>
                    )}
                </div>

                <div className="relative w-full aspect-[4/3] sm:aspect-square lg:aspect-[4/3] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center group">
                    {status === ProcessingStatus.PROCESSING ? (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-4 bg-slate-800 rounded-full flex items-center justify-center animate-pulse">
                                    <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-lg font-medium text-white animate-pulse">Procesando Imagen...</p>
                            <p className="text-sm text-slate-400 mt-2">Analizando iluminación y recortando sujeto</p>
                         </div>
                    ) : resultImage ? (
                        <>
                            <img src={resultImage} alt="Composition Result" className="w-full h-full object-contain" />
                            <div className="absolute bottom-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                <Button variant="secondary" onClick={() => setResultImage(null)} className="!py-2 !px-4 text-sm">
                                    Descartar
                                </Button>
                                <Button onClick={handleDownload} className="!py-2 !px-4 text-sm shadow-xl shadow-primary-900/50">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Descargar HD
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8">
                            <div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-slate-700">
                                <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">Vista Previa</h3>
                            <p className="text-slate-400 max-w-xs mx-auto text-sm">
                                El resultado final aparecerá aquí con la iluminación y colores corregidos automáticamente.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Error Message */}
                {errorMsg && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                         <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="text-red-400 font-medium text-sm">Error de Procesamiento</h4>
                            <p className="text-red-400/80 text-sm mt-1">{errorMsg}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}