import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow">
                            <span className="text-white font-bold text-sm">E</span>
                        </div>
                        <span className="text-lg font-extrabold text-white group-hover:text-blue-400 transition">EduSphere</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-1">
                        <Link
                            to="/courses"
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/courses') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Courses
                        </Link>

                        {isAuthenticated && user?.role === 'student' && (
                            <Link
                                to="/my-courses"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/my-courses') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                คอร์สเรียน
                            </Link>
                        )}

                        {isAuthenticated && user?.role === 'instructor' && (
                            <Link
                                to="/instructor"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${isActive('/instructor') ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                แดชบอร์ดผู้สอน
                            </Link>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                        {user?.full_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-sm text-slate-300 max-w-[120px] truncate">{user?.full_name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-white/10 hover:border-white/30 rounded-lg transition"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-white transition"
                                >
                                    เข้าสู่ระบบ
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow transition"
                                >
                                    เริ่มต้นใช้งาน
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
