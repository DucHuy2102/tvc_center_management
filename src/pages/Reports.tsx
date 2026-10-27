import React from "react"
import { BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const Reports: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#131B2E]">Báo cáo</h1>
            <Badge variant="default" className="text-[10px]">Chỉ Chủ</Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Báo cáo doanh thu học phí, công nợ, hiệu quả tuyển sinh và xuất Excel
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center shadow-none">
        <BarChart3 className="w-12 h-12 text-[#1E40AF] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
          Màn hình Báo cáo
        </h3>
        <p className="text-xs text-[#5A6478] max-w-md mx-auto">
          Thống kê doanh thu, tỷ lệ thi đỗ, tổng nợ và xuất dữ liệu báo cáo sang file Excel (sẽ triển khai chi tiết ở Nhiệm vụ 7).
        </p>
      </div>
    </div>
  )
}
