import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Learn from './pages/Learn'
import MyCourses from './pages/MyCourses'
import InstructorDashboard from './pages/InstructorDashboard'
import Payment from './pages/Payment'

// Protected route wrapper
function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/:id/learn" element={
          <ProtectedRoute><Learn /></ProtectedRoute>
        } />
        <Route path="/payment/:id" element={
          <ProtectedRoute><Payment /></ProtectedRoute>
        } />
        <Route path="/my-courses" element={
          <ProtectedRoute><MyCourses /></ProtectedRoute>
        } />
        <Route path="/instructor" element={
          <ProtectedRoute role="instructor"><InstructorDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
