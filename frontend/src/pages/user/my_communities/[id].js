// UI-Only Updated CommunityDetailPage
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { apiFetch, API_URL } from "@/utils/api";
import Layout from "@/components/Layout";

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
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Community Info */}
        {loadingCommunity ? (
          <h1 className="text-3xl font-semibold text-gray-800">Loading Community...</h1>
        ) : communityError ? (
          <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {communityError}
          </div>
        ) : community ? (
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">{community.name}</h1>
            <p className="text-gray-600">{community.description}</p>
            {community.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {community.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-3xl font-semibold text-gray-800">Community Not Found</h1>
        )}

        {/* Messages Section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-md h-[28rem] overflow-y-auto p-5">
          {loadingMessages ? (
            <p className="text-gray-600">Loading messages...</p>
          ) : messagesError ? (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {messagesError}
            </div>
          ) : messages.length === 0 ? (
            <p className="text-gray-500 italic">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="mb-6 pb-2 border-b border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-800">
                    {msg.sender_id?.first_name || "Unknown"} {msg.sender_id?.last_name || ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-gray-700">{msg.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Error message when sending a message */}
        {sendError && (
          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
            {sendError}
          </div>
        )}

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 shadow"
          >
            Send
          </button>
        </form>
      </div>
    </Layout>
  );
}
