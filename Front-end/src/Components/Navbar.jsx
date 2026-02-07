import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { BaseUrl } from "../BaseApi/Api";
import { LogOut, UserCircle, UserPlus } from "lucide-react";
import logo from "../Assets/company_logo.png"
export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isUserOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(BaseUrl + "me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = async () => {
    await fetch(BaseUrl + "logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow px-4 py-2 flex items-center justify-between sticky top-0 z-10">
      <div className="text-xl font-bold text-indigo-600">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="loading" className="w-9 h-9 rounded-full" />
          Promozione
        </Link>
      </div>

      {/* Right Side */}
      <div className="space-x-3 flex items-center">
        {user ? (
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen(!isUserOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100 transition border"
            >

              <UserCircle size={26} className="text-gray-700" />
            </button>

            {isUserOpen && (
              <div className="absolute right-0 w-70 bg-white shadow-lg rounded-lg border z-50">
                <div className="px-4 py-3 border-b text-center">
                  <p className="text-base font-semibold text-gray-800">
                    {user?.username || "User"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email || "Email.com"}
                  </p>
                </div>

                <div className="py-1">
                  {/* <Link
                    to="/myProfile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserOpen(false)}
                  >
                    <User size={16} /> My Profile
                  </Link> */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-white bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700"
            >
              Login
            </Link>

            <Link
              to="/sign-up"
              className="text-sm text-white bg-indigo-600 px-3 py-2 rounded hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
