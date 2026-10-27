import React, { useState, useMemo, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  GraduationCap,
  X,
  ExternalLink,
  Calendar as CalendarIcon,
  HelpCircle,
} from "lucide-react"

// Kiểu dữ liệu sự kiện lịch (lớp học hoặc kỳ thi)
interface ScheduleItem {
  id: string
  type: "class" | "exam"
  code: string // Mã lớp e.g. UDCNTTCB_K0126_Ca1PM1 hoặc Mã kỳ thi
  courseName: string // e.g. Ứng dụng CNTT Cơ bản
  shiftName?: string // Ca 1, Ca 2, Ca 3, Ca 4
  dayOfWeekIndex: number // 0: Thứ 2, 1: Thứ 3, ..., 5: Thứ 7, 6: Chủ nhật
  dayDate: string // YYYY-MM-DD
  startTime: string // "18:30"
  endTime: string // "20:30"
  startHour: number // 18.5
  durationHours: number // 2.0
  room: string // "PM1", "PM2"
  teacher?: string // "Thầy Tuấn", "Cô Mai Anh", "Thầy Nam"
  capacity?: number
  enrolled?: number
  candidates?: number
  isConflict?: boolean
  conflictType?: "room" | "teacher"
  conflictReason?: string
  conflictsWithCode?: string
}

// 7 ngày trong tuần theo chuẩn thiết kế
const WEEK_DAYS = [
  { label: "Thứ 2", short: "T2", dayIndex: 0 },
  { label: "Thứ 3", short: "T3", dayIndex: 1 },
  { label: "Thứ 4", short: "T4", dayIndex: 2 },
  { label: "Thứ 5", short: "T5", dayIndex: 3 },
  { label: "Thứ 6", short: "T6", dayIndex: 4 },
  { label: "Thứ 7", short: "T7", dayIndex: 5 },
  { label: "Chủ nhật", short: "CN", dayIndex: 6 },
]

// Các mốc giờ từ 07:00 đến 21:00 (14 khoảng giờ)
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7) // 7..21

// Dữ liệu mẫu chuẩn cho tuần 19/10 - 25/10/2026
const SAMPLE_SCHEDULE: ScheduleItem[] = [
  // Thứ 2 (19/10/2026)
  {
    id: "sch-1",
    type: "class",
    code: "UDCNTTCB_K0126_Ca1PM1",
    courseName: "Ứng dụng CNTT Cơ bản",
    shiftName: "Ca 1",
    dayOfWeekIndex: 0,
    dayDate: "2026-10-19",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM1",
    teacher: "Thầy Tuấn",
    capacity: 20,
    enrolled: 18,
    isConflict: true,
    conflictType: "room",
    conflictReason: "Trùng phòng PM1 vào ca 18:30 - 20:30 với lớp TAGT_K0126_Ca1PM1",
    conflictsWithCode: "TAGT_K0126_Ca1PM1",
  },
  {
    id: "sch-2",
    type: "class",
    code: "TAGT_K0126_Ca1PM1",
    courseName: "Tiếng Anh giao tiếp",
    shiftName: "Ca 1",
    dayOfWeekIndex: 0,
    dayDate: "2026-10-19",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM1",
    teacher: "Cô Mai Anh",
    capacity: 30,
    enrolled: 24,
    isConflict: true,
    conflictType: "room",
    conflictReason: "Trùng phòng PM1 vào ca 18:30 - 20:30 với lớp UDCNTTCB_K0126_Ca1PM1",
    conflictsWithCode: "UDCNTTCB_K0126_Ca1PM1",
  },
  {
    id: "sch-3",
    type: "class",
    code: "UDCNTTCB_K0126_Ca1PM2",
    courseName: "Ứng dụng CNTT Cơ bản",
    shiftName: "Ca 1",
    dayOfWeekIndex: 0,
    dayDate: "2026-10-19",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM2",
    teacher: "Thầy Nam",
    capacity: 20,
    enrolled: 18,
    isConflict: false,
  },

  // Thứ 3 (20/10/2026)
  {
    id: "sch-4",
    type: "class",
    code: "PREIELTS_K0126_Ca2PM1",
    courseName: "Pre-Ielts",
    shiftName: "Ca 2",
    dayOfWeekIndex: 1,
    dayDate: "2026-10-20",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM1",
    teacher: "Cô Mai Anh",
    capacity: 25,
    enrolled: 20,
    isConflict: false,
  },
  {
    id: "sch-5",
    type: "class",
    code: "IC3_K0126_Ca2PM2",
    courseName: "Chứng chỉ IC3 - GS6",
    shiftName: "Ca 2",
    dayOfWeekIndex: 1,
    dayDate: "2026-10-20",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM2",
    teacher: "Thầy Tuấn",
    capacity: 40,
    enrolled: 15,
    isConflict: false,
  },

  // Thứ 4 (21/10/2026)
  {
    id: "sch-6",
    type: "class",
    code: "UDCNTTCB_K0126_Ca1PM1",
    courseName: "Ứng dụng CNTT Cơ bản",
    shiftName: "Ca 1",
    dayOfWeekIndex: 2,
    dayDate: "2026-10-21",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM1",
    teacher: "Thầy Tuấn",
    capacity: 20,
    enrolled: 18,
    isConflict: false,
  },
  {
    id: "sch-7",
    type: "class",
    code: "UDCNTTCB_K0126_Ca1PM2",
    courseName: "Ứng dụng CNTT Cơ bản",
    shiftName: "Ca 1",
    dayOfWeekIndex: 2,
    dayDate: "2026-10-21",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM2",
    teacher: "Thầy Nam",
    capacity: 20,
    enrolled: 18,
    isConflict: false,
  },

  // Thứ 5 (22/10/2026)
  {
    id: "sch-8",
    type: "class",
    code: "PREIELTS_K0126_Ca2PM1",
    courseName: "Pre-Ielts",
    shiftName: "Ca 2",
    dayOfWeekIndex: 3,
    dayDate: "2026-10-22",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM1",
    teacher: "Cô Mai Anh",
    capacity: 25,
    enrolled: 20,
    isConflict: false,
  },
  {
    id: "sch-9",
    type: "class",
    code: "IC3_K0126_Ca2PM2",
    courseName: "Chứng chỉ IC3 - GS6",
    shiftName: "Ca 2",
    dayOfWeekIndex: 3,
    dayDate: "2026-10-22",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM2",
    teacher: "Thầy Tuấn",
    capacity: 40,
    enrolled: 15,
    isConflict: false,
  },

  // Thứ 6 (23/10/2026)
  {
    id: "sch-10",
    type: "class",
    code: "UDCNTTCB_K0126_Ca1PM1",
    courseName: "Ứng dụng CNTT Cơ bản",
    shiftName: "Ca 1",
    dayOfWeekIndex: 4,
    dayDate: "2026-10-23",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM1",
    teacher: "Thầy Tuấn",
    capacity: 20,
    enrolled: 18,
    isConflict: false,
  },
  {
    id: "sch-11",
    type: "class",
    code: "UDCNTTCB_K0126_Ca1PM2",
    courseName: "Ứng dụng CNTT Cơ bản",
    shiftName: "Ca 1",
    dayOfWeekIndex: 4,
    dayDate: "2026-10-23",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM2",
    teacher: "Thầy Nam",
    capacity: 20,
    enrolled: 18,
    isConflict: false,
  },

  // Thứ 7 (24/10/2026)
  {
    id: "sch-12",
    type: "class",
    code: "UDCNTTNC_K0126_Ca3PM1",
    courseName: "Ứng dụng CNTT Nâng cao",
    shiftName: "Ca 3",
    dayOfWeekIndex: 5,
    dayDate: "2026-10-24",
    startTime: "07:30",
    endTime: "10:30",
    startHour: 7.5,
    durationHours: 3.0,
    room: "PM1",
    teacher: "Thầy Tuấn",
    capacity: 25,
    enrolled: 22,
    isConflict: false,
  },
  {
    id: "sch-13",
    type: "exam",
    code: "THI_UDCNTT_2410",
    courseName: "Kỳ thi Chứng chỉ CNTT Cơ bản K0126",
    dayOfWeekIndex: 5,
    dayDate: "2026-10-24",
    startTime: "08:00",
    endTime: "10:30",
    startHour: 8.0,
    durationHours: 2.5,
    room: "PM2",
    candidates: 24,
    isConflict: false,
  },
  {
    id: "sch-14",
    type: "class",
    code: "TAGT_K0226_Ca4PM1",
    courseName: "Tiếng Anh giao tiếp",
    shiftName: "Ca 4",
    dayOfWeekIndex: 5,
    dayDate: "2026-10-24",
    startTime: "13:30",
    endTime: "16:30",
    startHour: 13.5,
    durationHours: 3.0,
    room: "PM1",
    teacher: "Cô Mai Anh",
    capacity: 25,
    enrolled: 19,
    isConflict: false,
  },
  {
    id: "sch-15",
    type: "class",
    code: "IC3_K0126_Ca2PM2",
    courseName: "Chứng chỉ IC3 - GS6",
    shiftName: "Ca 2",
    dayOfWeekIndex: 5,
    dayDate: "2026-10-24",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM2",
    teacher: "Thầy Tuấn",
    capacity: 40,
    enrolled: 15,
    isConflict: true,
    conflictType: "teacher",
    conflictReason: "Thầy Tuấn đã được phân dạy lớp UDCNTTNC_K0226_Ca2PM1 cùng ca 18:30 - 20:30",
    conflictsWithCode: "UDCNTTNC_K0226_Ca2PM1",
  },
  {
    id: "sch-16",
    type: "class",
    code: "UDCNTTNC_K0226_Ca2PM1",
    courseName: "Ứng dụng CNTT Nâng cao",
    shiftName: "Ca 2",
    dayOfWeekIndex: 5,
    dayDate: "2026-10-24",
    startTime: "18:30",
    endTime: "20:30",
    startHour: 18.5,
    durationHours: 2.0,
    room: "PM1",
    teacher: "Thầy Tuấn",
    capacity: 25,
    enrolled: 16,
    isConflict: true,
    conflictType: "teacher",
    conflictReason: "Thầy Tuấn đã được phân dạy lớp IC3_K0126_Ca2PM2 cùng ca 18:30 - 20:30",
    conflictsWithCode: "IC3_K0126_Ca2PM2",
  },

  // Chủ nhật (25/10/2026)
  {
    id: "sch-17",
    type: "class",
    code: "UDCNTTNC_K0126_Ca3PM1",
    courseName: "Ứng dụng CNTT Nâng cao",
    shiftName: "Ca 3",
    dayOfWeekIndex: 6,
    dayDate: "2026-10-25",
    startTime: "07:30",
    endTime: "10:30",
    startHour: 7.5,
    durationHours: 3.0,
    room: "PM1",
    teacher: "Thầy Tuấn",
    capacity: 25,
    enrolled: 22,
    isConflict: false,
  },
  {
    id: "sch-18",
    type: "class",
    code: "TAGT_K0226_Ca4PM1",
    courseName: "Tiếng Anh giao tiếp",
    shiftName: "Ca 4",
    dayOfWeekIndex: 6,
    dayDate: "2026-10-25",
    startTime: "13:30",
    endTime: "16:30",
    startHour: 13.5,
    durationHours: 3.0,
    room: "PM1",
    teacher: "Cô Mai Anh",
    capacity: 25,
    enrolled: 19,
    isConflict: false,
  },
  {
    id: "sch-19",
    type: "exam",
    code: "THI_IC3_2510",
    courseName: "Kỳ thi Chứng chỉ IC3 - GS6 Quốc tế",
    dayOfWeekIndex: 6,
    dayDate: "2026-10-25",
    startTime: "14:00",
    endTime: "16:30",
    startHour: 14.0,
    durationHours: 2.5,
    room: "PM2",
    candidates: 16,
    isConflict: false,
  },
]

type GroupViewMode = "ca_hoc" | "phong" | "giao_vien"

export const Schedule: React.FC = () => {
  const navigate = useNavigate()

  // Tuần hiện tại: mốc chuẩn 19/10/2026 (Thứ 2)
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(
    new Date(2026, 9, 19) // Tháng 10 = index 9 trong JS Date
  )

  // Chế độ nhóm lịch: Ca học, Phòng, Giáo viên
  const [viewMode, setViewMode] = useState<GroupViewMode>("ca_hoc")

  // Bộ lọc phụ khi chọn xem theo Phòng hoặc Giáo viên
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>("all")
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("all")

  // Mobile: Ngày đang được chọn trong dải ngang (0 = Thứ 2 .. 6 = Chủ nhật)
  const [selectedMobileDayIndex, setSelectedMobileDayIndex] = useState<number>(0)

  // Sự kiện đang mở xem chi tiết (modal)
  const [activeItem, setActiveItem] = useState<ScheduleItem | null>(null)

  // ID khối đang được highlight khi bấm "Nhảy tới chỗ trùng"
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const conflictCursorRef = useRef<number>(0)

  // Tính chuỗi hiển thị tuần "19/10 - 25/10/2026"
  const weekLabel = useMemo(() => {
    const monday = new Date(currentWeekMonday)
    const sunday = new Date(currentWeekMonday)
    sunday.setDate(monday.getDate() + 6)

    const d1 = String(monday.getDate()).padStart(2, "0")
    const m1 = String(monday.getMonth() + 1).padStart(2, "0")
    const d2 = String(sunday.getDate()).padStart(2, "0")
    const m2 = String(sunday.getMonth() + 1).padStart(2, "0")
    const y2 = sunday.getFullYear()

    return `${d1}/${m1} - ${d2}/${m2}/${y2}`
  }, [currentWeekMonday])

  // Danh sách các ngày trong tuần (Date objects)
  const weekDates = useMemo(() => {
    return WEEK_DAYS.map((day, idx) => {
      const d = new Date(currentWeekMonday)
      d.setDate(currentWeekMonday.getDate() + idx)
      return {
        ...day,
        date: d,
        dateStr: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
        dayNum: d.getDate(),
      }
    })
  }, [currentWeekMonday])

  // Điều hướng tuần
  const handlePrevWeek = () => {
    setCurrentWeekMonday((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() - 7)
      return next
    })
  }

  const handleNextWeek = () => {
    setCurrentWeekMonday((prev) => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + 7)
      return next
    })
  }

  const handleToday = () => {
    // Trở về tuần chuẩn 19/10/2026 theo bối cảnh trung tâm
    setCurrentWeekMonday(new Date(2026, 9, 19))
    setSelectedMobileDayIndex(0)
  }

  // Danh sách xung đột trong tuần hiện tại
  const conflictsList = useMemo(() => {
    return SAMPLE_SCHEDULE.filter((item) => item.isConflict)
  }, [])

  // Lọc sự kiện theo bộ lọc hiện hành
  const filteredEvents = useMemo(() => {
    return SAMPLE_SCHEDULE.filter((item) => {
      if (viewMode === "phong" && selectedRoomFilter !== "all") {
        if (item.room !== selectedRoomFilter) return false
      }
      if (viewMode === "giao_vien" && selectedTeacherFilter !== "all") {
        if (item.teacher !== selectedTeacherFilter) return false
      }
      return true
    })
  }, [viewMode, selectedRoomFilter, selectedTeacherFilter])

  // Sự kiện theo ngày cho Mobile View
  const mobileDayEvents = useMemo(() => {
    return filteredEvents
      .filter((item) => item.dayOfWeekIndex === selectedMobileDayIndex)
      .sort((a, b) => a.startHour - b.startHour)
  }, [filteredEvents, selectedMobileDayIndex])

  // Đếm sự kiện theo từng ngày để hiển thị trên thanh chọn mobile
  const eventsCountByDay = useMemo(() => {
    const counts: { [key: number]: { total: number; hasConflict: boolean; exams: number } } = {}
    for (let i = 0; i < 7; i++) {
      counts[i] = { total: 0, hasConflict: false, exams: 0 }
    }
    SAMPLE_SCHEDULE.forEach((item) => {
      if (counts[item.dayOfWeekIndex]) {
        counts[item.dayOfWeekIndex].total++
        if (item.isConflict) counts[item.dayOfWeekIndex].hasConflict = true
        if (item.type === "exam") counts[item.dayOfWeekIndex].exams++
      }
    })
    return counts
  }, [])

  // Xử lý nút bấm "Nhảy tới chỗ trùng"
  const handleJumpToConflict = () => {
    if (conflictsList.length === 0) return

    // Xoay vòng giữa các điểm xung đột (Conflict 1: Thứ 2, Conflict 2: Thứ 7)
    const targetConflict = conflictsList[conflictCursorRef.current % conflictsList.length]
    conflictCursorRef.current++

    // Đổi ngày trên mobile
    setSelectedMobileDayIndex(targetConflict.dayOfWeekIndex)

    // Bật hiệu ứng highlight viền đỏ nhấp nháy trong 3.5 giây
    setHighlightedId(targetConflict.id)
    setTimeout(() => {
      setHighlightedId(null)
    }, 3500)

    // Cuộn tới khối xung đột
    setTimeout(() => {
      const el = document.getElementById(`schedule-block-${targetConflict.id}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
      }
    }, 100)
  }

  // Chiều cao mỗi khoảng giờ trên Desktop grid (56px)
  const HOUR_HEIGHT = 56
  const GRID_START_HOUR = 7 // 07:00

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* 1. Header & Điều hướng tuần */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#DFE4EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-22 font-semibold text-[#131B2E] tracking-tight">
              Lịch học & thi
            </h1>
            <Badge variant="neutral" className="text-[11px] font-medium px-2 py-0.5">
              4 ca học cố định
            </Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Xem lịch giảng dạy các phòng máy và các kỳ thi theo tuần
          </p>
        </div>

        {/* Thanh điều hướng tuần */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 text-xs font-medium px-2.5"
          >
            Hôm nay
          </Button>

          <div className="flex items-center border border-[#DFE4EC] rounded-[6px] bg-white overflow-hidden">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 text-[#5A6478] hover:text-[#131B2E] hover:bg-[#F4F6FA] transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-xs font-semibold text-[#131B2E] tabular-nums select-none border-x border-[#DFE4EC]">
              {weekLabel}
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 text-[#5A6478] hover:text-[#131B2E] hover:bg-[#F4F6FA] transition-colors"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Banner cảnh báo trùng lịch tuần (Slim banner) */}
      {conflictsList.length > 0 && (
        <div className="bg-[#FBE8E5] border border-[#F5C2BC] rounded-[6px] px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs text-[#B3382C]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#B3382C] shrink-0" />
            <span>
              <strong className="font-semibold">
                {conflictsList.length / 2} chỗ trùng lịch trong tuần này:
              </strong>{" "}
              Trùng phòng PM1 (Thứ 2, 18:30) và trùng Thầy Tuấn (Thứ 7, 18:30).
            </span>
          </div>

          <button
            type="button"
            onClick={handleJumpToConflict}
            className="text-xs font-medium underline underline-offset-2 hover:opacity-80 shrink-0 cursor-pointer flex items-center gap-1"
          >
            Nhảy tới chỗ trùng &rarr;
          </button>
        </div>
      )}

      {/* 3. Thanh điều khiển chế độ xem & Chú thích (Desktop + Mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DFE4EC] rounded-[10px] p-3">
        {/* Toggle Xem theo: Ca học, Phòng, Giáo viên */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#5A6478] font-medium shrink-0">Xem theo:</span>
          <div className="inline-flex rounded-[6px] border border-[#DFE4EC] p-0.5 bg-[#F4F6FA]">
            <button
              type="button"
              onClick={() => {
                setViewMode("ca_hoc")
                setSelectedRoomFilter("all")
                setSelectedTeacherFilter("all")
              }}
              className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                viewMode === "ca_hoc"
                  ? "bg-[#1E40AF] text-white shadow-none"
                  : "text-[#5A6478] hover:text-[#131B2E]"
              }`}
            >
              Ca học
            </button>
            <button
              type="button"
              onClick={() => setViewMode("phong")}
              className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                viewMode === "phong"
                  ? "bg-[#1E40AF] text-white shadow-none"
                  : "text-[#5A6478] hover:text-[#131B2E]"
              }`}
            >
              Phòng
            </button>
            <button
              type="button"
              onClick={() => setViewMode("giao_vien")}
              className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors cursor-pointer ${
                viewMode === "giao_vien"
                  ? "bg-[#1E40AF] text-white shadow-none"
                  : "text-[#5A6478] hover:text-[#131B2E]"
              }`}
            >
              Giáo viên
            </button>
          </div>

          {/* Lọc phòng khi chọn Xem theo: Phòng */}
          {viewMode === "phong" && (
            <div className="flex items-center gap-1 pl-2 border-l border-[#DFE4EC]">
              <span className="text-[11px] text-[#5A6478]">Phòng:</span>
              <button
                type="button"
                onClick={() => setSelectedRoomFilter("all")}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer font-medium ${
                  selectedRoomFilter === "all"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoomFilter("PM1")}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer font-medium ${
                  selectedRoomFilter === "PM1"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                PM1
              </button>
              <button
                type="button"
                onClick={() => setSelectedRoomFilter("PM2")}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer font-medium ${
                  selectedRoomFilter === "PM2"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                PM2
              </button>
            </div>
          )}

          {/* Lọc giáo viên khi chọn Xem theo: Giáo viên */}
          {viewMode === "giao_vien" && (
            <div className="flex items-center gap-1 pl-2 border-l border-[#DFE4EC] flex-wrap">
              <span className="text-[11px] text-[#5A6478]">Giáo viên:</span>
              <button
                type="button"
                onClick={() => setSelectedTeacherFilter("all")}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer font-medium ${
                  selectedTeacherFilter === "all"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeacherFilter("Thầy Tuấn")}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer font-medium ${
                  selectedTeacherFilter === "Thầy Tuấn"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Thầy Tuấn
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeacherFilter("Cô Mai Anh")}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer font-medium ${
                  selectedTeacherFilter === "Cô Mai Anh"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Cô Mai Anh
              </button>
              <button
                type="button"
                onClick={() => setSelectedTeacherFilter("Thầy Nam")}
                className={`text-[11px] px-2 py-0.5 rounded-[4px] cursor-pointer font-medium ${
                  selectedTeacherFilter === "Thầy Nam"
                    ? "bg-[#1E40AF] text-white"
                    : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                Thầy Nam
              </button>
            </div>
          )}
        </div>

        {/* Chú thích màu theo thiết kế (Legend) */}
        <div className="flex items-center gap-3 text-[11px] text-[#5A6478] shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#E7EDFB] border border-[#BFDBFE] inline-block" />
            <span>Lớp bình thường</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-[#FBE8E5] border border-[#B3382C] inline-block" />
            <span className="text-[#B3382C] font-medium">Trùng lịch</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-[3px] bg-white border-2 border-dashed border-[#1E40AF] inline-block" />
            <span>Kỳ thi</span>
          </div>
        </div>
      </div>

      {/* 4. GIAO DIỆN DESKTOP (Lưới tuần từ 07:00 đến 21:00) */}
      <div className="hidden lg:block bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[980px]">
            {/* Header các ngày trong tuần */}
            <div className="grid grid-cols-[68px_repeat(7,1fr)] border-b border-[#DFE4EC] bg-[#F4F6FA] sticky top-0 z-20">
              <div className="py-2.5 px-2 text-center text-[11px] font-semibold text-[#5A6478] border-r border-[#DFE4EC] flex items-center justify-center">
                Giờ
              </div>
              {weekDates.map((day) => {
                const dayCounts = eventsCountByDay[day.dayIndex]
                return (
                  <div
                    key={day.dayIndex}
                    className="py-2.5 px-2 text-center border-r last:border-r-0 border-[#DFE4EC]"
                  >
                    <div className="text-xs font-semibold text-[#131B2E] flex items-center justify-center gap-1">
                      <span>{day.label}</span>
                      {dayCounts?.hasConflict && (
                        <span className="w-2 h-2 rounded-full bg-[#B3382C]" title="Có xung đột lịch" />
                      )}
                    </div>
                    <div className="text-[11px] text-[#5A6478] tabular-nums mt-0.5">
                      {day.dateStr}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Thân lưới lịch: 14 khoảng giờ (07:00 -> 21:00) */}
            <div className="relative grid grid-cols-[68px_repeat(7,1fr)]">
              {/* Cột hiển thị mốc giờ */}
              <div className="border-r border-[#DFE4EC] bg-[#F4F6FA]/50 select-none">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="border-b border-[#DFE4EC] text-right pr-2 pt-1 text-[11px] font-medium text-[#5A6478] tabular-nums"
                  >
                    {String(hour).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {/* 7 Cột nội dung tương ứng 7 ngày */}
              {weekDates.map((day) => {
                // Lấy tất cả sự kiện của ngày này
                const dayEvents = filteredEvents.filter(
                  (item) => item.dayOfWeekIndex === day.dayIndex
                )

                // Nhóm các sự kiện trùng hoặc cùng ca giờ để chia cột con ngang
                // Tính toán vị trí overlap
                const timeSlotGroups: { [slotKey: string]: ScheduleItem[] } = {}
                dayEvents.forEach((ev) => {
                  const key = `${ev.startHour}-${ev.durationHours}`
                  if (!timeSlotGroups[key]) timeSlotGroups[key] = []
                  timeSlotGroups[key].push(ev)
                })

                return (
                  <div
                    key={day.dayIndex}
                    className="relative border-r last:border-r-0 border-[#DFE4EC] bg-white"
                  >
                    {/* Các đường kẻ ngang mỗi giờ */}
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        style={{ height: `${HOUR_HEIGHT}px` }}
                        className="border-b border-[#DFE4EC]/60 pointer-events-none"
                      />
                    ))}

                    {/* Vùng chỉ định ca học chuẩn mờ mờ để định hình 4 ca của trung tâm */}
                    {/* Ca 3 (Thứ 7 & CN, 07:30 - 10:30) */}
                    {(day.dayIndex === 5 || day.dayIndex === 6) && (
                      <div
                        className="absolute left-0 right-0 pointer-events-none bg-blue-50/20 border-y border-dashed border-blue-200/50"
                        style={{
                          top: `${(7.5 - GRID_START_HOUR) * HOUR_HEIGHT}px`,
                          height: `${3 * HOUR_HEIGHT}px`,
                        }}
                      />
                    )}

                    {/* Ca 4 (Thứ 7 & CN, 13:30 - 16:30) */}
                    {(day.dayIndex === 5 || day.dayIndex === 6) && (
                      <div
                        className="absolute left-0 right-0 pointer-events-none bg-blue-50/20 border-y border-dashed border-blue-200/50"
                        style={{
                          top: `${(13.5 - GRID_START_HOUR) * HOUR_HEIGHT}px`,
                          height: `${3 * HOUR_HEIGHT}px`,
                        }}
                      />
                    )}

                    {/* Ca 1 hoặc Ca 2 (Tối 18:30 - 20:30) */}
                    <div
                      className="absolute left-0 right-0 pointer-events-none bg-slate-50/40 border-y border-dashed border-slate-200/60"
                      style={{
                        top: `${(18.5 - GRID_START_HOUR) * HOUR_HEIGHT}px`,
                        height: `${2 * HOUR_HEIGHT}px`,
                      }}
                    />

                    {/* Render các khối sự kiện */}
                    {dayEvents.map((item) => {
                      const topOffset = (item.startHour - GRID_START_HOUR) * HOUR_HEIGHT
                      const blockHeight = item.durationHours * HOUR_HEIGHT

                      // Xác định vị trí phân chia chiều ngang khi có nhiều lớp cùng giờ
                      const groupKey = `${item.startHour}-${item.durationHours}`
                      const siblings = timeSlotGroups[groupKey] || [item]
                      const totalSiblings = siblings.length
                      const siblingIndex = siblings.findIndex((s) => s.id === item.id)

                      const widthPercent = 100 / totalSiblings
                      const leftPercent = siblingIndex * widthPercent

                      const isHighlighted = highlightedId === item.id

                      // Render Khối Kỳ Thi
                      if (item.type === "exam") {
                        return (
                          <div
                            key={item.id}
                            id={`schedule-block-${item.id}`}
                            onClick={() => setActiveItem(item)}
                            style={{
                              top: `${topOffset + 2}px`,
                              height: `${blockHeight - 4}px`,
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            className={`absolute p-2 rounded-[6px] border-2 border-dashed border-[#1E40AF] bg-white cursor-pointer transition-all hover:shadow-sm overflow-hidden z-10 ${
                              isHighlighted ? "ring-4 ring-[#1E40AF] ring-offset-2 animate-pulse" : ""
                            }`}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <span className="bg-[#1E40AF] text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0">
                                Thi
                              </span>
                              <span className="text-[10px] font-semibold text-[#131B2E] truncate">
                                {item.room}
                              </span>
                            </div>

                            <div className="text-[11px] font-bold text-[#131B2E] line-clamp-2 leading-snug">
                              {item.courseName}
                            </div>

                            <div className="text-[10px] text-[#5A6478] mt-1 tabular-nums flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{item.startTime} - {item.endTime}</span>
                            </div>

                            <div className="text-[10px] font-semibold text-[#1E40AF] mt-0.5">
                              {item.candidates} thí sinh
                            </div>
                          </div>
                        )
                      }

                      // Render Khối Lớp Học (Normal: accent-soft; Conflict: danger-tint)
                      return (
                        <div
                          key={item.id}
                          id={`schedule-block-${item.id}`}
                          onClick={() => setActiveItem(item)}
                          style={{
                            top: `${topOffset + 2}px`,
                            height: `${blockHeight - 4}px`,
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                          }}
                          className={`absolute p-1.5 sm:p-2 rounded-[6px] cursor-pointer transition-all overflow-hidden z-10 flex flex-col justify-between ${
                            item.isConflict
                              ? "bg-[#FBE8E5] text-[#B3382C] border-2 border-[#B3382C] hover:bg-[#F8D7D3]"
                              : "bg-[#E7EDFB] text-[#1E40AF] border border-[#BFDBFE] hover:bg-[#DCE6F8]"
                          } ${
                            isHighlighted ? "ring-4 ring-[#B3382C] ring-offset-2 animate-pulse z-30" : ""
                          }`}
                        >
                          <div>
                            {/* Header mã lớp & tag xung đột */}
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <span
                                className={`text-[11px] font-bold tabular-nums truncate ${
                                  item.isConflict ? "text-[#B3382C]" : "text-[#1E40AF]"
                                }`}
                              >
                                {item.code}
                              </span>

                              {item.isConflict && (
                                <span className="bg-[#B3382C] text-white text-[8px] font-bold px-1 py-0.2 rounded shrink-0">
                                  TRÙNG
                                </span>
                              )}
                            </div>

                            {/* Tên môn học */}
                            <div
                              className={`text-[10px] font-medium truncate ${
                                item.isConflict ? "text-[#B3382C]/90" : "text-[#1E40AF]/90"
                              }`}
                            >
                              {item.courseName}
                            </div>
                          </div>

                          {/* Thông tin chân thẻ: Giáo viên & Phòng & Giờ */}
                          <div className="mt-1 pt-1 border-t border-current/15 text-[10px] leading-tight">
                            <div className="flex items-center justify-between gap-1 font-semibold truncate">
                              <span>{item.teacher}</span>
                              <span className="font-bold underline uppercase">{item.room}</span>
                            </div>
                            <div className="tabular-nums opacity-85 mt-0.5">
                              {item.startTime} - {item.endTime}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. GIAO DIỆN MOBILE (< 1024px) */}
      <div className="block lg:hidden space-y-3">
        {/* Thanh chọn ngày (Dải ngang Thứ 2 ... Chủ nhật) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {weekDates.map((day) => {
            const isSelected = selectedMobileDayIndex === day.dayIndex
            const dayStats = eventsCountByDay[day.dayIndex]

            return (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => setSelectedMobileDayIndex(day.dayIndex)}
                className={`flex-1 min-w-[58px] py-2 px-1.5 rounded-[8px] text-center border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                    : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#F4F6FA]"
                }`}
              >
                <div
                  className={`text-[11px] font-medium leading-none ${
                    isSelected ? "text-blue-100" : "text-[#5A6478]"
                  }`}
                >
                  {day.short}
                </div>
                <div className="text-base font-bold tabular-nums mt-1 leading-none">
                  {day.dayNum}
                </div>

                {/* Chấm báo trạng thái */}
                <div className="flex items-center justify-center gap-1 mt-1.5 h-1.5">
                  {dayStats?.hasConflict ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B3382C]" />
                  ) : dayStats?.total > 0 ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-[#1E40AF]"
                      }`}
                    />
                  ) : (
                    <span className="w-1.5 h-1.5" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Tiêu đề ngày được chọn */}
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-semibold text-[#131B2E]">
            {weekDates[selectedMobileDayIndex]?.label},{" "}
            {weekDates[selectedMobileDayIndex]?.dateStr}/2026
          </span>
          <span className="text-xs text-[#5A6478]">
            {mobileDayEvents.length} lịch học & thi
          </span>
        </div>

        {/* Timeline dọc các lớp học và kỳ thi trong ngày */}
        {mobileDayEvents.length === 0 ? (
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-8 text-center text-xs text-[#5A6478]">
            Không có lớp học hoặc lịch thi trong ngày này.
          </div>
        ) : (
          <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#DFE4EC]">
            {mobileDayEvents.map((item) => {
              const isHighlighted = highlightedId === item.id

              // Render Kỳ Thi trên Mobile
              if (item.type === "exam") {
                return (
                  <div key={item.id} className="relative">
                    {/* Nút mốc thời gian trên timeline */}
                    <span className="absolute -left-6 top-4 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1E40AF] -translate-x-[5px]" />

                    <div
                      id={`schedule-block-${item.id}`}
                      onClick={() => setActiveItem(item)}
                      className={`bg-white border-2 border-dashed border-[#1E40AF] rounded-[8px] p-3.5 transition-all cursor-pointer ${
                        isHighlighted ? "ring-4 ring-[#1E40AF] ring-offset-1" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-[#1E40AF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Thi
                          </span>
                          <span className="text-xs font-semibold text-[#131B2E]">
                            Phòng {item.room}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#1E40AF] tabular-nums">
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-[#131B2E]">
                        {item.courseName}
                      </h4>

                      <div className="flex items-center justify-between text-xs text-[#5A6478] mt-2 pt-2 border-t border-[#DFE4EC]">
                        <span>Quy mô: {item.candidates} thí sinh</span>
                        <span className="text-[#1E40AF] font-medium flex items-center gap-1">
                          Xem chi tiết &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }

              // Render Lớp Học trên Mobile
              return (
                <div key={item.id} className="relative">
                  {/* Nút mốc thời gian trên timeline */}
                  <span
                    className={`absolute -left-6 top-4 w-3.5 h-3.5 rounded-full -translate-x-[5px] ${
                      item.isConflict
                        ? "bg-[#B3382C] border-2 border-white"
                        : "bg-[#1E40AF] border-2 border-white"
                    }`}
                  />

                  <div
                    id={`schedule-block-${item.id}`}
                    onClick={() => setActiveItem(item)}
                    className={`rounded-[8px] p-3.5 transition-all cursor-pointer ${
                      item.isConflict
                        ? "bg-[#FBE8E5] text-[#B3382C] border-2 border-[#B3382C]"
                        : "bg-[#E7EDFB] text-[#1E40AF] border border-[#BFDBFE]"
                    } ${isHighlighted ? "ring-4 ring-[#B3382C] ring-offset-1" : ""}`}
                  >
                    {/* Header: Giờ & Ca */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold tabular-nums">
                          {item.startTime} - {item.endTime}
                        </span>
                        {item.shiftName && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 font-medium">
                            {item.shiftName}
                          </span>
                        )}
                      </div>

                      {item.isConflict && (
                        <span className="bg-[#B3382C] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Trùng lịch
                        </span>
                      )}
                    </div>

                    {/* Mã lớp & Tên khóa học */}
                    <div className="text-sm font-bold tracking-tight">{item.code}</div>
                    <div className="text-xs font-medium opacity-90">{item.courseName}</div>

                    {/* Cảnh báo xung đột nếu có */}
                    {item.isConflict && item.conflictReason && (
                      <div className="mt-2 p-2 bg-white/70 border border-[#B3382C]/30 rounded-[4px] text-[11px] font-medium leading-snug">
                        ⚠️ {item.conflictReason}
                      </div>
                    )}

                    {/* Footer: Giáo viên & Phòng & Sĩ số */}
                    <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-current/15">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.teacher}</span>
                        <span>•</span>
                        <span className="font-bold underline">Phòng {item.room}</span>
                      </div>
                      <span className="tabular-nums font-medium">
                        {item.enrolled}/{item.capacity} HV
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 6. MODAL CHI TIẾT SỰ KIỆN KHI BẤM VÀO KHỐI LỊCH */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-[#DFE4EC] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      activeItem.type === "exam"
                        ? "bg-[#1E40AF] text-white"
                        : activeItem.isConflict
                        ? "bg-[#B3382C] text-white"
                        : "bg-[#E7EDFB] text-[#1E40AF]"
                    }`}
                  >
                    {activeItem.type === "exam" ? "Kỳ thi" : "Lớp học"}
                  </span>
                  <span className="text-xs text-[#5A6478]">
                    {WEEK_DAYS[activeItem.dayOfWeekIndex]?.label},{" "}
                    {activeItem.dayDate.split("-").reverse().join("/")}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#131B2E] mt-1">
                  {activeItem.code}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px] hover:bg-[#F4F6FA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cảnh báo xung đột nếu có */}
            {activeItem.isConflict && (
              <div className="bg-[#FBE8E5] border border-[#F5C2BC] rounded-[6px] p-3 text-xs text-[#B3382C] space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#B3382C]" />
                  <span>Cảnh báo xung đột lịch:</span>
                </div>
                <p className="leading-relaxed pl-5.5">{activeItem.conflictReason}</p>
                <p className="text-[11px] text-[#B3382C]/80 pl-5.5 italic">
                  Khuyến nghị: Chọn phòng máy khác hoặc đổi giáo viên phụ trách trong màn hình Lớp học.
                </p>
              </div>
            )}

            {/* Chi tiết nội dung */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Khóa học / Môn:</span>
                <span className="font-semibold text-[#131B2E] text-right">
                  {activeItem.courseName}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Thời gian:
                </span>
                <span className="font-semibold text-[#131B2E] tabular-nums">
                  {activeItem.startTime} - {activeItem.endTime}{" "}
                  {activeItem.shiftName && `(${activeItem.shiftName})`}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Phòng máy:
                </span>
                <span className="font-bold text-[#131B2E]">Phòng {activeItem.room}</span>
              </div>

              {activeItem.teacher && (
                <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                  <span className="text-[#5A6478] flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Giáo viên:
                  </span>
                  <span className="font-semibold text-[#131B2E]">
                    {activeItem.teacher}
                  </span>
                </div>
              )}

              {activeItem.enrolled !== undefined && (
                <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                  <span className="text-[#5A6478] flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Sĩ số:
                  </span>
                  <span className="font-semibold text-[#131B2E] tabular-nums">
                    {activeItem.enrolled} / {activeItem.capacity} học viên
                  </span>
                </div>
              )}

              {activeItem.candidates !== undefined && (
                <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                  <span className="text-[#5A6478]">Thí sinh đăng ký:</span>
                  <span className="font-semibold text-[#1E40AF] tabular-nums">
                    {activeItem.candidates} thí sinh
                  </span>
                </div>
              )}
            </div>

            {/* Nút hành động */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE4EC]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveItem(null)}
                className="h-8 text-xs"
              >
                Đóng
              </Button>

              {activeItem.type === "class" ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveItem(null)
                    navigate("/lop-hoc")
                  }}
                  className="h-8 text-xs font-medium flex items-center gap-1"
                >
                  <span>Xem lớp học</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveItem(null)
                    navigate("/ky-thi")
                  }}
                  className="h-8 text-xs font-medium flex items-center gap-1"
                >
                  <span>Xem kỳ thi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Thông tin phụ trợ về 4 ca học của trung tâm (Chân trang) */}
      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 text-xs text-[#5A6478] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#1E40AF] shrink-0" />
          <span className="font-semibold text-[#131B2E]">Quy chuẩn 4 ca học:</span>
          <span>Ca 1 (T2-4-6 18:30-20:30)</span>
          <span className="text-[#DFE4EC]">|</span>
          <span>Ca 2 (T3-5-7 18:30-20:30)</span>
          <span className="text-[#DFE4EC]">|</span>
          <span>Ca 3 (T7 & CN 07:30-10:30)</span>
          <span className="text-[#DFE4EC]">|</span>
          <span>Ca 4 (T7 & CN 13:30-16:30)</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#5A6478]">
          <HelpCircle className="w-3.5 h-3.5 text-[#5A6478]" />
          <span>Sĩ số tối đa mặc định: 40 học viên/lớp</span>
        </div>
      </div>
    </div>
  )
}
