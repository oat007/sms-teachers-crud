'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import styles from './teacher-detail.module.css'

const API = process.env.NEXT_PUBLIC_API_URL

export default function TeacherDetailPage({ params }) {
  const router = useRouter()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    fetch(`${API}/teachers/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return }
        if (!res.ok) { setError('ไม่พบข้อมูลอาจารย์'); return }
        const data = await res.json()
        setTeacher(data.data || data)
      })
      .catch(() => setError('ไม่สามารถโหลดข้อมูลได้'))
      .finally(() => setLoading(false))
  }, [params.id, router])

  const handleDelete = async () => {
    if (!confirm(`ยืนยันการลบข้อมูล "${teacher.first_name} ${teacher.last_name}" ?`)) return
    const token = localStorage.getItem('token')
    const res = await fetch(`${API}/teachers/${params.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) router.push('/teachers')
    else alert('ลบข้อมูลไม่สำเร็จ')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className={styles.stateWrap}>
          <div className={styles.spinner} />
          <p>กำลังโหลดข้อมูล...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !teacher) {
    return (
      <DashboardLayout>
        <div className={styles.stateWrap}>
          <span className={styles.stateIcon}>😕</span>
          <p>{error || 'ไม่พบข้อมูล'}</p>
          <Link href="/teachers" className={styles.backBtn}>← กลับหน้ารายการ</Link>
        </div>
      </DashboardLayout>
    )
  }

  const fields = [
    { label: 'รหัสอาจารย์', value: teacher.teacher_no, mono: true },
    { label: 'ชื่อ', value: teacher.first_name },
    { label: 'นามสกุล', value: teacher.last_name },
    { label: 'อีเมล', value: teacher.email },
    { label: 'สถานะ', value: teacher.status, isStatus: true },
  ]

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/teachers">อาจารย์</Link>
            <span>/</span>
            <span>รายละเอียด</span>
          </div>
          <h1 className={styles.pageTitle}>รายละเอียดอาจารย์</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href={`/teachers/${teacher.id}/edit`} className={styles.editBtn}>
            ✏️ แก้ไข
          </Link>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            🗑️ ลบ
          </button>
        </div>
      </div>

      {/* Card */}
      <div className={styles.card}>
        {/* Profile section */}
        <div className={styles.profileSection}>
          <div className={styles.avatar}>👨‍🏫</div>
          <div className={styles.profileInfo}>
            <h2 className={styles.fullName}>
              {teacher.first_name} {teacher.last_name}
            </h2>
            <p className={styles.teacherNo}>{teacher.teacher_no}</p>
            <span className={`${styles.badge} ${teacher.status === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
              {teacher.status === 'active' ? '✅ ใช้งาน' : '⛔ ไม่ใช้งาน'}
            </span>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Detail rows */}
        <div className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>ข้อมูลทั่วไป</h3>
          <dl className={styles.infoGrid}>
            {fields.map((f) => (
              <div className={styles.infoRow} key={f.label}>
                <dt className={styles.infoLabel}>{f.label}</dt>
                <dd className={styles.infoValue}>
                  {f.isStatus ? (
                    <span className={`${styles.badge} ${f.value === 'active' ? styles.badgeActive : styles.badgeInactive}`}>
                      {f.value === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                    </span>
                  ) : f.mono ? (
                    <span className={styles.monoValue}>{f.value}</span>
                  ) : (
                    f.value || <span className={styles.empty}>—</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Footer */}
        <div className={styles.cardFooter}>
          <Link href="/teachers" className={styles.backBtnFooter}>
            ← กลับหน้ารายการ
          </Link>
          <Link href={`/teachers/${teacher.id}/edit`} className={styles.editBtnFooter}>
            ✏️ แก้ไขข้อมูล
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
