import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/format';
import {
    Plus,
    ArrowLeft,
    Calendar,
    AlertTriangle,
    FileSpreadsheet,
    Users,
    UserPlus,
    ArrowRightLeft,
    X,
    Split,
} from 'lucide-react';

// Định nghĩa kiểu dữ liệu lớp học
interface ClassItem {
    id: string;
    code: string; // Mã lớp đầy đủ: UDCNTTCB_K0126_Ca1PM1
    batchCode: string; // Khóa: UDCNTTCB_K0126
    courseName: string;
    coursePrefix: string;
    batchNo: string;
    year: number;
    shiftName: string;
    shiftDetail: string;
    room: string;
    teacher: string;
    startDate: string;
    endDate: string;
    price: number;
    capacity: number;
    enrolledCount: number;
    status: 'dang_mo' | 'dang_hoc' | 'ket_thuc';
    hasTeacherConflict?: boolean;
    hasRoomConflict?: boolean;
    students: {
        id: string;
        code: string;
        fullName: string;
        phone: string;
        status: 'dang_hoc' | 'cho_xep_lop' | 'bao_luu';
        totalDue: number;
    }[];
}

// 4 Ca học chuẩn của trung tâm
const SHIFTS = [
    { id: 'Ca 1', label: 'Ca 1 (Thứ 2-4-6, 18:30-20:30)', days: 'Thứ 2-4-6', time: '18:30-20:30' },
    { id: 'Ca 2', label: 'Ca 2 (Thứ 3-5-7, 18:30-20:30)', days: 'Thứ 3-5-7', time: '18:30-20:30' },
    {
        id: 'Ca 3',
        label: 'Ca 3 (Thứ 7 & Chủ nhật, 07:30-10:30)',
        days: 'Thứ 7 - Chủ nhật',
        time: '07:30-10:30',
    },
    {
        id: 'Ca 4',
        label: 'Ca 4 (Thứ 7 & Chủ nhật, 13:30-16:30)',
        days: 'Thứ 7 - Chủ nhật',
        time: '13:30-16:30',
    },
];

// Danh sách các khóa học
const COURSES_DATA = [
    { prefix: 'UDCNTTCB', name: 'Ứng dụng CNTT Cơ bản', durationMonths: 2.5, price: 1000000 },
    { prefix: 'UDCNTTNC', name: 'Ứng dụng CNTT Nâng cao', durationMonths: 2.5, price: 1125000 },
    { prefix: 'TAGT', name: 'Tiếng Anh giao tiếp', durationMonths: 2.5, price: 1000000 },
    { prefix: 'IC3', name: 'Chứng chỉ IC3 - GS6', durationMonths: 3.0, price: 1500000 },
    { prefix: 'PREIELTS', name: 'Pre-Ielts', durationMonths: 3.0, price: 1800000 },
];

// Dữ liệu lớp học mẫu chuẩn thực tế của TVC
const INITIAL_CLASSES: ClassItem[] = [
    {
        id: 'cls-1',
        code: 'UDCNTTCB_K0126_Ca1PM1',
        batchCode: 'UDCNTTCB_K0126',
        courseName: 'Ứng dụng CNTT Cơ bản',
        coursePrefix: 'UDCNTTCB',
        batchNo: '01',
        year: 2026,
        shiftName: 'Ca 1',
        shiftDetail: 'Thứ 2-4-6, 18:30-20:30',
        room: 'PM1',
        teacher: 'Thầy Tuấn',
        startDate: '2026-10-01',
        endDate: '2026-12-15',
        price: 1000000,
        capacity: 20,
        enrolledCount: 18,
        status: 'dang_hoc',
        hasRoomConflict: true, // Ví dụ minh họa xung đột phòng
        students: [
            {
                id: 'st-1',
                code: 'HV26-0001',
                fullName: 'Lê Hoàng Anh',
                phone: '0912 345 678',
                status: 'dang_hoc',
                totalDue: 0,
            },
            {
                id: 'st-2',
                code: 'HV26-0002',
                fullName: 'Phạm Gia Bảo',
                phone: '0988 123 456',
                status: 'dang_hoc',
                totalDue: 400000,
            },
            {
                id: 'st-3',
                code: 'HV26-0004',
                fullName: 'Trần Minh Khoa',
                phone: '0934 567 890',
                status: 'dang_hoc',
                totalDue: 0,
            },
            {
                id: 'st-4',
                code: 'HV26-0007',
                fullName: 'Hoàng Văn Nam',
                phone: '0945 777 888',
                status: 'dang_hoc',
                totalDue: 600000,
            },
        ],
    },
    {
        id: 'cls-2',
        code: 'UDCNTTCB_K0126_Ca1PM2',
        batchCode: 'UDCNTTCB_K0126',
        courseName: 'Ứng dụng CNTT Cơ bản',
        coursePrefix: 'UDCNTTCB',
        batchNo: '01',
        year: 2026,
        shiftName: 'Ca 1',
        shiftDetail: 'Thứ 2-4-6, 18:30-20:30',
        room: 'PM2',
        teacher: 'Cô Mai Anh',
        startDate: '2026-10-01',
        endDate: '2026-12-15',
        price: 1000000,
        capacity: 20,
        enrolledCount: 18,
        status: 'dang_hoc',
        hasTeacherConflict: true, // Ví dụ minh họa xung đột giáo viên
        students: [
            {
                id: 'st-5',
                code: 'HV26-0008',
                fullName: 'Vũ Bích Ngọc',
                phone: '0971 234 567',
                status: 'dang_hoc',
                totalDue: 0,
            },
            {
                id: 'st-6',
                code: 'HV26-0009',
                fullName: 'Đặng Quốc Bảo',
                phone: '0982 345 678',
                status: 'dang_hoc',
                totalDue: 500000,
            },
        ],
    },
    {
        id: 'cls-3',
        code: 'TAGT_K0126_Ca1PM1',
        batchCode: 'TAGT_K0126',
        courseName: 'Tiếng Anh giao tiếp',
        coursePrefix: 'TAGT',
        batchNo: '01',
        year: 2026,
        shiftName: 'Ca 1',
        shiftDetail: 'Thứ 2-4-6, 18:30-20:30',
        room: 'PM1',
        teacher: 'Cô Mai Anh',
        startDate: '2026-11-01',
        endDate: '2027-01-15',
        price: 1000000,
        capacity: 30,
        enrolledCount: 24,
        status: 'dang_mo',
        students: [
            {
                id: 'st-7',
                code: 'HV26-0003',
                fullName: 'Nguyễn Thị Hà',
                phone: '0903 888 999',
                status: 'dang_hoc',
                totalDue: 1200000,
            },
            {
                id: 'st-8',
                code: 'HV26-0005',
                fullName: 'Đỗ Phương Linh',
                phone: '0977 654 321',
                status: 'dang_hoc',
                totalDue: 800000,
            },
        ],
    },
    {
        id: 'cls-4',
        code: 'IC3_K0126_Ca2PM2',
        batchCode: 'IC3_K0126',
        courseName: 'Chứng chỉ IC3 - GS6',
        coursePrefix: 'IC3',
        batchNo: '01',
        year: 2026,
        shiftName: 'Ca 2',
        shiftDetail: 'Thứ 3-5-7, 18:30-20:30',
        room: 'PM2',
        teacher: 'Thầy Tuấn',
        startDate: '2026-10-15',
        endDate: '2027-01-15',
        price: 1500000,
        capacity: 40,
        enrolledCount: 15,
        status: 'dang_mo',
        students: [
            {
                id: 'st-9',
                code: 'HV26-0010',
                fullName: 'Bùi Hoàng Nam',
                phone: '0963 123 456',
                status: 'dang_hoc',
                totalDue: 0,
            },
        ],
    },
    {
        id: 'cls-5',
        code: 'PREIELTS_K0126_Ca1PM2',
        batchCode: 'PREIELTS_K0126',
        courseName: 'Pre-Ielts',
        coursePrefix: 'PREIELTS',
        batchNo: '01',
        year: 2026,
        shiftName: 'Ca 1',
        shiftDetail: 'Thứ 2-4-6, 18:30-20:30',
        room: 'PM2',
        teacher: 'Cô Hương',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        price: 1800000,
        capacity: 20,
        enrolledCount: 12,
        status: 'ket_thuc',
        students: [
            {
                id: 'st-10',
                code: 'HV26-0006',
                fullName: 'Võ Ngọc Mai',
                phone: '0918 222 333',
                status: 'dang_hoc',
                totalDue: 0,
            },
        ],
    },
];

export const Classes: React.FC = () => {
    const { isOwner } = useAuth();
    const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);
    const [statusFilter, setStatusFilter] = useState<'all' | 'dang_mo' | 'dang_hoc' | 'ket_thuc'>(
        'all',
    );
    const [courseFilter, setCourseFilter] = useState('all');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    // Modal Thêm lớp
    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [newCoursePrefix, setNewCoursePrefix] = useState(COURSES_DATA[0].prefix);
    const [newBatchNo, setNewBatchNo] = useState('02');
    const [newYear, setNewYear] = useState(2026);
    const [newShift, setNewShift] = useState('Ca 1');
    const [newRoom, setNewRoom] = useState('PM1');
    const [newTeacher, setNewTeacher] = useState('Thầy Tuấn');
    const [newStartDate, setNewStartDate] = useState('2026-11-15');
    const [newCapacity, setNewCapacity] = useState(40);

    // Modal Chia nhóm (Owner only)
    const [showSplitModal, setShowSplitModal] = useState(false);
    const [splitRoom, setSplitRoom] = useState('PM2');
    const [splitTeacher, setSplitTeacher] = useState('Cô Mai Anh');

    // Modal Thêm học viên vào lớp
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [studentToAddName, setStudentToAddName] = useState('');

    // Tự động tính toán mã lớp và ngày kết thúc gợi ý khi thêm lớp
    const composedClassCode = useMemo(() => {
        // Định dạng: UDCNTTCB_K0226_Ca1PM1
        const shiftClean = newShift.replace(/\s+/g, '');
        const batchFormatted = `K${newBatchNo.padStart(2, '0')}${String(newYear).slice(-2)}`;
        return `${newCoursePrefix}_${batchFormatted}_${shiftClean}${newRoom}`;
    }, [newCoursePrefix, newBatchNo, newYear, newShift, newRoom]);

    const suggestedEndDate = useMemo(() => {
        if (!newStartDate) return '';
        const d = new Date(newStartDate);
        const selectedCourse =
            COURSES_DATA.find((c) => c.prefix === newCoursePrefix) || COURSES_DATA[0];
        const daysToAdd = Math.round(selectedCourse.durationMonths * 30);
        d.setDate(d.getDate() + daysToAdd);
        return d.toISOString().split('T')[0];
    }, [newStartDate, newCoursePrefix]);

    const [newEndDate, setNewEndDate] = useState('');
    React.useEffect(() => {
        setNewEndDate(suggestedEndDate);
    }, [suggestedEndDate]);

    // Lọc danh sách lớp
    const filteredClasses = useMemo(() => {
        return classes.filter((c) => {
            if (statusFilter !== 'all' && c.status !== statusFilter) return false;
            if (courseFilter !== 'all' && c.coursePrefix !== courseFilter) return false;
            return true;
        });
    }, [classes, statusFilter, courseFilter]);

    // Nhóm các lớp cùng một khóa (Batch code)
    const groupedBatches = useMemo(() => {
        const groups: Record<
            string,
            { batchCode: string; totalStudents: number; classes: ClassItem[] }
        > = {};
        filteredClasses.forEach((cls) => {
            if (!groups[cls.batchCode]) {
                groups[cls.batchCode] = {
                    batchCode: cls.batchCode,
                    totalStudents: 0,
                    classes: [],
                };
            }
            groups[cls.batchCode].classes.push(cls);
            groups[cls.batchCode].totalStudents += cls.enrolledCount;
        });
        return Object.values(groups);
    }, [filteredClasses]);

    // Lớp đang được chọn xem chi tiết
    const currentClass = useMemo(() => {
        return classes.find((c) => c.id === selectedClassId) || null;
    }, [classes, selectedClassId]);

    // Xử lý Thêm lớp mới
    const handleCreateClass = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCourse =
            COURSES_DATA.find((c) => c.prefix === newCoursePrefix) || COURSES_DATA[0];
        const batchCode = `${newCoursePrefix}_K${newBatchNo.padStart(2, '0')}${String(newYear).slice(-2)}`;

        const newClassItem: ClassItem = {
            id: `cls-${Date.now()}`,
            code: composedClassCode,
            batchCode: batchCode,
            courseName: selectedCourse.name,
            coursePrefix: newCoursePrefix,
            batchNo: newBatchNo,
            year: newYear,
            shiftName: newShift,
            shiftDetail: SHIFTS.find((s) => s.id === newShift)?.time || '18:30-20:30',
            room: newRoom,
            teacher: newTeacher,
            startDate: newStartDate,
            endDate: newEndDate,
            price: selectedCourse.price,
            capacity: newCapacity,
            enrolledCount: 0,
            status: 'dang_mo',
            students: [],
        };

        setClasses((prev) => [newClassItem, ...prev]);
        setShowAddClassModal(false);
        setSelectedClassId(newClassItem.id);
    };

    // Xử lý Chia nhóm (Owner only)
    const handleSplitClass = () => {
        if (!currentClass) return;
        const halfCount = Math.floor(currentClass.students.length / 2);
        const movedStudents = currentClass.students.slice(halfCount);
        const keptStudents = currentClass.students.slice(0, halfCount);

        // Tạo lớp thứ 2 ở phòng mới
        const secondClassCode = `${currentClass.batchCode}_${currentClass.shiftName.replace(/\s+/g, '')}${splitRoom}`;
        const secondClass: ClassItem = {
            ...currentClass,
            id: `cls-${Date.now()}`,
            code: secondClassCode,
            room: splitRoom,
            teacher: splitTeacher,
            enrolledCount: movedStudents.length,
            students: movedStudents,
        };

        setClasses((prev) => [
            ...prev.map((c) =>
                c.id === currentClass.id
                    ? { ...c, students: keptStudents, enrolledCount: keptStudents.length }
                    : c,
            ),
            secondClass,
        ]);

        setShowSplitModal(false);
        alert(
            `Đã chia lớp thành công! Tạo lớp mới ${secondClassCode} với ${movedStudents.length} học viên.`,
        );
    };

    // Xử lý Xuất danh sách lớp sang Excel
    const handleExportExcel = () => {
        if (!currentClass) return;
        alert(
            `Đang xuất danh sách lớp ${currentClass.code} (${currentClass.students.length} học viên) sang file Excel để in danh sách điểm danh giấy...`,
        );
    };

    // Map nhãn trạng thái lớp
    const classStatusBadge = (status: ClassItem['status']) => {
        if (status === 'dang_mo') return <Badge variant='warning'>Đang mở đăng ký</Badge>;
        if (status === 'dang_hoc') return <Badge variant='success'>Đang học</Badge>;
        return <Badge variant='neutral'>Kết thúc</Badge>;
    };

    return (
        <div className='p-4 md:p-8 max-w-[1200px] w-full mx-auto space-y-6 font-sans'>
            {/* =========================================================================
          VIEW 1: DANH SÁCH LỚP HỌC (LIST)
      ========================================================================= */}
            {!selectedClassId && (
                <div className='space-y-5'>
                    {/* Header */}
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#DFE4EC]'>
                        <div>
                            <h1 className='text-[22px] leading-[30px] font-semibold text-[#131B2E]'>
                                Lớp học
                            </h1>
                            <p className='text-xs text-[#5A6478] mt-0.5'>
                                Quản lý các khóa học, phân ca, phòng máy và danh sách học viên từng
                                lớp
                            </p>
                        </div>

                        <Button
                            onClick={() => setShowAddClassModal(true)}
                            className='h-10 px-4 gap-1.5 self-start sm:self-auto bg-[#1E40AF] hover:bg-[#1E3A8A]'
                        >
                            <Plus className='w-4 h-4' />
                            <span>Thêm lớp</span>
                        </Button>
                    </div>

                    {/* Filter Chips & Course Selector */}
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                        {/* Filter chips theo status */}
                        <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar'>
                            {[
                                { key: 'all', label: 'Tất cả' },
                                { key: 'dang_mo', label: 'Đang mở đăng ký' },
                                { key: 'dang_hoc', label: 'Đang học' },
                                { key: 'ket_thuc', label: 'Kết thúc' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setStatusFilter(tab.key as typeof statusFilter)}
                                    className={`h-8 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer select-none border ${
                                        statusFilter === tab.key
                                            ? 'bg-[#1E40AF] text-white border-[#1E40AF]'
                                            : 'bg-white text-[#131B2E] border-[#DFE4EC] hover:bg-[#ECEFF5]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Dropdown lọc theo khóa học */}
                        <div className='w-full sm:w-64'>
                            <select
                                value={courseFilter}
                                onChange={(e) => setCourseFilter(e.target.value)}
                                className='w-full h-8 rounded-[6px] border border-[#DFE4EC] bg-white px-3 text-xs text-[#131B2E] outline-none'
                            >
                                <option value='all'>Tất cả chương trình đào tạo</option>
                                {COURSES_DATA.map((c) => (
                                    <option key={c.prefix} value={c.prefix}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Danh sách lớp gom nhóm theo Khóa (Batch) */}
                    <div className='space-y-5'>
                        {groupedBatches.length === 0 ? (
                            <div className='bg-white border border-[#DFE4EC] rounded-[10px] p-12 text-center shadow-none'>
                                <p className='text-sm text-[#5A6478]'>
                                    Không tìm thấy lớp học nào phù hợp với bộ lọc.
                                </p>
                            </div>
                        ) : (
                            groupedBatches.map((batch) => (
                                <div
                                    key={batch.batchCode}
                                    className='bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none'
                                >
                                    {/* Khóa Heading kèm Tổng số học viên */}
                                    <div className='px-4 py-3 bg-[#F4F6FA] border-b border-[#DFE4EC] flex items-center justify-between'>
                                        <div className='flex items-center gap-2'>
                                            <span className='font-mono font-semibold text-xs sm:text-sm text-[#131B2E]'>
                                                {batch.batchCode}
                                            </span>
                                            <span className='text-xs text-[#5A6478]'>
                                                &bull; {batch.classes[0]?.courseName}
                                            </span>
                                        </div>
                                        <span className='text-xs font-medium text-[#1E40AF] bg-[#E7EDFB] px-2.5 py-0.5 rounded-full tabular-nums'>
                                            {batch.totalStudents} học viên
                                        </span>
                                    </div>

                                    {/* Các dòng lớp trong khóa */}
                                    <div className='divide-y divide-[#DFE4EC]'>
                                        {batch.classes.map((cls) => (
                                            <div
                                                key={cls.id}
                                                onClick={() => setSelectedClassId(cls.id)}
                                                className='p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#E7EDFB]/40 transition-colors cursor-pointer group'
                                            >
                                                {/* Cột 1: Mã lớp đầy đủ + Phòng */}
                                                <div className='space-y-0.5'>
                                                    <div className='flex items-center gap-2'>
                                                        <span className='font-mono font-semibold text-xs sm:text-sm text-[#131B2E] group-hover:text-[#1E40AF]'>
                                                            {cls.code}
                                                        </span>
                                                        <span className='text-[11px] font-mono text-[#5A6478] bg-[#ECEFF5] px-1.5 py-0.2 rounded'>
                                                            Phòng {cls.room}
                                                        </span>
                                                    </div>
                                                    <div className='text-xs text-[#5A6478]'>
                                                        {cls.shiftName}: {cls.shiftDetail}
                                                    </div>
                                                </div>

                                                {/* Cột 2: Giáo viên & Sĩ số & Trạng thái */}
                                                <div className='flex items-center justify-between sm:justify-end gap-3 text-xs'>
                                                    <span className='text-[#131B2E] font-medium'>
                                                        {cls.teacher}
                                                    </span>

                                                    <span className='font-mono tabular-nums text-[#5A6478] bg-[#F4F6FA] px-2 py-0.5 rounded border border-[#DFE4EC]'>
                                                        {cls.enrolledCount}/{cls.capacity}
                                                    </span>

                                                    {classStatusBadge(cls.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* =========================================================================
          VIEW 2: CHI TIẾT LỚP HỌC (DETAIL)
      ========================================================================= */}
            {selectedClassId && currentClass && (
                <div className='space-y-6'>
                    {/* Nút quay lại */}
                    <button
                        onClick={() => setSelectedClassId(null)}
                        className='inline-flex items-center gap-1.5 text-xs text-[#5A6478] hover:text-[#1E40AF] transition-colors cursor-pointer select-none'
                    >
                        <ArrowLeft className='w-3.5 h-3.5' />
                        <span>Quay lại danh sách lớp học</span>
                    </button>

                    {/* Header Chi tiết lớp học */}
                    <div className='bg-white border border-[#DFE4EC] rounded-[10px] p-5 sm:p-6 shadow-none space-y-4'>
                        <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#DFE4EC]'>
                            <div className='space-y-1'>
                                <div className='flex items-center gap-2 flex-wrap'>
                                    <h1 className='text-xl sm:text-[22px] font-mono font-semibold text-[#131B2E]'>
                                        {currentClass.code}
                                    </h1>
                                    {classStatusBadge(currentClass.status)}
                                </div>
                                <div className='text-sm font-medium text-[#1E40AF]'>
                                    {currentClass.courseName} &bull; Khóa:{' '}
                                    <span className='font-mono'>{currentClass.batchCode}</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className='flex items-center gap-2 flex-wrap'>
                                {/* Nút Xuất danh sách lớp sang Excel */}
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={handleExportExcel}
                                    className='gap-1.5 h-9'
                                >
                                    <FileSpreadsheet className='w-4 h-4 text-[#2F7D4F]' />
                                    <span>Xuất danh sách lớp (Excel)</span>
                                </Button>

                                {/* Owner only: Nút Chia nhóm */}
                                {isOwner && (
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => setShowSplitModal(true)}
                                        className='gap-1.5 h-9 text-[#1E40AF] border-[#1E40AF]/40 hover:bg-[#E7EDFB]'
                                    >
                                        <Split className='w-4 h-4' />
                                        <span>Chia nhóm</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Thông số lớp học */}
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs'>
                            <div>
                                <span className='text-[#5A6478]'>Giáo viên:</span>
                                <div className='font-semibold text-sm text-[#131B2E] mt-0.5'>
                                    {currentClass.teacher}
                                </div>
                            </div>

                            <div>
                                <span className='text-[#5A6478]'>Ca học & Phòng:</span>
                                <div className='font-semibold text-sm text-[#131B2E] mt-0.5'>
                                    {currentClass.shiftName} &bull; Phòng {currentClass.room}
                                </div>
                            </div>

                            <div>
                                <span className='text-[#5A6478]'>Thời gian:</span>
                                <div className='text-[#131B2E] font-medium mt-0.5'>
                                    {formatDate(currentClass.startDate)} &rarr;{' '}
                                    {formatDate(currentClass.endDate)}
                                </div>
                            </div>

                            <div>
                                <span className='text-[#5A6478]'>Sĩ số / Học phí:</span>
                                <div className='font-semibold text-sm text-[#131B2E] mt-0.5 tabular-nums'>
                                    {currentClass.enrolledCount}/{currentClass.capacity} &bull;{' '}
                                    {formatCurrency(currentClass.price)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CẢNH BÁO XUNG ĐỘT TRÙNG LỊCH (CONFLICT EXAMPLES) */}
                    <div className='space-y-2'>
                        {currentClass.hasTeacherConflict && (
                            <div className='p-3.5 bg-[#FBE8E5] border border-[#B3382C]/30 rounded-[8px] flex items-start gap-2.5 text-xs text-[#B3382C]'>
                                <AlertTriangle className='w-4 h-4 shrink-0 mt-0.5' />
                                <div>
                                    <strong>Trùng lịch giáo viên:</strong> {currentClass.teacher} đã
                                    dạy lớp <code>UDCNTTCB_K0126_Ca1PM2</code> cùng ca này. Chọn
                                    giáo viên hoặc ca học khác.
                                </div>
                            </div>
                        )}

                        {currentClass.hasRoomConflict && (
                            <div className='p-3.5 bg-[#FBF0DC] border border-[#A86A0B]/30 rounded-[8px] flex items-start gap-2.5 text-xs text-[#A86A0B]'>
                                <AlertTriangle className='w-4 h-4 shrink-0 mt-0.5' />
                                <div>
                                    <strong>Trùng lịch phòng máy:</strong> Phòng {currentClass.room}{' '}
                                    đã có lớp <code>UDCNTTCB_K0126_Ca1PM1</code> vào ca này. Chọn
                                    phòng khác.
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section: Lịch học hàng tuần (Read-only) */}
                    <div className='bg-white border border-[#DFE4EC] rounded-[10px] p-4 shadow-none'>
                        <h3 className='text-xs font-semibold uppercase tracking-wider text-[#5A6478] mb-2 flex items-center gap-1.5'>
                            <Calendar className='w-4 h-4 text-[#1E40AF]' />
                            <span>Lịch học hàng tuần</span>
                        </h3>
                        <div className='p-3 bg-[#F4F6FA] rounded-[6px] text-xs text-[#131B2E] flex items-center justify-between'>
                            <span>{currentClass.shiftDetail}</span>
                            <span className='font-semibold text-[#1E40AF]'>
                                Phòng {currentClass.room}
                            </span>
                        </div>
                    </div>

                    {/* Section: Học viên trong lớp */}
                    <div className='bg-white border border-[#DFE4EC] rounded-[10px] overflow-hidden shadow-none space-y-0'>
                        <div className='p-4 border-b border-[#DFE4EC] bg-[#F4F6FA] flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <Users className='w-4 h-4 text-[#1E40AF]' />
                                <h3 className='text-sm font-semibold text-[#131B2E]'>
                                    Học viên trong lớp ({currentClass.students.length} học viên)
                                </h3>
                            </div>

                            <Button
                                size='sm'
                                onClick={() => setShowAddStudentModal(true)}
                                className='h-8 text-xs gap-1'
                            >
                                <UserPlus className='w-3.5 h-3.5' />
                                <span>Thêm học viên vào lớp</span>
                            </Button>
                        </div>

                        {/* Bảng danh sách học viên trong lớp */}
                        <div className='overflow-x-auto'>
                            <table className='w-full text-left text-sm border-collapse'>
                                <thead>
                                    <tr className='border-b border-[#DFE4EC] bg-white text-[#5A6478] text-xs font-semibold'>
                                        <th className='py-2.5 px-4 w-24'>Mã HV</th>
                                        <th className='py-2.5 px-4'>Họ và tên</th>
                                        <th className='py-2.5 px-4'>Số điện thoại</th>
                                        <th className='py-2.5 px-4'>Trạng thái</th>
                                        <th className='py-2.5 px-4 text-right'>Còn nợ</th>
                                        <th className='py-2.5 px-4 text-center'>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-[#DFE4EC]'>
                                    {currentClass.students.map((st) => (
                                        <tr
                                            key={st.id}
                                            className='hover:bg-[#F4F6FA] transition-colors'
                                        >
                                            <td className='py-3 px-4 font-mono text-xs text-[#5A6478] tabular-nums'>
                                                {st.code}
                                            </td>
                                            <td className='py-3 px-4 font-medium text-xs sm:text-sm text-[#131B2E]'>
                                                {st.fullName}
                                            </td>
                                            <td className='py-3 px-4 text-xs text-[#5A6478] tabular-nums'>
                                                {st.phone}
                                            </td>
                                            <td className='py-3 px-4'>
                                                <Badge variant='success' className='text-[11px]'>
                                                    Đang học
                                                </Badge>
                                            </td>
                                            <td className='py-3 px-4 text-right tabular-nums text-xs'>
                                                {st.totalDue > 0 ? (
                                                    <span className='font-semibold text-[#B3382C]'>
                                                        {formatCurrency(st.totalDue)}
                                                    </span>
                                                ) : (
                                                    <span className='text-[#2F7D4F]'>Đã đủ</span>
                                                )}
                                            </td>
                                            <td className='py-3 px-4 text-center'>
                                                <div className='flex items-center justify-center gap-1.5'>
                                                    <button
                                                        onClick={() =>
                                                            alert(
                                                                `Chuyển lớp cho học viên: ${st.fullName} (sang phòng PM2)`,
                                                            )
                                                        }
                                                        title='Chuyển lớp'
                                                        className='p-1 rounded text-[#5A6478] hover:text-[#1E40AF] hover:bg-[#E7EDFB]'
                                                    >
                                                        <ArrowRightLeft className='w-3.5 h-3.5' />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            alert(
                                                                `Bảo lưu cho học viên: ${st.fullName}`,
                                                            )
                                                        }
                                                        title='Bảo lưu'
                                                        className='text-xs text-[#5A6478] hover:text-[#1E40AF] px-1'
                                                    >
                                                        Bảo lưu
                                                    </button>
                                                </div>
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
          MODAL: THÊM LỚP HỌC MỚI
      ========================================================================= */}
            {showAddClassModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='bg-white border border-[#DFE4EC] rounded-[10px] p-5 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto'>
                        <div className='flex items-center justify-between pb-3 border-b border-[#DFE4EC]'>
                            <h3 className='text-base font-semibold text-[#131B2E]'>
                                Thêm lớp học mới
                            </h3>
                            <button
                                onClick={() => setShowAddClassModal(false)}
                                className='p-1 text-[#5A6478]'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClass} className='space-y-3.5 text-xs'>
                            {/* Khóa học */}
                            <div>
                                <label className='block font-medium text-[#131B2E] mb-1'>
                                    Khóa học
                                </label>
                                <select
                                    value={newCoursePrefix}
                                    onChange={(e) => setNewCoursePrefix(e.target.value)}
                                    className='w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-2.5 text-xs text-[#131B2E] outline-none'
                                >
                                    {COURSES_DATA.map((c) => (
                                        <option key={c.prefix} value={c.prefix}>
                                            {c.name} ({c.durationMonths} tháng)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Khóa số & Năm */}
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Khóa số (Gợi ý số tiếp theo)
                                    </label>
                                    <Input
                                        value={newBatchNo}
                                        onChange={(e) => setNewBatchNo(e.target.value)}
                                        placeholder='01, 02...'
                                        className='h-9'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Năm
                                    </label>
                                    <Input
                                        type='number'
                                        value={newYear}
                                        onChange={(e) => setNewYear(Number(e.target.value))}
                                        className='h-9'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Ca học & Phòng */}
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Ca học
                                    </label>
                                    <select
                                        value={newShift}
                                        onChange={(e) => setNewShift(e.target.value)}
                                        className='w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-2.5 text-xs text-[#131B2E] outline-none'
                                    >
                                        {SHIFTS.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Phòng máy
                                    </label>
                                    <Input
                                        value={newRoom}
                                        onChange={(e) => setNewRoom(e.target.value)}
                                        placeholder='PM1, PM2...'
                                        className='h-9'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Giáo viên & Sĩ số */}
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Giáo viên phụ trách
                                    </label>
                                    <select
                                        value={newTeacher}
                                        onChange={(e) => setNewTeacher(e.target.value)}
                                        className='w-full h-9 rounded-[6px] border border-[#DFE4EC] bg-white px-2.5 text-xs text-[#131B2E] outline-none'
                                    >
                                        <option value='Thầy Tuấn'>Thầy Tuấn</option>
                                        <option value='Cô Mai Anh'>Cô Mai Anh</option>
                                        <option value='Cô Hương'>Cô Hương</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Sĩ số tối đa
                                    </label>
                                    <Input
                                        type='number'
                                        value={newCapacity}
                                        onChange={(e) => setNewCapacity(Number(e.target.value))}
                                        className='h-9'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Ngày khai giảng & Ngày kết thúc */}
                            <div className='grid grid-cols-2 gap-3'>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Ngày khai giảng
                                    </label>
                                    <Input
                                        type='date'
                                        value={newStartDate}
                                        onChange={(e) => setNewStartDate(e.target.value)}
                                        className='h-9'
                                        required
                                    />
                                </div>
                                <div>
                                    <label className='block font-medium text-[#131B2E] mb-1'>
                                        Ngày kết thúc (Gợi ý tự động)
                                    </label>
                                    <Input
                                        type='date'
                                        value={newEndDate}
                                        onChange={(e) => setNewEndDate(e.target.value)}
                                        className='h-9'
                                    />
                                </div>
                            </div>

                            {/* MÃ LỚP TỰ ĐỘNG (READ-ONLY) */}
                            <div className='p-3 bg-[#E7EDFB] rounded-[6px] border border-[#3B82F6]/30'>
                                <span className='text-[11px] text-[#5A6478] block'>
                                    Mã lớp tự động tạo (Read-only):
                                </span>
                                <span className='font-mono font-bold text-sm text-[#1E40AF] mt-0.5 block'>
                                    {composedClassCode}
                                </span>
                            </div>

                            <div className='pt-2 flex gap-2'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => setShowAddClassModal(false)}
                                    className='flex-1'
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type='submit'
                                    className='flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A]'
                                >
                                    Tạo lớp học
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========================================================================
          MODAL: CHIA NHÓM (SPLIT CLASS - OWNER ONLY)
      ========================================================================= */}
            {showSplitModal && currentClass && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='bg-white border border-[#DFE4EC] rounded-[10px] p-5 max-w-md w-full space-y-4 shadow-xl'>
                        <div className='flex items-center justify-between pb-3 border-b border-[#DFE4EC]'>
                            <h3 className='text-base font-semibold text-[#131B2E]'>
                                Chia nhóm lớp {currentClass.code}
                            </h3>
                            <button
                                onClick={() => setShowSplitModal(false)}
                                className='p-1 text-[#5A6478]'
                            >
                                <X className='w-5 h-5' />
                            </button>
                        </div>

                        <p className='text-xs text-[#5A6478] leading-relaxed'>
                            Tính năng dành cho Quản lý (Chủ). Hệ thống sẽ tạo thêm một lớp thứ hai
                            cùng khóa, cùng ca học tại phòng máy khác và chuyển một nửa học viên
                            sang sau khi xem trước.
                        </p>

                        <div className='p-3 bg-[#F4F6FA] rounded-[6px] text-xs space-y-1.5 border border-[#DFE4EC]'>
                            <div>
                                Tổng học viên hiện tại:{' '}
                                <strong>{currentClass.students.length} học viên</strong>
                            </div>
                            <div>
                                Số lượng chuyển sang lớp mới:{' '}
                                <strong>
                                    {Math.floor(currentClass.students.length / 2)} học viên
                                </strong>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3 text-xs'>
                            <div>
                                <label className='block font-medium text-[#131B2E] mb-1'>
                                    Phòng máy mới:
                                </label>
                                <Input
                                    value={splitRoom}
                                    onChange={(e) => setSplitRoom(e.target.value)}
                                    placeholder='PM2...'
                                    className='h-8'
                                />
                            </div>
                            <div>
                                <label className='block font-medium text-[#131B2E] mb-1'>
                                    Giáo viên phụ trách:
                                </label>
                                <select
                                    value={splitTeacher}
                                    onChange={(e) => setSplitTeacher(e.target.value)}
                                    className='w-full h-8 rounded-[6px] border border-[#DFE4EC] bg-white px-2 text-xs text-[#131B2E]'
                                >
                                    <option value='Cô Mai Anh'>Cô Mai Anh</option>
                                    <option value='Thầy Tuấn'>Thầy Tuấn</option>
                                    <option value='Cô Hương'>Cô Hương</option>
                                </select>
                            </div>
                        </div>

                        <div className='pt-2 flex gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setShowSplitModal(false)}
                                className='flex-1'
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                size='sm'
                                onClick={handleSplitClass}
                                className='flex-1 bg-[#1E40AF] hover:bg-[#1E3A8A]'
                            >
                                Xác nhận chia nhóm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================================================
          MODAL: THÊM HỌC VIÊN VÀO LỚP
      ========================================================================= */}
            {showAddStudentModal && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'>
                    <div className='bg-white border border-[#DFE4EC] rounded-[10px] p-5 max-w-sm w-full space-y-4 shadow-xl'>
                        <h3 className='text-sm font-semibold text-[#131B2E]'>
                            Thêm học viên vào lớp
                        </h3>
                        <div>
                            <label className='block text-xs font-medium text-[#131B2E] mb-1'>
                                Tên hoặc mã học viên (Chờ xếp lớp):
                            </label>
                            <Input
                                placeholder='Ví dụ: Lê Hoàng Anh hoặc HV26-0001...'
                                value={studentToAddName}
                                onChange={(e) => setStudentToAddName(e.target.value)}
                                className='text-xs'
                            />
                        </div>
                        <div className='flex gap-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => setShowAddStudentModal(false)}
                                className='flex-1'
                            >
                                Đóng
                            </Button>
                            <Button
                                size='sm'
                                disabled={!studentToAddName.trim()}
                                onClick={() => {
                                    alert(`Đã thêm học viên ${studentToAddName} vào lớp!`);
                                    setShowAddStudentModal(false);
                                    setStudentToAddName('');
                                }}
                                className='flex-1 bg-[#1E40AF]'
                            >
                                Thêm vào lớp
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
