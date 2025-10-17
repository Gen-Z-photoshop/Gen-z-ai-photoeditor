import React, { useState, useCallback, useMemo } from 'react';
import { editImageWithAI } from './services/geminiService';
import { UploadIcon, SparklesIcon, ErrorIcon, LoadingSpinner } from './components/Icons';
import ImageDisplay from './components/ImageDisplay';

const App: React.FC = () => {
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const originalImagePreview = useMemo(() => {
    if (!originalImageFile) return null;
    return URL.createObjectURL(originalImageFile);
  }, [originalImageFile]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setOriginalImageFile(null);
      setEditedImageUrl(null);
      setError(null);
      setIsUploading(true);

      // A small delay to ensure the UI updates to show the loader,
      // providing better user feedback for a very fast operation.
      setTimeout(() => {
        if (file.size > 4 * 1024 * 1024) { // 4MB limit
          setError('Image size exceeds 4MB. Please choose a smaller file.');
          setIsUploading(false);
          return;
        }
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          setError('Invalid file type. Please upload a PNG, JPG, or WEBP image.');
          setIsUploading(false);
          return;
        }
        setOriginalImageFile(file);
        setIsUploading(false);
      }, 300);
    }
  };
  
  const handleSubmit = useCallback(async () => {
    if (!originalImageFile || !prompt.trim()) {
      setError('Please upload an image and enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImageUrl(null);

    try {
      const resultUrl = await editImageWithAI(originalImageFile, prompt);
      setEditedImageUrl(resultUrl);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [originalImageFile, prompt]);

  return (
    <div className="min-h-screen text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-6xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400">
          Gemini Photo Editor
        </h1>
        <p className="text-gray-300 mt-2">Unleash your creativity with Google's Gemini AI</p>
      </header>

      <main className="w-full max-w-6xl flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input & Controls */}
        <div className="flex flex-col gap-6">
          <div className="bg-gray-800/40 p-6 rounded-2xl border border-blue-800/50 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]">
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageChange}
              disabled={isUploading}
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer w-full h-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-700 rounded-xl transition-colors ${!isUploading && 'hover:border-blue-500 hover:bg-gray-800/70'}`}
            >
              {isUploading ? (
                <LoadingSpinner text="Processing image..." />
              ) : originalImagePreview ? (
                <img src={originalImagePreview} alt="Original preview" className="max-h-64 w-auto object-contain rounded-lg shadow-lg" />
              ) : (
                <div className="text-center">
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <p className="mt-2 font-semibold text-gray-200">Click to upload an image</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 4MB</p>
                </div>
              )}
            </label>
            {originalImageFile && !isUploading && <p className="text-sm mt-3 text-gray-400">File: {originalImageFile.name}</p>}
          </div>

          <div className="bg-gray-800/40 p-6 rounded-2xl border border-blue-800/50">
            <label htmlFor="prompt" className="block text-lg font-medium text-gray-200 mb-2">
              Editing Prompt
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a futuristic city in the background' or 'Turn the dog into a robot'"
              className="w-full h-28 p-3 bg-blue-950/50 border border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-white resize-none"
              disabled={!originalImageFile}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!originalImageFile || !prompt.trim() || isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400 transition-all duration-300 transform hover:scale-105"
          >
            <SparklesIcon className="h-6 w-6" />
            <span>{isLoading ? 'Generating...' : 'Generate Image'}</span>
          </button>
        </div>

        {/* Right Column: Output */}
        <div className="bg-gray-800/40 p-6 rounded-2xl border border-blue-800/50">
           <ImageDisplay
            title="Edited Image"
            imageUrl={editedImageUrl}
            isLoading={isLoading}
            hasContent={!!originalImageFile}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
              <ErrorIcon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Error</p>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="w-full max-w-6xl text-center mt-8 text-gray-400 text-sm">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;