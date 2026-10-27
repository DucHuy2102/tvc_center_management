import React from "react"
import { CreditCard } from "lucide-react"

export const Tuition: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-[#131B2E]">Học phí</h1>
        <p className="text-xs text-[#5A6478] mt-0.5">
          Ghi nhận thu tiền, công nợ, danh sách phiếu thu và hoàn tiền
        </p>
      </div>

      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center shadow-none">
        <CreditCard className="w-12 h-12 text-[#1E40AF] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
          Màn hình Quản lý Học phí
        </h3>
        <p className="text-xs text-[#5A6478] max-w-md mx-auto">
          Màn hình này sẽ quản lý thu tiền, chặn thu vượt, hoàn tiền và hủy phiếu thu (sẽ triển khai chi tiết ở Nhiệm vụ 3).
        </p>
      </div>
    </div>
  )
}
