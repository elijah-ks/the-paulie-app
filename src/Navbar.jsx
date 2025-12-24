import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import paulieLogo from "/src/assets/paulie.png";
import "./App.css";

export default function Navbar({ user }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/auth"; // Redirect after logout
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="navbar">
      {/* Left: Logo + Title */}
      <div className="navbar-logo">
        <img src={paulieLogo} alt="Paulie logo" className="logo-img" />
        <span className="logo-text">Paulie</span>
      </div>

      {/* Center: Nav links */}
      <nav className="navbar-links">
        <NavLink to="/" className="nav-link">Home</NavLink>
        <NavLink to="/profile" className="nav-link">Profile</NavLink>
        <NavLink to="/messages" className="nav-link">Messages</NavLink>
      </nav>

      {/* Right: User controls */}
      <div className="navbar-user">
        <button className="btn">+ Post</button>

        {user ? (
          <>
            <div className="user-icon">👤</div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/auth" className="login-btn">
            Login
          </NavLink>
        )}
      </div>
    </header>
  );
}
