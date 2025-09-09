import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12">
      {/* Container */}
      <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-9xl font-extrabold text-gray-900 select-none mb-6 tracking-wide">
            404
          </h1>
          <h2 className="text-3xl font-semibold mb-4 text-gray-700">
            Uh-oh, page not found.
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-md">
            The page you are looking for <code className="bg-gray-100 px-2 py-1 rounded font-mono">{location.pathname}</code> does not exist or has been moved.
          </p>

          <div className="flex justify-center md:justify-start gap-4">
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold shadow-md hover:bg-blue-700 transition"
              aria-label="Return to homepage"
            >
              Go Home
            </Link>
            <a
              href="mailto:support@yourcompany.com"
              className="inline-block text-blue-600 font-semibold underline hover:text-blue-800 transition"
              aria-label="Contact support"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Right Illustration */}
        <div className="flex-1 max-w-md">
          {/* Open source free SVG from unDraw - customized */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 800 600"
            className="w-full h-auto"
            fill="none"
          >
            <rect width="800" height="600" fill="#f3f4f6" rx="40" />
            <path
              d="M260 320c0-50 40-90 90-90s90 40 90 90"
              stroke="#3b82f6"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <circle cx="350" cy="320" r="90" stroke="#2563eb" strokeWidth="15" />
            <path
              d="M250 460h200"
              stroke="#3b82f6"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M320 460v-120"
              stroke="#2563eb"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d="M380 460v-80"
              stroke="#3b82f6"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <circle cx="320" cy="340" r="20" fill="#3b82f6" />
            <circle cx="380" cy="380" r="20" fill="#2563eb" />
            {/* Add more shapes or use any SVG illustration from unDraw/undraw.co */}
          </svg>
        </div>
      </div>

      <footer className="mt-20 text-center text-gray-400 select-none text-sm">
        &copy; {new Date().getFullYear()} YourCompanyName — Powered by Open Source
      </footer>
    </div>
  );
};

export default NotFound;
