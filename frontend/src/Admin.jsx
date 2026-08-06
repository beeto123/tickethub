import { useState, useEffect } from 'react';
import axios from 'axios';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

function Admin() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  
  const [newTicket, setNewTicket] = useState({
    event_name: '',
    date: '',
    location: '',
    price: '',
    currency: 'USD',
    payment_link: '',
    image: ''
  });

  useEffect(() => {
    const loggedIn = sessionStorage.getItem('adminLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      fetchTickets();
    }
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/tickets');
      setTickets(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/admin/login', { password });
      if (res.data.success) {
        setIsLoggedIn(true);
        sessionStorage.setItem('adminLoggedIn', 'true');
        fetchTickets();
        setLoginError('');
      }
    } catch (error) {
      setLoginError('Invalid password. Try again.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const res = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setNewTicket({ ...newTicket, image: res.data.imageUrl });
      setMessage('✅ Image uploaded!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      alert('❌ Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.image) {
      alert('Please upload an image first!');
      return;
    }
    try {
      await axios.post('/api/tickets', newTicket);
      setNewTicket({ 
        event_name: '', 
        date: '', 
        location: '', 
        price: '', 
        currency: 'USD', 
        payment_link: '',
        image: '' 
      });
      await fetchTickets();
      setMessage('✅ Ticket added!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleMarkSold = async (id) => {
    if (!confirm('Mark this ticket as sold?')) return;
    
    try {
      await axios.patch(`/api/tickets/${id}`, { is_sold: true });
      await fetchTickets();
      setMessage('✅ Ticket marked as sold!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleMarkUnsold = async (id) => {
    try {
      await axios.patch(`/api/tickets/${id}`, { is_sold: false });
      await fetchTickets();
      setMessage('✅ Ticket marked as available!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const confirmDelete = (ticket) => {
    setTicketToDelete(ticket);
    setShowDeleteModal(true);
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    
    const id = ticketToDelete.id;
    
    try {
      const response = await fetch(`http://localhost:5000/api/tickets/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTickets(tickets.filter(ticket => ticket.id !== id));
        setMessage('✅ Ticket deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
        setShowDeleteModal(false);
        setTicketToDelete(null);
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };

  const getCurrencySymbol = (code) => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };

  // Login Screen - Mobile Responsive
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-[#004C9C]">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 text-base sm:text-lg"
              required
            />
            {loginError && <p className="text-red-500 mb-4">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-[#004C9C] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              Login
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-4 text-center">Default password: admin123</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard - Mobile Responsive
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#004C9C] text-white py-3 sm:py-4 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Panel</h1>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-white text-[#004C9C] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition"
            >
              View Site
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-sm sm:text-base hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
        {message && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 mb-4 sm:mb-6 rounded text-sm sm:text-base">
            {message}
          </div>
        )}

        {/* Add Ticket Form - Mobile Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Add New Ticket</h2>
          <form onSubmit={handleAddTicket} className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Event Name"
              value={newTicket.event_name}
              onChange={(e) => setNewTicket({...newTicket, event_name: e.target.value})}
              className="p-3 border rounded-lg text-sm sm:text-base"
              required
            />
            <input
              type="text"
              placeholder="Date (e.g. Aug 25 2026)"
              value={newTicket.date}
              onChange={(e) => setNewTicket({...newTicket, date: e.target.value})}
              className="p-3 border rounded-lg text-sm sm:text-base"
              required
            />
            <input
              type="text"
              placeholder="Location"
              value={newTicket.location}
              onChange={(e) => setNewTicket({...newTicket, location: e.target.value})}
              className="p-3 border rounded-lg text-sm sm:text-base"
              required
            />
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newTicket.price}
                onChange={(e) => setNewTicket({...newTicket, price: e.target.value})}
                className="flex-1 p-3 border rounded-lg text-sm sm:text-base"
                required
              />
              <select
                value={newTicket.currency}
                onChange={(e) => setNewTicket({...newTicket, currency: e.target.value})}
                className="p-3 border rounded-lg bg-white min-w-[100px] sm:min-w-[130px] text-sm sm:text-base"
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} ({curr.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
                Payment Link (Mercuryo)
              </label>
              <input
                type="url"
                placeholder="Paste your Mercuryo payment link here..."
                value={newTicket.payment_link}
                onChange={(e) => setNewTicket({...newTicket, payment_link: e.target.value})}
                className="w-full p-3 border rounded-lg text-sm sm:text-base"
              />
              <p className="text-xs text-gray-400 mt-1">
                Copy the Mercuryo payment link from Trust Wallet and paste it here.
                Each ticket should have its own unique payment link.
              </p>
            </div>
            
            <div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="imageUpload" 
                  className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition text-sm sm:text-base"
                >
                  📁 {uploading ? 'Uploading...' : 'Choose Image'}
                </label>
                {newTicket.image && (
                  <div className="mt-4">
                    <img src={newTicket.image} alt="Preview" className="h-24 sm:h-32 mx-auto rounded-lg object-cover" />
                    <p className="text-sm text-green-600 mt-2">✅ Image uploaded!</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Upload JPG, PNG, or WEBP (max 5MB)</p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#004C9C] text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition text-sm sm:text-base"
              disabled={uploading}
            >
              {uploading ? 'Uploading Image...' : 'Add Ticket'}
            </button>
          </form>
        </div>

        {/* Ticket List - Mobile Responsive with Horizontal Scroll */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800">Manage Tickets</h2>
          {loading ? (
            <p>Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500">No tickets available. Add one above!</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="min-w-[600px] sm:min-w-full px-4 sm:px-0">
                <table className="w-full text-sm sm:text-base">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 sm:p-3 text-left">Image</th>
                      <th className="p-2 sm:p-3 text-left">Event</th>
                      <th className="p-2 sm:p-3 text-left hidden sm:table-cell">Date</th>
                      <th className="p-2 sm:p-3 text-left hidden md:table-cell">Location</th>
                      <th className="p-2 sm:p-3 text-left">Price</th>
                      <th className="p-2 sm:p-3 text-left hidden lg:table-cell">Status</th>
                      <th className="p-2 sm:p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-t hover:bg-gray-50">
                        <td className="p-2 sm:p-3">
                          {!imageErrors[ticket.id] ? (
                            <img 
                              src={ticket.image} 
                              alt={ticket.event_name} 
                              className="h-10 w-16 sm:h-12 sm:w-20 object-cover rounded"
                              onError={() => handleImageError(ticket.id)}
                            />
                          ) : (
                            <div className="h-10 w-16 sm:h-12 sm:w-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                              No Image
                            </div>
                          )}
                        </td>
                        <td className="p-2 sm:p-3 max-w-[80px] sm:max-w-none truncate">{ticket.event_name}</td>
                        <td className="p-2 sm:p-3 hidden sm:table-cell">{ticket.date}</td>
                        <td className="p-2 sm:p-3 hidden md:table-cell">{ticket.location}</td>
                        <td className="p-2 sm:p-3 font-bold text-[#004C9C] whitespace-nowrap">
                          {getCurrencySymbol(ticket.currency || 'USD')}{ticket.price}
                          <span className="text-xs text-gray-400 ml-1 hidden sm:inline">
                            {ticket.currency || 'USD'}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 hidden lg:table-cell">
                          {ticket.is_sold ? (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">
                              Sold
                            </span>
                          ) : ticket.payment_link ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                              No Link
                            </span>
                          )}
                        </td>
                        <td className="p-2 sm:p-3">
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {!ticket.is_sold && ticket.payment_link && (
                              <button
                                onClick={() => handleMarkSold(ticket.id)}
                                className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-green-700 transition whitespace-nowrap"
                              >
                                Sold
                              </button>
                            )}
                            {ticket.is_sold && (
                              <button
                                onClick={() => handleMarkUnsold(ticket.id)}
                                className="bg-yellow-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-yellow-700 transition whitespace-nowrap"
                              >
                                Unsold
                              </button>
                            )}
                            <button
                              onClick={() => confirmDelete(ticket)}
                              className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm hover:bg-red-700 transition whitespace-nowrap"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal - Mobile Responsive */}
      {showDeleteModal && ticketToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Confirm Delete</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Are you sure you want to delete <strong>"{ticketToDelete.event_name}"</strong>?
              <br />
              <span className="text-sm text-gray-400">This action cannot be undone.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTicketToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTicket}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;