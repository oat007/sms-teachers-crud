'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import styles from './teachers.module.css'

const API = process.env.NEXT_PUBLIC_API_URL

export default function TeachersPage() {
  const router = useRouter()
  const [teachers, setTeachers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchTeachers = useCallback(async (page = 1) => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }

    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: pagination.limit })
      if (search) params.append('search', search)
      if (filterStatus) params.append('status', filterStatus)

      const res = await fetch(`${API}/teachers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.status === 401) { router.push('/login'); return }

      const data = await res.json()
      setTeachers(data.data || [])
      setPagination((prev) => ({ ...prev, ...data.pagination, page }))
    } catch {
      showToast('โหลดข้อมูลไม่สำเร็จ', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, router, pagination.limit])

  useEffect(() => {
    fetchTeachers(1)
  }, [search, filterStatus])

  const handleDelete = async (id, name) => {
    if (!confirm(`ยืนยันการลบข้อมูล "${name}" ?`)) return
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`${API}/teachers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        showToast('ลบข้อมูลเรียบร้อยแล้ว')
        fetchTeachers(pagination.page)
      } else {
        showToast('ลบข้อมูลไม่สำเร็จ', 'error')
      }
    } catch {
      showToast('เกิดข้อผิดพลาด', 'error')
    }
  }

  const StatusBadge = ({ status }) => {
    const map = {
      active: { label: 'ใช้งาน', cls: styles.badgeActive },
      inactive: { label: 'ไม่ใช้งาน', cls: styles.badgeInactive },
    }
    const s = map[status] || { label: status, cls: styles.badgeDefault }
    return <span className={`${styles.badge} ${s.cls}`}>{s.label}</span>
  }

  return (
    <DashboardLayout>
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>จัดการอาจารย์</h1>
          <p className={styles.pageDesc}>Teachers Management — SE311</p>
        </div>
        <Link href="/teachers/create" className={styles.addBtn}>
          + เพิ่มอาจารย์
        </Link>
      </div>

      {/* Filters */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อ, รหัส, อีเมล..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">ทุกสถานะ</option>
          <option value="active">ใช้งาน</option>
          <option value="inactive">ไม่ใช้งาน</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p>กำลังโหลดข้อมูล...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className={styles.emptyWrap}>
            <span className={styles.emptyIcon}>👨‍🏫</span>
            <p>ไม่พบข้อมูลอาจารย์</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>รหัสอาจารย์</th>
                  <th>ชื่อ-นามสกุล</th>
                  <th>อีเมล</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t.id}>
                    <td className={styles.rowNum}>
                      {(pagination.page - 1) * pagination.limit + i + 1}
                    </td>
                    <td>
                      <span className={styles.teacherNo}>{t.teacher_no}</span>
                    </td>
                    <td>
                      <span className={styles.fullName}>
                        {t.first_name} {t.last_name}
                      </span>
                    </td>
                    <td className={styles.email}>{t.email}</td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/teachers/${t.id}`} className={styles.btnView}>
                          ดู
                        </Link>
                        <Link href={`/teachers/${t.id}/edit`} className={styles.btnEdit}>
                          แก้ไข
                        </Link>
                        <button
                          className={styles.btnDelete}
                          onClick={() => handleDelete(t.id, `${t.first_name} ${t.last_name}`)}
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && teachers.length > 0 && (
          <div className={styles.pagination}>
            <p className={styles.pageInfo}>
              หน้า {pagination.page} / {pagination.totalPages}
            </p>
            <div className={styles.pageButtons}>
              <button
                className={styles.pageBtn}
                onClick={() => fetchTeachers(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                ← Previous
              </button>
              <span className={styles.pageCurrent}>{pagination.page}</span>
              <button
                className={styles.pageBtn}
                onClick={() => fetchTeachers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
