import React from "react"
import { LayoutDashboard } from "lucide-react"

export const Dashboard: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#131B2E]">Tổng quan</h1>
        <p className="text-xs text-[#5A6478] mt-0.5">
          Bảng tin điều hành trung tâm và các việc cần xử lý hôm nay
        </p>
      </div>

      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center shadow-none">
        <LayoutDashboard className="w-12 h-12 text-[#1E40AF] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
          Màn hình Tổng quan
        </h3>
        <p className="text-xs text-[#5A6478] max-w-md mx-auto">
          Màn hình này sẽ hiển thị các chỉ số nhanh từ <code>dashboard_counts()</code>: học viên nợ học phí, cần liên hệ, hồ sơ còn thiếu và các kỳ thi sắp diễn ra (sẽ triển khai chi tiết ở Nhiệm vụ 7).
        </p>
      </div>
    </div>
  )
}
