import { useState, useEffect } from "react";
import { db } from "../firebase"; 
import { collection, addDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import "../App.css";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";




export default function Home() {

const auth = getAuth();
const [user] = useAuthState(auth);

  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);

  const postsRef = collection(db, "posts");
  const [profile, setProfile] = useState(null);

  // Load posts in real time
  useEffect(() => {
    const q = query(postsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe(); // cleanup
  }, []);

  // Add new post
  const handlePost = async () => {
      if (!user) {
    alert("You must be logged in to post.");
    return;
  }
    if (postText.trim() === "") return;


  await addDoc(postsRef, {
    uid: user.uid,                              // unique identifier for user
    displayName: profile?.displayName || user.displayName || "User",    // for showing post author
    text: postText,
    createdAt: new Date(),
  });

    setPostText("");
  };

  return (
      <div className="container">
        <h1>Welcome to Paulie 🏈</h1>

        {/* Post box */}
        <div className="post-box">
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's on your mind?"
          />
          <button onClick={handlePost}>Post</button>
        </div>

        {/* Posts feed */}
        <div className="posts-feed">
          {posts.map((post) => (
            <div key={post.id} className="post">
              <strong>{post.displayName || "User"}</strong>
              <p>{post.text}</p>
              {post.createdAt && (
                <small>
                  {post.createdAt.toDate
                    ? post.createdAt.toDate().toLocaleString()
                    : new Date(post.createdAt).toLocaleString()}
                </small>
              )}
            </div>
          ))}
        </div>
      </div>
  );
}
