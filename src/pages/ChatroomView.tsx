import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  room_id: string;
  user_id: string;
  message_text: string;
  is_bot: boolean;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

interface Chatroom {
  id: string;
  name: string;
  description: string;
}

export default function ChatroomView() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatroom, setChatroom] = useState<Chatroom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [oldestTimestamp, setOldestTimestamp] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    loadChatroomAndMessages();
    const cleanup = subscribeToMessages();
    return cleanup;
  }, [roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatroomAndMessages = async () => {
    try {
      console.log('Loading chatroom with roomId:', roomId);

      const { data: chatroomData, error: chatroomError } = await supabase
        .from('chatrooms')
        .select('id, name, description')
        .eq('id', roomId)
        .maybeSingle();

      console.log('Chatroom query result:', { data: chatroomData, error: chatroomError });

      if (chatroomError) {
        console.error('Chatroom error:', chatroomError);
        throw chatroomError;
      }

      if (!chatroomData) {
        console.warn('No chatroom found for id:', roomId);
        setError('Chatroom not found');
        setLoading(false);
        return;
      }

      setChatroom(chatroomData);

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      console.log('Loading initial messages after:', twentyFourHoursAgo);

      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: true });

      const { count: totalCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', roomId)
        .lt('created_at', twentyFourHoursAgo);

      console.log('Older messages count check:', {
        totalCount,
        twentyFourHoursAgo,
        hasMore: (totalCount || 0) > 0
      });

      setHasMoreMessages((totalCount || 0) > 0);

      console.log('Messages query result:', { count: messagesData?.length, error: messagesError });

      if (messagesError) {
        console.error('Messages error:', messagesError);
        throw messagesError;
      }

      if (messagesData && messagesData.length > 0) {
        const userIds = [...new Set(messagesData.map(m => m.user_id).filter(Boolean))];

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);

          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

          const enrichedMessages = messagesData.map(msg => ({
            ...msg,
            profiles: msg.user_id ? profilesMap.get(msg.user_id) : null
          }));

          setMessages(enrichedMessages);
          if (enrichedMessages.length > 0) {
            setOldestTimestamp(enrichedMessages[0].created_at);
          }
        } else {
          setMessages(messagesData);
          if (messagesData.length > 0) {
            setOldestTimestamp(messagesData[0].created_at);
          }
        }
      } else {
        setMessages([]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading chatroom:', err);
      setError('Failed to load chatroom');
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    console.log('Subscribing to messages for room:', roomId);
    const channel = supabase
      .channel(`chatroom-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          console.log('New message received via subscription:', payload);
          const newMsg = payload.new as Message;

          setMessages((current) => {
            const exists = current.some(msg => msg.id === newMsg.id || (msg.user_id === newMsg.user_id && msg.message_text === newMsg.message_text && msg.id.startsWith('temp-')));
            if (exists) {
              return current.map(msg => {
                if (msg.id.startsWith('temp-') && msg.user_id === newMsg.user_id && msg.message_text === newMsg.message_text) {
                  return newMsg;
                }
                return msg;
              });
            }

            return [...current, newMsg];
          });

          const { data: profileData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', newMsg.user_id)
            .maybeSingle();

          if (profileData) {
            setMessages((current) =>
              current.map(msg =>
                msg.id === newMsg.id
                  ? { ...msg, profiles: profileData }
                  : msg
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMoreMessages = async () => {
    if (!roomId || !oldestTimestamp || loadingMore) {
      console.log('Load more blocked:', { roomId, oldestTimestamp, loadingMore });
      return;
    }

    setLoadingMore(true);
    const scrollContainer = messagesContainerRef.current;
    const scrollHeightBefore = scrollContainer?.scrollHeight || 0;

    try {
      const endTime = new Date(oldestTimestamp);
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

      console.log('Loading messages between:', {
        startTime: startTime.toISOString(),
        endTime: oldestTimestamp,
        roomId
      });

      const { data: olderMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .gte('created_at', startTime.toISOString())
        .lt('created_at', oldestTimestamp)
        .order('created_at', { ascending: true });

      console.log('Older messages result:', {
        count: olderMessages?.length,
        error: messagesError,
        messages: olderMessages
      });

      if (messagesError) throw messagesError;

      if (olderMessages && olderMessages.length > 0) {
        const userIds = [...new Set(olderMessages.map(m => m.user_id).filter(Boolean))];

        if (userIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);

          const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

          const enrichedMessages = olderMessages.map(msg => ({
            ...msg,
            profiles: msg.user_id ? profilesMap.get(msg.user_id) : null
          }));

          console.log('Adding enriched messages to state:', enrichedMessages.length);
          setMessages(current => {
            console.log('Current messages count:', current.length);
            const newMessages = [...enrichedMessages, ...current];
            console.log('New messages count:', newMessages.length);
            return newMessages;
          });
          setOldestTimestamp(enrichedMessages[0].created_at);
        } else {
          console.log('Adding messages without profiles:', olderMessages.length);
          setMessages(current => {
            console.log('Current messages count:', current.length);
            const newMessages = [...olderMessages, ...current];
            console.log('New messages count:', newMessages.length);
            return newMessages;
          });
          setOldestTimestamp(olderMessages[0].created_at);
        }

        const { count: remainingCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', roomId)
          .lt('created_at', startTime.toISOString());

        setHasMoreMessages((remainingCount || 0) > 0);

        setTimeout(() => {
          if (scrollContainer) {
            const scrollHeightAfter = scrollContainer.scrollHeight;
            scrollContainer.scrollTop = scrollHeightAfter - scrollHeightBefore;
          }
        }, 50);
      } else {
        console.log('No older messages found, hiding button');
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error('Error loading more messages:', err);
      alert('Error loading more messages: ' + (err as Error).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !roomId) return;

    const messageText = newMessage.trim();
    setSending(true);
    setNewMessage('');

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      room_id: roomId,
      user_id: user.id,
      message_text: messageText,
      is_bot: false,
      created_at: new Date().toISOString(),
      profiles: {
        display_name: user.user_metadata?.display_name || user.email || 'You'
      }
    };

    setMessages((current) => [...current, optimisticMessage]);

    try {
      console.log('Sending message:', { room_id: roomId, user_id: user.id, message_text: messageText });

      const { data, error: insertError } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: user.id,
          message_text: messageText,
          is_bot: false
        })
        .select()
        .single();

      console.log('Insert result:', { data, error: insertError });

      if (insertError) {
        console.error('Insert error details:', insertError);
        setMessages((current) => current.filter(msg => msg.id !== tempId));
        throw insertError;
      }

      setMessages((current) =>
        current.map(msg => msg.id === tempId ? { ...data, profiles: optimisticMessage.profiles } : msg)
      );
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDisplayName = (message: Message) => {
    if (message.profiles?.display_name) {
      return message.profiles.display_name;
    }
    return 'Anonymous User';
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-12 flex items-center justify-center">
        <div className="text-white">Loading chatroom...</div>
      </div>
    );
  }

  if (error || !chatroom) {
    return (
      <div className="min-h-screen pb-12">
        <button
          onClick={() => navigate('/chatroom')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Chatrooms
        </button>
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Chatroom not found</h2>
          <p className="text-slate-400">The chatroom you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="chatroomWrapper" style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700" style={{ flexShrink: 0 }}>
        <button
          onClick={() => navigate('/chatroom')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Chatrooms
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-white">{chatroom.name}</h1>
          <p className="text-sm text-slate-400">{chatroom.description}</p>
        </div>
        <div className="w-32"></div>
      </div>

      <div className="bg-slate-900 border-x border-slate-700" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        <div id="messagesContainer" ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', height: '100%' }} className="p-6 space-y-4">
          {hasMoreMessages && (
            <div className="text-center pb-4">
              <button
                onClick={loadMoreMessages}
                disabled={loadingMore}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Loading...' : 'Load previous 24 hours'}
              </button>
            </div>
          )}
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-12">
              <p>No messages yet. Be the first to say something!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.user_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${isCurrentUser ? 'bg-orange-600' : 'bg-slate-800'} rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-slate-300">
                        {isCurrentUser ? 'You' : getDisplayName(message)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-white break-words">{message.message_text}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700" style={{ flexShrink: 0 }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 flex items-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
