
"use client";

import { useState, useRef, useEffect } from 'react';
import type { Match, IcebreakerRequest, ChatMessage } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { generateIcebreakerQuestion } from '@/ai/flows/icebreaker-generator';
import { generateChatReply } from '@/ai/flows/generic-chat-reply-flow'; // New AI flow
import { Loader2, MessageCircle, Sparkles, Send, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IcebreakerCardProps {
  match: Match;
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

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contactName = match.candidate ? match.candidate.name : match.company.name;
  const contactAvatar = match.candidate ? match.candidate.avatarUrl : match.company.logoUrl;
  const contactDataAiHint = match.candidate ? (match.candidate.dataAiHint || "person") : (match.company.dataAiHint || "company logo");


  useEffect(() => {
    if (isChatOpen) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);


  const handleGenerateIcebreaker = async () => {
    setIsLoadingIcebreaker(true);
    setIcebreaker(null);
    try {
      const candidate = match.candidate;
      const company = match.company;
      
      const jobDescription = company.jobOpenings && company.jobOpenings.length > 0 
        ? `${company.jobOpenings[0].title}: ${company.jobOpenings[0].description}`
        : `a role at ${company.name}`;

      const requestData: IcebreakerRequest = {
        candidateName: candidate.name,
        jobDescription: jobDescription,
        candidateSkills: candidate.skills.join(', '),
        companyNeeds: company.companyNeeds || "general company needs for talent",
        pastProjects: candidate.pastProjects || "various interesting projects"
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
    if (!currentMessage.trim()) return;
    setIsSendingMessage(true);

    const newUserMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: currentMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    const messageForAI = currentMessage;
    setCurrentMessage("");

    try {
      // Simulate AI reply
      const aiResult = await generateChatReply({
        userMessage: messageForAI,
        contactName: contactName, // The person AI is simulating
        userName: "You" // Assuming the current user is "You"
      });

      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'contact', // Simulating the contact's reply
        text: aiResult.aiReply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI reply:", error);
      const errorReply: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'contact',
        text: "Sorry, I couldn't process that. Try again?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsSendingMessage(false);
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
              {match.candidate ? `Candidate for ${match.company.name}` : `Company: ${match.company.name}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4 flex-grow">
        {!icebreaker && !isLoadingIcebreaker && (
           <div className="text-center py-4">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Generate an AI icebreaker to get started!</p>
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

        <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:flex-1">
              <MessageCircle className="mr-2 h-4 w-4" /> Start Chat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] flex flex-col h-[70vh] max-h-[600px]">
            <DialogHeader>
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
            </DialogHeader>
            <ScrollArea className="flex-grow p-1 pr-3 -mr-2 mb-2 border rounded-md bg-background">
              <div className="space-y-3 py-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end space-x-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender !== 'user' && (
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
                      className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
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
                  disabled={isSendingMessage}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isSendingMessage || !currentMessage.trim()}>
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
