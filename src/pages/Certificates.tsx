import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import {
  FileBadge,
  FileSpreadsheet,
  CheckCircle2,
  X,
  AlertTriangle,
  Calendar,
  Search,
  Check,
  Award,
} from "lucide-react"

// Kiểu dữ liệu học viên chờ cấp bằng
export interface PendingCertificateItem {
  id: string
  studentId: string
  studentCode: string
  lastName: string // Họ và chữ lót
  firstName: string // Tên
  fullName: string
  gender: "Nam" | "Nữ"
  dob: string // Ngày sinh: YYYY-MM-DD
  pob: string // Nơi sinh (tỉnh/thành)
  idCardNumber: string // CCCD
  idCardDate: string // Ngày cấp CCCD
  idCardPlace: string // Nơi cấp CCCD
  courseName: string
  examCode: string
  examName: string
  examDate: string // YYYY-MM-DD
  score: number
  result: "dau" | "rot"
}

// Kiểu dữ liệu học viên đã cấp bằng
export interface IssuedCertificateItem {
  id: string
  studentId: string
  studentCode: string
  lastName: string
  firstName: string
  fullName: string
  gender: "Nam" | "Nữ"
  dob: string
  pob: string
  idCardNumber: string
  courseName: string
  examName: string
  certificateNumber: string // Số hiệu bằng
  decisionNumber: string // Số quyết định
  issueDate: string // Ngày cấp bằng: YYYY-MM-DD
  receivedDate: string | null // Ngày nhận bằng: YYYY-MM-DD (null nếu chưa nhận)
}

// Dữ liệu mẫu học viên chờ cấp bằng (đã thi và Đậu nhưng chưa có bằng)
const INITIAL_PENDING_STUDENTS: PendingCertificateItem[] = [
  {
    id: "pend-1",
    studentId: "st-1",
    studentCode: "HV26-0001",
    lastName: "Lê Hoàng",
    firstName: "Anh",
    fullName: "Lê Hoàng Anh",
    gender: "Nam",
    dob: "2004-05-12",
    pob: "Trà Vinh",
    idCardNumber: "084204001234",
    idCardDate: "2021-08-15",
    idCardPlace: "Cục CS QLHC về TTXH",
    courseName: "Ứng dụng CNTT Cơ bản",
    examCode: "THI_UDCNTT_2410",
    examName: "Kỳ thi Chứng chỉ CNTT Cơ bản K0126",
    examDate: "2026-10-24",
    score: 8.5,
    result: "dau",
  },
  {
    id: "pend-2",
    studentId: "st-3",
    studentCode: "HV26-0003",
    lastName: "Nguyễn Thị",
    firstName: "Hà",
    fullName: "Nguyễn Thị Hà",
    gender: "Nữ",
    dob: "2005-09-20",
    pob: "Vĩnh Long",
    idCardNumber: "086305005678",
    idCardDate: "2022-02-10",
    idCardPlace: "Cục CS QLHC về TTXH",
    courseName: "Ứng dụng CNTT Cơ bản",
    examCode: "THI_UDCNTT_2410",
    examName: "Kỳ thi Chứng chỉ CNTT Cơ bản K0126",
    examDate: "2026-10-24",
    score: 9.0,
    result: "dau",
  },
  {
    id: "pend-3",
    studentId: "st-6",
    studentCode: "HV26-0006",
    lastName: "Võ Ngọc",
    firstName: "Mai",
    fullName: "Võ Ngọc Mai",
    gender: "Nữ",
    dob: "2003-11-14",
    pob: "Trà Vinh",
    idCardNumber: "084303009876",
    idCardDate: "2020-11-18",
    idCardPlace: "Cục CS QLHC về TTXH",
    courseName: "Chứng chỉ IC3 - GS6",
    examCode: "THI_IC3_2510",
    examName: "Kỳ thi Chứng chỉ IC3 - GS6 Quốc tế",
    examDate: "2026-10-25",
    score: 820,
    result: "dau",
  },
  {
    id: "pend-4",
    studentId: "st-10",
    studentCode: "HV26-0010",
    lastName: "Lý Gia",
    firstName: "Hân",
    fullName: "Lý Gia Hân",
    gender: "Nữ",
    dob: "2006-03-05",
    pob: "Bến Tre",
    idCardNumber: "083306001122",
    idCardDate: "2022-04-08",
    idCardPlace: "Cục CS QLHC về TTXH",
    courseName: "Chứng chỉ IC3 - GS6",
    examCode: "THI_IC3_2510",
    examName: "Kỳ thi Chứng chỉ IC3 - GS6 Quốc tế",
    examDate: "2026-10-25",
    score: 760,
    result: "dau",
  },
]

// Dữ liệu mẫu học viên đã cấp bằng
const INITIAL_ISSUED_STUDENTS: IssuedCertificateItem[] = [
  {
    id: "iss-1",
    studentId: "st-11",
    studentCode: "HV26-0011",
    lastName: "Phan Thanh",
    firstName: "Tùng",
    fullName: "Phan Thanh Tùng",
    gender: "Nam",
    dob: "2002-08-19",
    pob: "Trà Vinh",
    idCardNumber: "084202008899",
    courseName: "Ứng dụng CNTT Cơ bản",
    examName: "Kỳ thi Chứng chỉ CNTT Cơ bản K0926",
    certificateNumber: "TVC-CC-26011",
    decisionNumber: "145/QĐ-TVC",
    issueDate: "2026-10-15",
    receivedDate: "2026-10-20",
  },
  {
    id: "iss-2",
    studentId: "st-12",
    studentCode: "HV26-0012",
    lastName: "Trần Thu",
    firstName: "Trang",
    fullName: "Trần Thu Trang",
    gender: "Nữ",
    dob: "2004-01-25",
    pob: "Trà Vinh",
    idCardNumber: "084304003344",
    courseName: "Ứng dụng CNTT Nâng cao",
    examName: "Kỳ thi Chứng chỉ CNTT Nâng cao K0926",
    certificateNumber: "TVC-NC-26008",
    decisionNumber: "146/QĐ-TVC",
    issueDate: "2026-10-15",
    receivedDate: null,
  },
  {
    id: "iss-3",
    studentId: "st-13",
    studentCode: "HV26-0013",
    lastName: "Đặng Hữu",
    firstName: "Phước",
    fullName: "Đặng Hữu Phước",
    gender: "Nam",
    dob: "2001-12-03",
    pob: "Sóc Trăng",
    idCardNumber: "094201007788",
    courseName: "Tiếng Anh giao tiếp",
    examName: "Kiểm tra Cuối khóa Tiếng Anh K0926",
    certificateNumber: "TVC-TA-26024",
    decisionNumber: "147/QĐ-TVC",
    issueDate: "2026-10-12",
    receivedDate: "2026-10-18",
  },
  {
    id: "iss-4",
    studentId: "st-14",
    studentCode: "HV26-0014",
    lastName: "Ngô Mỹ",
    firstName: "Duyên",
    fullName: "Ngô Mỹ Duyên",
    gender: "Nữ",
    dob: "2005-07-30",
    pob: "Trà Vinh",
    idCardNumber: "084305004455",
    courseName: "Pre-Ielts",
    examName: "Kiểm tra Cuối khóa Pre-Ielts K0926",
    certificateNumber: "TVC-IEL-26003",
    decisionNumber: "148/QĐ-TVC",
    issueDate: "2026-10-16",
    receivedDate: null,
  },
]

// Danh sách các số hiệu bằng đã từng dùng (để kiểm tra trùng lặp)
const EXISTING_CERTIFICATE_NUMBERS = new Set([
  "TVC-CC-26011",
  "TVC-NC-26008",
  "TVC-TA-26024",
  "TVC-IEL-26003",
  "123456", // Số hiệu bằng mẫu trong yêu cầu
])

export const Certificates: React.FC = () => {
  // Tab hiện hành: Chờ cấp bằng | Đã cấp bằng
  const [currentTab, setCurrentTab] = useState<"cho_cap_bang" | "da_cap_bang">("cho_cap_bang")

  // Dữ liệu danh sách
  const [pendingList, setPendingList] = useState<PendingCertificateItem[]>(INITIAL_PENDING_STUDENTS)
  const [issuedList, setIssuedList] = useState<IssuedCertificateItem[]>(INITIAL_ISSUED_STUDENTS)

  // Danh sách các ID thí sinh được tích chọn trong tab Chờ cấp bằng
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([])

  // Tìm kiếm
  const [searchQuery, setSearchQuery] = useState("")

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // --- SIDE PANEL: CẤP BẰNG CHO DANH SÁCH ĐÃ CHỌN ---
  const [showIssuePanel, setShowIssuePanel] = useState(false)
  const [commonIssueDate, setCommonIssueDate] = useState("2026-10-27")

  // Dữ liệu nhập cho từng học viên trong Side Panel
  // Key: studentId, Value: { certNum, decisionNum }
  const [formCertNumbers, setFormCertNumbers] = useState<{ [id: string]: string }>({})
  const [formDecisionNumbers, setFormDecisionNumbers] = useState<{ [id: string]: string }>({})

  // Helper điền số liên tiếp
  const [certPrefixStart, setCertPrefixStart] = useState("TVC-26021")
  const [decisionStart, setDecisionStart] = useState("149/QĐ-TVC")

  // Lỗi xác thực trên form
  const [panelErrors, setPanelErrors] = useState<string[]>([])
  const [panelWarnings, setPanelWarnings] = useState<string[]>([])

  // Danh sách học viên đang được cấp bằng trong side panel
  const studentsToIssue = useMemo(() => {
    return pendingList.filter((item) => selectedPendingIds.includes(item.id))
  }, [pendingList, selectedPendingIds])

  // Mở side panel cấp bằng
  const handleOpenIssuePanel = () => {
    if (selectedPendingIds.length === 0) return

    // Khởi tạo giá trị mặc định cho từng dòng
    const initialCerts: { [id: string]: string } = {}
    const initialDecisions: { [id: string]: string } = {}

    studentsToIssue.forEach((st, idx) => {
      initialCerts[st.id] = `TVC-260${21 + idx}`
      initialDecisions[st.id] = `${149 + idx}/QĐ-TVC`
    })

    setFormCertNumbers(initialCerts)
    setFormDecisionNumbers(initialDecisions)
    setCommonIssueDate("2026-10-27")
    setPanelErrors([])
    setPanelWarnings([])
    setShowIssuePanel(true)
  }

  // Tự động điền số liên tiếp cho Số hiệu bằng
  const handleAutoFillCerts = () => {
    const startStr = certPrefixStart.trim()
    if (!startStr) return

    // Tìm phần số ở cuối
    const match = startStr.match(/^(.*?)(\d+)$/)
    const prefix = match ? match[1] : startStr + "-"
    const startNum = match ? parseInt(match[2], 10) : 1
    const padLength = match ? match[2].length : 3

    const newMap = { ...formCertNumbers }
    studentsToIssue.forEach((st, idx) => {
      const currentNum = startNum + idx
      const numFormatted = String(currentNum).padStart(padLength, "0")
      newMap[st.id] = `${prefix}${numFormatted}`
    })
    setFormCertNumbers(newMap)
    validatePanelData(newMap, formDecisionNumbers)
  }

  // Tự động điền số liên tiếp cho Số quyết định
  const handleAutoFillDecisions = () => {
    const startStr = decisionStart.trim()
    if (!startStr) return

    const match = startStr.match(/^(\d+)(.*)$/)
    const startNum = match ? parseInt(match[1], 10) : 1
    const suffix = match ? match[2] : "/QĐ-TVC"

    const newMap = { ...formDecisionNumbers }
    studentsToIssue.forEach((st, idx) => {
      const currentNum = startNum + idx
      newMap[st.id] = `${currentNum}${suffix}`
    })
    setFormDecisionNumbers(newMap)
    validatePanelData(formCertNumbers, newMap)
  }

  // Kiểm tra tính hợp lệ: Số hiệu bằng phải duy nhất; cảnh báo nếu trùng số quyết định
  const validatePanelData = (
    certsMap: { [id: string]: string },
    decisionsMap: { [id: string]: string }
  ): boolean => {
    const errors: string[] = []
    const warnings: string[] = []

    const usedInForm = new Set<string>()

    for (const st of studentsToIssue) {
      const cert = (certsMap[st.id] || "").trim()
      const decision = (decisionsMap[st.id] || "").trim()

      if (!cert) {
        errors.push(`Vui lòng nhập số hiệu bằng cho học viên ${st.fullName}.`)
        continue
      }

      // Kiểm tra trùng trong form
      if (usedInForm.has(cert)) {
        errors.push(`Số hiệu bằng "${cert}" bị trùng lặp giữa các học viên được chọn.`)
      }
      usedInForm.add(cert)

      // Kiểm tra trùng với số bằng đã cấp trước đây
      if (EXISTING_CERTIFICATE_NUMBERS.has(cert)) {
        errors.push(`Số hiệu bằng ${cert} đã được dùng cho một học viên khác.`)
      }

      if (!decision) {
        errors.push(`Vui lòng nhập số quyết định cho học viên ${st.fullName}.`)
      }
    }

    // Kiểm tra lặp số quyết định (Cảnh báo: mỗi học viên có một số quyết định riêng)
    const decisionCounts: { [dec: string]: number } = {}
    Object.values(decisionsMap).forEach((d) => {
      const clean = d.trim()
      if (clean) decisionCounts[clean] = (decisionCounts[clean] || 0) + 1
    })

    Object.entries(decisionCounts).forEach(([dec, count]) => {
      if (count > 1) {
        warnings.push(
          `Số quyết định "${dec}" bị trùng lặp cho ${count} học viên. Mỗi học viên nên có một số quyết định riêng.`
        )
      }
    })

    setPanelErrors(errors)
    setPanelWarnings(warnings)
    return errors.length === 0
  }

  // Xác nhận cấp bằng trong side panel
  const handleConfirmIssue = (e: React.FormEvent) => {
    e.preventDefault()

    const isValid = validatePanelData(formCertNumbers, formDecisionNumbers)
    if (!isValid) return

    const newlyIssued: IssuedCertificateItem[] = studentsToIssue.map((st) => ({
      id: `iss-${Date.now()}-${st.id}`,
      studentId: st.studentId,
      studentCode: st.studentCode,
      lastName: st.lastName,
      firstName: st.firstName,
      fullName: st.fullName,
      gender: st.gender,
      dob: st.dob,
      pob: st.pob,
      idCardNumber: st.idCardNumber,
      courseName: st.courseName,
      examName: st.examName,
      certificateNumber: formCertNumbers[st.id].trim(),
      decisionNumber: formDecisionNumbers[st.id].trim(),
      issueDate: commonIssueDate,
      receivedDate: null, // Chưa nhận
    }))

    // Cập nhật danh sách số bằng đã dùng
    newlyIssued.forEach((item) => EXISTING_CERTIFICATE_NUMBERS.add(item.certificateNumber))

    // Xóa khỏi danh sách chờ, thêm vào danh sách đã cấp
    setPendingList((prev) => prev.filter((item) => !selectedPendingIds.includes(item.id)))
    setIssuedList((prev) => [...newlyIssued, ...prev])
    setSelectedPendingIds([])
    setShowIssuePanel(false)

    showToast(`Đã cấp bằng cho ${newlyIssued.length} học viên`)
  }

  // --- DIALOG: ĐÁNH DẤU ĐÃ NHẬN BẰNG ---
  const [receiveTarget, setReceiveTarget] = useState<IssuedCertificateItem | null>(null)
  const [confirmedDirectReceive, setConfirmedDirectReceive] = useState(false)
  const [receiveDate, setReceiveDate] = useState("2026-10-27")

  const handleOpenReceiveDialog = (item: IssuedCertificateItem) => {
    setReceiveTarget(item)
    setConfirmedDirectReceive(false)
    setReceiveDate("2026-10-27")
  }

  const handleConfirmReceive = () => {
    if (!receiveTarget || !confirmedDirectReceive) return

    setIssuedList((prev) =>
      prev.map((item) => {
        if (item.id !== receiveTarget.id) return item
        return {
          ...item,
          receivedDate: receiveDate,
        }
      })
    )

    setReceiveTarget(null)
    showToast(`Đã đánh dấu ${receiveTarget.fullName} trực tiếp nhận bằng`)
  }

  // --- XUẤT DANH SÁCH ĐỀ NGHỊ CẤP BẰNG (EXCEL / CSV) ---
  const handleExportProposalExcel = () => {
    const listToExport = currentTab === "cho_cap_bang" ? pendingList : issuedList

    const rows = [
      [
        "STT",
        "Họ và chữ lót",
        "Tên",
        "Giới tính",
        "Ngày sinh",
        "Nơi sinh",
        "Số CCCD",
        "Khóa học",
        "Kỳ thi",
        "Điểm thi",
        "Số hiệu bằng",
        "Số quyết định",
        "Ngày cấp",
        "Nơi cấp",
      ],
      ...listToExport.map((item, idx) => {
        const isPending = "examCode" in item
        const pItem = item as PendingCertificateItem
        const iItem = item as IssuedCertificateItem

        return [
          idx + 1,
          item.lastName,
          item.firstName,
          item.gender,
          formatDate(item.dob),
          item.pob,
          item.idCardNumber,
          item.courseName,
          isPending ? pItem.examName : iItem.examName,
          isPending ? pItem.score : "—",
          isPending ? "Chờ cấp" : iItem.certificateNumber,
          isPending ? "Chờ cấp" : iItem.decisionNumber,
          isPending ? "—" : formatDate(iItem.issueDate),
          "Trung tâm TVC Trà Vinh",
        ]
      }),
    ]

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Danh_sach_de_nghi_cap_bang_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast("Đã xuất danh sách đề nghị cấp bằng (Excel)")
  }

  // Bộ lọc tìm kiếm
  const filteredPending = useMemo(() => {
    return pendingList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.fullName.toLowerCase().includes(q) ||
          item.studentCode.toLowerCase().includes(q) ||
          item.courseName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [pendingList, searchQuery])

  const filteredIssued = useMemo(() => {
    return issuedList.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.fullName.toLowerCase().includes(q) ||
          item.studentCode.toLowerCase().includes(q) ||
          item.certificateNumber.toLowerCase().includes(q) ||
          item.decisionNumber.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [issuedList, searchQuery])

  // Xử lý chọn tất cả / bỏ chọn tất cả trong tab Chờ cấp bằng
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPendingIds(filteredPending.map((p) => p.id))
    } else {
      setSelectedPendingIds([])
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* 1. Header Trang & Nút Xuất Excel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#DFE4EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-22 font-semibold text-[#131B2E] tracking-tight">
              Cấp bằng
            </h1>
            <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5 uppercase">
              Chỉ Quản lý (Chủ)
            </Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Quản lý cấp chứng chỉ, cấp số quyết định và ghi nhận trao bằng tốt nghiệp
          </p>
        </div>

        {/* Nút hành động Xuất Excel */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportProposalExcel}
            className="h-9 px-3 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#2F7D4F]" />
            <span>Xuất danh sách đề nghị cấp bằng (Excel)</span>
          </Button>
        </div>
      </div>

      {/* 2. Tabs: Chờ cấp bằng | Đã cấp bằng & Ô tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DFE4EC] rounded-[10px] p-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentTab("cho_cap_bang")}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              currentTab === "cho_cap_bang"
                ? "bg-[#1E40AF] text-white shadow-none"
                : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
            }`}
          >
            <span>Chờ cấp bằng</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
                currentTab === "cho_cap_bang"
                  ? "bg-white/20 text-white"
                  : "bg-[#DFE4EC] text-[#5A6478]"
              }`}
            >
              {pendingList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab("da_cap_bang")}
            className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
              currentTab === "da_cap_bang"
                ? "bg-[#1E40AF] text-white shadow-none"
                : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
            }`}
          >
            <span>Đã cấp bằng</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
                currentTab === "da_cap_bang"
                  ? "bg-white/20 text-white"
                  : "bg-[#DFE4EC] text-[#5A6478]"
              }`}
            >
              {issuedList.length}
            </span>
          </button>
        </div>

        {/* Ô tìm kiếm & Nút Cấp bằng cho danh sách đã chọn */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {currentTab === "cho_cap_bang" && selectedPendingIds.length > 0 && (
            <Button
              size="sm"
              onClick={handleOpenIssuePanel}
              className="h-8 text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Cấp bằng cho danh sách đã chọn ({selectedPendingIds.length})</span>
            </Button>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5A6478]" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã số, bằng..."
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
      </div>

      {/* 3. NỘI DUNG TAB 1: CHỜ CẤP BẰNG */}
      {currentTab === "cho_cap_bang" && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
                  <th className="py-2.5 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredPending.length > 0 &&
                        selectedPendingIds.length === filteredPending.length
                      }
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                    />
                  </th>
                  <th className="py-2.5 px-4 font-semibold">Học viên</th>
                  <th className="py-2.5 px-3 font-semibold">Khóa học</th>
                  <th className="py-2.5 px-4 font-semibold">Kỳ thi</th>
                  <th className="py-2.5 px-3 font-semibold">Ngày thi</th>
                  <th className="py-2.5 px-3 font-semibold">Điểm thi</th>
                  <th className="py-2.5 px-3 font-semibold">Kết quả</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE4EC]">
                {filteredPending.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#5A6478]">
                      Không có học viên nào đang chờ cấp bằng.
                    </td>
                  </tr>
                ) : (
                  filteredPending.map((item) => {
                    const isSelected = selectedPendingIds.includes(item.id)

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#E7EDFB]/30 transition-colors ${
                          isSelected ? "bg-[#E7EDFB]/20" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPendingIds([...selectedPendingIds, item.id])
                              } else {
                                setSelectedPendingIds(
                                  selectedPendingIds.filter((id) => id !== item.id)
                                )
                              }
                            }}
                            className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                          />
                        </td>

                        {/* Họ và chữ lót, Tên */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#131B2E]">
                            <span className="text-[#5A6478] font-normal mr-1">
                              {item.lastName}
                            </span>
                            <span className="font-bold text-[#131B2E]">
                              {item.firstName}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5A6478] tabular-nums mt-0.5">
                            {item.studentCode} • {item.gender} • {formatDate(item.dob)}
                          </div>
                        </td>

                        {/* Khóa học */}
                        <td className="py-3 px-3 font-medium text-[#131B2E]">
                          {item.courseName}
                        </td>

                        {/* Kỳ thi */}
                        <td className="py-3 px-4 text-[#5A6478]">
                          <div className="font-medium text-[#131B2E]">
                            {item.examName}
                          </div>
                          <div className="text-[11px] tabular-nums opacity-80">
                            {item.examCode}
                          </div>
                        </td>

                        {/* Ngày thi */}
                        <td className="py-3 px-3 tabular-nums text-[#5A6478]">
                          {formatDate(item.examDate)}
                        </td>

                        {/* Điểm */}
                        <td className="py-3 px-3 tabular-nums font-semibold text-[#131B2E]">
                          {item.score}
                        </td>

                        {/* Kết quả: Đậu */}
                        <td className="py-3 px-3">
                          <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                            Đậu
                          </Badge>
                        </td>

                        {/* Thao tác dòng: Cấp bằng riêng học viên này */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPendingIds([item.id])
                              setShowIssuePanel(true)
                            }}
                            className="text-xs text-[#1E40AF] hover:underline font-semibold cursor-pointer"
                          >
                            Cấp bằng
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. NỘI DUNG TAB 2: ĐÃ CẤP BẰNG */}
      {currentTab === "da_cap_bang" && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
                  <th className="py-2.5 px-4 font-semibold">Học viên</th>
                  <th className="py-2.5 px-3 font-semibold">Khóa học & Kỳ thi</th>
                  <th className="py-2.5 px-3 font-semibold">Số hiệu bằng</th>
                  <th className="py-2.5 px-3 font-semibold">Số quyết định</th>
                  <th className="py-2.5 px-3 font-semibold">Ngày cấp</th>
                  <th className="py-2.5 px-4 font-semibold">Tình trạng nhận bằng</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE4EC]">
                {filteredIssued.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#5A6478]">
                      Chưa có văn bằng nào được cấp.
                    </td>
                  </tr>
                ) : (
                  filteredIssued.map((item) => {
                    const isReceived = Boolean(item.receivedDate)

                    return (
                      <tr key={item.id} className="hover:bg-[#F4F6FA]/50 transition-colors">
                        {/* Họ tên */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#131B2E]">
                            {item.fullName}
                          </div>
                          <div className="text-[11px] text-[#5A6478] tabular-nums mt-0.5">
                            {item.studentCode} • CCCD: {item.idCardNumber}
                          </div>
                        </td>

                        {/* Khóa & Kỳ thi */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#131B2E]">
                            {item.courseName}
                          </div>
                          <div className="text-[11px] text-[#5A6478] truncate max-w-[160px]">
                            {item.examName}
                          </div>
                        </td>

                        {/* Số hiệu bằng */}
                        <td className="py-3 px-3 tabular-nums font-bold text-[#1E40AF]">
                          {item.certificateNumber}
                        </td>

                        {/* Số quyết định */}
                        <td className="py-3 px-3 tabular-nums font-medium text-[#131B2E]">
                          {item.decisionNumber}
                        </td>

                        {/* Ngày cấp */}
                        <td className="py-3 px-3 tabular-nums text-[#5A6478]">
                          {formatDate(item.issueDate)}
                        </td>

                        {/* Tình trạng nhận bằng (Ngày nhận hoặc Chưa nhận) */}
                        <td className="py-3 px-4">
                          {isReceived ? (
                            <div>
                              <Badge variant="success" className="text-[10px] font-bold px-1.5 py-0.2">
                                Đã nhận
                              </Badge>
                              <div className="text-[11px] text-[#5A6478] tabular-nums mt-0.5">
                                {formatDate(item.receivedDate)}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="neutral" className="text-[10px] font-medium px-1.5 py-0.2">
                              Chưa nhận
                            </Badge>
                          )}
                        </td>

                        {/* Thao tác yên tĩnh: "Đánh dấu đã nhận" */}
                        <td className="py-3 px-4 text-right">
                          {!isReceived ? (
                            <button
                              type="button"
                              onClick={() => handleOpenReceiveDialog(item)}
                              className="text-xs text-[#1E40AF] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Đánh dấu đã nhận
                            </button>
                          ) : (
                            <span className="text-[#5A6478] text-[11px]">Đã trao bằng</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SIDE PANEL: CẤP BẰNG CHO DANH SÁCH ĐÃ CHỌN */}
      {/* ============================================================== */}
      {showIssuePanel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header Side Panel */}
            <div className="p-4 md:p-5 border-b border-[#DFE4EC] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base md:text-lg font-bold text-[#131B2E]">
                    Cấp bằng cho học viên
                  </h3>
                  <Badge variant="default" className="text-[10px]">
                    {studentsToIssue.length} học viên
                  </Badge>
                </div>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  Nhập số hiệu bằng và số quyết định riêng biệt cho từng thí sinh
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIssuePanel(false)}
                className="p-1.5 text-[#5A6478] hover:text-[#131B2E] rounded-[4px] hover:bg-[#F4F6FA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thân Side Panel (Form & Table) */}
            <div className="p-4 md:p-5 flex-1 overflow-y-auto space-y-4 text-xs">
              {/* Ngày cấp bằng chung (optional, default today) */}
              <div className="bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] p-3 space-y-1.5">
                <label className="block text-xs font-semibold text-[#131B2E]">
                  Ngày cấp bằng (áp dụng chung)
                </label>
                <div className="relative max-w-xs">
                  <Input
                    type="date"
                    value={commonIssueDate}
                    onChange={(e) => setCommonIssueDate(e.target.value)}
                    className="h-8 text-xs border-[#DFE4EC] bg-white"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5A6478] pointer-events-none" />
                </div>
              </div>

              {/* Công cụ hỗ trợ: "Điền số liên tiếp từ..." */}
              <div className="bg-[#E7EDFB]/40 border border-[#1E40AF]/20 rounded-[6px] p-3 space-y-2">
                <div className="text-xs font-semibold text-[#1E40AF] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Công cụ hỗ trợ điền nhanh:</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#5A6478] mb-1">
                      Điền số hiệu bằng liên tiếp từ:
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        type="text"
                        value={certPrefixStart}
                        onChange={(e) => setCertPrefixStart(e.target.value)}
                        placeholder="TVC-26021"
                        className="h-7 text-xs bg-white border-[#DFE4EC]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAutoFillCerts}
                        className="h-7 text-xs px-2.5 bg-[#1E40AF] text-white shrink-0"
                      >
                        Áp dụng
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#5A6478] mb-1">
                      Điền số quyết định liên tiếp từ:
                    </label>
                    <div className="flex gap-1.5">
                      <Input
                        type="text"
                        value={decisionStart}
                        onChange={(e) => setDecisionStart(e.target.value)}
                        placeholder="149/QĐ-TVC"
                        className="h-7 text-xs bg-white border-[#DFE4EC]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAutoFillDecisions}
                        className="h-7 text-xs px-2.5 bg-[#1E40AF] text-white shrink-0"
                      >
                        Áp dụng
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danh sách cảnh báo nếu số quyết định bị lặp */}
              {panelWarnings.length > 0 && (
                <div className="bg-[#FBF0DC] border border-[#A86A0B]/30 rounded-[6px] p-3 text-xs text-[#A86A0B] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Lưu ý số quyết định:</span>
                  </div>
                  {panelWarnings.map((w, idx) => (
                    <p key={idx} className="pl-5 leading-relaxed">
                      {w}
                    </p>
                  ))}
                </div>
              )}

              {/* Danh sách lỗi nếu số hiệu bằng bị trùng hoặc thiếu */}
              {panelErrors.length > 0 && (
                <div className="bg-[#FBE8E5] border border-[#B3382C]/30 rounded-[6px] p-3 text-xs text-[#B3382C] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#B3382C]" />
                    <span>Vui lòng kiểm tra lại:</span>
                  </div>
                  {panelErrors.map((err, idx) => (
                    <p key={idx} className="pl-5 leading-relaxed">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Bảng nhập thông tin từng học viên */}
              <div className="border border-[#DFE4EC] rounded-[6px] overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC]">
                      <th className="py-2 px-3 font-semibold">Học viên</th>
                      <th className="py-2 px-3 font-semibold">Số hiệu bằng *</th>
                      <th className="py-2 px-3 font-semibold">Số quyết định *</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE4EC]">
                    {studentsToIssue.map((st) => (
                      <tr key={st.id} className="hover:bg-[#F4F6FA]/50">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#131B2E]">
                            {st.fullName}
                          </div>
                          <div className="text-[10px] text-[#5A6478] tabular-nums">
                            {st.studentCode} • {st.courseName}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          <Input
                            type="text"
                            value={formCertNumbers[st.id] || ""}
                            onChange={(e) => {
                              const updated = {
                                ...formCertNumbers,
                                [st.id]: e.target.value,
                              }
                              setFormCertNumbers(updated)
                              validatePanelData(updated, formDecisionNumbers)
                            }}
                            placeholder="TVC-260..."
                            className="h-8 text-xs font-semibold tabular-nums border-[#DFE4EC]"
                          />
                        </td>

                        <td className="py-2.5 px-3">
                          <Input
                            type="text"
                            value={formDecisionNumbers[st.id] || ""}
                            onChange={(e) => {
                              const updated = {
                                ...formDecisionNumbers,
                                [st.id]: e.target.value,
                              }
                              setFormDecisionNumbers(updated)
                              validatePanelData(formCertNumbers, updated)
                            }}
                            placeholder=".../QĐ-TVC"
                            className="h-8 text-xs tabular-nums border-[#DFE4EC]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Side Panel */}
            <div className="p-4 md:p-5 border-t border-[#DFE4EC] bg-[#F4F6FA] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowIssuePanel(false)}
                className="h-9 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleConfirmIssue}
                disabled={panelErrors.length > 0}
                className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] cursor-pointer"
              >
                Xác nhận cấp bằng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. DIALOG: XÁC NHẬN "ĐÁNH DẤU ĐÃ NHẬN BẰNG" */}
      {/* ============================================================== */}
      {receiveTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E6F3EA] text-[#2F7D4F] flex items-center justify-center">
                <FileBadge className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  Xác nhận trao bằng tốt nghiệp
                </h3>
                <p className="text-xs text-[#5A6478]">
                  Số hiệu bằng: {receiveTarget.certificateNumber}
                </p>
              </div>
            </div>

            <div className="bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Học viên:</span>
                <span className="font-semibold text-[#131B2E]">
                  {receiveTarget.fullName} ({receiveTarget.studentCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Khóa học:</span>
                <span className="font-medium text-[#131B2E]">
                  {receiveTarget.courseName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Số quyết định:</span>
                <span className="tabular-nums font-medium text-[#131B2E]">
                  {receiveTarget.decisionNumber}
                </span>
              </div>
            </div>

            {/* Checkbox bắt buộc: "Học viên đã trực tiếp đến nhận bằng" */}
            <div className="space-y-3 text-xs pt-1">
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Ngày nhận bằng
                </label>
                <Input
                  type="date"
                  value={receiveDate}
                  onChange={(e) => setReceiveDate(e.target.value)}
                  className="h-8 text-xs border-[#DFE4EC]"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-[6px] bg-[#E7EDFB]/50 border border-[#1E40AF]/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmedDirectReceive}
                  onChange={(e) => setConfirmedDirectReceive(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#1E40AF] rounded border-[#DFE4EC]"
                />
                <div className="leading-tight">
                  <span className="font-bold text-[#131B2E]">
                    Học viên đã trực tiếp đến nhận bằng
                  </span>
                  <p className="text-[11px] text-[#5A6478] mt-0.5">
                    Chứng chỉ / văn bằng tốt nghiệp không được giao cho người khác nhận thay.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE4EC]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReceiveTarget(null)}
                className="h-8 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!confirmedDirectReceive}
                onClick={handleConfirmReceive}
                className="h-8 text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
              >
                Xác nhận đã nhận
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
