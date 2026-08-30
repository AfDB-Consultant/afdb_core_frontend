'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import api from '@/lib/api';
import { User } from '@/types';
import {
  MessageCircle,
  Send,
  Search,
  X,
  ChevronLeft,
  Check,
  CheckCheck,
  Bot,
  Sparkles,
  Users,
  ArrowRight,
} from 'lucide-react';

interface Message {
  id: number | string;
  sender_id: string | number;
  receiver_id: string | number;
  message: string;
  body?: string;
  attachment?: string;
  is_read: boolean;
  created_at: string;
  sender: {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
  };
  receiver: {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface ChatUser {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  last_message?: Message;
  unread_count: number;
  is_online: boolean;
}

interface BotLink {
  label: string;
  href: string;
}

interface BotMessage {
  id: string;
  text: string;
  links?: BotLink[];
  followUps?: string[];
  isBot: boolean;
  created_at: string;
}

interface BotQA {
  keywords: string[];
  answer: string;
  links?: BotLink[];
  followUps?: string[];
}

const BOT_KNOWLEDGE: BotQA[] = [
  {
    keywords: ['project', 'projects', 'create project', 'new project', 'add project'],
    answer: "Great question! To create a new project, just head over to the Projects page and hit the \"Create Project\" button. You\'ll be able to fill in all the details like title, description, budget, and assign your team members. Once everything looks good, submit it for approval and you\'re all set!",
    links: [{ label: 'Go to Projects', href: '/projects' }],
    followUps: ['How do I track project budget?', 'Show me reports'],
  },
  {
    keywords: ['team', 'member', 'members', 'add user', 'invite', 'user management', 'people'],
    answer: "Managing your team is easy! Head to the User Management section where you can add new members, assign roles like Admin, Staff, or Viewer, and configure their permissions. Each team member will get access based on the role you assign them.",
    links: [{ label: 'Manage Team', href: '/team' }],
    followUps: ['What roles are available?', 'How do I change permissions?'],
  },
  {
    keywords: ['roles', 'admin', 'staff', 'viewer', 'manager', 'permission', 'permissions', 'access level'],
    answer: "We have several roles on the platform: Admin has full access to everything including user management and settings. Manager can create and manage projects, view reports, and oversee team activity. Staff can work on assigned projects and submit reports. Viewer has read-only access to dashboards and reports \u2014 great for stakeholders who just need visibility.",
    links: [{ label: 'Manage Team', href: '/team' }],
    followUps: ['How do I add team members?', 'How do I change permissions?'],
  },
  {
    keywords: ['report', 'reports', 'generate', 'export', 'pdf', 'download report'],
    answer: "You can generate all kinds of reports \u2014 project status, financial summaries, analytics, and more. Just visit the Reports section, pick the type of report you need, and use the filters to narrow things down by date range, project, or team. You can also export them as PDF or Excel.",
    links: [{ label: 'View Reports', href: '/reports' }],
    followUps: ['What types of reports can I create?', 'How do I track project budget?'],
  },
  {
    keywords: ['password', 'reset', 'change password', 'forgot password', 'security'],
    answer: "No worries, resetting your password is straightforward! Go to Settings, switch to the Security tab, click \"Change Password\", enter your current password and then your new one. After updating, your MFA codes will be refreshed too. Make sure to pick something strong!",
    links: [{ label: 'Go to Security', href: '/settings#security' }],
    followUps: ['How does MFA work?', 'I forgot my current password'],
  },
  {
    keywords: ['mfa', 'two factor', '2fa', 'authentication', 'otp', 'verification code', 'backup code'],
    answer: "MFA (Multi-Factor Authentication) adds an extra layer of security to your account. Once enabled, every time you log in, you\'ll receive a 6-digit verification code via email. You can find your backup codes in the Security tab of Settings \u2014 keep those safe in case you lose access to your email!",
    links: [{ label: 'Go to Security', href: '/settings#security' }],
    followUps: ['How do I reset my password?', 'How does login work?'],
  },
  {
    keywords: ['dashboard', 'home', 'overview', 'main page', 'start page'],
    answer: "Your dashboard is your command center! It shows you a real-time overview of active projects, budget trends with beautiful charts, team activity, and key metrics like total budget across countries. The analytics section lets you dig deeper into disbursement vs allocation by sector.",
    links: [{ label: 'Go to Dashboard', href: '/dashboard' }],
    followUps: ['What metrics are tracked?', 'How do I track project budget?'],
  },
  {
    keywords: ['settings', 'preferences', 'customize', 'personalize'],
    answer: "You can personalize quite a lot from Settings! It has 5 tabs: Profile for your personal info, Notifications for alert preferences, Security for password & MFA, Regional for language/timezone/currency, and Appearance for light/dark mode.",
    links: [{ label: 'Open Settings', href: '/settings' }, { label: 'Edit Profile', href: '/settings#profile' }],
    followUps: ['How do I enable dark mode?', 'How do I change my timezone?'],
  },
  {
    keywords: ['budget', 'disbursement', 'allocation', 'finance', 'fund', 'money', 'track budget'],
    answer: "Budget tracking gives you a clear picture of where funds are going. You\'ll find disbursement trend charts, sector allocation breakdowns (Infrastructure, Transport, Energy, Digital, Agriculture), and quarterly project pipeline data. It\'s all in the Analytics section, and you can export anything via Reports.",
    links: [{ label: 'View Analytics', href: '/dashboard' }, { label: 'Export Reports', href: '/reports' }],
    followUps: ['What sectors are tracked?', 'How do I generate reports?'],
  },
  {
    keywords: ['login', 'sign in', 'access', 'authenticate', 'can\'t log', 'cannot log', 'locked out'],
    answer: "Let\'s get you logged in! First, double-check your email and password. If MFA is enabled, look for the 6-digit code in your email. If you\'re still stuck, try the \"Forgot Password\" flow to reset your credentials. If your account is locked, your system administrator can help unlock it.",
    links: [{ label: 'Go to Login', href: '/login' }, { label: 'Go to Security', href: '/settings#security' }],
    followUps: ['How do I reset my password?', 'How does MFA work?'],
  },
  {
    keywords: ['help', 'support', 'contact', 'issue', 'problem', 'stuck', 'assist'],
    answer: "I\'m here to help! You can ask me anything about the platform \u2014 from creating projects to managing your team. If you need human assistance, just click \"Talk to our team\" below and one of our team members will be with you shortly. You can also check the User Manual for detailed guides.",
    links: [{ label: 'User Manual', href: 'https://afdb-beta.atradezone.ca/docs/user-manual.html' }],
    followUps: ['How do I create a project?', 'How do I add team members?'],
  },
  {
    keywords: ['analytics', 'chart', 'graph', 'data', 'insights', 'metrics', 'statistics'],
    answer: "Our analytics section is packed with insights! You\'ll find budget disbursement trends over time, sector allocation pie charts, and quarterly project pipeline bar charts. All charts are interactive \u2014 you can toggle series on/off and hover for details.",
    links: [{ label: 'View Dashboard', href: '/dashboard' }],
    followUps: ['What sectors are tracked?', 'How do I track project budget?'],
  },
  {
    keywords: ['notification', 'alert', 'notify', 'email notification'],
    answer: "You can customize your notification preferences from Settings. Just switch to the Notifications tab. Choose which events trigger email alerts, in-app notifications, or both. You can manage alerts for project updates, team changes, report generation, and more.",
    links: [{ label: 'Go to Notifications', href: '/settings#notifications' }],
    followUps: ['How do I change my email?', 'Where are settings?'],
  },
  {
    keywords: ['regional', 'language', 'timezone', 'currency', 'locale', 'region'],
    answer: "The Regional settings let you personalize your experience. Set your preferred language, timezone, and default currency. This affects how dates, numbers, and monetary values are displayed throughout the platform.",
    links: [{ label: 'Go to Regional', href: '/settings#regional' }],
    followUps: ['Where are settings?', 'How do I change my timezone?'],
  },
  {
    keywords: ['dark mode', 'light mode', 'theme', 'appearance', 'display'],
    answer: "Switching themes is easy! Go to Settings, switch to the Appearance tab, and toggle between Light and Dark mode. The entire platform adapts beautifully \u2014 all charts, tables, and navigation elements look great in both modes.",
    links: [{ label: 'Go to Appearance', href: '/settings#appearance' }],
    followUps: ['Where are settings?', 'How do I edit my profile?'],
  },
  {
    keywords: ['profile', 'edit profile', 'my info', 'personal info', 'change email', 'my email'],
    answer: "You can update your personal information from the Profile tab in Settings. There you can change your first name, last name, email, phone number, job title, department, and even add a profile photo.",
    links: [{ label: 'Edit Profile', href: '/settings#profile' }],
    followUps: ['Where are settings?', 'How do I change my password?'],
  },
  {
    keywords: ['sector', 'sectors', 'infrastructure', 'transport', 'energy', 'digital', 'agriculture', 'what sectors'],
    answer: "The platform tracks projects across 5 main sectors: Infrastructure (roads, bridges, utilities), Transport (railways, ports, airports), Energy (power generation, renewables), Digital (connectivity, ICT infrastructure), and Agriculture (food security, agribusiness). Each sector has its own allocation and disbursement charts on the dashboard.",
    links: [{ label: 'View Dashboard', href: '/dashboard' }],
    followUps: ['How do I track project budget?', 'Show me reports'],
  },
  {
    keywords: ['export', 'download', 'pdf', 'excel', 'csv'],
    answer: "You can export data in multiple formats! Go to the Reports section, generate the report you need, then use the export options to download as PDF or Excel. Financial reports, project status reports, and analytics data can all be exported.",
    links: [{ label: 'View Reports', href: '/reports' }],
    followUps: ['What types of reports can I create?', 'How do I track project budget?'],
  },
  {
    keywords: ['approve', 'approval', 'who can approve'],
    answer: "Project approvals are handled by users with Admin or Manager roles. When you submit a project, it goes into a pending approval state. An Admin or Manager will review the details and either approve or request changes. You\'ll be notified of the decision.",
    links: [{ label: 'Go to Projects', href: '/projects' }],
    followUps: ['What roles are available?', 'How do I create a project?'],
  },
];

const BOT_SUGGESTIONS = [
  'How do I create a project?',
  'How do I add team members?',
  'How do I reset my password?',
  'Show me reports',
  'How does MFA work?',
];

interface BotResponse {
  text: string;
  links?: BotLink[];
  followUps?: string[];
}

function getBotResponse(input: string): BotResponse {
  const lower = input.toLowerCase();
  let bestMatch: BotQA | null = null;
  let bestScore = 0;
  for (const qa of BOT_KNOWLEDGE) {
    const score = qa.keywords.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }
  if (bestScore > 0 && bestMatch) {
    return { text: bestMatch.answer, links: bestMatch.links, followUps: bestMatch.followUps };
  }
  return {
    text: "That\'s a great question! While I might not have the perfect answer for that specific topic, I can definitely help you with things like creating projects, managing your team, generating reports, adjusting settings, and understanding security features. Try asking about any of those, or connect with our team for more detailed help!",
    links: [{ label: 'Talk to our team', href: '#chat' }, { label: 'View all topics', href: '#suggestions' }],
  };
}

export default function FloatingChatWidget() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [usersState, setUsersState] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);

  // Bot state
  const [isBotMode, setIsBotMode] = useState(true);
  const [botMessages, setBotMessages] = useState<BotMessage[]>([
    {
      id: 'welcome',
      text: "Hi there! 👋 I'm your AfDB Assistant. I can help you navigate the platform, answer questions about projects, reports, team management, and more. What would you like to know?",
      links: [{ label: 'Go to Dashboard', href: '/dashboard' }, { label: 'View Projects', href: '/projects' }],
      isBot: true,
      created_at: new Date().toISOString(),
    },
  ]);
  const [botInput, setBotInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const botMessagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user on mount
  useEffect(() => {
    if (authUtils.isAuthenticated()) {
      setUser(authUtils.getUser());
    }
  }, []);

  // Load users/contacts on mount
  useEffect(() => {
    if (!user?.id) return;
    
    api.get('/messenger/contacts')
      .then((res) => {
        const contacts = res.data?.data || res.data || [];
        const mapped: ChatUser[] = contacts.map((c: any) => ({
          id: c.id,
          name: c.name || `${c.firstName} ${c.lastName}`.trim(),
          email: c.email,
          avatar: c.avatar,
          unread_count: 0,
          last_message: undefined,
          is_online: c.is_online || false,
        }));
        setUsersState(mapped);
      })
      .catch(() => {});
  }, [user?.id]);

  // Calculate total unread
  useEffect(() => {
    setTotalUnread(usersState.reduce((sum, u) => sum + (u.unread_count || 0), 0));
  }, [usersState]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && chatMessages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Scroll bot messages to bottom
  useEffect(() => {
    if (botMessagesEndRef.current) {
      botMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [botMessages, isBotTyping]);

  // Focus input when conversation opens
  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  // Load messages for a user
  const loadMessages = useCallback(async (userId: string | number) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/messenger/messages/${userId}?page=1&per_page=30`);
      const data = response.data?.data || response.data || [];
      const formatted: Message[] = data.map((m: any) => ({
        id: m.id,
        sender_id: m.from_id || m.sender_id,
        receiver_id: m.to_id || m.receiver_id,
        message: m.body || m.message,
        body: m.body || m.message,
        attachment: m.attachment,
        is_read: m.seen || m.is_read,
        created_at: m.created_at,
        sender: {
          id: m.from_user?.id || m.sender?.id || m.from_id,
          name: m.from_user?.name || m.sender?.name || 'User',
          email: m.from_user?.email || m.sender?.email || '',
          avatar: m.from_user?.avatar || m.sender?.avatar,
        },
        receiver: {
          id: m.to_user?.id || m.receiver?.id || m.to_id,
          name: m.to_user?.name || m.receiver?.name || 'User',
          email: m.to_user?.email || m.receiver?.email || '',
          avatar: m.to_user?.avatar || m.receiver?.avatar,
        },
      }));
      setChatMessages(formatted);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a user
  const handleSelectUser = (chatUser: ChatUser) => {
    setSelectedUser(chatUser);
    setChatMessages([]);
    // Mark as read
    setUsersState((prev) =>
      prev.map((u) => (u.id === chatUser.id ? { ...u, unread_count: 0 } : u))
    );
    loadMessages(chatUser.id);
  };

  // Go back: from conversation → bot mode; from bot → close
  const handleBack = () => {
    if (selectedUser) {
      setSelectedUser(null);
      setChatMessages([]);
    } else if (!isBotMode) {
      setIsBotMode(true);
    }
  };

  // Handle bot message send
  const handleBotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botInput.trim()) return;
    const userText = botInput.trim();
    setBotInput('');
    setBotMessages(prev => [...prev, { id: `user-${Date.now()}`, text: userText, isBot: false, created_at: new Date().toISOString() }]);
    setIsBotTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    const { text, links, followUps } = getBotResponse(userText);
    setIsBotTyping(false);
    setBotMessages(prev => [...prev, { id: `bot-${Date.now()}`, text, links, followUps, isBot: true, created_at: new Date().toISOString() }]);
  };

  // Handle quick suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    setBotMessages(prev => [...prev, { id: `user-${Date.now()}`, text: suggestion, isBot: false, created_at: new Date().toISOString() }]);
    setIsBotTyping(true);
    await new Promise(r => setTimeout(r, 800 + Math.random() * 700));
    const { text, links, followUps } = getBotResponse(suggestion);
    setIsBotTyping(false);
    setBotMessages(prev => [...prev, { id: `bot-${Date.now()}`, text, links, followUps, isBot: true, created_at: new Date().toISOString() }]);
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !user) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_id: user.id,
      receiver_id: selectedUser.id,
      message: newMessage.trim(),
      body: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      receiver: {
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        avatar: selectedUser.avatar,
      },
    };

    setChatMessages((prev) => [...prev, tempMessage]);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      await api.post('/messenger/send', {
        receiver_id: selectedUser.id,
        message: messageText,
      });
      setUsersState((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, last_message: { ...tempMessage, body: messageText } }
            : u
        )
      );
    } catch {
      setChatMessages((prev) =>
        prev.filter((msg) => msg.id.toString() !== tempMessage.id.toString())
      );
    }
  };

  // Poll for new messages
  useEffect(() => {
    if (!user?.id || !selectedUser) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(
          `/messenger/messages/${selectedUser.id}?page=1&per_page=5`
        );
        const data = response.data?.data || response.data || [];
        const formatted: Message[] = data.map((m: any) => ({
          id: m.id,
          sender_id: m.from_id || m.sender_id,
          receiver_id: m.to_id || m.receiver_id,
          message: m.body || m.message,
          body: m.body || m.message,
          attachment: m.attachment,
          is_read: m.seen || m.is_read,
          created_at: m.created_at,
          sender: {
            id: m.from_user?.id || m.sender?.id || m.from_id,
            name: m.from_user?.name || m.sender?.name || 'User',
            email: m.from_user?.email || m.sender?.email || '',
            avatar: m.from_user?.avatar || m.sender?.avatar,
          },
          receiver: {
            id: m.to_user?.id || m.receiver?.id || m.to_id,
            name: m.to_user?.name || m.receiver?.name || 'User',
            email: m.to_user?.email || m.receiver?.email || '',
            avatar: m.to_user?.avatar || m.receiver?.avatar,
          },
        }));

        // Add new messages that don't exist yet
        setChatMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id.toString()));
          const newMsgs = formatted.filter(
            (m) => !existingIds.has(m.id.toString())
          );
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
      } catch {
        // Silently fail polling
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [user?.id, selectedUser]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return usersState
      .filter(
        (chatUser) =>
          chatUser.name.toLowerCase().includes(searchLower) ||
          chatUser.email.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => {
        const aTime = new Date(a.last_message?.created_at || 0).getTime();
        const bTime = new Date(b.last_message?.created_at || 0).getTime();
        return bTime - aTime;
      });
  }, [usersState, searchQuery]);

  if (!user?.id) return null;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center bg-gradient-to-l from-[#009A44] to-[#006B2D] hover:from-[#007A35] hover:to-[#005A25]"
        >
          {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-7 w-7" />}
        </button>
        {/* Unread Badge */}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-white text-green-600 text-xs font-bold shadow-md border border-green-100">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-40 w-[400px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-12rem)] bg-white dark:bg-[rgb(15,15,15)] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shrink-0">
            {(selectedUser || (!isBotMode && !selectedUser)) && (
              <button
                onClick={handleBack}
                className="p-1 h-8 w-8 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {selectedUser ? (
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <div className="relative">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-white dark:ring-gray-700 shadow-sm">
                    {getInitial(selectedUser.name)}
                  </div>
                  {selectedUser.is_online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-700 shadow-sm" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                    {selectedUser.name}
                  </p>
                  <p
                    className={`text-[10px] font-medium ${
                      selectedUser.is_online
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {selectedUser.is_online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            ) : isBotMode ? (
              <div className="flex items-center gap-2.5 flex-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] flex items-center justify-center shadow-sm relative">
                  <Bot className="h-4 w-4 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-white dark:border-gray-700" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    AfDB Assistant
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  </h3>
                  <p className="text-[10px] font-medium text-green-600 dark:text-green-400">AI-Powered</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-1">
                <div className="h-8 w-8 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] flex items-center justify-center shadow-sm">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  Messages
                </h3>
              </div>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 h-8 w-8 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 flex items-center justify-center ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          {selectedUser ? (
            /* Messages View */
            <>
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-3 py-4 space-y-1 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-[rgb(15,15,15)]"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="h-6 w-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Loading messages...
                    </p>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        No messages yet
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message, index) => {
                    const isOwn = message.sender_id === user.id;
                    const prevMessage = chatMessages[index - 1];
                    const isFirstInGroup =
                      !prevMessage || prevMessage.sender_id !== message.sender_id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwn ? 'justify-end' : 'justify-start'
                        } ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}
                      >
                        <div
                          className={`max-w-[78%] px-3 py-1.5 text-sm relative ${
                            isOwn
                              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl rounded-br-md shadow-sm shadow-green-500/10'
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700/50'
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap leading-relaxed">
                            {message.message || message.body}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-0.5 text-[10px] ${
                              isOwn
                                ? 'text-white/60 justify-end'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            <span>
                              {new Date(message.created_at).toLocaleTimeString(
                                [],
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </span>
                            {isOwn &&
                              (message.is_read ? (
                                <CheckCheck className="h-3 w-3 text-green-200" />
                              ) : (
                                <Check className="h-3 w-3" />
                              ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700/50 bg-white/80 dark:bg-[rgb(15,15,15)]/80 backdrop-blur-sm">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 h-10 w-full rounded-full text-sm px-4 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-green-300 dark:focus:border-green-500 border transition-all text-gray-900 dark:text-gray-100 outline-none"
                      maxLength={1000}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="h-10 w-10 p-0 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] hover:from-[#007A35] hover:to-[#005A25] text-white shadow-md shadow-green-500/20 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          ) : isBotMode ? (
            /* AI Bot View */
            <>
              {/* Bot Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-[rgb(15,15,15)]" style={{ scrollbarWidth: 'thin' }}>
                {botMessages.map((msg, msgIndex) => (
                  <div key={msg.id}>
                    <div className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] ${msg.isBot ? 'order-1' : ''}`}>
                        {msg.isBot && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="h-5 w-5 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] flex items-center justify-center">
                              <Bot className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Assistant</span>
                          </div>
                        )}
                        <div className={`px-3 py-2 text-sm leading-relaxed ${
                          msg.isBot
                            ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700/50'
                            : 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl rounded-br-md shadow-sm'
                        }`}>
                          {msg.text}
                        </div>
                        {/* Page links */}
                        {msg.isBot && msg.links && msg.links.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.links.map((link, li) => (
                              <button
                                key={li}
                                onClick={() => {
                                  if (link.href === '#chat') {
                                    setIsBotMode(false);
                                  } else if (link.href === '#suggestions') {
                                    setBotMessages(prev => [...prev, { id: `bot-${Date.now()}`, text: "Here are some topics I can help you with! Pick any of these suggestions:", isBot: true, created_at: new Date().toISOString() }]);
                                  } else if (link.href.startsWith('http')) {
                                    window.open(link.href, '_blank');
                                  } else {
                                    router.push(link.href);
                                    setIsOpen(false);
                                  }
                                }}
                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors font-medium"
                              >
                                {link.label}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            ))}
                          </div>
                        )}
                        {/* Follow-up suggestions (only on last bot message) */}
                        {msg.isBot && msg.followUps && msg.followUps.length > 0 && msgIndex === botMessages.length - 1 && !isBotTyping && (
                          <div className="mt-2">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1 px-0.5">Related questions:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.followUps.map((fu) => (
                                <button
                                  key={fu}
                                  onClick={() => handleSuggestionClick(fu)}
                                  className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {fu}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className={`text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 ${msg.isBot ? 'text-left' : 'text-right'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isBotTyping && (
                  <div className="flex justify-start">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className="h-5 w-5 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] flex items-center justify-center">
                          <Bot className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Assistant</span>
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700/50 px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick suggestions (show after welcome or after "View all topics") */}
                {!isBotTyping && (botMessages.length <= 1 || (botMessages.length > 0 && botMessages[botMessages.length - 1].text.includes('Here are some topics'))) && (
                  <div className="space-y-2 mt-3">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium px-1">Suggested questions:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {BOT_SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestionClick(s)}
                          className="text-xs px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={botMessagesEndRef} />
              </div>

              {/* Bot Input + Actions */}
              <div className="border-t border-gray-100 dark:border-gray-700/30 shrink-0 bg-white/80 dark:bg-[rgb(15,15,15)]/80 backdrop-blur-sm">
                <form onSubmit={handleBotSend} className="flex items-center gap-2 p-3">
                  <div className="flex-1 relative">
                    <input
                      value={botInput}
                      onChange={(e) => setBotInput(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 h-10 w-full rounded-full text-sm px-4 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-green-300 dark:focus:border-green-500 border transition-all text-gray-900 dark:text-gray-100 outline-none"
                      maxLength={500}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!botInput.trim()}
                    className="h-10 w-10 p-0 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] hover:from-[#007A35] hover:to-[#005A25] text-white shadow-md shadow-green-500/20 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                {/* Talk to team button */}
                <div className="px-3 pb-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsBotMode(false)}
                    className="flex-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 transition-colors"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Talk to our team
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsOpen(false); router.push('/chat'); }}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/40 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Conversations List */
            <>
              {/* Search */}
              <div className="px-3 py-2.5 shrink-0 border-b border-gray-100 dark:border-gray-700/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-9 h-9 text-sm rounded-xl bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-green-300 dark:focus:border-green-500 border transition-all text-gray-900 dark:text-gray-100 outline-none"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {filteredUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 flex items-center justify-center mb-4">
                      <MessageCircle className="h-10 w-10 text-green-400/60" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      No conversations yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Start chatting with someone!
                    </p>
                  </div>
                ) : (
                  <div className="py-1">
                    {filteredUsers.map((chatUser) => (
                      <button
                        key={chatUser.id}
                        type="button"
                        onClick={() => handleSelectUser(chatUser)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800 transition-all text-left group"
                      >
                        <div className="relative shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-700 shadow-sm">
                            {getInitial(chatUser.name)}
                          </div>
                          {chatUser.is_online && (
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-[2.5px] border-white dark:border-gray-700 shadow-sm" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                              {chatUser.name}
                            </p>
                            {chatUser.last_message && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 ml-2 tabular-nums">
                                {new Date(
                                  chatUser.last_message.created_at
                                ).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <p
                              className={`text-xs truncate ${
                                chatUser.unread_count > 0
                                  ? 'text-gray-800 dark:text-gray-200 font-medium'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {chatUser.last_message ? (
                                chatUser.last_message.message ||
                                chatUser.last_message.body ||
                                '📎 Attachment'
                              ) : (
                                <span className="italic text-gray-400 dark:text-gray-500/60">
                                  No messages yet
                                </span>
                              )}
                            </p>
                            {chatUser.unread_count > 0 && (
                              <span className="ml-2 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] text-white text-[10px] font-bold shrink-0 shadow-sm">
                                {chatUser.unread_count > 9
                                  ? '9+'
                                  : chatUser.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer link */}
              <div className="px-3 py-2.5 border-t border-gray-100 dark:border-gray-700/30 shrink-0 bg-gray-50/50 dark:bg-gray-800/20 flex gap-2">
                <button
                  onClick={() => setIsBotMode(true)}
                  className="flex-1 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium flex items-center justify-center gap-1.5 py-1 transition-colors"
                >
                  <Bot className="h-3.5 w-3.5" />
                  AI Assistant
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/chat');
                  }}
                  className="flex-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium flex items-center justify-center gap-1.5 py-1 transition-colors"
                >
                  Open full messenger
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
