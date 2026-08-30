'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/lib/auth';
import api from '@/lib/api';
import { User } from '@/types';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PageLoader from '@/components/ui/PageLoader';
import {
  MessageCircle,
  Send,
  Search,
  X,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Image,
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

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [usersState, setUsersState] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user on mount
  useEffect(() => {
    if (!authUtils.isAuthenticated()) {
      router.push('/login');
      return;
    }
    setUser(authUtils.getUser());
    setIsLoadingPage(false);
  }, [router]);

  // Load users/contacts on mount
  useEffect(() => {
    if (!user?.id) return;

    api
      .get('/messenger/contacts')
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current && chatMessages.length > 0) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

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
      const response = await api.get(`/messenger/messages/${userId}?page=1&per_page=50`);
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
    setUsersState((prev) =>
      prev.map((u) => (u.id === chatUser.id ? { ...u, unread_count: 0 } : u))
    );
    loadMessages(chatUser.id);
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

        setChatMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id.toString()));
          const newMsgs = formatted.filter((m) => !existingIds.has(m.id.toString()));
          return newMsgs.length > 0 ? [...prev, ...newMsgs] : prev;
        });
      } catch {
        // Silently fail
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

  if (isLoadingPage || !user) return <PageLoader />;

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <AuthenticatedLayout>
      <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-[rgb(15,15,15)] rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Left Sidebar - Conversations List */}
        <div className="w-full md:w-[360px] lg:w-[400px] border-r border-gray-100 dark:border-gray-700 flex flex-col shrink-0">
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Messages</h2>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                  <MessageCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 h-9 text-sm rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:border-green-300 dark:focus:border-green-500 transition-all text-gray-900 dark:text-gray-100 outline-none"
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
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-left group ${
                      selectedUser?.id === chatUser.id
                        ? 'bg-green-50 dark:bg-green-950/20 border-r-2 border-green-500'
                        : ''
                    }`}
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
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {chatUser.name}
                        </p>
                        {chatUser.last_message && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0 ml-2 tabular-nums">
                            {new Date(chatUser.last_message.created_at).toLocaleTimeString([], {
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
                            {chatUser.unread_count > 9 ? '9+' : chatUser.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat Area */}
        <div className="hidden md:flex flex-1 flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shrink-0">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-700 shadow-sm">
                    {getInitial(selectedUser.name)}
                  </div>
                  {selectedUser.is_online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-700 shadow-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                    <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                    <Video className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                    <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-[rgb(15,15,15)]"
                style={{ scrollbarWidth: 'thin' }}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="h-6 w-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Loading messages...</p>
                  </div>
                ) : chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <MessageCircle className="h-10 w-10 text-gray-300 dark:text-gray-600" />
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
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                          isFirstInGroup ? 'mt-3' : 'mt-0.5'
                        }`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 text-sm relative ${
                            isOwn
                              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl rounded-br-md shadow-sm shadow-green-500/10'
                              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700/50'
                          }`}
                        >
                          <p className="break-words whitespace-pre-wrap leading-relaxed">
                            {message.message || message.body}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-1 text-[10px] ${
                              isOwn
                                ? 'text-white/60 justify-end'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}
                          >
                            <span>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
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

              {/* Message Input */}
              <div className="border-t border-gray-100 dark:border-gray-700/50 bg-white dark:bg-[rgb(15,15,15)] shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4">
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Paperclip className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 h-11 w-full rounded-full text-sm px-5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-700 focus:border-green-300 dark:focus:border-green-500 transition-all text-gray-900 dark:text-gray-100 outline-none"
                      maxLength={2000}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Smile className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="h-11 w-11 p-0 rounded-full bg-gradient-to-l from-[#009A44] to-[#006B2D] hover:from-[#007A35] hover:to-[#005A25] text-white shadow-md shadow-green-500/20 transition-all disabled:opacity-40 disabled:shadow-none flex items-center justify-center"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-800/50 dark:to-[rgb(15,15,15)]">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 flex items-center justify-center mb-6">
                <MessageCircle className="h-12 w-12 text-green-400/60" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to Messages
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
                Select a conversation from the sidebar to start chatting with your team members.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
