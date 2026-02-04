import { NavLink } from "react-router-dom";
import { Rss, Compass, User, Plus } from "lucide-react";
import { useModal } from "../context/ModalContext";

const NAV = [
  { to: "/feed",    label: "Feed",    Icon: Rss },
  { to: "/explore", label: "Explore", Icon: Compass },
  { to: "/profile", label: "Profile", Icon: User },
];

function Navbar() {
  const { openModal } = useModal();

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-xs transition-colors md:flex-row md:gap-2 md:text-sm md:px-3 md:py-2 ${
      isActive ? "text-white font-semibold" : "text-slate-400 hover:text-white"
    }`;

  return (
    <>
      {/* Desktop */}
      <header className="hidden md:flex fixed top-0 inset-x-0 z-50 items-center justify-between px-8 py-4 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <span className="text-base font-bold tracking-tight text-white">
          Uni<span className="text-indigo-400">Sphere</span>
        </span>

        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => openModal("createSociety")}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500 active:scale-95 transition-all"
        >
          <Plus size={15} />
          Create
        </button>
      </header>

      {/* Mobile top bar */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-4 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl md:hidden">
        <span className="text-base font-bold tracking-tight text-white">
          Uni<span className="text-indigo-400">Sphere</span>
        </span>
        <button
          onClick={() => openModal("createSociety")}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500 transition"
        >
          <Plus size={14} />
          Create
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-50 flex justify-around border-t border-slate-800/60 bg-slate-950/95 backdrop-blur-xl pb-safe pt-2 md:hidden">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default Navbar;
