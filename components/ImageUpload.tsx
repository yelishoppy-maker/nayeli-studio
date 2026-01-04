import React, { useRef, useState } from 'react';
import { UploadedImage } from '../types';
import { fileToBase64 } from '../utils/fileHelpers';

interface ImageUploadProps {
  label: string;
  image: UploadedImage | null;
  onImageChange: (img: UploadedImage | null) => void;
  icon?: React.ReactNode;
  description?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  label, 
  image, 
  onImageChange,
  icon,
  description
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      onImageChange({
        file,
        previewUrl,
        base64,
        mimeType: file.type
      });
    } catch (err) {
      console.error("Error processing file", err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full">
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-medium text-slate-300 uppercase tracking-wider">{label}</label>
        {image && (
            <button 
                onClick={clearImage}
                className="text-xs text-red-400 hover:text-red-300 font-medium"
            >
                Eliminar
            </button>
        )}
      </div>
      
      <div 
        className={`
          relative flex-1 min-h-[260px] rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group
          ${isDragging 
            ? 'border-primary-500 bg-primary-500/10' 
            : image 
                ? 'border-transparent bg-slate-800' 
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
          }
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !image && inputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleChange}
        />

        {image ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img 
              src={image.previewUrl} 
              alt={label} 
              className="max-w-full max-h-[280px] object-contain rounded-lg shadow-xl"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <span className="text-white font-medium">Cambiar Imagen</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer">
            <div className={`p-4 rounded-full bg-slate-800 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : ''} group-hover:scale-105`}>
                {icon || (
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                )}
            </div>
            <p className="text-slate-300 font-medium mb-1">Haz clic o arrastra</p>
            {description && <p className="text-xs text-slate-500">{description}</p>}
          </div>
        )}
      </div>
    </div>
  );
};