import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-8">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Trang không tồn tại</h2>
      <p className="text-gray-600 mb-6">Rất tiếc, trang bạn đang tìm kiếm không được tìm thấy.</p>
      <Link
        to="/dashboard"
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Quay về trang chủ
      </Link>
    </div>
  )
}

export default NotFound
