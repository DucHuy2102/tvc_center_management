# Phần mềm Quản lý Trung tâm TVC (TVC Center Admin)

Hệ thống quản lý học viên, học phí, lịch học, lớp học và kỳ thi cho trung tâm tin học và tiếng Anh.

---

## 1. Công nghệ sử dụng

- **Frontend:** React 19 + TypeScript + Vite.
- **Styling:** Tailwind CSS v4 + shadcn/ui.
- **Theme:** Theme xanh dương chuẩn theo phong cách tối giản, tốc độ, không bóng đổ (border 1px).
- **Typography:** Font **Be Vietnam Pro** (hỗ trợ hiển thị tiếng Việt hoàn hảo).
- **Routing & State:** React Router v7, TanStack Query v5.
- **Backend & Auth:** Supabase (`@supabase/supabase-js`) với Row Level Security (RLS).
- **PWA:** `vite-plugin-pwa` hỗ trợ cài đặt ứng dụng trên thiết bị di động.

---

## 2. Cài đặt và Chạy thử

### Bước 1: Cài đặt thư viện dependencies

```bash
npm install
```

### Bước 2: Cấu hình biến môi trường

Sao chép file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Điền URL và Anon Key lấy từ Supabase Dashboard (Settings -> API):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **LƯU Ý BẢO MẬT:** Tuyệt đối **CHỈ DÙNG ANON / PUBLISHABLE KEY** trong ứng dụng trình duyệt. Tuyệt đối không dùng `service_role` key.

### Bước 3: Khởi chạy môi trường phát triển (Dev)

```bash
npm run dev
```

Ứng dụng sẽ chạy tại địa chỉ mặc định: [http://localhost:5173](http://localhost:5173).

### Bước 4: Kiểm tra build sản phẩm

```bash
npm run build
```

---

## 3. Cấu trúc thư mục

```text
admin_tvc_center/
├── public/                 # Tài nguyên tĩnh (favicon, manifest icons)
├── src/
│   ├── components/         # Các component dùng chung
│   │   ├── auth/           # Route bảo vệ phân quyền (ProtectedRoute)
│   │   ├── layout/         # AppLayout: Desktop Sidebar & Mobile Bottom Tab
│   │   └── ui/             # shadcn/ui (Button, Input, Badge,...)
│   ├── hooks/              # Custom React hooks (useAuth,...)
│   ├── lib/                # Thư viện tiện ích
│   │   ├── format.ts       # Định dạng tiền tệ (1.500.000 ₫), ngày (dd/MM/yyyy), giờ 24h
│   │   ├── supabase.ts     # Supabase client an toàn
│   │   └── utils.ts        # Helper cn (clsx + tailwind-merge)
│   ├── pages/              # Các màn hình ứng dụng
│   │   ├── Login.tsx       # Đăng nhập Supabase Auth
│   │   ├── Students.tsx    # Danh sách học viên (view v_students_list, tìm không dấu, tải thêm)
│   │   ├── Dashboard.tsx   # Tổng quan
│   │   ├── Tuition.tsx     # Học phí
│   │   ├── Schedule.tsx    # Lịch tuần & thi
│   │   ├── Classes.tsx     # Quản lý lớp học
│   │   ├── Exams.tsx       # Kỳ thi
│   │   ├── Certificates.tsx       # Cấp bằng (Chỉ Chủ)
│   │   ├── TeachersCommissions.tsx # Giáo viên & Hoa hồng (Chỉ Chủ)
│   │   ├── Reports.tsx     # Báo cáo doanh thu (Chỉ Chủ)
│   │   └── Settings.tsx    # Cài đặt trung tâm (Chỉ Chủ)
│   ├── types/              # Kiểu dữ liệu TypeScript (database.ts)
│   ├── App.tsx             # Cấu hình Routing & Provider
│   ├── index.css           # Cấu hình Tailwind v4 theme & font Be Vietnam Pro
│   └── main.tsx            # Điểm vào ứng dụng
├── .env.example            # Mẫu biến môi trường
├── index.html              # HTML shell
├── tsconfig.json           # Cấu hình TypeScript
└── vite.config.ts          # Cấu hình Vite & PWA
```

---

## 4. Bảng màu giao diện chuẩn

| Vai trò                                  | Mã màu                           |
| ---------------------------------------- | -------------------------------- |
| Nền ứng dụng (background)                | `#F4F6FA`                        |
| Bề mặt (card, popover, input)            | `#FFFFFF`                        |
| Chữ chính (foreground)                   | `#131B2E`                        |
| Chữ phụ (muted-foreground)               | `#5A6478`                        |
| Viền (border)                            | `#DFE4EC`                        |
| Xanh chính (primary)                     | `#1E40AF`                        |
| Xanh chính khi rê chuột                  | `#1E3A8A`                        |
| Nền xanh nhạt (accent, hàng đang chọn)   | `#E7EDFB`                        |
| Viền focus (ring)                        | `#3B82F6`                        |
| Trạng thái Thành công                    | Chữ `#2F7D4F` trên nền `#E6F3EA` |
| Trạng thái Cảnh báo                      | Chữ `#A86A0B` trên nền `#FBF0DC` |
| Trạng thái Nguy hiểm                     | Chữ `#B3382C` trên nền `#FBE8E5` |
| Trạng thái Trung tính                    | Chữ `#5A6478` trên nền `#ECEFF5` |
| Màu đồng (chỉ dùng cho số tiền hoa hồng) | `#9A7B3F`                        |

**Quy tắc bo góc:**

- Ô nhập và nút bấm: `6px` (`rounded-[6px]`).
- Khối nội dung / thẻ Card: `10px` (`rounded-[10px]`), sử dụng viền 1px `border-[#DFE4EC]` thay cho bóng đổ.
- Bottom sheet / menu mobile: `16px` (`rounded-t-[16px]`).
- Nhãn trạng thái (Badge): Bo tròn hết cỡ (`rounded-full`).

---

## 5. Phân quyền người dùng

- **Chủ trung tâm (`role: 'chu'`):** Toàn quyền truy cập mọi tính năng, bao gồm các màn hình quản trị tài chính (Học phí, Cấp bằng, Giáo viên & Hoa hồng, Báo cáo doanh thu, Cài đặt).
- **Nhân viên (`role: 'nhan_vien'`):** Truy cập các nghiệp vụ vận hành hàng ngày (Tổng quan, Học viên, Học phí cơ bản, Lịch học, Lớp học, Kỳ thi). Các màn hình chỉ-Chủ tự động bị ẩn trên thanh điều hướng và bị chặn truy cập trực tiếp bằng URL qua `ProtectedRoute`.
- **Kích hoạt tài khoản:** Tài khoản mới tạo qua Supabase Auth mặc định ở trạng thái chưa kích hoạt (`is_active = false`), phải được Chủ kích hoạt trong bảng `profiles` mới có thể đăng nhập vào ứng dụng.
