import React from "react"
import { FileBadge } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const Certificates: React.FC = () => {
  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#131B2E]">Cấp bằng</h1>
            <Badge variant="default" className="text-[10px]">Chỉ Chủ</Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Quản lý số hiệu bằng, ngày cấp và tình trạng trao bằng cho học viên
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center shadow-none">
        <FileBadge className="w-12 h-12 text-[#1E40AF] mx-auto mb-3 opacity-60" />
        <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
          Màn hình Cấp bằng
        </h3>
        <p className="text-xs text-[#5A6478] max-w-md mx-auto">
          Chức năng cấp bằng, ghi nhận số hiệu chứng chỉ và theo dõi trao bằng tốt nghiệp (sẽ triển khai chi tiết ở Nhiệm vụ 5).
        </p>
      </div>
    </div>
  )
}
