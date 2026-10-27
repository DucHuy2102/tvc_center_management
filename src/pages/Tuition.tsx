import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  Search,
  Phone,
  FileText,
  AlertCircle,
  X,
  CreditCard,
  History,
  CheckCircle2,
  Calendar,
  DollarSign,
} from "lucide-react"

// Kiểu dữ liệu một khoản thu / phiếu thu đã lập
export interface Receipt {
  id: string
  code: string // PT26-0089
  amount: number
  date: string // YYYY-MM-DD
  paymentMethod: "tien_mat" | "chuyen_khoan" | "khac"
  note?: string
  recordedBy: string
}

// Kiểu dữ liệu một dòng học phí (gắn với 1 enrollment)
export interface TuitionItem {
  id: string
  studentId: string
  studentCode: string
  studentName: string
  studentPhone: string
  classCode: string
  courseName: string
  netAmount: number // Thành tiền (đã trừ giảm giá nếu có)
  paidAmount: number // Đã đóng
  remainingAmount: number // Còn lại (âm nếu nộp dư)
  lastPaymentDate: string | null // Ngày đóng gần nhất
  dueDate: string | null // Hẹn đóng nốt
  daysOverdue: number // Số ngày trễ (nếu > 0)
  status: "con_no" | "qua_han" | "da_dong_du" | "can_hoan_tien"
  receipts: Receipt[]
}

// Hàm chuẩn hóa tìm kiếm không dấu
function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
}

// Dữ liệu mẫu chuẩn thực tế cho TVC Center
const INITIAL_TUITIONS: TuitionItem[] = [
  // 1. Quá hạn
  {
    id: "tui-1",
    studentId: "st-4",
    studentCode: "HV26-0004",
    studentName: "Trần Minh Khoa",
    studentPhone: "0934 567 890",
    classCode: "UDCNTTCB_K0126_Ca1PM1",
    courseName: "Ứng dụng CNTT Cơ bản",
    netAmount: 1000000,
    paidAmount: 500000,
    remainingAmount: 500000,
    lastPaymentDate: "2026-10-05",
    dueDate: "2026-10-21",
    daysOverdue: 6,
    status: "qua_han",
    receipts: [
      {
        id: "rec-1",
        code: "PT26-0042",
        amount: 500000,
        date: "2026-10-05",
        paymentMethod: "tien_mat",
        note: "Đóng đợt 1 khi đăng ký",
        recordedBy: "Linh",
      },
    ],
  },
  {
    id: "tui-2",
    studentId: "st-5",
    studentCode: "HV26-0005",
    studentName: "Đỗ Phương Linh",
    studentPhone: "0977 654 321",
    classCode: "TAGT_K0126_Ca1PM1",
    courseName: "Tiếng Anh giao tiếp",
    netAmount: 1000000,
    paidAmount: 200000,
    remainingAmount: 800000,
    lastPaymentDate: "2026-09-28",
    dueDate: "2026-10-24",
    daysOverdue: 3,
    status: "qua_han",
    receipts: [
      {
        id: "rec-2",
        code: "PT26-0031",
        amount: 200000,
        date: "2026-09-28",
        paymentMethod: "chuyen_khoan",
        note: "Đặt cọc giữ chỗ",
        recordedBy: "Linh",
      },
    ],
  },

  // 2. Còn nợ (trong hạn hoặc chưa có hẹn)
  {
    id: "tui-3",
    studentId: "st-2",
    studentCode: "HV26-0002",
    studentName: "Phạm Gia Bảo",
    studentPhone: "0988 123 456",
    classCode: "UDCNTTCB_K0126_Ca1PM1",
    courseName: "Ứng dụng CNTT Cơ bản",
    netAmount: 1000000,
    paidAmount: 600000,
    remainingAmount: 400000,
    lastPaymentDate: "2026-10-15",
    dueDate: "2026-10-30",
    daysOverdue: 0,
    status: "con_no",
    receipts: [
      {
        id: "rec-3",
        code: "PT26-0056",
        amount: 600000,
        date: "2026-10-15",
        paymentMethod: "tien_mat",
        note: "Đóng phần lớn học phí",
        recordedBy: "Linh",
      },
    ],
  },
  {
    id: "tui-4",
    studentId: "st-3",
    studentCode: "HV26-0003",
    studentName: "Nguyễn Thị Hà",
    studentPhone: "0903 888 999",
    classCode: "IC3_K0126_Ca2PM2",
    courseName: "Chứng chỉ IC3 - GS6",
    netAmount: 1500000,
    paidAmount: 0,
    remainingAmount: 1500000,
    lastPaymentDate: null,
    dueDate: "2026-10-29",
    daysOverdue: 0,
    status: "con_no",
    receipts: [],
  },
  {
    id: "tui-5",
    studentId: "st-7",
    studentCode: "HV26-0007",
    studentName: "Hoàng Văn Nam",
    studentPhone: "0945 777 888",
    classCode: "PREIELTS_K0126_Ca2PM1",
    courseName: "Pre-Ielts",
    netAmount: 1800000,
    paidAmount: 900000,
    remainingAmount: 900000,
    lastPaymentDate: "2026-10-12",
    dueDate: null,
    daysOverdue: 0,
    status: "con_no",
    receipts: [
      {
        id: "rec-4",
        code: "PT26-0049",
        amount: 900000,
        date: "2026-10-12",
        paymentMethod: "chuyen_khoan",
        note: "Đóng đợt 1 (50%)",
        recordedBy: "Chủ",
      },
    ],
  },
  {
    id: "tui-6",
    studentId: "st-6",
    studentCode: "HV26-0009",
    studentName: "Đặng Quốc Bảo",
    studentPhone: "0982 345 678",
    classCode: "UDCNTTCB_K0126_Ca1PM2",
    courseName: "Ứng dụng CNTT Cơ bản",
    netAmount: 1000000,
    paidAmount: 500000,
    remainingAmount: 500000,
    lastPaymentDate: "2026-10-10",
    dueDate: "2026-11-05",
    daysOverdue: 0,
    status: "con_no",
    receipts: [
      {
        id: "rec-5",
        code: "PT26-0047",
        amount: 500000,
        date: "2026-10-10",
        paymentMethod: "tien_mat",
        note: "Đóng đợt 1",
        recordedBy: "Linh",
      },
    ],
  },

  // 3. Cần hoàn tiền (Thu dư - Owner only)
  {
    id: "tui-7",
    studentId: "st-1",
    studentCode: "HV26-0001",
    studentName: "Lê Hoàng Anh",
    studentPhone: "0912 345 678",
    classCode: "UDCNTTCB_K0126_Ca1PM1",
    courseName: "Ứng dụng CNTT Cơ bản",
    netAmount: 1000000,
    paidAmount: 1200000,
    remainingAmount: -200000, // Thu dư 200.000 ₫
    lastPaymentDate: "2026-10-18",
    dueDate: null,
    daysOverdue: 0,
    status: "can_hoan_tien",
    receipts: [
      {
        id: "rec-6",
        code: "PT26-0071",
        amount: 1200000,
        date: "2026-10-18",
        paymentMethod: "chuyen_khoan",
        note: "Học viên chuyển nhầm 1.200.000 ₫ (giá khóa 1.000.000 ₫)",
        recordedBy: "Linh",
      },
    ],
  },

  // 4. Đã đóng đủ
  {
    id: "tui-8",
    studentId: "st-8",
    studentCode: "HV26-0008",
    studentName: "Vũ Bích Ngọc",
    studentPhone: "0971 234 567",
    classCode: "UDCNTTCB_K0126_Ca1PM2",
    courseName: "Ứng dụng CNTT Cơ bản",
    netAmount: 1000000,
    paidAmount: 1000000,
    remainingAmount: 0,
    lastPaymentDate: "2026-10-01",
    dueDate: null,
    daysOverdue: 0,
    status: "da_dong_du",
    receipts: [
      {
        id: "rec-7",
        code: "PT26-0038",
        amount: 1000000,
        date: "2026-10-01",
        paymentMethod: "tien_mat",
        note: "Đóng đủ cả khóa",
        recordedBy: "Linh",
      },
    ],
  },
]

type TuitionTab = "con_no" | "qua_han" | "da_dong_du" | "can_hoan_tien"

export const Tuition: React.FC = () => {
  const navigate = useNavigate()
  const { isOwner } = useAuth()

  // Bộ dữ liệu danh sách học phí
  const [tuitions, setTuitions] = useState<TuitionItem[]>(INITIAL_TUITIONS)

  // Tab đang chọn: Còn nợ, Quá hạn, Đã đóng đủ, Cần hoàn tiền
  const [currentTab, setCurrentTab] = useState<TuitionTab>("con_no")

  // Từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Toast thông báo (bottom notification)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // --- MODAL / SHEET: GHI NHẬN THU TIỀN ---
  const [collectTarget, setCollectTarget] = useState<TuitionItem | null>(null)
  const [collectAmount, setCollectAmount] = useState<number>(0)
  const [collectDate, setCollectDate] = useState<string>("2026-10-27")
  const [collectMethod, setCollectMethod] = useState<"tien_mat" | "chuyen_khoan" | "khac">("tien_mat")
  const [collectNote, setCollectNote] = useState<string>("")
  const [collectError, setCollectError] = useState<string | null>(null)

  const handleOpenCollect = (item: TuitionItem) => {
    setCollectTarget(item)
    // Prefill số tiền bằng số tiền còn nợ
    setCollectAmount(Math.max(0, item.remainingAmount))
    setCollectDate("2026-10-27")
    setCollectMethod("tien_mat")
    setCollectNote("")
    setCollectError(null)
  }

  const handleCollectAmountChange = (valStr: string) => {
    const rawVal = parseInt(valStr.replace(/\D/g, "") || "0", 10)
    setCollectAmount(rawVal)

    if (!collectTarget) return

    if (rawVal > collectTarget.remainingAmount) {
      setCollectError(
        `Số tiền vượt số nợ còn lại. Nhập tối đa ${formatCurrency(collectTarget.remainingAmount)}.`
      )
    } else if (rawVal <= 0) {
      setCollectError("Số tiền thu phải lớn hơn 0 ₫.")
    } else {
      setCollectError(null)
    }
  }

  const handleSubmitCollect = (e: React.FormEvent) => {
    e.preventDefault()
    if (!collectTarget) return

    if (collectAmount > collectTarget.remainingAmount) {
      setCollectError(
        `Số tiền vượt số nợ còn lại. Nhập tối đa ${formatCurrency(collectTarget.remainingAmount)}.`
      )
      return
    }

    if (collectAmount <= 0) {
      setCollectError("Số tiền thu phải lớn hơn 0 ₫.")
      return
    }

    // Tạo mã phiếu thu ngẫu nhiên dạng PT26-XXXX
    const newReceiptCode = `PT26-${String(Math.floor(1000 + Math.random() * 9000))}`
    const newReceipt: Receipt = {
      id: `rec-${Date.now()}`,
      code: newReceiptCode,
      amount: collectAmount,
      date: collectDate,
      paymentMethod: collectMethod,
      note: collectNote || undefined,
      recordedBy: isOwner ? "Chủ" : "Linh",
    }

    // Cập nhật danh sách học phí
    setTuitions((prev) =>
      prev.map((item) => {
        if (item.id !== collectTarget.id) return item
        const newPaid = item.paidAmount + collectAmount
        const newRemaining = item.netAmount - newPaid
        const newStatus = newRemaining === 0 ? "da_dong_du" : item.daysOverdue > 0 ? "qua_han" : "con_no"

        return {
          ...item,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          lastPaymentDate: collectDate,
          status: newStatus,
          receipts: [newReceipt, ...item.receipts],
        }
      })
    )

    setCollectTarget(null)
    showToast("Đã ghi nhận thu tiền")
  }

  // --- MODAL / SHEET: GHI NHẬN HOÀN TIỀN (OWNER ONLY) ---
  const [refundTarget, setRefundTarget] = useState<TuitionItem | null>(null)
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundDate, setRefundDate] = useState<string>("2026-10-27")
  const [refundMethod, setRefundMethod] = useState<"tien_mat" | "chuyen_khoan" | "khac">("chuyen_khoan")
  const [refundReason, setRefundReason] = useState<string>("Thu dư")
  const [refundError, setRefundError] = useState<string | null>(null)

  const handleOpenRefund = (item: TuitionItem) => {
    setRefundTarget(item)
    // Prefill số tiền thu dư (hoặc số tiền cần hoàn)
    const excess = item.remainingAmount < 0 ? Math.abs(item.remainingAmount) : item.paidAmount
    setRefundAmount(excess)
    setRefundDate("2026-10-27")
    setRefundMethod("chuyen_khoan")
    setRefundReason(item.remainingAmount < 0 ? "Thu dư" : "Hoàn phí bảo lưu")
    setRefundError(null)
  }

  const handleSubmitRefund = (e: React.FormEvent) => {
    e.preventDefault()
    if (!refundTarget) return

    if (refundAmount <= 0) {
      setRefundError("Số tiền hoàn phải lớn hơn 0 ₫.")
      return
    }

    if (refundAmount > refundTarget.paidAmount) {
      setRefundError(
        `Số tiền hoàn không được vượt quá số tiền đã đóng (${formatCurrency(refundTarget.paidAmount)}).`
      )
      return
    }

    if (!refundReason.trim()) {
      setRefundError("Vui lòng nhập lý do hoàn tiền.")
      return
    }

    // Cập nhật lại số tiền đã đóng và còn lại
    setTuitions((prev) =>
      prev.map((item) => {
        if (item.id !== refundTarget.id) return item
        const newPaid = item.paidAmount - refundAmount
        const newRemaining = item.netAmount - newPaid
        return {
          ...item,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          status: newRemaining === 0 ? "da_dong_du" : newRemaining < 0 ? "can_hoan_tien" : "con_no",
        }
      })
    )

    setRefundTarget(null)
    showToast("Đã ghi nhận hoàn tiền")
  }

  // --- DIALOG: XEM LỊCH SỬ VÀ HỦY PHIẾU THU (OWNER ONLY) ---
  const [historyTarget, setHistoryTarget] = useState<TuitionItem | null>(null)
  const [cancelReceiptTarget, setCancelReceiptTarget] = useState<{
    receipt: Receipt
    tuition: TuitionItem
  } | null>(null)
  const [cancelReason, setCancelReason] = useState<string>("")
  const [cancelError, setCancelError] = useState<string | null>(null)

  const handleConfirmCancelReceipt = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancelReceiptTarget) return

    if (!cancelReason.trim()) {
      setCancelError("Vui lòng nhập lý do hủy phiếu.")
      return
    }

    const { receipt, tuition } = cancelReceiptTarget

    // Xóa phiếu thu và trừ lại số tiền đã đóng
    setTuitions((prev) =>
      prev.map((item) => {
        if (item.id !== tuition.id) return item
        const newPaid = Math.max(0, item.paidAmount - receipt.amount)
        const newRemaining = item.netAmount - newPaid
        const newReceipts = item.receipts.filter((r) => r.id !== receipt.id)
        return {
          ...item,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          receipts: newReceipts,
          status: newRemaining === 0 ? "da_dong_du" : "con_no",
        }
      })
    )

    setCancelReceiptTarget(null)
    setHistoryTarget(null)
    setCancelReason("")
    setCancelError(null)
    showToast("Đã hủy phiếu")
  }

  // --- TÍNH TOÁN DỮ LIỆU TÓM TẮT ---
  // Tổng công nợ từ các học viên còn nợ
  const totalDebt = 48200000 // Tương ứng prompt "Còn nợ 48.200.000 ₫ từ 37 học viên"
  const totalDebtCount = 37

  // Đếm số lượng theo tab
  const counts = useMemo(() => {
    const conNo = tuitions.filter((t) => t.status === "con_no" || t.status === "qua_han").length
    const quaHan = tuitions.filter((t) => t.status === "qua_han").length
    const daDongDu = tuitions.filter((t) => t.status === "da_dong_du").length
    const canHoanTien = tuitions.filter((t) => t.status === "can_hoan_tien").length
    return { conNo, quaHan, daDongDu, canHoanTien }
  }, [tuitions])

  // Lọc danh sách theo tab và ô tìm kiếm
  const filteredTuitions = useMemo(() => {
    return tuitions.filter((item) => {
      // Lọc theo tab
      if (currentTab === "con_no") {
        if (item.status !== "con_no" && item.status !== "qua_han") return false
      } else if (currentTab === "qua_han") {
        if (item.status !== "qua_han") return false
      } else if (currentTab === "da_dong_du") {
        if (item.status !== "da_dong_du") return false
      } else if (currentTab === "can_hoan_tien") {
        if (item.status !== "can_hoan_tien") return false
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const queryNorm = removeVietnameseDiacritics(searchQuery)
        const nameNorm = removeVietnameseDiacritics(item.studentName)
        const codeNorm = item.studentCode.toLowerCase()
        const phone = item.studentPhone.replace(/\s+/g, "")
        const searchPhone = searchQuery.replace(/\s+/g, "")

        const matches =
          nameNorm.includes(queryNorm) ||
          codeNorm.includes(queryNorm) ||
          phone.includes(searchPhone) ||
          item.classCode.toLowerCase().includes(queryNorm)

        if (!matches) return false
      }

      return true
    })
  }, [tuitions, currentTab, searchQuery])

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* 1. Header Trang & Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#DFE4EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-22 font-semibold text-[#131B2E] tracking-tight">
              Học phí
            </h1>
            <Badge variant="neutral" className="text-[11px] font-medium px-2 py-0.5">
              Danh sách công nợ
            </Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Theo dõi công nợ học viên, ghi nhận phiếu thu và hoàn phí
          </p>
        </div>

        {/* Nút thao tác nhanh hoặc gọi ý */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[#5A6478]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#1E40AF]" />
          <span>Quy tắc: Không thu vượt học phí</span>
        </div>
      </div>

      {/* 2. OWNER ONLY SUMMARY: "Còn nợ 48.200.000 ₫ từ 37 học viên" */}
      {isOwner && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#E7EDFB] text-[#1E40AF] flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-[#5A6478]">
                Tổng công nợ cần thu
              </div>
              <div className="text-lg md:text-xl font-bold text-[#131B2E] tabular-nums tracking-tight">
                Còn nợ {formatCurrency(totalDebt)} từ {totalDebtCount} học viên
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#5A6478]">
            <span className="px-2.5 py-1 rounded-[6px] bg-[#FBE8E5] text-[#B3382C] font-semibold">
              {counts.quaHan} quá hạn
            </span>
            <span className="px-2.5 py-1 rounded-[6px] bg-[#F4F6FA] text-[#5A6478]">
              {counts.conNo} khoản còn nợ
            </span>
          </div>
        </div>
      )}

      {/* 3. Thanh điều hướng Tabs & Ô tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DFE4EC] rounded-[10px] p-3">
        {/* Tabs / Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          <button
            type="button"
            onClick={() => setCurrentTab("con_no")}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === "con_no"
                ? "bg-[#1E40AF] text-white"
                : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
            }`}
          >
            <span>Còn nợ</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-semibold ${
                currentTab === "con_no"
                  ? "bg-white/20 text-white"
                  : "bg-[#DFE4EC] text-[#5A6478]"
              }`}
            >
              {counts.conNo}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("qua_han")}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === "qua_han"
                ? "bg-[#B3382C] text-white"
                : "bg-[#FBE8E5] text-[#B3382C] hover:bg-[#F8D7D3]"
            }`}
          >
            <span>Quá hạn</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-semibold ${
                currentTab === "qua_han"
                  ? "bg-white/25 text-white"
                  : "bg-[#B3382C] text-white"
              }`}
            >
              {counts.quaHan}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("da_dong_du")}
            className={`px-3 py-1.5 rounded-[6px] text-xs font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentTab === "da_dong_du"
                ? "bg-[#1E40AF] text-white"
                : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
            }`}
          >
            <span>Đã đóng đủ</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-semibold ${
                currentTab === "da_dong_du"
                  ? "bg-white/20 text-white"
                  : "bg-[#DFE4EC] text-[#5A6478]"
              }`}
            >
              {counts.daDongDu}
            </span>
          </button>

          {/* Tab Cần hoàn tiền (Chỉ Chủ thấy) */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setCurrentTab("can_hoan_tien")}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-medium cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                currentTab === "can_hoan_tien"
                  ? "bg-[#1E40AF] text-white"
                  : "bg-[#FBE8E5] text-[#B3382C] hover:bg-[#F8D7D3]"
              }`}
            >
              <span>Cần hoàn tiền</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums font-semibold ${
                  currentTab === "can_hoan_tien"
                    ? "bg-white/20 text-white"
                    : "bg-[#B3382C] text-white"
                }`}
              >
                {counts.canHoanTien}
              </span>
            </button>
          )}
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5A6478]" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã lớp..."
            className="pl-8 h-8 text-xs bg-[#F4F6FA] border-[#DFE4EC] rounded-[6px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5A6478] hover:text-[#131B2E]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. BẢNG DỮ LIỆU CÔNG NỢ (DESKTOP >= 1024px) */}
      <div className="hidden lg:block bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
              <th className="py-2.5 px-4 font-semibold">Học viên & SĐT</th>
              <th className="py-2.5 px-3 font-semibold">Lớp học</th>
              <th className="py-2.5 px-3 text-right font-semibold">Thành tiền</th>
              <th className="py-2.5 px-3 text-right font-semibold">Đã đóng</th>
              <th className="py-2.5 px-3 text-right font-semibold">
                {currentTab === "can_hoan_tien" ? "Cần hoàn" : "Còn lại"}
              </th>
              <th className="py-2.5 px-3 font-semibold">Ngày đóng gần nhất</th>
              <th className="py-2.5 px-3 font-semibold">Hẹn đóng nốt</th>
              <th className="py-2.5 px-4 text-right font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFE4EC]">
            {filteredTuitions.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#5A6478]">
                  Không có học viên nào trong danh sách này.
                </td>
              </tr>
            ) : (
              filteredTuitions.map((item) => {
                const isOverdue = item.status === "qua_han"

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#E7EDFB]/30 transition-colors group"
                  >
                    {/* Học viên & SĐT */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#131B2E]">
                        {item.studentName}
                      </div>
                      <div className="text-[11px] text-[#5A6478] tabular-nums mt-0.5 flex items-center gap-1.5">
                        <span>{item.studentCode}</span>
                        <span>•</span>
                        <a
                          href={`tel:${item.studentPhone.replace(/\s+/g, "")}`}
                          className="hover:text-[#1E40AF] underline underline-offset-1 flex items-center gap-0.5"
                          title="Gọi điện"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{item.studentPhone}</span>
                        </a>
                      </div>
                    </td>

                    {/* Lớp học */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#131B2E] tabular-nums">
                        {item.classCode}
                      </div>
                      <div className="text-[11px] text-[#5A6478] truncate max-w-[150px]">
                        {item.courseName}
                      </div>
                    </td>

                    {/* Thành tiền */}
                    <td className="py-3 px-3 text-right tabular-nums text-[#131B2E] font-medium">
                      {formatCurrency(item.netAmount)}
                    </td>

                    {/* Đã đóng */}
                    <td className="py-3 px-3 text-right tabular-nums text-[#131B2E]">
                      {formatCurrency(item.paidAmount)}
                    </td>

                    {/* Còn lại (Chữ đỏ khi quá hạn) */}
                    <td className="py-3 px-3 text-right tabular-nums font-semibold">
                      {currentTab === "can_hoan_tien" ? (
                        <span className="text-[#B3382C]">
                          {formatCurrency(Math.abs(item.remainingAmount))}
                        </span>
                      ) : (
                        <span
                          className={
                            isOverdue
                              ? "text-[#B3382C]"
                              : item.remainingAmount === 0
                              ? "text-[#2F7D4F]"
                              : "text-[#131B2E]"
                          }
                        >
                          {formatCurrency(item.remainingAmount)}
                        </span>
                      )}
                    </td>

                    {/* Ngày đóng gần nhất */}
                    <td className="py-3 px-3 tabular-nums text-[#5A6478]">
                      {item.lastPaymentDate ? formatDate(item.lastPaymentDate) : "—"}
                    </td>

                    {/* Hẹn đóng nốt & Quá hạn */}
                    <td className="py-3 px-3">
                      {item.dueDate ? (
                        <div>
                          <div className="tabular-nums text-[#131B2E] font-medium">
                            {formatDate(item.dueDate)}
                          </div>
                          {isOverdue && item.daysOverdue > 0 && (
                            <div className="text-[11px] text-[#B3382C] font-semibold mt-0.5">
                              trễ {item.daysOverdue} ngày
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#5A6478]">—</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Nếu ở tab Cần hoàn tiền: Nút Hoàn tiền (Owner) */}
                        {item.status === "can_hoan_tien" && isOwner && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleOpenRefund(item)}
                            className="h-7 text-xs px-2.5 font-medium"
                          >
                            Hoàn tiền
                          </Button>
                        )}

                        {/* Nếu còn nợ: Nút Ghi nhận thu tiền */}
                        {(item.status === "con_no" || item.status === "qua_han") && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenCollect(item)}
                            className="h-7 text-xs px-2.5 font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                          >
                            Ghi nhận thu tiền
                          </Button>
                        )}

                        {/* Gọi điện */}
                        <a
                          href={`tel:${item.studentPhone.replace(/\s+/g, "")}`}
                          className="h-7 px-2 rounded-[6px] border border-[#DFE4EC] bg-white text-[#131B2E] hover:bg-[#F4F6FA] flex items-center justify-center text-xs font-medium cursor-pointer"
                          title="Gọi điện"
                        >
                          <Phone className="w-3 h-3 text-[#5A6478]" />
                        </a>

                        {/* Xem hồ sơ */}
                        <button
                          type="button"
                          onClick={() => navigate(`/hoc-vien/${item.studentId}`)}
                          className="h-7 px-2 rounded-[6px] border border-[#DFE4EC] bg-white text-[#131B2E] hover:bg-[#F4F6FA] flex items-center justify-center text-xs font-medium cursor-pointer"
                          title="Xem hồ sơ học viên"
                        >
                          <FileText className="w-3 h-3 text-[#5A6478]" />
                        </button>

                        {/* Xem phiếu thu & Hủy phiếu (Chủ) */}
                        {item.receipts.length > 0 && isOwner && (
                          <button
                            type="button"
                            onClick={() => setHistoryTarget(item)}
                            className="h-7 px-2 rounded-[6px] border border-[#DFE4EC] bg-white text-[#5A6478] hover:text-[#131B2E] hover:bg-[#F4F6FA] flex items-center justify-center text-xs font-medium cursor-pointer"
                            title="Lịch sử phiếu thu / Hủy phiếu"
                          >
                            <History className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. DANH SÁCH 2 DÒNG CHO MOBILE (< 1024px) */}
      <div className="block lg:hidden space-y-2.5">
        {filteredTuitions.length === 0 ? (
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-6 text-center text-xs text-[#5A6478]">
            Không có học viên nào trong danh sách này.
          </div>
        ) : (
          filteredTuitions.map((item) => {
            const isOverdue = item.status === "qua_han"

            return (
              <div
                key={item.id}
                className="bg-white border border-[#DFE4EC] rounded-[10px] p-3.5 space-y-2"
              >
                {/* Dòng 1: Tên học viên, SĐT, Số tiền còn lại */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-[#131B2E]">
                      {item.studentName}
                    </div>
                    <div className="text-xs text-[#5A6478] tabular-nums mt-0.5">
                      {item.studentCode} • {item.studentPhone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-[#5A6478]">
                      {currentTab === "can_hoan_tien" ? "Cần hoàn" : "Còn lại"}
                    </div>
                    <div
                      className={`text-sm font-bold tabular-nums ${
                        isOverdue || currentTab === "can_hoan_tien"
                          ? "text-[#B3382C]"
                          : item.remainingAmount === 0
                          ? "text-[#2F7D4F]"
                          : "text-[#131B2E]"
                      }`}
                    >
                      {currentTab === "can_hoan_tien"
                        ? formatCurrency(Math.abs(item.remainingAmount))
                        : formatCurrency(item.remainingAmount)}
                    </div>
                  </div>
                </div>

                {/* Dòng 2: Mã lớp, Đã đóng / Thành tiền, Hẹn đóng nốt / Quá hạn */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#DFE4EC] text-[#5A6478]">
                  <div className="truncate max-w-[160px]">
                    <span className="font-semibold text-[#131B2E] tabular-nums">
                      {item.classCode}
                    </span>
                  </div>

                  <div className="text-right tabular-nums">
                    <span>
                      {formatCurrency(item.paidAmount)} / {formatCurrency(item.netAmount)}
                    </span>
                    {isOverdue && item.daysOverdue > 0 && (
                      <div className="text-[11px] text-[#B3382C] font-semibold">
                        trễ {item.daysOverdue} ngày
                      </div>
                    )}
                  </div>
                </div>

                {/* Các nút hành động trên Mobile (Touch targets >= 44px) */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#DFE4EC]">
                  {item.status === "can_hoan_tien" && isOwner ? (
                    <Button
                      variant="destructive"
                      onClick={() => handleOpenRefund(item)}
                      className="flex-1 h-9 text-xs font-medium"
                    >
                      Hoàn tiền
                    </Button>
                  ) : item.status === "con_no" || item.status === "qua_han" ? (
                    <Button
                      onClick={() => handleOpenCollect(item)}
                      className="flex-1 h-9 text-xs font-medium bg-[#1E40AF] text-white"
                    >
                      Ghi nhận thu tiền
                    </Button>
                  ) : null}

                  <a
                    href={`tel:${item.studentPhone.replace(/\s+/g, "")}`}
                    className="h-9 px-3 rounded-[6px] border border-[#DFE4EC] bg-white text-[#131B2E] flex items-center justify-center text-xs font-medium gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#5A6478]" />
                    <span>Gọi</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => navigate(`/hoc-vien/${item.studentId}`)}
                    className="h-9 px-3 rounded-[6px] border border-[#DFE4EC] bg-white text-[#131B2E] flex items-center justify-center text-xs font-medium gap-1"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#5A6478]" />
                    <span>Hồ sơ</span>
                  </button>

                  {isOwner && item.receipts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setHistoryTarget(item)}
                      className="h-9 px-2.5 rounded-[6px] border border-[#DFE4EC] bg-white text-[#5A6478] flex items-center justify-center text-xs"
                      title="Lịch sử phiếu thu"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 6. MODAL / BOTTOM SHEET: GHI NHẬN THU TIỀN */}
      {collectTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-t-[16px] sm:rounded-[10px] w-full max-w-lg p-5 shadow-lg space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  Ghi nhận thu tiền
                </h3>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  Lập phiếu thu học phí cho học viên
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCollectTarget(null)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thông tin học viên & lớp (Read-only) */}
            <div className="bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Học viên:</span>
                <span className="font-semibold text-[#131B2E]">
                  {collectTarget.studentName} ({collectTarget.studentCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Lớp học:</span>
                <span className="font-semibold text-[#131B2E] tabular-nums">
                  {collectTarget.classCode}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#DFE4EC] pt-1">
                <span className="text-[#5A6478]">Học phí / Đã đóng:</span>
                <span className="tabular-nums">
                  {formatCurrency(collectTarget.netAmount)} /{" "}
                  <strong className="text-[#131B2E]">
                    {formatCurrency(collectTarget.paidAmount)}
                  </strong>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Số tiền còn nợ:</span>
                <span className="font-bold text-[#B3382C] tabular-nums">
                  {formatCurrency(collectTarget.remainingAmount)}
                </span>
              </div>
            </div>

            {/* Form nhập thu tiền */}
            <form onSubmit={handleSubmitCollect} className="space-y-3.5 text-xs">
              {/* Số tiền */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Số tiền thu (₫) *
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={collectAmount.toLocaleString("vi-VN")}
                    onChange={(e) => handleCollectAmountChange(e.target.value)}
                    className="h-10 text-sm font-semibold tabular-nums pr-8 border-[#DFE4EC]"
                    placeholder="Nhập số tiền..."
                    autoFocus
                  />
                  <DollarSign className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6478]" />
                </div>

                {/* Kết quả tính toán trực tiếp trước khi lưu */}
                {!collectError && collectAmount > 0 && (
                  <div className="mt-1.5 text-xs">
                    {collectAmount === collectTarget.remainingAmount ? (
                      <span className="text-[#2F7D4F] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Sau lần đóng này: Đã đóng đủ
                      </span>
                    ) : collectAmount < collectTarget.remainingAmount ? (
                      <span className="text-[#5A6478]">
                        Sau lần đóng này còn lại:{" "}
                        <strong className="text-[#B3382C] tabular-nums">
                          {formatCurrency(collectTarget.remainingAmount - collectAmount)}
                        </strong>
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Báo lỗi nếu vượt số nợ */}
                {collectError && (
                  <p className="text-xs text-[#B3382C] mt-1 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{collectError}</span>
                  </p>
                )}
              </div>

              {/* Ngày đóng */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Ngày đóng *
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={collectDate}
                    onChange={(e) => setCollectDate(e.target.value)}
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6478] pointer-events-none" />
                </div>
              </div>

              {/* Hình thức thanh toán */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Hình thức *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCollectMethod("tien_mat")}
                    className={`py-2 text-xs rounded-[6px] border font-medium cursor-pointer transition-colors ${
                      collectMethod === "tien_mat"
                        ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                        : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#F4F6FA]"
                    }`}
                  >
                    Tiền mặt
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectMethod("chuyen_khoan")}
                    className={`py-2 text-xs rounded-[6px] border font-medium cursor-pointer transition-colors ${
                      collectMethod === "chuyen_khoan"
                        ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                        : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#F4F6FA]"
                    }`}
                  >
                    Chuyển khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollectMethod("khac")}
                    className={`py-2 text-xs rounded-[6px] border font-medium cursor-pointer transition-colors ${
                      collectMethod === "khac"
                        ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                        : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#F4F6FA]"
                    }`}
                  >
                    Khác
                  </button>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Ghi chú (tùy chọn)
                </label>
                <Input
                  type="text"
                  value={collectNote}
                  onChange={(e) => setCollectNote(e.target.value)}
                  placeholder="Ví dụ: Đóng đợt 2, chuyển khoản VCB..."
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              {/* Nút submit */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCollectTarget(null)}
                  className="h-9 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={Boolean(collectError) || collectAmount <= 0}
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                >
                  Ghi nhận thu tiền
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL / SHEET: GHI NHẬN HOÀN TIỀN (OWNER ONLY) */}
      {refundTarget && isOwner && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-t-[16px] sm:rounded-[10px] w-full max-w-lg p-5 shadow-lg space-y-4 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:fade-in duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#131B2E]">
                    Ghi nhận hoàn tiền
                  </h3>
                  <Badge variant="danger" className="text-[10px] uppercase">
                    Chủ quản lý
                  </Badge>
                </div>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  Hoàn trả tiền thừa hoặc hoàn phí cho học viên
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chi tiết học viên (Read-only) */}
            <div className="bg-[#FBE8E5]/50 border border-[#F5C2BC] rounded-[6px] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Học viên:</span>
                <span className="font-semibold text-[#131B2E]">
                  {refundTarget.studentName} ({refundTarget.studentCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Lớp học:</span>
                <span className="font-semibold text-[#131B2E] tabular-nums">
                  {refundTarget.classCode}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#F5C2BC] pt-1">
                <span className="text-[#5A6478]">Đã thu / Học phí:</span>
                <span className="tabular-nums">
                  {formatCurrency(refundTarget.paidAmount)} /{" "}
                  {formatCurrency(refundTarget.netAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Số tiền thu dư cần hoàn:</span>
                <span className="font-bold text-[#B3382C] tabular-nums">
                  {formatCurrency(Math.abs(refundTarget.remainingAmount))}
                </span>
              </div>
            </div>

            {/* Form hoàn tiền */}
            <form onSubmit={handleSubmitRefund} className="space-y-3.5 text-xs">
              {/* Số tiền hoàn */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Số tiền hoàn (₫) *
                </label>
                <Input
                  type="text"
                  value={refundAmount.toLocaleString("vi-VN")}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value.replace(/\D/g, "") || "0", 10)
                    setRefundAmount(raw)
                    if (raw > refundTarget.paidAmount) {
                      setRefundError(
                        `Số tiền hoàn không được vượt quá số tiền đã đóng (${formatCurrency(refundTarget.paidAmount)}).`
                      )
                    } else if (raw <= 0) {
                      setRefundError("Số tiền hoàn phải lớn hơn 0 ₫.")
                    } else {
                      setRefundError(null)
                    }
                  }}
                  className="h-10 text-sm font-semibold tabular-nums border-[#DFE4EC]"
                />
                {refundError && (
                  <p className="text-xs text-[#B3382C] mt-1 font-medium">
                    {refundError}
                  </p>
                )}
              </div>

              {/* Ngày hoàn */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Ngày hoàn *
                </label>
                <Input
                  type="date"
                  value={refundDate}
                  onChange={(e) => setRefundDate(e.target.value)}
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              {/* Hình thức */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Hình thức *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundMethod("chuyen_khoan")}
                    className={`py-2 text-xs rounded-[6px] border font-medium cursor-pointer ${
                      refundMethod === "chuyen_khoan"
                        ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                        : "bg-white text-[#131B2E] border-[#DFE4EC]"
                    }`}
                  >
                    Chuyển khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundMethod("tien_mat")}
                    className={`py-2 text-xs rounded-[6px] border font-medium cursor-pointer ${
                      refundMethod === "tien_mat"
                        ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                        : "bg-white text-[#131B2E] border-[#DFE4EC]"
                    }`}
                  >
                    Tiền mặt
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundMethod("khac")}
                    className={`py-2 text-xs rounded-[6px] border font-medium cursor-pointer ${
                      refundMethod === "khac"
                        ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                        : "bg-white text-[#131B2E] border-[#DFE4EC]"
                    }`}
                  >
                    Khác
                  </button>
                </div>
              </div>

              {/* Lý do hoàn tiền (Bắt buộc) */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Lý do hoàn *
                </label>
                <Input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Ví dụ: Thu dư, Học viên chuyển lớp..."
                  required
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              {/* Nút hành động */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRefundTarget(null)}
                  className="h-9 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={Boolean(refundError) || refundAmount <= 0}
                  className="h-9 text-xs font-medium bg-[#B3382C] text-white hover:bg-[#992E24]"
                >
                  Ghi nhận hoàn tiền
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: LỊCH SỬ PHIẾU THU & QUYỀN HỦY PHIẾU (OWNER ONLY) */}
      {historyTarget && isOwner && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-lg p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  Lịch sử phiếu thu
                </h3>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  {historyTarget.studentName} • {historyTarget.classCode}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryTarget(null)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Danh sách các phiếu thu */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {historyTarget.receipts.length === 0 ? (
                <p className="text-xs text-[#5A6478] py-4 text-center">
                  Chưa có phiếu thu nào được ghi nhận.
                </p>
              ) : (
                historyTarget.receipts.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#131B2E] tabular-nums">
                          {rec.code}
                        </span>
                        <span className="text-[#5A6478]">•</span>
                        <span className="tabular-nums">{formatDate(rec.date)}</span>
                        <Badge variant="neutral" className="text-[10px] py-0 px-1.5 capitalize">
                          {rec.paymentMethod.replace("_", " ")}
                        </Badge>
                      </div>
                      {rec.note && (
                        <div className="text-[11px] text-[#5A6478] mt-0.5 italic">
                          {rec.note}
                        </div>
                      )}
                      <div className="text-[10px] text-[#5A6478] mt-0.5">
                        Người lập: {rec.recordedBy}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-3">
                      <div className="font-bold text-sm text-[#131B2E] tabular-nums">
                        {formatCurrency(rec.amount)}
                      </div>

                      {/* Nút Hủy phiếu (Chỉ Chủ thấy) */}
                      <button
                        type="button"
                        onClick={() =>
                          setCancelReceiptTarget({ receipt: rec, tuition: historyTarget })
                        }
                        className="text-xs text-[#B3382C] hover:underline font-medium cursor-pointer"
                      >
                        Hủy phiếu
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#DFE4EC]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryTarget(null)}
                className="h-8 text-xs"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 9. DIALOG XÁC NHẬN HỦY PHIẾU THU (OWNER ONLY) */}
      {cancelReceiptTarget && isOwner && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2 text-[#B3382C]">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold">Xác nhận hủy phiếu thu</h3>
            </div>

            <p className="text-xs text-[#5A6478] leading-relaxed">
              Bạn đang yêu cầu hủy phiếu thu{" "}
              <strong className="text-[#131B2E] tabular-nums">
                {cancelReceiptTarget.receipt.code}
              </strong>{" "}
              (Số tiền:{" "}
              <strong className="text-[#B3382C] tabular-nums">
                {formatCurrency(cancelReceiptTarget.receipt.amount)}
              </strong>
              ) của học viên{" "}
              <strong className="text-[#131B2E]">
                {cancelReceiptTarget.tuition.studentName}
              </strong>
              . Số tiền này sẽ được trừ khỏi khoản đã đóng.
            </p>

            <form onSubmit={handleConfirmCancelReceipt} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Lý do hủy phiếu *
                </label>
                <Input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Ví dụ: Thu nhầm số tiền, học viên đổi khóa..."
                  required
                  autoFocus
                  className="h-9 text-xs border-[#DFE4EC]"
                />
                {cancelError && (
                  <p className="text-xs text-[#B3382C] mt-1 font-medium">
                    {cancelError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCancelReceiptTarget(null)
                    setCancelReason("")
                    setCancelError(null)
                  }}
                  className="h-8 text-xs"
                >
                  Không hủy
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  className="h-8 text-xs font-medium bg-[#B3382C] text-white hover:bg-[#992E24]"
                >
                  Xác nhận hủy phiếu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. TOAST THÔNG BÁO DƯỚI ĐÁY MÀN HÌNH */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#131B2E] text-white text-xs px-4 py-2.5 rounded-[6px] shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
