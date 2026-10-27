import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    isOwner: boolean;
    isStaff: boolean;
    isActive: boolean;
    signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchProfile = async (userId: string): Promise<Profile | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Lỗi khi tải thông tin hồ sơ:', error.message);
                return null;
            }
            return data as Profile | null;
        } catch (err) {
            console.error('Lỗi kết nối khi tải hồ sơ:', err);
            return null;
        }
    };

    const refreshProfile = async () => {
        if (!user) {
            setProfile(null);
            return;
        }
        const prof = await fetchProfile(user.id);
        setProfile(prof);
    };

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setIsLoading(false);
            return;
        }

        // Lấy session ban đầu
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const prof = await fetchProfile(currentUser.id);
                setProfile(prof);
            } else {
                setProfile(null);
            }
            setIsLoading(false);
        });

        // Lắng nghe thay đổi trạng thái Auth
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const prof = await fetchProfile(currentUser.id);
                setProfile(prof);
            } else {
                setProfile(null);
            }
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (
        email: string,
        pass: string,
    ): Promise<{ success: boolean; error?: string }> => {
        if (!isSupabaseConfigured) {
            return {
                success: false,
                error: 'Chưa cấu hình Supabase URL và Anon Key trong file .env.',
            };
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: pass,
            });

            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    return { success: false, error: 'Email hoặc mật khẩu không chính xác.' };
                }
                return { success: false, error: `Đăng nhập thất bại: ${error.message}` };
            }

            if (!data.user) {
                return { success: false, error: 'Không tìm thấy thông tin tài khoản.' };
            }

            // Kiểm tra trạng thái is_active và role trong profiles
            const prof = await fetchProfile(data.user.id);
            if (!prof) {
                // Hồ sơ chưa được tạo hoặc chưa có quyền đọc
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                return {
                    success: false,
                    error: 'Không tìm thấy hồ sơ người dùng trong hệ thống.',
                };
            }

            if (!prof.is_active) {
                await supabase.auth.signOut();
                setUser(null);
                setProfile(null);
                return {
                    success: false,
                    error: 'Tài khoản của bạn chưa được kích hoạt. Vui lòng liên hệ Quản lý (Chủ) để kích hoạt.',
                };
            }

            setUser(data.user);
            setProfile(prof);
            return { success: true };
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
            return { success: false, error: errorMsg };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Lỗi đăng xuất:', err);
        } finally {
            setUser(null);
            setProfile(null);
        }
    };

    const isOwner = profile?.role === 'chu';
    const isStaff = profile?.role === 'nhan_vien';
    const isActive = Boolean(profile?.is_active);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                isLoading,
                isOwner,
                isStaff,
                isActive,
                signIn,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
    }
    return context;
};
