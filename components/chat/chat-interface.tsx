'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  createdAt: string;
}

interface AIMessage {
  id: string;
  role: string;
  content: string;
  metadata?: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  chatId: string;
  currentUserId: string;
  listingId?: string;
}

export function ChatInterface({ chatId, currentUserId, listingId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiMessages, setAIMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join-chat', chatId);
    });

    newSocket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('user-typing', () => {
      setIsTyping(true);
    });

    newSocket.on('user-stop-typing', () => {
      setIsTyping(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-chat', chatId);
      newSocket.disconnect();
    };
  }, [chatId]);

  useEffect(() => {
    fetchChatHistory();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiMessages]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${chatId}`);
      const data = await response.json();
      setMessages(data.messages || []);
      setAIMessages(data.aiMessages || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !socket) return;

    setIsSending(true);
    const messageContent = inputMessage.trim();
    setInputMessage('');

    socket.emit('send-message', {
      chatId,
      senderId: currentUserId,
      content: messageContent,
      type: 'TEXT',
    });

    await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'process',
        chatId,
        userId: currentUserId,
        message: messageContent,
        listingId,
      }),
    }).catch(console.error);

    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const allMessages = [...messages, ...aiMessages.map(ai => ({
    id: ai.id,
    content: ai.content,
    senderId: 'ai-assistant',
    sender: {
      id: 'ai-assistant',
      firstName: 'AI',
      lastName: 'Assistant',
    },
    createdAt: ai.createdAt,
  }))].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {allMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.senderId === currentUserId
                    ? 'bg-primary text-primary-foreground'
                    : message.senderId === 'ai-assistant'
                      ? 'bg-blue-100 dark:bg-blue-900 text-foreground'
                      : 'bg-muted text-foreground'
                }`}
              >
                <div className="text-xs font-semibold mb-1">
                  {message.sender.firstName} {message.sender.lastName}
                </div>
                <div className="text-sm">{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg px-4 py-2">
                <span className="text-sm text-muted-foreground">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button onClick={sendMessage} disabled={isSending || !inputMessage.trim()}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
