import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Lock, Mail, AlertCircle } from "lucide-react"

export const Login: React.FC = () => {
  const { signIn, user, profile, isActive } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Nếu đã đăng nhập và tài khoản đã kích hoạt, chuyển hướng
  React.useEffect(() => {
    if (user && profile && isActive) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/hoc-vien"
      navigate(from, { replace: true })
    }
  }, [user, profile, isActive, navigate, location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập địa chỉ email.")
      return
    }
    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.")
      return
    }

    setIsSubmitting(true)
    const result = await signIn(email, password)
    setIsSubmitting(false)

    if (!result.success) {
      setErrorMessage(result.error || "Đăng nhập không thành công.")
    } else {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/hoc-vien"
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[10px] bg-[#1E40AF] text-white font-bold text-lg mb-3 shadow-none">
            TVC
          </div>
          <h1 className="text-xl font-bold text-[#131B2E]">
            Hệ thống Quản lý Trung tâm
          </h1>
          <p className="text-xs text-[#5A6478] mt-1">
            Dành cho Ban Quản lý và Nhân viên trung tâm
          </p>
        </div>

        {/* Warning if Supabase is not configured */}
        {!isSupabaseConfigured && (
          <div className="mb-4 p-3 bg-[#FBF0DC] border border-[#A86A0B]/30 rounded-[6px] text-xs text-[#A86A0B] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Chưa kết nối Supabase:</strong> Vui lòng cấu hình biến môi trường{" "}
              <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> trong file <code>.env</code>.
            </div>
          </div>
        )}

        {/* Login Box */}
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-6 shadow-none">
          <h2 className="text-sm font-semibold text-[#131B2E] mb-4">
            Đăng nhập vào tài khoản
          </h2>

          {errorMessage && (
            <div className="mb-4 p-3 bg-[#FBE8E5] border border-[#B3382C]/30 rounded-[6px] text-xs text-[#B3382C] flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B3382C]" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#131B2E] mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#5A6478] absolute left-2.5 top-2.5 pointer-events-none" />
                <Input
                  type="email"
                  placeholder="admin@tvc.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#131B2E] mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#5A6478] absolute left-2.5 top-2.5 pointer-events-none" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-8"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#DFE4EC] text-center text-[11px] text-[#5A6478]">
            Tài khoản do Ban Quản lý cấp trực tiếp.
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#5A6478]">
          TVC Center &bull; Tin học &bull; Tiếng Anh
        </div>
      </div>
    </div>
  )
}
