import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Lightbulb, MessageCircle, Sparkles, Zap, Target, Plus } from 'lucide-react';
import { generateAIResponse } from '../utils/aiChatResponses.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export const AIAssistant = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onStartPomodoro, className = '' }) => {
  const [messages, setMessages] = useLocalStorage('ai-chat-messages', []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking time (shorter for interactive responses)
    setTimeout(() => {
      const aiResponse = generateAIResponse(
        inputValue, 
        todos, 
        onAddTodo, 
        onToggleTodo, 
        onDeleteTodo, 
        onStartPomodoro
      );
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        suggestions: aiResponse.suggestions,
        action: aiResponse.action
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 500 + Math.random() * 800);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'task_added': return <Plus className="w-3 h-3 text-green-600" />;
      case 'task_completed': return <Target className="w-3 h-3 text-blue-600" />;
      case 'pomodoro_started': return <Zap className="w-3 h-3 text-orange-600" />;
      case 'analysis_provided': return <Lightbulb className="w-3 h-3 text-purple-600" />;
      default: return null;
    }
  };

  // Smart suggestions based on current context
  const getContextualSuggestions = () => {
    const incompleteTasks = todos.filter(todo => !todo.completed);
    const highPriorityTasks = incompleteTasks.filter(todo => todo.priority === 'high');
    
    if (incompleteTasks.length === 0) {
      return [
        "Add a new task",
        "Plan my week",
        "Set learning goals",
        "Review achievements"
      ];
    } else if (highPriorityTasks.length > 0) {
      return [
        "What should I focus on?",
        "Start a Pomodoro session",
        "Analyze my progress",
        "Help me prioritize"
      ];
    } else {
      return [
        "What should I work on?",
        "Add a high priority task",
        "Start with quick wins",
        "Plan my day"
      ];
    }
  };

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl shadow-lg border border-purple-200 flex flex-col h-96 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Interactive AI Assistant</h2>
            <p className="text-xs text-gray-600">I can add tasks, start timers, and analyze your progress!</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-white/50 transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-600 text-sm mb-4">
              Hi! I'm your interactive AI assistant. I can actually help you manage your tasks, not just give advice!
            </p>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium mb-2">Try these commands:</p>
              {[
                "Add task: Review project proposal",
                "What should I work on?",
                "Start a Pomodoro session",
                "Analyze my progress"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="block w-full text-left px-3 py-2 text-xs bg-white/60 hover:bg-white/80 rounded-lg transition-colors text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-white/80 text-gray-800 border border-purple-100'
                }`}>
                  <div className="flex items-start gap-2">
                    {message.action && getActionIcon(message.action)}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.suggestions && (
                        <div className="mt-3 space-y-1">
                          <p className="text-xs text-gray-600 font-medium">Quick actions:</p>
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left px-2 py-1 text-xs bg-purple-50 hover:bg-purple-100 rounded transition-colors text-purple-700"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Smart Suggestions Bar */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-purple-200 bg-purple-50/50">
          <div className="flex gap-1 flex-wrap">
            {getContextualSuggestions().slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-1 text-xs bg-white/60 hover:bg-white/80 rounded transition-colors text-gray-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-purple-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Try: 'Add task: Call client' or 'What should I do?'"
            className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-3 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};