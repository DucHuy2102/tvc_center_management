import React from "react"
import { Award } from "lucide-react"

export const Exams: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#131B2E]">Kỳ thi</h1>
        <p className="text-xs text-[#5A6478] mt-0.5">
          Danh sách kỳ thi, lượt thi, xếp thí sinh và ghi nhận kết quả thi
        </p>
      </div>

      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center shadow-none">
        <Award className="w-12 h-12 text-[#1E40AF] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
          Màn hình Kỳ thi
        </h3>
        <p className="text-xs text-[#5A6478] max-w-md mx-auto">
          Màn hình quản lý kỳ thi, lượt thi, chuyển ca thi và cập nhật kết quả Đạt / Chưa đạt (sẽ triển khai chi tiết ở Nhiệm vụ 5).
        </p>
      </div>
    </div>
  )
}
