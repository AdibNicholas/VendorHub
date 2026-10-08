import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Conversation {
  id: string;
  customer_id: string;
  assigned_admin_id: string | null;
  status: "open" | "resolved";
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

function Support() {
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    const startChat = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      // Get the latest open conversation
      const { data: existingConversation, error } =
        await supabase
          .from("conversations")
          .select("*")
          .eq("customer_id", user.id)
          .eq("status", "open")
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (error) {
        console.error(
          "Error finding conversation:",
          error.message
        );

        if (mounted) setLoading(false);
        return;
      }

      let currentConversation =
        existingConversation;

      // Create a conversation only if one doesn't exist
      if (!currentConversation) {
        const { data: newConversation, error: createError } =
          await supabase
            .from("conversations")
            .insert({
              customer_id: user.id,
            })
            .select()
            .single();

        if (createError) {
          console.error(
            "Error creating conversation:",
            createError.message
          );

          if (mounted) setLoading(false);
          return;
        }

        currentConversation = newConversation;
      }

      if (!mounted) return;

      setConversation(currentConversation);

      await fetchMessages(currentConversation.id);

      if (mounted) {
        setLoading(false);
      }
    };

    startChat();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchMessages = async (
    conversationId: string
  ) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq(
        "conversation_id",
        conversationId
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error fetching messages:",
        error.message
      );
      return;
    }

    setMessages(data || []);
  };

  // Real-time messages
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(
        `support-chat-${conversation.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newMessage =
            payload.new as Message;

          setMessages((current) => {
            if (
              current.some(
                (item) =>
                  item.id === newMessage.id
              )
            ) {
              return current;
            }

            return [
              ...current,
              newMessage,
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  const sendMessage = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const text = message.trim();

    if (!text || !conversation) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please log in first.");
      return;
    }

    setSending(true);

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id:
          conversation.id,
        sender_id: user.id,
        content: text,
      });

    if (error) {
      console.error(
        "Error sending message:",
        error.message
      );

      alert(
        `Unable to send message: ${error.message}`
      );

      setSending(false);
      return;
    }

    setMessage("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading support chat...
        </p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Unable to start support chat.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm p-6 border-b">
          <div className="flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                VendorHub Support
              </h1>

              <p className="text-gray-500 mt-1">
                We're here to help.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>

              <span className="text-sm text-gray-600">
                Support Online
              </span>
            </div>

          </div>
        </div>

        {/* Chat */}
        <div className="bg-white shadow-sm">

          <div className="h-[500px] overflow-y-auto p-6 space-y-4">

            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center">
                <div>

                  <div className="text-5xl mb-4">
                    💬
                  </div>

                  <h2 className="text-xl font-semibold">
                    How can we help?
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Send us a message and our
                    support team will respond.
                  </p>

                </div>
              </div>
            ) : (
              messages.map((item) => {
                const isMine =
                  item.sender_id ===
                  conversation.customer_id;

                return (
                  <div
                    key={item.id}
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isMine
                          ? "bg-emerald-600 text-white rounded-br-md"
                          : "bg-gray-100 text-gray-900 rounded-bl-md"
                      }`}
                    >

                      <p className="whitespace-pre-wrap">
                        {item.content}
                      </p>

                      <p
                        className={`text-xs mt-1 ${
                          isMine
                            ? "text-emerald-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(
                          item.created_at
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                    </div>
                  </div>
                );
              })
            )}

          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="border-t p-4 flex gap-3"
          >

            <input
              type="text"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Type your message..."
              disabled={sending}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={
                sending ||
                !message.trim()
              }
              className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending
                ? "Sending..."
                : "Send"}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}

export default Support;