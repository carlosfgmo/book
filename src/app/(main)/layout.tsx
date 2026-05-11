import Navbar from '@/components/shared/Navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-stone-50">{children}</div>
    </>
  )
}
