import { Code2, Shield, Trophy, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface HeaderProps {
  currentPage: 'home' | 'admin';
  onNavigate: (page: 'home' | 'admin') => void;
}

interface DailyProblem {
  questionLink: string;
  questionTitle: string;
  difficulty: string;
}

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
      .then(res => res.json())
      .then(data => {
        const problem = {
          questionLink: data.questionLink,
          questionTitle: data.questionTitle,
          difficulty: data.difficulty
        };
        setDailyProblem(problem);
        localStorage.setItem("dailyProblem", JSON.stringify({ date: today, problem }));
      })
      .catch(err => console.error("Failed to fetch daily problem:", err));
  }, []);

  const NavItems = () => (
    <>
      <Button
        variant={currentPage === 'home' ? 'default' : 'ghost'}
        onClick={() => { onNavigate('home'); setMenuOpen(false); }}
        className="flex items-center gap-2 w-full justify-start md:justify-center"
      >
        <Trophy className="h-4 w-4" /> Leaderboard
      </Button>

      {user ? (
        <>
          <Button
            variant={currentPage === 'admin' ? 'admin' : 'ghost'}
            onClick={() => { onNavigate('admin'); setMenuOpen(false); }}
            className="flex items-center gap-2 w-full justify-start md:justify-center"
          >
            <Shield className="h-4 w-4" /> Admin Panel
          </Button>
          <Button
            variant="outline"
            onClick={() => { logout(); setMenuOpen(false); }}
            className="w-full md:w-auto"
          >
            Logout
          </Button>
        </>
      ) : (
        <Button
          variant="admin"
          onClick={() => { onNavigate('admin'); setMenuOpen(false); }}
          className="flex items-center gap-2 w-full justify-start md:justify-center"
        >
          <Shield className="h-4 w-4" /> Admin Login
        </Button>
      )}
    </>
  );

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left Logo */}
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              PSGMX leaderboard
            </h1>
            <p className="text-xs text-muted-foreground">Student Progress Tracker</p>
          </div>
        </div>

        {/* Center POTD (desktop only) */}
        {dailyProblem && (
          <div className="hidden md:flex flex-col items-center mx-4">
            <a
              href={dailyProblem.questionLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="px-4">
                Problem of the Day: {dailyProblem.questionTitle} 
                <span className={`ml-2 font-semibold ${
                  dailyProblem.difficulty === 'Easy'
                    ? 'text-green-500'
                    : dailyProblem.difficulty === 'Medium'
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}>
                  ({dailyProblem.difficulty})
                </span>
              </Button>
            </a>
          </div>
        )}

        {/* Right Navigation */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-background/30"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <NavItems />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-background/95 border-t border-border px-4 py-2 flex flex-col gap-2">
          {NavItems()}
          {dailyProblem && (
            <a
              href={dailyProblem.questionLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-center text-yellow-400 mt-2"
            >
              POTD: {dailyProblem.questionTitle} ({dailyProblem.difficulty})
            </a>
          )}
        </div>
      )}
    </header>
  );
};
