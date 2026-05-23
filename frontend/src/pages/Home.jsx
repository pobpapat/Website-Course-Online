import { Link } from 'react-router-dom'

const features = [
    { icon: '🚀', title: 'เทคโนโลยีทันสมัย', desc: 'ใช้ React + Vite + Tailwind CSS เพื่อให้หน้าเว็บทำงานได้รวดเร็วทันใจ' },
    { icon: '⚡', title: 'API ทรงพลัง', desc: 'ใช้ Go Fiber REST API ที่รองรับการทำงานพร้อมกันได้อย่างมีประสิทธิภาพ' },
    { icon: '🛡️', title: 'ปลอดภัยและเสถียร', desc: 'ระบบยืนยันตัวตนด้วย JWT, เข้ารหัสด้วย bcrypt, และฐานข้อมูล PostgreSQL' },
    { icon: '🎓', title: 'เรียนได้ทุกที่', desc: 'ติดตามความคืบหน้าการเรียนของคุณในทุกคอร์สที่คุณลงทะเบียนไว้' },
    { icon: '👨‍🏫', title: 'สอนและสร้างรายได้', desc: 'สร้างคอร์สเรียน, เพิ่มบทเรียน และสร้างรายได้จากความรู้ของคุณ' },
    { icon: '📊', title: 'สถิติที่ครอบคลุม', desc: 'แดชบอร์ดสำหรับผู้สอนเพื่อดูจำนวนผู้เรียนและสรุปรายได้' },
]

export default function Home() {
    return (
        <main>
            {/* Hero */}
            <section className="relative py-24 px-4 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
                <div className="relative max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        ระบบจัดการการเรียนรู้ระดับพรีเมียม
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-6 leading-tight">
                        EduSphere
                    </h1>
                    <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                        เรียนรู้จากผู้สอนระดับโลก ติดตามความคืบหน้าของคุณ และปลดล็อกศักยภาพของคุณไปกับแพลตฟอร์มการเรียนรู้ที่ทันสมัยของเรา
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link
                            to="/courses"
                            className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transition-all transform hover:scale-105"
                        >
                            เลือกดูคอร์สเรียน
                        </Link>
                        <Link
                            to="/register"
                            className="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-full transition"
                        >
                            เริ่มสอนกับเรา
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">ครบทุกสิ่งที่คุณต้องการสำหรับการเรียนและการสอน</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(f => (
                            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-white/20 transition group">
                                <div className="text-3xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4">
                <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl p-12">
                    <h2 className="text-3xl font-bold text-white mb-4">พร้อมที่จะเริ่มเรียนแล้วหรือยัง?</h2>
                    <p className="text-slate-400 mb-8">เข้าร่วมกับนักเรียนหลายพันคนที่กำลังเรียนรู้บน EduSphere</p>
                    <Link
                        to="/register"
                        className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg transition-all transform hover:scale-105"
                    >
                        สร้างบัญชีผู้ใช้ฟรี
                    </Link>
                </div>
            </section>
        </main>
    )
}
