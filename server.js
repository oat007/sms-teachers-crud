const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

let teachers = [
  { id: 1, teacher_no: 'T001', first_name: 'สมชาย', last_name: 'ใจดี', email: 'somchai@example.com', status: 'active' },
  { id: 2, teacher_no: 'T002', first_name: 'สมหญิง', last_name: 'รักเรียน', email: 'somying@example.com', status: 'active' },
  { id: 3, teacher_no: 'T003', first_name: 'วิชัย', last_name: 'สุขใจ', email: 'wichai@example.com', status: 'inactive' },
  { id: 4, teacher_no: 'T004', first_name: 'มานี', last_name: 'มีสุข', email: 'manee@example.com', status: 'active' },
  { id: 5, teacher_no: 'T005', first_name: 'ประเสริฐ', last_name: 'ดีงาม', email: 'prasert@example.com', status: 'active' },
  { id: 6, teacher_no: 'T006', first_name: 'สุดา', last_name: 'แสนดี', email: 'suda@example.com', status: 'inactive' },
  { id: 7, teacher_no: 'T007', first_name: 'อนุชา', last_name: 'พูลสุข', email: 'anucha@example.com', status: 'active' },
  { id: 8, teacher_no: 'T008', first_name: 'กนกวรรณ', last_name: 'ทองดี', email: 'kanok@example.com', status: 'active' },
  { id: 9, teacher_no: 'T009', first_name: 'ธนากร', last_name: 'ศรีสุข', email: 'thanakorn@example.com', status: 'active' },
  { id: 10, teacher_no: 'T010', first_name: 'ปิยะ', last_name: 'วงษ์ดี', email: 'piya@example.com', status: 'inactive' },
  { id: 11, teacher_no: 'T011', first_name: 'รัตนา', last_name: 'บุญมี', email: 'ratana@example.com', status: 'active' },
  { id: 12, teacher_no: 'T012', first_name: 'ชัยวัฒน์', last_name: 'มั่นคง', email: 'chaiwat@example.com', status: 'active' },
]
let nextId = 13

// ===== Auth =====
// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body
  // Mock login — ยอมรับทุก username/password
  if (!username || !password) {
    return res.status(400).json({ message: 'กรุณากรอก username และ password' })
  }
  res.json({
    token: 'mock-jwt-token-12345',
    user: { id: 1, username, role: 'admin' }
  })
})

// ===== Middleware ตรวจ Token =====
const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' })
  }
  next()
}

// ===== Teachers API =====

// GET /api/teachers?page=1&limit=10&search=xxx&status=active
app.get('/api/teachers', authMiddleware, (req, res) => {
  let { page = 1, limit = 10, search = '', status = '' } = req.query
  page = parseInt(page)
  limit = parseInt(limit)

  let result = [...teachers]

  // Filter by search
  if (search) {
    const q = search.toLowerCase()
    result = result.filter(t =>
      t.teacher_no.toLowerCase().includes(q) ||
      t.first_name.toLowerCase().includes(q) ||
      t.last_name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q)
    )
  }

  // Filter by status
  if (status) {
    result = result.filter(t => t.status === status)
  }

  const totalPages = Math.ceil(result.length / limit) || 1
  const start = (page - 1) * limit
  const data = result.slice(start, start + limit)

  res.json({
    data,
    pagination: { page, limit, totalPages, total: result.length }
  })
})

// GET /api/teachers/:id
app.get('/api/teachers/:id', authMiddleware, (req, res) => {
  const teacher = teachers.find(t => t.id === parseInt(req.params.id))
  if (!teacher) return res.status(404).json({ message: 'ไม่พบข้อมูลอาจารย์' })
  res.json({ data: teacher })
})

// POST /api/teachers
app.post('/api/teachers', authMiddleware, (req, res) => {
  const { teacher_no, first_name, last_name, email, status = 'active' } = req.body

  if (!teacher_no || !first_name || !last_name || !email) {
    return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' })
  }

  // เช็ครหัสซ้ำ
  if (teachers.find(t => t.teacher_no === teacher_no)) {
    return res.status(400).json({ message: `รหัสอาจารย์ ${teacher_no} มีอยู่แล้ว` })
  }

  const newTeacher = { id: nextId++, teacher_no, first_name, last_name, email, status }
  teachers.push(newTeacher)
  res.status(201).json({ data: newTeacher, message: 'เพิ่มข้อมูลสำเร็จ' })
})

// PUT /api/teachers/:id
app.put('/api/teachers/:id', authMiddleware, (req, res) => {
  const idx = teachers.findIndex(t => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบข้อมูลอาจารย์' })

  const { teacher_no, first_name, last_name, email, status } = req.body
  teachers[idx] = { ...teachers[idx], teacher_no, first_name, last_name, email, status }
  res.json({ data: teachers[idx], message: 'แก้ไขข้อมูลสำเร็จ' })
})

// DELETE /api/teachers/:id
app.delete('/api/teachers/:id', authMiddleware, (req, res) => {
  const idx = teachers.findIndex(t => t.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ message: 'ไม่พบข้อมูลอาจารย์' })

  teachers.splice(idx, 1)
  res.json({ message: 'ลบข้อมูลสำเร็จ' })
})

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT} - server.js:130`)
  console.log(`📋 API Endpoints: - server.js:131`)
  console.log(`POST   http://localhost:${PORT}/api/auth/login - server.js:132`)
  console.log(`GET    http://localhost:${PORT}/api/teachers - server.js:133`)
  console.log(`GET    http://localhost:${PORT}/api/teachers/:id - server.js:134`)
  console.log(`POST   http://localhost:${PORT}/api/teachers - server.js:135`)
  console.log(`PUT    http://localhost:${PORT}/api/teachers/:id - server.js:136`)
  console.log(`DELETE http://localhost:${PORT}/api/teachers/:id - server.js:137`)
})
