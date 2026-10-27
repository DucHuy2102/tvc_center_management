import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import { ChevronRight, Clock, CalendarDays } from "lucide-react"

// Hàm lấy tên Thứ tiếng Việt cho ngày
function getVietnameseWeekday(date: Date): string {
  const days = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
  return days[date.getDay()]
}

// Ngày hôm nay
const CURRENT_DATE = new Date()
const TODAY_FORMATTED = `${getVietnameseWeekday(CURRENT_DATE)}, ${String(CURRENT_DATE.getDate()).padStart(2, "0")}/${String(CURRENT_DATE.getMonth() + 1).padStart(2, "0")}/${CURRENT_DATE.getFullYear()}`

export const Dashboard: React.FC = () => {
  const { profile, user, isOwner } = useAuth()
  const navigate = useNavigate()

  // Dữ liệu bộ đếm "Cần xử lý hôm nay"
  const [counts, setCounts] = useState({
    debt_count: 5,
    overdue_count: 2,
    need_refund_count: 1,
    waiting_class_count: 6,
    missing_dossier_count: 8,
    not_contacted_count: 3,
    exams_next_7_days: 2,
    awaiting_certificate_count: 4,
  })

  // Dữ liệu chỉ số tóm tắt (Summary Strip)
  const [summary] = useState({
    activeStudents: 312,
    newRegistrationsThisMonth: 28,
    totalDebt: 48200000,
    revenueThisMonth: 126500000,
  })

  const todayFormatted = TODAY_FORMATTED
  
  // Tên hiển thị người dùng (ưu tiên tên riêng, fallback "Linh")
  const displayName = profile?.full_name?.split(" ").slice(-1)[0] || user?.email?.split("@")[0] || "Linh"

  // Tải dữ liệu từ hàm RPC dashboard_counts nếu đã cấu hình Supabase
  useEffect(() => {
    if (!isSupabaseConfigured) return

    const fetchDashboardCounts = async () => {
      try {
        const { data, error } = await supabase.rpc("dashboard_counts")
        if (!error && data) {
          setCounts((prev) => ({
            ...prev,
            debt_count: data.debt_count ?? prev.debt_count,
            overdue_count: data.overdue_count ?? prev.overdue_count,
            waiting_class_count: data.waiting_class_count ?? prev.waiting_class_count,
            missing_dossier_count: data.missing_dossier_count ?? prev.missing_dossier_count,
            not_contacted_count: data.not_contacted_count ?? prev.not_contacted_count,
            exams_next_7_days: data.exams_next_7_days ?? prev.exams_next_7_days,
            need_refund_count: data.need_refund_count ?? prev.need_refund_count,
            awaiting_certificate_count: data.awaiting_certificate_count ?? prev.awaiting_certificate_count,
          }))
        }
      } catch (err) {
        console.warn("Không thể tải dashboard_counts từ database, dùng dữ liệu mẫu chuẩn:", err)
      }
    }

    fetchDashboardCounts()
  }, [])

  // Danh sách các việc cần xử lý
  const actionItems = [
    {
      id: "debt",
      label: "học viên còn nợ học phí",
      count: counts.debt_count,
      chipVariant: "warning" as const,
      onClick: () => navigate("/hoc-phi?status=con_no"),
      ownerOnly: false,
    },
    {
      id: "overdue",
      label: "học viên quá hẹn đóng nốt",
      count: counts.overdue_count,
      chipVariant: "danger" as const,
      onClick: () => navigate("/hoc-phi?status=qua_han"),
      ownerOnly: false,
    },
    {
      id: "refund",
      label: "học viên thu dư cần hoàn tiền",
      count: counts.need_refund_count,
      chipVariant: "danger" as const,
      onClick: () => navigate("/hoc-phi?status=hoan_tien"),
      ownerOnly: true,
    },
    {
      id: "waiting_class",
      label: "học viên chờ xếp lớp",
      count: counts.waiting_class_count,
      chipVariant: "neutral" as const,
      onClick: () => navigate("/hoc-vien?status=cho_xep_lop"),
      ownerOnly: false,
    },
    {
      id: "missing_dossier",
      label: "học viên thiếu hồ sơ",
      count: counts.missing_dossier_count,
      chipVariant: "neutral" as const,
      onClick: () => navigate("/hoc-vien?dossier=thieu"),
      ownerOnly: false,
    },
    {
      id: "not_contacted",
      label: "học viên chưa liên hệ Zalo",
      count: counts.not_contacted_count,
      chipVariant: "neutral" as const,
      onClick: () => navigate("/hoc-vien?contact=chua_lien_he"),
      ownerOnly: false,
    },
    {
      id: "exams",
      label: "kỳ thi trong 7 ngày tới",
      count: counts.exams_next_7_days,
      chipVariant: "neutral" as const,
      onClick: () => navigate("/ky-thi?range=7_days"),
      ownerOnly: false,
    },
    {
      id: "awaiting_cert",
      label: "học viên đã thi đậu, chờ cấp bằng",
      count: counts.awaiting_certificate_count,
      chipVariant: "neutral" as const,
      onClick: () => navigate("/cap-bang?status=chua_cap"),
      ownerOnly: true,
    },
  ].filter((item) => !item.ownerOnly || isOwner)

  // Danh sách lịch học hôm nay (sorted by time)
  const todayClasses = [
    {
      time: "18:30",
      subject: "Tiếng Anh giao tiếp",
      code: "TAGT_K0126",
      shift: "Ca 1",
      teacher: "Cô Mai Anh",
      room: "PM1",
      isCurrent: true, // Lớp hiện tại được highlight accent-soft
    },
    {
      time: "18:30",
      subject: "Ứng dụng CNTT Cơ bản",
      code: "UDCNTTCB_K0126_Ca1PM1",
      shift: "Ca 1",
      teacher: "Thầy Tuấn",
      room: "PM1",
      isCurrent: false,
    },
    {
      time: "19:30",
      subject: "Luyện thi IELTS 5.0 - 6.5",
      code: "IELTS_K0226",
      shift: "Ca 1",
      teacher: "Cô Hương",
      room: "PM2",
      isCurrent: false,
    },
  ]

  // Kỳ thi sắp tới (3 rows)
  const upcomingExams = [
    {
      date: "25/10/2026",
      name: "Chứng chỉ Ứng dụng CNTT Cơ bản K0126",
      candidatesCount: 32,
    },
    {
      date: "01/11/2026",
      name: "Kiểm tra định kỳ Tiếng Anh KET & PET",
      candidatesCount: 18,
    },
    {
      date: "08/11/2026",
      name: "Chứng chỉ Tin học Quốc tế IC3 - GS6",
      candidatesCount: 24,
    },
  ]

  return (
    <div className="p-4 md:p-8 max-w-[1200px] w-full mx-auto space-y-6">
      {/* =========================================================================
          HEADER: Chào buổi sáng & Ngày hôm nay
      ========================================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 pb-2 border-b border-[#DFE4EC]">
        <div>
          <h1 className="text-[22px] leading-[30px] font-semibold text-[#131B2E]">
            Chào buổi sáng, {displayName}
          </h1>
          <p className="text-sm text-[#5A6478] mt-0.5">
            {todayFormatted}
          </p>
        </div>
      </header>

      {/* =========================================================================
          MAIN LAYOUT:
          Mobile: Stack 1 cột theo thứ tự
          Desktop: 2 cột (Trái 2/3: Cần xử lý + Lịch; Phải 1/3: Summary Strip xếp dọc + Kỳ thi)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ==================== CỘT TRÁI (2/3 trên Desktop) ==================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. THE ONE MEMORABLE ELEMENT: Cần xử lý hôm nay */}
          <section className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none">
            <div className="px-4 py-3 border-b border-[#DFE4EC] bg-[#F4F6FA] flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#131B2E] tracking-tight">
                Cần xử lý hôm nay
              </h2>
              <span className="text-xs text-[#5A6478]">
                {actionItems.length} mục
              </span>
            </div>

            <div className="divide-y divide-[#DFE4EC]">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={item.onClick}
                  role="button"
                  tabIndex={0}
                  className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#E7EDFB]/50 transition-colors cursor-pointer select-none group focus-visible:outline-none focus-visible:bg-[#E7EDFB]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge variant={item.chipVariant} className="tabular-nums font-semibold px-2 py-0.5 text-xs">
                      {item.count}
                    </Badge>
                    <span className="text-sm text-[#131B2E] group-hover:text-[#1E40AF] transition-colors truncate">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5A6478] group-hover:text-[#1E40AF] group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              ))}
            </div>
          </section>

          {/* 2. SUMMARY STRIP TRÊN MOBILE (chỉ hiện trên màn hình nhỏ dưới lg) */}
          <div className="block lg:hidden">
            <SummaryStrip isOwner={isOwner} summary={summary} isVertical={false} />
          </div>

          {/* 3. Lịch học hôm nay */}
          <section className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none">
            <div className="px-4 py-3 border-b border-[#DFE4EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1E40AF]" />
                <h2 className="text-sm font-semibold text-[#131B2E]">
                  Lịch học hôm nay
                </h2>
              </div>
              <button
                onClick={() => navigate("/lich")}
                className="text-xs text-[#1E40AF] hover:underline cursor-pointer font-medium"
              >
                Xem lịch tuần
              </button>
            </div>

            <div className="divide-y divide-[#DFE4EC]">
              {todayClasses.map((cls, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                    cls.isCurrent
                      ? "bg-[#E7EDFB] border-l-4 border-l-[#1E40AF]"
                      : "hover:bg-[#F4F6FA]"
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-sm font-semibold text-[#131B2E] tabular-nums shrink-0 w-12">
                      {cls.time}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-[#131B2E]">
                        {cls.subject}
                      </div>
                      <div className="text-xs text-[#5A6478] flex items-center gap-1.5 flex-wrap">
                        <span>{cls.code}</span>
                        <span>&bull;</span>
                        <span>{cls.shift}</span>
                        <span>&bull;</span>
                        <span>Phòng {cls.room}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#5A6478] sm:text-right pl-15 sm:pl-0 font-medium">
                    {cls.teacher}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ==================== CỘT PHẢI (1/3 trên Desktop) ==================== */}
        <div className="space-y-6">
          {/* 4. SUMMARY STRIP TRÊN DESKTOP (Xếp dọc - Stacked vertically) */}
          <div className="hidden lg:block">
            <SummaryStrip isOwner={isOwner} summary={summary} isVertical={true} />
          </div>

          {/* 5. Kỳ thi sắp tới */}
          <section className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none">
            <div className="px-4 py-3 border-b border-[#DFE4EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#1E40AF]" />
                <h2 className="text-sm font-semibold text-[#131B2E]">
                  Kỳ thi sắp tới
                </h2>
              </div>
              <button
                onClick={() => navigate("/ky-thi")}
                className="text-xs text-[#1E40AF] hover:underline cursor-pointer font-medium"
              >
                Tất cả
              </button>
            </div>

            <div className="divide-y divide-[#DFE4EC]">
              {upcomingExams.map((exam, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate("/ky-thi")}
                  className="p-3.5 sm:px-4 sm:py-3 hover:bg-[#E7EDFB]/40 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#1E40AF] tabular-nums">
                      {exam.date}
                    </span>
                    <Badge variant="neutral" className="tabular-nums text-[11px] py-0 px-2 font-normal">
                      {exam.candidatesCount} thí sinh
                    </Badge>
                  </div>
                  <div className="text-sm text-[#131B2E] font-medium leading-snug line-clamp-2">
                    {exam.name}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact Summary Strip (Dải tóm tắt tinh gọn):
 * Không dùng 4 cards riêng biệt mà là 1 strip các con số cách nhau bởi hairline dividers.
 * Trên desktop cột phải: xếp dọc (isVertical = true).
 * Trên mobile: xếp ngang tự co giãn (isVertical = false).
 */
interface SummaryStripProps {
  isOwner: boolean
  summary: {
    activeStudents: number
    newRegistrationsThisMonth: number
    totalDebt: number
    revenueThisMonth: number
  }
  isVertical: boolean
}

const SummaryStrip: React.FC<SummaryStripProps> = ({ isOwner, summary, isVertical }) => {
  return (
    <div
      className={`bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none ${
        isVertical
          ? "divide-y divide-[#DFE4EC]"
          : "grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DFE4EC]"
      }`}
    >
      {/* 1. Đang học */}
      <div className="p-4 flex flex-col justify-center">
        <span className="text-xs text-[#5A6478] font-medium mb-1">
          Đang học
        </span>
        <span className="text-[26px] leading-8 font-semibold text-[#131B2E] tabular-nums">
          {summary.activeStudents}
        </span>
      </div>

      {/* 2. Đăng ký mới tháng này */}
      <div className="p-4 flex flex-col justify-center">
        <span className="text-xs text-[#5A6478] font-medium mb-1">
          Đăng ký mới tháng này
        </span>
        <span className="text-[26px] leading-8 font-semibold text-[#131B2E] tabular-nums">
          {summary.newRegistrationsThisMonth}
        </span>
      </div>

      {/* 3. Còn nợ (Chỉ Chủ) */}
      {isOwner && (
        <div className="p-4 flex flex-col justify-center">
          <span className="text-xs text-[#5A6478] font-medium mb-1">
            Còn nợ
          </span>
          <span className="text-[22px] leading-8 font-semibold text-[#B3382C] tabular-nums">
            {formatCurrency(summary.totalDebt)}
          </span>
        </div>
      )}

      {/* 4. Đã thu tháng này (Chỉ Chủ) */}
      {isOwner && (
        <div className="p-4 flex flex-col justify-center">
          <span className="text-xs text-[#5A6478] font-medium mb-1">
            Đã thu tháng này
          </span>
          <span className="text-[22px] leading-8 font-semibold text-[#1E40AF] tabular-nums">
            {formatCurrency(summary.revenueThisMonth)}
          </span>
        </div>
      )}
    </div>
  )
}
