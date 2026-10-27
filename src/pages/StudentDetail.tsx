import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/format"
import type { ZaloStatus } from "@/types/database"
import {
  ArrowLeft,
  Phone,
  Edit,
  CreditCard,
  MoreHorizontal,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Clock,
  Trash2,
  Calendar,
  Building,
  Award,
  Send,
  FileText,
} from "lucide-react"

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isOwner } = useAuth()

  // State các tab
  const [activeTab, setActiveTab] = useState<"tong_quan" | "lop_hoc" | "hoc_phi" | "thi" | "lich_su">("tong_quan")

  // Dữ liệu học viên mẫu chuẩn
  const [student, setStudent] = useState({
    id: id || "s-1",
    code: "HV26-0001",
    lastName: "Lê Hoàng",
    firstName: "Anh",
    fullName: "Lê Hoàng Anh",
    gender: "Nam",
    dateOfBirth: "2005-04-12",
    placeOfBirth: "Trà Vinh",
    phone: "0912 345 678",
    phoneAlt: "0988 777 666",
    zaloStatus: "da_vao_nhom" as ZaloStatus,
    organization: "Trường CĐ nghề Trà Vinh",
    organizationDetail: "lớp Thú y - CD11",
    referrer: "Cô Mai Anh",
    commissionStatus: "Đủ điều kiện",
    commissionAmount: 20000,
    citizenId: "079095012345",
    citizenIdIssueDate: "2021-04-20",
    citizenIdIssuePlace: "Cục Cảnh sát QLHC về TTXH",
    dossierChecks: {
      cccd: true,
      photos: true,
    },
    notes: "Học viên đăng ký học buổi tối để tiện lịch học tại trường Cao đẳng. Đã vào nhóm Zalo lớp Ca 1.",
  })

  // State CCCD mask
  const [showCitizenId, setShowCitizenId] = useState(false)
  const [revealLogs, setRevealLogs] = useState<string[]>([])

  // State menu Zalo & Overflow
  const [showZaloMenu, setShowZaloMenu] = useState(false)
  const [showOverflowMenu, setShowOverflowMenu] = useState(false)

  // State Dialog Hoàn tiền / Hủy phiếu
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [showVoidModal, setShowVoidModal] = useState(false)
  const [modalReason, setModalReason] = useState("")
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null)

  // Ghi chú mới
  const [newNote, setNewNote] = useState("")

  // Danh sách các lớp học đã ghi danh (Enrollments)
  const enrollments = [
    {
      id: "enr-1",
      className: "Tiếng Anh giao tiếp",
      classCode: "TAGT_K0126_Ca1PM1",
      teacher: "Cô Mai Anh",
      schedule: "Ca 1, Thứ 2-4-6, 18:30-20:30",
      room: "Phòng máy 1 (PM1)",
      status: "Đang học",
      coursePrice: 1200000,
      discount: 200000,
      discountReason: "Ưu đãi đăng ký sớm",
      netAmount: 1000000, // Thành tiền
      totalPaid: 500000,   // Đã đóng
      balanceDue: 500000,  // Còn lại
      balanceDueDate: "30/10/2026",
      payments: [
        {
          id: "p-1",
          date: "19/10/2026",
          amount: 500000,
          method: "Chuyển khoản",
          note: "Đóng đợt 1",
        },
      ],
    },
    {
      id: "enr-2",
      className: "Ứng dụng CNTT Cơ bản",
      classCode: "UDCNTTCB_K0126_Ca1PM1",
      teacher: "Thầy Tuấn",
      schedule: "Ca 1, Thứ 2-4-6, 18:30-20:30",
      room: "Phòng máy 1 (PM1)",
      status: "Đang học",
      coursePrice: 800000,
      discount: 0,
      discountReason: "",
      netAmount: 800000,
      totalPaid: 800000,
      balanceDue: 0,
      balanceDueDate: null,
      payments: [
        {
          id: "p-2",
          date: "01/10/2026",
          amount: 800000,
          method: "Tiền mặt",
          note: "Đóng đủ 1 lần",
        },
      ],
    },
  ]

  // Danh sách phiếu thu/chi cho tab Học phí
  const [receipts, setReceipts] = useState([
    {
      id: "PT-2610-0012",
      date: "19/10/2026",
      amount: 500000,
      method: "Chuyển khoản",
      staff: "Linh",
      type: "thu",
      status: "hieu_luc",
      note: "Đóng đợt 1 lớp Tiếng Anh giao tiếp",
      voidReason: null,
    },
    {
      id: "PT-2610-0005",
      date: "01/10/2026",
      amount: 800000,
      method: "Tiền mặt",
      staff: "Tuấn",
      type: "thu",
      status: "hieu_luc",
      note: "Học phí lớp Ứng dụng CNTT Cơ bản",
      voidReason: null,
    },
    {
      id: "PT-2609-0098",
      date: "25/09/2026",
      amount: 300000,
      method: "Tiền mặt",
      staff: "Linh",
      type: "thu",
      status: "da_huy",
      note: "Phiếu ghi nhầm lớp",
      voidReason: "Nhập trùng thông tin đóng tiền",
    },
  ])

  // Lịch sử thi & chứng chỉ
  const exams = [
    {
      examName: "Chứng chỉ Ứng dụng CNTT Cơ bản K0126",
      date: "03/11/2026",
      shift: "Ca 1 (18:30)",
      status: "Đã thi",
      score: "8.5 / 10",
      result: "Đậu",
      rescheduleHistory: "Dời lịch từ 20/10 sang 03/11 (lý do: bận lịch thi trường CĐ)",
    },
  ]

  const certificate = {
    status: "Đã cấp bằng",
    issueDate: "10/11/2026",
    certNo: "CN-TVC-2026-0421",
    decisionNo: "QĐ-142/QĐ-TVC",
  }

  // Dòng thời gian lịch sử
  const [timeline, setTimeline] = useState([
    "19/10/2026 14:05: Linh ghi nhận thu 500.000 ₫ (Chuyển khoản)",
    "15/10/2026 10:12: Linh cập nhật nộp 02 hình 3x4",
    "01/10/2026 08:30: Tuấn ghi nhận thu 800.000 ₫ (Tiền mặt)",
    "01/10/2026 08:15: Tuấn đăng ký mới học viên vào lớp UDCNTTCB_K0126_Ca1PM1",
  ])

  // Tính trạng thái hồ sơ
  const isDossierComplete = student.dossierChecks.cccd && student.dossierChecks.photos

  // Xử lý hiện CCCD
  const handleToggleRevealCccd = () => {
    if (!showCitizenId) {
      const now = new Date()
      const timeStr = `${formatDate(now)} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      setRevealLogs((prev) => [`Nhân viên đã mở xem số CCCD lúc ${timeStr}`, ...prev])
    }
    setShowCitizenId(!showCitizenId)
  }

  // Mask CCCD format 079•••••••12
  const maskedCccd = student.citizenId
    ? `${student.citizenId.substring(0, 3)}•••••••${student.citizenId.substring(student.citizenId.length - 2)}`
    : "—"

  // Xử lý đổi trạng thái Zalo
  const handleChangeZalo = (newStatus: ZaloStatus) => {
    setStudent((prev) => ({ ...prev, zaloStatus: newStatus }))
    setShowZaloMenu(false)
  }

  // Xử lý thêm ghi chú
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim()) return
    const now = new Date()
    const log = `${formatDate(now)}: ${newNote.trim()}`
    setTimeline((prev) => [log, ...prev])
    setNewNote("")
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] w-full mx-auto space-y-5 font-sans">
      {/* Nút Quay lại */}
      <button
        onClick={() => navigate("/hoc-vien")}
        className="inline-flex items-center gap-1.5 text-xs text-[#5A6478] hover:text-[#1E40AF] transition-colors cursor-pointer select-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Danh sách học viên</span>
      </button>

      {/* =========================================================================
          1. HEADER BLOCK (Page title, Mã, Zalo, Nơi đến, Actions)
      ========================================================================= */}
      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <h1 className="text-[22px] leading-[30px] font-semibold text-[#131B2E]">
                {student.fullName}
              </h1>
              <span className="font-mono text-xs text-[#5A6478] tabular-nums bg-[#ECEFF5] px-2 py-0.5 rounded-[4px]">
                {student.code}
              </span>
              <span className="text-xs text-[#5A6478]">
                &bull; {student.gender} &bull; Sinh ngày {formatDate(student.dateOfBirth)}
              </span>
            </div>

            {/* Số điện thoại (Tap to call) + Zalo chip */}
            <div className="flex items-center gap-3 flex-wrap text-sm pt-1">
              <a
                href={`tel:${student.phone}`}
                className="flex items-center gap-1.5 font-medium text-[#1E40AF] hover:underline tabular-nums"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{student.phone}</span>
              </a>

              {student.phoneAlt && (
                <a
                  href={`tel:${student.phoneAlt}`}
                  className="flex items-center gap-1 text-xs text-[#5A6478] hover:underline tabular-nums"
                >
                  <span>(Phụ: {student.phoneAlt})</span>
                </a>
              )}

              {/* Tappable Zalo Chip */}
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setShowZaloMenu(!showZaloMenu)}
                  className="inline-flex items-center gap-1 cursor-pointer focus:outline-none"
                  aria-label="Thay đổi trạng thái Zalo"
                >
                  <Badge variant="success" className="text-xs py-0.5 hover:opacity-90">
                    {student.zaloStatus === "da_vao_nhom"
                      ? "Đã vào nhóm Zalo"
                      : student.zaloStatus === "da_lien_he"
                      ? "Đã liên hệ"
                      : "Chưa liên hệ"}
                    <span className="text-[10px] ml-1 opacity-70">▼</span>
                  </Badge>
                </button>

                {showZaloMenu && (
                  <div className="absolute left-0 mt-1.5 w-44 bg-white border border-[#DFE4EC] rounded-[6px] shadow-lg py-1 z-30">
                    <div className="px-3 py-1 text-[11px] font-semibold text-[#5A6478] uppercase border-b border-[#DFE4EC]">
                      Trạng thái Zalo
                    </div>
                    {(
                      [
                        { key: "chua_lien_he", label: "Chưa liên hệ" },
                        { key: "da_lien_he", label: "Đã liên hệ" },
                        { key: "da_vao_nhom", label: "Đã vào nhóm Zalo" },
                        { key: "khong_tim_thay", label: "Không tìm thấy Zalo" },
                        { key: "chan_tin_nhan", label: "Chặn tin nhắn" },
                      ] as const
                    ).map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => handleChangeZalo(st.key)}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#131B2E] hover:bg-[#E7EDFB] flex items-center justify-between"
                      >
                        <span>{st.label}</span>
                        {student.zaloStatus === st.key && <Check className="w-3.5 h-3.5 text-[#1E40AF]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Nơi đến */}
            {student.organization && (
              <div className="text-xs text-[#5A6478] pt-0.5 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 opacity-70 shrink-0" />
                <span>
                  Nơi đến: <strong>{student.organization}</strong> ({student.organizationDetail})
                </span>
              </div>
            )}
          </div>

          {/* Actions: Sửa, Ghi nhận thu tiền, Overflow menu */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert(`Sửa thông tin học viên: ${student.fullName}`)}
              className="gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Sửa</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setActiveTab("hoc_phi")}
              className="gap-1.5 bg-[#1E40AF] hover:bg-[#1E3A8A]"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Ghi nhận thu tiền</span>
            </Button>

            {/* Overflow menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                aria-label="Thao tác khác"
              >
                <MoreHorizontal className="w-4 h-4 text-[#5A6478]" />
              </Button>

              {showOverflowMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-[#DFE4EC] rounded-[6px] shadow-lg py-1 z-30">
                  <button
                    onClick={() => {
                      setShowOverflowMenu(false)
                      alert("Bảo lưu khóa học")
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#131B2E] hover:bg-[#E7EDFB]"
                  >
                    Bảo lưu
                  </button>
                  <button
                    onClick={() => {
                      setShowOverflowMenu(false)
                      alert("Chuyển lớp học")
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#131B2E] hover:bg-[#E7EDFB]"
                  >
                    Chuyển lớp
                  </button>
                  <button
                    onClick={() => {
                      setShowOverflowMenu(false)
                      alert("Đánh dấu ngưng học")
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#131B2E] hover:bg-[#E7EDFB]"
                  >
                    Ngưng học
                  </button>

                  {/* Owner-only: Xóa học viên */}
                  {isOwner && (
                    <div className="border-t border-[#DFE4EC] mt-1 pt-1">
                      <button
                        onClick={() => {
                          setShowOverflowMenu(false)
                          if (confirm(`Bạn có chắc chắn muốn xóa học viên ${student.fullName}?`)) {
                            navigate("/hoc-vien")
                          }
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-[#B3382C] hover:bg-[#FBE8E5] flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa học viên</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. PANEL "HỒ SƠ" (Compact panel, ID masked + "Hiện" + Checklist)
      ========================================================================= */}
      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 shadow-none">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Cột 1: Quê quán & CCCD masked */}
          <div>
            <div className="text-xs text-[#5A6478]">Nơi sinh</div>
            <div className="text-sm font-medium text-[#131B2E]">{student.placeOfBirth}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#5A6478]">CCCD:</span>
              <span className="font-mono text-xs font-semibold text-[#131B2E] tabular-nums">
                {showCitizenId ? student.citizenId : maskedCccd}
              </span>
              <button
                type="button"
                onClick={handleToggleRevealCccd}
                className="text-[11px] font-medium text-[#1E40AF] hover:underline cursor-pointer flex items-center gap-1"
              >
                {showCitizenId ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>Ẩn</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>Hiện</span>
                  </>
                )}
              </button>
            </div>
            {student.citizenIdIssueDate && (
              <div className="text-[11px] text-[#5A6478] mt-0.5">
                Cấp {formatDate(student.citizenIdIssueDate)} &bull; {student.citizenIdIssuePlace}
              </div>
            )}
          </div>

          {/* Cột 2: Checklist hồ sơ (2 Checkboxes) */}
          <div className="space-y-1.5 sm:border-l sm:border-[#DFE4EC] sm:pl-4">
            <div className="text-xs text-[#5A6478] font-medium mb-1">Kiểm tra hồ sơ</div>
            <label className="flex items-center gap-2 text-xs text-[#131B2E] cursor-pointer">
              <input
                type="checkbox"
                checked={student.dossierChecks.cccd}
                onChange={(e) =>
                  setStudent((prev) => ({
                    ...prev,
                    dossierChecks: { ...prev.dossierChecks, cccd: e.target.checked },
                  }))
                }
                className="w-3.5 h-3.5 rounded border-[#DFE4EC] text-[#1E40AF] focus:ring-[#1E40AF]"
              />
              <span>Đã nộp bản sao CCCD</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#131B2E] cursor-pointer">
              <input
                type="checkbox"
                checked={student.dossierChecks.photos}
                onChange={(e) =>
                  setStudent((prev) => ({
                    ...prev,
                    dossierChecks: { ...prev.dossierChecks, photos: e.target.checked },
                  }))
                }
                className="w-3.5 h-3.5 rounded border-[#DFE4EC] text-[#1E40AF] focus:ring-[#1E40AF]"
              />
              <span>Đã nộp 02 hình 3x4</span>
            </label>
          </div>

          {/* Cột 3: Chip tổng quan hồ sơ */}
          <div className="sm:text-right sm:border-l sm:border-[#DFE4EC] sm:pl-4 flex sm:flex-col sm:items-end justify-between items-center">
            <div className="text-xs text-[#5A6478]">Tình trạng hồ sơ</div>
            <div className="mt-1">
              {isDossierComplete ? (
                <Badge variant="success" className="text-xs py-1 px-3">
                  Đủ hồ sơ
                </Badge>
              ) : (
                <Badge variant="warning" className="text-xs py-1 px-3">
                  Thiếu hồ sơ
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Reveal audit alert nếu vừa mở xem */}
        {revealLogs.length > 0 && showCitizenId && (
          <div className="mt-3 pt-2 border-t border-[#DFE4EC] text-[11px] text-[#5A6478] italic">
            * Hành động hiện số CCCD đã được ghi nhận vào nhật ký kiểm toán hệ thống.
          </div>
        )}
      </div>

      {/* =========================================================================
          3. NAVIGATION TABS (5 Tabs)
      ========================================================================= */}
      <div className="flex border-b border-[#DFE4EC] overflow-x-auto no-scrollbar gap-1">
        {(
          [
            { key: "tong_quan", label: "Tổng quan" },
            { key: "lop_hoc", label: "Lớp học" },
            { key: "hoc_phi", label: "Học phí" },
            { key: "thi", label: "Thi & Cấp bằng" },
            { key: "lich_su", label: "Ghi chú & Lịch sử" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-2.5 pt-1 px-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? "border-[#1E40AF] text-[#1E40AF]"
                  : "border-transparent text-[#5A6478] hover:text-[#131B2E]"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* =========================================================================
          TAB 1: TỔNG QUAN (VỚI PAYMENT BAR - SIGNATURE ELEMENT)
      ========================================================================= */}
      {activeTab === "tong_quan" && (
        <div className="space-y-4">
          {enrollments.map((enr) => {
            const isFullyPaid = enr.balanceDue === 0
            const percentPaid = Math.min(100, Math.round((enr.totalPaid / enr.netAmount) * 100))

            return (
              <div
                key={enr.id}
                className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-4"
              >
                {/* Lớp & Thông tin ca */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DFE4EC]">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-[#131B2E]">
                        {enr.className}
                      </h3>
                      <span className="font-mono text-xs text-[#5A6478] bg-[#ECEFF5] px-2 py-0.5 rounded-[4px]">
                        {enr.classCode}
                      </span>
                      <Badge variant="success" className="text-[11px] py-0">
                        {enr.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-[#5A6478] mt-1">
                      Giảng viên: <strong>{enr.teacher}</strong> &bull; {enr.schedule} ({enr.room})
                    </div>
                  </div>

                  <div className="text-right text-xs text-[#5A6478]">
                    {enr.discount > 0 && (
                      <span className="line-through mr-1.5">{formatCurrency(enr.coursePrice)}</span>
                    )}
                    <span className="font-semibold text-sm text-[#131B2E]">
                      {formatCurrency(enr.netAmount)}
                    </span>
                    {enr.discount > 0 && (
                      <div className="text-[11px] text-[#2F7D4F]">{enr.discountReason}</div>
                    )}
                  </div>
                </div>

                {/* ===================================================================
                    THE PAYMENT BAR (SIGNATURE ELEMENT)
                =================================================================== */}
                <div className="bg-[#F4F6FA] border border-[#DFE4EC] rounded-[8px] p-4 space-y-2.5">
                  {/* Câu diễn giải bằng ngôn ngữ tự nhiên */}
                  <div className="text-xs sm:text-sm text-[#131B2E] font-medium leading-relaxed">
                    {isFullyPaid ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>
                          Khóa <strong>{formatCurrency(enr.netAmount)}</strong>, đã đóng đủ{" "}
                          <strong>{formatCurrency(enr.totalPaid)}</strong> ngày{" "}
                          {enr.payments[0]?.date || "01/10/2026"}.
                        </span>
                        <Badge variant="success" className="text-xs py-0.5">
                          Đã đóng đủ
                        </Badge>
                      </div>
                    ) : (
                      <span>
                        Khóa <strong>{formatCurrency(enr.netAmount)}</strong>, đã đóng{" "}
                        <strong>{formatCurrency(enr.totalPaid)}</strong> ngày{" "}
                        {enr.payments[0]?.date || "19/10/2026"}. Còn lại{" "}
                        <strong className="text-[#B3382C]">{formatCurrency(enr.balanceDue)}</strong>
                        {enr.balanceDueDate && `, hẹn đóng nốt ${enr.balanceDueDate}`}.
                      </span>
                    )}
                  </div>

                  {/* Thanh Progress Bar ngang (Track Line, Fill Accent) */}
                  <div className="w-full h-2.5 bg-[#DFE4EC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E40AF] transition-all duration-300"
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>

                  {/* Hai con số dưới thanh bar */}
                  <div className="flex items-center justify-between text-xs tabular-nums pt-0.5">
                    <span className="text-[#1E40AF] font-semibold">
                      Đã đóng {formatCurrency(enr.totalPaid)}
                    </span>
                    <span className={`font-semibold ${enr.balanceDue > 0 ? "text-[#B3382C]" : "text-[#5A6478]"}`}>
                      {enr.balanceDue > 0 ? `Còn lại ${formatCurrency(enr.balanceDue)}` : "Học phí đã đủ"}
                    </span>
                  </div>

                  {/* Danh sách phiếu thu rút gọn */}
                  <div className="pt-2 border-t border-[#DFE4EC]/80 mt-2 space-y-1">
                    <div className="text-[11px] font-semibold text-[#5A6478] uppercase">
                      Lịch sử thu tiền lớp này
                    </div>
                    {enr.payments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between text-xs text-[#5A6478] bg-white p-2 rounded-[6px] border border-[#DFE4EC]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums font-medium text-[#131B2E]">{p.date}</span>
                          <span>&bull;</span>
                          <span className="text-[#131B2E]">{p.method}</span>
                          <span>&bull;</span>
                          <span>{p.note}</span>
                        </div>
                        <span className="font-semibold text-[#1E40AF] tabular-nums">
                          {formatCurrency(p.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Referral line */}
                <div className="flex items-center justify-between text-xs text-[#5A6478] pt-1">
                  <div>
                    Người giới thiệu: <strong className="text-[#131B2E]">{student.referrer}</strong>
                  </div>
                  {isOwner && (
                    <div className="text-[#9A7B3F] font-medium">
                      Hoa hồng: {student.commissionStatus} ({formatCurrency(student.commissionAmount)})
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* =========================================================================
          TAB 2: LỚP HỌC (Chi tiết các lớp đăng ký)
      ========================================================================= */}
      {activeTab === "lop_hoc" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-4">
            <h3 className="text-sm font-semibold text-[#131B2E]">Các lớp đang tham gia</h3>
            <div className="space-y-3">
              {enrollments.map((enr) => (
                <div
                  key={enr.id}
                  className="p-4 border border-[#DFE4EC] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F6FA] transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#131B2E]">{enr.className}</div>
                    <div className="font-mono text-xs text-[#5A6478] mt-0.5">{enr.classCode}</div>
                    <div className="text-xs text-[#5A6478] mt-1">
                      Giảng viên: {enr.teacher} &bull; Lịch: {enr.schedule}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs">
                      {enr.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: HỌC PHÍ (Bảng phiếu thu, hoàn tiền, hủy phiếu, cảnh báo thu dư)
      ========================================================================= */}
      {activeTab === "hoc_phi" && (
        <div className="space-y-4">
          {/* Cảnh báo nếu thu dư (khi có thu vượt học phí thực tế) */}
          {enrollments.some((e) => e.balanceDue < 0) && (
            <div className="p-3.5 bg-[#FBF0DC] border border-[#A86A0B]/40 rounded-[8px] flex items-center justify-between gap-3 text-xs text-[#A86A0B]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  <strong>
                    Thu dư {formatCurrency(Math.abs(enrollments.find((e) => e.balanceDue < 0)?.balanceDue || 0))}:
                  </strong>{" "}
                  Cần hoàn lại cho học viên.
                </span>
              </div>
              {isOwner && (
                <Button
                  size="sm"
                  onClick={() => setShowRefundModal(true)}
                  className="h-7 text-xs bg-[#A86A0B] text-white"
                >
                  Ghi nhận hoàn tiền
                </Button>
              )}
            </div>
          )}

          {/* Bảng phiếu thu */}
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none">
            <div className="p-4 border-b border-[#DFE4EC] flex items-center justify-between bg-[#F4F6FA]">
              <h3 className="text-sm font-semibold text-[#131B2E]">Lịch sử phiếu thu & chi</h3>
              <Button
                size="sm"
                onClick={() => alert("Ghi nhận thu tiền mới")}
                className="h-8 text-xs gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Thu tiền mới</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#DFE4EC] bg-white text-[#5A6478] text-xs font-semibold">
                    <th className="py-2.5 px-4">Số phiếu</th>
                    <th className="py-2.5 px-4">Ngày</th>
                    <th className="py-2.5 px-4">Hình thức</th>
                    <th className="py-2.5 px-4">Người ghi nhận</th>
                    <th className="py-2.5 px-4">Loại</th>
                    <th className="py-2.5 px-4 text-right">Số tiền</th>
                    {isOwner && <th className="py-2.5 px-4 text-center">Hành động</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE4EC]">
                  {receipts.map((rc) => {
                    const isCancelled = rc.status === "da_huy"
                    const isRefund = rc.type === "hoan_tien"

                    return (
                      <tr
                        key={rc.id}
                        className={`hover:bg-[#F4F6FA] transition-colors ${
                          isCancelled ? "line-through opacity-60 bg-[#ECEFF5]/40" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-xs text-[#131B2E] tabular-nums">
                          {rc.id}
                        </td>
                        <td className="py-3 px-4 text-xs tabular-nums text-[#5A6478]">{rc.date}</td>
                        <td className="py-3 px-4 text-xs text-[#131B2E]">{rc.method}</td>
                        <td className="py-3 px-4 text-xs text-[#5A6478]">{rc.staff}</td>
                        <td className="py-3 px-4">
                          {isCancelled ? (
                            <Badge variant="danger" className="text-[10px]">
                              Đã hủy ({rc.voidReason})
                            </Badge>
                          ) : isRefund ? (
                            <Badge variant="warning" className="text-[10px]">
                              Hoàn tiền
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              Thu
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold tabular-nums text-sm text-[#131B2E]">
                          {formatCurrency(rc.amount)}
                        </td>

                        {/* Owner Actions */}
                        {isOwner && (
                          <td className="py-3 px-4 text-center">
                            {!isCancelled && (
                              <button
                                onClick={() => {
                                  setSelectedReceiptId(rc.id)
                                  setShowVoidModal(true)
                                }}
                                className="text-xs text-[#B3382C] hover:underline cursor-pointer"
                              >
                                Hủy phiếu
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: THI & CẤP BẰNG
      ========================================================================= */}
      {activeTab === "thi" && (
        <div className="space-y-4">
          {/* Lịch sử lượt thi */}
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-3">
            <h3 className="text-sm font-semibold text-[#131B2E] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1E40AF]" />
              <span>Lịch sử các kỳ thi</span>
            </h3>

            <div className="divide-y divide-[#DFE4EC]">
              {exams.map((ex, idx) => (
                <div key={idx} className="py-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#131B2E]">{ex.examName}</span>
                    <Badge variant="success" className="text-xs">
                      {ex.result} ({ex.score})
                    </Badge>
                  </div>
                  <div className="text-xs text-[#5A6478]">
                    Ngày thi: <strong>{ex.date}</strong> &bull; {ex.shift} &bull; Trạng thái: {ex.status}
                  </div>
                  {ex.rescheduleHistory && (
                    <div className="text-[11px] text-[#A86A0B] bg-[#FBF0DC] p-1.5 rounded-[4px]">
                      {ex.rescheduleHistory}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Khối Cấp bằng */}
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#131B2E] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#1E40AF]" />
                <span>Thông tin cấp chứng chỉ / bằng</span>
              </h3>
              <Badge variant="success" className="text-xs">
                {certificate.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div className="p-3 bg-[#F4F6FA] rounded-[6px]">
                <div className="text-[#5A6478]">Số hiệu bằng:</div>
                <div className="font-mono font-semibold text-sm text-[#131B2E] mt-0.5">
                  {certificate.certNo}
                </div>
              </div>
              <div className="p-3 bg-[#F4F6FA] rounded-[6px]">
                <div className="text-[#5A6478]">Số quyết định:</div>
                <div className="font-medium text-[#131B2E] mt-0.5">{certificate.decisionNo}</div>
              </div>
              <div className="p-3 bg-[#F4F6FA] rounded-[6px]">
                <div className="text-[#5A6478]">Ngày cấp bằng:</div>
                <div className="font-medium text-[#131B2E] mt-0.5">{certificate.issueDate}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: GHI CHÚ & LỊCH SỬ
      ========================================================================= */}
      {activeTab === "lich_su" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ô nhập ghi chú */}
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-3">
            <h3 className="text-sm font-semibold text-[#131B2E] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1E40AF]" />
              <span>Ghi chú học viên</span>
            </h3>

            <p className="text-xs text-[#5A6478] bg-[#F4F6FA] p-3 rounded-[6px] leading-relaxed">
              {student.notes}
            </p>

            <form onSubmit={handleAddNote} className="space-y-2 pt-2">
              <textarea
                rows={3}
                placeholder="Nhập thêm ghi chú mới về học viên..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full rounded-[6px] border border-[#DFE4EC] p-2.5 text-xs text-[#131B2E] placeholder:text-[#5A6478] outline-none focus:border-[#1E40AF]"
              />
              <Button type="submit" size="sm" className="w-full gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Lưu ghi chú</span>
              </Button>
            </form>
          </div>

          {/* Dòng thời gian Timeline */}
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-3">
            <h3 className="text-sm font-semibold text-[#131B2E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1E40AF]" />
              <span>Nhật ký hoạt động</span>
            </h3>

            <div className="space-y-2.5">
              {timeline.map((entry, idx) => (
                <div
                  key={idx}
                  className="text-xs text-[#5A6478] pl-3 border-l-2 border-[#DFE4EC] py-1 leading-relaxed"
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: HỦY PHIẾU THU (Owner only, bắt buộc nhập lý do)
      ========================================================================= */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-[#B3382C]">
              Xác nhận hủy phiếu {selectedReceiptId}
            </h3>
            <p className="text-xs text-[#5A6478]">
              Thao tác này chỉ dành cho Quản lý (Chủ). Bắt buộc phải nhập lý do hủy phiếu để lưu nhật ký.
            </p>
            <div>
              <label className="block text-xs font-medium text-[#131B2E] mb-1">
                Lý do hủy phiếu:
              </label>
              <textarea
                rows={2}
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Ví dụ: Khách chuyển khoản nhầm, nhập sai số tiền..."
                className="w-full rounded-[6px] border border-[#DFE4EC] p-2 text-xs text-[#131B2E] outline-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowVoidModal(false)
                  setModalReason("")
                }}
                className="flex-1"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                disabled={!modalReason.trim()}
                onClick={() => {
                  setReceipts((prev) =>
                    prev.map((r) =>
                      r.id === selectedReceiptId
                        ? { ...r, status: "da_huy", voidReason: modalReason }
                        : r
                    )
                  )
                  setShowVoidModal(false)
                  setModalReason("")
                }}
                className="flex-1 bg-[#B3382C] text-white hover:bg-[#B3382C]/90"
              >
                Xác nhận hủy
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GHI NHẬN HOÀN TIỀN (Owner only, bắt buộc nhập lý do)
      ========================================================================= */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 max-w-sm w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-[#1E40AF]">
              Ghi nhận hoàn tiền cho học viên
            </h3>
            <p className="text-xs text-[#5A6478]">
              Thao tác này chỉ dành cho Quản lý (Chủ). Bắt buộc phải nhập lý do hoàn tiền để ghi vào nhật ký phiếu chi.
            </p>
            <div>
              <label className="block text-xs font-medium text-[#131B2E] mb-1">
                Lý do hoàn tiền:
              </label>
              <textarea
                rows={2}
                value={modalReason}
                onChange={(e) => setModalReason(e.target.value)}
                placeholder="Ví dụ: Thu vượt học phí, học viên chuyển trường..."
                className="w-full rounded-[6px] border border-[#DFE4EC] p-2 text-xs text-[#131B2E] outline-none"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowRefundModal(false)
                  setModalReason("")
                }}
                className="flex-1"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                disabled={!modalReason.trim()}
                onClick={() => {
                  const now = new Date()
                  setReceipts((prev) => [
                    {
                      id: `PC-2610-00${prev.length + 1}`,
                      date: formatDate(now),
                      amount: 100000,
                      method: "Tiền mặt",
                      staff: "Chủ trung tâm",
                      type: "hoan_tien",
                      status: "hieu_luc",
                      note: `Hoàn tiền: ${modalReason}`,
                      voidReason: null,
                    },
                    ...prev,
                  ])
                  setShowRefundModal(false)
                  setModalReason("")
                }}
                className="flex-1 bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
              >
                Xác nhận hoàn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
