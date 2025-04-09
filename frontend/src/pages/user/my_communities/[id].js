// pages/communities/[id].jsx
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { apiFetch, API_URL } from "@/utils/api";
import Layout from "@/components/Layout";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { id: communityId } = router.query; // from [id].jsx dynamic route

  const [community, setCommunity] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);

  // 1) Fetch the community info (name/description)
  const fetchCommunity = async () => {
    try {
      // GET /api/communities/:id
      const data = await apiFetch(`/api/communities/` + communityId);
      setCommunity(data);
    } catch (err) {
      console.error("Error fetching community:", err);
    }
  };

  // 2) Fetch existing messages
  const fetchMessages = async () => {
    try {
      // GET /api/messages/community/:communityId
      const res = await apiFetch(`/api/messages/community/${communityId}?limit=50`);
      // The controller returns { page, limit, messages } 
      setMessages(res.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // 3) Initialize Socket.io on mount (when communityId is known)
  useEffect(() => {
    if (!communityId) return;
    
    // Connect to the root of your server socket (e.g. http://localhost:8080 if API_URL includes /api)
    // If your API_URL is "http://localhost:8080/api", we remove '/api' for the socket:
    const socketBase = API_URL.replace("/api", "");
    socketRef.current = io(socketBase, { transports: ["websocket"] });

    // Join the room
    socketRef.current.emit("joinCommunity", communityId);

    // Listen for incoming messages
    socketRef.current.on("newMessage", (msg) => {
      // Option 1: Put newest at the bottom:
      setMessages((prev) => [...prev, msg]);
      

      // Option 2: If you prefer newest on top, do:
      // setMessages((prev) => [msg, ...prev]);
    });

    // Cleanup when unmounting
    return () => {
      socketRef.current.emit("leaveCommunity", communityId);
      socketRef.current.disconnect();
    };
  }, [communityId]);

  // 4) On first render or whenever communityId changes, fetch community + messages
  useEffect(() => {
    if (communityId) {
      fetchCommunity();
      fetchMessages();
    }
  }, [communityId]);

  // 5) Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // POST /api/messages
      // Body: { community_id, message }
      const body = {
        community_id: communityId,
        message: newMessage,
      };
      await apiFetch("/api/messages", {
        method: "POST",
        body: JSON.stringify(body),
      });
      // We do NOT append the message ourselves
      // because the Socket.io "newMessage" event
      // will do it in real-time. 
      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <Layout>
    <div className="max-w-3xl mx-auto p-4">
      {/* Community name on top */}
      {community ? (
        <>
          <h1 className="text-2xl font-bold mb-2">{community.name}</h1>
          <p className="text-gray-600 mb-4">{community.description}</p>
        </>
      ) : (
        <h1 className="text-2xl font-bold mb-4">Loading…</h1>
      )}

      {/* Messages */}
      <div className="border p-3 h-96 overflow-y-auto rounded-md bg-white shadow-sm">
        {messages.map((msg) => (
          <div key={msg._id} className="mb-4">
            <p className="font-semibold">
              {msg.sender_id?.first_name} {msg.sender_id?.last_name}
            </p>
            <p className="text-gray-800">{msg.message}</p>
            <p className="text-xs text-gray-500">
              {new Date(msg.createdAt).toLocaleString()}
            </p>
            <hr className="mt-2" />
          </div>
        ))}
      </div>

      {/* Form to send new message */}
      <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded px-3 py-2"
          placeholder="Write your message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
    </div>
    </Layout>
  );
}
