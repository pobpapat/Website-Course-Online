import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCoursesAPI } from '../services/api'

function CourseCard({ course }) {
    return (
        <Link to={`/courses/${course.id}`} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/40 hover:bg-white/8 transition-all">
            <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                {course.thumbnail_url ? (
                    <img src={course.thumbnail_url.startsWith('http') ? course.thumbnail_url : `http://localhost:8080${course.thumbnail_url}`} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🎓</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-white text-base mb-1 line-clamp-2 group-hover:text-blue-400 transition">{course.title}</h3>
                <p className="text-slate-500 text-sm mb-3">{course.instructor?.full_name || 'ผู้สอนไม่ระบุ'}</p>
                <p className="text-slate-400 text-xs mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-400">
                        {course.price === 0 ? 'ฟรี' : `$${course.price}`}
                    </span>
                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-lg">ดูรายละเอียด →</span>
                </div>
            </div>
        </Link>
    )
}

export default function Courses() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [courses, setCourses] = useState([])
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '')

    const page = parseInt(searchParams.get('page') || '1')

    const fetchCourses = async () => {
        setLoading(true)
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (maxPrice) params.set('max_price', maxPrice)
        params.set('page', page)
        params.set('limit', 12)
        const res = await getCoursesAPI('?' + params.toString())
        setCourses(res.courses || [])
        setMeta(res.meta || { total: 0, page: 1, limit: 12 })
        setLoading(false)
    }

    useEffect(() => { fetchCourses() }, [page, searchParams])

    const handleSearch = (e) => {
        e.preventDefault()
        const params = {}
        if (search) params.search = search
        if (maxPrice) params.max_price = maxPrice
        params.page = 1
        setSearchParams(params)
    }

    const totalPages = Math.ceil(meta.total / meta.limit)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">ค้นหาคอร์สเรียน</h1>
                <p className="text-slate-400">ค้นพบคลังคอร์สเรียนจากผู้เชี่ยวชาญของเรา</p>
            </div>

            {/* Search & Filter */}
            <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="ค้นหาคอร์สเรียน..."
                    className="flex-1 min-w-[200px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="ราคาสูงสุด"
                    min="0"
                    className="w-32 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition"
                >
                    ค้นหา
                </button>
                {(search || maxPrice) && (
                    <button
                        type="button"
                        onClick={() => { setSearch(''); setMaxPrice(''); setSearchParams({ page: 1 }) }}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl text-sm transition"
                    >
                        ล้าง
                    </button>
                )}
            </form>

            {/* Results */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                            <div className="aspect-video bg-white/10" />
                            <div className="p-5 space-y-2">
                                <div className="h-4 bg-white/10 rounded" />
                                <div className="h-3 bg-white/5 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-slate-400 text-lg">ไม่พบคอร์สเรียน ลองค้นหาใหม่อีกครั้ง</p>
                </div>
            ) : (
                <>
                    <p className="text-slate-500 text-sm mb-4">พบ {meta.total} คอร์สเรียน</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {courses.map(course => <CourseCard key={course.id} course={course} />)}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-10">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setSearchParams({ ...Object.fromEntries(searchParams), page: p })}
                                    className={`w-10 h-10 rounded-lg text-sm font-medium transition ${p === page ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
