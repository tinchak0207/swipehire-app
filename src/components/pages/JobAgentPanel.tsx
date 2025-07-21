'use client';

import { BotMessageSquare, Briefcase, ClipboardList, Cog, Search, SendHorizontal, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// Mock Job Data
const mockJobs = [
  {
    title: 'Frontend Developer',
    company: 'Vercel',
    location: 'Remote',
    logo: 'https://www.svgrepo.com/show/354512/vercel.svg',
    salary: '$120k - $150k',
    tags: ['React', 'Next.js', 'TypeScript'],
  },
  {
    title: 'Full-Stack Engineer',
    company: 'Stripe',
    location: 'Remote',
    logo: 'https://www.svgrepo.com/show/473805/stripe.svg',
    salary: '$140k - $180k',
    tags: ['React', 'Node.js', 'Go'],
  },
  {
    title: 'Product Designer',
    company: 'Figma',
    location: 'San Francisco, CA',
    logo: 'https://www.svgrepo.com/show/353735/figma.svg',
    salary: '$130k - $160k',
    tags: ['UI', 'UX', 'Prototyping'],
  },
  {
    title: 'AI/ML Engineer',
    company: 'OpenAI',
    location: 'San Francisco, CA',
    logo: 'https://www.svgrepo.com/show/354147/openai.svg',
    salary: '$160k - $220k',
    tags: ['Python', 'PyTorch', 'LLMs'],
  },
  {
    title: 'UX Researcher',
    company: 'Google',
    location: 'Mountain View, CA',
    logo: 'https://www.svgrepo.com/show/353801/google.svg',
    salary: '$110k - $140k',
    tags: ['Research', 'Usability Testing', 'Analytics'],
  },
];

const presetOptions = ['Frontend Developer', 'Full-Stack Engineer'];

// JobCard Component
const JobCard = ({
  job,
  onGetJob,
}: {
  job: (typeof mockJobs)[0];
  onGetJob: () => void;
}) => (
  <div className="flex h-full w-full flex-shrink-0 transform-gpu flex-col rounded-xl bg-slate-700/50 p-4 backdrop-blur-sm transition-all duration-300 snap-center">
    <div className="flex-grow">
      <div className="mb-3 flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white p-1.5">
          <Image src={job.logo} alt={`${job.company} logo`} width={32} height={32} />
        </div>
        <div className="ml-3">
          <p className="font-semibold text-white">{job.company}</p>
        </div>
      </div>
      <h4 className="mb-1 font-semibold text-slate-100 text-md">{job.title}</h4>
      <p className="text-slate-400 text-xs mb-2">{job.location}</p>
      <p className="text-slate-300 text-sm font-semibold mb-3">{job.salary}</p>
      <div className="flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span key={tag} className="px-2 py-1 text-xs rounded-full bg-slate-600/80 text-slate-200">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="flex flex-col items-center justify-center text-white/50 mt-2">
      <span className="text-xs mb-1">Scroll for more</span>
      <ChevronDown className="h-6 w-6 animate-bounce" />
    </div>
    <Button
      onClick={onGetJob}
      size="sm"
      className="subtle-button-hover mt-2 w-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
    >
      Get this Job
    </Button>
  </div>
);

// PresetOptions Component
const PresetOptions = ({ onSelect }: { onSelect: (option: string) => void }) => (
  <div className="animate-fadeIn mb-2 flex flex-wrap justify-center gap-2">
    {presetOptions.map((option) => (
      <Button
        key={option}
        variant="outline"
        onClick={() => onSelect(option)}
        className="h-auto rounded-full border-slate-600 bg-slate-700/50 px-3 py-1 text-xs text-slate-200 hover:bg-slate-700/80"
      >
        {option}
      </Button>
    ))}
  </div>
);

const JobAgentPanel: React.FC<{ onGetJobClick: () => void }> = ({ onGetJobClick }) => {
  const [conversationStage, setConversationStage] = useState('initial');
  const [messages, setMessages] = useState([
    {
      sender: 'agent',
      text: "What jobs you're aiming for?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [agentSteps, setAgentSteps] = useState<Array<{ icon: React.ElementType; text: string }>>([]);
  const [showJobResults, setShowJobResults] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, agentSteps]);

  useEffect(() => {
    if (isThinking && conversationStage === 'details') {
      const steps = [
        { icon: Cog, text: 'Analyzing your request for roles and skills...' },
        { icon: Search, text: 'Querying job boards and our partner network...' },
        { icon: ClipboardList, text: 'Filtering and ranking top opportunities...' },
        { icon: Briefcase, text: 'Compiling personalized job recommendations...' },
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setAgentSteps((prev) => [...prev, steps[currentStep]]);
          currentStep++;
        } else {
          clearInterval(interval);
          setMessages((prev) => [
            ...prev,
            { sender: 'agent', text: "I've found some promising opportunities for you!" },
          ]);
          setShowJobResults(true);
          setIsThinking(false);
          setConversationStage('results'); // New stage to indicate results are shown
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [isThinking, conversationStage]);

  const handleSendMessage = (text: string) => {
    if (text.trim() && !isThinking) {
      const userMessage = { sender: 'user', text };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');

      if (conversationStage === 'initial') {
        setIsThinking(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { sender: 'agent', text: 'Great! Could you tell me more about your desired location and experience level?' },
          ]);
          setConversationStage('details');
          setIsThinking(false);
        }, 1000);
      } else if (conversationStage === 'details') {
        setIsThinking(true);
        setAgentSteps([]);
        setShowJobResults(false);
        // The useEffect hook will trigger the research process
      }
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto" style={{ aspectRatio: '9 / 16' }}>
    <Card className="h-full w-full transform-gpu rounded-2xl bg-slate-800/60 p-4 shadow-2xl backdrop-blur-lg transition-all hover:scale-[1.02] hover:bg-slate-800/80 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 text-white flex-shrink-0">
        <CardTitle className="font-heading text-xl">Your AI Job Agent</CardTitle>
        <BotMessageSquare className="h-8 w-8 text-accent" />
      </CardHeader>
      <CardContent className="flex flex-col flex-grow overflow-hidden">
        <div className="flex-grow space-y-4 overflow-y-auto pr-2 scrollbar-hide">
          {messages.map((msg, index) => (
            <div
              key={`msg-${index}`}
              className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'agent' && (
                <Image
                  src="/ai-avatar.png"
                  alt="AI Agent"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-accent/80 bg-slate-600"
                />
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${msg.sender === 'user' ? 'rounded-br-none bg-primary text-primary-foreground' : 'rounded-bl-none bg-slate-700/80 text-slate-200'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isThinking && conversationStage === 'details' && (
            <div className="flex items-end gap-3">
              <Image
                src="/ai-avatar.png"
                alt="AI Agent"
                width={40}
                height={40}
                className="rounded-full border-2 border-accent/80 bg-slate-600"
              />
              <div className="w-full max-w-[80%] space-y-2 rounded-xl rounded-bl-none bg-slate-700/80 p-3 text-slate-200">
                {agentSteps.map((step, index) => (
                  step && (
                    <div key={`step-${index}`} className="flex animate-fadeIn items-center text-xs">
                      <step.icon className="mr-2 h-4 w-4 shrink-0 text-accent" />
                      <span>{step.text}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          {showJobResults && (
            <div className="animate-fadeIn h-full relative">
              <div className="flex h-full flex-col snap-y snap-mandatory overflow-y-auto scrollbar-hide">
                {mockJobs.map((job) => (
                  <JobCard key={job.title} job={job} onGetJob={onGetJobClick} />
                ))}
              </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {conversationStage !== 'results' && (
          <>
            {conversationStage === 'initial' && !isThinking && <PresetOptions onSelect={(option) => handleSendMessage(option)} />}
            <div className="mt-auto flex items-center gap-2 pt-4 flex-shrink-0">
              <Input
                type="text"
                placeholder={conversationStage === 'initial' ? "Or type your own..." : "e.g., 'Remote, 5+ years'"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                disabled={isThinking}
                className="flex-grow rounded-full bg-slate-700/80 text-white placeholder-slate-400 disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                onClick={() => handleSendMessage(inputValue)}
                disabled={isThinking}
                className="rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-110 disabled:scale-100 disabled:opacity-50">
                <SendHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default JobAgentPanel;
