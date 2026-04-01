'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
        return
      }

      localStorage.setItem('token', data.token)
      router.push('/teachers')
    } catch (err) {
      setError('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🎓</div>
          <h1 className={styles.title}>SMS</h1>
          <p className={styles.subtitle}>School Management System</p>
          <p className={styles.course}>SE311 Web Application Development</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.errorAlert}>
              ⚠️ {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>ชื่อผู้ใช้</label>
            <input
              type="text"
              className={styles.input}
              placeholder="กรอกชื่อผู้ใช้"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>รหัสผ่าน</label>
            <input
              type="password"
              className={styles.input}
              placeholder="กรอกรหัสผ่าน"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
