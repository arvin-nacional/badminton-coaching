import Link from 'next/link'

export async function Footer() {
  return (
    <footer className="bg-[#071f42] px-5 py-10 text-white md:px-10">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-7 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="text-lg font-black">NEXT SHOT<span className="text-[#4cc9ff]">.</span></Link>
        <p className="text-sm text-white/50">Structured badminton coaching. Personal progress.</p>
        <div className="flex gap-6 text-sm font-bold"><Link href="/#programs">Programs</Link><Link href="/#assessment">Assessment</Link><Link href="/admin">Coach login</Link></div>
      </div>
    </footer>
  )
}
