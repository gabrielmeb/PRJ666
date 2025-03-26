// pages/communities/[id].jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";

export default function CommunityDetailPage() {
  const router = useRouter();
  const { id: communityId } = router.query; // from [id].jsx

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // example limit
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1) Fetch messages from the backend
  const fetchMessages = async (reset = false) => {
    if (!communityId) return;
    setLoading(true);
    try {
      const data = await apiFetch("/messages/community/${communityId}");
      if (reset) {
        setMessages(data.messages);
      } else {
        // If you want to push new results on top (since it's sorted descending),
        // you might do: setMessages((prev) => [...prev, ...data.messages])
        // or handle it differently. We'll just overwrite for simplicity.
        setMessages(data.messages);
      }
      setMessageCount(data.count);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, communityId]);

  // 2) Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      // POST /api/messages
      // Body: { community_id, message }
      const body = {
        community_id: communityId,
        message: newMessage
      };
      await apiFetch("/messages", {
        method: "POST",
        body: JSON.stringify(body)
      });
      setNewMessage("");
      // Refresh messages
      fetchMessages(true);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Messages</h1>

      {/* Message list */}
      <div className="border border-gray-300 rounded-md p-4 h-[500px] overflow-y-auto">
        {loading && <p>Loading messages...</p>}
        {!loading && messages.length === 0 && (
          <p className="text-gray-500">No messages found.</p>
        )}
        {!loading &&
          messages.length > 0 &&
          messages.map((msg) => (
            <div key={msg._id} className="mb-2">
              <p className="font-semibold">
                {msg.sender_id?.first_name} {msg.sender_id?.last_name}
              </p>
              <p className="text-sm">{msg.message}</p>
              <p className="text-xs text-gray-400">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
              <hr className="my-2" />
            </div>
          ))}
      </div>

      {/* Load more if we want to paginate further */}
      {messages.length > 0 && messages.length < messageCount && (
        <button
          onClick={handleLoadMore}
          className="mt-2 bg-gray-300 px-3 py-1 rounded-md"
        >
          Load More
        </button>
      )}

      {/* Send message form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Write your message..."
          className="border border-gray-300 p-2 rounded-md flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-2 rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}
