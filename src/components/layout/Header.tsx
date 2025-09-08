import { Shield, Trophy, Menu, X } from "lucide-react";
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
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00E5FF"
    strokeWidth="2.2"
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
        className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
          currentPage === "home"
            ? "text-white"
            : "text-gray-400 hover:text-white"
        }`}
      >
        <Trophy
          className={`h-5 w-5 ${
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
            className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 ${
              currentPage === "admin"
                ? "text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Shield
              className={`h-5 w-5 ${
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
            className="px-3 py-1 text-sm font-medium border border-gray-600 rounded-lg text-gray-400 hover:text-white hover:border-cyan-400 transition-all duration-300"
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
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
        >
          <Shield className="h-5 w-5 text-gray-400" />
          Admin Login
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10 shadow-lg">
      <div className="container max-w-7xl mx-auto flex items-center justify-between px-5 py-3 md:py-4">
        {/* Logo & Title */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onNavigate("home")}
        >
          <LogoIcon />
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-white tracking-wide">
              PSGMX Leaderboard
            </h1>
            <p className="text-xs md:text-sm text-gray-400 font-light tracking-wider">
              Student Progress Tracker
            </p>
          </div>
        </div>

        {/* POTD */}
        {dailyProblem && (
          <div className="hidden md:flex flex-col items-center max-w-lg mx-auto px-6">
            <a
              href={dailyProblem.questionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <div className="w-full bg-white/5 border border-white/10 backdrop-blur-sm rounded-lg px-5 py-2 flex justify-center items-center text-gray-300 hover:border-cyan-400 hover:text-white transition-all duration-300">
                <span className="font-semibold text-sm truncate">
                  POTD: {dailyProblem.questionTitle}
                </span>
                <span
                  className={`ml-3 font-semibold text-sm ${
                    difficultyColor[dailyProblem.difficulty] || "text-gray-400"
                  }`}
                >
                  ({dailyProblem.difficulty})
                </span>
              </div>
            </a>
          </div>
        )}

        {/* Desktop Nav */}
        <nav className="flex items-center gap-6">
          {/* Mobile Toggle */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="h-6 w-6 text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-300" />
            )}
          </button>

          {/* Desktop */}
          <div className="hidden md:flex gap-8 items-center">{NavItems()}</div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-black/60 backdrop-blur-lg border-t border-white/10 px-6 py-5 flex flex-col gap-4 text-gray-300 text-sm animate-fade-in">
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
