import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Auth from "./Auth";
import Navbar from "./Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  if (loadingUser) return <p>Loading...</p>;

  return (
    <Router>
      <Navbar user={user} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/profile"
            element={user ? <Profile user={user} /> : <Navigate to="/auth" />}
          />
          <Route
            path="/auth"
            element={!user ? <Auth /> : <Navigate to="/profile" />}
          />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
