'use client';

import React from 'react';
import { ChatSession } from '@/types/chat';
import { useChat } from '@/lib/context/chat-context'; // Import useChat

interface ChatHistoryProps {
  sessions: ChatSession[];
  onSelectSession: (sessionId: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ sessions, onSelectSession }) => {
  const { isLoading } = useChat(); // Use isLoading from context

  return (
    <div className="flex flex-col">
      <input
        id="chat-search"
        placeholder="Search chats..."
        className="mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-describedby="chat-search-help"
        type="text"
      />
      <span id="chat-search-help" className="sr-only">
        Type to filter your chat history by title or content
      </span>
      <ul role="listbox" aria-label="Chat sessions">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, index) => (
            <li key={index} className="p-2">
              <div className="h-6 bg-gray-300 rounded animate-pulse w-3/4"></div>
            </li>
          ))
        ) : sessions.length > 0 ? (
          sessions.map((session) => (
            <li
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="p-2 cursor-pointer hover:bg-gray-200 rounded"
              role="option"
              aria-selected="false"
            >
              {session.title}
            </li>
          ))
        ) : (
          <li className="p-2 text-gray-500 text-center" role="status" aria-live="polite">
            No chat history yet
          </li>
        )}
      </ul>
    </div>
  );
};

export default ChatHistory;
