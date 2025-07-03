import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OptimisticPostProvider } from './context/OptimisticPostContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <OptimisticPostProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/create" element={<CreatePost />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/edit/:id" element={<EditPost />} />
              </Routes>
            </main>
          </div>
        </Router>
      </OptimisticPostProvider>
    </AuthProvider>
  );
}

export default App
