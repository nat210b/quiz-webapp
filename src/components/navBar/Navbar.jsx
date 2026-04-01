import { useEffect, useState } from "react";
import { getUser, signOutUser } from "../../services/userService";
import "./NavbarStyle.css";
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
    <>
      <div className="navbar-Container">
        <div className="icon-Container">
          <img
            src="../../../public/icon.jpg"
            alt="What The Word Icon"
            className="h-10 w-10 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          />
        </div>
        <div className="flex gap-2">
          <div className="menu-Container">
            <nav>
              {menuItems
                .filter((item) => item.isVisible)
                .map((item) => (
                  <a key={item.path} href={item.path}>
                    {item.name}
                  </a>
                ))}
            </nav>
          </div>
          <div className="user-Container">
            {user ? (
              <div className=" relative inline-block">
                <div
                  className=" cursor-pointer hover:bg-white hover:opacity-80 hover:rounded hover:font-bold hover:text-blue-800"
                  style={{ padding: "3px" }}
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                >
                  <h6>{displayName}</h6>
                </div>
                <div>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                      <div className="py-1">
                        {userMenuItems
                          .filter((item) => item.isVisible)
                          .map((item) => (
                            <a
                              key={item.path}
                              href={item.path}
                              className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              onClick={(e) => {
                                e.preventDefault(); // Just for preview purposes
                                setIsMenuOpen(false);
                              }}
                            >
                              {item.name}
                            </a>
                          ))}

                        {/* Divider */}
                        <div className="border-t border-slate-100 my-1"></div>

                        {/* Logout Button */}
                        <button
                          onClick={signOutHandler}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setRegisterType("login")}
                  className=" hover:bg-white hover:rounded hover:opacity-80 hover:font-bold hover:text-blue-800"
                >
                  Login
                </button>
                <button
                  onClick={() => setRegisterType("register")}
                  className="bg-yellow-500 border rounded shadow hover:bg-yellow-600 hover:text-white font-bold py-2 px-4  "
                >
                  SignUp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
