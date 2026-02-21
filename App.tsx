
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  RotateCcw, 
  Download, 
  AlertCircle, 
  Loader2,
  Image as ImageIcon,
  Zap,
  Info,
  UserCheck,
  MessageSquarePlus,
  ShieldCheck,
  Settings,
  Key,
  Trash2,
  CheckCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { SceneChoice, GenerationState, AppConfig, ApiKeyConfig, GeminiModel } from './types';
import ImageUploader from './components/ImageUploader';
import { generateMirrorSelfie, validateApiKey } from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({
    kocImage: null,
    outfitImage: null,
    scene: SceneChoice.BED_MINIMAL,
    additionalPrompt: '',
    holdingPhone: true
  });

  const [apiConfig, setApiConfig] = useState<ApiKeyConfig>({
    keys: [],
    activeKey: null,
    activeModel: GeminiModel.FLASH_2_5
  });

  const [status, setStatus] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    resultUrl: undefined,
    error: undefined
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newKeyInput, setNewKeyInput] = useState('');
  const [isValidatingKey, setIsValidatingKey] = useState(false);

  // Load settings from LocalStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('gemini_api_keys');
    const savedActiveKey = localStorage.getItem('gemini_active_key');
    const savedModel = localStorage.getItem('gemini_active_model');

    setApiConfig({
      keys: savedKeys ? JSON.parse(savedKeys) : [],
      activeKey: savedActiveKey || null,
      activeModel: savedModel || GeminiModel.FLASH_2_5
    });
  }, []);

  // Handlers for API Key Management
  const handleAddKey = async () => {
    const trimmedKey = newKeyInput.trim();
    if (!trimmedKey) return;

    // Check validation
    setIsValidatingKey(true);
    const isValid = await validateApiKey(trimmedKey);
    setIsValidatingKey(false);

    if (!isValid) {
      alert("API Key không hợp lệ hoặc đã hết hạn (Quota exceeded). Vui lòng kiểm tra lại.");
      return;
    }

    if (apiConfig.keys.includes(trimmedKey)) {
      alert("API Key này đã tồn tại trong danh sách.");
      return;
    }

    const updatedKeys = [...apiConfig.keys, trimmedKey];
    setApiConfig(prev => ({ ...prev, keys: updatedKeys }));
    localStorage.setItem('gemini_api_keys', JSON.stringify(updatedKeys));
    
    // Auto select if it's the first key
    if (updatedKeys.length === 1) {
      handleSelectKey(trimmedKey);
    }
    setNewKeyInput('');
  };

  const handleDeleteKey = (keyToDelete: string) => {
    const updatedKeys = apiConfig.keys.filter(k => k !== keyToDelete);
    setApiConfig(prev => ({ 
      ...prev, 
      keys: updatedKeys,
      activeKey: prev.activeKey === keyToDelete ? (updatedKeys[0] || null) : prev.activeKey
    }));
    localStorage.setItem('gemini_api_keys', JSON.stringify(updatedKeys));
    
    if (apiConfig.activeKey === keyToDelete) {
      localStorage.removeItem('gemini_active_key');
      if (updatedKeys.length > 0) {
        handleSelectKey(updatedKeys[0]);
      }
    }
  };

  const handleSelectKey = (key: string) => {
    setApiConfig(prev => ({ ...prev, activeKey: key }));
    localStorage.setItem('gemini_active_key', key);
  };

  const handleSelectModel = (model: string) => {
    setApiConfig(prev => ({ ...prev, activeModel: model }));
    localStorage.setItem('gemini_active_model', model);
  };

  const handleGenerate = async () => {
    if (!config.kocImage || !config.outfitImage) {
      setStatus(prev => ({ ...prev, error: "Vui lòng tải lên đủ ảnh KOC và Trang phục." }));
      return;
    }

    if (!apiConfig.activeKey && apiConfig.keys.length === 0) {
      setStatus(prev => ({ ...prev, error: "Chưa có API Key. Vui lòng vào Cài đặt để thêm và chọn Key." }));
      setIsSettingsOpen(true);
      return;
    }

    // Prepare list of keys to try: Active key first, then the rest
    const keysToTry = [
      apiConfig.activeKey, 
      ...apiConfig.keys.filter(k => k !== apiConfig.activeKey)
    ].filter(Boolean) as string[];

    if (keysToTry.length === 0) {
       setStatus(prev => ({ ...prev, error: "Không tìm thấy Key khả dụng." }));
       return;
    }

    setStatus({ isGenerating: true, progress: 5, error: undefined });
    
    let successResult: string | null = null;
    let successfulKey: string | null = null;
    let lastError: any = null;

    const interval = setInterval(() => {
      setStatus(prev => ({ 
        ...prev, 
        progress: prev.progress < 90 ? prev.progress + 5 : prev.progress 
      }));
    }, 1000);

    // Loop through keys (Key Rotation Logic)
    for (const key of keysToTry) {
      try {
        console.log(`Attempting generation with key ending in ...${key.slice(-4)}`);
        const result = await generateMirrorSelfie(
          key,
          apiConfig.activeModel,
          config.kocImage,
          config.outfitImage,
          config.scene,
          config.additionalPrompt,
          config.holdingPhone
        );
        
        successResult = result;
        successfulKey = key;
        break; // Stop loop if successful
      } catch (err: any) {
        console.warn(`Key ...${key.slice(-4)} failed:`, err.message);
        lastError = err;
        // Continue to next key
      }
    }

    clearInterval(interval);

    if (successResult) {
      // If we rotated to a new key, update it as active
      if (successfulKey && successfulKey !== apiConfig.activeKey) {
        handleSelectKey(successfulKey);
        console.log("Switched to new working key automatically.");
      }

      setStatus({ 
        isGenerating: false, 
        progress: 100, 
        resultUrl: successResult 
      });
    } else {
      setStatus({ 
        isGenerating: false, 
        progress: 0, 
        error: lastError?.message || "Tất cả các Key đều bị lỗi hoặc hết hạn ngạch. Vui lòng kiểm tra lại." 
      });
    }
  };

  const downloadResult = () => {
    if (!status.resultUrl) return;
    const link = document.createElement('a');
    link.href = status.resultUrl;
    link.download = `koc-selfie-guong-1080p-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4 md:px-8 bg-slate-50 text-slate-900 relative">
      {/* Header */}
      <header className="w-full max-w-5xl mb-12 flex flex-col items-center relative">
        <div className="absolute right-0 top-0">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 bg-white text-slate-600 rounded-full shadow-md hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-slate-100 flex items-center gap-2 group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            <span className="hidden md:inline text-sm font-semibold">Cài đặt API</span>
          </button>
        </div>

        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold mb-4 uppercase tracking-wider border border-green-100">
          <Zap className="w-3 h-3 fill-current" />
          <span>{apiConfig.activeModel === GeminiModel.PRO_3_PREVIEW ? 'Gemini 3 Pro' : apiConfig.activeModel === GeminiModel.NANO_BANANA ? 'Nano Banana' : 'Gemini 2.5 Flash'} • Ultra Sharp 1080p Edition</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight text-center">
          KOC <span className="text-indigo-600">Selfie Gương</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed text-center">
          Tạo ảnh selfie gương <span className="text-indigo-600 font-bold">FULLHD 1080p</span> chân thực, 
          giữ trọn đường nét vector và <span className="text-red-600 font-bold">không bao giờ che mặt</span>.
        </p>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Cấu hình hệ thống
              </h3>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <RotateCcw className="w-5 h-5 rotate-45" /> {/* Close icon visual hack */}
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Model Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">Chọn Model Xử Lý</label>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => handleSelectModel(GeminiModel.FLASH_2_5)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      apiConfig.activeModel === GeminiModel.FLASH_2_5 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">Gemini 2.5 Flash Image</span>
                      <span className="text-xs opacity-70">Tốc độ nhanh, ổn định</span>
                    </div>
                    {apiConfig.activeModel === GeminiModel.FLASH_2_5 && <CheckCircle className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={() => handleSelectModel(GeminiModel.NANO_BANANA)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      apiConfig.activeModel === GeminiModel.NANO_BANANA
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">Nano Banana (Gemini 2.5 Flash Preview)</span>
                      <span className="text-xs opacity-70">Model thử nghiệm mới nhất (Khuyên dùng)</span>
                    </div>
                    {apiConfig.activeModel === GeminiModel.NANO_BANANA && <CheckCircle className="w-5 h-5" />}
                  </button>

                  <button 
                    onClick={() => handleSelectModel(GeminiModel.PRO_3_PREVIEW)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      apiConfig.activeModel === GeminiModel.PRO_3_PREVIEW
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold text-sm">Gemini 3 Pro Image</span>
                      <span className="text-xs opacity-70">Chất lượng cao nhất, chi tiết tốt hơn</span>
                    </div>
                    {apiConfig.activeModel === GeminiModel.PRO_3_PREVIEW && <CheckCircle className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* API Key Management */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">Quản lý API Key (Tự động xoay vòng khi lỗi)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value)}
                    placeholder="Dán API Key mới vào đây..."
                    disabled={isValidatingKey}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm disabled:opacity-50"
                  />
                  <button 
                    onClick={handleAddKey}
                    disabled={isValidatingKey}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1 font-medium text-sm disabled:opacity-70 disabled:cursor-not-allowed min-w-[90px] justify-center"
                  >
                    {isValidatingKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Thêm</>}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {apiConfig.keys.length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Chưa có API Key nào được lưu.
                    </div>
                  )}
                  {apiConfig.keys.map((key, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSelectKey(key)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer group transition-all ${
                        apiConfig.activeKey === key 
                        ? 'bg-green-50 border-green-500 shadow-sm' 
                        : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Key className={`w-4 h-4 shrink-0 ${apiConfig.activeKey === key ? 'text-green-600' : 'text-slate-400'}`} />
                        <span className={`text-sm font-mono truncate ${apiConfig.activeKey === key ? 'text-green-800 font-semibold' : 'text-slate-600'}`}>
                          {key.substring(0, 8)}...{key.substring(key.length - 6)}
                        </span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteKey(key); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Panel */}
        <div className="lg:col-span-5 space-y-6 bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Cấu hình đầu vào</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ImageUploader 
              id="koc-upload"
              label="Khuôn mặt KOC" 
              image={config.kocImage} 
              onImageChange={(val) => setConfig(prev => ({ ...prev, kocImage: val }))}
            />
            <ImageUploader 
              id="outfit-upload"
              label="Trang phục" 
              image={config.outfitImage} 
              onImageChange={(val) => setConfig(prev => ({ ...prev, outfitImage: val }))}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-500" />
              Kiểu chụp
            </label>
            <div className="flex gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="holdingPhone" 
                  checked={config.holdingPhone} 
                  onChange={() => setConfig(prev => ({ ...prev, holdingPhone: true }))}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Cầm điện thoại (Selfie)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="holdingPhone" 
                  checked={!config.holdingPhone} 
                  onChange={() => setConfig(prev => ({ ...prev, holdingPhone: false }))}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">Không cầm điện thoại (Tạo dáng)</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Chọn bối cảnh không gian</label>
            <select
              value={config.scene}
              onChange={(e) => setConfig(prev => ({ ...prev, scene: e.target.value as SceneChoice }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-700 text-sm"
            >
              {Object.values(SceneChoice).map((scene) => (
                <option key={scene} value={scene}>{scene}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-indigo-500" />
              Yêu cầu bổ sung (Tùy chọn)
            </label>
            <textarea
              placeholder="VD: Nhìn thẳng gương, mỉm cười nhẹ, ánh sáng rực rỡ..."
              value={config.additionalPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, additionalPrompt: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700 text-sm min-h-[100px] resize-none"
            />
          </div>

          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Tiêu chuẩn chất lượng:
            </h4>
            <ul className="text-[11px] text-indigo-800/70 space-y-1.5 list-none">
              <li className="flex items-center gap-2 font-bold text-green-600">
                <UserCheck className="w-3 h-3" />
                HIỂN THỊ 100% MẶT: Không bao giờ bị che khuất
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                Độ sắc nét FULLHD 1080p
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                Giữ trọn từng đường nét vector & chi tiết vải
              </li>
            </ul>
          </div>

          <button
            disabled={status.isGenerating || !config.kocImage || !config.outfitImage}
            onClick={handleGenerate}
            className={`
              w-full py-5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all shadow-lg
              ${status.isGenerating || !config.kocImage || !config.outfitImage
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 hover:scale-[1.01] active:scale-95'
              }
            `}
          >
            {status.isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang xử lý 1080p {status.progress}%...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Tạo Ảnh 1080p Siêu Nét
              </>
            )}
          </button>

          {status.error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{status.error}</p>
              {status.error.includes("Key") && (
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs font-bold underline ml-auto"
                >
                  Cài đặt
                </button>
              )}
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl border border-slate-100 flex-grow flex flex-col min-h-[700px]">
            <div className="flex items-center justify-between mb-5 px-3">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Studio Preview</span>
                {status.resultUrl && <span className="text-[10px] text-green-500 font-bold">1080P READY</span>}
              </div>
              {status.resultUrl && (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setStatus({ ...status, resultUrl: undefined })}
                    className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={downloadResult}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    <Download className="w-4 h-4" />
                    Tải Ảnh HD
                  </button>
                </div>
              )}
            </div>

            <div className="relative flex-grow bg-slate-50 rounded-[2rem] overflow-hidden flex items-center justify-center border-2 border-dashed border-slate-200">
              {status.resultUrl ? (
                <img 
                  src={status.resultUrl} 
                  alt="AI Result" 
                  className="w-full h-full object-contain p-2"
                />
              ) : status.isGenerating ? (
                <div className="flex flex-col items-center gap-8">
                  <div className="relative w-32 h-32">
                    <div className="absolute inset-0 border-[8px] border-indigo-50 rounded-full"></div>
                    <div 
                      className="absolute inset-0 border-[8px] border-indigo-600 rounded-full border-t-transparent animate-spin"
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-indigo-600">
                      {status.progress}%
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-xl font-bold text-slate-800">Đang render chất lượng cao...</h3>
                    <p className="text-sm text-slate-400 max-w-[280px] leading-relaxed">
                      Hệ thống tự động xoay vòng API Key nếu gặp lỗi để đảm bảo quá trình không bị gián đoạn.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12">
                  <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 mx-auto flex items-center justify-center mb-8 border border-slate-50">
                    <ImageIcon className="w-12 h-12 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-3">Thành phẩm 1080p</h3>
                  <p className="text-slate-400 max-w-xs mx-auto mb-10 leading-relaxed">
                    {!apiConfig.activeKey ? (
                      <span className="text-red-500 font-medium">Vui lòng nhập API Key để bắt đầu.</span>
                    ) : (
                      "Tải lên dữ liệu để bắt đầu quá trình tạo ảnh selfie gương siêu nét không che mặt."
                    )}
                  </p>
                  {!apiConfig.activeKey && (
                     <button 
                     onClick={() => setIsSettingsOpen(true)}
                     className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm hover:bg-indigo-200 transition-colors"
                   >
                     Nhập API Key ngay
                   </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
            <Info className="w-3 h-3" />
            <p className="text-[10px] font-medium uppercase tracking-tighter">
              Tối ưu hóa bởi {apiConfig.activeModel} • Auto Key Rotation • No Face Cover
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-8 w-full border-t border-slate-200 text-center">
        <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
          Powered by Gemini Image API • 1080p Ultra HD Rendering
        </p>
      </footer>
    </div>
  );
};

export default App;
