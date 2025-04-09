import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { apiFetch, API_URL } from "@/utils/api";
import Layout from "@/components/Layout";
import { Loader2, Send } from "lucide-react";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { id: communityId } = router.query;

  const [community, setCommunity] = useState(null);
  const [communityError, setCommunityError] = useState("");
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  const [messages, setMessages] = useState([]);
  const [messagesError, setMessagesError] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [newMessage, setNewMessage] = useState("");
  const [sendError, setSendError] = useState("");

  const socketRef = useRef(null);

  const fetchCommunity = async () => {
    setLoadingCommunity(true);
    setCommunityError("");
    try {
      const data = await apiFetch(`/api/communities/${communityId}`, { method: "GET" });
      setCommunity(data);
    } catch (err) {
      console.error("Error fetching community:", err);
      setCommunityError("Failed to load community information.");
    } finally {
      setLoadingCommunity(false);
    }
  };

  const fetchMessages = async () => {
    setLoadingMessages(true);
    setMessagesError("");
    try {
      const res = await apiFetch(`/api/messages/community/${communityId}?limit=50`);
      const msgs = (res.messages || []).reverse();
      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setMessagesError("Failed to load messages. Please try again later.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMessages();
    }
  }, [communityId]);

  useEffect(() => {
    if (!communityId) return;
    const socketBase = API_URL.replace("/api", "");
    socketRef.current = io(socketBase, { transports: ["websocket"] });
    socketRef.current.emit("joinCommunity", communityId);
    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leaveCommunity", communityId);
        socketRef.current.disconnect();
      }
    };
  }, [communityId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendError("");
    if (!newMessage.trim()) return;
    try {
      const body = {
        community_id: communityId,
        message: newMessage,
      };
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify(body),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setSendError("Failed to send your message. Please try again.");
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Community Header */}
        {loadingCommunity ? (
          <div className="flex items-center gap-2 text-gray-300 text-xl font-medium">
            <Loader2 className="animate-spin" />
            Loading community...
          </div>
        ) : communityError ? (
          <div className="p-4 bg-red-800 text-red-200 border border-red-600 rounded-lg">
            {communityError}
          </div>
        ) : community ? (
          <section className="space-y-2">
            <h1 className="text-4xl font-extrabold text-white">{community.name}</h1>
            <p className="text-lg text-gray-400">{community.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {community.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-blue-800 text-blue-100 text-sm font-semibold px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-2xl text-gray-300">Community not found.</p>
        )}

        {/* Messages */}
        <section className="bg-zinc-800 border border-gray-700 rounded-2xl shadow-sm h-[30rem] overflow-y-auto p-6">
          {loadingMessages ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="animate-spin" />
              Loading messages...
            </div>
          ) : messagesError ? (
            <div className="p-3 bg-red-800 border border-red-600 text-red-200 rounded-lg">
              {messagesError}
            </div>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 italic">No messages yet. Be the first to say something!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="mb-6">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-base font-semibold text-white">
                    {msg.sender_id?.first_name || "Unknown"} {msg.sender_id?.last_name || ""}
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed">{msg.message}</p>
              </div>
            ))
          )}
        </section>

        {/* Error on Send */}
        {sendError && (
          <div className="p-3 bg-red-800 border border-red-600 text-red-200 rounded-lg">
            {sendError}
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-600 rounded-xl shadow-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow"
          >
            <Send size={18} />
            Send
          </button>
        </form>
      </div>
    </Layout>
  );
}
