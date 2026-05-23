import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    getInstructorCoursesAPI,
    getInstructorAnalyticsAPI,
    createCourseAPI,
    createModuleAPI,
    createLessonAPI,
    uploadFileAPI,
} from '../services/api'
import { useAuth } from '../context/AuthContext'

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color = 'text-white' }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">{icon} {label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    )
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition text-xl leading-none">×</button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    )
}

function InputField({ label, type = 'text', value, onChange, placeholder, required }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
            ) : (
                <input
                    type={type}
                    required={required}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
            )}
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function InstructorDashboard() {
    const { token, user } = useAuth()
    const [tab, setTab] = useState('overview')
    const [analytics, setAnalytics] = useState(null)
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal states
    const [showCreateCourse, setShowCreateCourse] = useState(false)
    const [showAddModule, setShowAddModule] = useState(null)   // courseId
    const [showAddLesson, setShowAddLesson] = useState(null)   // moduleId
    const [expandedCourse, setExpandedCourse] = useState(null)

    // Form states
    const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '' })
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [moduleForm, setModuleForm] = useState({ title: '', sort_order: 0 })
    const [lessonForm, setLessonForm] = useState({ title: '', content_type: 'mixed', content_url: '', body_text: '', sort_order: 0 })
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')

    const fetchData = async () => {
        setLoading(true)
        const [analyticsRes, coursesRes] = await Promise.all([
            getInstructorAnalyticsAPI(token),
            getInstructorCoursesAPI(token),
        ])
        setAnalytics(analyticsRes)
        setCourses(coursesRes.courses || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    // ── Handlers ──

    const handleCreateCourse = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')
        try {
            let thumbnailUrl = ''
            if (thumbnailFile) {
                const uploadRes = await uploadFileAPI(thumbnailFile, token)
                thumbnailUrl = uploadRes.url || ''
            }
            const res = await createCourseAPI({
                title: courseForm.title,
                description: courseForm.description,
                price: parseFloat(courseForm.price) || 0,
                thumbnail_url: thumbnailUrl,
            }, token)
            if (res.course) {
                setShowCreateCourse(false)
                setCourseForm({ title: '', description: '', price: '' })
                setThumbnailFile(null)
                fetchData()
            } else {
                setFormError(res.error || 'Failed to create course')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const handleAddModule = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')
        const res = await createModuleAPI(showAddModule, moduleForm, token)
        if (res.module) {
            setShowAddModule(null)
            setModuleForm({ title: '', sort_order: 0 })
            fetchData()
        } else {
            setFormError(res.error || 'Failed')
        }
        setSubmitting(false)
    }

    const handleAddLesson = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setFormError('')
        const res = await createLessonAPI(showAddLesson, lessonForm, token)
        if (res.lesson) {
            setShowAddLesson(null)
            setLessonForm({ title: '', content_type: 'mixed', content_url: '', body_text: '', sort_order: 0 })
            fetchData()
        } else {
            setFormError(res.error || 'Failed')
        }
        setSubmitting(false)
    }

    // ── Render ──

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    const tabs = [
        { id: 'overview', label: '📊 Overview' },
        { id: 'courses', label: '📚 My Courses' },
    ]

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Instructor Dashboard</h1>
                    <p className="text-slate-400">Welcome, <span className="text-white">{user?.full_name}</span></p>
                </div>
                <button
                    onClick={() => { setShowCreateCourse(true); setFormError('') }}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl text-sm shadow-lg transition-all transform hover:scale-[1.02]"
                >
                    + New Course
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === 'overview' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon="📚" label="Total Courses" value={analytics?.total_courses ?? 0} />
                        <StatCard icon="👥" label="Total Students" value={analytics?.total_students ?? 0} color="text-blue-400" />
                        <StatCard icon="💰" label="Total Revenue" value={`$${(analytics?.total_revenue ?? 0).toFixed(2)}`} color="text-green-400" />
                        <StatCard icon="⭐" label="Avg Students/Course" value={
                            analytics?.total_courses > 0
                                ? Math.round((analytics?.total_students ?? 0) / analytics.total_courses)
                                : 0
                        } color="text-purple-400" />
                    </div>

                    {/* Top Courses Table */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                            <h2 className="font-bold text-white">Top Performing Courses</h2>
                        </div>
                        {(analytics?.top_courses || []).length === 0 ? (
                            <div className="text-center py-10 text-slate-400">No courses yet. Create your first course!</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left px-5 py-3 text-slate-400 font-medium">Course</th>
                                            <th className="text-right px-5 py-3 text-slate-400 font-medium">Price</th>
                                            <th className="text-right px-5 py-3 text-slate-400 font-medium">Students</th>
                                            <th className="text-right px-5 py-3 text-slate-400 font-medium">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(analytics?.top_courses || []).map(course => (
                                            <tr key={course.id} className="border-b border-white/5 hover:bg-white/3 transition">
                                                <td className="px-5 py-3 text-white font-medium">{course.title}</td>
                                                <td className="px-5 py-3 text-right text-slate-400">${course.price}</td>
                                                <td className="px-5 py-3 text-right text-blue-400 font-semibold">{course.student_count}</td>
                                                <td className="px-5 py-3 text-right text-green-400 font-semibold">
                                                    ${(course.price * course.student_count).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Courses Tab */}
            {tab === 'courses' && (
                <div className="space-y-4">
                    {courses.length === 0 ? (
                        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="text-5xl mb-4">🎓</div>
                            <p className="text-slate-300 font-medium mb-2">No courses yet</p>
                            <p className="text-slate-400 mb-6 text-sm">Create your first course and start teaching!</p>
                            <button
                                onClick={() => setShowCreateCourse(true)}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl text-sm"
                            >
                                + Create Course
                            </button>
                        </div>
                    ) : courses.map(course => (
                        <div key={course.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            {/* Course Header */}
                            <div className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden flex-shrink-0">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:8080${course.thumbnail_url}`} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-2xl">🎓</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white">{course.title}</h3>
                                        <p className="text-sm text-slate-400">
                                            {course.price === 0 ? 'Free' : `$${course.price}`} ·{' '}
                                            <Link to={`/courses/${course.id}`} className="text-blue-400 hover:text-blue-300 transition">
                                                View public page →
                                            </Link>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setShowAddModule(course.id); setFormError('') }}
                                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg transition"
                                    >
                                        + Module
                                    </button>
                                    <button
                                        onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-lg transition"
                                    >
                                        {expandedCourse === course.id ? 'Collapse ▲' : 'Expand ▼'}
                                    </button>
                                </div>
                            </div>

                            {/* Modules List (expanded) */}
                            {expandedCourse === course.id && (
                                <div className="border-t border-white/10 p-5 space-y-3">
                                    {(!course.modules || course.modules.length === 0) ? (
                                        <p className="text-slate-500 text-sm">No modules yet. Add your first module!</p>
                                    ) : course.modules.map(module => (
                                        <div key={module.id} className="bg-white/5 border border-white/5 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-white text-sm">📁 {module.title}</span>
                                                <button
                                                    onClick={() => { setShowAddLesson(module.id); setFormError('') }}
                                                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                                                >
                                                    + Add Lesson
                                                </button>
                                            </div>
                                            {(module.lessons || []).length === 0 ? (
                                                <p className="text-slate-600 text-xs">No lessons yet</p>
                                            ) : (
                                                <div className="space-y-1">
                                                    {module.lessons.map((lesson, li) => (
                                                        <div key={lesson.id} className="flex items-center gap-2 text-xs text-slate-400 pl-2">
                                                            <span className="text-slate-600">{li + 1}.</span>
                                                            <span>{lesson.content_url && lesson.body_text ? '🎬📝' : lesson.content_url ? '🎬' : '📄'}</span>
                                                            <span className="text-slate-300">{lesson.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Modals ── */}

            {/* Create Course */}
            {showCreateCourse && (
                <Modal title="Create New Course" onClose={() => setShowCreateCourse(false)}>
                    <form onSubmit={handleCreateCourse} className="space-y-4">
                        {formError && <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">{formError}</div>}
                        <InputField label="Course Title *" value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. React for Beginners" required />
                        <InputField label="Description" type="textarea" value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="What will students learn?" />
                        <InputField label="Price ($)" type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} placeholder="0 for free" />
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Thumbnail Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setThumbnailFile(e.target.files[0])}
                                className="w-full text-sm text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-sm hover:file:bg-white/20 transition"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowCreateCourse(false)} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-sm transition hover:bg-white/10">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">
                                {submitting ? 'Creating...' : 'Create Course'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Module */}
            {showAddModule && (
                <Modal title="Add Module" onClose={() => setShowAddModule(null)}>
                    <form onSubmit={handleAddModule} className="space-y-4">
                        {formError && <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">{formError}</div>}
                        <InputField label="Module Title *" value={moduleForm.title} onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })} placeholder="e.g. Introduction" required />
                        <InputField label="Sort Order" type="number" value={moduleForm.sort_order} onChange={e => setModuleForm({ ...moduleForm, sort_order: parseInt(e.target.value) || 0 })} placeholder="0" />
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowAddModule(null)} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-sm transition hover:bg-white/10">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">
                                {submitting ? 'Adding...' : 'Add Module'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Add Lesson */}
            {showAddLesson && (
                <Modal title="Add Lesson" onClose={() => setShowAddLesson(null)}>
                    <form onSubmit={handleAddLesson} className="space-y-4">
                        {formError && <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm">{formError}</div>}
                        <InputField label="Lesson Title *" value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="e.g. What is React?" required />
                        <InputField label="Video URL (ใส่หรือไม่ก็ได้)" value={lessonForm.content_url} onChange={e => setLessonForm({ ...lessonForm, content_url: e.target.value })} placeholder="/uploads/video.mp4" />
                        <InputField label="Article Content (เนื้อหาบทเรียน / ข้อความ)" type="textarea" value={lessonForm.body_text} onChange={e => setLessonForm({ ...lessonForm, body_text: e.target.value })} placeholder="พิมพ์เนื้อหาที่นี่..." />
                        <InputField label="Sort Order" type="number" value={lessonForm.sort_order} onChange={e => setLessonForm({ ...lessonForm, sort_order: parseInt(e.target.value) || 0 })} placeholder="0" />
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowAddLesson(null)} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-400 rounded-xl text-sm transition hover:bg-white/10">Cancel</button>
                            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition">
                                {submitting ? 'Adding...' : 'Add Lesson'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}
