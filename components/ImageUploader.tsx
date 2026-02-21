
import React from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  image: string | null;
  onImageChange: (base64: string | null) => void;
  id: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageChange, id }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="relative group">
        {image ? (
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md">
            <img src={image} alt={label} className="w-full h-full object-cover" />
            <button
              onClick={() => onImageChange(null)}
              className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full text-red-500 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-col items-center justify-center aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <div className="p-4 bg-slate-100 rounded-full mb-3 group-hover:bg-indigo-100 transition-colors">
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Tải ảnh lên</span>
            <input
              type="file"
              id={id}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
