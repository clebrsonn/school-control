export function formatDateLocalized(dateString: string | Date, locale = 'pt'): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString(locale, options);
}
