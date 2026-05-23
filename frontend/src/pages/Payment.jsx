import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCourseDetailAPI, enrollCourseAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Payment() {
    const { id } = useParams()
    const { token, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        getCourseDetailAPI(id).then(data => {
            setCourse(data)
            setLoading(false)
        })
    }, [id, isAuthenticated, navigate])

    const handlePayment = async () => {
        setPaying(true)
        const res = await enrollCourseAPI(id, token)
        if (res.message) {
            setMessage({ type: 'success', text: 'ชำระเงินสำเร็จ! กำลังพาท่านไปยังหน้าเรียน...' })
            setTimeout(() => {
                navigate(`/courses/${id}/learn`)
            }, 1500)
        } else {
            setMessage({ type: 'error', text: res.error || 'การชำระเงินล้มเหลว' })
            setPaying(false)
        }
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

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <Link to={`/courses/${id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-8 transition">
                ← กลับไปรายละเอียดคอร์ส
            </Link>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">ชำระเงินค่าคอร์สเรียน</h1>
                    <p className="text-slate-400">สแกน QR Code เพื่อชำระเงินผ่าน PromptPay</p>
                </div>

                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                    {/* QR Code Mockup */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white p-4 rounded-2xl aspect-square flex flex-col items-center justify-center">
                            {/* Fake QR Image placeholder using CSS patterns */}
                            <div className="w-full h-full border-4 border-slate-900 relative">
                                <div className="absolute top-2 left-2 w-8 h-8 border-4 border-slate-900" />
                                <div className="absolute top-2 right-2 w-8 h-8 border-4 border-slate-900" />
                                <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-slate-900" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">PromptPay</span>
                                </div>
                                <div className="w-full h-full bg-[radial-gradient(#1e293b_3px,transparent_4px)] [background-size:12px_12px] opacity-30" />
                            </div>
                        </div>
                        <p className="text-center text-slate-400 text-sm mt-4">จำลองการสแกน QR Code</p>
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 w-full">
                        <div className="bg-slate-900/50 rounded-xl p-6 mb-8 border border-white/5">
                            <h3 className="font-semibold text-white mb-4">สรุปคำสั่งซื้อ</h3>
                            <div className="flex justify-between items-start mb-3 pb-3 border-b border-white/10">
                                <span className="text-slate-400 pr-4">{course.title}</span>
                                <span className="text-white whitespace-nowrap">฿{course.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span className="text-white">ยอดชำระสุทธิ</span>
                                <span className="text-blue-400">฿{course.price}</span>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/40 text-green-300' : 'bg-red-500/20 border border-red-500/40 text-red-300'}`}>
                                {message.text}
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={paying || message.type === 'success'}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
                        >
                            {paying ? 'กำลังดำเนินการ...' : 'ยืนยันการชำระเงิน (จำลอง)'}
                        </button>
                        
                        <p className="text-center text-slate-500 text-xs mt-4">
                            หมายเหตุ: นี่เป็นระบบชำระเงินจำลองเพื่อการทดสอบเท่านั้น
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
