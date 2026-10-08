import { useEffect, useRef, useState } from "react";
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

interface Customer {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

function AdminSupport() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const conversationsRef = useRef<
    Conversation[]
  >([]);

  const [customers, setCustomers] = useState<
    Record<string, Customer>
  >({});

  const [messages, setMessages] = useState<Message[]>(
    []
  );

  const [unreadCounts, setUnreadCounts] =
    useState<Record<string, number>>({});

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  /*
   * Load conversations and unread counts once.
   * Realtime channels stay active without being
   * recreated whenever state changes.
   */
  useEffect(() => {
    fetchConversations();
    fetchUnreadCounts();

    const conversationChannel = supabase
      .channel("admin-support-conversations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const messageChannel = supabase
      .channel("admin-support-unread-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage =
            payload.new as Message;

          const conversation =
            conversationsRef.current.find(
              (item) =>
                item.id ===
                newMessage.conversation_id
            );

          if (
            conversation &&
            newMessage.sender_id ===
              conversation.customer_id &&
            !newMessage.is_read
          ) {
            setUnreadCounts((current) => ({
              ...current,
              [newMessage.conversation_id]:
                (current[
                  newMessage.conversation_id
                ] || 0) + 1,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        conversationChannel
      );

      supabase.removeChannel(messageChannel);
    };
  }, []);

  /*
   * Fetch all conversations.
   */
  const fetchConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error fetching conversations:",
        error.message
      );

      setLoading(false);
      return;
    }

    const conversationData =
      data || [];

    setConversations(conversationData);

    // Keep the ref synchronized so realtime
    // subscriptions always have current data.
    conversationsRef.current =
      conversationData;

    if (conversationData.length > 0) {
      const customerIds = [
        ...new Set(
          conversationData.map(
            (conversation) =>
              conversation.customer_id
          )
        ),
      ];

      const {
        data: customerData,
        error: customerError,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone"
        )
        .in("id", customerIds);

      if (customerError) {
        console.error(
          "Error fetching customers:",
          customerError.message
        );
      } else {
        const customerMap: Record<
          string,
          Customer
        > = {};

        (customerData || []).forEach(
          (customer) => {
            customerMap[customer.id] =
              customer;
          }
        );

        setCustomers(customerMap);
      }
    }

    setLoading(false);
  };

  /*
   * Fetch all unread customer messages.
   */
  const fetchUnreadCounts = async () => {
    const {
      data: unreadMessages,
      error,
    } = await supabase
      .from("messages")
      .select(
        "id, conversation_id, sender_id, is_read"
      )
      .eq("is_read", false);

    if (error) {
      console.error(
        "Error fetching unread messages:",
        error.message
      );
      return;
    }

    if (!unreadMessages?.length) {
      setUnreadCounts({});
      return;
    }

    const conversationIds = [
      ...new Set(
        unreadMessages.map(
          (item) =>
            item.conversation_id
        )
      ),
    ];

    const {
      data: conversationData,
      error: conversationError,
    } = await supabase
      .from("conversations")
      .select("id, customer_id")
      .in(
        "id",
        conversationIds
      );

    if (conversationError) {
      console.error(
        "Error fetching conversations:",
        conversationError.message
      );
      return;
    }

    const customerMap: Record<
      string,
      string
    > = {};

    (conversationData || []).forEach(
      (conversation) => {
        customerMap[
          conversation.id
        ] =
          conversation.customer_id;
      }
    );

    const counts: Record<
      string,
      number
    > = {};

    unreadMessages.forEach(
      (item) => {
        const customerId =
          customerMap[
            item.conversation_id
          ];

        // Only customer messages count as
        // unread for the admin.
        if (
          customerId &&
          item.sender_id ===
            customerId
        ) {
          counts[
            item.conversation_id
          ] =
            (counts[
              item.conversation_id
            ] || 0) + 1;
        }
      }
    );

    setUnreadCounts(counts);
  };

  /*
   * Open a conversation and load its messages.
   */
  const openConversation = async (
    conversation: Conversation
  ) => {
    setSelectedConversation(
      conversation
    );

    const {
      data,
      error,
    } = await supabase
      .from("messages")
      .select("*")
      .eq(
        "conversation_id",
        conversation.id
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

    /*
     * Mark CUSTOMER messages as read.
     */
    const {
      error: readError,
    } = await supabase
      .from("messages")
      .update({
        is_read: true,
      })
      .eq(
        "conversation_id",
        conversation.id
      )
      .eq(
        "sender_id",
        conversation.customer_id
      )
      .eq(
        "is_read",
        false
      );

    if (readError) {
      console.error(
        "Error marking messages as read:",
        readError.message
      );
    }

    // Remove unread badge.
    setUnreadCounts((current) => {
      const updated = {
        ...current,
      };

      delete updated[
        conversation.id
      ];

      return updated;
    });
  };

  /*
   * Realtime messages for the selected conversation.
   */
  useEffect(() => {
    if (!selectedConversation) {
      return;
    }

    const channel = supabase
      .channel(
        `admin-support-${selectedConversation.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const newMessage =
            payload.new as Message;

          setMessages((current) => {
            if (
              current.some(
                (item) =>
                  item.id ===
                  newMessage.id
              )
            ) {
              return current;
            }

            return [
              ...current,
              newMessage,
            ];
          });

          /*
           * If a customer sends a message while
           * admin has the conversation open,
           * immediately mark it as read.
           */
          if (
            newMessage.sender_id ===
              selectedConversation.customer_id &&
            !newMessage.is_read
          ) {
            supabase
              .from("messages")
              .update({
                is_read: true,
              })
              .eq(
                "id",
                newMessage.id
              )
              .then(({ error }) => {
                if (error) {
                  console.error(
                    "Error marking message as read:",
                    error.message
                  );
                }
              });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [selectedConversation]);

  /*
   * Send admin reply.
   */
  const sendMessage = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const text =
      message.trim();

    if (
      !text ||
      !selectedConversation
    ) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert(
        "Admin session not found."
      );
      return;
    }

    setSending(true);

    const {
      error,
    } = await supabase
      .from("messages")
      .insert({
        conversation_id:
          selectedConversation.id,
        sender_id:
          user.id,
        content: text,
        is_read: true,
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

    await supabase
      .from("conversations")
      .update({
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        selectedConversation.id
      );
  };

  /*
   * Resolve or reopen conversation.
   */
  const updateConversationStatus =
    async (
      status:
        | "open"
        | "resolved"
    ) => {
      if (
        !selectedConversation
      ) {
        return;
      }

      const {
        error,
      } = await supabase
        .from("conversations")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          selectedConversation.id
        );

      if (error) {
        alert(
          `Unable to update conversation: ${error.message}`
        );
        return;
      }

      const updatedConversation =
        {
          ...selectedConversation,
          status,
          updated_at:
            new Date().toISOString(),
        };

      setSelectedConversation(
        updatedConversation
      );

      setConversations(
        (current) =>
          current.map(
            (conversation) =>
              conversation.id ===
              selectedConversation.id
                ? updatedConversation
                : conversation
          )
      );

      conversationsRef.current =
        conversationsRef.current.map(
          (conversation) =>
            conversation.id ===
            selectedConversation.id
              ? updatedConversation
              : conversation
        );
    };

  const selectedCustomer =
    selectedConversation
      ? customers[
          selectedConversation
            .customer_id
        ]
      : null;

  const totalUnread =
    Object.values(
      unreadCounts
    ).reduce(
      (total, count) =>
        total + count,
      0
    );

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading support conversations...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Support Center
              </h1>

              <p className="text-gray-500 mt-1">
                Manage customer support
                conversations.
              </p>
            </div>

            {totalUnread > 0 && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
                {totalUnread} unread{" "}
                {totalUnread === 1
                  ? "message"
                  : "messages"}
              </div>
            )}

          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden flex flex-col md:flex-row min-h-[650px]">

          {/* Conversation List */}
          <div className="w-full md:w-1/3 border-r">

            <div className="p-5 border-b">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-semibold text-lg">
                    Conversations
                  </h2>

                  <p className="text-sm text-gray-500">
                    {conversations.length}{" "}
                    total
                  </p>
                </div>

                {totalUnread > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {totalUnread}
                  </span>
                )}

              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">

              {conversations.length ===
              0 ? (
                <div className="p-8 text-center text-gray-500">
                  No support conversations
                  yet.
                </div>
              ) : (
                conversations.map(
                  (conversation) => {
                    const customer =
                      customers[
                        conversation
                          .customer_id
                      ];

                    const isSelected =
                      selectedConversation?.id ===
                      conversation.id;

                    const unread =
                      unreadCounts[
                        conversation.id
                      ] || 0;

                    return (
                      <button
                        key={
                          conversation.id
                        }
                        onClick={() =>
                          openConversation(
                            conversation
                          )
                        }
                        className={`w-full text-left p-5 border-b hover:bg-gray-50 transition ${
                          isSelected
                            ? "bg-emerald-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0 flex-1">

                            <div className="flex items-center gap-2">

                              <p className="font-semibold truncate">
                                {customer?.full_name ||
                                  "Unknown Customer"}
                              </p>

                              {unread > 0 && (
                                <span className="shrink-0 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                  {unread}
                                </span>
                              )}

                            </div>

                            <p className="text-sm text-gray-500 truncate">
                              {customer?.email ||
                                "No email"}
                            </p>

                          </div>

                          <span
                            className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium ${
                              conversation.status ===
                              "open"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {
                              conversation.status
                            }
                          </span>

                        </div>

                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(
                            conversation.updated_at
                          ).toLocaleString()}
                        </p>

                      </button>
                    );
                  }
                )
              )}

            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col">

            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">

                <div>

                  <div className="text-5xl mb-4">
                    💬
                  </div>

                  <h2 className="text-xl font-semibold">
                    Select a conversation
                  </h2>

                  <p className="text-gray-500 mt-2">
                    Choose a customer
                    conversation to view
                    and respond.
                  </p>

                </div>

              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="p-5 border-b flex items-center justify-between gap-4">

                  <div>
                    <h2 className="font-bold text-lg">
                      {selectedCustomer?.full_name ||
                        "Unknown Customer"}
                    </h2>

                    <p className="text-sm text-gray-500">
                      {selectedCustomer?.email ||
                        selectedCustomer?.phone ||
                        "Customer"}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      updateConversationStatus(
                        selectedConversation.status ===
                          "open"
                          ? "resolved"
                          : "open"
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedConversation.status ===
                      "open"
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {selectedConversation.status ===
                    "open"
                      ? "Resolve"
                      : "Re-open"}
                  </button>

                </div>

                {/* Messages */}
                <div className="flex-1 h-[480px] overflow-y-auto p-6 space-y-4">

                  {messages.length ===
                  0 ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      No messages yet.
                    </div>
                  ) : (
                    messages.map(
                      (item) => {
                        const isCustomer =
                          item.sender_id ===
                          selectedConversation.customer_id;

                        return (
                          <div
                            key={item.id}
                            className={`flex ${
                              isCustomer
                                ? "justify-start"
                                : "justify-end"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                isCustomer
                                  ? "bg-gray-100 text-gray-900 rounded-bl-md"
                                  : "bg-emerald-600 text-white rounded-br-md"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">
                                {
                                  item.content
                                }
                              </p>

                              <p
                                className={`text-xs mt-1 ${
                                  isCustomer
                                    ? "text-gray-500"
                                    : "text-emerald-100"
                                }`}
                              >
                                {new Date(
                                  item.created_at
                                ).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}

                </div>

                {/* Reply Box */}
                {selectedConversation.status ===
                "open" ? (
                  <form
                    onSubmit={
                      sendMessage
                    }
                    className="border-t p-4 flex gap-3"
                  >

                    <input
                      type="text"
                      value={message}
                      onChange={(e) =>
                        setMessage(
                          e.target.value
                        )
                      }
                      placeholder="Reply to customer..."
                      disabled={sending}
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      type="submit"
                      disabled={
                        sending ||
                        !message.trim()
                      }
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {sending
                        ? "Sending..."
                        : "Send"}
                    </button>

                  </form>
                ) : (
                  <div className="border-t p-4 text-center text-gray-500">
                    This conversation is
                    resolved. Re-open it to
                    reply.
                  </div>
                )}

              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default AdminSupport;