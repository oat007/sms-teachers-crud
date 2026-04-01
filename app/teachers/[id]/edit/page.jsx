'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import styles from './edit-teacher.module.css'

const API = process.env.NEXT_PUBLIC_API_URL

export default function EditTeacherPage({ params }) {
  const router = useRouter()
  const [form, setForm] = useState({
    teacher_no: '',
    first_name: '',
    last_name: '',
    email: '',
    status: 'active',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Fetch existing teacher data
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    fetch(`${API}/teachers/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return }
        const data = await res.json()
        const t = data.data || data
        setForm({
          teacher_no: t.teacher_no || '',
          first_name: t.first_name || '',
          last_name: t.last_name || '',
          email: t.email || '',
          status: t.status || 'active',
        })
      })
      .catch(() => setErrors({ api: 'ไม่สามารถโหลดข้อมูลได้' }))
      .finally(() => setLoading(false))
  }, [params.id, router])

  const validate = () => {
    const e = {}
    if (!form.teacher_no.trim()) e.teacher_no = 'กรุณากรอกรหัสอาจารย์'
    if (!form.first_name.trim()) e.first_name = 'กรุณากรอกชื่อ'
    if (!form.last_name.trim()) e.last_name = 'กรุณากรอกนามสกุล'
    if (!form.email.trim()) e.email = 'กรุณากรอกอีเมล'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    try {
      const res = await fetch(`${API}/teachers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (res.status === 401) { router.push('/login'); return }

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => router.push('/teachers'), 1500)
      } else {
        const data = await res.json()
        setErrors({ api: data.message || 'บันทึกข้อมูลไม่สำเร็จ' })
      }
    } catch {
      setErrors({ api: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </DashboardLayout>
    )
  }

  const inputFields = [
    { id: 'teacher_no', label: 'รหัสอาจารย์', placeholder: 'เช่น T001', type: 'text' },
    { id: 'first_name', label: 'ชื่อ', placeholder: 'ชื่อจริง', type: 'text' },
    { id: 'last_name', label: 'นามสกุล', placeholder: 'นามสกุล', type: 'text' },
    { id: 'email', label: 'อีเมล', placeholder: 'example@email.com', type: 'email' },
  ]

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/teachers">อาจารย์</Link>
            <span>/</span>
            <Link href={`/teachers/${params.id}`}>รายละเอียด</Link>
            <span>/</span>
            <span>แก้ไข</span>
          </div>
          <h1 className={styles.pageTitle}>แก้ไขข้อมูลอาจารย์</h1>
          <p className={styles.pageDesc}>ID: {params.id}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className={styles.formCard}>
        {/* Alerts */}
        {success && (
          <div className={styles.successAlert}>
            ✅ บันทึกข้อมูลเรียบร้อยแล้ว! กำลังกลับไปหน้ารายการ...
          </div>
        )}
        {errors.api && (
          <div className={styles.errorAlert}>❌ {errors.api}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ข้อมูลอาจารย์</h2>

            <div className={styles.grid}>
              {inputFields.map((f) => (
                <div className={styles.field} key={f.id}>
                  <label className={styles.label}>
                    {f.label}
                    <span className={styles.req}>*</span>
                  </label>
                  <input
                    type={f.type}
                    className={`${styles.input} ${errors[f.id] ? styles.inputError : ''}`}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={(e) => handleChange(f.id, e.target.value)}
                  />
                  {errors[f.id] && (
                    <p className={styles.fieldError}>⚠ {errors[f.id]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>สถานะ</label>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="active">✅ ใช้งาน</option>
                <option value="inactive">⛔ ไม่ใช้งาน</option>
              </select>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link href={`/teachers/${params.id}`} className={styles.cancelBtn}>
              ยกเลิก
            </Link>
            <button type="submit" className={styles.saveBtn} disabled={saving || success}>
              {saving ? (
                <><span className={styles.spinner} /> กำลังบันทึก...</>
              ) : '💾 บันทึกการแก้ไข'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
