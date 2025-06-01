
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Match, IcebreakerRequest, ChatMessage, Candidate, Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { generateIcebreakerQuestion } from '@/ai/flows/icebreaker-generator';
// import { generateChatReply } from '@/ai/flows/generic-chat-reply-flow'; // Replaced by actual chat
import { sendMessage, fetchMessages } from '@/services/chatService'; // New chat service
import { useUserPreferences } from '@/contexts/UserPreferencesContext'; // To get current user's MongoDB ID
import { Loader2, MessageCircle, Sparkles, Send, Bot, RefreshCcw } from 'lucide-react'; // Added RefreshCcw
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface IcebreakerCardProps {
  match: Match & { candidate: Candidate; company: Company }; // Ensure candidate & company are always present
}

// Conceptual analytics helper
const incrementAnalytic = (key: string) => {
  if (typeof window !== 'undefined') {
    const currentCount = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (currentCount + 1).toString());
  }
};

export function IcebreakerCard({ match }: IcebreakerCardProps) {
  const [icebreaker, setIcebreaker] = useState<string | null>(null);
  const [isLoadingIcebreaker, setIsLoadingIcebreaker] = useState(false);
  const { toast } = useToast();
  const { mongoDbUserId } = useUserPreferences();

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contactName = mongoDbUserId === match.userA_Id ? match.company.name : match.candidate.name;
  const contactAvatar = mongoDbUserId === match.userA_Id ? match.company.logoUrl : match.candidate.avatarUrl;
  const contactDataAiHint = mongoDbUserId === match.userA_Id 
    ? (match.company.dataAiHint || "company logo") 
    : (match.candidate.dataAiHint || "person");


  const loadChatMessages = useCallback(async () => {
    if (!isChatOpen || !match._id || !mongoDbUserId) return;
    setIsLoadingMessages(true);
    try {
      const fetchedMsgs = await fetchMessages(match._id);
      setMessages(fetchedMsgs.map(msg => ({
        ...msg,
        senderType: msg.senderId === mongoDbUserId ? 'user' : 'contact'
      })));
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      toast({ title: "Chat Error", description: "Could not load messages.", variant: "destructive" });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [isChatOpen, match._id, mongoDbUserId, toast]);
  
  useEffect(() => {
    if (isChatOpen) {
        loadChatMessages();
    }
  }, [isChatOpen, loadChatMessages]);


  useEffect(() => {
    if (isChatOpen && messages.length > 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);


  const handleGenerateIcebreaker = async () => {
    setIsLoadingIcebreaker(true);
    setIcebreaker(null);
    try {
      // Determine who is the candidate and who represents the company in this match context
      const candidateForIcebreaker = match.candidate;
      const companyForIcebreaker = match.company;
      
      const jobDescription = companyForIcebreaker.jobOpenings && companyForIcebreaker.jobOpenings.length > 0 
        ? `${companyForIcebreaker.jobOpenings[0].title}: ${companyForIcebreaker.jobOpenings[0].description}`
        : `a role at ${companyForIcebreaker.name}`;

      const requestData: IcebreakerRequest = {
        candidateName: candidateForIcebreaker.name,
        jobDescription: jobDescription,
        candidateSkills: candidateForIcebreaker.skills.join(', '),
        companyNeeds: companyForIcebreaker.companyNeeds || "general company needs for talent",
        pastProjects: candidateForIcebreaker.pastProjects || "various interesting projects"
      };

      const result = await generateIcebreakerQuestion(requestData);
      setIcebreaker(result.icebreakerQuestion);
      incrementAnalytic('analytics_icebreakers_generated'); // Track AI icebreaker generation
      toast({
        title: "Icebreaker Generated!",
        description: "Ready to start the conversation.",
      });
    } catch (error) {
      console.error("Error generating icebreaker:", error);
      toast({
        title: "Error",
        description: "Failed to generate icebreaker. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingIcebreaker(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !mongoDbUserId || !match._id) return;
    setIsSendingMessage(true);

    const receiverId = match.userA_Id === mongoDbUserId ? match.userB_Id : match.userA_Id;

    // Optimistic update
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`, // Temporary ID
      matchId: match._id,
      senderId: mongoDbUserId,
      receiverId: receiverId,
      text: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      senderType: 'user',
    };
    setMessages(prev => [...prev, optimisticMessage]);
    const messageToSend = currentMessage.trim();
    setCurrentMessage(""); 

    try {
      const savedMessage = await sendMessage({
        matchId: match._id,
        senderId: mongoDbUserId,
        receiverId: receiverId,
        text: messageToSend,
      });
      
      // Replace optimistic message with saved one
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id ? { ...savedMessage, senderType: 'user' } : msg
      ));

    } catch (error) {
      console.error("Error sending message:", error);
      toast({ title: "Send Error", description: "Could not send message.", variant: "destructive" });
      // Optionally, remove optimistic message or mark as failed
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      setCurrentMessage(messageToSend); // Restore message to input if send failed
    } finally {
      setIsSendingMessage(false);
    }
  };


  const handleChatOpenChange = (open: boolean) => {
    setIsChatOpen(open);
    if (open) {
      if (icebreaker && messages.length === 0) { // Only prefill if chat is empty and icebreaker exists
        setCurrentMessage(icebreaker); 
      }
      // Messages will be loaded by useEffect based on isChatOpen
    } else {
       // setCurrentMessage(""); // Optionally clear input on close
    }
  };

  return (
    <Card className="w-full shadow-lg overflow-hidden flex flex-col">
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
            <CardTitle className="text-xl text-primary">Match: {contactName}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {mongoDbUserId === match.userA_Id ? `Matched with candidate ${match.candidate.name}` : `Matched with company ${match.company.name}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-grow">
        {!icebreaker && !isLoadingIcebreaker && (
           <div className="text-center py-4">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
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
            <h4 className="font-semibold text-primary mb-2 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-accent" />
              AI Suggested Icebreaker:
            </h4>
            <Textarea
              readOnly
              value={icebreaker}
              className="min-h-[100px] bg-background text-foreground border-primary/50"
              rows={3}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 bg-muted/30 flex flex-col sm:flex-row gap-2">
        <Button onClick={handleGenerateIcebreaker} disabled={isLoadingIcebreaker} className="w-full sm:flex-1">
          {isLoadingIcebreaker ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {icebreaker ? 'Regenerate Icebreaker' : 'Generate Icebreaker'}
        </Button>

        <Dialog open={isChatOpen} onOpenChange={handleChatOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:flex-1">
              <MessageCircle className="mr-2 h-4 w-4" /> Start Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] flex flex-col h-[70vh] max-h-[600px]">
            <DialogHeader className="flex-row justify-between items-center">
              <DialogTitle className="flex items-center">
                {contactAvatar && (
                  <Image 
                    src={contactAvatar} 
                    alt={contactName} 
                    width={32} 
                    height={32} 
                    className="rounded-full mr-2 object-cover"
                    data-ai-hint={contactDataAiHint}
                  />
                )}
                Chat with {contactName}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={loadChatMessages} disabled={isLoadingMessages} aria-label="Refresh chat messages">
                {isLoadingMessages ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              </Button>
            </DialogHeader>
            <ScrollArea className="flex-grow p-1 pr-3 -mr-2 mb-2 border rounded-md bg-background">
              {isLoadingMessages && messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="ml-2 text-muted-foreground">Loading messages...</p>
                </div>
              )}
              {!isLoadingMessages && messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div className="space-y-3 py-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn("flex items-end space-x-2", 
                      msg.senderType === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.senderType !== 'user' && (
                       contactAvatar ? (
                        <Image 
                          src={contactAvatar} 
                          alt={contactName} 
                          width={24} 
                          height={24} 
                          className="rounded-full object-cover"
                          data-ai-hint={contactDataAiHint}
                        />
                      ) : (
                        <Bot className="h-6 w-6 text-muted-foreground" />
                      )
                    )}
                    <div
                      className={cn("max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm",
                        msg.senderType === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <DialogFooter className="pt-2 border-t">
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && handleSendMessage()}
                  disabled={isSendingMessage || !mongoDbUserId}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isSendingMessage || !currentMessage.trim() || !mongoDbUserId}>
                  {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
