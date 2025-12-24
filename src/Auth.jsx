import { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function Auth({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isRegister) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

       const username = email.split("@")[0];

      // 🔹 Set Auth displayName
      await updateProfile(userCredential.user, {
        displayName: username,
      });

        // Create a Firestore profile for new users
        await setDoc(doc(db, "profiles", userCredential.user.uid), {
          displayName: email.split("@")[0],
          Handle: `@${email.split("@")[0]}`,
          Bio: "New user joined!",
          FollowersCount: 0,
          FollowingCount: 0,
          FavoriteTeams: []
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>{isRegister ? "Register" : "Login"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegister ? "Create Account" : "Sign In"}</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="toggle-auth">
          {isRegister ? "Already have an account?" : "Need an account?"}{" "}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}
