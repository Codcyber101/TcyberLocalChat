/**
 * API service for communicating with the Local First Chatbot backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Types
export interface Message {
  id: string;
  content: string;
  timestamp: string;
  type: 'user' | 'assistant';
  conversationId?: string;
  citations?: Array<{
    documentId: string;
    chunkIndex: number;
    score: number;
    contentPreview: string;
  }>;
  metadata?: Record<string, any>;
}

export interface Document {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  status: 'queued' | 'uploading' | 'parsing' | 'indexing' | 'ready' | 'error';
  uploadedAt: string;
  pages?: number;
  chunks?: number;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  documentId?: string;
  includeCitations?: boolean;
}

export interface ChatResponse {
  response: string;
  citations: Message['citations'];
  contextChunksUsed: number;
  ragEnabled: boolean;
  conversationId?: string;
  model?: string;
}

export interface UploadResponse {
  documentId: string;
  filename: string;
  size: number;
  status: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Chat endpoints
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.request<Message[]>(`/chat/conversations/${conversationId}`);
  }

  async getConversations(): Promise<Array<{id: string, title: string, lastActivity: string, documentId?: string, messageCount: number}>> {
    return this.request('/chat/conversations');
  }

  async deleteConversation(conversationId: string): Promise<void> {
    return this.request(`/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  // Document endpoints
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDocuments(status?: string): Promise<Document[]> {
    const params = status ? `?status=${status}` : '';
    return this.request<Document[]>(`/documents${params}`);
  }

  async deleteDocument(documentId: string): Promise<void> {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async summarizeDocument(documentId: string): Promise<{summary: string; summaryId: string; model: string; documentId: string}> {
    return this.request(`/documents/${documentId}/summarize`, {
      method: 'POST',
    });
  }

  async getDocumentSummaries(documentId: string): Promise<Array<{id: string; content: string; createdAt: string; model: string}>> {
    return this.request(`/documents/${documentId}/summaries`);
  }

  // Search endpoints
  async searchDocuments(query: string, documentId?: string): Promise<{
    documents: Array<{
      content: string;
      metadata: any;
      score: number;
      documentId: string;
      chunkIndex: number;
    }>;
    totalResults: number;
  }> {
    const body: any = { query };
    if (documentId) body.documentId = documentId;

    return this.request('/search', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Data management endpoints
  async exportData(options: {
    includeDocuments?: boolean;
    includeEmbeddings?: boolean;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<Blob> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/data/export?${params}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async importData(file: File): Promise<{
    message: string;
    imported: Record<string, number>;
    skipped: Record<string, number>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/data/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Import failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Multi-modal endpoints
  async analyzeImage(imageData: string, prompt?: string, documentId?: string): Promise<{
    analysis: string;
    confidence?: number;
    metadata?: Record<string, any>;
    documentId?: string;
  }> {
    return this.request('/analyze-image', {
      method: 'POST',
      body: JSON.stringify({
        imageData,
        prompt,
        documentId,
      }),
    });
  }

  async analyzeImageFile(file: File, prompt?: string, documentId?: string): Promise<{
    analysis: string;
    confidence?: number;
    metadata?: Record<string, any>;
    documentId?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (prompt) formData.append('prompt', prompt);
    if (documentId) formData.append('documentId', documentId);

    const response = await fetch(`${this.baseUrl}/analyze-image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Image analysis failed: ${response.statusText}`);
    }

    return response.json();
  }

  async transcribeAudio(audioData: string, language?: string, documentId?: string): Promise<{
    transcription: string;
    confidence?: number;
    language?: string;
    duration?: number;
    segments?: Array<{start: number; end: number; text: string}>;
    documentId?: string;
  }> {
    return this.request('/transcribe-audio', {
      method: 'POST',
      body: JSON.stringify({
        audioData,
        language,
        documentId,
      }),
    });
  }

  async transcribeAudioFile(file: File, language?: string, documentId?: string): Promise<{
    transcription: string;
    confidence?: number;
    language?: string;
    duration?: number;
    segments?: Array<{start: number; end: number; text: string}>;
    documentId?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    if (language) formData.append('language', language);
    if (documentId) formData.append('documentId', documentId);

    const response = await fetch(`${this.baseUrl}/transcribe-audio/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Audio transcription failed: ${response.statusText}`);
    }

    return response.json();
  }

  async renderContent(documentId: string, options: {
    format?: 'html' | 'json' | 'text' | 'markdown';
    includeMetadata?: boolean;
    highlightTerms?: string[];
    page?: number;
  } = {}): Promise<any> {
    return this.request(`/render-content`, {
      method: 'POST',
      body: JSON.stringify({
        documentId,
        ...options,
      }),
    });
  }

  // Health check
  async healthCheck(): Promise<{
    status: string;
    version: string;
    services: Record<string, string>;
    database_details?: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      return {
        status: 'error',
        version: 'unknown',
        services: { api: 'unreachable' },
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;