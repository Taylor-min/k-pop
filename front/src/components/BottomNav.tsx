import { Link, useLocation } from "react-router-dom";
import { Home, Heart, User } from "lucide-react";

export default function BottomNav() {
  const { pathname } = useLocation();

  const menu = [
    { label: "Home", path: "/", icon: Home },
    { label: "My Plalist", path: "/playlist", icon: Heart },
    { label: "My Info", path: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-black/90 backdrop-blur px-6 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-between text-sm">
      {menu.map((m) => {
        const active = pathname === m.path;
        const Icon = m.icon;

        return (
          <Link
            key={m.path}
            to={m.path}
            className={`flex-1 flex flex-col items-center gap-1 text-xs transition ${
              active ? "text-pink-400 font-semibold" : "text-gray-400"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? "scale-105" : ""}`} />
            <span>{m.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}