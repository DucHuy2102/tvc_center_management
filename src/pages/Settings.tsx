import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"
import {
  BookOpen,
  Clock,
  GraduationCap,
  FileCheck,
  Building2,
  Shield,
  Sparkles,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Lock,
  Unlock,
  Upload,
  FileText,
  HelpCircle,
  Info,
} from "lucide-react"

// ============================================================================
// DỮ LIỆU CÀI ĐẶT MẪU
// ============================================================================

// 1. Khóa học
export interface CourseSetting {
  id: string
  program: "Tin học" | "Tiếng Anh"
  category: string
  name: string
  prefix: string
  monthlyPrice: number
  durationMonths: number
  curriculumPdf: string
  isActive: boolean
}

const INITIAL_COURSES: CourseSetting[] = [
  { id: "c-1", program: "Tin học", category: "Tin học Ứng dụng", name: "Ứng dụng CNTT Cơ bản", prefix: "UDCNTTCB", monthlyPrice: 400000, durationMonths: 2.5, curriculumPdf: "curriculum_udcntt_coban.pdf", isActive: true },
  { id: "c-2", program: "Tin học", category: "Tin học Nâng cao", name: "Ứng dụng CNTT Nâng cao", prefix: "UDCNTTNC", monthlyPrice: 450000, durationMonths: 2.5, curriculumPdf: "curriculum_udcntt_nangcao.pdf", isActive: true },
  { id: "c-3", program: "Tin học", category: "Chứng chỉ quốc tế", name: "Chứng chỉ IC3 - GS6", prefix: "IC3", monthlyPrice: 500000, durationMonths: 3.0, curriculumPdf: "curriculum_ic3.pdf", isActive: true },
  { id: "c-4", program: "Tiếng Anh", category: "Giao tiếp", name: "Tiếng Anh giao tiếp", prefix: "TAGT", monthlyPrice: 400000, durationMonths: 2.5, curriculumPdf: "curriculum_tagt.pdf", isActive: true },
  { id: "c-5", program: "Tiếng Anh", category: "IELTS", name: "Pre-Ielts", prefix: "PREIELTS", monthlyPrice: 600000, durationMonths: 3.0, curriculumPdf: "curriculum_preielts.pdf", isActive: true },
  { id: "c-6", program: "Tiếng Anh", category: "IELTS", name: "Ielts 5.0 - 6.5", prefix: "IELTS", monthlyPrice: 800000, durationMonths: 3.0, curriculumPdf: "curriculum_ielts.pdf", isActive: true },
  { id: "c-7", program: "Tiếng Anh", category: "Chứng chỉ", name: "KET 1-2", prefix: "KET", monthlyPrice: 400000, durationMonths: 3.0, curriculumPdf: "curriculum_ket.pdf", isActive: true },
]

// 2. Ca học (4 ca cố định)
export interface ShiftSetting {
  id: string
  name: string
  weekdays: string
  startTime: string
  endTime: string
}

const INITIAL_SHIFTS: ShiftSetting[] = [
  { id: "shift-1", name: "Ca 1", weekdays: "Thứ 2 - Thứ 4 - Thứ 6", startTime: "18:30", endTime: "20:30" },
  { id: "shift-2", name: "Ca 2", weekdays: "Thứ 3 - Thứ 5 - Thứ 7", startTime: "18:30", endTime: "20:30" },
  { id: "shift-3", name: "Ca 3", weekdays: "Thứ 7 & Chủ nhật", startTime: "07:30", endTime: "10:30" },
  { id: "shift-4", name: "Ca 4", weekdays: "Thứ 7 & Chủ nhật", startTime: "13:30", endTime: "16:30" },
]

// 3. Người dùng
export interface UserAccountSetting {
  id: string
  email: string
  fullName: string
  role: "chu" | "nhan_vien"
  isActive: boolean
}

const INITIAL_USERS: UserAccountSetting[] = [
  { id: "u-1", email: "owner@tvc.edu.vn", fullName: "Quản trị viên (Chủ)", role: "chu", isActive: true },
  { id: "u-2", email: "linh.staff@tvc.edu.vn", fullName: "Nguyễn Thùy Linh", role: "nhan_vien", isActive: true },
  { id: "u-3", email: "nam.staff@tvc.edu.vn", fullName: "Hoàng Văn Nam", role: "nhan_vien", isActive: true },
]

// 4. Trường và đơn vị
export interface OrganizationSetting {
  id: string
  name: string
  type: "Cao đẳng" | "Trung cấp" | "Trường khác" | "Khác"
  isActive: boolean
}

const INITIAL_ORGS: OrganizationSetting[] = [
  { id: "org-1", name: "Trường CĐ Nghề Trà Vinh", type: "Cao đẳng", isActive: true },
  { id: "org-2", name: "Trường ĐH Trà Vinh", type: "Trường khác", isActive: true },
  { id: "org-3", name: "Trường THPT Chuyên Trà Vinh", type: "Trường khác", isActive: true },
  { id: "org-4", name: "Trường Trung cấp Y tế Trà Vinh", type: "Trung cấp", isActive: true },
  { id: "org-5", name: "Học sinh / Sinh viên tự do", type: "Khác", isActive: true },
]

type SettingsSection =
  | "khoa_hoc"
  | "ca_hoc"
  | "lop_hoc"
  | "ho_so"
  | "truong_don_vi"
  | "nguoi_dung"
  | "hoa_hong"
  | "thong_tin_trung_tam"

const SETTING_NAV_ITEMS: { id: SettingsSection; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: "khoa_hoc", label: "Khóa học", icon: BookOpen, desc: "Chương trình đào tạo, học phí tháng và thời gian học" },
  { id: "ca_hoc", label: "Ca học", icon: Clock, desc: "4 ca học cố định của trung tâm" },
  { id: "lop_hoc", label: "Lớp học", icon: GraduationCap, desc: "Sĩ số tối đa mặc định cho lớp" },
  { id: "ho_so", label: "Hồ sơ", icon: FileCheck, desc: "Danh mục giấy tờ hồ sơ học viên bắt buộc" },
  { id: "truong_don_vi", label: "Trường & đơn vị", icon: Building2, desc: "Danh mục trường học, đơn vị học viên theo học" },
  { id: "nguoi_dung", label: "Người dùng", icon: Shield, desc: "Tài khoản nhân viên và phân quyền truy cập" },
  { id: "hoa_hong", label: "Hoa hồng", icon: Sparkles, desc: "Định mức hoa hồng và điều kiện chi trả" },
  { id: "thong_tin_trung_tam", label: "Thông tin trung tâm", icon: MapPin, desc: "Địa chỉ, số điện thoại và logo in phiếu thu" },
]

export const Settings: React.FC = () => {
  // Mục cài đặt đang chọn
  const [activeSection, setActiveSection] = useState<SettingsSection>("khoa_hoc")
  // Trên mobile: trạng thái đang xem danh sách mục (null) hay đã bấm vào chi tiết một mục
  const [mobileDrillSection, setMobileDrillSection] = useState<SettingsSection | null>(null)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // ==========================================================================
  // 1. STATE KHÓA HỌC
  // ==========================================================================
  const [courses, setCourses] = useState<CourseSetting[]>(INITIAL_COURSES)
  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [newProgram, setNewProgram] = useState<"Tin học" | "Tiếng Anh">("Tin học")
  const [newCategory, setNewCategory] = useState("Tin học Ứng dụng")
  const [newCourseName, setNewCourseName] = useState("")
  const [newPrefix, setNewPrefix] = useState("")
  const [newMonthlyPrice, setNewMonthlyPrice] = useState<number>(400000)
  const [newDurationMonths, setNewDurationMonths] = useState<number>(2.5)
  const [newCurriculumPdf, setNewCurriculumPdf] = useState("curriculum_general.pdf")
  const [newIsActive, setNewIsActive] = useState(true)

  // Tính học phí cả khóa dạng câu văn chuẩn
  const computedCourseTotal = useMemo(() => {
    const total = newMonthlyPrice * newDurationMonths
    return `Học phí cả khóa: ${formatCurrency(newMonthlyPrice)} x ${String(newDurationMonths).replace(".", ",")} tháng = ${formatCurrency(total)}`
  }, [newMonthlyPrice, newDurationMonths])

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCourseName.trim()) return

    const newC: CourseSetting = {
      id: `c-${Date.now()}`,
      program: newProgram,
      category: newCategory,
      name: newCourseName.trim(),
      prefix: newPrefix.trim().toUpperCase() || "NEW",
      monthlyPrice: newMonthlyPrice,
      durationMonths: newDurationMonths,
      curriculumPdf: newCurriculumPdf,
      isActive: newIsActive,
    }

    setCourses([...courses, newC])
    setShowAddCourseModal(false)
    setNewCourseName("")
    setNewPrefix("")
    showToast(`Đã thêm khóa học ${newC.name}`)
  }

  const handleToggleCourseActive = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, isActive: !c.isActive } : c))
    )
    showToast("Đã cập nhật trạng thái khóa học")
  }

  // ==========================================================================
  // 2. STATE CA HỌC
  // ==========================================================================
  const [shifts, setShifts] = useState<ShiftSetting[]>(INITIAL_SHIFTS)
  const handleUpdateShift = (id: string, field: keyof ShiftSetting, value: string) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
  }

  // ==========================================================================
  // 3. STATE LỚP HỌC (DEFAULT CAPACITY)
  // ==========================================================================
  const [defaultCapacity, setDefaultCapacity] = useState<number>(40)

  // ==========================================================================
  // 4. STATE HỒ SƠ (CHECKLIST YÊU CẦU)
  // ==========================================================================
  const [dossierItems, setDossierItems] = useState<string[]>([
    "Bản sao CCCD",
    "02 hình 3x4",
  ])
  const [newDossierItemName, setNewDossierItemName] = useState("")

  const handleAddDossierItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDossierItemName.trim()) return
    if (dossierItems.includes(newDossierItemName.trim())) {
      showToast("Mục hồ sơ này đã tồn tại")
      return
    }
    setDossierItems([...dossierItems, newDossierItemName.trim()])
    setNewDossierItemName("")
    showToast("Đã thêm mục hồ sơ yêu cầu mới")
  }

  const handleRemoveDossierItem = (itemToRemove: string) => {
    setDossierItems(dossierItems.filter((i) => i !== itemToRemove))
    showToast("Đã xóa mục hồ sơ")
  }

  // ==========================================================================
  // 5. STATE TRƯỜNG & ĐƠN VỊ
  // ==========================================================================
  const [organizations, setOrganizations] = useState<OrganizationSetting[]>(INITIAL_ORGS)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgType, setNewOrgType] = useState<"Cao đẳng" | "Trung cấp" | "Trường khác" | "Khác">("Cao đẳng")

  const handleAddOrg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    const newO: OrganizationSetting = {
      id: `org-${Date.now()}`,
      name: newOrgName.trim(),
      type: newOrgType,
      isActive: true,
    }
    setOrganizations([...organizations, newO])
    setNewOrgName("")
    showToast(`Đã thêm trường/đơn vị ${newO.name}`)
  }

  const handleToggleOrg = (orgId: string) => {
    setOrganizations((prev) =>
      prev.map((o) => (o.id === orgId ? { ...o, isActive: !o.isActive } : o))
    )
    showToast("Đã cập nhật trạng thái đơn vị")
  }

  // ==========================================================================
  // 6. STATE NGƯỜI DÙNG & TÀI KHOẢN
  // ==========================================================================
  const [users, setUsers] = useState<UserAccountSetting[]>(INITIAL_USERS)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserFullName, setNewUserFullName] = useState("")
  const [newUserRole, setNewUserRole] = useState<"chu" | "nhan_vien">("nhan_vien")

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserEmail.trim()) return

    const newU: UserAccountSetting = {
      id: `u-${Date.now()}`,
      email: newUserEmail.trim(),
      fullName: newUserFullName.trim() || newUserEmail.split("@")[0],
      role: newUserRole,
      isActive: true,
    }
    setUsers([...users, newU])
    setShowAddUserModal(false)
    setNewUserEmail("")
    setNewUserFullName("")
    showToast(`Đã thêm tài khoản ${newU.email}`)
  }

  const handleToggleUserLock = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u
        const newState = !u.isActive
        showToast(`Đã ${newState ? "mở khóa" : "khóa"} tài khoản ${u.email}`)
        return { ...u, isActive: newState }
      })
    )
  }

  // ==========================================================================
  // 7. STATE HOA HỒNG
  // ==========================================================================
  const [commissionAmount, setCommissionAmount] = useState<number>(20000)

  // ==========================================================================
  // 8. STATE THÔNG TIN TRUNG TÂM
  // ==========================================================================
  const [centerName, setCenterName] = useState("Trung tâm Tin học & Ngoại ngữ TVC Trà Vinh")
  const [centerAddress, setCenterAddress] = useState("123 Nguyễn Thiện Thành, Khóm 4, Phường 5, TP. Trà Vinh, Tỉnh Trà Vinh")
  const [centerPhone, setCenterPhone] = useState("0294 3855 678")
  const [centerHotline, setCenterHotline] = useState("0912 345 678")

  // Xử lý chọn mục điều hướng
  const currentSection = (mobileDrillSection || activeSection) as SettingsSection

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#DFE4EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-22 font-semibold text-[#131B2E] tracking-tight">
              Cài đặt hệ thống
            </h1>
            <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5 uppercase">
              Chỉ Quản lý (Chủ)
            </Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Quản trị tham số toàn hệ thống, tài khoản nhân viên và danh mục chuẩn
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. GIAO DIỆN CHÍNH (DESKTOP: LEFT SUB-NAV + CONTENT; MOBILE: DRILL-IN)
      ========================================================================= */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* DESKTOP: LEFT SUB-NAVIGATION (220px) */}
        <div className="hidden md:block w-56 shrink-0 bg-white border border-[#DFE4EC] rounded-[10px] p-2 space-y-0.5">
          {SETTING_NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-[6px] font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? "bg-[#E7EDFB] text-[#1E40AF] font-semibold"
                    : "text-[#131B2E] hover:bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[#1E40AF]" : "text-[#5A6478]"}`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* MOBILE: LIST DRILL-IN (Hiện 8 mục khi chưa chọn mục nào) */}
        <div className="block md:hidden w-full">
          {!mobileDrillSection ? (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] divide-y divide-[#DFE4EC]">
              {SETTING_NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMobileDrillSection(item.id)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-[#F4F6FA] cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#E7EDFB] text-[#1E40AF] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#131B2E]">{item.label}</div>
                        <div className="text-[11px] text-[#5A6478]">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#5A6478]" />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileDrillSection(null)}
                className="h-8 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại danh mục cài đặt</span>
              </Button>
            </div>
          )}
        </div>

        {/* KHUNG NỘI DUNG CHI TIẾT TỪNG MỤC CÀI ĐẶT (FLEX-1) */}
        <div className={`flex-1 w-full ${!mobileDrillSection ? "hidden md:block" : "block"}`}>
          {/* ===================================================================
              MỤC 1: KHÓA HỌC
          =================================================================== */}
          {currentSection === "khoa_hoc" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFE4EC] pb-3">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                    Danh mục khóa học
                  </h3>
                  <p className="text-xs text-[#5A6478]">
                    Quản lý học phí tháng, thời gian học và tài liệu giáo trình
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddCourseModal(true)}
                  className="h-8 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm khóa học</span>
                </Button>
              </div>

              {/* Danh sách khóa học gom nhóm theo Chương trình */}
              <div className="space-y-4 text-xs">
                {["Tin học", "Tiếng Anh"].map((prog) => {
                  const progCourses = courses.filter((c) => c.program === prog)

                  return (
                    <div key={prog} className="space-y-2">
                      <div className="font-bold text-xs uppercase tracking-wider text-[#1E40AF] px-1">
                        Chương trình {prog} ({progCourses.length} khóa học)
                      </div>

                      <div className="border border-[#DFE4EC] rounded-[6px] divide-y divide-[#DFE4EC] overflow-hidden">
                        {progCourses.map((c) => {
                          const totalFee = c.monthlyPrice * c.durationMonths

                          return (
                            <div
                              key={c.id}
                              className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F4F6FA]/50"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[#131B2E] text-xs">
                                    {c.name}
                                  </span>
                                  <Badge variant="neutral" className="text-[10px] font-bold">
                                    {c.prefix}
                                  </Badge>
                                  <span className="text-[10px] text-[#5A6478] bg-[#ECEFF5] px-1.5 py-0.2 rounded">
                                    {c.category}
                                  </span>
                                </div>

                                <div className="text-[11px] text-[#5A6478] mt-1">
                                  Học phí cả khóa:{" "}
                                  <strong className="text-[#131B2E] tabular-nums">
                                    {formatCurrency(c.monthlyPrice)} x {String(c.durationMonths).replace(".", ",")} tháng = {formatCurrency(totalFee)}
                                  </strong>
                                </div>

                                <div className="text-[11px] text-[#1E40AF] hover:underline flex items-center gap-1 mt-0.5">
                                  <FileText className="w-3 h-3" />
                                  <span>{c.curriculumPdf} (Chương trình đào tạo)</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-auto">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={c.isActive}
                                    onChange={() => handleToggleCourseActive(c.id)}
                                    className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                                  />
                                  <span className={`text-[11px] font-semibold ${c.isActive ? "text-[#2F7D4F]" : "text-[#5A6478]"}`}>
                                    {c.isActive ? "Đang mở" : "Ẩn"}
                                  </span>
                                </label>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ===================================================================
              MỤC 2: CA HỌC (4 CA CỐ ĐỊNH)
          =================================================================== */}
          {currentSection === "ca_hoc" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                  4 ca học cố định của trung tâm
                </h3>
                <p className="text-xs text-[#5A6478]">
                  Quy định các khung giờ học định kỳ để tự động xếp thời khóa biểu
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {shifts.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 border border-[#DFE4EC] rounded-[6px] bg-[#F4F6FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[4px] bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {s.name}
                      </div>
                      <div>
                        <div className="font-bold text-[#131B2E] text-xs">
                          {s.name} ({s.weekdays})
                        </div>
                        <div className="text-[11px] text-[#5A6478] tabular-nums mt-0.5">
                          Khung giờ: {s.startTime} - {s.endTime}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="text"
                          value={s.startTime}
                          onChange={(e) => handleUpdateShift(s.id, "startTime", e.target.value)}
                          className="h-8 w-20 text-xs bg-white text-center tabular-nums border-[#DFE4EC]"
                        />
                        <span className="text-[#5A6478]">-</span>
                        <Input
                          type="text"
                          value={s.endTime}
                          onChange={(e) => handleUpdateShift(s.id, "endTime", e.target.value)}
                          className="h-8 w-20 text-xs bg-white text-center tabular-nums border-[#DFE4EC]"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => showToast(`Đã lưu thiết lập ${s.name}`)}
                        className="h-8 text-xs px-2.5 bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                      >
                        Lưu
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MỤC 3: LỚP HỌC (SĨ SỐ MẶC ĐỊNH)
          =================================================================== */}
          {currentSection === "lop_hoc" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                  Cài đặt lớp học mặc định
                </h3>
                <p className="text-xs text-[#5A6478]">
                  Tham số áp dụng tự động khi nhân viên khởi tạo lớp mới
                </p>
              </div>

              <div className="max-w-md space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#131B2E] mb-1">
                    Sĩ số tối đa mặc định (học viên / lớp)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={defaultCapacity}
                      onChange={(e) => setDefaultCapacity(parseInt(e.target.value, 10) || 40)}
                      className="h-9 w-32 text-xs font-bold tabular-nums border-[#DFE4EC]"
                    />
                    <Button
                      size="sm"
                      onClick={() => showToast("Đã lưu sĩ số tối đa mặc định")}
                      className="h-9 text-xs px-4 bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                  <p className="text-[11px] text-[#5A6478] mt-1.5 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>
                      Mỗi lớp học khi tạo mới có thể điều chỉnh lại sĩ số tùy theo phòng máy (PM1, PM2).
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              MỤC 4: HỒ SƠ (CHECKLIST YÊU CẦU)
          =================================================================== */}
          {currentSection === "ho_so" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                  Danh mục hồ sơ yêu cầu
                </h3>
                <p className="text-xs text-[#5A6478]">
                  Danh sách giấy tờ học viên cần nộp để đủ điều kiện xét hồ sơ và hoa hồng
                </p>
              </div>

              {/* Form thêm mục hồ sơ mới */}
              <form onSubmit={handleAddDossierItem} className="flex gap-2 max-w-md text-xs">
                <Input
                  type="text"
                  value={newDossierItemName}
                  onChange={(e) => setNewDossierItemName(e.target.value)}
                  placeholder="Nhập tên giấy tờ mới..."
                  className="h-9 text-xs border-[#DFE4EC]"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Thêm mục</span>
                </Button>
              </form>

              {/* Danh sách các giấy tờ yêu cầu */}
              <div className="border border-[#DFE4EC] rounded-[6px] divide-y divide-[#DFE4EC] max-w-md text-xs">
                {dossierItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between gap-2 hover:bg-[#F4F6FA]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#E7EDFB] text-[#1E40AF] text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-[#131B2E]">{item}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDossierItem(item)}
                      className="text-[#B3382C] hover:bg-[#FBE8E5] p-1 rounded-[4px] cursor-pointer"
                      title="Xóa giấy tờ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MỤC 5: TRƯỜNG VÀ ĐƠN VỊ
          =================================================================== */}
          {currentSection === "truong_don_vi" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                  Trường và đơn vị học viên theo học
                </h3>
                <p className="text-xs text-[#5A6478]">
                  Danh mục trường để gợi ý trong trường "Nơi đến" khi đăng ký học viên mới
                </p>
              </div>

              {/* Form thêm trường/đơn vị */}
              <form onSubmit={handleAddOrg} className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <Input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Tên trường / đơn vị..."
                  className="h-9 text-xs border-[#DFE4EC]"
                  required
                />
                <select
                  value={newOrgType}
                  onChange={(e) =>
                    setNewOrgType(
                      e.target.value as "Cao đẳng" | "Trung cấp" | "Trường khác" | "Khác"
                    )
                  }
                  className="h-9 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                >
                  <option value="Cao đẳng">Cao đẳng</option>
                  <option value="Trung cấp">Trung cấp</option>
                  <option value="Trường khác">Trường khác</option>
                  <option value="Khác">Khác</option>
                </select>
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Thêm trường / đơn vị</span>
                </Button>
              </form>

              {/* Danh sách trường/đơn vị */}
              <div className="border border-[#DFE4EC] rounded-[6px] divide-y divide-[#DFE4EC] text-xs">
                {organizations.map((org) => (
                  <div
                    key={org.id}
                    className="p-3 flex items-center justify-between gap-2 hover:bg-[#F4F6FA]"
                  >
                    <div>
                      <span className="font-semibold text-[#131B2E]">{org.name}</span>
                      <Badge variant="neutral" className="ml-2 text-[10px]">
                        {org.type}
                      </Badge>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={org.isActive}
                        onChange={() => handleToggleOrg(org.id)}
                        className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                      />
                      <span className={`text-[11px] font-semibold ${org.isActive ? "text-[#2F7D4F]" : "text-[#5A6478]"}`}>
                        {org.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MỤC 6: NGƯỜI DÙNG & TÀI KHOẢN (USER & ROLE)
          =================================================================== */}
          {currentSection === "nguoi_dung" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#DFE4EC] pb-3">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                    Tài khoản người dùng & phân quyền
                  </h3>
                  <p className="text-xs text-[#5A6478]">
                    Quản lý danh sách tài khoản nhân viên vận hành trung tâm
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowAddUserModal(true)}
                  className="h-8 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm người dùng</span>
                </Button>
              </div>

              {/* Tóm tắt phân quyền theo thiết kế */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#E7EDFB]/40 border border-[#BFDBFE] rounded-[6px] space-y-1">
                  <div className="font-bold text-[#1E40AF] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Quyền Chủ (Toàn quyền):</span>
                  </div>
                  <p className="text-[11px] text-[#131B2E] leading-relaxed">
                    Xem toàn bộ dữ liệu, doanh thu, hoa hồng; cấp bằng tốt nghiệp, xóa học viên và hủy phiếu thu.
                  </p>
                </div>

                <div className="p-3 bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] space-y-1">
                  <div className="font-bold text-[#131B2E] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#5A6478]" />
                    <span>Quyền Nhân viên:</span>
                  </div>
                  <p className="text-[11px] text-[#5A6478] leading-relaxed">
                    Thêm và sửa học viên, đăng ký lớp, ghi nhận thu tiền, nhập điểm thi. Không xem được doanh thu, hoa hồng; không xóa hay hủy phiếu.
                  </p>
                </div>
              </div>

              {/* Bảng danh sách tài khoản */}
              <div className="border border-[#DFE4EC] rounded-[6px] divide-y divide-[#DFE4EC] text-xs">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-[#F4F6FA]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#131B2E]">{u.fullName}</span>
                        {u.role === "chu" ? (
                          <Badge variant="default" className="text-[10px] font-bold">
                            Chủ
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">
                            Nhân viên
                          </Badge>
                        )}
                        {!u.isActive && (
                          <Badge variant="danger" className="text-[10px]">
                            Đã khóa
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-[#5A6478] mt-0.5">{u.email}</div>
                    </div>

                    <div>
                      {u.role !== "chu" && (
                        <Button
                          variant={u.isActive ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleUserLock(u.id)}
                          className="h-7 text-xs font-medium cursor-pointer"
                        >
                          {u.isActive ? (
                            <span className="text-[#B3382C] flex items-center gap-1">
                              <Lock className="w-3 h-3" /> Khóa tài khoản
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Unlock className="w-3 h-3" /> Mở khóa
                            </span>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
              MỤC 7: HOA HỒNG (COMMISSION POLICY)
          =================================================================== */}
          {currentSection === "hoa_hong" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                  Chính sách hoa hồng giới thiệu
                </h3>
                <p className="text-xs text-[#5A6478]">
                  Cài đặt định mức hoa hồng cho mạng lưới Thầy/Cô giới thiệu tuyển sinh
                </p>
              </div>

              <div className="max-w-md space-y-4 text-xs">
                {/* Số tiền mỗi hồ sơ */}
                <div>
                  <label className="block font-semibold text-[#131B2E] mb-1">
                    Số tiền mỗi hồ sơ (₫)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={commissionAmount.toLocaleString("vi-VN")}
                      onChange={(e) => {
                        const raw = parseInt(e.target.value.replace(/\D/g, "") || "0", 10)
                        setCommissionAmount(raw)
                      }}
                      className="h-9 w-40 text-xs font-bold tabular-nums border-[#DFE4EC]"
                    />
                    <Button
                      size="sm"
                      onClick={() => showToast("Đã lưu định mức hoa hồng")}
                      className="h-9 text-xs px-4 bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                    >
                      Lưu định mức
                    </Button>
                  </div>
                </div>

                {/* Điều kiện đủ (Quy tắc cố định) */}
                <div className="p-3 bg-[#E7EDFB]/50 border border-[#BFDBFE] rounded-[6px] space-y-1">
                  <div className="font-bold text-[#1E40AF] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Điều kiện đủ chi trả:</span>
                  </div>
                  <p className="text-xs text-[#131B2E] leading-relaxed">
                    Đủ hồ sơ và có khoản đóng đầu tiên (bất kỳ số tiền nào).
                  </p>
                </div>

                {/* Giải thích nút toggle theo người giới thiệu */}
                <div className="p-3 bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] space-y-1 text-[#5A6478]">
                  <div className="font-bold text-[#131B2E] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-[#1E40AF]" />
                    <span>Quy định bật/tắt nhận hoa hồng:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Thầy/Cô giới thiệu được bật nhận hoa hồng; bạn bè và học viên cũ mặc định tắt nhận hoa hồng.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              MỤC 8: THÔNG TIN TRUNG TÂM (RECEIPTS & LOGO)
          =================================================================== */}
          {currentSection === "thong_tin_trung_tam" && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 md:p-5 space-y-4">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h3 className="text-sm md:text-base font-bold text-[#131B2E]">
                  Thông tin trung tâm & in phiếu thu
                </h3>
                <p className="text-xs text-[#5A6478]">
                  Thông tin pháp lý hiển thị trên phiếu thu, biên lai và danh sách lớp học
                </p>
              </div>

              <div className="max-w-xl space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-[#131B2E] mb-1">
                    Tên trung tâm *
                  </label>
                  <Input
                    type="text"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#131B2E] mb-1">
                    Địa chỉ cơ sở *
                  </label>
                  <Input
                    type="text"
                    value={centerAddress}
                    onChange={(e) => setCenterAddress(e.target.value)}
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#131B2E] mb-1">
                      Số điện thoại bàn
                    </label>
                    <Input
                      type="text"
                      value={centerPhone}
                      onChange={(e) => setCenterPhone(e.target.value)}
                      className="h-9 text-xs border-[#DFE4EC]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#131B2E] mb-1">
                      Hotline / Zalo liên hệ
                    </label>
                    <Input
                      type="text"
                      value={centerHotline}
                      onChange={(e) => setCenterHotline(e.target.value)}
                      className="h-9 text-xs border-[#DFE4EC]"
                    />
                  </div>
                </div>

                {/* Logo Upload Placeholder */}
                <div>
                  <label className="block font-semibold text-[#131B2E] mb-1">
                    Logo trung tâm (in trên phiếu thu)
                  </label>
                  <div className="p-4 border border-dashed border-[#DFE4EC] rounded-[6px] flex items-center justify-between bg-[#F4F6FA]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[6px] bg-[#1E40AF] text-white flex items-center justify-center font-bold text-base tracking-wider">
                        TVC
                      </div>
                      <div>
                        <div className="font-bold text-[#131B2E]">logo_tvc_center.png</div>
                        <div className="text-[11px] text-[#5A6478]">PNG hoặc SVG • Tối đa 2MB</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => showToast("Đã tải logo mới lên")}
                      className="h-8 text-xs font-medium cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      <span>Thay logo</span>
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={() => showToast("Đã lưu thông tin trung tâm")}
                    className="h-9 text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                  >
                    Lưu thông tin trung tâm
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          MODAL: THÊM KHÓA HỌC MỚI
      ========================================================================= */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-lg p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">Thêm khóa học mới</h3>
                <p className="text-xs text-[#5A6478] mt-0.5">Khởi tạo chương trình và đơn giá theo tháng</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCourseModal(false)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Chương trình *
                  </label>
                  <select
                    value={newProgram}
                    onChange={(e) => setNewProgram(e.target.value as "Tin học" | "Tiếng Anh")}
                    className="w-full h-9 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                  >
                    <option value="Tin học">Tin học</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Phân loại *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full h-9 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                  >
                    <option value="Thiếu nhi">Thiếu nhi</option>
                    <option value="Chứng chỉ">Chứng chỉ</option>
                    <option value="IELTS">IELTS</option>
                    <option value="Giao tiếp">Giao tiếp</option>
                    <option value="Tin học Ứng dụng">Tin học Ứng dụng</option>
                    <option value="Tin học Nâng cao">Tin học Nâng cao</option>
                    <option value="Lập trình">Lập trình</option>
                    <option value="Chứng chỉ quốc tế">Chứng chỉ quốc tế</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Tên khóa học *
                  </label>
                  <Input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="Ví dụ: Thiết kế Website Cơ bản"
                    required
                    className="h-9 text-xs border-[#DFE4EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Mã viết tắt *
                  </label>
                  <Input
                    type="text"
                    value={newPrefix}
                    onChange={(e) => setNewPrefix(e.target.value)}
                    placeholder="WEB"
                    required
                    className="h-9 text-xs uppercase border-[#DFE4EC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Giá theo tháng (₫) *
                  </label>
                  <Input
                    type="number"
                    step="50000"
                    value={newMonthlyPrice}
                    onChange={(e) => setNewMonthlyPrice(parseInt(e.target.value, 10) || 0)}
                    required
                    className="h-9 text-xs font-semibold tabular-nums border-[#DFE4EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Thời gian học (tháng) *
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newDurationMonths}
                    onChange={(e) => setNewDurationMonths(parseFloat(e.target.value) || 1)}
                    required
                    className="h-9 text-xs font-semibold tabular-nums border-[#DFE4EC]"
                  />
                </div>
              </div>

              {/* Dòng tính toán tổng học phí chuẩn câu văn */}
              <div className="p-2.5 bg-[#E7EDFB]/50 border border-[#BFDBFE] rounded-[6px] text-xs font-semibold text-[#1E40AF]">
                {computedCourseTotal}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Liên kết PDF Chương trình đào tạo
                </label>
                <Input
                  type="text"
                  value={newCurriculumPdf}
                  onChange={(e) => setNewCurriculumPdf(e.target.value)}
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DFE4EC]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                  />
                  <span className="font-semibold text-xs">Mở đăng ký ngay</span>
                </label>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddCourseModal(false)}
                    className="h-8 text-xs"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="h-8 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                  >
                    Tạo khóa học
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM NGƯỜI DÙNG MỚI
      ========================================================================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">Thêm người dùng mới</h3>
                <p className="text-xs text-[#5A6478] mt-0.5">Tạo tài khoản đăng nhập cho nhân viên</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Email đăng nhập *
                </label>
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="nhan_vien@tvc.edu.vn"
                  required
                  autoFocus
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Họ và tên
                </label>
                <Input
                  type="text"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                  placeholder="Ví dụ: Lê Thị Hồng"
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Vai trò (Role) *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as "chu" | "nhan_vien")}
                  className="w-full h-9 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                >
                  <option value="nhan_vien">Nhân viên (Thao tác cơ bản)</option>
                  <option value="chu">Chủ (Toàn quyền quản lý)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddUserModal(false)}
                  className="h-9 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                >
                  Tạo tài khoản
                </Button>
              </div>
            </form>
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
