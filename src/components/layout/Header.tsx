import { Shield, Trophy, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface HeaderProps {
  currentPage: "home" | "admin";
  onNavigate: (page: "home" | "admin") => void;
}

interface DailyProblem {
  questionLink: string;
  questionTitle: string;
  difficulty: string;
}

const LogoIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#8FA1B3" // subtle blue-gray
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l2 2 4-4" />
  </svg>
);

export const Header = ({ currentPage, onNavigate }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [dailyProblem, setDailyProblem] = useState<DailyProblem | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const cached = localStorage.getItem("dailyProblem");

    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.date === today) {
        setDailyProblem(parsed.problem);
        return;
      }
    }

    fetch("https://alfa-leetcode-api.onrender.com/daily")
      .then((res) => res.json())
      .then((data) => {
        const problem = {
          questionLink: data.questionLink,
          questionTitle: data.questionTitle,
          difficulty: data.difficulty,
        };
        setDailyProblem(problem);
        localStorage.setItem("dailyProblem", JSON.stringify({ date: today, problem }));
      })
      .catch((err) => console.error("Failed to fetch daily problem:", err));
  }, []);

  const difficultyColor = {
    Easy: "text-green-400",
    Medium: "text-yellow-400",
    Hard: "text-red-400",
  };

  const NavItems = () => (
    <>
      <button
        onClick={() => {
          onNavigate("home");
          setMenuOpen(false);
        }}
        className={`flex items-center gap-2 w-full justify-start md:justify-center text-sm font-semibold transition-colors duration-200 ${
          currentPage === "home"
            ? "text-white"
            : "text-gray-400 hover:text-white"
        }`}
        aria-current={currentPage === "home" ? "page" : undefined}
      >
        <Trophy
          className={`h-5 w-5 transition-transform duration-200 ${
            currentPage === "home" ? "text-cyan-400" : "text-gray-400"
          }`}
        />
        Leaderboard
      </button>

      {user ? (
        <>
          <button
            onClick={() => {
              onNavigate("admin");
              setMenuOpen(false);
            }}
            className={`flex items-center gap-2 w-full justify-start md:justify-center text-sm font-semibold transition-colors duration-200 ${
              currentPage === "admin"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
            aria-current={currentPage === "admin" ? "page" : undefined}
          >
            <Shield
              className={`h-5 w-5 transition-transform duration-200 ${
                currentPage === "admin" ? "text-cyan-400" : "text-gray-400"
              }`}
            />
            Admin Panel
          </button>
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="w-full md:w-auto text-sm font-semibold px-3 py-1 border border-gray-600 rounded-md text-gray-400 hover:text-white hover:border-cyan-500 transition-colors duration-200"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            onNavigate("admin");
            setMenuOpen(false);
          }}
          className="flex items-center gap-2 w-full justify-start md:justify-center text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-200"
        >
          <Shield className="h-5 w-5 text-gray-400" />
          Admin Login
        </button>
      )}
    </>
  );

  return (
    <header className="bg-[#121212] border-b border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="container max-w-7xl mx-auto flex items-center justify-between px-5 py-3 md:py-4">
        {/* Left: Logo and Title */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none"
          onClick={() => onNavigate("home")}
          aria-label="Navigate to Home"
        >
          <LogoIcon />
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-100 tracking-wide">
              PSGMX Leaderboard
            </h1>
            <p className="text-xs md:text-sm text-gray-500 font-light uppercase tracking-widest">
              Student Progress Tracker
            </p>
          </div>
        </div>

        {/* Center: POTD (md+) */}
        {dailyProblem && (
          <div className="hidden md:flex flex-col items-center max-w-lg mx-auto px-8 text-center">
            <a
              href={dailyProblem.questionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
              aria-label={`Problem of the Day: ${dailyProblem.questionTitle}`}
            >
              <div
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-6 py-2 flex justify-center items-center text-gray-300 hover:border-cyan-500 hover:text-white transition-colors duration-200 cursor-pointer select-none"
                tabIndex={0}
              >
                <span className="font-semibold text-sm md:text-base truncate">
                  Problem of the Day: {dailyProblem.questionTitle}
                </span>
                <span
                  className={`ml-3 font-semibold text-sm md:text-base ${
                    difficultyColor[dailyProblem.difficulty] || "text-gray-400"
                  }`}
                >
                  ({dailyProblem.difficulty})
                </span>
              </div>
            </a>
          </div>
        )}

        {/* Right: Navigation */}
        <nav className="flex items-center gap-4 md:gap-6">
          {/* Mobile Hamburger */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="h-6 w-6 text-gray-400" />
            ) : (
              <Menu className="h-6 w-6 text-gray-400" />
            )}
          </button>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex gap-8 items-center">{NavItems()}</div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-[#121212] border-t border-gray-800 px-6 py-5 flex flex-col gap-4 text-gray-400 text-sm">
          {NavItems()}
          {dailyProblem && (
            <a
              href={dailyProblem.questionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-cyan-400 font-semibold hover:underline transition-colors"
            >
              POTD: {dailyProblem.questionTitle} ({dailyProblem.difficulty})
            </a>
          )}
        </nav>
      )}
    </header>
  );
};
