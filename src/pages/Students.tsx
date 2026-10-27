import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { StudentListItem, ZaloStatus, EnrollmentStatus } from "@/types/database"
import { formatCurrency, formatDate } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  SlidersHorizontal,
  MoreHorizontal,
  X,
  Eye,
  Edit,
  CreditCard,
  Phone,
} from "lucide-react"

const PAGE_SIZE = 25

// Hàm chuẩn hóa tiếng Việt bỏ dấu để tìm kiếm
function normalizeVietnamese(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

// Map nhãn trạng thái Zalo chuẩn
const zaloStatusConfig: Record<ZaloStatus, { label: string; variant: "neutral" | "warning" | "success" | "danger" }> = {
  chua_lien_he: { label: "Chưa liên hệ", variant: "neutral" },
  da_lien_he: { label: "Đã liên hệ", variant: "neutral" },
  da_vao_nhom: { label: "Đã vào nhóm Zalo", variant: "success" },
  khong_tim_thay: { label: "Không tìm thấy Zalo", variant: "danger" },
  chan_tin_nhan: { label: "Chặn tin nhắn", variant: "danger" },
}

// Map nhãn trạng thái ghi danh
const enrollmentStatusConfig: Record<EnrollmentStatus, { label: string; variant: "neutral" | "warning" | "success" | "danger" }> = {
  cho_xep_lop: { label: "Chờ xếp lớp", variant: "neutral" },
  dang_hoc: { label: "Đang học", variant: "success" },
  bao_luu: { label: "Bảo lưu", variant: "warning" },
  da_chuyen_lop: { label: "Đã chuyển lớp", variant: "neutral" },
  da_nghi: { label: "Đã nghỉ", variant: "danger" },
  hoan_thanh: { label: "Hoàn thành", variant: "neutral" },
}

// Dữ liệu mẫu chuẩn thực tế của TVC Center theo prompt
const SAMPLE_STUDENTS: StudentListItem[] = [
  {
    id: "s-1",
    code: "HV26-0001",
    last_name: "Lê Hoàng",
    first_name: "Anh",
    full_name: "Lê Hoàng Anh",
    full_name_search: "le hoang anh",
    gender: "nam",
    date_of_birth: "2005-04-12",
    phone: "0912 345 678",
    zalo_status: "da_vao_nhom",
    dossier_complete: true,
    missing_dossier_items: [],
    organization_name: "CĐ Kỹ thuật Cao Thắng",
    organization_detail: "CNTT K23",
    referrer_name: "Thầy Tuấn",
    active_enrollments: 1,
    total_due: 0,
    needs_refund: false,
    created_at: "2026-10-01T08:30:00Z",
    registered_at: "2026-10-01",
    course_name: "Ứng dụng CNTT Cơ bản",
    class_code: "UDCNTTCB_K0126_Ca1PM1",
    enrollment_status: "dang_hoc",
  },
  {
    id: "s-2",
    code: "HV26-0002",
    last_name: "Phạm Gia",
    first_name: "Bảo",
    full_name: "Phạm Gia Bảo",
    full_name_search: "pham gia bao",
    gender: "nam",
    date_of_birth: "2006-08-20",
    phone: "0988 123 456",
    zalo_status: "da_lien_he",
    dossier_complete: false,
    missing_dossier_items: ["02 hình 3x4"],
    organization_name: "Trung cấp Bách Khoa",
    organization_detail: "Điện tử",
    referrer_name: "Cô Mai Anh",
    active_enrollments: 1,
    total_due: 400000,
    needs_refund: false,
    created_at: "2026-10-05T09:15:00Z",
    registered_at: "2026-10-05",
    course_name: "Tiếng Anh giao tiếp",
    class_code: "TAGT_K0126_Ca1PM1",
    enrollment_status: "dang_hoc",
  },
  {
    id: "s-3",
    code: "HV26-0003",
    last_name: "Nguyễn Thị",
    first_name: "Hà",
    full_name: "Nguyễn Thị Hà",
    full_name_search: "nguyen thi ha",
    gender: "nu",
    date_of_birth: "2004-11-03",
    phone: "0903 888 999",
    zalo_status: "chua_lien_he",
    dossier_complete: false,
    missing_dossier_items: ["Bản sao CCCD", "02 hình 3x4"],
    organization_name: "ĐH Tài chính Marketing",
    organization_detail: "Kế toán",
    referrer_name: null,
    active_enrollments: 1,
    total_due: 1200000,
    needs_refund: false,
    created_at: "2026-10-12T14:00:00Z",
    registered_at: "2026-10-12",
    course_name: "Luyện thi KET 1-2",
    class_code: null,
    enrollment_status: "cho_xep_lop",
  },
  {
    id: "s-4",
    code: "HV26-0004",
    last_name: "Trần Minh",
    first_name: "Khoa",
    full_name: "Trần Minh Khoa",
    full_name_search: "tran minh khoa",
    gender: "nam",
    date_of_birth: "2005-01-18",
    phone: "0934 567 890",
    zalo_status: "da_vao_nhom",
    dossier_complete: true,
    missing_dossier_items: [],
    organization_name: "THPT Nguyễn Trãi",
    organization_detail: "Lớp 12A1",
    referrer_name: "Thầy Tuấn",
    active_enrollments: 1,
    total_due: 0,
    needs_refund: false,
    created_at: "2026-09-28T10:00:00Z",
    registered_at: "2026-09-28",
    course_name: "Chứng chỉ IC3 - GS6",
    class_code: "IC3_K0126_Ca2PM2",
    enrollment_status: "dang_hoc",
  },
  {
    id: "s-5",
    code: "HV26-0005",
    last_name: "Đỗ Phương",
    first_name: "Linh",
    full_name: "Đỗ Phương Linh",
    full_name_search: "do phuong linh",
    gender: "nu",
    date_of_birth: "2007-06-25",
    phone: "0977 654 321",
    zalo_status: "khong_tim_thay",
    dossier_complete: true,
    missing_dossier_items: [],
    organization_name: null,
    organization_detail: null,
    referrer_name: null,
    active_enrollments: 1,
    total_due: 800000,
    needs_refund: false,
    created_at: "2026-10-15T11:20:00Z",
    registered_at: "2026-10-15",
    course_name: "Starters 1-2",
    class_code: null,
    enrollment_status: "cho_xep_lop",
  },
  {
    id: "s-6",
    code: "HV26-0006",
    last_name: "Võ Ngọc",
    first_name: "Mai",
    full_name: "Võ Ngọc Mai",
    full_name_search: "vo ngoc mai",
    gender: "nu",
    date_of_birth: "2003-09-14",
    phone: "0918 222 333",
    zalo_status: "da_vao_nhom",
    dossier_complete: true,
    missing_dossier_items: [],
    organization_name: "CĐ Công thương",
    organization_detail: "Ngoại thương",
    referrer_name: "Cô Hương",
    active_enrollments: 1,
    total_due: 0,
    needs_refund: false,
    created_at: "2026-10-02T16:45:00Z",
    registered_at: "2026-10-02",
    course_name: "Pre-Ielts",
    class_code: "PREIELTS_K0126_Ca1PM2",
    enrollment_status: "dang_hoc",
  },
  {
    id: "s-7",
    code: "HV26-0007",
    last_name: "Hoàng Văn",
    first_name: "Nam",
    full_name: "Hoàng Văn Nam",
    full_name_search: "hoang van nam",
    gender: "nam",
    date_of_birth: "2005-12-05",
    phone: "0945 777 888",
    zalo_status: "da_lien_he",
    dossier_complete: false,
    missing_dossier_items: ["Bản sao CCCD"],
    organization_name: "ĐH Sư phạm Kỹ thuật",
    organization_detail: "Cơ khí",
    referrer_name: null,
    active_enrollments: 1,
    total_due: 600000,
    needs_refund: false,
    created_at: "2026-10-10T08:00:00Z",
    registered_at: "2026-10-10",
    course_name: "Ứng dụng CNTT Nâng cao",
    class_code: "UDCNTTNC_K0126_Ca2PM1",
    enrollment_status: "dang_hoc",
  },
]

type QuickFilter = "tat_ca" | "cho_xep_lop" | "dang_hoc" | "con_no" | "thieu_ho_so" | "chua_lien_he"

export const Students: React.FC = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("tat_ca")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState<number>(312)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)

  // Bộ lọc nâng cao (trong sheet)
  const [filterCourse, setFilterCourse] = useState("all")
  const [filterClass, setFilterClass] = useState("all")
  const [filterZalo, setFilterZalo] = useState("all")
  const [filterExam, setFilterExam] = useState("all")
  const [filterCert, setFilterCert] = useState("all")

  // Tải danh sách học viên
  const fetchStudents = useCallback(async (pageNum: number, isAppend = false) => {
    if (pageNum === 0) setIsLoading(true)
    else setIsLoadingMore(true)

    try {
      if (isSupabaseConfigured) {
        const from = pageNum * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        const { data, count, error } = await supabase
          .from("v_students_list")
          .select("*", { count: "exact" })
          .order("first_name", { ascending: true })
          .order("last_name", { ascending: true })
          .range(from, to)

        if (!error && data && data.length > 0) {
          const mapped: StudentListItem[] = data.map((item) => ({
            ...item,
            zalo_status: (item.contact_status as ZaloStatus) || "chua_lien_he",
            enrollment_status: item.active_enrollments > 0 ? "dang_hoc" : "cho_xep_lop",
            course_name: item.organization_detail || "Chưa chọn khóa",
            class_code: null,
            registered_at: item.created_at?.split("T")[0] || "",
          }))

          if (isAppend) {
            setStudents((prev) => [...prev, ...mapped])
          } else {
            setStudents(mapped)
          }
          if (count !== null) setTotalCount(count)
          setHasMore(data.length === PAGE_SIZE)
          setIsLoading(false)
          setIsLoadingMore(false)
          return
        }
      }

      // Fallback dùng dữ liệu mẫu chuẩn của trung tâm nếu DB chưa có dữ liệu hoặc offline
      setTimeout(() => {
        if (!isAppend) {
          setStudents(SAMPLE_STUDENTS)
          setTotalCount(312)
          setHasMore(false)
        }
        setIsLoading(false)
        setIsLoadingMore(false)
      }, 400)
    } catch {
      setStudents(SAMPLE_STUDENTS)
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchStudents(0, false)
  }, [fetchStudents])

  // Lọc danh sách học viên theo search query, quick filter và advanced filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. Tìm kiếm (hỗ trợ không dấu tiếng Việt)
      if (searchQuery.trim()) {
        const norm = normalizeVietnamese(searchQuery)
        const nameNorm = normalizeVietnamese(student.full_name || "")
        const phone = (student.phone || "").replace(/\s+/g, "")
        const searchPhone = searchQuery.replace(/\s+/g, "")
        const code = (student.code || "").toLowerCase()
        const matchesName = nameNorm.includes(norm)
        const matchesPhone = phone.includes(searchPhone)
        const matchesCode = code.includes(norm)
        if (!matchesName && !matchesPhone && !matchesCode) return false
      }

      // 2. Bộ lọc nhanh (Quick filter chips)
      if (quickFilter === "cho_xep_lop") {
        if (student.enrollment_status !== "cho_xep_lop" && student.class_code !== null) return false
      } else if (quickFilter === "dang_hoc") {
        if (student.enrollment_status !== "dang_hoc") return false
      } else if (quickFilter === "con_no") {
        if (student.total_due <= 0) return false
      } else if (quickFilter === "thieu_ho_so") {
        if (student.dossier_complete) return false
      } else if (quickFilter === "chua_lien_he") {
        if (student.zalo_status !== "chua_lien_he") return false
      }

      // 3. Bộ lọc nâng cao trong sheet
      if (filterCourse !== "all" && student.course_name !== filterCourse) return false
      if (filterZalo !== "all" && student.zalo_status !== filterZalo) return false

      return true
    })
  }, [students, searchQuery, quickFilter, filterCourse, filterZalo])

  // Tải thêm
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchStudents(nextPage, true)
  }

  // Quick filter chips list
  const quickFilters: { key: QuickFilter; label: string }[] = [
    { key: "tat_ca", label: "Tất cả" },
    { key: "cho_xep_lop", label: "Chờ xếp lớp" },
    { key: "dang_hoc", label: "Đang học" },
    { key: "con_no", label: "Còn nợ" },
    { key: "thieu_ho_so", label: "Thiếu hồ sơ" },
    { key: "chua_lien_he", label: "Chưa liên hệ" },
  ]

  return (
    <div className="p-4 md:p-8 max-w-[1200px] w-full mx-auto space-y-4 font-sans">
      {/* =========================================================================
          HEADER: Tiêu đề + Tổng số lượng + Nút "Thêm học viên" (Desktop)
      ========================================================================= */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-[22px] leading-[30px] font-semibold text-[#131B2E]">
              Học viên
            </h1>
            <span className="text-sm text-[#5A6478] tabular-nums font-normal">
              {totalCount} học viên
            </span>
          </div>
        </div>

        {/* Nút Thêm học viên - Desktop hiển thị trong header */}
        <div className="hidden sm:block">
          <Button
            onClick={() => alert("Tính năng Đăng ký học viên mới sẽ triển khai ở Nhiệm vụ 2.")}
            className="h-10 px-4 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học viên</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          SEARCH FIELD (Luôn hiển thị) + Gợi ý 1 dòng phía dưới
      ========================================================================= */}
      <div className="space-y-1">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5A6478] absolute left-3 top-3 pointer-events-none" />
          <Input
            type="text"
            placeholder="Tìm theo tên, số điện thoại hoặc mã học viên"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 sm:h-10 pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 p-1 text-[#5A6478] hover:text-[#131B2E]"
              aria-label="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[12px] leading-4 text-[#5A6478] pl-1">
          Gõ tiếng Việt không dấu (ví dụ: nguyen) hoặc số điện thoại, mã học viên để tìm nhanh.
        </p>
      </div>

      {/* =========================================================================
          FILTER CHIPS (Cuộn ngang trên Mobile) + Nút "Lọc"
      ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        {quickFilters.map((tab) => {
          const isActive = quickFilter === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setQuickFilter(tab.key)}
              className={`h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none shrink-0 border ${
                isActive
                  ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                  : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#ECEFF5]"
              }`}
            >
              {tab.label}
            </button>
          )
        })}

        {/* Nút "Lọc" mở Sheet */}
        <button
          onClick={() => setShowFilterSheet(true)}
          className="h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none shrink-0 border border-[#DFE4EC] bg-white text-[#131B2E] hover:bg-[#ECEFF5] flex items-center gap-1.5 ml-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#5A6478]" />
          <span>Lọc</span>
          {(filterCourse !== "all" || filterZalo !== "all") && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#1E40AF]" />
          )}
        </button>
      </div>

      {/* =========================================================================
          TRẠNG THÁI: Skeleton Loading (Khung xương, không dùng spinner)
      ========================================================================= */}
      {isLoading && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden p-4 space-y-4 shadow-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-2 border-b border-[#DFE4EC] last:border-b-0 animate-pulse">
              <div className="w-20 h-4 bg-[#ECEFF5] rounded-[4px]" />
              <div className="w-48 h-4 bg-[#ECEFF5] rounded-[4px]" />
              <div className="w-32 h-4 bg-[#ECEFF5] rounded-[4px] hidden md:block" />
              <div className="w-20 h-5 bg-[#ECEFF5] rounded-full" />
              <div className="w-16 h-4 bg-[#ECEFF5] rounded-[4px]" />
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          TRẠNG THÁI: Tìm kiếm không có kết quả
      ========================================================================= */}
      {!isLoading && filteredStudents.length === 0 && searchQuery.trim() !== "" && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-10 text-center shadow-none space-y-3">
          <p className="text-sm text-[#131B2E]">
            Không tìm thấy học viên nào khớp với &apos;<span className="font-semibold">{searchQuery}</span>&apos;. Thử tìm bằng số điện thoại.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-8 text-xs"
          >
            Xóa tìm kiếm
          </Button>
        </div>
      )}

      {/* =========================================================================
          TRẠNG THÁI: Danh sách trống hoàn toàn (Empty database)
      ========================================================================= */}
      {!isLoading && students.length === 0 && searchQuery.trim() === "" && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-12 text-center shadow-none space-y-4">
          <p className="text-sm text-[#5A6478]">
            Chưa có học viên nào trong hệ thống.
          </p>
          <Button
            onClick={() => alert("Tính năng Đăng ký học viên mới sẽ triển khai ở Nhiệm vụ 2.")}
            className="h-10 px-5 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm học viên</span>
          </Button>
        </div>
      )}

      {/* =========================================================================
          BẢN DESKTOP (BẢNG TABLE)
      ========================================================================= */}
      {!isLoading && filteredStudents.length > 0 && (
        <div className="hidden md:block bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#DFE4EC] bg-[#F4F6FA] text-[#5A6478] text-xs font-semibold">
                  <th className="py-2.5 px-3.5 w-24">Mã</th>
                  <th className="py-2.5 px-3.5">Học viên</th>
                  <th className="py-2.5 px-3.5">Khóa học & Lớp</th>
                  <th className="py-2.5 px-3.5">Trạng thái Zalo</th>
                  <th className="py-2.5 px-3.5">Hồ sơ</th>
                  <th className="py-2.5 px-3.5 text-right">Còn nợ</th>
                  <th className="py-2.5 px-3.5">Ngày đăng ký</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE4EC]">
                {filteredStudents.map((st) => {
                  const zaloConfig = zaloStatusConfig[st.zalo_status] || {
                    label: st.zalo_status,
                    variant: "neutral",
                  }
                  return (
                    <tr
                      key={st.id}
                      onClick={() => navigate(`/hoc-vien/${st.id}`)}
                      className="hover:bg-[#E7EDFB]/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Mã */}
                      <td className="py-3 px-3.5 font-mono text-xs text-[#5A6478] tabular-nums">
                        {st.code}
                      </td>

                      {/* 2. Họ và chữ lót with Tên (list sorts by Tên, phone below) */}
                      <td className="py-3 px-3.5">
                        <div className="text-sm text-[#131B2E]">
                          <span>{st.last_name} </span>
                          <span className="font-semibold text-[#1E40AF]">{st.first_name}</span>
                        </div>
                        <div className="text-xs text-[#5A6478] tabular-nums mt-0.5">
                          {st.phone || "—"}
                        </div>
                      </td>

                      {/* 3. Khóa học and Lớp */}
                      <td className="py-3 px-3.5">
                        <div className="text-xs font-medium text-[#131B2E] truncate max-w-[200px]">
                          {st.course_name || "—"}
                        </div>
                        <div className="mt-1">
                          {st.class_code ? (
                            <span className="text-[11px] font-mono text-[#5A6478] bg-[#ECEFF5] px-1.5 py-0.5 rounded-[4px]">
                              {st.class_code}
                            </span>
                          ) : (
                            <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                              Chờ xếp lớp
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* 4. Trạng thái Zalo */}
                      <td className="py-3 px-3.5">
                        <Badge variant={zaloConfig.variant} className="text-[11px] font-normal">
                          {zaloConfig.label}
                        </Badge>
                      </td>

                      {/* 5. Hồ sơ */}
                      <td className="py-3 px-3.5">
                        {st.dossier_complete ? (
                          <Badge variant="success" className="text-[11px]">
                            Đủ hồ sơ
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[11px]">
                            {st.missing_dossier_items && st.missing_dossier_items.length > 0
                              ? `Thiếu ${st.missing_dossier_items[0]}`
                              : "Thiếu hồ sơ"}
                          </Badge>
                        )}
                      </td>

                      {/* 6. Còn nợ (right aligned, danger if > 0) */}
                      <td className="py-3 px-3.5 text-right tabular-nums">
                        {st.total_due > 0 ? (
                          <span className="text-sm font-semibold text-[#B3382C]">
                            {formatCurrency(st.total_due)}
                          </span>
                        ) : (
                          <span className="text-xs text-[#5A6478]">
                            0 ₫
                          </span>
                        )}
                      </td>

                      {/* 7. Ngày đăng ký */}
                      <td className="py-3 px-3.5 text-xs text-[#5A6478] tabular-nums">
                        {formatDate(st.registered_at || st.created_at)}
                      </td>

                      {/* 8. Row Action Menu */}
                      <td
                        className="py-3 px-2 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === st.id ? null : st.id)}
                            className="p-1 rounded-[4px] text-[#5A6478] hover:text-[#131B2E] hover:bg-[#ECEFF5]"
                            aria-label="Thao tác"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === st.id && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-[#DFE4EC] rounded-[6px] shadow-lg py-1 z-20">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null)
                                  navigate(`/hoc-vien/${st.id}`)
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[#131B2E] hover:bg-[#E7EDFB] flex items-center gap-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#5A6478]" />
                                <span>Xem hồ sơ</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null)
                                  alert(`Sửa thông tin: ${st.full_name}`)
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[#131B2E] hover:bg-[#E7EDFB] flex items-center gap-2"
                              >
                                <Edit className="w-3.5 h-3.5 text-[#5A6478]" />
                                <span>Sửa thông tin</span>
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null)
                                  alert(`Ghi nhận thu tiền cho: ${st.full_name}`)
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs text-[#1E40AF] hover:bg-[#E7EDFB] flex items-center gap-2 font-medium"
                              >
                                <CreditCard className="w-3.5 h-3.5 text-[#1E40AF]" />
                                <span>Ghi nhận thu tiền</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          BẢN MOBILE (DANH SÁCH 2 DÒNG + CHIPS + TIỀN NỢ)
      ========================================================================= */}
      {!isLoading && filteredStudents.length > 0 && (
        <div className="md:hidden space-y-2.5">
          {filteredStudents.map((st) => {
            const zaloConfig = zaloStatusConfig[st.zalo_status] || {
              label: st.zalo_status,
              variant: "neutral",
            }
            const enrollConfig = enrollmentStatusConfig[st.enrollment_status || "cho_xep_lop"]
            return (
              <div
                key={st.id}
                onClick={() => navigate(`/hoc-vien/${st.id}`)}
                className="bg-white border border-[#DFE4EC] rounded-[10px] p-3.5 space-y-2 shadow-none cursor-pointer active:bg-[#E7EDFB]/30 transition-colors"
              >
                {/* Dòng 1: Name + Enrollment Status Chip + Còn nợ */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#131B2E]">
                      {st.full_name}
                    </span>
                    <Badge variant={enrollConfig.variant} className="text-[10px] py-0 px-2 font-normal">
                      {enrollConfig.label}
                    </Badge>
                  </div>
                  {st.total_due > 0 && (
                    <span className="text-xs font-bold text-[#B3382C] tabular-nums shrink-0">
                      {formatCurrency(st.total_due)}
                    </span>
                  )}
                </div>

                {/* Dòng 2: Phone + Class Code (hoặc Chờ xếp lớp) */}
                <div className="flex items-center justify-between text-xs text-[#5A6478] pt-0.5">
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <Phone className="w-3.5 h-3.5 text-[#5A6478]" />
                    <span>{st.phone || "—"}</span>
                  </div>
                  <div className="text-xs font-mono text-[#5A6478] truncate max-w-[150px]">
                    {st.class_code || "Chờ xếp lớp"}
                  </div>
                </div>

                {/* Hàng chip nhỏ: Zalo chip + Hồ sơ chip */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-[#DFE4EC]">
                  <Badge variant={zaloConfig.variant} className="text-[10px] py-0 px-1.5 font-normal">
                    {zaloConfig.label}
                  </Badge>
                  {st.dossier_complete ? (
                    <Badge variant="success" className="text-[10px] py-0 px-1.5 font-normal">
                      Đủ hồ sơ
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px] py-0 px-1.5 font-normal">
                      {st.missing_dossier_items && st.missing_dossier_items.length > 0
                        ? `Thiếu ${st.missing_dossier_items[0]}`
                        : "Thiếu hồ sơ"}
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* =========================================================================
          PAGINATION: Nút "Tải thêm" ở cuối (Server paging)
      ========================================================================= */}
      {!isLoading && filteredStudents.length > 0 && hasMore && (
        <div className="pt-2 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full sm:w-auto px-8"
          >
            {isLoadingMore ? "Đang tải thêm..." : "Tải thêm"}
          </Button>
        </div>
      )}

      {/* =========================================================================
          MOBILE FLOATING PILL BUTTON: "Thêm học viên"
      ========================================================================= */}
      <div className="sm:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => alert("Tính năng Đăng ký học viên mới sẽ triển khai ở Nhiệm vụ 2.")}
          className="h-11 px-5 rounded-full bg-[#1E40AF] text-white shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-[#1E3A8A] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm học viên</span>
        </button>
      </div>

      {/* =========================================================================
          BOTTOM SHEET / MODAL BỘ LỌC NÂNG CAO ("Lọc")
      ========================================================================= */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div
            className="fixed inset-0"
            onClick={() => setShowFilterSheet(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-t-[16px] sm:rounded-[10px] border border-[#DFE4EC] p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl animate-in slide-in-from-bottom duration-150">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE4EC]">
              <h3 className="text-base font-semibold text-[#131B2E]">
                Bộ lọc học viên
              </h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="p-1 rounded-[4px] text-[#5A6478] hover:bg-[#ECEFF5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Fields */}
            <div className="space-y-3.5 text-sm">
              {/* 1. Khóa học */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Khóa học
                </label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full h-10 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                >
                  <option value="all">Tất cả khóa học</option>
                  <option value="Tiếng Anh giao tiếp">Tiếng Anh giao tiếp</option>
                  <option value="Ứng dụng CNTT Cơ bản">Ứng dụng CNTT Cơ bản</option>
                  <option value="Luyện thi KET 1-2">Luyện thi KET 1-2</option>
                  <option value="Chứng chỉ IC3 - GS6">Chứng chỉ IC3 - GS6</option>
                  <option value="Starters 1-2">Starters 1-2</option>
                  <option value="Pre-Ielts">Pre-Ielts</option>
                  <option value="Ứng dụng CNTT Nâng cao">Ứng dụng CNTT Nâng cao</option>
                </select>
              </div>

              {/* 2. Lớp */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Lớp học
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full h-10 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                >
                  <option value="all">Tất cả lớp</option>
                  <option value="TAGT_K0126_Ca1PM1">TAGT_K0126_Ca1PM1 (Ca 1)</option>
                  <option value="UDCNTTCB_K0126_Ca1PM1">UDCNTTCB_K0126_Ca1PM1 (Ca 1)</option>
                  <option value="IC3_K0126_Ca2PM2">IC3_K0126_Ca2PM2 (Ca 2)</option>
                  <option value="PREIELTS_K0126_Ca1PM2">PREIELTS_K0126_Ca1PM2 (Ca 1)</option>
                </select>
              </div>

              {/* 3. Trạng thái Zalo */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Trạng thái liên hệ Zalo
                </label>
                <select
                  value={filterZalo}
                  onChange={(e) => setFilterZalo(e.target.value)}
                  className="w-full h-10 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                >
                  <option value="all">Tất cả trạng thái Zalo</option>
                  <option value="chua_lien_he">Chưa liên hệ</option>
                  <option value="da_lien_he">Đã liên hệ</option>
                  <option value="da_vao_nhom">Đã vào nhóm Zalo</option>
                  <option value="khong_tim_thay">Không tìm thấy Zalo</option>
                  <option value="chan_tin_nhan">Chặn tin nhắn Zalo</option>
                </select>
              </div>

              {/* 4. Trạng thái thi */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Trạng thái thi
                </label>
                <select
                  value={filterExam}
                  onChange={(e) => setFilterExam(e.target.value)}
                  className="w-full h-10 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="chua_thi">Chưa thi</option>
                  <option value="doi_lich">Dời lịch thi</option>
                  <option value="da_thi">Đã thi</option>
                </select>
              </div>

              {/* 5. Trạng thái cấp bằng */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Trạng thái cấp bằng
                </label>
                <select
                  value={filterCert}
                  onChange={(e) => setFilterCert(e.target.value)}
                  className="w-full h-10 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                >
                  <option value="all">Tất cả</option>
                  <option value="chua_cap">Chưa cấp bằng</option>
                  <option value="da_cap">Đã cấp bằng</option>
                </select>
              </div>
            </div>

            {/* Sheet Actions */}
            <div className="pt-3 border-t border-[#DFE4EC] flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setFilterCourse("all")
                  setFilterClass("all")
                  setFilterZalo("all")
                  setFilterExam("all")
                  setFilterCert("all")
                }}
                className="flex-1 h-10 text-xs"
              >
                Đặt lại
              </Button>
              <Button
                onClick={() => setShowFilterSheet(false)}
                className="flex-1 h-10 text-xs"
              >
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DIALOG CHI TIẾT NHANH HỌC VIÊN KHI CLICK ROW
      ========================================================================= */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#DFE4EC]">
              <div>
                <h3 className="text-base font-semibold text-[#131B2E]">
                  {selectedStudent.full_name}
                </h3>
                <div className="text-xs font-mono text-[#5A6478]">
                  Mã: {selectedStudent.code} &bull; SĐT: {selectedStudent.phone || "—"}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded-[4px] text-[#5A6478] hover:bg-[#ECEFF5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Khóa học:</span>
                <span className="font-medium text-[#131B2E]">{selectedStudent.course_name || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Lớp học:</span>
                <span className="font-mono text-[#131B2E]">{selectedStudent.class_code || "Chưa xếp lớp"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Học phí còn nợ:</span>
                <span className={`font-semibold tabular-nums ${selectedStudent.total_due > 0 ? "text-[#B3382C]" : "text-[#2F7D4F]"}`}>
                  {formatCurrency(selectedStudent.total_due)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Hồ sơ nhập học:</span>
                <span>
                  {selectedStudent.dossier_complete ? (
                    <Badge variant="success" className="text-[10px]">Đủ hồ sơ</Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px]">Thiếu hồ sơ</Badge>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Người giới thiệu:</span>
                <span className="text-[#131B2E]">{selectedStudent.referrer_name || "Không có"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Trường / Đơn vị:</span>
                <span className="text-[#131B2E]">{selectedStudent.organization_name || "—"}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedStudent(null)}
                className="flex-1 h-9 text-xs"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  alert(`Chuyển đến màn hình thu tiền cho học viên: ${selectedStudent.full_name}`)
                  setSelectedStudent(null)
                }}
                className="flex-1 h-9 text-xs"
              >
                Ghi nhận thu tiền
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
