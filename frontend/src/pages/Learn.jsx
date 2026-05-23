import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getLearningContentAPI, completeLessonAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Learn() {
    const { id } = useParams()
    const { token } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeLesson, setActiveLesson] = useState(null)
    const [completing, setCompleting] = useState(false)

    const fetchContent = async () => {
        const res = await getLearningContentAPI(id, token)
        setData(res)
        setLoading(false)
        // Auto-select first incomplete lesson
        if (res.course?.modules) {
            for (const mod of res.course.modules) {
                for (const lesson of (mod.lessons || [])) {
                    if (!res.progress?.[lesson.id]) { setActiveLesson(lesson); return }
                }
            }
            // All completed - select first
            if (res.course.modules[0]?.lessons?.[0]) setActiveLesson(res.course.modules[0].lessons[0])
        }
    }

    useEffect(() => { fetchContent() }, [id])

    const handleComplete = async () => {
        if (!activeLesson) return
        setCompleting(true)
        await completeLessonAPI(activeLesson.id, token)
        await fetchContent()
        setCompleting(false)
        // Auto-advance to next lesson
        goToNext()
    }

    const allLessons = data?.course?.modules?.flatMap(m => m.lessons || []) || []
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id)
    const goToNext = () => { if (currentIndex < allLessons.length - 1) setActiveLesson(allLessons[currentIndex + 1]) }
    const goToPrev = () => { if (currentIndex > 0) setActiveLesson(allLessons[currentIndex - 1]) }

    const completedCount = Object.values(data?.progress || {}).filter(Boolean).length
    const totalCount = allLessons.length
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (data?.error) return (
        <div className="text-center py-20">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-slate-400 mb-4">{data.error}</p>
            <Link to={`/courses/${id}`} className="text-blue-400 hover:text-blue-300">← กลับไปหน้าคอร์ส</Link>
        </div>
    )

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0 bg-slate-900/80 border-r border-white/10 overflow-y-auto">
                <div className="p-4 border-b border-white/10">
                    <Link to={`/courses/${id}`} className="text-xs text-slate-500 hover:text-slate-300 transition">← รายละเอียดคอร์ส</Link>
                    <h2 className="font-bold text-white mt-2 text-sm line-clamp-2">{data?.course?.title}</h2>
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>{completedCount}/{totalCount} บทเรียน</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    {(data?.course?.modules || []).map(module => (
                        <div key={module.id} className="mb-3">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold px-2 py-2">{module.title}</p>
                            {(module.lessons || []).map((lesson, li) => {
                                const isCompleted = data?.progress?.[lesson.id]
                                const isActive = activeLesson?.id === lesson.id
                                return (
                                    <button
                                        key={lesson.id}
                                        onClick={() => setActiveLesson(lesson)}
                                        className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left mb-1 transition text-sm ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs border ${isCompleted ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'border-white/20 text-slate-500'
                                            }`}>
                                            {isCompleted ? '✓' : li + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium truncate ${isActive ? 'text-blue-300' : isCompleted ? 'text-slate-400' : 'text-slate-200'}`}>
                                                {lesson.title}
                                            </p>
                                            <p className="text-xs text-slate-600 mt-0.5">
                                                {lesson.content_url && lesson.body_text ? 'วิดีโอ & บทความ' : lesson.content_url ? 'วิดีโอ' : lesson.body_text ? 'บทความ' : 'เนื้อหา'}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {activeLesson ? (
                    <div className="p-6 max-w-4xl mx-auto">
                        {/* Lesson Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">บทเรียน</p>
                                <h1 className="text-2xl font-bold text-white">{activeLesson.title}</h1>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{currentIndex + 1} / {totalCount}</span>
                            </div>
                        </div>

                        {/* Video Content */}
                        {activeLesson.content_url && (
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6">
                                <video
                                    key={activeLesson.id}
                                    src={activeLesson.content_url.startsWith('http') ? activeLesson.content_url : `http://localhost:8080${activeLesson.content_url}`}
                                    controls
                                    className="w-full h-full"
                                />
                            </div>
                        )}

                        {/* Article Content */}
                        {activeLesson.body_text && (
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 prose prose-invert max-w-none">
                                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{activeLesson.body_text}</div>
                            </div>
                        )}

                        {/* No Content */}
                        {!activeLesson.content_url && !activeLesson.body_text && (
                            <div className="aspect-video bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">📝</div>
                                    <p className="text-slate-400">เนื้อหายังไม่พร้อมใช้งาน</p>
                                </div>
                            </div>
                        )}

                        {/* Navigation & Complete Button */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={goToPrev}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 disabled:opacity-30 rounded-xl text-sm transition"
                            >
                                ← ก่อนหน้า
                            </button>

                            <div className="flex items-center gap-3">
                                {data?.progress?.[activeLesson.id] ? (
                                    <span className="flex items-center gap-2 text-green-400 text-sm font-medium">
                                        <span className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-xs">✓</span>
                                        เรียนแล้ว
                                    </span>
                                ) : (
                                    <button
                                        onClick={handleComplete}
                                        disabled={completing}
                                        className="px-5 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all transform hover:scale-[1.02]"
                                    >
                                        {completing ? 'กำลังบันทึก...' : 'ทำเครื่องหมายว่าเรียนแล้ว ✓'}
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={goToNext}
                                disabled={currentIndex === allLessons.length - 1}
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 disabled:opacity-30 rounded-xl text-sm transition"
                            >
                                ถัดไป →
                            </button>
                        </div>

                        {/* Progress complete message */}
                        {progressPct === 100 && (
                            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                                <div className="text-2xl mb-2">🎉</div>
                                <p className="text-green-400 font-semibold">ยินดีด้วย! คุณเรียนจบคอร์สนี้แล้ว</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400">เลือกบทเรียนเพื่อเริ่มเรียน</p>
                    </div>
                )}
            </div>
        </div>
    )
}
