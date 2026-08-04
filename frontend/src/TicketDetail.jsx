import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  DKK: 'kr',
  NOK: 'kr',
  SEK: 'kr',
  GBP: '£',
  NGN: '₦',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  ZAR: 'R'
};

function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/tickets/${id}`);
      setTicket(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      setError('Ticket not found');
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    return CURRENCY_SYMBOLS[currencyCode] || '$';
  };

  const handlePurchase = () => {
    if (!ticket || !ticket.payment_link) {
      alert('No payment link available for this ticket.');
      return;
    }
    
    window.open(ticket.payment_link, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="text-xl sm:text-2xl">Loading ticket...</div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl text-center w-full max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Ticket Not Found</h1>
          <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist.</p>
          <Link to="/" className="bg-[#004C9C] text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(ticket.currency || 'USD');
  const isSold = ticket.is_sold;
  const hasPaymentLink = ticket.payment_link && ticket.payment_link.length > 0;
  const totalPrice = (ticket.price * quantity).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Mobile Responsive */}
      <header className="bg-[#004C9C] text-white py-4 sm:py-5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
          <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            TICKETMASTER
          </Link>
          <Link to="/" className="bg-white text-[#004C9C] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition">
            ← Back
          </Link>
        </div>
      </header>

      {/* Ticket Detail - Mobile Responsive */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          <div className="relative">
            <img 
              src={ticket.image} 
              alt={ticket.event_name} 
              className="w-full h-56 sm:h-72 md:h-96 object-cover" 
            />
            {isSold && (
              <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-lg">
                SOLD OUT
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">{ticket.event_name}</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">📅 Date</p>
                <p className="text-base sm:text-xl font-semibold">{ticket.date}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">📍 Location</p>
                <p className="text-base sm:text-xl font-semibold">{ticket.location}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">💰 Price per ticket</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#004C9C]">
                  {currencySymbol}{ticket.price}
                  <span className="text-xs sm:text-sm font-normal text-gray-500 ml-1">
                    {ticket.currency || 'USD'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs sm:text-sm">📋 Status</p>
                <p className="text-base sm:text-xl font-semibold">
                  {isSold ? (
                    <span className="text-red-600">Sold Out</span>
                  ) : hasPaymentLink ? (
                    <span className="text-green-600">Available</span>
                  ) : (
                    <span className="text-yellow-600">No Payment Link</span>
                  )}
                </p>
              </div>
            </div>

            {/* Buy Section - Mobile Responsive */}
            {!isSold && hasPaymentLink && (
              <div className="border-t pt-6 sm:pt-8">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Purchase Tickets</h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-start">
                    <label className="text-gray-700 font-medium">Quantity:</label>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 hover:bg-gray-100 text-lg sm:text-xl font-bold flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="text-xl sm:text-2xl font-bold w-10 sm:w-12 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 hover:bg-gray-100 text-lg sm:text-xl font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center sm:text-right w-full sm:w-auto">
                    <p className="text-gray-500 text-xs sm:text-sm">Total</p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#004C9C]">
                      {currencySymbol}{totalPrice}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  className="w-full bg-[#004C9C] text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg md:text-xl hover:bg-blue-800 transition"
                >
                  Buy Tickets
                </button>

                <p className="text-xs text-gray-400 text-center mt-4">
                  You will be redirected to Mercuryo payment platform
                </p>
              </div>
            )}

            {/* Sold Out Message - Mobile Responsive */}
            {isSold && (
              <div className="border-t pt-6 sm:pt-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
                  <p className="text-lg sm:text-xl font-bold text-red-600">⚠️ This ticket has been sold</p>
                  <p className="text-sm sm:text-base text-gray-600 mt-2">Check back for more tickets!</p>
                </div>
              </div>
            )}

            {/* No Payment Link Message - Mobile Responsive */}
            {!isSold && !hasPaymentLink && (
              <div className="border-t pt-6 sm:pt-8 text-center">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
                  <p className="text-lg sm:text-xl font-bold text-yellow-600">⚠️ No payment link available</p>
                  <p className="text-sm sm:text-base text-gray-600 mt-2">Please contact the seller for purchase.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - Professional with Affiliations - NO Admin Link */}
<footer className="bg-gray-900 text-white pt-12 pb-6 mt-8 sm:mt-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-8">
    {/* Main Footer Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gray-700">
      
      {/* Brand Section */}
      <div className="col-span-1 sm:col-span-2 lg:col-span-1">
        <h2 className="text-2xl font-bold text-white mb-4">TICKETMASTER</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Your trusted platform for buying and selling event tickets. 
          Secure, fast, and reliable.
        </p>
        <div className="flex gap-4 mt-4">
          <a href="#" className="text-gray-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.387.6.113.82-.26.82-.58 0-.287-.01-1.05-.015-2.06-3.338.726-4.042-1.61-4.042-1.61-.546-1.39-1.335-1.76-1.335-1.76-1.09-.746.082-.73.082-.73 1.205.085 1.838 1.237 1.838 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.235-3.22-.123-.3-.535-1.52.117-3.16 0 0 1.008-.322 3.3 1.23.96-.267 1.98-.4 3-.405 1.02.005 2.04.138 3 .405 2.29-1.552 3.297-1.23 3.297-1.23.653 1.64.24 2.86.118 3.16.768.84 1.233 1.91 1.233 3.22 0 4.61-2.804 5.62-5.476 5.92.43.37.824 1.102.824 2.22 0 1.602-.015 2.894-.015 3.287 0 .322.216.698.825.58C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
        </div>
      </div>

      {/* Quick Links - NO ADMIN */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          <li><a href="/" className="text-gray-400 hover:text-white transition">Home</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition">About Us</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
          <li><a href="#" className="text-gray-400 hover:text-white transition">FAQs</a></li>
        </ul>
      </div>

      {/* Ticket Platforms */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Ticket Partners</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-blue-400">🎫</span>
            <span className="text-gray-300">Ticketmaster</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-400">🎟️</span>
            <span className="text-gray-300">StubHub</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-purple-400">🎪</span>
            <span className="text-gray-300">Eventbrite</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-red-400">🏟️</span>
            <span className="text-gray-300">SeatGeek</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-yellow-400">⭐</span>
            <span className="text-gray-300">Vivid Seats</span>
          </li>
        </ul>
      </div>

      {/* Affiliations */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Affiliations</h3>
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400">Official Partner</p>
            <p className="text-sm font-semibold text-white">Ticketmaster</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400">Trusted Reseller</p>
            <p className="text-sm font-semibold text-white">StubHub Network</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-xs text-gray-400">Event Partner</p>
            <p className="text-sm font-semibold text-white">Live Nation</p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-xs text-gray-500 text-center sm:text-left">
        &copy; {new Date().getFullYear()} TICKETMASTER. All rights reserved.
      </p>
      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
        <a href="#" className="hover:text-gray-300 transition">Privacy Policy</a>
        <span className="text-gray-700">|</span>
        <a href="#" className="hover:text-gray-300 transition">Terms of Service</a>
        <span className="text-gray-700">|</span>
        <a href="#" className="hover:text-gray-300 transition">Cookie Policy</a>
        <span className="text-gray-700">|</span>
        <span className="text-gray-400">
          <span className="text-green-400">●</span> Secure Payments
        </span>
      </div>
    </div>

    {/* Affiliate Disclaimer */}
    <div className="mt-4 pt-4 border-t border-gray-800">
      <p className="text-[10px] text-gray-600 text-center leading-relaxed">
        This site is affiliated with Ticketmaster and other ticketing platforms. 
        We are a resale marketplace and are not the primary ticket issuer. 
        All tickets are subject to the terms and conditions of the original issuer.
      </p>
    </div>
  </div>
</footer>
    </div>
  );
}

export default TicketDetail;