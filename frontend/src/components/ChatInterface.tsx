import React, { useState, useEffect } from 'react'
import { apiService, Message } from '../services/api'
import MessageBubble from './MessageBubble'

interface ChatMessage extends Message {
  // Additional UI state
  isLoading?: boolean
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()

  // Load existing conversation on mount
  useEffect(() => {
    loadExistingConversation()
  }, [])

  const loadExistingConversation = async () => {
    try {
      const conversations = await apiService.getConversations()
      if (conversations.length > 0) {
        // Load the most recent conversation
        const recentConversation = conversations[0]
        setConversationId(recentConversation.id)

        const conversationMessages = await apiService.getConversationMessages(recentConversation.id)
        setMessages(conversationMessages as ChatMessage[])
      }
    } catch (error) {
      console.error('Failed to load conversation:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      type: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: `loading-${Date.now()}`,
      content: '',
      type: 'assistant',
      isLoading: true,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, loadingMessage])

    try {
      const response = await apiService.sendChatMessage({
        message: userMessage.content,
        conversationId,
        includeCitations: true
      })

      // Update conversation ID if this is the first message
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId)
      }

      // Replace loading message with actual response
      setMessages(prev => prev.map(msg =>
        msg.id === loadingMessage.id
          ? {
              id: Date.now().toString(),
              content: response.response,
              type: 'assistant',
              citations: response.citations,
              timestamp: new Date().toISOString()
            } as ChatMessage
          : msg
      ))

    } catch (error) {
      console.error('Failed to send message:', error)

      // Replace loading message with error message
      setMessages(prev => prev.map(msg =>
        msg.id === loadingMessage.id
          ? {
              id: Date.now().toString(),
              content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
              type: 'assistant',
              timestamp: new Date().toISOString()
            } as ChatMessage
          : msg
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-6">🤖</div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Local Chatbot</h1>
            <p className="text-gray-600 max-w-md">
              Your personal AI assistant. Start a conversation below.
            </p>
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCitationClick={(citation) => {
                console.log('Citation clicked:', citation);
              }}
            />
          ))}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t border-gray-200 bg-white px-4 py-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Message Local Chatbot..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none min-h-[44px] max-h-32"
                rows={1}
                disabled={isLoading}
                style={{ height: 'auto', minHeight: '44px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 bottom-2 p-1 bg-[#10a37f] text-white rounded-md hover:bg-[#0f906e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            Local Chatbot may produce inaccurate information.
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface