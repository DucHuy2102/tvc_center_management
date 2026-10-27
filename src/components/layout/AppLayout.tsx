import React, { useState } from "react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  GraduationCap,
  Award,
  FileBadge,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

export const AppLayout: React.FC = () => {
  const { profile, user, isOwner, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate("/dang-nhap")
  }

  // Danh sách các mục menu điều hướng
  const baseNavItems = [
    { to: "/", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/hoc-vien", label: "Học viên", icon: Users },
    { to: "/hoc-phi", label: "Học phí", icon: CreditCard },
    { to: "/lich", label: "Lịch", icon: Calendar },
    { to: "/lop-hoc", label: "Lớp học", icon: GraduationCap },
    { to: "/ky-thi", label: "Kỳ thi", icon: Award },
  ]

  const ownerNavItems = [
    { to: "/cap-bang", label: "Cấp bằng", icon: FileBadge },
    { to: "/giao-vien-hoa-hong", label: "GV & Hoa hồng", icon: UserCheck },
    { to: "/bao-cao", label: "Báo cáo", icon: BarChart3 },
    { to: "/cai-dat", label: "Cài đặt", icon: Settings },
  ]

  // Tab dưới đáy màn hình điện thoại (5 mục chính + nút "Thêm")
  const mobileBottomItems = [
    { to: "/", label: "Tổng quan", icon: LayoutDashboard },
    { to: "/hoc-vien", label: "Học viên", icon: Users },
    { to: "/hoc-phi", label: "Học phí", icon: CreditCard },
    { to: "/lich", label: "Lịch", icon: Calendar },
  ]

  // Tiêu đề trang hiện tại
  const getCurrentPageTitle = () => {
    const path = location.pathname
    if (path === "/") return "Tổng quan"
    if (path.startsWith("/hoc-vien")) return "Học viên"
    if (path.startsWith("/hoc-phi")) return "Học phí"
    if (path.startsWith("/lich")) return "Lịch học & thi"
    if (path.startsWith("/lop-hoc")) return "Quản lý lớp học"
    if (path.startsWith("/ky-thi")) return "Kỳ thi"
    if (path.startsWith("/cap-bang")) return "Cấp bằng"
    if (path.startsWith("/giao-vien-hoa-hong")) return "Giáo viên và Hoa hồng"
    if (path.startsWith("/bao-cao")) return "Báo cáo thống kê"
    if (path.startsWith("/cai-dat")) return "Cài đặt hệ thống"
    return "Quản lý trung tâm"
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F4F6FA] text-foreground">
      {/* =========================================================================
          DESKTOP SIDEBAR
      ========================================================================= */}
      <aside className="hidden md:flex flex-col w-60 border-r border-[#DFE4EC] bg-white h-screen sticky top-0 shrink-0 select-none">
        {/* Logo & Header */}
        <div className="h-14 border-b border-[#DFE4EC] px-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#1E40AF] text-white flex items-center justify-center font-bold text-sm tracking-wider">
            TVC
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight text-[#131B2E]">
              TVC Center
            </div>
            <div className="text-[11px] text-[#5A6478] leading-none">
              Quản lý trung tâm
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {/* Nhóm Vận hành */}
          <div>
            <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5A6478]">
              Vận hành
            </div>
            <nav className="space-y-0.5">
              {baseNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-sm transition-colors ${
                        isActive
                          ? "bg-[#E7EDFB] text-[#1E40AF] font-medium"
                          : "text-[#131B2E] hover:bg-[#ECEFF5] hover:text-[#131B2E]"
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Nhóm Quản trị (Chỉ dành cho Chủ) */}
          {isOwner && (
            <div>
              <div className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5A6478] flex items-center justify-between">
                <span>Quản lý</span>
                <span className="text-[10px] text-[#1E40AF] bg-[#E7EDFB] px-1.5 py-0.2 rounded-full font-normal">
                  Chủ
                </span>
              </div>
              <nav className="space-y-0.5">
                {ownerNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-2.5 py-2 rounded-[6px] text-sm transition-colors ${
                          isActive
                            ? "bg-[#E7EDFB] text-[#1E40AF] font-medium"
                            : "text-[#131B2E] hover:bg-[#ECEFF5] hover:text-[#131B2E]"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          )}
        </div>

        {/* User profile footer */}
        <div className="border-t border-[#DFE4EC] p-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="min-w-0 pr-2">
              <div className="text-sm font-medium text-[#131B2E] truncate">
                {profile?.full_name || user?.email?.split("@")[0] || "Người dùng"}
              </div>
              <div className="text-xs text-[#5A6478] truncate">
                {user?.email}
              </div>
            </div>
            <Badge variant={isOwner ? "default" : "neutral"} className="text-[10px] shrink-0">
              {isOwner ? "Chủ" : "Nhân viên"}
            </Badge>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium text-[#5A6478] hover:text-[#B3382C] hover:bg-[#FBE8E5] rounded-[6px] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          MOBILE HEADER
      ========================================================================= */}
      <header className="md:hidden sticky top-0 z-30 h-13 border-b border-[#DFE4EC] bg-white px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs">
            TVC
          </div>
          <span className="font-semibold text-sm text-[#131B2E]">
            {getCurrentPageTitle()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isOwner ? "default" : "neutral"} className="text-[10px]">
            {isOwner ? "Chủ" : "NV"}
          </Badge>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-[6px] text-[#5A6478] hover:bg-[#ECEFF5] hover:text-[#131B2E]"
            aria-label="Mở menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN CONTENT AREA
      ========================================================================= */}
      <main className="flex-1 min-w-0 flex flex-col pb-16 md:pb-0 overflow-x-hidden">
        <Outlet />
      </main>

      {/* =========================================================================
          MOBILE BOTTOM TAB BAR (fixed at bottom on mobile)
      ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 h-14 bg-white border-t border-[#DFE4EC] flex items-center justify-around px-1">
        {mobileBottomItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] transition-colors ${
                isActive ? "text-[#1E40AF] font-semibold" : "text-[#5A6478]"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-[#1E40AF]" : "text-[#5A6478]"}`} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}

        {/* Nút "Thêm" để mở toàn bộ menu trên mobile */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] text-[#5A6478] transition-colors`}
        >
          <Menu className="w-5 h-5 mb-0.5 text-[#5A6478]" />
          <span>Thêm</span>
        </button>
      </nav>

      {/* =========================================================================
          MOBILE FULL MENU SHEET / MODAL
      ========================================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-black/40 backdrop-blur-xs">
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="bg-white rounded-t-[16px] border-t border-[#DFE4EC] max-h-[85vh] overflow-y-auto p-4 flex flex-col animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#DFE4EC] mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[6px] bg-[#1E40AF] text-white flex items-center justify-center font-bold text-xs">
                  TVC
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#131B2E]">Menu chức năng</div>
                  <div className="text-xs text-[#5A6478]">
                    {profile?.full_name || user?.email} ({isOwner ? "Chủ" : "Nhân viên"})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-[6px] text-[#5A6478] hover:bg-[#ECEFF5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {/* Tất cả chức năng */}
              <div>
                <div className="text-xs font-semibold text-[#5A6478] uppercase px-1 mb-1.5">
                  Vận hành
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {baseNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.to)
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-[6px] text-sm border ${
                          isActive
                            ? "bg-[#E7EDFB] text-[#1E40AF] border-[#3B82F6] font-medium"
                            : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#ECEFF5]"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-[#1E40AF]" />
                        <span>{item.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              {/* Dành cho Chủ */}
              {isOwner && (
                <div>
                  <div className="text-xs font-semibold text-[#5A6478] uppercase px-1 mb-1.5 flex items-center justify-between">
                    <span>Quản lý (Chỉ Chủ)</span>
                    <Badge variant="default" className="text-[9px]">Chủ</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ownerNavItems.map((item) => {
                      const Icon = item.icon
                      const isActive = location.pathname.startsWith(item.to)
                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2 p-2 rounded-[6px] text-sm border ${
                            isActive
                              ? "bg-[#E7EDFB] text-[#1E40AF] border-[#3B82F6] font-medium"
                              : "bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#ECEFF5]"
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0 text-[#1E40AF]" />
                          <span>{item.label}</span>
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#DFE4EC]">
              <button
                onClick={handleSignOut}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-[6px] bg-[#FBE8E5] text-[#B3382C] text-sm font-medium hover:bg-[#B3382C]/15 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
