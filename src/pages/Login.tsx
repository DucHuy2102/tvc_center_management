import React, { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { isSupabaseConfigured } from "@/lib/supabase"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

export const Login: React.FC = () => {
  const { signIn, user, profile, isActive } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForgotDialog, setShowForgotDialog] = useState(false)

  // Nếu người dùng đã đăng nhập hợp lệ và tài khoản đã kích hoạt, tự động chuyển vào hệ thống
  React.useEffect(() => {
    if (user && profile && isActive) {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/hoc-vien"
      navigate(from, { replace: true })
    }
  }, [user, profile, isActive, navigate, location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage("Email hoặc mật khẩu chưa đúng. Kiểm tra lại và thử lần nữa.")
      return
    }

    setIsSubmitting(true)
    const result = await signIn(email, password)
    setIsSubmitting(false)

    if (!result.success) {
      // Trường hợp mật khẩu/email sai
      if (result.error && (result.error.includes("Invalid login credentials") || result.error.includes("không chính xác"))) {
        setErrorMessage("Email hoặc mật khẩu chưa đúng. Kiểm tra lại và thử lần nữa.")
      } else {
        setErrorMessage(result.error || "Email hoặc mật khẩu chưa đúng. Kiểm tra lại và thử lần nữa.")
      }
    } else {
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || "/hoc-vien"
      navigate(from, { replace: true })
    }
  }

  const hasFieldError = Boolean(errorMessage)

  return (
    <div className="min-h-screen bg-[#F4F6FA] flex flex-col justify-center items-center px-4 py-8 font-sans">
      <div className="w-full max-w-[360px] mx-auto space-y-6">
        {/* Top Header: Monogram logo + App Name + Center Name */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-[6px] bg-[#1E40AF] text-white font-semibold text-base flex items-center justify-center mx-auto mb-3 select-none">
            T
          </div>
          <h1 className="text-[22px] leading-[30px] font-semibold text-[#131B2E]">
            Quản lý trung tâm
          </h1>
          <p className="text-sm leading-5 text-[#5A6478] mt-1">
            Trung tâm Tin học & Ngoại ngữ TVC
          </p>
        </div>

        {/* Warning if Supabase is not configured */}
        {!isSupabaseConfigured && (
          <div className="p-3 bg-[#FBF0DC] border border-[#A86A0B]/30 rounded-[6px] text-xs text-[#A86A0B] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Chưa kết nối Supabase:</strong> Vui lòng điền <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> trong file <code>.env</code>.
            </div>
          </div>
        )}

        {/* Main Login Card */}
        <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-6 shadow-none">
          {/* Field Error State */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#FBE8E5] border border-[#B3382C]/30 rounded-[6px] text-xs leading-relaxed text-[#B3382C] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B3382C]" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Field: Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[#131B2E] mb-1.5"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="ten@trungtam.vn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                className={`w-full h-11 sm:h-10 rounded-[6px] border bg-white px-3 text-sm text-[#131B2E] placeholder:text-[#5A6478] outline-none transition-colors ${
                  hasFieldError
                    ? "border-[#B3382C] focus:ring-2 focus:ring-[#B3382C]/20 focus:border-[#B3382C]"
                    : "border-[#DFE4EC] focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                }`}
                autoComplete="email"
                autoCapitalize="none"
                spellCheck="false"
                required
              />
            </div>

            {/* Field: Mật khẩu (with show/hide toggle) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-[#131B2E]"
                >
                  Mật khẩu
                </label>
                {/* Quiet link Quên mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowForgotDialog(true)}
                  className="text-xs text-[#5A6478] hover:text-[#1E40AF] hover:underline cursor-pointer transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  className={`w-full h-11 sm:h-10 rounded-[6px] border bg-white pl-3 pr-10 text-sm text-[#131B2E] placeholder:text-[#5A6478] outline-none transition-colors ${
                    hasFieldError
                      ? "border-[#B3382C] focus:ring-2 focus:ring-[#B3382C]/20 focus:border-[#B3382C]"
                      : "border-[#DFE4EC] focus:border-[#1E40AF] focus:ring-2 focus:ring-[#1E40AF]/20"
                  }`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                  className="absolute right-0 top-0 h-full px-3 text-[#5A6478] hover:text-[#131B2E] flex items-center justify-center cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary full-width button "Đăng nhập" with loading state */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 sm:h-10 rounded-[6px] bg-[#1E40AF] hover:bg-[#1E3A8A] text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Đang đăng nhập...</span>
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Quiet footer note (No sign-up) */}
        <div className="text-center text-xs text-[#5A6478]">
          Tài khoản do Chủ trung tâm cấp trực tiếp.
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {showForgotDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-[#DFE4EC] rounded-[10px] p-6 max-w-sm w-full space-y-4 shadow-none">
            <h3 className="text-base font-semibold text-[#131B2E]">
              Cấp lại mật khẩu
            </h3>
            <p className="text-sm text-[#5A6478] leading-relaxed">
              Hệ thống không hỗ trợ tự đặt lại mật khẩu trực tuyến. Vui lòng liên hệ trực tiếp với <strong>Chủ trung tâm</strong> để được tạo lại mật khẩu mới cho tài khoản của bạn.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowForgotDialog(false)}
                className="w-full h-10 rounded-[6px] bg-[#1E40AF] text-white text-sm font-medium hover:bg-[#1E3A8A] transition-colors cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
