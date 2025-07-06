'use client';

import {
  Check,
  CheckCheck,
  Clock,
  Info,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added useRouter
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import io, { type Socket } from 'socket.io-client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
// Removed: import { generateChatReply, type GenerateChatReplyInput } from '@/ai/flows/generic-chat-reply-flow';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Candidate, ChatMessage, Company, Match } from '@/lib/types';
import { cn } from '@/lib/utils';
import { fetchMessages, sendMessage } from '@/services/chatService';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';
let socket: Socket | null = null;

const isMongoObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

interface QuickReplyOption {
  key: string;
  label: string;
  // template function might not be used if just redirecting, but keeping for potential future use
  template: (name: string) => string;
}

const quickReplyOptions: QuickReplyOption[] = [
  {
    key: 'thanks',
    label: 'Thanks for applying',
    template: (name) =>
      `Hello ${name}, thank you for your interest and application! We will contact you as soon as possible after reviewing your information.`,
  },
  {
    key: 'schedule',
    label: 'Schedule Interview',
    template: (name) =>
      `Hello ${name}, we were impressed with your resume and would like to invite you for an interview. What times are you available next week?`,
  },
  {
    key: 'reject',
    label: 'Politely Decline',
    template: (name) =>
      `Hello ${name}, thank you for taking the time to apply. After careful consideration, we find that your qualifications do not quite meet the requirements for this position at this time. We wish you success in your future job search!`,
  },
];

interface FocusedChatPanelProps {
  match: Match;
  mongoDbUserId: string | null;
}

export function FocusedChatPanel({ match, mongoDbUserId }: FocusedChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const currentUserName =
    typeof window !== 'undefined' ? localStorage.getItem('userNameSettings') || 'User' : 'User';
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  // Removed AI Suggestion states
  // const [aiSuggestedReply, setAiSuggestedReply] = useState<ChatMessage | null>(null);
  // const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  const router = useRouter(); // Initialize useRouter

  const contact = mongoDbUserId === match.userA_Id ? match.company : match.candidate;
  const contactName = contact?.name || 'Contact';
  const contactRole =
    mongoDbUserId === match.userA_Id ? (contact as Company).industry : (contact as Candidate).role;
  let contactAvatar =
    mongoDbUserId === match.userA_Id
      ? (contact as Company)?.logoUrl
      : (contact as Candidate)?.avatarUrl;
  const contactDataAiHint =
    (contact as Candidate)?.dataAiHint ||
    (contact as Company)?.dataAiHint ||
    (mongoDbUserId === match.userA_Id ? 'company logo' : 'person');

  if (contactAvatar?.startsWith('/uploads/')) {
    contactAvatar = `${CUSTOM_BACKEND_URL}${contactAvatar}`;
  }
  const avatarNeedsUnoptimized =
    contactAvatar?.startsWith(CUSTOM_BACKEND_URL) || contactAvatar?.startsWith('http://localhost');

  // Removed fetchAiSuggestion function

  const getSocket = useCallback(() => {
    if (!socket && mongoDbUserId) {
      console.log(
        `[FocusedChatPanel Socket] Attempting to connect to Socket.IO server at: ${CUSTOM_BACKEND_URL} with User ID: ${mongoDbUserId}`
      );
      socket = io(CUSTOM_BACKEND_URL, {
        reconnectionAttempts: 5,
        transports: ['websocket'],
        auth: { userId: mongoDbUserId },
      });

      socket.on('connect', () =>
        console.log(
          `[FocusedChatPanel Socket] Connected: ${socket?.id}, User: ${mongoDbUserId}, Match: ${match._id}`
        )
      );
      socket.on('disconnect', (reason) =>
        console.log(
          `[FocusedChatPanel Socket] Disconnected: ${reason}, User: ${mongoDbUserId}, Match: ${match._id}. Socket ID was: ${socket?.id}`
        )
      );
      socket.on('connect_error', (err) => {
        console.error(
          `[FocusedChatPanel Socket] Connection Error for User ${mongoDbUserId}, Match ${match._id}:`,
          {
            message: err.message,
            description: (err as any).description,
            type: (err as any).type,
            data: (err as any).data,
            cause: err.cause,
          }
        );
        toast({
          title: 'Chat Connection Error',
          description: `Could not connect to chat: ${err.message}. Check console for details and try refreshing.`,
          variant: 'destructive',
          duration: 10000,
        });
      });
      socket.on('joinRoomError', (error: { message: string }) => {
        console.error(
          `[FocusedChatPanel Socket] Join Room Error for Match ${match._id}:`,
          error.message
        );
        toast({
          title: 'Chat Access Denied',
          description: error.message || 'Could not join chat room.',
          variant: 'destructive',
        });
      });
    }
    return socket;
  }, [mongoDbUserId, match._id, toast]);

  const loadChatMessages = useCallback(async () => {
    if (!match?._id || !mongoDbUserId || !isMongoObjectId(match._id)) {
      setMessages([]);
      setIsLoadingMessages(false); /*setAiSuggestedReply(null);*/
      return;
    }
    setIsLoadingMessages(true); /*setAiSuggestedReply(null);*/
    try {
      const fetchedMsgs = await fetchMessages(match._id);
      const mappedMessages = fetchedMsgs.map(
        (msg) =>
          ({
            ...msg,
            senderType: msg.senderId === mongoDbUserId ? 'user' : 'contact',
          }) as ChatMessage
      );
      setMessages(mappedMessages);
      const currentSocket = getSocket();
      if (
        currentSocket &&
        fetchedMsgs.some((msg) => msg.receiverId === mongoDbUserId && !msg.read)
      ) {
        currentSocket.emit('markMessagesAsRead', {
          matchId: match._id,
          readerUserId: mongoDbUserId,
        });
      }
      // Removed call to fetchAiSuggestion
      // const lastContactMessage = mappedMessages.filter(m => m.senderType === 'contact').pop();
      // fetchAiSuggestion(lastContactMessage?.text);
    } catch (error) {
      console.error('Error fetching messages for FocusedChatPanel:', error);
      toast({
        title: 'Chat Error',
        description: 'Could not load messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [match?._id, mongoDbUserId, toast, getSocket]);

  useEffect(() => {
    const currentSocket = getSocket();
    if (match?._id && currentSocket && mongoDbUserId && isMongoObjectId(match._id)) {
      currentSocket.emit('joinRoom', match._id);
      const handleNewMessage = (newMessage: ChatMessage) => {
        if (newMessage.matchId === match._id) {
          setMessages((prev) =>
            prev.find(
              (m) =>
                m.id === newMessage.id ||
                (m.id?.startsWith('temp-') &&
                  m.text === newMessage.text &&
                  m.senderId === newMessage.senderId)
            )
              ? prev.map((m) =>
                  m.text === newMessage.text &&
                  m.id?.startsWith('temp-') &&
                  m.senderId === newMessage.senderId
                    ? {
                        ...newMessage,
                        senderType: newMessage.senderId === mongoDbUserId ? 'user' : 'contact',
                      }
                    : m
                )
              : [
                  ...prev,
                  {
                    ...newMessage,
                    senderType: newMessage.senderId === mongoDbUserId ? 'user' : 'contact',
                  },
                ]
          );
          if (newMessage.senderId !== mongoDbUserId) {
            currentSocket.emit('markMessagesAsRead', {
              matchId: match._id,
              readerUserId: mongoDbUserId,
            });
            // Removed call to fetchAiSuggestion
            // fetchAiSuggestion(newMessage.text);
          } /*else { setAiSuggestedReply(null); }*/
        }
      };
      const handleUserTyping = ({
        matchId: incMatchId,
        userId,
        userName,
      }: {
        matchId: string;
        userId: string;
        userName: string;
      }) => {
        if (incMatchId === match._id && userId !== mongoDbUserId)
          setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
      };
      const handleUserStopTyping = ({
        matchId: incMatchId,
        userId,
      }: {
        matchId: string;
        userId: string;
      }) => {
        if (incMatchId === match._id)
          setTypingUsers((prev) => {
            const newTyping = { ...prev };
            delete newTyping[userId];
            return newTyping;
          });
      };
      const handleMessagesAcknowledged = ({
        matchId: ackMatchId,
        readerUserId: ackReaderUserId,
      }: {
        matchId: string;
        readerUserId: string;
      }) => {
        if (ackMatchId === match._id && ackReaderUserId !== mongoDbUserId)
          setMessages((prev) =>
            prev.map((msg) =>
              msg.senderId === mongoDbUserId && !msg.read ? { ...msg, read: true } : msg
            )
          );
      };
      currentSocket.on('newMessage', handleNewMessage);
      currentSocket.on('userTyping', handleUserTyping);
      currentSocket.on('userStopTyping', handleUserStopTyping);
      currentSocket.on('messagesAcknowledgedAsRead', handleMessagesAcknowledged);
      loadChatMessages();
      return () => {
        if (isMongoObjectId(match._id)) {
        }
        currentSocket.off('newMessage', handleNewMessage);
        currentSocket.off('userTyping', handleUserTyping);
        currentSocket.off('userStopTyping', handleUserStopTyping);
        currentSocket.off('messagesAcknowledgedAsRead', handleMessagesAcknowledged);
        setTypingUsers((prev) => {
          const newTyping = { ...prev };
          if (mongoDbUserId) delete newTyping[mongoDbUserId];
          return newTyping;
        });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }
    if (match?._id && !isMongoObjectId(match._id)) {
      setMessages([]);
      setIsLoadingMessages(false); /*setAiSuggestedReply(null);*/
    }
    return () => {};
  }, [match?._id, mongoDbUserId, getSocket, loadChatMessages]);

  useEffect(() => {
    if (messages.length > 0 /*|| aiSuggestedReply*/)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !mongoDbUserId || !match?._id || !isMongoObjectId(match._id)) {
      if (match?._id && !isMongoObjectId(match._id))
        toast({ title: 'Mock Chat', description: 'Message sending disabled.' });
      return;
    }
    setIsSendingMessage(true);
    const receiverId = match.userA_Id === mongoDbUserId ? match.userB_Id : match.userA_Id;
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      matchId: match._id,
      senderId: mongoDbUserId,
      receiverId: receiverId,
      text: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      senderType: 'user',
      read: false,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    const messageToSend = currentMessage.trim();
    setCurrentMessage(''); /*setAiSuggestedReply(null);*/
    const currentSocket = getSocket();
    if (currentSocket && typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      currentSocket.emit('stopTyping', { matchId: match._id, userId: mongoDbUserId });
    }
    try {
      await sendMessage({
        matchId: match._id,
        senderId: mongoDbUserId,
        receiverId: receiverId,
        text: messageToSend,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Send Error',
        description: 'Could not send message.',
        variant: 'destructive',
      });
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      setCurrentMessage(messageToSend);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    const currentSocket = getSocket();
    if (!currentSocket || !mongoDbUserId || !match?._id || !isMongoObjectId(match._id)) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    else
      currentSocket.emit('typing', {
        matchId: match._id,
        userId: mongoDbUserId,
        userName: currentUserName,
      });
    typingTimeoutRef.current = setTimeout(() => {
      currentSocket.emit('stopTyping', { matchId: match._id, userId: mongoDbUserId });
      typingTimeoutRef.current = null;
    }, 2000);
  };

  // Removed handleUseSuggestion function

  const handleQuickReplyClick = (/*optionKey: string*/) => {
    router.push('/ai-hr-assistant');
    // We can pass context via query params if needed in the future
    // e.g., router.push(`/ai-hr-assistant?template=${optionKey}&contact=${contactName}`);
    // For now, just redirecting as per the request.
  };

  const typingUsersDisplay = Object.entries(typingUsers)
    .filter(([userId, _]) => userId !== mongoDbUserId)
    .map(([_, userName]) => userName)
    .join(', ');

  if (!match || !contact) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center bg-slate-100 p-6 text-center">
        <MessageSquare className="mb-4 h-16 w-16 text-slate-400" />
        <p className="font-semibold text-lg text-slate-500">No chat selected</p>
        <p className="text-slate-400 text-sm">Select an applicant to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex shrink-0 items-center space-x-3 border-slate-200 border-b p-3">
        <Avatar className="h-10 w-10 rounded-md">
          {contactAvatar ? (
            <Image
              src={contactAvatar}
              alt={contactName}
              width={40}
              height={40}
              className="rounded-md object-cover"
              data-ai-hint={contactDataAiHint}
              unoptimized={!!avatarNeedsUnoptimized}
            />
          ) : (
            <AvatarFallback className="rounded-md bg-slate-200 text-slate-600">
              {contactName.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h2 className="font-semibold text-md text-slate-800">{contactName}</h2>
          <p className="text-blue-600 text-xs">{contactRole}</p>
        </div>
        <Badge
          variant="outline"
          className="ml-auto border-green-400 bg-green-100 px-2 py-0.5 text-green-600 text-xs"
        >
          Online
        </Badge>
        <Link href="/ai-hr-assistant" passHref>
          <Button
            variant="default"
            size="sm"
            className="frost-button-gradient h-auto px-3 py-1.5 text-white text-xs"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Bulk AI Reply
          </Button>
        </Link>
      </header>
      <ScrollArea className="flex-grow bg-slate-50 p-4">
        {isLoadingMessages && messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="ml-2 text-slate-500">Loading messages...</p>
          </div>
        )}
        {!isLoadingMessages && messages.length === 0 /*&& !aiSuggestedReply removed*/ && (
          <div className="flex h-full items-center justify-center">
            <p className="text-slate-500">
              {isMongoObjectId(match._id)
                ? 'No messages yet. Start the conversation!'
                : 'Chat disabled for mock/invalid match.'}
            </p>
          </div>
        )}
        <div className="space-y-4 py-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex max-w-[85%] items-end space-x-2',
                msg.senderType === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              )}
            >
              {msg.senderType !== 'user' &&
                (contactAvatar ? (
                  <Image
                    src={contactAvatar}
                    alt={contactName}
                    width={32}
                    height={32}
                    className="self-start rounded-md object-cover"
                    data-ai-hint={contactDataAiHint}
                    unoptimized={!!avatarNeedsUnoptimized}
                  />
                ) : (
                  <Avatar className="h-8 w-8 self-start rounded-md">
                    <AvatarFallback className="rounded-md bg-slate-200 text-slate-600">
                      {contactName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              <div
                className={cn(
                  'rounded-lg px-3 py-2 text-sm shadow-sm',
                  msg.senderType === 'user'
                    ? 'rounded-br-none bg-blue-600 text-white'
                    : 'rounded-bl-none bg-slate-200 text-slate-800'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                <div
                  className={cn(
                    'mt-1 flex items-center gap-1 text-xs',
                    msg.senderType === 'user'
                      ? 'justify-end text-blue-100/70'
                      : 'justify-start text-slate-500/80'
                  )}
                >
                  <span>
                    {new Date(msg.timestamp)
                      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                      .toLowerCase()}
                  </span>
                  {msg.senderType === 'user' &&
                    (msg.id?.startsWith('temp-') ? (
                      <Clock className="h-3.5 w-3.5 text-blue-100/70" />
                    ) : msg.read ? (
                      <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                    ) : (
                      <Check className="h-3.5 w-3.5 text-blue-100/70" />
                    ))}
                </div>
              </div>
            </div>
          ))}
          {/* Removed AI Suggested Reply rendering block */}
          {/* Removed isLoadingAiSuggestion rendering block */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <footer className="shrink-0 border-slate-200 border-t bg-white p-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 self-center text-slate-500 text-xs">
            AI Quick Reply Suggestions:
          </span>
          {quickReplyOptions.map((qr) => (
            <Button
              key={qr.key}
              variant="outline"
              onClick={() =>
                handleQuickReplyClick(/*qr.key or qr.label could be passed if needed*/)
              }
              className="h-7 rounded-md border-slate-300 px-2.5 py-1 text-slate-700 text-xs hover:bg-slate-200"
              disabled={!isMongoObjectId(match._id)}
            >
              {qr.label}
            </Button>
          ))}
        </div>
        <div className="flex w-full items-end space-x-2">
          <Textarea
            id="chat-message-input"
            placeholder="Type your reply..."
            value={currentMessage}
            onChange={handleTextareaChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isSendingMessage) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSendingMessage || !mongoDbUserId || !isMongoObjectId(match._id)}
            className="max-h-[100px] min-h-[40px] flex-1 resize-none rounded-md border-slate-300 bg-slate-100 text-sm focus-visible:ring-blue-500"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={
              isSendingMessage ||
              !currentMessage.trim() ||
              !mongoDbUserId ||
              !isMongoObjectId(match._id)
            }
            className="h-10 w-10 self-end rounded-md bg-slate-700 p-0 hover:bg-slate-600"
            size="icon"
          >
            {isSendingMessage ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <p className="mt-1 text-slate-500 text-xs">
            {typingUsersDisplay && `${typingUsersDisplay} is typing...`}
          </p>
          <p className="mt-1 text-right text-slate-500 text-xs">
            <Info size={12} className="mr-0.5 inline" />
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </footer>
    </div>
  );
}
