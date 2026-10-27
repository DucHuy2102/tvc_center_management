export type UserRole = "chu" | "nhan_vien"

export interface Profile {
  id: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
}

export type ContactStatus =
  | "chua_lien_he"
  | "da_goi"
  | "khong_nghe_may"
  | "can_goi_lai"
  | "hen_den_trung_tam"
  | "khong_con_nhu_cau"

export interface StudentListItem {
  id: string
  code: string
  last_name: string
  first_name: string
  full_name: string
  full_name_search: string
  gender: "nam" | "nu" | "khac" | null
  date_of_birth: string | null
  phone: string | null
  contact_status: ContactStatus
  dossier_complete: boolean
  organization_name: string | null
  organization_detail: string | null
  referrer_name: string | null
  active_enrollments: number
  total_due: number
  needs_refund: boolean
  created_at: string
}

export interface DashboardCounts {
  debt_count: number
  overdue_count: number
  waiting_class_count: number
  missing_dossier_count: number
  not_contacted_count: number
  exams_next_7_days: number
  need_refund_count?: number | null
  awaiting_certificate_count?: number | null
}
