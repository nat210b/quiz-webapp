import { useEffect, useState } from "react";
import { getUser, signOutUser } from "../../services/userService";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [registerType, setRegisterType] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser().then((user) => setUser(user));
  }, []);

  // First deploy: keep access control simple (email-only).
  const userEmail = (user?.email ?? "").trim().toLowerCase();
  const adminEmail = "nat_to_kung@hotmail.com";
  const isAdminByEmail = userEmail === adminEmail.toLowerCase();
  const displayName =
    user?.user_metadata?.display_name ?? user?.email ?? "UserName";

  const menuItems = [
    {
      name: "Vocab Manager",
      path: "/vocab",
      isDisabled: false,
      isVisible: isAdminByEmail,
    },
  ];

  const userMenuItems = [
    {
      name: "Profile",
      path: "/profile",
      isDisabled: false,
      isVisible: false,
    },
  ];

  useEffect(() => {
    if (registerType === "login") {
      localStorage.setItem("isLogin", "true");
      window.location.href = "/register";
    } else if (registerType === "register") {
      localStorage.setItem("isLogin", "false");
      window.location.href = "/register";
    }
  }, [registerType]);

  function signOutHandler() {
    signOutUser().then(() => {
      setUser(null);
      localStorage.setItem("isLogin", "false");
    });
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-[#0d1021]/80 backdrop-blur-lg border-b border-[#252c44] font-['DM_Sans',sans-serif]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => (window.location.href = "/")}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#4f8ef7] rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
              <img
                src="/icon.jpg"
                alt="What The Word Icon"
                className="h-9 w-9 rounded-full object-cover relative z-10 border border-[#2e3450]"
              />
            </div>
            <span className="text-[#e8d5a3] font-bold text-lg tracking-wide hidden sm:block group-hover:text-white transition-colors duration-300">
              What the Word
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Desktop Menu */}
            <nav className="flex items-center gap-4">
              {menuItems
                .filter((item) => item.isVisible)
                .map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className="text-sm font-bold text-[#c8d0e8] hover:text-[#4f8ef7] transition-colors relative after:content-[''] after:absolute after:-bottom-1.5 after:left-0 after:w-0 after:h-[2px] after:bg-[#4f8ef7] hover:after:w-full after:transition-all after:duration-300"
                  >
                    {item.name}
                  </a>
                ))}
            </nav>

            {/* User Controls */}
            <div>
              {user ? (
                <div className="relative inline-block text-left">
                  <div
                    className="flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-full hover:bg-[#1e2235] border border-transparent hover:border-[#2e3450] transition-colors duration-200"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4f8ef7] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(79,142,247,0.3)]">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-[#c8d0e8] hidden md:block max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <i
                      className={`fas fa-chevron-down text-xs text-[#7a84a8] overflow-hidden transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                    ></i>
                  </div>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-48 origin-top-right rounded-xl bg-[#161b2e] border border-[#252c44] shadow-[0_10px_40px_rgba(0,0,0,0.5)] focus:outline-none z-50 overflow-hidden">
                      <div className="py-1">
                        {userMenuItems
                          .filter((item) => item.isVisible)
                          .map((item) => (
                            <a
                              key={item.path}
                              href={item.path}
                              className="block px-4 py-2.5 text-sm font-medium text-[#c8d0e8] hover:bg-[#1e2235] hover:text-[#4f8ef7] transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                setIsMenuOpen(false);
                              }}
                            >
                              {item.name}
                            </a>
                          ))}

                        {/* Divider */}
                        {userMenuItems.filter((i) => i.isVisible).length >
                          0 && (
                          <div className="border-t border-[#252c44] my-1"></div>
                        )}

                        {/* Logout Button */}
                        <button
                          onClick={signOutHandler}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#f76f4f] hover:bg-[#f76f4f]/10 transition-colors font-semibold flex items-center gap-2"
                        >
                          <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setRegisterType("login")}
                    className="text-sm font-semibold text-[#7a84a8] hover:text-[#c8d0e8] transition-colors px-3 py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setRegisterType("register")}
                    className="text-sm font-bold text-white bg-gradient-to-r from-[#f7c94f] to-[#e6a822] hover:shadow-[0_0_15px_rgba(247,201,79,0.3)] transition-all transform hover:-translate-y-0.5 px-5 py-2 rounded-xl border border-transparent"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
