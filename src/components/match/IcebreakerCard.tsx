'use client';

import {
  Archive,
  Award,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCheck,
  ChevronDown,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import io, { type Socket } from 'socket.io-client';
import { generateIcebreakerQuestion } from '@/ai/flows/icebreaker-generator';
import { CompanyReviewForm } from '@/components/reviews/CompanyReviewForm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import type {
  ApplicationStatusUpdate,
  Candidate,
  ChatMessage,
  Company,
  IcebreakerRequest,
  Match,
} from '@/lib/types';
import { ApplicationStage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { fetchMessages, sendMessage } from '@/services/chatService'; // Corrected import for sendMessage and fetchMessages
import { archiveMatch } from '@/services/matchService';
import { ApplicationStatusTimeline } from './ApplicationStatusTimeline';

const CUSTOM_BACKEND_URL = process.env['NEXT_PUBLIC_CUSTOM_BACKEND_URL'] || 'http://localhost:5000';
let socket: Socket | null = null;

const isMongoObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

interface IcebreakerCardProps {
  match: Match & {
    candidate: Candidate;
    company: Company;
    applicationStatusHistory?: ApplicationStatusUpdate[];
  };
  onMatchArchived?: (matchId: string) => void;
}

const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = Number.parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (currentCount + 1).toString());
  }
};

export function IcebreakerCard({ match, onMatchArchived }: IcebreakerCardProps) {
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [isLoadingIcebreaker, setIsLoadingIcebreaker] = useState(false);
  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();
  const currentUserName =
    typeof window !== 'undefined' ? localStorage.getItem('userNameSettings') || 'User' : 'User';

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [showSuggestTimeDialog, setShowSuggestTimeDialog] = useState(false);
  const [suggestedTimeMessage, setSuggestedTimeMessage] = useState('');
  const [showInterviewFeedbackDialog, setShowInterviewFeedbackDialog] = useState(false);
  const [localApplicationStatusHistory, setLocalApplicationStatusHistory] = useState<
    ApplicationStatusUpdate[]
  >(match.applicationStatusHistory || []);

  const contactName = mongoDbUserId === match.userA_Id ? match.company.name : match.candidate.name;
  const contactAvatar =
    mongoDbUserId === match.userA_Id ? match.company.logoUrl : match.candidate.avatarUrl;
  const contactDataAiHint =
    mongoDbUserId === match.userA_Id
      ? match.company.dataAiHint || 'company logo'
      : match.candidate.dataAiHint || 'person';

  const getSocket = useCallback(() => {
    if (!socket && mongoDbUserId) {
      const socketUrl = CUSTOM_BACKEND_URL.startsWith('http')
        ? CUSTOM_BACKEND_URL
        : `http://${CUSTOM_BACKEND_URL}`;
      console.log(
        '[Socket.IO Client] Initializing socket connection to:',
        socketUrl,
        'with userId:',
        mongoDbUserId
      );
      socket = io(socketUrl, {
        reconnectionAttempts: 5,
        transports: ['websocket'],
        auth: { userId: mongoDbUserId },
      });

      socket.on('connect', () =>
        console.log('[Socket.IO Client] Connected:', socket?.id, 'User ID:', mongoDbUserId)
      );
      socket.on('disconnect', (reason) => {
        console.log('[Socket.IO Client] Disconnected:', reason, 'User ID:', mongoDbUserId);
        if (reason === 'io server disconnect') {
          toast({
            title: 'Chat Disconnected',
            description: 'Disconnected by the server. Please try re-opening the chat.',
            variant: 'destructive',
          });
        } else if (reason === 'transport close' || reason === 'ping timeout') {
          toast({
            title: 'Chat Connection Lost',
            description: 'Attempting to reconnect...',
            variant: 'default',
            duration: 3000,
          });
        }
      });
      socket.on('connect_error', (err) => {
        console.error(
          '[Socket.IO Client] Connection Error:',
          err.message,
          err.cause,
          'User ID:',
          mongoDbUserId
        );
        toast({
          title: 'Chat Connection Error',
          description: `Could not connect: ${err.message}. Retrying...`,
          variant: 'destructive',
          duration: 7000,
        });
      });
      socket.on('joinRoomError', (error: { message: string }) => {
        console.error('[Socket.IO Client] Join Room Error:', error.message);
        toast({
          title: 'Chat Access Denied',
          description: error.message || 'Could not join the chat room.',
          variant: 'destructive',
        });
        setIsChatOpen(false);
      });
    }
    return socket;
  }, [mongoDbUserId, toast]);

  const loadChatMessages = useCallback(async () => {
    if (!isChatOpen || !match._id || !mongoDbUserId) return;
    if (!isMongoObjectId(match._id)) {
      setMessages([]);
      setIsLoadingMessages(false);
      return;
    }
    setIsLoadingMessages(true);
    try {
      const fetchedMsgs = await fetchMessages(match._id);
      setMessages(
        fetchedMsgs.map((msg) => ({
          ...msg,
          senderType: msg.senderId === mongoDbUserId ? 'user' : 'contact',
        }))
      );
      const currentSocket = getSocket();
      if (
        currentSocket &&
        fetchedMsgs.length > 0 &&
        fetchedMsgs.some((msg) => msg.receiverId === mongoDbUserId && !msg.read)
      ) {
        currentSocket.emit('markMessagesAsRead', {
          matchId: match._id,
          readerUserId: mongoDbUserId,
        });
      }
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      toast({
        title: 'Chat Error',
        description: 'Could not load messages.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [isChatOpen, match._id, mongoDbUserId, toast, getSocket]);

  useEffect(() => {
    const currentSocket = getSocket();
    if (isChatOpen && match._id && currentSocket && mongoDbUserId) {
      if (!isMongoObjectId(match._id)) {
        return;
      }
      currentSocket.emit('joinRoom', match._id);
      const handleNewMessage = (newMessage: ChatMessage) => {
        if (newMessage.matchId === match._id) {
          setMessages((prev) => {
            if (
              prev.find(
                (m) =>
                  m.id === newMessage.id ||
                  (m.id?.startsWith('temp-') &&
                    m.text === newMessage.text &&
                    m.senderId === newMessage.senderId)
              )
            ) {
              return prev.map((m) =>
                m.text === newMessage.text &&
                m.id?.startsWith('temp-') &&
                m.senderId === newMessage.senderId
                  ? {
                      ...newMessage,
                      senderType: newMessage.senderId === mongoDbUserId ? 'user' : 'contact',
                    }
                  : m
              );
            }
            return [
              ...prev,
              {
                ...newMessage,
                senderType: newMessage.senderId === mongoDbUserId ? 'user' : 'contact',
              },
            ];
          });
          if (newMessage.senderId !== mongoDbUserId) {
            currentSocket.emit('markMessagesAsRead', {
              matchId: match._id,
              readerUserId: mongoDbUserId,
            });
          }
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
    return () => {};
  }, [isChatOpen, match._id, mongoDbUserId, getSocket, loadChatMessages]);

  useEffect(() => {
    if (isChatOpen && messages.length > 0)
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  const handleGenerateIcebreaker = async () => {
    setIsLoadingIcebreaker(true);
    setIcebreaker(null);
    try {
      const requestData: IcebreakerRequest = {
        candidateName: match.candidate.name,
        jobDescription: `${match.jobOpeningTitle || 'a role'} at ${match.company.name}`,
        candidateSkills: match.candidate.skills.join(', '),
        companyNeeds: match.company.companyNeeds || 'general company needs',
        pastProjects: match.candidate.pastProjects || 'various projects',
      };
      const result = await generateIcebreakerQuestion(requestData);
      setIcebreaker(result.question);
      incrementAnalytic('analytics_icebreakers_generated');
      toast({ title: 'Icebreaker Generated!', description: 'Ready to start the conversation.' });
    } catch (error) {
      console.error('Error generating icebreaker:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate icebreaker.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingIcebreaker(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !mongoDbUserId || !match._id || !isMongoObjectId(match._id)) {
      if (match._id && !isMongoObjectId(match._id))
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
    setCurrentMessage('');
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value);
    const currentSocket = getSocket();
    if (!currentSocket || !mongoDbUserId || !match._id || !isMongoObjectId(match._id)) return;
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

  const handleChatOpenChange = (open: boolean) => {
    setIsChatOpen(open);
    if (open && icebreaker && messages.length === 0 && !currentMessage)
      setCurrentMessage(icebreaker);
    if (!open) {
      const currentSocket = getSocket();
      if (currentSocket && mongoDbUserId && match?._id && isMongoObjectId(match._id))
        currentSocket.emit('stopTyping', { matchId: match._id, userId: mongoDbUserId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const typingUsersDisplay = Object.entries(typingUsers)
    .filter(([userId, _]) => userId !== mongoDbUserId)
    .map(([_, name]) => name)
    .join(', ');

  const handleInterviewResponse = (response: 'accepted' | 'declined') => {
    const newStatus: ApplicationStatusUpdate = {
      stage:
        response === 'accepted' ? ApplicationStage.INTERVIEW_SCHEDULED : ApplicationStage.REJECTED,
      timestamp: new Date().toISOString(),
      description: `Interview ${response}.`,
      responseNeeded: false,
    };
    setLocalApplicationStatusHistory((prev) => [...prev, newStatus]);
    toast({
      title: `Interview ${response}`,
      description: `You have ${response} the interview invitation.`,
    });
  };

  const handleSuggestTimeSubmit = () => {
    if (!suggestedTimeMessage.trim()) {
      toast({
        title: 'Empty Message',
        description: 'Please enter suggested times.',
        variant: 'destructive',
      });
      return;
    }
    const newStatus: ApplicationStatusUpdate = {
      stage: ApplicationStage.INTERVIEW_SCHEDULED,
      timestamp: new Date().toISOString(),
      description: `Suggested new time: ${suggestedTimeMessage.substring(0, 50)}...`,
      responseNeeded: false,
    };
    setLocalApplicationStatusHistory((prev) => [...prev, newStatus]);
    toast({ title: 'Suggestion Sent', description: 'Your time suggestion sent.' });
    setShowSuggestTimeDialog(false);
    setSuggestedTimeMessage('');
  };

  const handleArchive = async () => {
    if (!mongoDbUserId) {
      toast({ title: 'Login Required', variant: 'destructive' });
      return;
    }
    try {
      await archiveMatch(match._id, mongoDbUserId);
      toast({
        title: 'Match Archived',
        description: `Your match with ${contactName} has been archived.`,
      });
      if (onMatchArchived) onMatchArchived(match._id);
    } catch (error: any) {
      toast({
        title: 'Archiving Error',
        description: error.message || 'Could not archive match.',
        variant: 'destructive',
      });
    }
  };

  const latestStatus =
    localApplicationStatusHistory.length > 0
      ? localApplicationStatusHistory[localApplicationStatusHistory.length - 1]
      : null;
  const showInterviewResponseButtons =
    latestStatus?.stage === ApplicationStage.INTERVIEW_SCHEDULED && latestStatus.responseNeeded;
  const showFeedbackButton =
    latestStatus?.stage === ApplicationStage.INTERVIEW_COMPLETED &&
    mongoDbUserId === match.userB_Id;

  return (
    <Card className="flex w-full flex-col overflow-hidden shadow-lg">
      <CardHeader className="bg-primary/10 p-4">
        <div className="flex items-center space-x-3">
          {contactAvatar && (
            <Image
              src={contactAvatar}
              alt={contactName}
              width={60}
              height={60}
              className="rounded-full border-2 border-primary object-cover"
              data-ai-hint={contactDataAiHint}
            />
          )}
          <div>
            <CardTitle className="text-primary text-xl">Match: {contactName}</CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {mongoDbUserId === match.userA_Id
                ? `Matched with candidate ${match.candidate.name}`
                : `Matched with company ${match.company.name}`}
              {match.jobOpeningTitle && (
                <span className="block text-xs">For role: {match.jobOpeningTitle}</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 p-4">
        {localApplicationStatusHistory && localApplicationStatusHistory.length > 0 && (
          <Accordion
            type="single"
            collapsible
            className="w-full"
            value={isTimelineExpanded ? 'status' : ''}
            onValueChange={(value) => setIsTimelineExpanded(value === 'status')}
          >
            <AccordionItem value="status" className="border-b-0">
              <AccordionTrigger className="group -mx-1 px-1 py-2 font-semibold text-md text-primary hover:no-underline">
                <div className="flex items-center">
                  <CalendarDays className="mr-2 h-5 w-5 text-primary/80 group-hover:text-primary" />
                  Application Progress
                  <ChevronDown className="ml-auto h-5 w-5 text-muted-foreground/70 transition-transform group-hover:text-primary data-[state=open]:rotate-180" />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pr-1 pb-0 pl-1">
                <ApplicationStatusTimeline statusHistory={localApplicationStatusHistory} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        {showInterviewResponseButtons && (
          <div className="space-y-2 rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="font-medium text-blue-700 text-sm">
              Action Required: Interview Invitation
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                size="sm"
                onClick={() => handleInterviewResponse('accepted')}
                className="flex-1 bg-green-500 text-white hover:bg-green-600"
              >
                <ThumbsUp className="mr-2 h-4 w-4" /> Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowSuggestTimeDialog(true)}
                className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                <CalendarPlus className="mr-2 h-4 w-4" /> Suggest New Time
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleInterviewResponse('declined')}
                className="flex-1"
              >
                <ThumbsDown className="mr-2 h-4 w-4" /> Decline
              </Button>
            </div>
          </div>
        )}
        {showFeedbackButton && (
          <div className="rounded-md border border-purple-200 bg-purple-50 p-3">
            <p className="mb-2 font-medium text-purple-700 text-sm">
              Interview Completed! Share your feedback:
            </p>
            <Button
              size="sm"
              onClick={() => setShowInterviewFeedbackDialog(true)}
              className="w-full bg-purple-500 text-white hover:bg-purple-600"
            >
              <Award className="mr-2 h-4 w-4" /> Provide Interview Feedback
            </Button>
          </div>
        )}
        {!icebreaker &&
          !isLoadingIcebreaker &&
          !showInterviewResponseButtons &&
          !showFeedbackButton && (
            <div className="py-4 text-center">
              <Sparkles className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">Generate an AI icebreaker or start chatting!</p>
            </div>
          )}
        {isLoadingIcebreaker && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating icebreaker...</p>
          </div>
        )}
        {icebreaker && (
          <div>
            <h4 className="mb-2 flex items-center font-semibold text-primary">
              <Sparkles className="mr-2 h-5 w-5 text-accent" />
              AI Suggested Icebreaker:
            </h4>
            <Textarea
              readOnly
              value={icebreaker}
              className="min-h-[100px] border-primary/50 bg-background text-foreground"
              rows={3}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 bg-muted/30 p-4 sm:flex-row">
        <Button
          onClick={handleGenerateIcebreaker}
          disabled={isLoadingIcebreaker}
          className="w-full sm:flex-1"
        >
          {isLoadingIcebreaker ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {icebreaker ? 'Regenerate' : 'Icebreaker'}
        </Button>
        <Dialog open={isChatOpen} onOpenChange={handleChatOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:flex-1">
              <MessageCircle className="mr-2 h-4 w-4" /> Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-[70vh] max-h-[600px] flex-col sm:max-w-[480px]">
            <DialogHeader className="flex-row items-center justify-between">
              <DialogTitle className="flex items-center">
                {contactAvatar && (
                  <Image
                    src={contactAvatar}
                    alt={contactName}
                    width={32}
                    height={32}
                    className="mr-2 rounded-full object-cover"
                    data-ai-hint={contactDataAiHint}
                  />
                )}
                Chat with {contactName}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={loadChatMessages}
                disabled={isLoadingMessages}
                aria-label="Refresh chat messages"
              >
                {isLoadingMessages ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
              </Button>
            </DialogHeader>
            <ScrollArea className="-mr-2 mb-2 flex-grow rounded-md border bg-background p-1 pr-3">
              {isLoadingMessages && messages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading...</p>
                </div>
              )}
              {!isLoadingMessages && messages.length === 0 && (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">
                    {isMongoObjectId(match._id) ? 'No messages yet.' : 'Chat disabled.'}
                  </p>
                </div>
              )}
              <div className="space-y-3 py-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex items-end space-x-2',
                      msg.senderType === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'flex max-w-[70%] items-end gap-1 rounded-lg px-3 py-2 text-sm shadow-sm',
                        msg.senderType === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <span>{msg.text}</span>
                      {msg.senderType === 'user' &&
                        !msg.id?.startsWith('temp-') &&
                        (msg.read ? (
                          <CheckCheck className="h-3.5 w-3.5 shrink-0 text-blue-300" />
                        ) : (
                          <Check className="h-3.5 w-3.5 shrink-0 text-primary-foreground/70" />
                        ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="h-5 px-1 pt-1 text-muted-foreground text-xs italic">
              {typingUsersDisplay &&
                `${typingUsersDisplay} ${Object.keys(typingUsers).length > 1 ? 'are' : 'is'} typing...`}
            </div>
            <DialogFooter className="border-t pt-2">
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={currentMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && handleSendMessage()}
                  disabled={isSendingMessage || !mongoDbUserId || !isMongoObjectId(match._id)}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    isSendingMessage ||
                    !currentMessage.trim() ||
                    !mongoDbUserId ||
                    !isMongoObjectId(match._id)
                  }
                >
                  {isSendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          onClick={handleArchive}
          className="w-full border-amber-500 text-amber-700 hover:bg-amber-50 hover:text-amber-800 sm:flex-1"
        >
          <Archive className="mr-2 h-4 w-4" /> Archive
        </Button>
      </CardFooter>
      <Dialog open={showSuggestTimeDialog} onOpenChange={setShowSuggestTimeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest New Interview Time</DialogTitle>
            <CardDescription>
              Propose alternative times or add a note for {contactName}.
            </CardDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., 'Unfortunately, I'm unavailable at that time...'"
            value={suggestedTimeMessage}
            onChange={(e) => setSuggestedTimeMessage(e.target.value)}
            rows={4}
            className="my-4"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSuggestTimeSubmit} disabled={!suggestedTimeMessage.trim()}>
              Send Suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={showInterviewFeedbackDialog} onOpenChange={setShowInterviewFeedbackDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Interview Feedback for {contactName}</DialogTitle>
            <CardDescription>
              Share your experience for role: {match.jobOpeningTitle}.
            </CardDescription>
          </DialogHeader>
          <div className="py-4">
            <CompanyReviewForm
              companyId={match.company.id}
              companyName={match.company.name}
              jobId={match.jobOpeningTitle || ''}
              jobTitle={match.jobOpeningTitle || ''}
              onReviewSubmitted={() => {
                setShowInterviewFeedbackDialog(false);
                const newStatus: ApplicationStatusUpdate = {
                  stage: ApplicationStage.INTERVIEW_COMPLETED,
                  timestamp: new Date().toISOString(),
                  description: 'Feedback submitted.',
                  responseNeeded: false,
                };
                setLocalApplicationStatusHistory((prev) => [...prev, newStatus]);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
