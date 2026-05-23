import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCourseDetailAPI, enrollCourseAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function CourseDetail() {
    const { id } = useParams()
    const { token, isAuthenticated, user } = useAuth()
    const navigate = useNavigate()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [openModule, setOpenModule] = useState(null)

    useEffect(() => {
        getCourseDetailAPI(id).then(data => {
            setCourse(data)
            setLoading(false)
            if (data.modules?.length > 0) setOpenModule(data.modules[0].id)
        })
    }, [id])

    const handleEnroll = async () => {
        if (!isAuthenticated) { navigate('/login'); return }
        if (user?.role === 'instructor') return
        
        if (course.price > 0) {
            navigate(`/payment/${id}`)
            return
        }

        setEnrolling(true)
        const res = await enrollCourseAPI(id, token)
        if (res.message) {
            setMessage({ type: 'success', text: 'ลงทะเบียนสำเร็จ! เริ่มเรียนได้เลย' })
        } else {
            setMessage({ type: 'error', text: res.error || 'การลงทะเบียนล้มเหลว' })
        }
        setEnrolling(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!course?.id) return (
        <div className="text-center py-20">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-slate-400">ไม่พบคอร์สเรียนนี้</p>
            <Link to="/courses" className="mt-4 inline-block text-blue-400 hover:text-blue-300">← กลับไปหน้าคอร์สเรียน</Link>
        </div>
    )

    const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Link to="/courses" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6 transition">
                ← กลับไปหน้าคอร์สเรียน
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl overflow-hidden mb-6">
                        {course.thumbnail_url ? (
                            <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:8080${course.thumbnail_url}`} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-7xl">🎓</div>
                        )}
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-3">{course.title}</h1>
                    <p className="text-slate-400 mb-4">สอนโดย <span className="text-blue-400">{course.instructor?.full_name || 'ผู้สอนไม่ระบุ'}</span></p>
                    <p className="text-slate-300 leading-relaxed mb-8">{course.description}</p>

                    {/* Curriculum */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">เนื้อหาหลักสูตร</h2>
                        <p className="text-sm text-slate-400 mb-4">{course.modules?.length || 0} บท · {totalLessons} บทเรียน</p>
                        <div className="space-y-3">
                            {(course.modules || []).map(module => (
                                <div key={module.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setOpenModule(openModule === module.id ? null : module.id)}
                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
                                    >
                                        <span className="font-semibold text-white">{module.title}</span>
                                        <span className="text-slate-400 text-sm">{openModule === module.id ? '▲' : '▼'} {module.lessons?.length || 0} บทเรียน</span>
                                    </button>
                                    {openModule === module.id && (
                                        <div className="border-t border-white/10">
                                            {(module.lessons || []).map((lesson, li) => (
                                                <div key={lesson.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                                                    <span className="text-slate-500 text-xs w-5">{li + 1}.</span>
                                                    <span className="text-sm">{lesson.content_type === 'video' ? '🎬' : '📄'}</span>
                                                    <span className="text-slate-300 text-sm flex-1">{lesson.title}</span>
                                                    <span className="text-xs text-slate-500 capitalize">{lesson.content_type}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <div className="text-3xl font-bold text-white mb-2">
                            {course.price === 0 ? <span className="text-green-400">ฟรี</span> : `฿${course.price}`}
                        </div>

                        {message.text && (
                            <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/40 text-green-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {message.type === 'success' ? (
                            <button
                                onClick={() => navigate(`/courses/${id}/learn`)}
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg transition mb-3"
                            >
                                เริ่มเรียน →
                            </button>
                        ) : user?.role === 'instructor' ? (
                            course.instructor?.id === user?.id ? (
                                <button
                                    onClick={() => navigate(`/courses/${id}/learn`)}
                                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] mb-3"
                                >
                                    เข้าสู่บทเรียน (โหมดผู้สอน) →
                                </button>
                            ) : (
                                <div className="w-full py-3 bg-slate-800 text-slate-400 text-center font-semibold rounded-xl mb-3 border border-slate-700">
                                    คุณเป็นผู้สอน ไม่สามารถสมัครเรียนคอร์สของผู้อื่นได้
                                </div>
                            )
                        ) : (
                            <button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] mb-3"
                            >
                                {enrolling ? 'กำลังดำเนินการ...' : isAuthenticated ? 'สมัครเรียน' : 'เข้าสู่ระบบเพื่อสมัครเรียน'}
                            </button>
                        )}

                        <div className="space-y-3 mt-4 text-sm text-slate-400">
                            <div className="flex items-center gap-2"><span>📚</span><span>{course.modules?.length || 0} บทเรียนหลัก</span></div>
                            <div className="flex items-center gap-2"><span>🎯</span><span>{totalLessons} บทเรียนย่อย</span></div>
                            <div className="flex items-center gap-2"><span>♾️</span><span>เข้าเรียนได้ตลอดชีพ</span></div>
                            <div className="flex items-center gap-2"><span>📱</span><span>เรียนได้ทุกอุปกรณ์</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
