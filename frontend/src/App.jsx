import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { api } from "./api.js";
import { t } from "./translations.js";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Posts from "./pages/Posts.jsx";
import Post from "./pages/Post.jsx";
import CreatePost from "./pages/CreatePost.jsx";
import EditPost from "./pages/EditPost.jsx";
import Profile from "./pages/Profile.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import MenuManager from "./pages/MenuManager.jsx";
import Languages from "./pages/Languages.jsx";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(() => localStorage.getItem("language") || "ru");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem("user"); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const login = u => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  const logout = async () => {
    try { await api.logout(); } catch {}
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) return <h2 style={{ fontFamily: "Franklin Gothic Medium" }}>{t(lang, "loading")}</h2>;

  return (
    <>
      <Navbar user={user} onLogout={logout} lang={lang} setLang={setLang} />

      <main style={{ padding: "25px" }}>
        <Routes>
          <Route path="/" element={<ProtectedRoute user={user}><Posts user={user} lang={lang} /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<ProtectedRoute user={user}><Post user={user} lang={lang} /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute user={user}><CreatePost lang={lang} /></ProtectedRoute>} />
          <Route path="/posts/:id/edit" element={<EditPost user={user} lang={lang} />} />
          <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} setUser={setUser} lang={lang} /></ProtectedRoute>} />
          <Route path="/user/:id" element={<ProtectedRoute user={user}><UserProfile user={user} lang={lang} /></ProtectedRoute>} />
          <Route path="/menu" element={<ProtectedRoute user={user}><MenuManager user={user} lang={lang} /></ProtectedRoute>} />

          <Route path="/admin/users" element={<AdminRoute user={user}><AdminUsers user={user} lang={lang} /></AdminRoute>} />
          <Route path="/admin/languages" element={<AdminRoute user={user}><Languages lang={lang} /></AdminRoute>} />

          <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} lang={lang} />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register lang={lang} />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;