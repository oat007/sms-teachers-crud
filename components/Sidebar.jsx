// components/Sidebar.jsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

const menuItems = [
  { href: '/dashboard', label: 'แดชบอร์ด', icon: '🏠' },
  { href: '/students', label: 'นักศึกษา', icon: '👨‍🎓' },
  { href: '/teachers', label: 'อาจารย์', icon: '👨‍🏫' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <p className={styles.sectionLabel}>เมนูหลัก</p>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
              {isActive && <span className={styles.activeIndicator} />}
            </Link>
          )
        })}
      </nav>
      <div className={styles.footer}>
        <p className={styles.version}>v1.0.0</p>
      </div>
    </aside>
  )
}
