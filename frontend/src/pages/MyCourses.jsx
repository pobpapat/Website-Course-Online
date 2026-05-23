import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyCoursesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function ProgressBar({ value }) {
    return (
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, value || 0)}%` }}
            />
        </div>
    )
}

export default function MyCourses() {
    const { token, user } = useAuth()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getMyCoursesAPI(token).then(res => {
            setCourses(res.my_courses || [])
            setLoading(false)
        })
    }, [token])

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-1">คอร์สของฉัน</h1>
                <p className="text-slate-400">ยินดีต้อนรับกลับมา, <span className="text-white">{user?.full_name}</span>!</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-slate-400 text-sm mb-1">คอร์สที่ลงทะเบียน</p>
                    <p className="text-3xl font-bold text-white">{courses.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-slate-400 text-sm mb-1">เรียนจบแล้ว</p>
                    <p className="text-3xl font-bold text-green-400">
                        {courses.filter(c => c.progress_percent === 100).length}
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <p className="text-slate-400 text-sm mb-1">กำลังเรียน</p>
                    <p className="text-3xl font-bold text-blue-400">
                        {courses.filter(c => c.progress_percent > 0 && c.progress_percent < 100).length}
                    </p>
                </div>
            </div>

            {/* Course List */}
            {courses.length === 0 ? (
                <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="text-5xl mb-4">📚</div>
                    <p className="text-slate-300 text-lg font-medium mb-2">ยังไม่มีคอร์สเรียน</p>
                    <p className="text-slate-400 mb-6">เลือกดูแคตตาล็อกของเราและสมัครเรียนคอร์สแรกของคุณ</p>
                    <Link
                        to="/courses"
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl transition hover:opacity-90"
                    >
                        ค้นหาคอร์สเรียน
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition">
                            <div className="flex">
                                <div className="w-28 h-28 flex-shrink-0 bg-gradient-to-br from-slate-700 to-slate-800">
                                    {course.thumbnail_url ? (
                                        <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:8080${course.thumbnail_url}`} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-3xl">🎓</div>
                                    )}
                                </div>
                                <div className="flex-1 p-4">
                                    <h3 className="font-semibold text-white mb-1 line-clamp-1">{course.title}</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <ProgressBar value={course.progress_percent} />
                                        <span className="text-xs text-slate-400 flex-shrink-0">{Math.round(course.progress_percent || 0)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-slate-500">
                                            {course.completed_lessons}/{course.total_lessons} บทเรียน
                                        </p>
                                        <Link
                                            to={`/courses/${course.id}/learn`}
                                            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                                        >
                                            {course.progress_percent === 100 ? 'ทบทวน →' : course.progress_percent > 0 ? 'เรียนต่อ →' : 'เริ่มเรียน →'}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {courses.length > 0 && (
                <div className="mt-8 text-center">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-medium rounded-xl text-sm transition"
                    >
                        + ค้นหาคอร์สเรียนเพิ่มเติม
                    </Link>
                </div>
            )}
        </div>
    )
}
