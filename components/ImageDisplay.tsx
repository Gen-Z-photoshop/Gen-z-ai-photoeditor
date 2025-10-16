import React from 'react';
import { SparklesIcon, LoadingSpinner, DownloadIcon } from './Icons';

interface ImageDisplayProps {
  title: string;
  imageUrl: string | null;
  isLoading: boolean;
  hasContent: boolean;
}

const Placeholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
    <SparklesIcon className="h-16 w-16 opacity-30" />
    <p className="mt-4 font-semibold">Your edited image will appear here</p>
    <p className="text-sm">Upload an image and provide a prompt to get started.</p>
  </div>
);


const ImageDisplay: React.FC<ImageDisplayProps> = ({ title, imageUrl, isLoading, hasContent }) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    
    // Extract file extension from base64 mime type for a better filename
    const mimeTypeMatch = imageUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    const extension = mimeTypeMatch && mimeTypeMatch.length > 1 ? mimeTypeMatch[1].split('/')[1] : 'png';
    link.download = `genz-hub-edit.${extension}`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-lg font-medium text-gray-200 mb-4 text-center">{title}</h2>
      <div className="flex-grow bg-blue-950/50 rounded-lg border border-blue-700 flex items-center justify-center p-4 min-h-[250px] sm:min-h-[300px] lg:min-h-full">
        {isLoading ? (
          <LoadingSpinner text="Generating your image..." subtext="This can take a few moments." />
        ) : imageUrl ? (
          <img src={imageUrl} alt="Edited result" className="max-h-full max-w-full object-contain rounded-md" />
        ) : (
          hasContent ? <Placeholder /> : <Placeholder /> 
        )}
      </div>
       {imageUrl && !isLoading && (
        <button
          onClick={handleDownload}
          className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-6 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300 transform hover:scale-105"
        >
          <DownloadIcon className="h-6 w-6" />
          <span>Download Image</span>
        </button>
      )}
    </div>
  );
};

export default ImageDisplay;