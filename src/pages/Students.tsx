import React, { useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import type { StudentListItem, ContactStatus } from "@/types/database"
import { formatCurrency, formatDate } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  RefreshCw,
  AlertCircle,
  FileText,
  Phone,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

const PAGE_SIZE = 25

// Hàm chuẩn hóa chuỗi tiếng Việt bỏ dấu để tìm kiếm
function normalizeVietnamese(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
}

// Map nhãn trạng thái liên hệ
const contactStatusLabels: Record<ContactStatus, { label: string; variant: "neutral" | "warning" | "success" | "danger" }> = {
  chua_lien_he: { label: "Chưa liên hệ", variant: "neutral" },
  da_goi: { label: "Đã gọi", variant: "neutral" },
  khong_nghe_may: { label: "Không nghe máy", variant: "danger" },
  can_goi_lai: { label: "Cần gọi lại", variant: "warning" },
  hen_den_trung_tam: { label: "Hẹn đến TT", variant: "success" },
  khong_con_nhu_cau: { label: "Hết nhu cầu", variant: "neutral" },
}

export const Students: React.FC = () => {
  const [students, setStudents] = useState<StudentListItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number | null>(null)

  const fetchStudents = useCallback(
    async (pageNum: number, search: string, isAppend = false) => {
      if (!isSupabaseConfigured) {
        setErrorMessage("Chưa cấu hình kết nối Supabase.")
        return
      }

      if (pageNum === 0) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setErrorMessage(null)

      try {
        const from = pageNum * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        let query = supabase
          .from("v_students_list")
          .select("*", { count: "exact" })

        // Tìm kiếm theo full_name_search, phone hoặc code
        const trimmed = search.trim()
        if (trimmed) {
          const normSearch = normalizeVietnamese(trimmed)
          // Tìm theo cột full_name_search (không dấu) hoặc phone hoặc code
          query = query.or(
            `full_name_search.ilike.%${normSearch}%,phone.ilike.%${trimmed}%,code.ilike.%${trimmed}%`
          )
        }

        // Sắp xếp theo tên trước (first_name), rồi theo họ (last_name) theo quy tắc tiếng Việt
        query = query
          .order("first_name", { ascending: true })
          .order("last_name", { ascending: true })
          .range(from, to)

        const { data, count, error } = await query

        if (error) {
          console.error("Lỗi khi tải danh sách học viên:", error)
          setErrorMessage(`Không thể tải dữ liệu: ${error.message}`)
          return
        }

        const items = (data as StudentListItem[]) || []
        if (isAppend) {
          setStudents((prev) => [...prev, ...items])
        } else {
          setStudents(items)
        }

        if (count !== null) {
          setTotalCount(count)
        }

        // Kiểm tra xem còn trang kế tiếp không
        setHasMore(items.length === PAGE_SIZE)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định."
        setErrorMessage(msg)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    []
  )

  // Gọi API ban đầu
  useEffect(() => {
    setPage(0)
    fetchStudents(0, searchQuery, false)
  }, [fetchStudents])

  // Xử lý khi gõ tìm kiếm (debounce nhẹ hoặc submit)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
    fetchStudents(0, searchQuery, false)
  }

  // Tải thêm trang tiếp theo
  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchStudents(nextPage, searchQuery, true)
  }

  // Làm mới danh sách
  const handleRefresh = () => {
    setPage(0)
    fetchStudents(0, searchQuery, false)
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#131B2E]">Học viên</h1>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Danh sách học viên và tình trạng học phí, hồ sơ trung tâm
            {totalCount !== null && ` • Tổng cộng ${totalCount} học viên`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-3 shadow-none">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5A6478] absolute left-3 top-2.5 pointer-events-none" />
            <Input
              type="text"
              placeholder="Tìm theo tên học viên (gõ không dấu), số điện thoại hoặc mã HV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button type="submit" size="default" disabled={isLoading} className="shrink-0">
            Tìm kiếm
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchQuery("")
                setPage(0)
                fetchStudents(0, "", false)
              }}
            >
              Xóa
            </Button>
          )}
        </form>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="p-4 bg-[#FBE8E5] border border-[#B3382C]/30 rounded-[10px] text-xs text-[#B3382C] flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold mb-0.5">Không thể tải danh sách học viên</div>
            <div>{errorMessage}</div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="shrink-0 h-7 text-xs"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* Trạng thái đang tải lần đầu */}
      {isLoading && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-12 text-center shadow-none">
          <div className="inline-block w-7 h-7 border-3 border-[#1E40AF] border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-[#5A6478]">Đang tải danh sách học viên...</p>
        </div>
      )}

      {/* Danh sách rỗng */}
      {!isLoading && !errorMessage && students.length === 0 && (
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-12 text-center shadow-none">
          <FileText className="w-10 h-10 text-[#5A6478] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-semibold text-[#131B2E] mb-1">
            Không tìm thấy học viên nào
          </h3>
          <p className="text-xs text-[#5A6478] max-w-sm mx-auto">
            {searchQuery
              ? `Không có kết quả nào phù hợp với từ khóa "${searchQuery}". Hãy thử tìm bằng từ khóa khác.`
              : "Chưa có dữ liệu học viên trong hệ thống hoặc tài khoản chưa có quyền truy cập."}
          </p>
        </div>
      )}

      {/* Danh sách học viên - Bản Desktop (Bảng) */}
      {!isLoading && students.length > 0 && (
        <div className="hidden md:block bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#DFE4EC] bg-[#F4F6FA] text-[#5A6478] text-xs font-semibold">
                  <th className="py-2.5 px-3 w-28">Mã HV</th>
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Số điện thoại</th>
                  <th className="py-2.5 px-3">Hồ sơ</th>
                  <th className="py-2.5 px-3">Liên hệ</th>
                  <th className="py-2.5 px-3">Trường / Đơn vị</th>
                  <th className="py-2.5 px-3 text-right">Còn nợ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE4EC]">
                {students.map((student) => {
                  const statusInfo =
                    contactStatusLabels[student.contact_status] || {
                      label: student.contact_status,
                      variant: "neutral" as const,
                    }
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-[#E7EDFB]/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-xs text-[#5A6478] tabular-nums">
                        {student.code}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-[#131B2E]">
                          {student.full_name}
                        </div>
                        {student.date_of_birth && (
                          <div className="text-[11px] text-[#5A6478] tabular-nums">
                            Sinh ngày: {formatDate(student.date_of_birth)}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#131B2E] tabular-nums">
                        {student.phone || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        {student.dossier_complete ? (
                          <Badge variant="success" className="gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đủ hồ sơ</span>
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1 text-[11px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Thiếu hồ sơ</span>
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant={statusInfo.variant} className="text-[11px]">
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#5A6478]">
                        {student.organization_name ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 shrink-0 opacity-70" />
                            <span className="truncate max-w-[150px]">
                              {student.organization_name}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums">
                        {student.needs_refund ? (
                          <Badge variant="danger" className="text-[11px]">
                            Cần hoàn tiền
                          </Badge>
                        ) : student.total_due > 0 ? (
                          <span className="font-semibold text-[#B3382C]">
                            {formatCurrency(student.total_due)}
                          </span>
                        ) : (
                          <span className="text-xs text-[#2F7D4F] font-medium">
                            Đã đóng đủ
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Danh sách học viên - Bản Mobile (Thẻ Card) */}
      {!isLoading && students.length > 0 && (
        <div className="md:hidden space-y-2.5">
          {students.map((student) => {
            const statusInfo =
              contactStatusLabels[student.contact_status] || {
                label: student.contact_status,
                variant: "neutral" as const,
              }
            return (
              <div
                key={student.id}
                className="bg-white border border-[#DFE4EC] rounded-[10px] p-3 space-y-2 shadow-none"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-[#131B2E] text-sm">
                      {student.full_name}
                    </div>
                    <div className="text-xs font-mono text-[#5A6478] tabular-nums">
                      {student.code}
                    </div>
                  </div>
                  <div className="text-right">
                    {student.needs_refund ? (
                      <Badge variant="danger" className="text-[10px]">
                        Cần hoàn
                      </Badge>
                    ) : student.total_due > 0 ? (
                      <div className="text-xs font-bold text-[#B3382C] tabular-nums">
                        Nợ: {formatCurrency(student.total_due)}
                      </div>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        Đủ học phí
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-[#5A6478] border-t border-[#DFE4EC]">
                  {student.phone && (
                    <div className="flex items-center gap-1 text-[11px] tabular-nums mr-2">
                      <Phone className="w-3 h-3 text-[#5A6478]" />
                      <span>{student.phone}</span>
                    </div>
                  )}

                  {student.dossier_complete ? (
                    <Badge variant="success" className="text-[10px] py-0">
                      Đủ HS
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[10px] py-0">
                      Thiếu HS
                    </Badge>
                  )}

                  <Badge variant={statusInfo.variant} className="text-[10px] py-0">
                    {statusInfo.label}
                  </Badge>

                  {student.organization_name && (
                    <span className="text-[11px] text-[#5A6478] truncate max-w-[140px]">
                      &bull; {student.organization_name}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Nút Tải thêm */}
      {!isLoading && students.length > 0 && hasMore && (
        <div className="pt-2 text-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="w-full md:w-auto px-8"
          >
            {isLoadingMore ? "Đang tải thêm..." : "Tải thêm học viên"}
          </Button>
        </div>
      )}

      {/* Đã tải hết */}
      {!isLoading && students.length > 0 && !hasMore && (
        <div className="text-center py-3 text-xs text-[#5A6478]">
          Đã hiển thị toàn bộ {students.length} học viên
        </div>
      )}
    </div>
  )
}
