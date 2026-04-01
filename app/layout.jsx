import './globals.css'

export const metadata = {
  title: 'SMS - School Management System',
  description: 'SE311 Web Application Development',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
