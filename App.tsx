
import React, { useState, useEffect, useRef } from 'react';
import { QRSize, Theme } from './types';
import { processNLEntry } from './services/geminiService';
import { SunIcon, MoonIcon, DownloadIcon, SparklesIcon } from './components/Icon';

// Declare global variable for QR Code Styling (loaded in index.html)
declare var QRCodeStyling: any;

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [input, setInput] = useState('');
  const [size, setSize] = useState<QRSize>(QRSize.MEDIUM);
  const [dotsColor, setDotsColor] = useState('#6366f1'); // Indigo-500
  const [dotsType, setDotsType] = useState('extra-rounded');
  const [logo, setLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('bg-slate-50');
      document.body.classList.add('bg-slate-900', 'text-white');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-slate-50');
      document.body.classList.remove('bg-slate-900', 'text-white');
    }
  }, [theme]);

  // Lazy initialization helper
  const getQRInstance = () => {
    if (qrCodeInstance.current) return qrCodeInstance.current;
    
    if (typeof QRCodeStyling !== 'undefined') {
      qrCodeInstance.current = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: input || "https://vibe-qr.app",
        image: logo || undefined,
        dotsOptions: {
          color: dotsColor,
          type: dotsType
        },
        backgroundOptions: {
          color: "transparent",
        },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 10,
          hideBackgroundDots: true,
          imageSize: 0.4
        },
        cornersSquareOptions: {
          type: "extra-rounded",
          color: dotsColor
        },
        cornersDotOptions: {
          type: "dot",
          color: dotsColor
        }
      });
      return qrCodeInstance.current;
    }
    return null;
  };

  const handleMagicInput = async () => {
    if (!input.trim()) return;
    setIsAiLoading(true);
    try {
      const processed = await processNLEntry(input);
      setInput(processed);
    } catch (err) {
      console.error("AI Processing Error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    const dataToUse = input.trim();
    if (!dataToUse) return;
    
    setIsLoading(true);
    
    // Ensure instance is ready
    const qr = getQRInstance();
    if (!qr) {
      console.error("QRCodeStyling library not loaded yet.");
      setIsLoading(false);
      return;
    }

    // Small delay to simulate "processing" and ensure UX feedback
    setTimeout(() => {
      qr.update({
        data: dataToUse,
        width: size,
        height: size,
        image: logo || undefined,
        dotsOptions: {
          color: dotsColor,
          type: dotsType
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 10
        },
        cornersSquareOptions: {
          color: dotsColor,
          type: dotsType === 'square' ? 'square' : 'extra-rounded'
        },
        cornersDotOptions: {
          color: dotsColor
        }
      });
      
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = "";
        qr.append(qrContainerRef.current);
      }
      
      setGenerated(true);
      setIsLoading(false);
    }, 400);
  };

  const handleDownload = () => {
    const qr = getQRInstance();
    if (qr) {
      qr.download({ name: "vibe-qr", extension: "png" });
    }
  };

  const clearLogo = () => {
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`min-h-screen flex flex-col p-4 md:p-8 transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/50">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Vibe QR Code</h1>
        </div>
        
        <button 
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          title="Toggle Dark Mode"
        >
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-12">
        
        {/* Left: Input Panel */}
        <section className={`p-6 rounded-2xl shadow-xl transition-all border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
          <div className="space-y-6">
            
            {/* Input Area */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                Content or Intent
                <span className="text-xs font-normal text-slate-400">(URL or Descriptive text)</span>
              </label>
              <div className="relative">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g. 'My X handle @username' or 'https://google.com'"
                  className={`w-full h-32 p-4 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                />
                <button 
                  onClick={handleMagicInput}
                  disabled={isAiLoading || !input}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all shadow-lg shadow-indigo-500/30"
                >
                  {isAiLoading ? (
                    <span className="animate-pulse">Magic...</span>
                  ) : (
                    <>
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Magic AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Config Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">QR Size</label>
                <select 
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value) as QRSize)}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value={QRSize.SMALL}>Small (200px)</option>
                  <option value={QRSize.MEDIUM}>Medium (300px)</option>
                  <option value={QRSize.LARGE}>Large (400px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Dots Style</label>
                <select 
                  value={dotsType}
                  onChange={(e) => setDotsType(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="extra-rounded">Extra Rounded</option>
                  <option value="dots">Dots</option>
                  <option value="rounded">Rounded</option>
                  <option value="classy">Classy</option>
                  <option value="square">Square</option>
                </select>
              </div>
            </div>

            {/* Logo Settings */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center justify-between">
                Logo Personalization
                {logo && (
                  <button onClick={clearLogo} className="text-[10px] text-red-500 hover:underline">Clear logo</button>
                )}
              </label>
              <div className={`flex items-center gap-4 p-3 rounded-xl border border-dashed transition-all ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-indigo-500 ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'}`}
                >
                  {logo ? (
                    <img src={logo} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
                  >
                    {logo ? 'Change Image' : 'Upload your logo'}
                  </button>
                  <p className="text-[10px] text-slate-400">PNG or JPG, center-embedded</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Theme Color</label>
              <div className="flex gap-2">
                {['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setDotsColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${dotsColor === color ? 'border-slate-400 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input 
                  type="color" 
                  value={dotsColor}
                  onChange={(e) => setDotsColor(e.target.value)}
                  className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer"
                />
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isLoading || !input}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/40 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Generate Vibe QR'
              )}
            </button>

          </div>
        </section>

        {/* Right: Preview Panel */}
        <section className="flex flex-col items-center gap-6">
          <div className={`p-8 rounded-2xl shadow-xl border relative min-h-[350px] flex flex-col items-center justify-center transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div 
              className={`bg-white p-4 rounded-xl shadow-inner flex items-center justify-center transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}
              style={{ minWidth: size > 300 ? '300px' : '220px', minHeight: size > 300 ? '300px' : '220px' }}
            >
              <div ref={qrContainerRef} />
              {!generated && !isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-sm text-center">
                  <p>QR Code Preview</p>
                  <p className="text-xs mt-1">Configure & hit generate</p>
                </div>
              )}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            {generated && !isLoading && (
              <div className="mt-6 flex gap-4 w-full">
                <button 
                  onClick={handleDownload}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download PNG
                </button>
              </div>
            )}

            {/* Floating indicator */}
            <div className="absolute -top-3 -right-3 px-3 py-1 bg-pink-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-lg">
              Classic Style
            </div>
          </div>
          
          <div className={`text-center max-w-xs text-xs space-y-2 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            <p>Scanning this QR code will directly navigate users to the content you specified above.</p>
            <p>Powered by Advanced AI Tools.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto max-w-4xl mx-auto w-full py-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm font-medium text-slate-400">
        Built in Tin Shui Wai • 2024
      </footer>
    </div>
  );
};

export default App;
