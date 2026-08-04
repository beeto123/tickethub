import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Success() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="text-5xl sm:text-6xl mb-4">✅</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 text-sm sm:text-base mb-6">
          Your payment has been processed successfully!
          <br />
          You will receive a confirmation shortly.
        </p>
        <p className="text-gray-500 text-xs sm:text-sm">
          The seller will confirm your tickets soon.
        </p>
        <button
          onClick={goHome}
          className="mt-6 bg-[#004C9C] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-blue-800 transition text-sm sm:text-base w-full sm:w-auto"
        >
          Back to Tickets
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Redirecting to home in 5 seconds...
        </p>
      </div>
    </div>
  );
}

export default Success;