import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import {
  Search,
  Plus,
  ArrowLeft,
  FileSpreadsheet,
  UserPlus,
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  X,
  Filter,
} from "lucide-react"

// Kiểu dữ liệu thí sinh dự thi
export interface CandidateItem {
  id: string
  studentId: string
  studentCode: string
  fullName: string
  phone: string
  classCode: string
  status: "chua_thi" | "doi_lich" | "da_thi"
  score: number | null
  result: "chua_co" | "dau" | "rot"
  actualExamDate?: string // Ngày thi thực tế (khi đã thi)
  rescheduledNote?: string // Ví dụ: "Dời lịch từ 20/10 sang 03/11"
  targetExamId?: string
}

// Kiểu dữ liệu kỳ thi
export interface ExamItem {
  id: string
  code: string // THI_UDCNTT_2410
  name: string // Kỳ thi Chứng chỉ CNTT Cơ bản K0126
  type: "noi_bo" | "chung_chi"
  courseName: string
  examDate: string // YYYY-MM-DD
  shiftTime: string // "08:00 - 10:30"
  location: string // "Phòng PM2 - TVC Center"
  passScore: number // Điểm đạt e.g. 5.0
  maxScore: number // Điểm tối đa e.g. 10.0
  candidatesCount: number
  rescheduledCount?: number
  isCompleted?: boolean
  candidates: CandidateItem[]
}

// Dữ liệu học viên mẫu để dùng khi thêm học viên vào kỳ thi
interface AvailableStudent {
  id: string
  code: string
  fullName: string
  phone: string
  classCode: string
}

const AVAILABLE_STUDENTS_MOCK: AvailableStudent[] = [
  { id: "st-1", code: "HV26-0001", fullName: "Lê Hoàng Anh", phone: "0912 345 678", classCode: "UDCNTTCB_K0126_Ca1PM1" },
  { id: "st-2", code: "HV26-0002", fullName: "Phạm Gia Bảo", phone: "0988 123 456", classCode: "UDCNTTCB_K0126_Ca1PM1" },
  { id: "st-3", code: "HV26-0003", fullName: "Nguyễn Thị Hà", phone: "0903 888 999", classCode: "UDCNTTCB_K0126_Ca1PM2" },
  { id: "st-4", code: "HV26-0004", fullName: "Trần Minh Khoa", phone: "0934 567 890", classCode: "UDCNTTCB_K0126_Ca1PM1" },
  { id: "st-5", code: "HV26-0005", fullName: "Đỗ Phương Linh", phone: "0977 654 321", classCode: "UDCNTTCB_K0126_Ca1PM1" },
  { id: "st-6", code: "HV26-0006", fullName: "Võ Ngọc Mai", phone: "0918 222 333", classCode: "PREIELTS_K0126_Ca2PM1" },
  { id: "st-7", code: "HV26-0007", fullName: "Hoàng Văn Nam", phone: "0945 777 888", classCode: "UDCNTTCB_K0126_Ca1PM1" },
  { id: "st-8", code: "HV26-0008", fullName: "Vũ Bích Ngọc", phone: "0971 234 567", classCode: "UDCNTTCB_K0126_Ca1PM2" },
  { id: "st-9", code: "HV26-0009", fullName: "Đặng Quốc Bảo", phone: "0982 345 678", classCode: "UDCNTTCB_K0126_Ca1PM2" },
  { id: "st-10", code: "HV26-0010", fullName: "Lý Gia Hân", phone: "0963 111 222", classCode: "IC3_K0126_Ca2PM2" },
]

// Dữ liệu mẫu các kỳ thi
const INITIAL_EXAMS: ExamItem[] = [
  {
    id: "exam-1",
    code: "THI_UDCNTT_2410",
    name: "Kỳ thi Chứng chỉ CNTT Cơ bản K0126",
    type: "chung_chi",
    courseName: "Ứng dụng CNTT Cơ bản",
    examDate: "2026-10-24",
    shiftTime: "08:00 - 10:30",
    location: "Phòng PM2 - TVC Center",
    passScore: 5.0,
    maxScore: 10.0,
    candidatesCount: 24,
    rescheduledCount: 3,
    isCompleted: false,
    candidates: [
      {
        id: "cand-1",
        studentId: "st-1",
        studentCode: "HV26-0001",
        fullName: "Lê Hoàng Anh",
        phone: "0912 345 678",
        classCode: "UDCNTTCB_K0126_Ca1PM1",
        status: "da_thi",
        score: 8.5,
        result: "dau",
        actualExamDate: "2026-10-24",
      },
      {
        id: "cand-2",
        studentId: "st-2",
        studentCode: "HV26-0002",
        fullName: "Phạm Gia Bảo",
        phone: "0988 123 456",
        classCode: "UDCNTTCB_K0126_Ca1PM1",
        status: "da_thi",
        score: 4.0,
        result: "rot",
        actualExamDate: "2026-10-24",
      },
      {
        id: "cand-3",
        studentId: "st-4",
        studentCode: "HV26-0004",
        fullName: "Trần Minh Khoa",
        phone: "0934 567 890",
        classCode: "UDCNTTCB_K0126_Ca1PM1",
        status: "doi_lich",
        score: null,
        result: "chua_co",
        rescheduledNote: "Dời lịch từ 20/10 sang 03/11",
      },
      {
        id: "cand-4",
        studentId: "st-5",
        studentCode: "HV26-0005",
        fullName: "Đỗ Phương Linh",
        phone: "0977 654 321",
        classCode: "UDCNTTCB_K0126_Ca1PM1",
        status: "doi_lich",
        score: null,
        result: "chua_co",
        rescheduledNote: "Dời lịch từ 20/10 sang 03/11",
      },
      {
        id: "cand-5",
        studentId: "st-7",
        studentCode: "HV26-0007",
        fullName: "Hoàng Văn Nam",
        phone: "0945 777 888",
        classCode: "UDCNTTCB_K0126_Ca1PM1",
        status: "doi_lich",
        score: null,
        result: "chua_co",
        rescheduledNote: "Dời lịch từ 20/10 sang 03/11",
      },
      {
        id: "cand-6",
        studentId: "st-8",
        studentCode: "HV26-0008",
        fullName: "Vũ Bích Ngọc",
        phone: "0971 234 567",
        classCode: "UDCNTTCB_K0126_Ca1PM2",
        status: "chua_thi",
        score: null,
        result: "chua_co",
      },
      {
        id: "cand-7",
        studentId: "st-9",
        studentCode: "HV26-0009",
        fullName: "Đặng Quốc Bảo",
        phone: "0982 345 678",
        classCode: "UDCNTTCB_K0126_Ca1PM2",
        status: "chua_thi",
        score: null,
        result: "chua_co",
      },
      {
        id: "cand-8",
        studentId: "st-3",
        studentCode: "HV26-0003",
        fullName: "Nguyễn Thị Hà",
        phone: "0903 888 999",
        classCode: "UDCNTTCB_K0126_Ca1PM2",
        status: "da_thi",
        score: 9.0,
        result: "dau",
        actualExamDate: "2026-10-24",
      },
    ],
  },
  {
    id: "exam-2",
    code: "THI_IC3_2510",
    name: "Kỳ thi Chứng chỉ IC3 - GS6 Quốc tế",
    type: "chung_chi",
    courseName: "Chứng chỉ IC3 - GS6",
    examDate: "2026-10-25",
    shiftTime: "14:00 - 16:30",
    location: "Phòng PM2 - TVC Center",
    passScore: 700,
    maxScore: 1000,
    candidatesCount: 16,
    isCompleted: false,
    candidates: [
      {
        id: "cand-9",
        studentId: "st-10",
        studentCode: "HV26-0010",
        fullName: "Lý Gia Hân",
        phone: "0963 111 222",
        classCode: "IC3_K0126_Ca2PM2",
        status: "chua_thi",
        score: null,
        result: "chua_co",
      },
    ],
  },
  {
    id: "exam-3",
    code: "THI_TAGT_3010",
    name: "Kiểm tra Cuối khóa Tiếng Anh Giao tiếp K0126",
    type: "noi_bo",
    courseName: "Tiếng Anh giao tiếp",
    examDate: "2026-10-30",
    shiftTime: "18:30 - 20:30",
    location: "Phòng PM1 - TVC Center",
    passScore: 50,
    maxScore: 100,
    candidatesCount: 20,
    rescheduledCount: 1,
    isCompleted: false,
    candidates: [],
  },
  {
    id: "exam-4",
    code: "THI_CC_0311",
    name: "Kỳ thi Chứng chỉ CNTT Cơ bản Đợt 2 (Tháng 11)",
    type: "chung_chi",
    courseName: "Ứng dụng CNTT Cơ bản",
    examDate: "2026-11-03",
    shiftTime: "08:00 - 10:30",
    location: "Phòng PM1 & PM2",
    passScore: 5.0,
    maxScore: 10.0,
    candidatesCount: 18,
    isCompleted: false,
    candidates: [],
  },
  {
    id: "exam-5",
    code: "THI_PREIELTS_1010",
    name: "Kiểm tra Giữa khóa Pre-Ielts K0126",
    type: "noi_bo",
    courseName: "Pre-Ielts",
    examDate: "2026-10-10",
    shiftTime: "18:30 - 20:30",
    location: "Phòng PM1",
    passScore: 5.0,
    maxScore: 9.0,
    candidatesCount: 12,
    isCompleted: true,
    candidates: [],
  },
]

export const Exams: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>(INITIAL_EXAMS)
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null)

  // Bộ lọc danh sách kỳ thi
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "chung_chi" | "noi_bo">("all")

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // --- MODAL: THÊM KỲ THI ---
  const [showAddExamModal, setShowAddExamModal] = useState(false)
  const [newExamName, setNewExamName] = useState("")
  const [newCourseName, setNewCourseName] = useState("Ứng dụng CNTT Cơ bản")
  const [newType, setNewType] = useState<"chung_chi" | "noi_bo">("chung_chi")
  const [newExamDate, setNewExamDate] = useState("2026-11-10")
  const [newShiftTime, setNewShiftTime] = useState("08:00 - 10:30")
  const [newLocation, setNewLocation] = useState("Phòng PM2 - TVC Center")
  const [newPassScore, setNewPassScore] = useState<number>(5.0)
  const [newMaxScore, setNewMaxScore] = useState<number>(10.0)

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newExamName.trim()) return

    const newCode = `THI_${newType === "chung_chi" ? "CC" : "NB"}_${newExamDate.replace(/-/g, "").slice(4)}`
    const newExam: ExamItem = {
      id: `exam-${Date.now()}`,
      code: newCode,
      name: newExamName.trim(),
      type: newType,
      courseName: newCourseName,
      examDate: newExamDate,
      shiftTime: newShiftTime,
      location: newLocation,
      passScore: newPassScore,
      maxScore: newMaxScore,
      candidatesCount: 0,
      candidates: [],
    }

    setExams([newExam, ...exams])
    setShowAddExamModal(false)
    setNewExamName("")
    showToast(`Đã tạo kỳ thi ${newExam.name}`)
  }

  // Kỳ thi đang được chọn xem chi tiết
  const currentExam = useMemo(() => {
    return exams.find((e) => e.id === selectedExamId) || null
  }, [exams, selectedExamId])

  // --- MODAL: DỜI LỊCH THI CHO THÍ SINH ---
  const [rescheduleTarget, setRescheduleTarget] = useState<CandidateItem | null>(null)
  const [rescheduleTargetExamId, setRescheduleTargetExamId] = useState<string>("")
  const [rescheduleNote, setRescheduleNote] = useState<string>("")

  const handleOpenReschedule = (cand: CandidateItem) => {
    setRescheduleTarget(cand)
    // Mặc định chọn kỳ thi tiếp theo nếu có
    const otherExams = exams.filter((e) => e.id !== selectedExamId && !e.isCompleted)
    setRescheduleTargetExamId(otherExams[0]?.id || "")
    setRescheduleNote("Bận việc cá nhân")
  }

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rescheduleTarget || !selectedExamId) return

    const targetExam = exams.find((e) => e.id === rescheduleTargetExamId)
    const oldExamDateStr = currentExam?.examDate.split("-").slice(1).reverse().join("/") || "20/10"
    const newExamDateStr = targetExam?.examDate.split("-").slice(1).reverse().join("/") || "03/11"
    const historyText = `Dời lịch từ ${oldExamDateStr} sang ${newExamDateStr}`

    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== selectedExamId) return exam
        return {
          ...exam,
          rescheduledCount: (exam.rescheduledCount || 0) + 1,
          candidates: exam.candidates.map((c) => {
            if (c.id !== rescheduleTarget.id) return c
            return {
              ...c,
              status: "doi_lich",
              rescheduledNote: historyText,
              score: null,
              result: "chua_co",
              targetExamId: rescheduleTargetExamId,
            }
          }),
        }
      })
    )

    setRescheduleTarget(null)
    showToast(`Đã dời lịch thi của ${rescheduleTarget.fullName}`)
  }

  // --- MODAL: THÊM HỌC VIÊN DỰ THI (PICKER & THÊM CẢ LỚP) ---
  const [showAddCandidatesModal, setShowAddCandidatesModal] = useState(false)
  const [candidateSearchQuery, setCandidateSearchQuery] = useState("")
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [selectedClassForBulk, setSelectedClassForBulk] = useState<string>("all")

  const handleOpenAddCandidates = () => {
    setShowAddCandidatesModal(true)
    setSelectedStudentIds([])
    setCandidateSearchQuery("")
    setSelectedClassForBulk("all")
  }

  // Danh sách học viên chưa có trong kỳ thi này
  const eligibleStudents = useMemo(() => {
    if (!currentExam) return []
    const existingStudentIds = new Set(currentExam.candidates.map((c) => c.studentId))
    return AVAILABLE_STUDENTS_MOCK.filter((st) => !existingStudentIds.has(st.id))
  }, [currentExam])

  // Lọc học viên trong modal picker
  const filteredEligibleStudents = useMemo(() => {
    return eligibleStudents.filter((st) => {
      if (selectedClassForBulk !== "all" && st.classCode !== selectedClassForBulk) {
        return false
      }
      if (candidateSearchQuery.trim()) {
        const q = candidateSearchQuery.toLowerCase()
        return (
          st.fullName.toLowerCase().includes(q) ||
          st.code.toLowerCase().includes(q) ||
          st.phone.includes(q) ||
          st.classCode.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [eligibleStudents, candidateSearchQuery, selectedClassForBulk])

  // Thao tác: "Thêm cả lớp"
  const handleSelectEntireClass = (classCode: string) => {
    setSelectedClassForBulk(classCode)
    if (classCode === "all") {
      setSelectedStudentIds([])
    } else {
      const classStudentIds = eligibleStudents
        .filter((st) => st.classCode === classCode)
        .map((st) => st.id)
      setSelectedStudentIds(classStudentIds)
    }
  }

  const handleAddSelectedStudents = () => {
    if (!selectedExamId || selectedStudentIds.length === 0) return

    const studentsToAdd = eligibleStudents.filter((st) =>
      selectedStudentIds.includes(st.id)
    )

    const newCandidates: CandidateItem[] = studentsToAdd.map((st) => ({
      id: `cand-${Date.now()}-${st.id}`,
      studentId: st.id,
      studentCode: st.code,
      fullName: st.fullName,
      phone: st.phone,
      classCode: st.classCode,
      status: "chua_thi", // A newly added student defaults to "Chưa thi"
      score: null,
      result: "chua_co",
    }))

    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== selectedExamId) return exam
        return {
          ...exam,
          candidatesCount: exam.candidatesCount + newCandidates.length,
          candidates: [...exam.candidates, ...newCandidates],
        }
      })
    )

    setShowAddCandidatesModal(false)
    showToast(`Đã thêm ${newCandidates.length} học viên dự thi`)
  }

  // --- CẬP NHẬT TRẠNG THÁI VÀ ĐIỂM SỐ CỦA THÍ SINH (INLINE & BATCH MOBILE) ---
  const [hasMobileUnsavedChanges, setHasMobileUnsavedChanges] = useState(false)

  const handleCandidateScoreChange = (candId: string, scoreVal: string) => {
    if (!currentExam) return
    const num = scoreVal === "" ? null : parseFloat(scoreVal)

    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== currentExam.id) return exam
        return {
          ...exam,
          candidates: exam.candidates.map((c) => {
            if (c.id !== candId) return c
            let res: "chua_co" | "dau" | "rot" = "chua_co"
            if (num !== null && !isNaN(num)) {
              res = num >= exam.passScore ? "dau" : "rot"
            }
            return {
              ...c,
              score: num !== null && !isNaN(num) ? num : null,
              result: res,
            }
          }),
        }
      })
    )
    setHasMobileUnsavedChanges(true)
  }

  const handleCandidateStatusChange = (candId: string, newStatus: "chua_thi" | "doi_lich" | "da_thi") => {
    if (newStatus === "doi_lich") {
      const cand = currentExam?.candidates.find((c) => c.id === candId)
      if (cand) handleOpenReschedule(cand)
      return
    }

    if (!currentExam) return

    setExams((prev) =>
      prev.map((exam) => {
        if (exam.id !== currentExam.id) return exam
        return {
          ...exam,
          candidates: exam.candidates.map((c) => {
            if (c.id !== candId) return c
            const isFinished = newStatus === "da_thi"
            return {
              ...c,
              status: newStatus,
              actualExamDate: isFinished ? (c.actualExamDate || exam.examDate) : undefined,
              score: isFinished ? (c.score ?? exam.passScore) : null,
              result: isFinished ? (c.score !== null && c.score >= exam.passScore ? "dau" : "dau") : "chua_co",
            }
          }),
        }
      })
    )
    setHasMobileUnsavedChanges(true)
  }

  // Xuất danh sách dự thi (Excel / CSV)
  const handleExportExcel = () => {
    if (!currentExam) return
    const rows = [
      ["STT", "Mã học viên", "Họ và tên", "Số điện thoại", "Lớp", "Trạng thái", "Điểm số", "Kết quả", "Ghi chú"],
      ...currentExam.candidates.map((c, idx) => [
        idx + 1,
        c.studentCode,
        c.fullName,
        c.phone,
        c.classCode,
        c.status === "da_thi" ? "Đã thi" : c.status === "doi_lich" ? "Dời lịch thi" : "Chưa thi",
        c.score ?? "—",
        c.result === "dau" ? "Đậu" : c.result === "rot" ? "Rớt" : "Chưa có",
        c.rescheduledNote || "",
      ]),
    ]

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map((e) => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Danh_sach_du_thi_${currentExam.code}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast("Đã xuất danh sách dự thi (Excel)")
  }

  // Danh sách sắp xếp: "upcoming first" (kỳ thi sắp diễn ra trước)
  const sortedExams = useMemo(() => {
    return [...exams].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1
      }
      return new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    })
  }, [exams])

  const filteredExams = useMemo(() => {
    return sortedExams.filter((exam) => {
      if (typeFilter !== "all" && exam.type !== typeFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          exam.name.toLowerCase().includes(q) ||
          exam.code.toLowerCase().includes(q) ||
          exam.courseName.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [sortedExams, typeFilter, searchQuery])

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* ============================================================== */}
      {/* 1. MÀN HÌNH DANH SÁCH KỲ THI (LIST VIEW: Upcoming first) */}
      {/* ============================================================== */}
      {!selectedExamId ? (
        <>
          {/* Header & Nút Thêm kỳ thi */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#DFE4EC]">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-22 font-semibold text-[#131B2E] tracking-tight">
                  Kỳ thi
                </h1>
                <Badge variant="neutral" className="text-[11px] font-medium px-2 py-0.5">
                  {exams.length} kỳ thi
                </Badge>
              </div>
              <p className="text-xs text-[#5A6478] mt-0.5">
                Quản lý các đợt thi chứng chỉ và kiểm tra nội bộ tại trung tâm
              </p>
            </div>

            <Button
              onClick={() => setShowAddExamModal(true)}
              className="h-9 px-3 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm kỳ thi</span>
            </Button>
          </div>

          {/* Bộ lọc và Tìm kiếm */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DFE4EC] rounded-[10px] p-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#5A6478] font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Phân loại:
              </span>
              <button
                type="button"
                onClick={() => setTypeFilter("all")}
                className={`px-3 py-1 text-xs rounded-[6px] font-medium transition-colors cursor-pointer ${
                  typeFilter === "all"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("chung_chi")}
                className={`px-3 py-1 text-xs rounded-[6px] font-medium transition-colors cursor-pointer ${
                  typeFilter === "chung_chi"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Chứng chỉ
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter("noi_bo")}
                className={`px-3 py-1 text-xs rounded-[6px] font-medium transition-colors cursor-pointer ${
                  typeFilter === "noi_bo"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Nội bộ
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5A6478]" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kỳ thi, khóa học..."
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

          {/* Bảng danh sách kỳ thi (Desktop Table) */}
          <div className="hidden lg:block bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
                  <th className="py-2.5 px-4 font-semibold">Ngày thi & Ca thi</th>
                  <th className="py-2.5 px-4 font-semibold">Tên kỳ thi</th>
                  <th className="py-2.5 px-3 font-semibold">Phân loại</th>
                  <th className="py-2.5 px-3 font-semibold">Khóa học</th>
                  <th className="py-2.5 px-4 font-semibold">Thí sinh dự thi</th>
                  <th className="py-2.5 px-4 font-semibold">Địa điểm</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE4EC]">
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className="hover:bg-[#E7EDFB]/35 transition-colors cursor-pointer group"
                  >
                    {/* Ngày thi & Ca thi */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#131B2E] tabular-nums">
                        {formatDate(exam.examDate)}
                      </div>
                      <div className="text-[11px] text-[#5A6478] tabular-nums flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-[#5A6478]" />
                        <span>{exam.shiftTime}</span>
                      </div>
                    </td>

                    {/* Tên kỳ thi */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#131B2E] group-hover:text-[#1E40AF] transition-colors">
                        {exam.name}
                      </div>
                      <div className="text-[11px] text-[#5A6478] tabular-nums">
                        {exam.code}
                      </div>
                    </td>

                    {/* Phân loại chip */}
                    <td className="py-3 px-3">
                      {exam.type === "chung_chi" ? (
                        <Badge variant="default" className="text-[10px] font-semibold py-0.5 px-2">
                          Chứng chỉ
                        </Badge>
                      ) : (
                        <Badge variant="neutral" className="text-[10px] font-semibold py-0.5 px-2">
                          Nội bộ
                        </Badge>
                      )}
                    </td>

                    {/* Khóa học */}
                    <td className="py-3 px-3 text-[#5A6478] font-medium">
                      {exam.courseName}
                    </td>

                    {/* Thí sinh dự thi & Dời lịch */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#131B2E] tabular-nums">
                        {exam.candidatesCount} học viên dự thi
                      </div>
                      {exam.rescheduledCount && exam.rescheduledCount > 0 ? (
                        <div className="text-[11px] text-[#A86A0B] font-semibold mt-0.5">
                          {exam.rescheduledCount} dời lịch
                        </div>
                      ) : null}
                    </td>

                    {/* Địa điểm */}
                    <td className="py-3 px-4 text-[#5A6478] truncate max-w-[160px]">
                      {exam.location}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3 px-4 text-right">
                      <span className="text-[#1E40AF] font-medium group-hover:underline inline-flex items-center gap-1">
                        Xem chi tiết &rarr;
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Danh sách thẻ kỳ thi trên Mobile (< 1024px) */}
          <div className="block lg:hidden space-y-2.5">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => setSelectedExamId(exam.id)}
                className="bg-white border border-[#DFE4EC] rounded-[10px] p-3.5 space-y-2 cursor-pointer hover:border-[#1E40AF] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {exam.type === "chung_chi" ? (
                      <Badge variant="default" className="text-[10px] py-0 px-1.5 font-bold">
                        Chứng chỉ
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-[10px] py-0 px-1.5 font-bold">
                        Nội bộ
                      </Badge>
                    )}
                    <span className="text-xs text-[#5A6478] tabular-nums font-medium">
                      {formatDate(exam.examDate)} • {exam.shiftTime}
                    </span>
                  </div>

                  {exam.rescheduledCount && exam.rescheduledCount > 0 ? (
                    <span className="text-[10px] text-[#A86A0B] bg-[#FBF0DC] px-1.5 py-0.2 rounded font-semibold">
                      {exam.rescheduledCount} dời lịch
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#131B2E] leading-snug">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-[#5A6478] mt-0.5">{exam.courseName}</p>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#DFE4EC] text-[#5A6478]">
                  <span className="font-semibold text-[#131B2E]">
                    {exam.candidatesCount} học viên dự thi
                  </span>
                  <span className="text-[#1E40AF] font-medium">
                    Chi tiết &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* ============================================================== */
        /* 2. MÀN HÌNH CHI TIẾT KỲ THI (DETAIL VIEW: Header + Danh sách dự thi) */
        /* ============================================================== */
        currentExam && (
          <div className="space-y-4">
            {/* Nút quay lại */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedExamId(null)}
                className="h-8 text-xs font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Quay lại danh sách kỳ thi</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                  className="h-8 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#2F7D4F]" />
                  <span>Xuất danh sách dự thi (Excel)</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleOpenAddCandidates}
                  className="h-8 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm học viên dự thi</span>
                </Button>
              </div>
            </div>

            {/* Header Block Chi tiết kỳ thi */}
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#DFE4EC] pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-[#1E40AF] text-white">
                      {currentExam.type === "chung_chi" ? "Thi Chứng chỉ" : "Kiểm tra Nội bộ"}
                    </span>
                    <span className="text-xs text-[#5A6478] tabular-nums">
                      Mã kỳ thi: {currentExam.code}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-[#131B2E]">
                    {currentExam.name}
                  </h2>
                  <p className="text-xs text-[#5A6478] mt-0.5 font-medium">
                    Môn học / Chương trình: {currentExam.courseName}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-xs text-[#5A6478]">Tổng thí sinh</div>
                  <div className="text-xl font-bold text-[#131B2E] tabular-nums">
                    {currentExam.candidates.length} học viên
                  </div>
                </div>
              </div>

              {/* Thông số chi tiết: Ngày, Ca thi, Địa điểm, Điểm đạt */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1E40AF] shrink-0" />
                  <div>
                    <div className="text-[#5A6478]">Ngày thi:</div>
                    <div className="font-semibold text-[#131B2E] tabular-nums">
                      {formatDate(currentExam.examDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1E40AF] shrink-0" />
                  <div>
                    <div className="text-[#5A6478]">Ca thi:</div>
                    <div className="font-semibold text-[#131B2E] tabular-nums">
                      {currentExam.shiftTime}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1E40AF] shrink-0" />
                  <div>
                    <div className="text-[#5A6478]">Địa điểm thi:</div>
                    <div className="font-semibold text-[#131B2E] truncate">
                      {currentExam.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1E40AF] shrink-0" />
                  <div>
                    <div className="text-[#5A6478]">Chuẩn điểm đạt:</div>
                    <div className="font-semibold text-[#131B2E] tabular-nums">
                      ≥ {currentExam.passScore} / {currentExam.maxScore} điểm
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BẢNG DANH SÁCH DỰ THI (TABLE) */}
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
              <div className="p-3.5 border-b border-[#DFE4EC] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#131B2E]">
                    Danh sách thí sinh dự thi
                  </h3>
                  <p className="text-[11px] text-[#5A6478]">
                    Cập nhật trạng thái thi, nhập điểm và xác nhận Đậu / Rớt
                  </p>
                </div>

                <div className="text-xs text-[#5A6478]">
                  Đã thi:{" "}
                  <strong className="text-[#2F7D4F] tabular-nums">
                    {currentExam.candidates.filter((c) => c.status === "da_thi").length}
                  </strong>{" "}
                  • Dời lịch:{" "}
                  <strong className="text-[#A86A0B] tabular-nums">
                    {currentExam.candidates.filter((c) => c.status === "doi_lich").length}
                  </strong>{" "}
                  • Chưa thi:{" "}
                  <strong className="tabular-nums">
                    {currentExam.candidates.filter((c) => c.status === "chua_thi").length}
                  </strong>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
                      <th className="py-2.5 px-4 font-semibold w-12">STT</th>
                      <th className="py-2.5 px-4 font-semibold">Thí sinh & SĐT</th>
                      <th className="py-2.5 px-3 font-semibold">Lớp học</th>
                      <th className="py-2.5 px-4 font-semibold w-40">Trạng thái thi</th>
                      <th className="py-2.5 px-3 font-semibold w-28">Điểm số</th>
                      <th className="py-2.5 px-3 font-semibold w-28">Kết quả</th>
                      <th className="py-2.5 px-4 font-semibold">Ghi chú</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DFE4EC]">
                    {currentExam.candidates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#5A6478]">
                          Chưa có thí sinh trong danh sách. Bấm "Thêm học viên dự thi" để bắt đầu.
                        </td>
                      </tr>
                    ) : (
                      currentExam.candidates.map((cand, idx) => (
                        <tr key={cand.id} className="hover:bg-[#F4F6FA]/50 transition-colors">
                          <td className="py-3 px-4 tabular-nums text-[#5A6478] font-medium">
                            {idx + 1}
                          </td>

                          {/* Họ tên & SĐT */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#131B2E]">
                              {cand.fullName}
                            </div>
                            <div className="text-[11px] text-[#5A6478] tabular-nums flex items-center gap-1.5 mt-0.5">
                              <span>{cand.studentCode}</span>
                              <span>•</span>
                              <span>{cand.phone}</span>
                            </div>
                          </td>

                          {/* Lớp */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#131B2E] tabular-nums">
                              {cand.classCode}
                            </span>
                          </td>

                          {/* Trạng thái thi: Chưa thi / Dời lịch thi / Đã thi */}
                          <td className="py-3 px-4">
                            <select
                              value={cand.status}
                              onChange={(e) =>
                                handleCandidateStatusChange(
                                  cand.id,
                                  e.target.value as "chua_thi" | "doi_lich" | "da_thi"
                                )
                              }
                              className="h-8 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium focus:ring-1 focus:ring-[#1E40AF]"
                            >
                              <option value="chua_thi">Chưa thi</option>
                              <option value="doi_lich">Dời lịch thi</option>
                              <option value="da_thi">Đã thi</option>
                            </select>
                          </td>

                          {/* Nhập điểm số */}
                          <td className="py-3 px-3">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max={currentExam.maxScore}
                              disabled={cand.status !== "da_thi"}
                              value={cand.score !== null ? cand.score : ""}
                              onChange={(e) => handleCandidateScoreChange(cand.id, e.target.value)}
                              placeholder="0.0"
                              className="h-8 w-20 text-xs font-semibold tabular-nums border-[#DFE4EC] disabled:bg-[#ECEFF5] disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Kết quả thi (Result chip: Chưa có, Đậu, Rớt) */}
                          <td className="py-3 px-3">
                            {cand.result === "dau" ? (
                              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                                Đậu
                              </Badge>
                            ) : cand.result === "rot" ? (
                              <Badge variant="danger" className="text-[10px] font-bold px-2 py-0.5">
                                Rớt
                              </Badge>
                            ) : (
                              <Badge variant="neutral" className="text-[10px] font-medium px-2 py-0.5">
                                Chưa có
                              </Badge>
                            )}
                          </td>

                          {/* Ghi chú & Dời lịch note */}
                          <td className="py-3 px-4">
                            {cand.rescheduledNote ? (
                              <span className="text-[11px] text-[#A86A0B] font-semibold bg-[#FBF0DC] px-2 py-0.5 rounded-[4px] inline-block">
                                {cand.rescheduledNote}
                              </span>
                            ) : cand.status === "da_thi" && cand.actualExamDate ? (
                              <span className="text-[11px] text-[#5A6478] tabular-nums">
                                Thi ngày {formatDate(cand.actualExamDate)}
                              </span>
                            ) : (
                              <span className="text-[#5A6478]">—</span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="py-3 px-3 text-right">
                            {cand.status !== "doi_lich" && (
                              <button
                                type="button"
                                onClick={() => handleOpenReschedule(cand)}
                                className="text-xs text-[#1E40AF] hover:underline font-medium cursor-pointer"
                              >
                                Dời lịch
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Candidate List (One student per row with controls) */}
              <div className="block lg:hidden divide-y divide-[#DFE4EC]">
                {currentExam.candidates.map((cand, idx) => (
                  <div key={cand.id} className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-[#131B2E]">
                          {idx + 1}. {cand.fullName}
                        </div>
                        <div className="text-xs text-[#5A6478] tabular-nums">
                          {cand.studentCode} • {cand.classCode}
                        </div>
                      </div>

                      {/* Chip kết quả */}
                      <div>
                        {cand.result === "dau" ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Đậu
                          </Badge>
                        ) : cand.result === "rot" ? (
                          <Badge variant="danger" className="text-[10px] font-bold">
                            Rớt
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px] font-medium">
                            Chưa có
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Dòng điều khiển trạng thái & điểm số trên Mobile */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-[#5A6478] mb-0.5">
                          Trạng thái:
                        </label>
                        <select
                          value={cand.status}
                          onChange={(e) =>
                            handleCandidateStatusChange(
                              cand.id,
                              e.target.value as "chua_thi" | "doi_lich" | "da_thi"
                            )
                          }
                          className="w-full h-8 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                        >
                          <option value="chua_thi">Chưa thi</option>
                          <option value="doi_lich">Dời lịch thi</option>
                          <option value="da_thi">Đã thi</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-[#5A6478] mb-0.5">
                          Điểm số:
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          disabled={cand.status !== "da_thi"}
                          value={cand.score !== null ? cand.score : ""}
                          onChange={(e) => handleCandidateScoreChange(cand.id, e.target.value)}
                          placeholder="Nhập điểm..."
                          className="h-8 text-xs font-semibold tabular-nums border-[#DFE4EC]"
                        />
                      </div>
                    </div>

                    {/* Ghi chú dời lịch nếu có */}
                    {cand.rescheduledNote && (
                      <div className="text-[11px] text-[#A86A0B] bg-[#FBF0DC] p-1.5 rounded-[4px] font-medium">
                        📌 {cand.rescheduledNote}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Sticky Save Bar (Lưu tất cả cùng lúc) */}
            <div className="block lg:hidden sticky bottom-4 z-30 pt-2">
              <div className="bg-[#131B2E] text-white rounded-[10px] p-3 shadow-xl flex items-center justify-between gap-3">
                <span className="text-xs">
                  {hasMobileUnsavedChanges ? "Có thay đổi chưa lưu" : "Danh sách đã cập nhật"}
                </span>
                <Button
                  onClick={() => {
                    setHasMobileUnsavedChanges(false)
                    showToast("Đã lưu danh sách dự thi")
                  }}
                  className="h-9 px-4 text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ============================================================== */}
      {/* 3. MODAL: THÊM KỲ THI MỚI */}
      {/* ============================================================== */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-lg p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  Thêm kỳ thi mới
                </h3>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  Tạo đợt thi chứng chỉ hoặc đợt kiểm tra nội bộ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExamModal(false)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Tên kỳ thi *
                </label>
                <Input
                  type="text"
                  value={newExamName}
                  onChange={(e) => setNewExamName(e.target.value)}
                  placeholder="Ví dụ: Kỳ thi Chứng chỉ CNTT Cơ bản K0226"
                  required
                  autoFocus
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Khóa học liên quan *
                  </label>
                  <select
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full h-9 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                  >
                    <option value="Ứng dụng CNTT Cơ bản">Ứng dụng CNTT Cơ bản</option>
                    <option value="Ứng dụng CNTT Nâng cao">Ứng dụng CNTT Nâng cao</option>
                    <option value="Chứng chỉ IC3 - GS6">Chứng chỉ IC3 - GS6</option>
                    <option value="Tiếng Anh giao tiếp">Tiếng Anh giao tiếp</option>
                    <option value="Pre-Ielts">Pre-Ielts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Phân loại *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setNewType("chung_chi")}
                      className={`h-8 text-xs rounded-[6px] border font-medium cursor-pointer ${
                        newType === "chung_chi"
                          ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                          : "bg-white text-[#131B2E] border-[#DFE4EC]"
                      }`}
                    >
                      Chứng chỉ
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType("noi_bo")}
                      className={`h-8 text-xs rounded-[6px] border font-medium cursor-pointer ${
                        newType === "noi_bo"
                          ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                          : "bg-white text-[#131B2E] border-[#DFE4EC]"
                      }`}
                    >
                      Nội bộ
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Ngày thi *
                  </label>
                  <Input
                    type="date"
                    value={newExamDate}
                    onChange={(e) => setNewExamDate(e.target.value)}
                    required
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Ca thi / Giờ thi *
                  </label>
                  <Input
                    type="text"
                    value={newShiftTime}
                    onChange={(e) => setNewShiftTime(e.target.value)}
                    placeholder="Ví dụ: 08:00 - 10:30"
                    required
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Địa điểm thi (phòng máy / cơ sở) *
                </label>
                <Input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Ví dụ: Phòng PM2 - TVC Center"
                  required
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Điểm đạt (pass score) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newPassScore}
                    onChange={(e) => setNewPassScore(parseFloat(e.target.value) || 0)}
                    required
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Điểm tối đa (max score) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(parseFloat(e.target.value) || 0)}
                    required
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddExamModal(false)}
                  className="h-9 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                >
                  Tạo kỳ thi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: DỜI LỊCH THI CHO THÍ SINH */}
      {/* ============================================================== */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  Dời lịch thi thí sinh
                </h3>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  Chuyển thí sinh sang một đợt thi khác
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Học viên:</span>
                <span className="font-semibold text-[#131B2E]">
                  {rescheduleTarget.fullName} ({rescheduleTarget.studentCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Kỳ thi hiện tại:</span>
                <span className="font-medium text-[#131B2E] tabular-nums">
                  {currentExam?.name} ({formatDate(currentExam?.examDate)})
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReschedule} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Kỳ thi mới chuyển sang (Ngày & Ca) *
                </label>
                <select
                  value={rescheduleTargetExamId}
                  onChange={(e) => setRescheduleTargetExamId(e.target.value)}
                  required
                  className="w-full h-9 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                >
                  {exams
                    .filter((e) => e.id !== selectedExamId && !e.isCompleted)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} — {formatDate(e.examDate)} ({e.shiftTime})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Lý do dời lịch (tùy chọn)
                </label>
                <Input
                  type="text"
                  value={rescheduleNote}
                  onChange={(e) => setRescheduleNote(e.target.value)}
                  placeholder="Ví dụ: Bận việc riêng, trùng lịch thi tại trường..."
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRescheduleTarget(null)}
                  className="h-9 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                >
                  Xác nhận dời lịch
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: THÊM HỌC VIÊN DỰ THI (PICKER + THÊM CẢ LỚP) */}
      {/* ============================================================== */}
      {showAddCandidatesModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-xl p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  Thêm học viên dự thi
                </h3>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  Chọn từng học viên hoặc bấm "Thêm cả lớp" để xếp danh sách
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCandidatesModal(false)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thanh công cụ: Thêm cả lớp & Ô tìm kiếm */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#131B2E]">Thêm cả lớp:</span>
                  <select
                    value={selectedClassForBulk}
                    onChange={(e) => handleSelectEntireClass(e.target.value)}
                    className="h-8 text-xs rounded-[6px] border border-[#DFE4EC] bg-[#F4F6FA] px-2 font-medium"
                  >
                    <option value="all">-- Chọn lớp học --</option>
                    <option value="UDCNTTCB_K0126_Ca1PM1">Lớp UDCNTTCB_K0126_Ca1PM1</option>
                    <option value="UDCNTTCB_K0126_Ca1PM2">Lớp UDCNTTCB_K0126_Ca1PM2</option>
                    <option value="IC3_K0126_Ca2PM2">Lớp IC3_K0126_Ca2PM2</option>
                    <option value="PREIELTS_K0126_Ca2PM1">Lớp PREIELTS_K0126_Ca2PM1</option>
                  </select>
                </div>

                <div className="text-[#5A6478]">
                  Đã chọn:{" "}
                  <strong className="text-[#1E40AF] tabular-nums font-bold">
                    {selectedStudentIds.length}
                  </strong>{" "}
                  học viên
                </div>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5A6478]" />
                <Input
                  type="text"
                  value={candidateSearchQuery}
                  onChange={(e) => setCandidateSearchQuery(e.target.value)}
                  placeholder="Tìm học viên theo tên, mã số, SĐT..."
                  className="pl-8 h-8 text-xs bg-[#F4F6FA] border-[#DFE4EC]"
                />
              </div>
            </div>

            {/* Danh sách học viên có thể chọn */}
            <div className="max-h-[260px] overflow-y-auto border border-[#DFE4EC] rounded-[6px] divide-y divide-[#DFE4EC]">
              {filteredEligibleStudents.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#5A6478]">
                  Không tìm thấy học viên phù hợp hoặc tất cả đã được thêm.
                </div>
              ) : (
                filteredEligibleStudents.map((st) => {
                  const isChecked = selectedStudentIds.includes(st.id)

                  return (
                    <label
                      key={st.id}
                      className={`flex items-center justify-between p-2.5 hover:bg-[#F4F6FA] cursor-pointer text-xs transition-colors ${
                        isChecked ? "bg-[#E7EDFB]/50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudentIds([...selectedStudentIds, st.id])
                            } else {
                              setSelectedStudentIds(
                                selectedStudentIds.filter((id) => id !== st.id)
                              )
                            }
                          }}
                          className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                        />
                        <div>
                          <div className="font-semibold text-[#131B2E]">
                            {st.fullName}
                          </div>
                          <div className="text-[11px] text-[#5A6478] tabular-nums">
                            {st.code} • {st.phone}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge variant="neutral" className="text-[10px] tabular-nums">
                          {st.classCode}
                        </Badge>
                      </div>
                    </label>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddCandidatesModal(false)}
                className="h-9 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleAddSelectedStudents}
                disabled={selectedStudentIds.length === 0}
                className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
              >
                Thêm {selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ""} vào danh sách
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
