import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  GraduationCap,
  Users,
  CheckCircle2,
  X,
  Info,
  ExternalLink,
  Sparkles,
} from "lucide-react"

// ============================================================================
// 1. KIỂU DỮ LIỆU GIÁO VIÊN & LỚP GIẢNG DẠY
// ============================================================================
export interface TeacherItem {
  id: string
  fullName: string
  phone: string
  email: string
  subjects: string[]
  activeClassesCount: number
  status: "dang_day" | "tam_nghi"
  experience: string
  classes: {
    code: string
    courseName: string
    shiftDetail: string
    room: string
    enrolledCount: number
    capacity: number
  }[]
}

// ============================================================================
// 2. KIỂU DỮ LIỆU NGƯỜI GIỚI THIỆU (THẦY/CÔ GIỚI THIỆU)
// ============================================================================
export interface ReferrerItem {
  id: string
  fullName: string
  phone: string
  organization: string // Trường hoặc đơn vị công tác
  type: "thay_co" | "hoc_vien_cu" | "doi_tac"
  receiveCommission: boolean // Toggle nhận hoa hồng (Thầy/Cô: bật; Bạn bè/Học viên cũ: tắt)
  referredStudentsCount: number
  students: {
    id: string
    studentCode: string
    fullName: string
    courseName: string
    registeredDate: string
    commissionStatus: "chua_du_dieu_kien" | "du_dieu_kien" | "da_chi"
  }[]
}

// ============================================================================
// 3. KIỂU DỮ LIỆU QUYẾT TOÁN HOA HỒNG TUYỂN SINH
// ============================================================================
export interface CommissionRecord {
  id: string
  referrerId: string
  referrerName: string
  referrerOrg: string
  studentId: string
  studentCode: string
  studentName: string
  classCode: string
  courseName: string
  paidAmount: number
  netAmount: number
  status: "chua_du_dieu_kien" | "du_dieu_kien" | "da_chi"
  amount: number // Cố định 20.000 ₫ theo quy chuẩn
  qualifiedDate: string | null // Ngày đủ điều kiện
  disqualifiedReason?: string // Lý do chưa đủ điều kiện
}

// ============================================================================
// DỮ LIỆU MẪU CHUẨN CỦA TRUNG TÂM TVC
// ============================================================================
const INITIAL_TEACHERS: TeacherItem[] = [
  {
    id: "tc-1",
    fullName: "Thầy Lê Văn Tuấn",
    phone: "0913 222 111",
    email: "tuan.le@tvc.edu.vn",
    subjects: ["Tin học Cơ bản & Nâng cao", "Chứng chỉ IC3 - GS6"],
    activeClassesCount: 3,
    status: "dang_day",
    experience: "7 năm kinh nghiệm giảng dạy tin học ứng dụng và ôn luyện chứng chỉ",
    classes: [
      {
        code: "UDCNTTCB_K0126_Ca1PM1",
        courseName: "Ứng dụng CNTT Cơ bản",
        shiftDetail: "Thứ 2-4-6 (18:30 - 20:30)",
        room: "PM1",
        enrolledCount: 18,
        capacity: 20,
      },
      {
        code: "IC3_K0126_Ca2PM2",
        courseName: "Chứng chỉ IC3 - GS6",
        shiftDetail: "Thứ 3-5-7 (18:30 - 20:30)",
        room: "PM2",
        enrolledCount: 15,
        capacity: 40,
      },
      {
        code: "UDCNTTNC_K0126_Ca3PM1",
        courseName: "Ứng dụng CNTT Nâng cao",
        shiftDetail: "Thứ 7 & Chủ nhật (07:30 - 10:30)",
        room: "PM1",
        enrolledCount: 22,
        capacity: 25,
      },
    ],
  },
  {
    id: "tc-2",
    fullName: "Cô Trần Mai Anh",
    phone: "0987 333 444",
    email: "maianh.tran@tvc.edu.vn",
    subjects: ["Tiếng Anh Giao tiếp", "Pre-Ielts"],
    activeClassesCount: 2,
    status: "dang_day",
    experience: "5 năm kinh nghiệm giảng dạy tiếng Anh giao tiếp và luyện thi IELTS",
    classes: [
      {
        code: "TAGT_K0126_Ca1PM1",
        courseName: "Tiếng Anh giao tiếp",
        shiftDetail: "Thứ 2-4-6 (18:30 - 20:30)",
        room: "PM1",
        enrolledCount: 24,
        capacity: 30,
      },
      {
        code: "PREIELTS_K0126_Ca2PM1",
        courseName: "Pre-Ielts",
        shiftDetail: "Thứ 3-5-7 (18:30 - 20:30)",
        room: "PM1",
        enrolledCount: 20,
        capacity: 25,
      },
    ],
  },
  {
    id: "tc-3",
    fullName: "Thầy Hoàng Văn Nam",
    phone: "0908 555 666",
    email: "nam.hoang@tvc.edu.vn",
    subjects: ["Tin học Cơ bản", "Thiết kế Website"],
    activeClassesCount: 1,
    status: "dang_day",
    experience: "3 năm giảng dạy công nghệ thông tin và phát triển web",
    classes: [
      {
        code: "UDCNTTCB_K0126_Ca1PM2",
        courseName: "Ứng dụng CNTT Cơ bản",
        shiftDetail: "Thứ 2-4-6 (18:30 - 20:30)",
        room: "PM2",
        enrolledCount: 18,
        capacity: 20,
      },
    ],
  },
  {
    id: "tc-4",
    fullName: "Cô Nguyễn Thị Hương",
    phone: "0932 777 888",
    email: "huong.nguyen@tvc.edu.vn",
    subjects: ["Tiếng Anh KET / PET"],
    activeClassesCount: 0,
    status: "tam_nghi",
    experience: "4 năm kinh nghiệm luyện thi chứng chỉ Cambridge KET/PET",
    classes: [],
  },
]

const INITIAL_REFERRERS: ReferrerItem[] = [
  {
    id: "ref-1",
    fullName: "Thầy Nguyễn Văn Trí",
    phone: "0918 123 789",
    organization: "Trường CĐ Nghề Trà Vinh (Khoa Kỹ thuật)",
    type: "thay_co",
    receiveCommission: true,
    referredStudentsCount: 8,
    students: [
      { id: "st-1", studentCode: "HV26-0001", fullName: "Lê Hoàng Anh", courseName: "Ứng dụng CNTT Cơ bản", registeredDate: "2026-10-01", commissionStatus: "du_dieu_kien" },
      { id: "st-2", studentCode: "HV26-0002", fullName: "Phạm Gia Bảo", courseName: "Ứng dụng CNTT Cơ bản", registeredDate: "2026-10-02", commissionStatus: "du_dieu_kien" },
      { id: "st-7", studentCode: "HV26-0007", fullName: "Hoàng Văn Nam", courseName: "Pre-Ielts", registeredDate: "2026-10-10", commissionStatus: "du_dieu_kien" },
      { id: "st-9", studentCode: "HV26-0009", fullName: "Đặng Quốc Bảo", courseName: "Ứng dụng CNTT Cơ bản", registeredDate: "2026-10-12", commissionStatus: "chua_du_dieu_kien" },
    ],
  },
  {
    id: "ref-2",
    fullName: "Cô Lâm Mỹ Dung",
    phone: "0979 456 123",
    organization: "Trường ĐH Trà Vinh (Khoa Ngoại ngữ)",
    type: "thay_co",
    receiveCommission: true,
    referredStudentsCount: 6,
    students: [
      { id: "st-3", studentCode: "HV26-0003", fullName: "Nguyễn Thị Hà", courseName: "Chứng chỉ IC3 - GS6", registeredDate: "2026-10-05", commissionStatus: "du_dieu_kien" },
      { id: "st-5", studentCode: "HV26-0005", fullName: "Đỗ Phương Linh", courseName: "Tiếng Anh giao tiếp", registeredDate: "2026-09-28", commissionStatus: "du_dieu_kien" },
      { id: "st-6", studentCode: "HV26-0006", fullName: "Võ Ngọc Mai", courseName: "Pre-Ielts", registeredDate: "2026-07-01", commissionStatus: "da_chi" },
    ],
  },
  {
    id: "ref-3",
    fullName: "Thầy Phạm Quốc Hưng",
    phone: "0909 888 777",
    organization: "Trường THPT Chuyên Trà Vinh",
    type: "thay_co",
    receiveCommission: true,
    referredStudentsCount: 4,
    students: [
      { id: "st-8", studentCode: "HV26-0008", fullName: "Vũ Bích Ngọc", courseName: "Ứng dụng CNTT Cơ bản", registeredDate: "2026-10-01", commissionStatus: "du_dieu_kien" },
      { id: "st-10", studentCode: "HV26-0010", fullName: "Lý Gia Hân", courseName: "Chứng chỉ IC3 - GS6", registeredDate: "2026-10-15", commissionStatus: "du_dieu_kien" },
    ],
  },
  {
    id: "ref-4",
    fullName: "Trần Minh Khoa",
    phone: "0934 567 890",
    organization: "Học viên cũ (Khóa UDCNTT 2025)",
    type: "hoc_vien_cu",
    receiveCommission: false, // Bạn bè & Học viên cũ không nhận hoa hồng theo quy định
    referredStudentsCount: 2,
    students: [
      { id: "st-4", studentCode: "HV26-0004", fullName: "Trần Minh Khoa", courseName: "Ứng dụng CNTT Cơ bản", registeredDate: "2026-10-05", commissionStatus: "chua_du_dieu_kien" },
    ],
  },
]

// Danh sách quyết toán hoa hồng:
// 17 hồ sơ ĐỦ ĐIỀU KIỆN (17 x 20.000 ₫ = 340.000 ₫) chuẩn xác theo đề bài
const INITIAL_COMMISSIONS: CommissionRecord[] = [
  // 17 Hồ sơ ĐỦ ĐIỀU KIỆN
  { id: "com-1", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-1", studentCode: "HV26-0001", studentName: "Lê Hoàng Anh", classCode: "UDCNTTCB_K0126_Ca1PM1", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 1200000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-18" },
  { id: "com-2", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-2", studentCode: "HV26-0002", studentName: "Phạm Gia Bảo", classCode: "UDCNTTCB_K0126_Ca1PM1", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 600000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-15" },
  { id: "com-3", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-7", studentCode: "HV26-0007", studentName: "Hoàng Văn Nam", classCode: "PREIELTS_K0126_Ca2PM1", courseName: "Pre-Ielts", paidAmount: 900000, netAmount: 1800000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-12" },
  { id: "com-4", referrerId: "ref-2", referrerName: "Cô Lâm Mỹ Dung", referrerOrg: "ĐH Trà Vinh", studentId: "st-3", studentCode: "HV26-0003", studentName: "Nguyễn Thị Hà", classCode: "IC3_K0126_Ca2PM2", courseName: "Chứng chỉ IC3 - GS6", paidAmount: 1500000, netAmount: 1500000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-19" },
  { id: "com-5", referrerId: "ref-2", referrerName: "Cô Lâm Mỹ Dung", referrerOrg: "ĐH Trà Vinh", studentId: "st-5", studentCode: "HV26-0005", studentName: "Đỗ Phương Linh", classCode: "TAGT_K0126_Ca1PM1", courseName: "Tiếng Anh giao tiếp", paidAmount: 200000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-09-28" },
  { id: "com-6", referrerId: "ref-3", referrerName: "Thầy Phạm Quốc Hưng", referrerOrg: "THPT Chuyên Trà Vinh", studentId: "st-8", studentCode: "HV26-0008", studentName: "Vũ Bích Ngọc", classCode: "UDCNTTCB_K0126_Ca1PM2", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 1000000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-01" },
  { id: "com-7", referrerId: "ref-3", referrerName: "Thầy Phạm Quốc Hưng", referrerOrg: "THPT Chuyên Trà Vinh", studentId: "st-10", studentCode: "HV26-0010", studentName: "Lý Gia Hân", classCode: "IC3_K0126_Ca2PM2", courseName: "Chứng chỉ IC3 - GS6", paidAmount: 1500000, netAmount: 1500000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-16" },
  { id: "com-8", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-11", studentCode: "HV26-0011", studentName: "Phan Thanh Tùng", classCode: "UDCNTTCB_K0126_Ca1PM1", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 1000000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-02" },
  { id: "com-9", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-12", studentCode: "HV26-0012", studentName: "Trần Thu Trang", classCode: "UDCNTTNC_K0126_Ca3PM1", courseName: "Ứng dụng CNTT Nâng cao", paidAmount: 1125000, netAmount: 1125000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-03" },
  { id: "com-10", referrerId: "ref-2", referrerName: "Cô Lâm Mỹ Dung", referrerOrg: "ĐH Trà Vinh", studentId: "st-13", studentCode: "HV26-0013", studentName: "Đặng Hữu Phước", classCode: "TAGT_K0126_Ca1PM1", courseName: "Tiếng Anh giao tiếp", paidAmount: 500000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-08" },
  { id: "com-11", referrerId: "ref-2", referrerName: "Cô Lâm Mỹ Dung", referrerOrg: "ĐH Trà Vinh", studentId: "st-14", studentCode: "HV26-0014", studentName: "Ngô Mỹ Duyên", classCode: "PREIELTS_K0126_Ca2PM1", courseName: "Pre-Ielts", paidAmount: 900000, netAmount: 1800000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-09" },
  { id: "com-12", referrerId: "ref-3", referrerName: "Thầy Phạm Quốc Hưng", referrerOrg: "THPT Chuyên Trà Vinh", studentId: "st-15", studentCode: "HV26-0015", studentName: "Bùi Quốc Thịnh", classCode: "UDCNTTCB_K0126_Ca1PM1", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 1000000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-10" },
  { id: "com-13", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-16", studentCode: "HV26-0016", studentName: "Lâm Thị Cẩm Tú", classCode: "UDCNTTCB_K0126_Ca1PM2", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 500000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-11" },
  { id: "com-14", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-17", studentCode: "HV26-0017", studentName: "Huỳnh Quốc Đạt", classCode: "UDCNTTCB_K0126_Ca1PM2", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 1000000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-14" },
  { id: "com-15", referrerId: "ref-2", referrerName: "Cô Lâm Mỹ Dung", referrerOrg: "ĐH Trà Vinh", studentId: "st-18", studentCode: "HV26-0018", studentName: "Trương Hoài An", classCode: "TAGT_K0126_Ca1PM1", courseName: "Tiếng Anh giao tiếp", paidAmount: 1000000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-17" },
  { id: "com-16", referrerId: "ref-3", referrerName: "Thầy Phạm Quốc Hưng", referrerOrg: "THPT Chuyên Trà Vinh", studentId: "st-19", studentCode: "HV26-0019", studentName: "Võ Minh Trí", classCode: "IC3_K0126_Ca2PM2", courseName: "Chứng chỉ IC3 - GS6", paidAmount: 1500000, netAmount: 1500000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-18" },
  { id: "com-17", referrerId: "ref-1", referrerName: "Thầy Nguyễn Văn Trí", referrerOrg: "CĐ Nghề Trà Vinh", studentId: "st-20", studentCode: "HV26-0020", studentName: "Đỗ Gia Huy", classCode: "UDCNTTCB_K0126_Ca1PM1", courseName: "Ứng dụng CNTT Cơ bản", paidAmount: 500000, netAmount: 1000000, status: "du_dieu_kien", amount: 20000, qualifiedDate: "2026-10-20" },

  // Các hồ sơ CHƯA ĐỦ ĐIỀU KIỆN
  {
    id: "com-18",
    referrerId: "ref-1",
    referrerName: "Thầy Nguyễn Văn Trí",
    referrerOrg: "CĐ Nghề Trà Vinh",
    studentId: "st-9",
    studentCode: "HV26-0009",
    studentName: "Đặng Quốc Bảo",
    classCode: "UDCNTTCB_K0126_Ca1PM2",
    courseName: "Ứng dụng CNTT Cơ bản",
    paidAmount: 500000,
    netAmount: 1000000,
    status: "chua_du_dieu_kien",
    amount: 20000,
    qualifiedDate: null,
    disqualifiedReason: "Cần đủ hồ sơ và có khoản đóng đầu tiên. Đang thiếu: hồ sơ (02 hình 3x4).",
  },
  {
    id: "com-19",
    referrerId: "ref-2",
    referrerName: "Cô Lâm Mỹ Dung",
    referrerOrg: "ĐH Trà Vinh",
    studentId: "st-21",
    studentCode: "HV26-0021",
    studentName: "Dương Minh Khang",
    classCode: "TAGT_K0126_Ca1PM1",
    courseName: "Tiếng Anh giao tiếp",
    paidAmount: 0,
    netAmount: 1000000,
    status: "chua_du_dieu_kien",
    amount: 20000,
    qualifiedDate: null,
    disqualifiedReason: "Cần đủ hồ sơ và có khoản đóng đầu tiên. Đang thiếu: khoản đóng đầu tiên (chưa đóng).",
  },

  // Hồ sơ ĐÃ CHI
  {
    id: "com-20",
    referrerId: "ref-2",
    referrerName: "Cô Lâm Mỹ Dung",
    referrerOrg: "ĐH Trà Vinh",
    studentId: "st-6",
    studentCode: "HV26-0006",
    studentName: "Võ Ngọc Mai",
    classCode: "PREIELTS_K0126_Ca2PM1",
    courseName: "Pre-Ielts",
    paidAmount: 1800000,
    netAmount: 1800000,
    status: "da_chi",
    amount: 20000,
    qualifiedDate: "2026-07-10",
  },
]

export const TeachersCommissions: React.FC = () => {
  const navigate = useNavigate()

  // 3 Tab chính của màn hình
  const [currentTab, setCurrentTab] = useState<"giao_vien" | "nguoi_gioi_thieu" | "hoa_hong">("hoa_hong")

  // Dữ liệu State
  const [teachers, setTeachers] = useState<TeacherItem[]>(INITIAL_TEACHERS)
  const [referrers, setReferrers] = useState<ReferrerItem[]>(INITIAL_REFERRERS)
  const [commissions, setCommissions] = useState<CommissionRecord[]>(INITIAL_COMMISSIONS)

  // Xem chi tiết giáo viên
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null)

  // Xem chi tiết người giới thiệu
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerItem | null>(null)

  // Bộ lọc bảng hoa hồng
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<string>("all")
  const [commissionReferrerFilter, setCommissionReferrerFilter] = useState<string>("all")

  // Checkbox các dòng hoa hồng được chọn để chi trả
  const [selectedCommissionIds, setSelectedCommissionIds] = useState<string[]>([])

  // Modal xác nhận chi trả hoa hồng hàng loạt
  const [showBulkPayoutDialog, setShowBulkPayoutDialog] = useState(false)

  // Modal thêm giáo viên mới
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false)
  const [newTeacherName, setNewTeacherName] = useState("")
  const [newTeacherPhone, setNewTeacherPhone] = useState("")
  const [newTeacherEmail, setNewTeacherEmail] = useState("")
  const [newTeacherSubjects, setNewTeacherSubjects] = useState("Tin học Cơ bản & Nâng cao")

  // Modal thêm người giới thiệu
  const [showAddReferrerModal, setShowAddReferrerModal] = useState(false)
  const [newRefName, setNewRefName] = useState("")
  const [newRefPhone, setNewRefPhone] = useState("")
  const [newRefOrg, setNewRefOrg] = useState("")
  const [newRefType, setNewRefType] = useState<"thay_co" | "hoc_vien_cu" | "doi_tac">("thay_co")
  const [newRefReceiveCommission, setNewRefReceiveCommission] = useState(true)

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // --- TÍNH TOÁN DỮ LIỆU HOA HỒNG TỔNG QUAN ---
  // Các hồ sơ chờ chi (status: du_dieu_kien)
  const pendingPayoutCommissions = useMemo(() => {
    return commissions.filter((c) => c.status === "du_dieu_kien")
  }, [commissions])

  const pendingPayoutTotal = useMemo(() => {
    return pendingPayoutCommissions.reduce((sum, c) => sum + c.amount, 0)
  }, [pendingPayoutCommissions])

  // Lọc danh sách hoa hồng theo bộ lọc
  const filteredCommissions = useMemo(() => {
    return commissions.filter((item) => {
      if (commissionStatusFilter !== "all" && item.status !== commissionStatusFilter) {
        return false
      }
      if (commissionReferrerFilter !== "all" && item.referrerId !== commissionReferrerFilter) {
        return false
      }
      return true
    })
  }, [commissions, commissionStatusFilter, commissionReferrerFilter])

  // Chọn tất cả các dòng "Đủ điều kiện"
  const handleToggleSelectAllEligible = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const eligibleIds = filteredCommissions
        .filter((c) => c.status === "du_dieu_kien")
        .map((c) => c.id)
      setSelectedCommissionIds(eligibleIds)
    } else {
      setSelectedCommissionIds([])
    }
  }

  // Thực hiện chi trả hoa hồng hàng loạt
  const handleConfirmBulkPayout = () => {
    if (selectedCommissionIds.length === 0) return

    setCommissions((prev) =>
      prev.map((c) => {
        if (!selectedCommissionIds.includes(c.id)) return c
        return {
          ...c,
          status: "da_chi",
        }
      })
    )

    const paidCount = selectedCommissionIds.length
    const paidAmount = paidCount * 20000
    setSelectedCommissionIds([])
    setShowBulkPayoutDialog(false)
    showToast(`Đã đánh dấu đã chi ${formatCurrency(paidAmount)} cho ${paidCount} hồ sơ`)
  }

  // Toggle "Nhận hoa hồng" của người giới thiệu
  const handleToggleReferrerCommission = (refId: string) => {
    setReferrers((prev) =>
      prev.map((r) => {
        if (r.id !== refId) return r
        const updated = !r.receiveCommission
        showToast(
          `Đã ${updated ? "bật" : "tắt"} nhận hoa hồng cho ${r.fullName}`
        )
        return {
          ...r,
          receiveCommission: updated,
        }
      })
    )
  }

  // Thêm giáo viên mới
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeacherName.trim()) return

    const newTeacher: TeacherItem = {
      id: `tc-${Date.now()}`,
      fullName: newTeacherName.trim(),
      phone: newTeacherPhone.trim(),
      email: newTeacherEmail.trim() || `${newTeacherPhone.trim()}@tvc.edu.vn`,
      subjects: [newTeacherSubjects],
      activeClassesCount: 0,
      status: "dang_day",
      experience: "Giáo viên mới tiếp nhận",
      classes: [],
    }

    setTeachers([...teachers, newTeacher])
    setShowAddTeacherModal(false)
    setNewTeacherName("")
    setNewTeacherPhone("")
    showToast(`Đã thêm giáo viên ${newTeacher.fullName}`)
  }

  // Thêm người giới thiệu mới
  const handleAddReferrer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRefName.trim()) return

    const newRef: ReferrerItem = {
      id: `ref-${Date.now()}`,
      fullName: newRefName.trim(),
      phone: newRefPhone.trim(),
      organization: newRefOrg.trim() || "Cá nhân",
      type: newRefType,
      receiveCommission: newRefReceiveCommission,
      referredStudentsCount: 0,
      students: [],
    }

    setReferrers([...referrers, newRef])
    setShowAddReferrerModal(false)
    setNewRefName("")
    setNewRefPhone("")
    setNewRefOrg("")
    showToast(`Đã thêm người giới thiệu ${newRef.fullName}`)
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl w-full mx-auto space-y-4">
      {/* 1. Header Trang & Huy hiệu Owner Only */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-[#DFE4EC]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-22 font-semibold text-[#131B2E] tracking-tight">
              Giáo viên và Hoa hồng
            </h1>
            <Badge variant="default" className="text-[10px] font-bold px-2 py-0.5 uppercase">
              Chỉ Quản lý (Chủ)
            </Badge>
          </div>
          <p className="text-xs text-[#5A6478] mt-0.5">
            Quản lý đội ngũ giảng dạy, mạng lưới Thầy/Cô giới thiệu và quyết toán hoa hồng tuyển sinh
          </p>
        </div>

        {/* Nút thêm nhanh tùy theo tab đang chọn */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {currentTab === "giao_vien" && (
            <Button
              size="sm"
              onClick={() => setShowAddTeacherModal(true)}
              className="h-8 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm giáo viên</span>
            </Button>
          )}

          {currentTab === "nguoi_gioi_thieu" && (
            <Button
              size="sm"
              onClick={() => setShowAddReferrerModal(true)}
              className="h-8 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm người giới thiệu</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Điều hướng 3 Tab chính */}
      <div className="flex items-center gap-1.5 border-b border-[#DFE4EC] pb-2">
        <button
          type="button"
          onClick={() => setCurrentTab("hoa_hong")}
          className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            currentTab === "hoa_hong"
              ? "bg-[#1E40AF] text-white shadow-none"
              : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#9A7B3F]" />
          <span>Hoa hồng tuyển sinh</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
              currentTab === "hoa_hong"
                ? "bg-white/20 text-white"
                : "bg-[#DFE4EC] text-[#5A6478]"
            }`}
          >
            {pendingPayoutCommissions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab("giao_vien")}
          className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            currentTab === "giao_vien"
              ? "bg-[#1E40AF] text-white shadow-none"
              : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Giáo viên</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
              currentTab === "giao_vien"
                ? "bg-white/20 text-white"
                : "bg-[#DFE4EC] text-[#5A6478]"
            }`}
          >
            {teachers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab("nguoi_gioi_thieu")}
          className={`px-3.5 py-1.5 rounded-[6px] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 ${
            currentTab === "nguoi_gioi_thieu"
              ? "bg-[#1E40AF] text-white shadow-none"
              : "bg-[#F4F6FA] text-[#5A6478] hover:text-[#131B2E]"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Người giới thiệu</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
              currentTab === "nguoi_gioi_thieu"
                ? "bg-white/20 text-white"
                : "bg-[#DFE4EC] text-[#5A6478]"
            }`}
          >
            {referrers.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: HOA HỒNG (COMISSIONS: SUMMARY + TABLE + BULK PAYOUT)
      ========================================================================= */}
      {currentTab === "hoa_hong" && (
        <div className="space-y-4">
          {/* Summary Box in plain sentences: "Chờ chi 340.000 ₫ cho 17 hồ sơ" */}
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[6px] bg-[#F8F4EB] text-[#9A7B3F] flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-medium text-[#5A6478]">
                  Quyết toán hoa hồng tuyển sinh (20.000 ₫ / hồ sơ đủ điều kiện)
                </div>
                <div className="text-lg md:text-xl font-bold text-[#131B2E] tracking-tight tabular-nums">
                  Chờ chi{" "}
                  <span className="text-[#9A7B3F]">
                    {formatCurrency(pendingPayoutTotal)}
                  </span>{" "}
                  cho {pendingPayoutCommissions.length} hồ sơ
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedCommissionIds.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowBulkPayoutDialog(true)}
                  className="h-8 text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1E3A8A] flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đánh dấu đã chi ({selectedCommissionIds.length})</span>
                </Button>
              )}
            </div>
          </div>

          {/* Thanh lọc bảng hoa hồng: Người nhận & Trạng thái */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-[#DFE4EC] rounded-[10px] p-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Lọc người nhận */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#5A6478] font-medium">Người nhận:</span>
                <select
                  value={commissionReferrerFilter}
                  onChange={(e) => setCommissionReferrerFilter(e.target.value)}
                  className="h-8 text-xs rounded-[6px] border border-[#DFE4EC] bg-[#F4F6FA] px-2 font-medium"
                >
                  <option value="all">Tất cả người nhận</option>
                  {referrers.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} ({r.organization})
                    </option>
                  ))}
                </select>
              </div>

              {/* Lọc trạng thái */}
              <div className="flex items-center gap-1.5">
                <span className="text-[#5A6478] font-medium">Trạng thái:</span>
                <select
                  value={commissionStatusFilter}
                  onChange={(e) => setCommissionStatusFilter(e.target.value)}
                  className="h-8 text-xs rounded-[6px] border border-[#DFE4EC] bg-[#F4F6FA] px-2 font-medium"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="du_dieu_kien">Đủ điều kiện</option>
                  <option value="chua_du_dieu_kien">Chưa đủ điều kiện</option>
                  <option value="da_chi">Đã chi</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-[#5A6478]">
              Hiển thị:{" "}
              <strong className="text-[#131B2E] tabular-nums font-semibold">
                {filteredCommissions.length}
              </strong>{" "}
              hồ sơ
            </div>
          </div>

          {/* BẢNG HOA HỒNG */}
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          pendingPayoutCommissions.length > 0 &&
                          selectedCommissionIds.length === pendingPayoutCommissions.length
                        }
                        onChange={handleToggleSelectAllEligible}
                        className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                      />
                    </th>
                    <th className="py-2.5 px-4 font-semibold">Người nhận (Thầy/Cô giới thiệu)</th>
                    <th className="py-2.5 px-4 font-semibold">Học viên</th>
                    <th className="py-2.5 px-3 font-semibold">Lớp học</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Đã đóng / Thành tiền</th>
                    <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Số tiền</th>
                    <th className="py-2.5 px-4 font-semibold">Ngày đủ điều kiện</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE4EC]">
                  {filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#5A6478]">
                        Không có hồ sơ nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((item) => {
                      const isEligible = item.status === "du_dieu_kien"
                      const isSelected = selectedCommissionIds.includes(item.id)

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-[#F4F6FA]/50 transition-colors ${
                            isSelected ? "bg-[#E7EDFB]/20" : ""
                          }`}
                        >
                          {/* Checkbox: chỉ chọn được khi trạng thái "Đủ điều kiện" */}
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              disabled={!isEligible}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCommissionIds([...selectedCommissionIds, item.id])
                                } else {
                                  setSelectedCommissionIds(
                                    selectedCommissionIds.filter((id) => id !== item.id)
                                  )
                                }
                              }}
                              className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC] disabled:opacity-30 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Người nhận (Thầy/Cô giới thiệu) */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#131B2E]">
                              {item.referrerName}
                            </div>
                            <div className="text-[11px] text-[#5A6478] truncate max-w-[180px]">
                              {item.referrerOrg}
                            </div>
                          </td>

                          {/* Học viên */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-[#131B2E]">
                              {item.studentName}
                            </div>
                            <div className="text-[11px] text-[#5A6478] tabular-nums">
                              {item.studentCode}
                            </div>
                          </td>

                          {/* Lớp */}
                          <td className="py-3 px-3">
                            <span className="font-semibold text-[#131B2E] tabular-nums">
                              {item.classCode}
                            </span>
                            <div className="text-[11px] text-[#5A6478] truncate max-w-[140px]">
                              {item.courseName}
                            </div>
                          </td>

                          {/* Đã đóng / Thành tiền */}
                          <td className="py-3 px-3 text-right tabular-nums">
                            <span className="font-semibold text-[#131B2E]">
                              {formatCurrency(item.paidAmount)}
                            </span>
                            <span className="text-[#5A6478] text-[11px]">
                              {" "}/ {formatCurrency(item.netAmount)}
                            </span>
                          </td>

                          {/* Trạng thái (Chưa đủ điều kiện, Đủ điều kiện, Đã chi) */}
                          <td className="py-3 px-3">
                            {item.status === "du_dieu_kien" ? (
                              <Badge variant="success" className="text-[10px] font-bold px-2 py-0.5">
                                Đủ điều kiện
                              </Badge>
                            ) : item.status === "da_chi" ? (
                              <Badge variant="neutral" className="text-[10px] font-medium px-2 py-0.5">
                                Đã chi
                              </Badge>
                            ) : (
                              /* Tooltip hiển thị lý do chưa đủ điều kiện */
                              <div className="group/tip relative inline-block">
                                <Badge variant="warning" className="text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 cursor-help">
                                  <span>Chưa đủ ĐK</span>
                                  <Info className="w-2.5 h-2.5" />
                                </Badge>

                                <div className="hidden group-hover/tip:block absolute left-0 bottom-full mb-1 z-30 w-64 p-2 bg-[#131B2E] text-white text-[11px] rounded-[6px] shadow-lg leading-snug">
                                  {item.disqualifiedReason ||
                                    "Cần đủ hồ sơ và có khoản đóng đầu tiên. Đang thiếu: hồ sơ (02 hình 3x4)."}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Số tiền (Brass accent text: #9A7B3F) */}
                          <td className="py-3 px-3 text-right tabular-nums font-bold text-sm text-[#9A7B3F]">
                            {formatCurrency(item.amount)}
                          </td>

                          {/* Ngày đủ điều kiện */}
                          <td className="py-3 px-4 tabular-nums text-[#5A6478]">
                            {item.qualifiedDate ? formatDate(item.qualifiedDate) : "—"}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GIÁO VIÊN (TEACHERS LIST + DETAIL)
      ========================================================================= */}
      {currentTab === "giao_vien" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
                    <th className="py-2.5 px-4 font-semibold">Giáo viên & Liên hệ</th>
                    <th className="py-2.5 px-4 font-semibold">Môn giảng dạy</th>
                    <th className="py-2.5 px-4 font-semibold">Số lớp đang dạy</th>
                    <th className="py-2.5 px-3 font-semibold">Trạng thái</th>
                    <th className="py-2.5 px-4 font-semibold">Kinh nghiệm</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE4EC]">
                  {teachers.map((tc) => (
                    <tr
                      key={tc.id}
                      onClick={() => setSelectedTeacher(tc)}
                      className="hover:bg-[#E7EDFB]/30 transition-colors cursor-pointer group"
                    >
                      {/* Tên & SĐT */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#131B2E] group-hover:text-[#1E40AF]">
                          {tc.fullName}
                        </div>
                        <div className="text-[11px] text-[#5A6478] tabular-nums flex items-center gap-1.5 mt-0.5">
                          <span>{tc.phone}</span>
                          <span>•</span>
                          <span>{tc.email}</span>
                        </div>
                      </td>

                      {/* Môn giảng dạy */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {tc.subjects.map((sub, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded-[4px] bg-[#ECEFF5] text-[#131B2E] text-[11px] font-medium"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Số lớp đang dạy */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#131B2E] tabular-nums">
                          {tc.activeClassesCount} lớp
                        </span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3 px-3">
                        {tc.status === "dang_day" ? (
                          <Badge variant="success" className="text-[10px] font-bold">
                            Đang dạy
                          </Badge>
                        ) : (
                          <Badge variant="neutral" className="text-[10px]">
                            Tạm nghỉ
                          </Badge>
                        )}
                      </td>

                      {/* Kinh nghiệm */}
                      <td className="py-3 px-4 text-[#5A6478] max-w-[200px] truncate">
                        {tc.experience}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <span className="text-[#1E40AF] font-medium text-xs group-hover:underline inline-flex items-center gap-1">
                          Xem chi tiết &rarr;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: NGƯỜI GIỚI THIỆU (REFERRERS + COMMISSION TOGGLE)
      ========================================================================= */}
      {currentTab === "nguoi_gioi_thieu" && (
        <div className="space-y-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F4F6FA] text-[#5A6478] border-b border-[#DFE4EC] select-none font-medium">
                    <th className="py-2.5 px-4 font-semibold">Thầy/Cô giới thiệu</th>
                    <th className="py-2.5 px-4 font-semibold">Trường / Đơn vị</th>
                    <th className="py-2.5 px-3 font-semibold">Phân loại</th>
                    <th className="py-2.5 px-4 font-semibold">Học viên đã giới thiệu</th>
                    <th className="py-2.5 px-4 font-semibold">Nhận hoa hồng</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DFE4EC]">
                  {referrers.map((ref) => (
                    <tr
                      key={ref.id}
                      className="hover:bg-[#E7EDFB]/30 transition-colors"
                    >
                      {/* Họ tên & SĐT */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#131B2E]">
                          {ref.fullName}
                        </div>
                        <div className="text-[11px] text-[#5A6478] tabular-nums mt-0.5">
                          {ref.phone}
                        </div>
                      </td>

                      {/* Trường / Đơn vị */}
                      <td className="py-3 px-4 text-[#131B2E] font-medium">
                        {ref.organization}
                      </td>

                      {/* Phân loại */}
                      <td className="py-3 px-3">
                        <Badge variant="neutral" className="text-[10px] capitalize">
                          {ref.type === "thay_co" ? "Thầy/Cô" : ref.type === "hoc_vien_cu" ? "Học viên cũ" : "Đối tác"}
                        </Badge>
                      </td>

                      {/* Số lượng học viên */}
                      <td className="py-3 px-4 tabular-nums font-bold text-[#131B2E]">
                        {ref.referredStudentsCount} học viên
                      </td>

                      {/* Toggle Nhận hoa hồng */}
                      <td className="py-3 px-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ref.receiveCommission}
                            onChange={() => handleToggleReferrerCommission(ref.id)}
                            className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC] cursor-pointer"
                          />
                          <span
                            className={`text-xs font-semibold ${
                              ref.receiveCommission ? "text-[#2F7D4F]" : "text-[#5A6478]"
                            }`}
                          >
                            {ref.receiveCommission ? "Bật" : "Tắt"}
                          </span>
                        </label>
                      </td>

                      {/* Thao tác xem danh sách học viên */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedReferrer(ref)}
                          className="text-xs text-[#1E40AF] font-semibold hover:underline cursor-pointer"
                        >
                          Xem danh sách HV &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHI TIẾT GIÁO VIÊN VÀ CÁC LỚP ĐANG DẠY
      ========================================================================= */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-xl p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  Hồ sơ giáo viên: {selectedTeacher.fullName}
                </h3>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  {selectedTeacher.experience}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTeacher(null)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#F4F6FA] border border-[#DFE4EC] rounded-[6px] p-3 text-xs">
              <div>
                <span className="text-[#5A6478] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Điện thoại:
                </span>
                <span className="font-semibold text-[#131B2E] tabular-nums">
                  {selectedTeacher.phone}
                </span>
              </div>

              <div>
                <span className="text-[#5A6478] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email:
                </span>
                <span className="font-semibold text-[#131B2E]">
                  {selectedTeacher.email}
                </span>
              </div>
            </div>

            {/* Danh sách lớp phụ trách */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#131B2E] flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-[#1E40AF]" />
                <span>Các lớp đang phụ trách ({selectedTeacher.classes.length}):</span>
              </h4>

              {selectedTeacher.classes.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#5A6478] border border-[#DFE4EC] rounded-[6px]">
                  Hiện giáo viên chưa phụ trách lớp nào.
                </div>
              ) : (
                <div className="border border-[#DFE4EC] rounded-[6px] divide-y divide-[#DFE4EC] text-xs">
                  {selectedTeacher.classes.map((cls, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-[#131B2E] tabular-nums">
                          {cls.code}
                        </div>
                        <div className="text-[11px] text-[#5A6478] mt-0.5">
                          {cls.courseName} • Phòng {cls.room}
                        </div>
                        <div className="text-[11px] text-[#1E40AF] font-medium mt-0.5">
                          {cls.shiftDetail}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-semibold text-[#131B2E] tabular-nums">
                          {cls.enrolledCount}/{cls.capacity} học viên
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeacher(null)
                            navigate("/lop-hoc")
                          }}
                          className="text-[11px] text-[#1E40AF] hover:underline flex items-center gap-0.5 justify-end mt-1 font-medium"
                        >
                          <span>Mở lớp</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#DFE4EC]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTeacher(null)}
                className="h-8 text-xs"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CHI TIẾT NGƯỜI GIỚI THIỆU VÀ DANH SÁCH HỌC VIÊN
      ========================================================================= */}
      {selectedReferrer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-xl p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">
                  {selectedReferrer.fullName}
                </h3>
                <p className="text-xs text-[#5A6478] mt-0.5">
                  {selectedReferrer.organization} • {selectedReferrer.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReferrer(null)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Danh sách học viên được giới thiệu */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#131B2E] flex items-center justify-between">
                <span>Học viên do Thầy/Cô giới thiệu ({selectedReferrer.students.length})</span>
                <span className="text-[11px] font-normal text-[#5A6478]">
                  Hoa hồng: 20.000 ₫ / hồ sơ
                </span>
              </h4>

              <div className="border border-[#DFE4EC] rounded-[6px] divide-y divide-[#DFE4EC] text-xs max-h-[300px] overflow-y-auto">
                {selectedReferrer.students.map((st) => (
                  <div key={st.id} className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-[#131B2E]">
                        {st.fullName} ({st.studentCode})
                      </div>
                      <div className="text-[11px] text-[#5A6478] mt-0.5">
                        {st.courseName} • ĐK: {formatDate(st.registeredDate)}
                      </div>
                    </div>

                    <div className="text-right">
                      {st.commissionStatus === "du_dieu_kien" ? (
                        <Badge variant="success" className="text-[10px] font-bold">
                          Đủ điều kiện
                        </Badge>
                      ) : st.commissionStatus === "da_chi" ? (
                        <Badge variant="neutral" className="text-[10px]">
                          Đã chi
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="text-[10px]">
                          Chưa đủ ĐK
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#DFE4EC]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReferrer(null)}
                className="h-8 text-xs"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DIALOG: XÁC NHẬN "ĐÁNH DẤU ĐÃ CHI" HOA HỒNG HÀNG LOẠT
      ========================================================================= */}
      {showBulkPayoutDialog && (
        <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-2 text-[#9A7B3F]">
              <Sparkles className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-[#131B2E]">
                Xác nhận chi trả hoa hồng
              </h3>
            </div>

            <div className="bg-[#F8F4EB] border border-[#E8DFC8] rounded-[6px] p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5A6478]">Số lượng hồ sơ chi trả:</span>
                <span className="font-bold text-[#131B2E] tabular-nums">
                  {selectedCommissionIds.length} hồ sơ
                </span>
              </div>
              <div className="flex justify-between border-t border-[#E8DFC8] pt-1">
                <span className="text-[#5A6478]">Tổng số tiền chi (20.000 ₫ x {selectedCommissionIds.length}):</span>
                <span className="font-bold text-base text-[#9A7B3F] tabular-nums">
                  {formatCurrency(selectedCommissionIds.length * 20000)}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#5A6478] leading-relaxed">
              Bạn có chắc chắn muốn đánh dấu đã chi trả cho danh sách{" "}
              <strong>{selectedCommissionIds.length}</strong> hồ sơ đã chọn? Trạng thái
              sẽ được chuyển sang <strong>"Đã chi"</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DFE4EC]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBulkPayoutDialog(false)}
                className="h-8 text-xs"
              >
                Hủy
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmBulkPayout}
                className="h-8 text-xs font-semibold bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
              >
                Xác nhận đã chi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM GIÁO VIÊN MỚI
      ========================================================================= */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">Thêm giáo viên mới</h3>
                <p className="text-xs text-[#5A6478] mt-0.5">Tiếp nhận giáo viên giảng dạy tại trung tâm</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Họ và tên giáo viên *
                </label>
                <Input
                  type="text"
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  placeholder="Ví dụ: Thầy Nguyễn Văn A"
                  required
                  autoFocus
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Số điện thoại *
                </label>
                <Input
                  type="text"
                  value={newTeacherPhone}
                  onChange={(e) => setNewTeacherPhone(e.target.value)}
                  placeholder="0912 345 678"
                  required
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={newTeacherEmail}
                  onChange={(e) => setNewTeacherEmail(e.target.value)}
                  placeholder="giao_vien@tvc.edu.vn"
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Môn học phụ trách
                </label>
                <Input
                  type="text"
                  value={newTeacherSubjects}
                  onChange={(e) => setNewTeacherSubjects(e.target.value)}
                  placeholder="Tin học Cơ bản, Tiếng Anh..."
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="h-9 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                >
                  Thêm giáo viên
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: THÊM NGƯỜI GIỚI THIỆU MỚI
      ========================================================================= */}
      {showAddReferrerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] w-full max-w-md p-5 shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-start justify-between border-b border-[#DFE4EC] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#131B2E]">Thêm người giới thiệu</h3>
                <p className="text-xs text-[#5A6478] mt-0.5">Thêm Thầy/Cô hoặc đối tác tuyển sinh</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddReferrerModal(false)}
                className="p-1 text-[#5A6478] hover:text-[#131B2E] rounded-[4px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReferrer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Họ và tên người giới thiệu *
                </label>
                <Input
                  type="text"
                  value={newRefName}
                  onChange={(e) => setNewRefName(e.target.value)}
                  placeholder="Ví dụ: Thầy Trần Văn B"
                  required
                  autoFocus
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Số điện thoại *
                </label>
                <Input
                  type="text"
                  value={newRefPhone}
                  onChange={(e) => setNewRefPhone(e.target.value)}
                  placeholder="0918 765 432"
                  required
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#131B2E] mb-1">
                  Trường / Đơn vị công tác
                </label>
                <Input
                  type="text"
                  value={newRefOrg}
                  onChange={(e) => setNewRefOrg(e.target.value)}
                  placeholder="Ví dụ: Trường CĐ Nghề Trà Vinh"
                  className="h-9 text-xs border-[#DFE4EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Phân loại
                  </label>
                  <select
                    value={newRefType}
                    onChange={(e) => {
                      const t = e.target.value as "thay_co" | "hoc_vien_cu" | "doi_tac"
                      setNewRefType(t)
                      // Quy tắc: Thầy/Cô: bật hoa hồng, Học viên cũ/Bạn bè: tắt
                      setNewRefReceiveCommission(t === "thay_co")
                    }}
                    className="w-full h-9 text-xs rounded-[6px] border border-[#DFE4EC] bg-white px-2 font-medium"
                  >
                    <option value="thay_co">Thầy/Cô giới thiệu</option>
                    <option value="hoc_vien_cu">Học viên cũ</option>
                    <option value="doi_tac">Đối tác / Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#131B2E] mb-1">
                    Nhận hoa hồng
                  </label>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRefReceiveCommission}
                        onChange={(e) => setNewRefReceiveCommission(e.target.checked)}
                        className="w-4 h-4 text-[#1E40AF] rounded border-[#DFE4EC]"
                      />
                      <span className="text-xs font-semibold">
                        {newRefReceiveCommission ? "Bật (20.000 ₫/HS)" : "Tắt"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#DFE4EC]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddReferrerModal(false)}
                  className="h-9 text-xs"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs font-medium bg-[#1E40AF] text-white hover:bg-[#1E3A8A]"
                >
                  Thêm người giới thiệu
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
