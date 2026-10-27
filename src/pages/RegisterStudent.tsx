import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  ArrowLeft,
  Check,
  Search,
  AlertCircle,
  Phone,
} from "lucide-react"

// Danh sách các khóa học mẫu chuẩn TVC Center
const COURSES = [
  {
    id: "c-1",
    name: "Tiếng Anh giao tiếp",
    program: "Tiếng Anh",
    category: "Giao tiếp",
    monthlyPrice: 400000,
    durationMonths: 2.5,
    totalPrice: 1000000,
    codePrefix: "TAGT",
  },
  {
    id: "c-2",
    name: "Ứng dụng CNTT Cơ bản",
    program: "Tin học",
    category: "Chứng chỉ quốc gia",
    monthlyPrice: 400000,
    durationMonths: 2.5,
    totalPrice: 1000000,
    codePrefix: "UDCNTTCB",
  },
  {
    id: "c-3",
    name: "Ứng dụng CNTT Nâng cao",
    program: "Tin học",
    category: "Chứng chỉ quốc gia",
    monthlyPrice: 450000,
    durationMonths: 2.5,
    totalPrice: 1125000,
    codePrefix: "UDCNTTNC",
  },
  {
    id: "c-4",
    name: "Luyện thi KET 1-2",
    program: "Tiếng Anh",
    category: "Cambridge",
    monthlyPrice: 400000,
    durationMonths: 3.0,
    totalPrice: 1200000,
    codePrefix: "KET",
  },
  {
    id: "c-5",
    name: "Pre-Ielts",
    program: "Tiếng Anh",
    category: "IELTS",
    monthlyPrice: 600000,
    durationMonths: 3.0,
    totalPrice: 1800000,
    codePrefix: "PREIELTS",
  },
  {
    id: "c-6",
    name: "Ielts 5.0 - 6.5",
    program: "Tiếng Anh",
    category: "IELTS",
    monthlyPrice: 800000,
    durationMonths: 3.0,
    totalPrice: 2400000,
    codePrefix: "IELTS",
  },
  {
    id: "c-7",
    name: "Chứng chỉ IC3 - GS6",
    program: "Tin học",
    category: "Chứng chỉ quốc tế",
    monthlyPrice: 500000,
    durationMonths: 3.0,
    totalPrice: 1500000,
    codePrefix: "IC3",
  },
]

// Danh sách các lớp học đang mở đăng ký
const AVAILABLE_CLASSES = [
  {
    id: "cl-1",
    courseId: "c-1",
    code: "TAGT_K0126_Ca1PM1",
    name: "Tiếng Anh giao tiếp K0126",
    shift: "Ca 1 (T2-4-6, 18:30-20:30)",
    room: "Phòng máy 1",
    teacher: "Cô Mai Anh",
    seatsLeft: 4,
  },
  {
    id: "cl-2",
    courseId: "c-2",
    code: "UDCNTTCB_K0126_Ca1PM1",
    name: "Ứng dụng CNTT Cơ bản K0126",
    shift: "Ca 1 (T2-4-6, 18:30-20:30)",
    room: "Phòng máy 1",
    teacher: "Thầy Tuấn",
    seatsLeft: 8,
  },
  {
    id: "cl-3",
    courseId: "c-2",
    code: "UDCNTTCB_K0126_Ca2PM2",
    name: "Ứng dụng CNTT Cơ bản K0126 - Ca 2",
    shift: "Ca 2 (T3-5-7, 18:30-20:30)",
    room: "Phòng máy 2",
    teacher: "Thầy Tuấn",
    seatsLeft: 12,
  },
  {
    id: "cl-4",
    courseId: "c-5",
    code: "PREIELTS_K0126_Ca1PM2",
    name: "Pre-Ielts K0126",
    shift: "Ca 1 (T2-4-6, 18:30-20:30)",
    room: "Phòng máy 2",
    teacher: "Cô Hương",
    seatsLeft: 6,
  },
  {
    id: "cl-5",
    courseId: "c-7",
    code: "IC3_K0126_Ca2PM2",
    name: "Chứng chỉ IC3 - GS6 K0126",
    shift: "Ca 2 (T3-5-7, 18:30-20:30)",
    room: "Phòng máy 2",
    teacher: "Thầy Tuấn",
    seatsLeft: 15,
  },
]

// Danh sách trường / đơn vị mẫu
const ORGANIZATIONS = [
  "Trường CĐ nghề Trà Vinh",
  "Trường ĐH Trà Vinh",
  "Trường CĐ Y tế Trà Vinh",
  "THPT Chuyên Nguyễn Thiện Thành",
  "THPT Phạm Thái Bường",
  "Đơn vị khác",
]

// Danh sách Thầy/Cô giới thiệu
const REFERRERS = [
  { id: "ref-1", name: "Cô Mai Anh", phone: "0908 111 222", org: "ĐH Trà Vinh" },
  { id: "ref-2", name: "Thầy Tuấn", phone: "0909 333 444", org: "CĐ Nghề" },
  { id: "ref-3", name: "Cô Hương", phone: "0912 555 666", org: "Ngoại ngữ TVC" },
]

export const RegisterStudent: React.FC = () => {
  const navigate = useNavigate()
  const { isOwner } = useAuth()

  // Quản lý bước (1 -> 4)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // -------------------------------------------------------------
  // BƯỚC 1: Thông tin học viên
  // -------------------------------------------------------------
  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [gender, setGender] = useState<"nam" | "nu" | "khac">("nam")
  const [dob, setDob] = useState("")
  const [parentName, setParentName] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [phone, setPhone] = useState("")
  const [showPhoneAlt, setShowPhoneAlt] = useState(false)
  const [phoneAlt, setPhoneAlt] = useState("")
  const [placeOfBirth, setPlaceOfBirth] = useState("")
  const [organization, setOrganization] = useState(ORGANIZATIONS[0])
  const [organizationCustom, setOrganizationCustom] = useState("")
  const [organizationDetail, setOrganizationDetail] = useState("")
  const [zaloStatus, setZaloStatus] = useState("chua_lien_he")

  // Hồ sơ (Tùy chọn)
  const [citizenId, setCitizenId] = useState("")
  const [citizenIdDate, setCitizenIdDate] = useState("")
  const [citizenIdPlace, setCitizenIdPlace] = useState("")
  const [dossierCccd, setDossierCccd] = useState(false)
  const [dossierPhotos, setDossierPhotos] = useState(false)
  const [notes, setNotes] = useState("")

  // -------------------------------------------------------------
  // BƯỚC 2: Chọn khóa học và lớp
  // -------------------------------------------------------------
  const [selectedCourseId, setSelectedCourseId] = useState<string>("c-1")
  const [selectedClassOption, setSelectedClassOption] = useState<"class" | "later">("class")
  const [selectedClassId, setSelectedClassId] = useState<string>("cl-1")
  const [preferredShift, setPreferredShift] = useState("Ca 1")
  const [classSearch, setClassSearch] = useState("")

  // -------------------------------------------------------------
  // BƯỚC 3: Học phí
  // -------------------------------------------------------------
  const selectedCourse = useMemo(() => {
    return COURSES.find((c) => c.id === selectedCourseId) || COURSES[0]
  }, [selectedCourseId])

  const [customCoursePrice, setCustomCoursePrice] = useState<number | null>(null)
  const activeCoursePrice = customCoursePrice ?? selectedCourse.totalPrice

  const [discountType, setDiscountType] = useState<"amount" | "percent">("amount")
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [discountReason, setDiscountReason] = useState("")

  // Tính số tiền giảm
  const discountAmount = useMemo(() => {
    if (discountType === "percent") {
      return Math.round((activeCoursePrice * (discountValue || 0)) / 100)
    }
    return discountValue || 0
  }, [discountType, discountValue, activeCoursePrice])

  // Thành tiền (Net amount)
  const netAmount = Math.max(0, activeCoursePrice - discountAmount)

  // Số tiền đóng ngay (Mặc định điền sẵn bằng Thành tiền)
  const [paidNow, setPaidNow] = useState<number>(netAmount)
  const [paymentDate] = useState<string>(formatDate(new Date()))
  const [paymentMethod, setPaymentMethod] = useState<"Tiền mặt" | "Chuyển khoản" | "Khác">("Chuyển khoản")
  const [paymentNote, setPaymentNote] = useState("")
  const [balanceDueDate, setBalanceDueDate] = useState("")

  // Khi netAmount thay đổi do đổi khóa học hoặc giảm giá, tự động update paidNow nếu người dùng chưa sửa tay
  React.useEffect(() => {
    setPaidNow(netAmount)
  }, [netAmount])

  // -------------------------------------------------------------
  // BƯỚC 4: Người giới thiệu
  // -------------------------------------------------------------
  const [referrerType, setReferrerType] = useState<"none" | "teacher" | "student" | "other">("none")
  const [selectedTeacherId, setSelectedTeacherId] = useState(REFERRERS[0].id)
  const [customReferrerName, setCustomReferrerName] = useState("")
  const [customReferrerPhone, setCustomReferrerPhone] = useState("")

  // Thông báo toast thành công
  const [successToast, setSuccessToast] = useState<string | null>(null)
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({})
  const [step3Error, setStep3Error] = useState<string | null>(null)

  // Tính tuổi học viên
  const isUnder18 = useMemo(() => {
    if (!dob) return false
    const birthYear = new Date(dob).getFullYear()
    const currentYear = new Date().getFullYear()
    return currentYear - birthYear < 18
  }, [dob])

  // Kiểm tra trùng SĐT mẫu
  const phoneDuplicateWarning = useMemo(() => {
    const clean = phone.replace(/\s+/g, "")
    if (clean === "0903888999" || clean === "0912345678") {
      return "Số này đã có học viên Nguyễn Thị Hà. Xem hồ sơ?"
    }
    return null
  }, [phone])

  // Lọc lớp theo khóa học đã chọn
  const filteredClasses = useMemo(() => {
    return AVAILABLE_CLASSES.filter((cl) => {
      if (cl.courseId !== selectedCourseId) return false
      if (classSearch.trim()) {
        const q = classSearch.toLowerCase()
        return cl.code.toLowerCase().includes(q) || cl.teacher.toLowerCase().includes(q)
      }
      return true
    })
  }, [selectedCourseId, classSearch])

  // Xử lý chuyển bước 1 -> 2
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    if (!lastName.trim()) errors.lastName = "Vui lòng nhập họ và chữ lót."
    if (!firstName.trim()) errors.firstName = "Vui lòng nhập tên học viên."
    if (!phone.trim()) errors.phone = "Vui lòng nhập số điện thoại liên hệ / Zalo."
    if (isUnder18) {
      if (!parentName.trim()) errors.parentName = "Học viên dưới 18 tuổi cần có họ tên phụ huynh."
      if (!parentPhone.trim()) errors.parentPhone = "Vui lòng nhập số điện thoại phụ huynh."
    }

    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors)
      return
    }
    setStep1Errors({})
    setStep(2)
  }

  // Xử lý chuyển bước 2 -> 3
  const handleNextStep2 = () => {
    setStep(3)
  }

  // Xử lý chuyển bước 3 -> 4
  const handleNextStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    if (paidNow > netAmount) {
      setStep3Error(`Số tiền vượt học phí. Nhập tối đa ${formatCurrency(netAmount)}.`)
      return
    }
    if (discountAmount > 0 && !discountReason.trim()) {
      setStep3Error("Vui lòng nhập lý do giảm giá học phí.")
      return
    }
    setStep3Error(null)
    setStep(4)
  }

  // Hoàn tất đăng ký
  const handleCompleteRegistration = () => {
    const fullName = `${lastName.trim()} ${firstName.trim()}`
    const finalClassCode =
      selectedClassOption === "class"
        ? AVAILABLE_CLASSES.find((c) => c.id === selectedClassId)?.code || "Lớp học"
        : "Chờ xếp lớp"

    setSuccessToast(`Đã đăng ký ${fullName} vào ${finalClassCode}`)

    // Tự động điều hướng sau 2 giây
    setTimeout(() => {
      navigate("/hoc-vien")
    }, 1800)
  }

  // Đối tượng hiển thị tóm tắt live
  const selectedClass = AVAILABLE_CLASSES.find((c) => c.id === selectedClassId)
  const remainingBalance = Math.max(0, netAmount - paidNow)

  return (
    <div className="p-4 md:p-8 max-w-[1200px] w-full mx-auto space-y-6 font-sans">
      {/* Toast thông báo thành công */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#131B2E] text-white px-4 py-3 rounded-[6px] shadow-xl text-sm flex items-center gap-2 border border-[#DFE4EC]/20 animate-in fade-in slide-in-from-bottom duration-200">
          <Check className="w-4 h-4 text-[#2F7D4F]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header & Slim Progress Indicator */}
      <div className="border-b border-[#DFE4EC] pb-4">
        <button
          onClick={() => navigate("/hoc-vien")}
          className="inline-flex items-center gap-1.5 text-xs text-[#5A6478] hover:text-[#1E40AF] transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Hủy và quay lại danh sách</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-[22px] leading-[30px] font-semibold text-[#131B2E]">
              Đăng ký học viên mới
            </h1>
            <p className="text-xs text-[#5A6478] mt-0.5">
              Quy trình tiếp nhận, chọn lớp và ghi nhận học phí ban đầu
            </p>
          </div>

          {/* Slim progress indicator (Text + thin line, no decorative numbers) */}
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <span className="text-xs font-semibold text-[#1E40AF] tabular-nums">
              Bước {step} trên 4
            </span>
            <div className="w-36 h-1.5 bg-[#DFE4EC] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1E40AF] transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BỐ CỤC CHÍNH: 2 CỘT TRÊN DESKTOP (Trái: Form 4 bước, Phải: Sticky Summary)
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ==================== CỘT TRÁI (FORM 4 BƯỚC) ==================== */}
        <div className="lg:col-span-2 space-y-6">
          {/* ===================================================================
              BƯỚC 1: THÔNG TIN HỌC VIÊN
          =================================================================== */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 sm:p-6 shadow-none space-y-5">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h2 className="text-base font-semibold text-[#131B2E]">
                  Bước 1: Thông tin học viên
                </h2>
                <p className="text-xs text-[#5A6478]">
                  Điền các thông tin cá nhân và thông tin liên hệ Zalo
                </p>
              </div>

              {/* Họ & Tên (2 trường riêng biệt) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Họ và chữ lót <span className="text-[#B3382C]">*</span>
                  </label>
                  <Input
                    placeholder="Nguyễn Thị"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={step1Errors.lastName ? "border-[#B3382C]" : ""}
                    required
                  />
                  {step1Errors.lastName && (
                    <p className="text-[11px] text-[#B3382C] mt-1">{step1Errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Tên <span className="text-[#B3382C]">*</span>
                  </label>
                  <Input
                    placeholder="Hà"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={step1Errors.firstName ? "border-[#B3382C]" : ""}
                    required
                  />
                  {step1Errors.firstName && (
                    <p className="text-[11px] text-[#B3382C] mt-1">{step1Errors.firstName}</p>
                  )}
                </div>
              </div>

              {/* Giới tính & Ngày sinh */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Giới tính
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "nam" | "nu" | "khac")}
                    className="w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                  >
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Ngày sinh (dd/MM/yyyy)
                  </label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Nếu tuổi < 18: Yêu cầu họ tên và sđt phụ huynh */}
              {isUnder18 && (
                <div className="p-3.5 bg-[#FBF0DC] border border-[#A86A0B]/40 rounded-[6px] space-y-3">
                  <div className="text-xs font-semibold text-[#A86A0B] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Học viên dưới 18 tuổi (Cần thông tin phụ huynh)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#131B2E] mb-1">
                        Họ tên phụ huynh <span className="text-[#B3382C]">*</span>
                      </label>
                      <Input
                        placeholder="Nguyễn Văn A"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="bg-white h-9"
                        required
                      />
                      {step1Errors.parentName && (
                        <p className="text-[11px] text-[#B3382C] mt-1">{step1Errors.parentName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#131B2E] mb-1">
                        SĐT phụ huynh <span className="text-[#B3382C]">*</span>
                      </label>
                      <Input
                        placeholder="0912 345 678"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="bg-white h-9"
                        required
                      />
                      {step1Errors.parentPhone && (
                        <p className="text-[11px] text-[#B3382C] mt-1">{step1Errors.parentPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Số điện thoại / Zalo (Có cảnh báo trùng) */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Số điện thoại liên hệ / Zalo <span className="text-[#B3382C]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#5A6478] absolute left-3 top-2.5 pointer-events-none" />
                    <Input
                      type="tel"
                      placeholder="0912 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`pl-9 ${phoneDuplicateWarning ? "border-[#A86A0B]" : ""}`}
                      required
                    />
                  </div>

                  {/* Cảnh báo trùng SĐT */}
                  {phoneDuplicateWarning && (
                    <div className="mt-1.5 p-2 bg-[#FBF0DC] border border-[#A86A0B]/40 rounded-[6px] text-xs text-[#A86A0B] flex items-center justify-between">
                      <span>{phoneDuplicateWarning}</span>
                      <button
                        type="button"
                        onClick={() => navigate("/hoc-vien")}
                        className="underline font-semibold ml-2"
                      >
                        Xem
                      </button>
                    </div>
                  )}

                  {/* Quiet link thêm số phụ */}
                  {!showPhoneAlt && (
                    <button
                      type="button"
                      onClick={() => setShowPhoneAlt(true)}
                      className="text-xs text-[#5A6478] hover:text-[#1E40AF] mt-1.5 inline-block cursor-pointer"
                    >
                      + Thêm số điện thoại phụ
                    </button>
                  )}
                </div>

                {showPhoneAlt && (
                  <div>
                    <label className="block text-xs font-medium text-[#131B2E] mb-1">
                      Số điện thoại phụ (Tùy chọn)
                    </label>
                    <Input
                      type="tel"
                      placeholder="0988 777 666"
                      value={phoneAlt}
                      onChange={(e) => setPhoneAlt(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Nơi sinh & Trạng thái Zalo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Nơi sinh (Tỉnh / Thành phố)
                  </label>
                  <Input
                    placeholder="Trà Vinh, Vĩnh Long..."
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Trạng thái kết nối Zalo
                  </label>
                  <select
                    value={zaloStatus}
                    onChange={(e) => setZaloStatus(e.target.value)}
                    className="w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                  >
                    <option value="chua_lien_he">Chưa liên hệ</option>
                    <option value="da_lien_he">Đã liên hệ</option>
                    <option value="da_vao_nhom">Đã vào nhóm Zalo</option>
                    <option value="khong_tim_thay">Không tìm thấy Zalo</option>
                    <option value="chan_tin_nhan">Chặn tin nhắn</option>
                  </select>
                </div>
              </div>

              {/* Nơi đến (Trường/Đơn vị) & Chi tiết */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Nơi đến (Trường / Đơn vị)
                  </label>
                  <select
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                  >
                    {ORGANIZATIONS.map((org) => (
                      <option key={org} value={org}>
                        {org}
                      </option>
                    ))}
                  </select>
                  {organization === "Đơn vị khác" && (
                    <Input
                      placeholder="Nhập tên trường hoặc đơn vị..."
                      value={organizationCustom}
                      onChange={(e) => setOrganizationCustom(e.target.value)}
                      className="mt-2 text-xs"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Chi tiết (Lớp, ngành hoặc khoa)
                  </label>
                  <Input
                    placeholder="lớp Thú y - CD11, Kế toán K20..."
                    value={organizationDetail}
                    onChange={(e) => setOrganizationDetail(e.target.value)}
                  />
                </div>
              </div>

              {/* Mục Hồ sơ (Tùy chọn điền sau) */}
              <div className="p-4 border border-[#DFE4EC] rounded-[8px] bg-[#F4F6FA] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#131B2E]">
                    Hồ sơ nhập học (Tùy chọn - có thể bổ sung sau)
                  </span>
                  <Badge variant="neutral" className="text-[10px]">Tùy chọn</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-[#5A6478] mb-1">
                      Số CCCD (12 số)
                    </label>
                    <Input
                      placeholder="079•••••••12"
                      value={citizenId}
                      onChange={(e) => setCitizenId(e.target.value)}
                      className="bg-white h-8 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#5A6478] mb-1">
                      Ngày cấp
                    </label>
                    <Input
                      type="date"
                      value={citizenIdDate}
                      onChange={(e) => setCitizenIdDate(e.target.value)}
                      className="bg-white h-8 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#5A6478] mb-1">
                      Nơi cấp
                    </label>
                    <Input
                      placeholder="Cục CS QLHC về TTXH"
                      value={citizenIdPlace}
                      onChange={(e) => setCitizenIdPlace(e.target.value)}
                      className="bg-white h-8 text-xs"
                    />
                  </div>
                </div>

                {/* Dossier checklist */}
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#131B2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dossierCccd}
                      onChange={(e) => setDossierCccd(e.target.checked)}
                      className="rounded border-[#DFE4EC] text-[#1E40AF]"
                    />
                    <span>Đã nộp Bản sao CCCD</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-[#131B2E] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dossierPhotos}
                      onChange={(e) => setDossierPhotos(e.target.checked)}
                      className="rounded border-[#DFE4EC] text-[#1E40AF]"
                    />
                    <span>Đã nộp 02 hình 3x4</span>
                  </label>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Ghi chú tiếp nhận
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về học viên..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-[6px] border border-[#DFE4EC] p-2.5 text-xs text-[#131B2E] outline-none"
                />
              </div>

              {/* Button Next Step */}
              <div className="pt-2 flex justify-end">
                <Button type="submit" className="w-full sm:w-auto px-6 h-10">
                  <span>Tiếp tục: Chọn khóa học</span>
                </Button>
              </div>
            </form>
          )}

          {/* ===================================================================
              BƯỚC 2: CHỌN KHÓA HỌC VÀ LỚP
          =================================================================== */}
          {step === 2 && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 sm:p-6 shadow-none space-y-5">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h2 className="text-base font-semibold text-[#131B2E]">
                  Bước 2: Chọn khóa học và lớp học
                </h2>
                <p className="text-xs text-[#5A6478]">
                  Chọn chương trình đào tạo và sắp lớp hoặc đăng ký chờ xếp lớp
                </p>
              </div>

              {/* Danh sách khóa học */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6478]">
                  1. Chọn khóa học
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {COURSES.map((course) => {
                    const isSelected = selectedCourseId === course.id
                    return (
                      <div
                        key={course.id}
                        onClick={() => {
                          setSelectedCourseId(course.id)
                          // Chọn lớp đầu tiên phù hợp nếu có
                          const matched = AVAILABLE_CLASSES.find((c) => c.courseId === course.id)
                          if (matched) setSelectedClassId(matched.id)
                        }}
                        className={`p-3 rounded-[6px] border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#E7EDFB] border-[#1E40AF]"
                            : "bg-white border-[#DFE4EC] hover:bg-[#F4F6FA]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#131B2E]">
                            {course.name}
                          </span>
                          <span className="text-[10px] text-[#5A6478] bg-white px-1.5 py-0.5 rounded border border-[#DFE4EC]">
                            {course.program}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5A6478] mt-1 tabular-nums">
                          {formatCurrency(course.monthlyPrice)} / tháng &bull; {course.durationMonths} tháng
                        </div>
                        <div className="text-xs font-semibold text-[#1E40AF] mt-1 tabular-nums">
                          Tổng: {formatCurrency(course.totalPrice)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tùy chọn xếp lớp */}
              <div className="space-y-3 pt-3 border-t border-[#DFE4EC]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6478]">
                  2. Chọn lớp học hoặc để sau
                </label>

                {/* Option 1: Vào lớp đang mở */}
                <div
                  onClick={() => setSelectedClassOption("class")}
                  className={`p-3.5 rounded-[8px] border cursor-pointer transition-colors ${
                    selectedClassOption === "class"
                      ? "border-[#1E40AF] bg-white ring-1 ring-[#1E40AF]"
                      : "border-[#DFE4EC] bg-white hover:bg-[#F4F6FA]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#131B2E]">
                      Xếp vào lớp đang mở đăng ký ({filteredClasses.length} lớp phù hợp)
                    </span>
                    <input
                      type="radio"
                      checked={selectedClassOption === "class"}
                      onChange={() => setSelectedClassOption("class")}
                    />
                  </div>

                  {selectedClassOption === "class" && (
                    <div className="space-y-2 pt-2 border-t border-[#DFE4EC]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#5A6478] absolute left-2.5 top-2.5" />
                        <Input
                          placeholder="Tìm lớp theo mã hoặc giáo viên..."
                          value={classSearch}
                          onChange={(e) => setClassSearch(e.target.value)}
                          className="h-8 pl-8 text-xs"
                        />
                      </div>

                      {filteredClasses.length === 0 ? (
                        <p className="text-xs text-[#5A6478] py-2 italic">
                          Chưa có lớp nào đang mở cho khóa học này. Hãy chọn &apos;Để xếp lớp sau&apos;.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {filteredClasses.map((cl) => {
                            const isChosen = selectedClassId === cl.id
                            return (
                              <div
                                key={cl.id}
                                onClick={() => setSelectedClassId(cl.id)}
                                className={`p-2.5 rounded-[6px] border text-xs flex items-center justify-between cursor-pointer ${
                                  isChosen
                                    ? "bg-[#E7EDFB] border-[#1E40AF]"
                                    : "bg-[#F4F6FA] border-[#DFE4EC] hover:bg-[#ECEFF5]"
                                }`}
                              >
                                <div>
                                  <div className="font-mono font-semibold text-[#131B2E]">
                                    {cl.code}
                                  </div>
                                  <div className="text-[11px] text-[#5A6478] mt-0.5">
                                    {cl.shift} &bull; {cl.room} &bull; {cl.teacher}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] font-medium text-[#2F7D4F] bg-[#E6F3EA] px-2 py-0.5 rounded-full">
                                    Còn {cl.seatsLeft} chỗ
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Option 2: Để xếp lớp sau */}
                <div
                  onClick={() => setSelectedClassOption("later")}
                  className={`p-3.5 rounded-[8px] border cursor-pointer transition-colors ${
                    selectedClassOption === "later"
                      ? "border-[#1E40AF] bg-white ring-1 ring-[#1E40AF]"
                      : "border-[#DFE4EC] bg-white hover:bg-[#F4F6FA]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-[#131B2E]">
                        Để xếp lớp sau (Lưu trạng thái Chờ xếp lớp)
                      </span>
                      <p className="text-[11px] text-[#5A6478] mt-0.5">
                        Dành cho học viên chưa chốt được ca học cụ thể
                      </p>
                    </div>
                    <input
                      type="radio"
                      checked={selectedClassOption === "later"}
                      onChange={() => setSelectedClassOption("later")}
                    />
                  </div>

                  {selectedClassOption === "later" && (
                    <div className="pt-3 mt-2 border-t border-[#DFE4EC] flex items-center gap-3">
                      <label className="text-xs text-[#5A6478]">Nguyện vọng ca học:</label>
                      <select
                        value={preferredShift}
                        onChange={(e) => setPreferredShift(e.target.value)}
                        className="h-8 rounded-[6px] border border-[#DFE4EC] bg-white px-2.5 text-xs text-[#131B2E] outline-none"
                      >
                        <option value="Ca 1">Ca 1 (T2-4-6, 18:30-20:30)</option>
                        <option value="Ca 2">Ca 2 (T3-5-7, 18:30-20:30)</option>
                        <option value="Ca 3">Ca 3 (T7-CN, 07:30-10:30)</option>
                        <option value="Ca 4">Ca 4 (T7-CN, 13:30-16:30)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-3 border-t border-[#DFE4EC] flex justify-between">
                <Button variant="secondary" onClick={() => setStep(1)} className="h-10">
                  Quay lại
                </Button>
                <Button onClick={handleNextStep2} className="h-10 px-6">
                  Tiếp tục: Học phí
                </Button>
              </div>
            </div>
          )}

          {/* ===================================================================
              BƯỚC 3: HỌC PHÍ (CHẶN THU VƯỢT, GIẢM GIÁ, ĐÓNG NGAY)
          =================================================================== */}
          {step === 3 && (
            <form onSubmit={handleNextStep3} className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 sm:p-6 shadow-none space-y-5">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h2 className="text-base font-semibold text-[#131B2E]">
                  Bước 3: Học phí & Thu tiền
                </h2>
                <p className="text-xs text-[#5A6478]">
                  Xác định mức giá khóa học, giảm giá và ghi nhận số tiền đóng ngay
                </p>
              </div>

              {step3Error && (
                <div className="p-3 bg-[#FBE8E5] border border-[#B3382C]/30 rounded-[6px] text-xs text-[#B3382C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{step3Error}</span>
                </div>
              )}

              {/* Giá khóa học */}
              <div className="p-3.5 bg-[#F4F6FA] border border-[#DFE4EC] rounded-[8px] flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-xs text-[#5A6478]">Đơn giá khóa học:</div>
                  <div className="text-xs sm:text-sm font-semibold text-[#131B2E] mt-0.5">
                    Giá theo tháng {formatCurrency(selectedCourse.monthlyPrice)} x {selectedCourse.durationMonths} tháng ={" "}
                    <span className="text-[#1E40AF]">{formatCurrency(activeCoursePrice)}</span>
                  </div>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      const input = prompt("Chủ sửa giá gốc khóa học (₫):", String(activeCoursePrice))
                      if (input) setCustomCoursePrice(Number(input))
                    }}
                    className="text-xs text-[#1E40AF] hover:underline"
                  >
                    Sửa giá gốc
                  </button>
                )}
              </div>

              {/* Giảm giá */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#131B2E]">Giảm giá học phí</label>
                  <div className="inline-flex rounded-[4px] border border-[#DFE4EC] bg-white p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setDiscountType("amount")}
                      className={`px-2 py-0.5 rounded-[3px] ${discountType === "amount" ? "bg-[#1E40AF] text-white" : "text-[#5A6478]"}`}
                    >
                      Số tiền (₫)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType("percent")}
                      className={`px-2 py-0.5 rounded-[3px] ${discountType === "percent" ? "bg-[#1E40AF] text-white" : "text-[#5A6478]"}`}
                    >
                      Phần trăm (%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder={discountType === "amount" ? "Ví dụ: 100000" : "Ví dụ: 10"}
                      value={discountValue || ""}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="text-xs tabular-nums"
                    />
                    {discountAmount > 0 && (
                      <span className="text-[11px] text-[#2F7D4F] mt-1 block">
                        Giảm: {formatCurrency(discountAmount)}
                      </span>
                    )}
                  </div>

                  <div>
                    <Input
                      placeholder="Lý do giảm (bắt buộc khi có giảm giá)..."
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      className="text-xs"
                      required={discountAmount > 0}
                    />
                  </div>
                </div>
              </div>

              {/* Thành tiền (Net Amount) */}
              <div className="flex items-center justify-between p-3 bg-[#E7EDFB] rounded-[8px] border border-[#3B82F6]/30">
                <span className="text-sm font-semibold text-[#131B2E]">Thành tiền (Cần thu):</span>
                <span className="text-base font-bold text-[#1E40AF] tabular-nums">
                  {formatCurrency(netAmount)}
                </span>
              </div>

              {/* Phần đóng ngay */}
              <div className="space-y-3 pt-2 border-t border-[#DFE4EC]">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#5A6478]">
                  Ghi nhận thu tiền ngay
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#131B2E] mb-1">
                      Số tiền đóng ngay (₫)
                    </label>
                    <Input
                      type="number"
                      value={paidNow}
                      onChange={(e) => setPaidNow(Number(e.target.value))}
                      className="text-sm font-semibold text-[#1E40AF] tabular-nums"
                      max={netAmount}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#131B2E] mb-1">
                      Ngày thu
                    </label>
                    <Input value={paymentDate} readOnly className="bg-[#F4F6FA] text-xs" />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#131B2E] mb-1">
                      Hình thức thanh toán
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as "Tiền mặt" | "Chuyển khoản" | "Khác")}
                      className="w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-2.5 text-xs text-[#131B2E] outline-none"
                    >
                      <option value="Chuyển khoản">Chuyển khoản</option>
                      <option value="Tiền mặt">Tiền mặt</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                {/* Nếu đóng thiếu: Hiển thị dòng Còn lại và trường Hẹn đóng nốt */}
                {remainingBalance > 0 && (
                  <div className="p-3 bg-[#FBF0DC] border border-[#A86A0B]/30 rounded-[6px] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A86A0B] font-medium">Học phí còn lại:</span>
                      <span className="text-[#B3382C] font-bold tabular-nums">
                        {formatCurrency(remainingBalance)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <label className="text-xs text-[#131B2E] shrink-0">Hẹn đóng nốt ngày:</label>
                      <Input
                        type="date"
                        value={balanceDueDate}
                        onChange={(e) => setBalanceDueDate(e.target.value)}
                        className="h-8 text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Ghi chú phiếu thu
                  </label>
                  <Input
                    placeholder="Đóng tiền đợt 1, đóng qua QR..."
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="pt-3 border-t border-[#DFE4EC] flex justify-between">
                <Button variant="secondary" onClick={() => setStep(2)} className="h-10">
                  Quay lại
                </Button>
                <Button type="submit" className="h-10 px-6">
                  Tiếp tục: Người giới thiệu
                </Button>
              </div>
            </form>
          )}

          {/* ===================================================================
              BƯỚC 4: NGƯỜI GIỚI THIỆU VÀ XÁC NHẬN TOÀN BỘ
          =================================================================== */}
          {step === 4 && (
            <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 sm:p-6 shadow-none space-y-6">
              <div className="border-b border-[#DFE4EC] pb-3">
                <h2 className="text-base font-semibold text-[#131B2E]">
                  Bước 4: Người giới thiệu & Xác nhận
                </h2>
                <p className="text-xs text-[#5A6478]">
                  Ghi nhận nguồn giới thiệu và rà soát toàn bộ hồ sơ trước khi lưu
                </p>
              </div>

              {/* Segmented Control Người giới thiệu */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A6478]">
                  Người giới thiệu
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { key: "none", label: "Không có" },
                      { key: "teacher", label: "Thầy / Cô" },
                      { key: "student", label: "Học viên cũ" },
                      { key: "other", label: "Bạn bè / Khác" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setReferrerType(opt.key)}
                      className={`h-9 rounded-[6px] text-xs font-medium border transition-colors ${
                        referrerType === opt.key
                          ? "bg-[#1E40AF] text-white border-[#1E40AF]"
                          : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#F4F6FA]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Sub-form Thầy/Cô */}
                {referrerType === "teacher" && (
                  <div className="p-3 border border-[#DFE4EC] rounded-[6px] bg-[#F4F6FA] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#5A6478]">Chọn Thầy/Cô giới thiệu:</span>
                      <button
                        type="button"
                        onClick={() => alert("Thêm người giới thiệu mới")}
                        className="text-xs text-[#1E40AF] hover:underline"
                      >
                        + Thêm người mới
                      </button>
                    </div>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none"
                    >
                      {REFERRERS.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} - {r.phone} ({r.org})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sub-form Bạn bè hoặc khác */}
                {referrerType === "other" && (
                  <div className="p-3 border border-[#DFE4EC] rounded-[6px] bg-[#F4F6FA] grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      placeholder="Họ và tên người giới thiệu..."
                      value={customReferrerName}
                      onChange={(e) => setCustomReferrerName(e.target.value)}
                      className="bg-white h-8 text-xs"
                    />
                    <Input
                      placeholder="Số điện thoại (tùy chọn)..."
                      value={customReferrerPhone}
                      onChange={(e) => setCustomReferrerPhone(e.target.value)}
                      className="bg-white h-8 text-xs"
                    />
                  </div>
                )}

                <p className="text-[11px] text-[#5A6478] italic">
                  * Hoa hồng chỉ tính cho người giới thiệu được bật nhận hoa hồng.
                </p>
              </div>

              {/* BẢNG TỔNG KẾT XÁC NHẬN (VỚI LINK SỬA TỪNG BƯỚC) */}
              <div className="border border-[#DFE4EC] rounded-[8px] overflow-hidden">
                <div className="bg-[#F4F6FA] px-4 py-2.5 border-b border-[#DFE4EC] text-xs font-semibold text-[#131B2E]">
                  Rà soát thông tin đăng ký
                </div>

                <div className="divide-y divide-[#DFE4EC] text-xs">
                  {/* Step 1 review */}
                  <div className="p-3.5 flex items-start justify-between">
                    <div>
                      <div className="text-[#5A6478] mb-0.5">Học viên & Hồ sơ:</div>
                      <div className="font-semibold text-sm text-[#131B2E]">
                        {lastName} {firstName}
                      </div>
                      <div className="text-[#5A6478]">SĐT: {phone} &bull; Giới tính: {gender}</div>
                      <div className="text-[#5A6478]">
                        Hồ sơ: {dossierCccd && dossierPhotos ? "Đủ hồ sơ" : "Thiếu bản sao CCCD hoặc hình"}
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-xs text-[#1E40AF] font-medium hover:underline cursor-pointer"
                    >
                      Sửa
                    </button>
                  </div>

                  {/* Step 2 review */}
                  <div className="p-3.5 flex items-start justify-between">
                    <div>
                      <div className="text-[#5A6478] mb-0.5">Khóa học & Lớp:</div>
                      <div className="font-semibold text-[#131B2E]">{selectedCourse.name}</div>
                      <div className="text-[#5A6478]">
                        {selectedClassOption === "class"
                          ? `Lớp: ${selectedClass?.code} (${selectedClass?.shift})`
                          : `Chờ xếp lớp (Nguyện vọng: ${preferredShift})`}
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="text-xs text-[#1E40AF] font-medium hover:underline cursor-pointer"
                    >
                      Sửa
                    </button>
                  </div>

                  {/* Step 3 review */}
                  <div className="p-3.5 flex items-start justify-between">
                    <div>
                      <div className="text-[#5A6478] mb-0.5">Học phí & Thu tiền:</div>
                      <div className="text-[#131B2E]">
                        Thành tiền: <strong>{formatCurrency(netAmount)}</strong>
                        {discountAmount > 0 && ` (Đã giảm ${formatCurrency(discountAmount)})`}
                      </div>
                      <div className="text-[#1E40AF] font-semibold mt-0.5">
                        Đóng ngay: {formatCurrency(paidNow)} ({paymentMethod})
                      </div>
                      {remainingBalance > 0 && (
                        <div className="text-[#B3382C] font-medium mt-0.5">
                          Còn nợ: {formatCurrency(remainingBalance)}
                          {balanceDueDate && ` (Hẹn nộp: ${formatDate(balanceDueDate)})`}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(3)}
                      className="text-xs text-[#1E40AF] font-medium hover:underline cursor-pointer"
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              </div>

              {/* Action hoàn tất */}
              <div className="pt-3 border-t border-[#DFE4EC] flex justify-between">
                <Button variant="secondary" onClick={() => setStep(3)} className="h-10">
                  Quay lại
                </Button>
                <Button onClick={handleCompleteRegistration} className="h-10 px-6 bg-[#1E40AF] hover:bg-[#1E3A8A]">
                  <Check className="w-4 h-4 mr-1.5" />
                  <span>Hoàn tất đăng ký</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ==================== CỘT PHẢI: STICKY LIVE SUMMARY (DESKTOP) ==================== */}
        <div className="hidden lg:block space-y-4 sticky top-6">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-5 shadow-none space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5A6478] border-b border-[#DFE4EC] pb-2">
              Tóm tắt hồ sơ (Cập nhật trực tiếp)
            </h3>

            {/* Thông tin học viên */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#5A6478]">Học viên:</span>
              <div className="text-sm font-semibold text-[#131B2E]">
                {lastName || firstName ? `${lastName} ${firstName}` : "Chưa nhập họ tên"}
              </div>
              <div className="text-xs text-[#5A6478] tabular-nums">
                {phone || "Chưa có số điện thoại"}
              </div>
              {organization && (
                <div className="text-[11px] text-[#5A6478] truncate">
                  {organization} {organizationDetail && `(${organizationDetail})`}
                </div>
              )}
            </div>

            {/* Khóa học */}
            <div className="space-y-1 pt-2 border-t border-[#DFE4EC]">
              <span className="text-[11px] text-[#5A6478]">Khóa học:</span>
              <div className="text-xs font-semibold text-[#131B2E]">
                {selectedCourse.name}
              </div>
              <div className="text-[11px] text-[#5A6478]">
                {selectedClassOption === "class"
                  ? selectedClass?.code || "Chưa chọn lớp"
                  : `Chờ xếp lớp (${preferredShift})`}
              </div>
            </div>

            {/* Học phí */}
            <div className="space-y-1 pt-2 border-t border-[#DFE4EC]">
              <span className="text-[11px] text-[#5A6478]">Học phí:</span>
              <div className="flex justify-between text-xs">
                <span className="text-[#5A6478]">Thành tiền:</span>
                <span className="font-semibold text-[#131B2E] tabular-nums">
                  {formatCurrency(netAmount)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#5A6478]">Đóng ngay:</span>
                <span className="font-semibold text-[#1E40AF] tabular-nums">
                  {formatCurrency(paidNow)}
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1 border-t border-[#DFE4EC]/60">
                <span className="text-[#5A6478]">Còn lại:</span>
                <span className={`font-semibold tabular-nums ${remainingBalance > 0 ? "text-[#B3382C]" : "text-[#2F7D4F]"}`}>
                  {formatCurrency(remainingBalance)}
                </span>
              </div>
            </div>

            {/* Chỉ báo trạng thái */}
            <div className="pt-2 border-t border-[#DFE4EC] text-center">
              <Badge variant={remainingBalance === 0 ? "success" : "warning"} className="w-full justify-center py-1">
                {remainingBalance === 0 ? "Đóng đủ 1 lần" : "Còn nợ học phí"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
