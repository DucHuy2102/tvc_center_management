import React from "react"
import { UserCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const TeachersCommissions: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#131B2E]">Giáo viên & Hoa hồng</h1>
            <Badge variant="default" className="text-[10px]">Chỉ Chủ</Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Danh sách giáo viên, người giới thiệu và quyết toán hoa hồng tuyển sinh
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center shadow-none">
        <UserCheck className="w-12 h-12 text-[#9A7B3F] mx-auto mb-3 opacity-80" />
        <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
          Màn hình Giáo viên và Hoa hồng
        </h3>
        <p className="text-xs text-[#5A6478] max-w-md mx-auto">
          Quản lý danh sách giáo viên, chính sách hoa hồng giới thiệu và thanh toán hoa hồng cho Thầy/Cô (sẽ triển khai chi tiết ở Nhiệm vụ 6).
        </p>
      </div>
    </div>
  )
}
