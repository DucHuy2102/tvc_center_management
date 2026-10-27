import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Download,
  Upload,
  FileArchive,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Clock,
} from "lucide-react"

// ============================================================================
// DỮ LIỆU BÁO CÁO MẪU CHO TRUNG TÂM TVC
// ============================================================================

// 1. Dữ liệu Thu theo tháng (6 tháng gần nhất)
const REVENUE_BY_MONTH = [
  { month: "T5/2026", amount: 98000000, label: "98 tr" },
  { month: "T6/2026", amount: 105000000, label: "105 tr" },
  { month: "T7/2026", amount: 112000000, label: "112 tr" },
  { month: "T8/2026", amount: 118000000, label: "118 tr" },
  { month: "T9/2026", amount: 122000000, label: "122 tr" },
  { month: "T10/2026", amount: 126500000, label: "126.5 tr" },
]

// 2. Dữ liệu Học viên mới theo tháng (6 tháng gần nhất)
const STUDENTS_BY_MONTH = [
  { month: "T5/2026", count: 22 },
  { month: "T6/2026", count: 25 },
  { month: "T7/2026", count: 34 },
  { month: "T8/2026", count: 30 },
  { month: "T9/2026", count: 31 },
  { month: "T10/2026", count: 28 },
]

// 3. Dữ liệu Còn nợ theo lớp (Table)
const DEBT_BY_CLASS = [
  { classCode: "UDCNTTCB_K0126_Ca1PM1", courseName: "Ứng dụng CNTT Cơ bản", enrolled: 18, totalTuition: 18000000, paid: 16500000, debt: 1500000 },
  { classCode: "TAGT_K0126_Ca1PM1", courseName: "Tiếng Anh giao tiếp", enrolled: 24, totalTuition: 24000000, paid: 22000000, debt: 2000000 },
  { classCode: "IC3_K0126_Ca2PM2", courseName: "Chứng chỉ IC3 - GS6", enrolled: 15, totalTuition: 22500000, paid: 21000000, debt: 1500000 },
  { classCode: "PREIELTS_K0126_Ca2PM1", courseName: "Pre-Ielts", enrolled: 20, totalTuition: 36000000, paid: 35100000, debt: 900000 },
  { classCode: "UDCNTTCB_K0126_Ca1PM2", courseName: "Ứng dụng CNTT Cơ bản", enrolled: 18, totalTuition: 18000000, paid: 17500000, debt: 500000 },
  { classCode: "UDCNTTNC_K0126_Ca3PM1", courseName: "Ứng dụng CNTT Nâng cao", enrolled: 22, totalTuition: 24750000, paid: 24750000, debt: 0 },
]

// 4. Dữ liệu Hoa hồng theo giáo viên (Table)
const COMMISSION_BY_REFERRER = [
  { referrerName: "Thầy Nguyễn Văn Trí", organization: "Trường CĐ Nghề Trà Vinh", totalReferred: 8, eligibleCount: 7, paidCount: 0, pendingAmount: 140000 },
  { referrerName: "Cô Lâm Mỹ Dung", organization: "Trường ĐH Trà Vinh", totalReferred: 6, eligibleCount: 5, paidCount: 1, pendingAmount: 100000 },
  { referrerName: "Thầy Phạm Quốc Hưng", organization: "Trường THPT Chuyên Trà Vinh", totalReferred: 4, eligibleCount: 4, paidCount: 0, pendingAmount: 80000 },
  { referrerName: "Trần Minh Khoa (Học viên cũ)", organization: "Học viên khóa K1225", totalReferred: 2, eligibleCount: 0, paidCount: 0, pendingAmount: 0 },
]

// Dữ liệu mẫu xem trước 5 dòng khi nhập từ Google Sheet
const MOCK_CSV_PREVIEW = [
  { stt: 1, lastName: "Nguyễn Văn", firstName: "An", phone: "0912 345 678", gender: "Nam", course: "Ứng dụng CNTT Cơ bản", isDuplicate: true },
  { stt: 2, lastName: "Trần Thị", firstName: "Bình", phone: "0988 123 456", gender: "Nữ", course: "Tiếng Anh giao tiếp", isDuplicate: true },
  { stt: 3, lastName: "Lê Văn", firstName: "Cường", phone: "0903 777 888", gender: "Nam", course: "Chứng chỉ IC3 - GS6", isDuplicate: false },
  { stt: 4, lastName: "Phạm Thị", firstName: "Dung", phone: "0971 222 333", gender: "Nữ", course: "Ứng dụng CNTT Cơ bản", isDuplicate: false },
  { stt: 5, lastName: "Hoàng Minh", firstName: "Đức", phone: "0945 999 111", gender: "Nam", course: "Pre-Ielts", isDuplicate: false },
]

export const Reports: React.FC = () => {
  // Khoảng thời gian báo cáo: Tháng này | Tháng trước | Tùy chọn
  const [dateRangeMode, setDateRangeMode] = useState<"thang_nay" | "thang_truoc" | "tuy_chon">("thang_nay")
  const [customStartDate, setCustomStartDate] = useState("2026-10-01")
  const [customEndDate, setCustomEndDate] = useState("2026-10-27")

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Lần sao lưu gần nhất: 11/10/2026
  const lastBackupDateStr = "11/10/2026"
  const lastBackupDate = new Date(2026, 9, 11) // 11/10/2026
  const today = new Date(2026, 9, 27) // 27/10/2026 (16 ngày trước)
  const diffTime = Math.abs(today.getTime() - lastBackupDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isBackupOverdue = diffDays > 7 // Quá 7 ngày cần cảnh báo

  // ==========================================================================
  // MODAL: NHẬP TỪ GOOGLE SHEET (CSV DIALOG)
  // ==========================================================================
  const [showImportModal, setShowImportModal] = useState(false)
  const [duplicateResolution, setDuplicateResolution] = useState<"skip" | "update">("skip")
  const [columnMapLastName, setColumnMapLastName] = useState("Cột B (Họ và chữ lót)")
  const [columnMapFirstName, setColumnMapFirstName] = useState("Cột C (Tên)")
  const [columnMapPhone, setColumnMapPhone] = useState("Cột D (Số điện thoại)")
  const [columnMapCourse, setColumnMapCourse] = useState("Cột E (Khóa học)")

  const handleOpenImport = () => {
    setShowImportModal(true)
    setDuplicateResolution("skip")
  }

  const handleConfirmImport = () => {
    setShowImportModal(false)
    showToast(
      duplicateResolution === "skip"
        ? "Đã nhập 33 học viên mới (bỏ qua 12 dòng trùng SĐT)"
        : "Đã nhập và cập nhật 45 học viên từ Google Sheet"
    )
  }

  // ==========================================================================
  // XUẤT DỮ LIỆU RA EXCEL / ZIP
  // ==========================================================================
  const handleExportStudents = () => {
    const rows = [
      ["STT", "Mã học viên", "Họ và chữ lót", "Tên", "Số điện thoại", "Khóa học", "Lớp", "Trạng thái", "Học phí còn nợ"],
      [1, "HV26-0001", "Lê Hoàng", "Anh", "0912 345 678", "Ứng dụng CNTT Cơ bản", "UDCNTTCB_K0126_Ca1PM1", "Đang học", "0 ₫"],
      [2, "HV26-0002", "Phạm Gia", "Bảo", "0988 123 456", "Ứng dụng CNTT Cơ bản", "UDCNTTCB_K0126_Ca1PM1", "Đang học", "400.000 ₫"],
      [3, "HV26-0003", "Nguyễn Thị", "Hà", "0903 888 999", "Chứng chỉ IC3 - GS6", "IC3_K0126_Ca2PM2", "Đang học", "1.500.000 ₫"],
      [4, "HV26-0004", "Trần Minh", "Khoa", "0934 567 890", "Ứng dụng CNTT Cơ bản", "UDCNTTCB_K0126_Ca1PM1", "Đang học", "500.000 ₫"],
      [5, "HV26-0005", "Đỗ Phương", "Linh", "0977 654 321", "Tiếng Anh giao tiếp", "TAGT_K0126_Ca1PM1", "Đang học", "800.000 ₫"],
    ]
    downloadCSV(rows, `Danh_sach_hoc_vien_${Date.now()}.csv`)
    showToast("Đã xuất danh sách học viên (Excel)")
  }

  const handleExportTuitionReceipts = () => {
    const rows = [
      ["Mã phiếu thu", "Ngày lập", "Học viên", "Mã HV", "Lớp học", "Số tiền thu", "Hình thức", "Người thu", "Ghi chú"],
      ["PT26-0089", "27/10/2026", "Phạm Gia Bảo", "HV26-0002", "UDCNTTCB_K0126_Ca1PM1", "400.000 ₫", "Tiền mặt", "Linh", "Đóng nốt phần còn lại"],
      ["PT26-0071", "18/10/2026", "Lê Hoàng Anh", "HV26-0001", "UDCNTTCB_K0126_Ca1PM1", "1.200.000 ₫", "Chuyển khoản", "Linh", "Thu dư 200.000 ₫"],
      ["PT26-0056", "15/10/2026", "Phạm Gia Bảo", "HV26-0002", "UDCNTTCB_K0126_Ca1PM1", "600.000 ₫", "Tiền mặt", "Linh", "Đóng đợt 1"],
      ["PT26-0042", "05/10/2026", "Trần Minh Khoa", "HV26-0004", "UDCNTTCB_K0126_Ca1PM1", "500.000 ₫", "Tiền mặt", "Linh", "Đóng đợt 1"],
    ]
    downloadCSV(rows, `Hoc_phi_va_phieu_thu_${Date.now()}.csv`)
    showToast("Đã xuất học phí và phiếu thu (Excel)")
  }

  const handleExportBackupZip = () => {
    // Tạo file sao lưu dữ liệu toàn hệ thống định dạng json/dump
    const backupData = {
      version: "1.0",
      center: "Trung tâm TVC Trà Vinh",
      exportDate: "2026-10-27T15:00:00Z",
      records: {
        studentsCount: 312,
        activeClasses: 6,
        totalRevenue: 681500000,
        totalDebt: 48200000,
      },
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `Sao_luu_toan_bo_du_lieu_TVC_20261027.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    showToast("Đã xuất toàn bộ dữ liệu để sao lưu (zip)")
  }

  // Hàm hỗ trợ tải CSV UTF-8 BOM
  const downloadCSV = (rows: (string | number)[][], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Tìm giá trị lớn nhất trong 6 tháng để tính chiều cao cột biểu đồ
  const maxRevenue = useMemo(() => {
    return Math.max(...REVENUE_BY_MONTH.map((r) => r.amount))
  }, [])

  const maxStudents = useMemo(() => {
    return Math.max(...STUDENTS_BY_MONTH.map((s) => s.count))
  }, [])

  // Tổng nợ của các lớp trong bảng
  const totalDebtOfClasses = useMemo(() => {
    return DEBT_BY_CLASS.reduce((sum, item) => sum + item.debt, 0)
  }, [])

  // Tổng hoa hồng chờ chi
  const totalPendingCommission = useMemo(() => {
    return COMMISSION_BY_REFERRER.reduce((sum, item) => sum + item.pendingAmount, 0)
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* 1. Header Trang & Bộ chọn khoảng thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#DFE4EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-22 font-semibold text-[#131B2E] tracking-tight">
              Báo cáo & Xuất dữ liệu
            </h1>
            <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5 uppercase">
              Chỉ Quản lý (Chủ)
            </Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Thống kê tài chính, hiệu quả tuyển sinh và trích xuất dữ liệu lưu trữ
          </p>
        </div>

        {/* Nút Nhập từ Google Sheet */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            onClick={handleOpenImport}
            className="h-8 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập từ Google Sheet</span>
          </Button>
        </div>
      </div>

      {/* 2. Bộ điều khiển khoảng thời gian (Date Range Control) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DFE4EC] rounded-[10px] p-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#5A6478] font-medium flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Thời gian:
          </span>
          <div className="inline-flex rounded-[6px] border border-[#DFE4EC] p-0.5 bg-[#F4F6FA]">
            <button
              type="button"
              onClick={() => setDateRangeMode("thang_nay")}
              className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                dateRangeMode === "thang_nay"
                  ? "bg-[#1E40AF] text-white shadow-none"
                  : "text-[#5A6478] hover:text-[#131B2E]"
              }`}
            >
              Tháng này
            </button>
            <button
              type="button"
              onClick={() => setDateRangeMode("thang_truoc")}
              className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                dateRangeMode === "thang_truoc"
                  ? "bg-[#1E40AF] text-white shadow-none"
                  : "text-[#5A6478] hover:text-[#131B2E]"
              }`}
            >
              Tháng trước
            </button>
            <button
              type="button"
              onClick={() => setDateRangeMode("tuy_chon")}
              className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                dateRangeMode === "tuy_chon"
                  ? "bg-[#1E40AF] text-white shadow-none"
                  : "text-[#5A6478] hover:text-[#131B2E]"
              }`}
            >
              Tùy chọn
            </button>
          </div>
        </div>

        {/* Ô chọn ngày khi chọn Tùy chọn */}
        {dateRangeMode === "tuy_chon" ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[#5A6478]">Từ:</span>
            <Input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="h-8 text-xs w-36 bg-[#F4F6FA] border-[#DFE4EC]"
            />
            <span className="text-[#5A6478]">Đến:</span>
            <Input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="h-8 text-xs w-36 bg-[#F4F6FA] border-[#DFE4EC]"
            />
          </div>
        ) : (
          <div className="text-[11px] text-[#5A6478] tabular-nums">
            Khoảng dữ liệu:{" "}
            <strong>
              {dateRangeMode === "thang_nay"
                ? "01/10/2026 - 31/10/2026"
                : "01/09/2026 - 30/09/2026"}
            </strong>
          </div>
        )}
      </div>

      {/* 3. BỐN KHỐI BÁO CÁO PHẲNG (FOUR PLAIN REPORT BLOCKS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KHỐI 1: THU THEO THÁNG (BAR CHART, SINGLE ACCENT COLOR, 6 MONTHS) */}
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#131B2E] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#1E40AF]" />
                <span>Thu theo tháng (6 tháng gần nhất)</span>
              </h3>
              <span className="text-xs font-bold text-[#1E40AF] tabular-nums">
                126.500.000 ₫ (T10)
              </span>
            </div>
            <p className="text-[11px] text-[#5A6478]">
              Biểu đồ doanh thu thực thu qua các tháng, đơn màu xanh dương tối giản
            </p>
          </div>

          {/* Minimal Bar Chart (Single Accent Color #1E40AF) */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-[#DFE4EC]">
              {REVENUE_BY_MONTH.map((item, idx) => {
                const heightPercent = Math.round((item.amount / maxRevenue) * 100)
                const isLatest = idx === REVENUE_BY_MONTH.length - 1

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                    {/* Nhãn số tiền trên đầu cột */}
                    <span className="text-[10px] font-semibold text-[#131B2E] tabular-nums group-hover:text-[#1E40AF]">
                      {item.label}
                    </span>

                    {/* Cột Bar Chart (Single Accent Color #1E40AF) */}
                    <div className="w-full max-w-[40px] bg-[#E7EDFB] rounded-t-[4px] relative flex items-end overflow-hidden h-36">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-[4px] transition-all duration-300 ${
                          isLatest ? "bg-[#1E40AF]" : "bg-[#1E40AF]/80 group-hover:bg-[#1E40AF]"
                        }`}
                      />
                    </div>

                    {/* Tháng */}
                    <span className="text-[11px] text-[#5A6478] tabular-nums mt-1 font-medium">
                      {item.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-[11px] text-[#5A6478] pt-2 flex items-center justify-between border-t border-[#DFE4EC]/60">
            <span>Tổng thu 6 tháng qua:</span>
            <strong className="text-[#131B2E] tabular-nums">681.500.000 ₫</strong>
          </div>
        </div>

        {/* KHỐI 2: HỌC VIÊN MỚI THEO THÁNG */}
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-[#131B2E] flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#1E40AF]" />
                <span>Học viên mới theo tháng</span>
              </h3>
              <span className="text-xs font-bold text-[#1E40AF] tabular-nums">
                28 học viên (T10)
              </span>
            </div>
            <p className="text-[11px] text-[#5A6478]">
              Số lượng học viên đăng ký mới qua 6 tháng gần nhất
            </p>
          </div>

          {/* Minimal Bar Chart */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-[#DFE4EC]">
              {STUDENTS_BY_MONTH.map((item, idx) => {
                const heightPercent = Math.round((item.count / maxStudents) * 100)
                const isLatest = idx === STUDENTS_BY_MONTH.length - 1

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[10px] font-semibold text-[#131B2E] tabular-nums">
                      {item.count}
                    </span>

                    <div className="w-full max-w-[40px] bg-[#ECEFF5] rounded-t-[4px] relative flex items-end overflow-hidden h-36">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-[4px] transition-all duration-300 ${
                          isLatest ? "bg-[#1E40AF]" : "bg-[#5A6478] group-hover:bg-[#1E40AF]"
                        }`}
                      />
                    </div>

                    <span className="text-[11px] text-[#5A6478] tabular-nums mt-1 font-medium">
                      {item.month}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-[11px] text-[#5A6478] pt-2 flex items-center justify-between border-t border-[#DFE4EC]/60">
            <span>Tổng số học viên mới 6 tháng:</span>
            <strong className="text-[#131B2E] tabular-nums">170 học viên</strong>
          </div>
        </div>

        {/* KHỐI 3: CÒN NỢ THEO LỚP (TABLE PHẲNG) */}
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#131B2E]">
                Còn nợ theo lớp
              </h3>
              <p className="text-[11px] text-[#5A6478]">
                Chi tiết công nợ học phí phân bổ theo các lớp đang mở
              </p>
            </div>
            <span className="text-xs font-bold text-[#B3382C] tabular-nums">
              Nợ: {formatCurrency(totalDebtOfClasses)}
            </span>
          </div>

          <div className="border border-[#DFE4EC] rounded-[6px] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC]">
                  <th className="py-2 px-3 font-semibold">Lớp học</th>
                  <th className="py-2 px-2 text-center font-semibold">Sĩ số</th>
                  <th className="py-2 px-3 text-right font-semibold">Tổng thu</th>
                  <th className="py-2 px-3 text-right font-semibold">Còn nợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE4EC]">
                {DEBT_BY_CLASS.map((c) => (
                  <tr key={c.classCode} className="hover:bg-[#F4F6FA]/50">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-[#131B2E] tabular-nums truncate max-w-[170px]">
                        {c.classCode}
                      </div>
                      <div className="text-[10px] text-[#5A6478] truncate max-w-[170px]">
                        {c.courseName}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center tabular-nums font-medium text-[#131B2E]">
                      {c.enrolled}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-[#5A6478]">
                      {formatCurrency(c.paid)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold">
                      {c.debt > 0 ? (
                        <span className="text-[#B3382C]">{formatCurrency(c.debt)}</span>
                      ) : (
                        <span className="text-[#2F7D4F]">0 ₫</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KHỐI 4: HOA HỒNG THEO GIÁO VIÊN (TABLE PHẲNG) */}
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#131B2E]">
                Hoa hồng theo giáo viên
              </h3>
              <p className="text-[11px] text-[#5A6478]">
                Tổng hợp lượt giới thiệu và tiền hoa hồng theo Thầy/Cô
              </p>
            </div>
            <span className="text-xs font-bold text-[#9A7B3F] tabular-nums">
              Chờ chi: {formatCurrency(totalPendingCommission)}
            </span>
          </div>

          <div className="border border-[#DFE4EC] rounded-[6px] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC]">
                  <th className="py-2 px-3 font-semibold">Thầy/Cô giới thiệu</th>
                  <th className="py-2 px-2 text-center font-semibold">HS</th>
                  <th className="py-2 px-2 text-center font-semibold">Đủ ĐK</th>
                  <th className="py-2 px-3 text-right font-semibold">Chờ chi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE4EC]">
                {COMMISSION_BY_REFERRER.map((ref) => (
                  <tr key={ref.referrerName} className="hover:bg-[#F4F6FA]/50">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-[#131B2E]">
                        {ref.referrerName}
                      </div>
                      <div className="text-[10px] text-[#5A6478] truncate max-w-[170px]">
                        {ref.organization}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center tabular-nums text-[#131B2E]">
                      {ref.totalReferred}
                    </td>
                    <td className="py-2 px-2 text-center tabular-nums font-semibold text-[#2F7D4F]">
                      {ref.eligibleCount}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-bold text-[#9A7B3F]">
                      {ref.pendingAmount > 0 ? formatCurrency(ref.pendingAmount) : "0 ₫"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. PHẦN "XUẤT DỮ LIỆU" & CẢNH BÁO SAO LƯU (> 7 NGÀY)
      ========================================================================= */}
      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 space-y-3">
        <div>
          <h3 className="text-sm font-bold text-[#131B2E] flex items-center gap-2">
            <Download className="w-4 h-4 text-[#1E40AF]" />
            <span>Xuất dữ liệu hệ thống</span>
          </h3>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Tải về các tệp dữ liệu chi tiết phục vụ kế toán, đối chiếu và lưu trữ dự phòng
          </p>
        </div>

        {/* 3 Nút xuất dữ liệu */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Button
            variant="outline"
            onClick={handleExportStudents}
            className="h-9 text-xs font-medium flex items-center gap-2 cursor-pointer bg-white"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2F7D4F]" />
            <span>Xuất danh sách học viên (Excel)</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleExportTuitionReceipts}
            className="h-9 text-xs font-medium flex items-center gap-2 cursor-pointer bg-white"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E40AF]" />
            <span>Xuất học phí và phiếu thu (Excel)</span>
          </Button>

          <Button
            onClick={handleExportBackupZip}
            className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-2 cursor-pointer"
          >
            <FileArchive className="w-3.5 h-3.5" />
            <span>Xuất toàn bộ dữ liệu để sao lưu (zip)</span>
          </Button>
        </div>

        {/* Muted sentence under backup button:
            "Nên sao lưu mỗi tuần. Lần sao lưu gần nhất: 11/10/2026." with a warning chip if more than 7 days ago. */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-[#5A6478]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#5A6478]" />
            <span>
              Nên sao lưu mỗi tuần. Lần sao lưu gần nhất:{" "}
              <strong className="text-[#131B2E] tabular-nums font-semibold">
                {lastBackupDateStr}
              </strong>
              .
            </span>
          </div>

          {isBackupOverdue && (
            <Badge variant="warning" className="text-[10px] font-semibold flex items-center gap-1 w-fit">
              <AlertTriangle className="w-3 h-3 text-[#A86A0B]" />
              <span>Quá hạn sao lưu ({diffDays} ngày trước)</span>
            </Badge>
          )}
        </div>
      </div>

      {/* =========================================================================
          5. MODAL: NHẬP TỪ GOOGLE SHEET (CSV DIALOG)
      ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-2xl p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#131B2E]">
                    Nhập dữ liệu từ Google Sheet
                  </h3>
                  <Badge variant="neutral" className="text-[10px]">
                    CSV Import
                  </Badge>
                </div>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  Tải lên tệp CSV xuất từ Google Sheet để thêm học viên hàng loạt
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bước 1: Upload CSV */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-[#131B2E]">
                1. Tệp dữ liệu CSV đã chọn:
              </label>
              <div className="p-3 border border-dashed border-[#1E40AF] rounded-[6px] bg-[#E7EDFB]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1E40AF]" />
                  <div>
                    <div className="font-bold text-[#131B2E]">
                      Danh_sach_tuyen_sinh_TVC_Thang10.csv
                    </div>
                    <div className="text-[11px] text-[#5A6478]">
                      45 dòng dữ liệu • 12.4 KB
                    </div>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">
                  Đã tải lên
                </Badge>
              </div>
            </div>

            {/* Bước 2: Map columns (Khớp cột) */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-[#131B2E]">
                2. Khớp các cột từ file với trường dữ liệu TVC:
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-[#F4F6FA] p-3 rounded-[6px] border border-[#DFE4EC]">
                <div>
                  <label className="block text-[11px] text-[#5A6478] mb-1">
                    Họ và chữ lót:
                  </label>
                  <select
                    value={columnMapLastName}
                    onChange={(e) => setColumnMapLastName(e.target.value)}
                    className="w-full h-8 text-xs rounded-[4px] border border-[#DFE4EC] bg-white px-1.5"
                  >
                    <option>Cột B (Họ và chữ lót)</option>
                    <option>Cột A (Họ và tên)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#5A6478] mb-1">
                    Tên:
                  </label>
                  <select
                    value={columnMapFirstName}
                    onChange={(e) => setColumnMapFirstName(e.target.value)}
                    className="w-full h-8 text-xs rounded-[4px] border border-[#DFE4EC] bg-white px-1.5"
                  >
                    <option>Cột C (Tên)</option>
                    <option>Cột B (Tên học viên)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#5A6478] mb-1">
                    Số điện thoại:
                  </label>
                  <select
                    value={columnMapPhone}
                    onChange={(e) => setColumnMapPhone(e.target.value)}
                    className="w-full h-8 text-xs rounded-[4px] border border-[#DFE4EC] bg-white px-1.5"
                  >
                    <option>Cột D (Số điện thoại)</option>
                    <option>Cột C (SĐT / Zalo)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#5A6478] mb-1">
                    Khóa học đăng ký:
                  </label>
                  <select
                    value={columnMapCourse}
                    onChange={(e) => setColumnMapCourse(e.target.value)}
                    className="w-full h-8 text-xs rounded-[4px] border border-[#DFE4EC] bg-white px-1.5"
                  >
                    <option>Cột E (Khóa học)</option>
                    <option>Cột F (Môn học)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bước 3: Xem trước 5 dòng (Preview 5 rows) */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-[#131B2E]">
                3. Xem trước 5 dòng dữ liệu đầu tiên:
              </label>
              <div className="border border-[#DFE4EC] rounded-[6px] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC]">
                      <th className="py-1.5 px-2.5 w-10">STT</th>
                      <th className="py-1.5 px-3">Họ và tên</th>
                      <th className="py-1.5 px-3">Số điện thoại</th>
                      <th className="py-1.5 px-2 text-center">Giới tính</th>
                      <th className="py-1.5 px-3">Khóa học</th>
                      <th className="py-1.5 px-2.5 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE4EC]">
                    {MOCK_CSV_PREVIEW.map((row) => (
                      <tr key={row.stt} className="hover:bg-[#F4F6FA]/50">
                        <td className="py-1.5 px-2.5 tabular-nums text-[#5A6478]">
                          {row.stt}
                        </td>
                        <td className="py-1.5 px-3 font-semibold text-[#131B2E]">
                          {row.lastName} {row.firstName}
                        </td>
                        <td className="py-1.5 px-3 tabular-nums text-[#131B2E]">
                          {row.phone}
                        </td>
                        <td className="py-1.5 px-2 text-center text-[#5A6478]">
                          {row.gender}
                        </td>
                        <td className="py-1.5 px-3 text-[#5A6478] truncate max-w-[140px]">
                          {row.course}
                        </td>
                        <td className="py-1.5 px-2.5 text-right">
                          {row.isDuplicate ? (
                            <span className="text-[10px] font-bold text-[#B3382C] bg-[#FBE8E5] px-1.5 py-0.2 rounded">
                              Trùng SĐT
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-[#2F7D4F] bg-[#E6F3EA] px-1.5 py-0.2 rounded">
                              Hợp lệ
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bước 4: Phát hiện trùng số điện thoại & Lựa chọn xử lý:
                "show '12 dòng bị trùng số điện thoại' with a choice to skip or update." */}
            <div className="bg-[#FBE8E5] border border-[#F5C2BC] rounded-[6px] p-3 text-xs text-[#B3382C] space-y-2">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#B3382C]" />
                <span>12 dòng bị trùng số điện thoại trong hệ thống</span>
              </div>
              <p className="text-[11px] leading-relaxed pl-5.5 text-[#B3382C]/90">
                Các số điện thoại này đã tồn tại trong danh sách học viên hiện tại. Vui lòng chọn cách xử lý:
              </p>

              <div className="pl-5.5 space-y-1.5 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="duplicateChoice"
                    checked={duplicateResolution === "skip"}
                    onChange={() => setDuplicateResolution("skip")}
                    className="w-3.5 h-3.5 text-[#1E40AF]"
                  />
                  <span>Bỏ qua các dòng bị trùng (chỉ thêm học viên mới, khuyên dùng)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="radio"
                    name="duplicateChoice"
                    checked={duplicateResolution === "update"}
                    onChange={() => setDuplicateResolution("update")}
                    className="w-3.5 h-3.5 text-[#1E40AF]"
                  />
                  <span>Ghi đè / Cập nhật thông tin khóa học mới cho học viên cũ</span>
                </label>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE4EC]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(false)}
                className="h-8 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmImport}
                className="h-8 text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {duplicateResolution === "skip"
                    ? "Nhập 33 học viên mới"
                    : "Nhập & Cập nhật 45 học viên"}
                </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO DƯỚI ĐÁY */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#131B2E] text-white text-xs px-4 py-2.5 rounded-[6px] shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
