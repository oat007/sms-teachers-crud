'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import styles from './create-teacher.module.css'

const API = process.env.NEXT_PUBLIC_API_URL

// ✅ ย้ายออกมานอก component
const Field = ({
  id,
  label,
  type = 'text',
  placeholder,
  required,
  form,
  setForm,
  errors,
  setErrors,
  styles,
}) => (
  <div className={styles.field}>
    <label className={styles.label}>
      {label}
      {required && <span className={styles.req}>*</span>}
    </label>
    <input
      type={type}
      className={`${styles.input} ${errors[id] ? styles.inputError : ''}`}
      placeholder={placeholder}
      value={form[id]}
      onChange={(e) => {
        setForm((prev) => ({ ...prev, [id]: e.target.value })) // ✅ แก้ตรงนี้
        setErrors((prev) => ({ ...prev, [id]: '' }))
      }}
    />
    {errors[id] && <p className={styles.fieldError}>⚠ {errors[id]}</p>}
  </div>
)

export default function CreateTeacherPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    teacher_no: '',
    first_name: '',
    last_name: '',
    email: '',
    status: 'active',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${API}/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (res.status === 401) {
        router.push('/login')
        return
      }

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
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/teachers">อาจารย์</Link> / เพิ่มอาจารย์ใหม่
          </div>
          <h1 className={styles.pageTitle}>เพิ่มอาจารย์ใหม่</h1>
        </div>
      </div>

      <div className={styles.formCard}>
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
              <Field id="teacher_no" label="รหัสอาจารย์" placeholder="เช่น T001" required form={form} setForm={setForm} errors={errors} setErrors={setErrors} styles={styles} />
              <Field id="first_name" label="ชื่อ" placeholder="ชื่อจริง" required form={form} setForm={setForm} errors={errors} setErrors={setErrors} styles={styles} />
              <Field id="last_name" label="นามสกุล" placeholder="นามสกุล" required form={form} setForm={setForm} errors={errors} setErrors={setErrors} styles={styles} />
              <Field id="email" label="อีเมล" type="email" placeholder="example@email.com" required form={form} setForm={setForm} errors={errors} setErrors={setErrors} styles={styles} />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>สถานะ</label>
              <select
                className={styles.input}
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="active">ใช้งาน</option>
                <option value="inactive">ไม่ใช้งาน</option>
              </select>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link href="/teachers" className={styles.cancelBtn}>
              ยกเลิก
            </Link>
            <button type="submit" className={styles.saveBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '💾 บันทึกข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}