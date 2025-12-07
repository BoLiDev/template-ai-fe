import { observer } from 'mobx-react-lite';
import { FC, useEffect, useRef, useState } from 'react';

import { Chat } from './chat';

const chat = new Chat();

const App: FC = observer(() => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const isStreaming = chat.status === 'streaming';

  return (
    <div className="flex flex-col h-screen bg-stone-50">
      {/* Header */}
      <header className="shrink-0 px-6 py-4 border-b border-stone-200">
        <h1 className="text-lg font-medium text-stone-800 tracking-tight">
          Chat
        </h1>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {chat.messages.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <p className="text-stone-400 text-sm">Start a conversation...</p>
            </div>
          )}

          {chat.messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    isUser
                      ? 'bg-stone-800 text-stone-50'
                      : 'bg-white text-stone-800 border border-stone-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.parts
                      .filter((part) => part.type === 'text')
                      .map((part) => (part.type === 'text' ? part.text : ''))
                      .join('')}
                  </p>
                </div>
              </div>
            );
          })}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <footer className="shrink-0 border-t border-stone-200 bg-white px-4 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              chat.sendMessage(input);
              setInput('');
            }
          }}
          className="max-w-2xl mx-auto flex gap-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chat.status !== 'idle'}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-stone-100 border-0 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-50 transition-shadow"
          />
          <button
            type="submit"
            disabled={chat.status !== 'idle' || !input.trim()}
            className="px-5 py-3 bg-stone-800 text-stone-50 text-sm font-medium rounded-xl hover:bg-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
});

export default App;
