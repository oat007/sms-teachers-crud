// components/DashboardLayout.jsx
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import styles from './DashboardLayout.module.css'

export default function DashboardLayout({ children }) {
  return (
    <>
      <Navbar />
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </>
  )
}
