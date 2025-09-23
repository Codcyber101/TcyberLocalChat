import React, { useState, useRef } from 'react';
import { apiService, Document } from '../services/api';

interface DocumentManagerProps {
  documents: Document[];
  onDocumentsChange: (documents: Document[]) => void;
  onDocumentSelect: (document: Document) => void;
  selectedDocumentId?: string;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  onDocumentsChange,
  onDocumentSelect,
  selectedDocumentId
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file type
    const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF, text file, or image (JPEG, PNG, GIF, WebP).');
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiService.uploadDocument(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add the new document to the list
      const newDocument: Document = {
        id: response.documentId,
        filename: response.filename,
        size: response.size,
        mimeType: file.type,
        status: 'uploading',
        uploadedAt: new Date().toISOString(),
      };

      onDocumentsChange([...documents, newDocument]);

      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await apiService.deleteDocument(documentId);
      onDocumentsChange(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return '✅';
      case 'error': return '❌';
      case 'uploading': return '⏳';
      case 'parsing': return '🔄';
      case 'indexing': return '📊';
      default: return '⏳';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.txt,.jpg,.jpeg,.png,.gif,.webp"
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Uploading...</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500">{uploadProgress}%</div>
          </div>
        ) : (
          <>
            <div className="text-gray-500 mb-2">
              <svg className="mx-auto h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <button
              onClick={handleUploadClick}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Upload Document
            </button>
            <p className="text-xs text-gray-500 mt-2">
              PDF, TXT, or images (max 50MB)
            </p>
          </>
        )}
      </div>

      {/* Documents List */}
      <div className="space-y-2">
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>No documents uploaded yet</p>
            <p className="text-sm">Upload a document to get started</p>
          </div>
        ) : (
          documents.map((document) => (
            <div
              key={document.id}
              className={`group flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                selectedDocumentId === document.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onDocumentSelect(document)}
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getStatusIcon(document.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {document.filename}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className={getStatusColor(document.status)}>
                      {document.status}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(document.size)}</span>
                    {document.pages && (
                      <>
                        <span>•</span>
                        <span>{document.pages} pages</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(document.uploadedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(document.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-2"
                title="Delete document"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentManager;