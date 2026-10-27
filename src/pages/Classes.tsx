import React from "react"
import { GraduationCap } from "lucide-react"

export const Classes: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#131B2E]">Lớp học</h1>
        <p className="text-xs text-[#5A6478] mt-0.5">
          Danh sách lớp học, khóa học, sĩ số và giáo viên giảng dạy
        </p>
      </div>

      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center shadow-none">
        <GraduationCap className="w-12 h-12 text-[#1E40AF] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
          Màn hình Quản lý Lớp học
        </h3>
        <p className="text-xs text-[#5A6478] max-w-md mx-auto">
          Màn hình quản lý khóa học, ca học, tạo lớp học và phân lớp (sẽ triển khai chi tiết ở Nhiệm vụ 4).
        </p>
      </div>
    </div>
  )
}
