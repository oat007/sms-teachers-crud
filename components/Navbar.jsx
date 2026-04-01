// components/Navbar.jsx
'use client'
import { useRouter } from 'next/navigation'
import styles from './Navbar.module.css'

export default function Navbar() {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🎓</span>
        <span className={styles.brandText}>SMS</span>
        <span className={styles.brandSub}>School Management System</span>
      </div>
      <div className={styles.actions}>
        <span className={styles.course}>SE311 Web App Dev</span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          ออกจากระบบ
        </button>
      </div>
    </nav>
  )
}
