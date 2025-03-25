import { FiHome, FiGithub } from 'react-icons/fi'
import Link from 'next/link'

const Sidebar = () => {
  const navItems = [
    { icon: FiHome, href: '/', label: 'Dashboard' },
    { icon: FiGithub, href: '/github', label: 'GitHub' },
  ]

  return (
    <aside className="w-14 h-screen bg-black flex flex-col items-center py-6 fixed left-0">
      <div className="mb-12">
        <Link href="/">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center transform transition-transform hover:scale-105">
            <span className="text-primary-900 font-medium text-sm">P</span>
          </div>
        </Link>
      </div>
      
      <nav className="flex flex-col gap-8">
        {navItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="text-primary-500/60 hover:text-primary-500 transition-all duration-200 transform hover:scale-110"
            title={item.label}
          >
            <item.icon size={20} />
          </Link>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar 