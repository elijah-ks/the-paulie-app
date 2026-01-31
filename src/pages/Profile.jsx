import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../App.css"; 
import { query, where } from "firebase/firestore";
import { updateDoc, arrayUnion} from "firebase/firestore";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSchoolSearch, setShowSchoolSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [fanSince, setFanSince] = useState("");
  const [fanConnection, setFanConnection] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [bioBox, setBioBox] = useState("");


useEffect(() => {
  const fetchData = async () => {
    try {
      const auth = getAuth();

      // Wait for Firebase to confirm the current user
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.log("No user signed in");
          setLoading(false);
          return;
        }

        // ✅ Now it's safe to fetch the profile
        const profileRef = doc(db, "profiles", user.uid);
        const profileSnap = await getDoc(profileRef);

        if (!profileSnap.exists()) {
          console.log("No profile found");
          setLoading(false);
          return;
        }

        const profileData = profileSnap.data();
        setProfile(profileData);

        setBioBox(profileData.Bio || "");


        // ✅ Fetch all schools
        const schoolsRef = collection(db, "schools");
        const schoolsSnapshot = await getDocs(schoolsRef);
        const schoolData = schoolsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchools(schoolData);

        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  fetchData();
}, []);

useEffect(() => {
  const fetchTeams = async () => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const q = query(
        collection(db, "schools"),
        where("keywords", "array-contains", searchTerm.toLowerCase())
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for teams:", error);
    }
  };

  fetchTeams();
}, [searchTerm]);


const handleAddFavorite = async (teamId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first");
      return;
    }

    const profileRef = doc(db, "profiles", user.uid);
    await updateDoc(profileRef, {
      FavoriteTeams: arrayUnion(teamId),
    });

    // Reflect changes instantly in UI
    setProfile((prev) => ({
      ...prev,
      FavoriteTeams: [...(prev.FavoriteTeams || []), teamId],
    }));

    setShowSchoolSearch(false);
    setSearchTerm("");
    setSearchResults([]);
  } catch (error) {
    console.error("Error adding favorite team:", error);
  }
};

const handleSubmitFavorite = async (teamId) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Please sign in first");
      return;
    }

    if (!fanSince || !fanConnection) {
      alert("Please fill out all fields.");
      return;
    }

    // Store as an object inside FavoriteTeams array
    const profileRef = doc(db, "profiles", user.uid);
    const newFavorite = {
      teamId,
      fanSince,
      fanConnection,
      addedAt: new Date(),
    };

    await updateDoc(profileRef, {
      FavoriteTeams: arrayUnion(newFavorite),
    });

    // Update UI immediately
    setProfile((prev) => ({
      ...prev,
      FavoriteTeams: [...(prev.FavoriteTeams || []), newFavorite],
    }));

    // Reset modal
    setShowSchoolSearch(false);
    setSelectedSchool(null);
    setFanSince("");
    setFanConnection("");
    setSearchTerm("");
    setSearchResults([]);
  } catch (error) {
    console.error("Error saving fan info:", error);
  }
};

const handleSaveBio = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const profileRef = doc(db, "profiles", user.uid);

    await updateDoc(profileRef, {
      Bio: bioBox,
    });

    setProfile((prev) => ({
      ...prev,
      Bio: bioBox,
    }));

    alert("Bio updated!");
  } catch (error) {
    console.error("Error updating bio:", error);
  }
};


  if (loading) return <p className="loading-text">Loading profile...</p>;
  if (!profile) return <p>No profile data found</p>;

  return (
      <div className="profile-container">
        <button className="settings-icon" onClick={() => setShowSettingsModal(true)}>⚙️</button>
        <h1 className="profile-name">{profile.displayName}</h1>
        <p className="profile-handle">{profile.Handle}</p>
        <p className="profile-bio">“{profile.Bio}”</p>

        <div className="profile-stats">
          <span><strong>{profile.FollowersCount}</strong> Followers</span>
          <span><strong>{profile.FollowingCount}</strong> Following</span>
        </div>

        <h2 className="section-title">
          <span>Favorite Teams</span>
          <button 
            className="add-team-btn"
            onClick={() => setShowSchoolSearch(true)}
          >
            + Add
          </button>
        </h2>
        <ul className="team-list">
            {profile.FavoriteTeams?.map((fav, idx) => {
              const school = schools.find((s) => s.id === fav.teamId);
              return (
                <li key={idx} className="team-item">
                  <img
                    src={
                      school?.logoURL ||
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                    }
                    alt={school?.shortName || fav.teamId}
                    className="team-logo"
                  />
                  <div className="team-info">
                    <span className="team-name">{school?.shortName || fav.teamId}</span>
                    {fav.fanSince && (
                      <p className="team-meta">
                        Fan since: {new Date(fav.fanSince).toLocaleDateString()}
                      </p>
                    )}
                    {fav.fanConnection && (
                      <p className="team-meta">Connection: {fav.fanConnection}</p>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
        {showSchoolSearch && (
  <div className="school-search-modal">
    <div className="school-search-box">
      
      <button 
        onClick={() => setShowSchoolSearch(false)} 
        className="close-search-btn">
        ✖ Close
      </button>

      <input
        type="text"
        placeholder="Search for a school..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="school-search-input"
      />

      {!selectedSchool ? (
        // 🔹 Step 3a: Show search results when no team is selected
        <ul className="school-search-results">
          {searchResults.map((school) => (
            
            <li 
              key={school.id}
              className="school-search-item"
              onClick={() => setSelectedSchool(school)}
            >
              <img 
                src={
                  school.logoURL ||
                  "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                }
                alt={school.shortName || school.id}
                className="team-logo"
              />
              <span id="school-search-logo">{school.shortName || school.id}</span>
            </li>
            
          ))}
        </ul>
      ) : (
        
        // 🔹 Step 3b: Show the fan questions form when a team is selected
        <div className="fan-question-form">
          <h3>{selectedSchool.shortName}</h3>

          <label>When did you start becoming a fan?</label>
          <input
            type="date"
            value={fanSince}
            onChange={(e) => setFanSince(e.target.value)}
          />

          <label>Why did you become a fan?</label>
          <select
            value={fanConnection}
            onChange={(e) => setFanConnection(e.target.value)}
          >
            <option value="">Select reason</option>
            <option value="native">Native</option>
            <option value="alumni">Alumni</option>
            <option value="work_here">Work Here</option>
            <option value="family">Family</option>
            <option value="just_fan">Just a Fan</option>
          </select>

          <div className="fan-form-buttons">
            <button onClick={() => setSelectedSchool(null)}>← Back</button>
            <button onClick={() => handleSubmitFavorite(selectedSchool.id)}>Save</button>
          </div>
        </div>
      )}
          </div>
        </div>
      )}

      {showSettingsModal && (
  <div className="settings-modal">
    <div className="settings-modal-box">
      
      <button
        className="close-search-btn"
        onClick={() => setShowSettingsModal(false)}
      >
        ✖ Close
      </button>

      <h2>Settings</h2>

      {/* Settings content goes here */}
    <textarea
      className="settings-textbox"
      value={bioBox}
      onChange={(e) => setBioBox(e.target.value)}
      placeholder="Write your bio..."
      rows="4"
    />

    <button className="save-bio-btn" onClick={handleSaveBio}>
      Save Bio
    </button>


    </div>
  </div>
)}

      </div>
  );
}
