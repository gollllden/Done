import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const useStatusChecks = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/status`);
      setItems(res.data || []);
    } catch (e) {
      console.error("Failed to fetch status checks", e);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (clientName) => {
    try {
      await axios.post(`${API}/status`, { client_name: clientName });
      await fetchItems();
    } catch (e) {
      console.error("Failed to create status check", e);
    }
  };

  return { items, loading, fetchItems, addItem };
};

const Dashboard = () => {
  const { items, loading, fetchItems, addItem } = useStatusChecks();
  const [clientName, setClientName] = useState("");
  const [contact, setContact] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAddStatus = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) return;
    await addItem(clientName.trim());
    setClientName("");
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus("");
    try {
      await axios.post(`${API}/contact`, contact);
      setContactStatus("sent");
      setContact({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Failed to send contact form", err);
      setContactStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="App-header">
        <a
          className="App-link"
          href="https://emergent.sh"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="logo-link"
        >
          <img
            src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
            alt="Emergent logo"
          />
        </a>
        <p className="mt-5" data-testid="hero-text">
          Golden Touch Managerial Dashboard
        </p>
      </header>

      <main className="px-6 py-8 max-w-5xl w-full mx-auto space-y-10" data-testid="dashboard-page">
        {/* Status Checks Section */}
        <section className="bg-zinc-900 rounded-xl p-6 shadow-lg" data-testid="status-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Status Checks</h2>
            <span className="text-sm text-zinc-400">
              {loading ? "Loading..." : `${items.length} records`}
            </span>
          </div>

          <form
            onSubmit={handleAddStatus}
            className="flex flex-col sm:flex-row gap-3 mb-6"
            data-testid="status-form"
          >
            <input
              data-testid="status-client-input"
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name"
              className="flex-1 rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              data-testid="status-submit-button"
              type="submit"
              className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-sm font-medium"
            >
              Add Status
            </button>
          </form>

          <div className="overflow-x-auto" data-testid="status-table">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-800 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium text-zinc-300">Client</th>
                  <th className="px-3 py-2 font-medium text-zinc-300">Timestamp</th>
                  <th className="px-3 py-2 font-medium text-zinc-300">ID</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-t border-zinc-800">
                    <td className="px-3 py-2">{row.client_name}</td>
                    <td className="px-3 py-2">
                      {row.timestamp ? new Date(row.timestamp).toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-400">{row.id}</td>
                  </tr>
                ))}
                {items.length === 0 && !loading && (
                  <tr>
                    <td colSpan="3" className="px-3 py-4 text-center text-zinc-400">
                      No status checks yet. Add one above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="bg-zinc-900 rounded-xl p-6 shadow-lg" data-testid="contact-section">
          <h2 className="text-xl font-semibold mb-4">Contact Office</h2>
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4"
            data-testid="contact-form"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" htmlFor="contact-name">
                  Name
                </label>
                <input
                  id="contact-name"
                  data-testid="contact-name-input"
                  type="text"
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className="w-full rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1" htmlFor="contact-email">
                  Email
                </label>
                <input
                  id="contact-email"
                  data-testid="contact-email-input"
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="contact-subject">
                Subject
              </label>
              <input
                id="contact-subject"
                data-testid="contact-subject-input"
                type="text"
                value={contact.subject}
                onChange={(e) => setContact({ ...contact, subject: e.target.value })}
                className="w-full rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                data-testid="contact-message-input"
                rows="4"
                value={contact.message}
                onChange={(e) => setContact({ ...contact, message: e.target.value })}
                className="w-full rounded-md px-3 py-2 bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              data-testid="contact-submit-button"
              className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-sm font-medium"
            >
              Send Message
            </button>

            {contactStatus === "sent" && (
              <p
                className="text-sm text-emerald-400 mt-2"
                data-testid="contact-success-message"
              >
                Message sent successfully.
              </p>
            )}
            {contactStatus === "error" && (
              <p
                className="text-sm text-red-400 mt-2"
                data-testid="contact-error-message"
              >
                Failed to send message. Please try again later.
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
