import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "@/hooks/useAuth"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"

// Trang chức năng
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import { Students } from "@/pages/Students"
import { Tuition } from "@/pages/Tuition"
import { Schedule } from "@/pages/Schedule"
import { Classes } from "@/pages/Classes"
import { Exams } from "@/pages/Exams"
import { Certificates } from "@/pages/Certificates"
import { TeachersCommissions } from "@/pages/TeachersCommissions"
import { Reports } from "@/pages/Reports"
import { Settings } from "@/pages/Settings"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Đăng nhập */}
            <Route path="/dang-nhap" element={<Login />} />

            {/* Khung ứng dụng chính có bảo vệ */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Vận hành chung */}
              <Route index element={<Dashboard />} />
              <Route path="hoc-vien" element={<Students />} />
              <Route path="hoc-phi" element={<Tuition />} />
              <Route path="lich" element={<Schedule />} />
              <Route path="lop-hoc" element={<Classes />} />
              <Route path="ky-thi" element={<Exams />} />

              {/* Chỉ dành cho Quản lý (Chủ) */}
              <Route
                path="cap-bang"
                element={
                  <ProtectedRoute requireOwner>
                    <Certificates />
                  </ProtectedRoute>
                }
              />
              <Route
                path="giao-vien-hoa-hong"
                element={
                  <ProtectedRoute requireOwner>
                    <TeachersCommissions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="bao-cao"
                element={
                  <ProtectedRoute requireOwner>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="cai-dat"
                element={
                  <ProtectedRoute requireOwner>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Tuyến đường không hợp lệ */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
