export type UserRole = 'chu' | 'nhan_vien';

export interface Profile {
    id: string;
    full_name: string | null;
    role: UserRole;
    is_active: boolean;
    created_at: string;
}

export type ZaloStatus =
    | 'chua_lien_he'
    | 'da_lien_he'
    | 'da_vao_nhom'
    | 'khong_tim_thay'
    | 'chan_tin_nhan';

export type EnrollmentStatus =
    | 'cho_xep_lop'
    | 'dang_hoc'
    | 'bao_luu'
    | 'da_chuyen_lop'
    | 'da_nghi'
    | 'hoan_thanh';

export interface StudentListItem {
    id: string;
    code: string;
    last_name: string;
    first_name: string;
    full_name: string;
    full_name_search: string;
    gender: 'nam' | 'nu' | 'khac' | null;
    date_of_birth: string | null;
    phone: string | null;
    contact_status?: string;
    zalo_status: ZaloStatus;
    dossier_complete: boolean;
    missing_dossier_items?: string[];
    organization_name: string | null;
    organization_detail: string | null;
    referrer_name: string | null;
    active_enrollments: number;
    total_due: number;
    needs_refund: boolean;
    created_at: string;
    registered_at?: string;
    course_name?: string;
    class_code?: string | null;
    enrollment_status?: EnrollmentStatus;
    exam_status?: 'chua_thi' | 'doi_lich' | 'da_thi';
    cert_status?: 'chua_cap' | 'da_cap';
}

export interface DashboardCounts {
    debt_count: number;
    overdue_count: number;
    waiting_class_count: number;
    missing_dossier_count: number;
    not_contacted_count: number;
    exams_next_7_days: number;
    need_refund_count?: number | null;
    awaiting_certificate_count?: number | null;
}
