import { useState } from "react";
import { RiMailLine, RiSendPlane2Line } from "react-icons/ri";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Perform form validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setFormStatus("Please fill in all fields.");
      return;
    }

    // Simulate form submission
    setFormStatus("Message sent successfully!");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-6">
      <div className="bg-zinc-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-purple-600 mb-4 flex items-center justify-center">
          <RiMailLine size={50} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-4 text-center">
          Contact Admin
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-600 rounded px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-600 rounded px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full border border-gray-600 rounded px-4 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-600 rounded px-4 py-2 h-32 resize-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition flex items-center justify-center space-x-2"
          >
            <RiSendPlane2Line />
            <span>Send Message</span>
          </button>
        </form>
        {formStatus && (
          <p className="text-center text-red-600 mt-4">{formStatus}</p>
        )}
      </div>
    </div>
  );
}
