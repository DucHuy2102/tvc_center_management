/**
 * Định dạng tiền tệ theo quy tắc: 1.500.000 ₫
 * Phân cách hàng nghìn bằng dấu chấm, kèm ký hiệu ₫
 */
export function formatCurrency(amount: number | string | null | undefined): string {
    if (amount === null || amount === undefined || amount === '') {
        return '0 ₫';
    }
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) {
        return '0 ₫';
    }
    // Định dạng việt nam 1.500.000 kèm ₫
    return `${Math.round(num).toLocaleString('vi-VN')} ₫`;
}

/**
 * Định dạng ngày theo quy tắc: dd/MM/yyyy
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '—';
    try {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(d.getTime())) return '—';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    } catch {
        return '—';
    }
}

/**
 * Định dạng ngày và giờ 24h: dd/MM/yyyy HH:mm
 */
export function formatDateTime(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return '—';
    try {
        const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(d.getTime())) return '—';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
        return '—';
    }
}

/**
 * Định dạng giờ 24h: HH:mm
 */
export function formatTime(timeInput: string | Date | null | undefined): string {
    if (!timeInput) return '—';
    if (typeof timeInput === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(timeInput)) {
        return timeInput.substring(0, 5);
    }
    try {
        const d = typeof timeInput === 'string' ? new Date(timeInput) : timeInput;
        if (isNaN(d.getTime())) return '—';
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } catch {
        return '—';
    }
}
