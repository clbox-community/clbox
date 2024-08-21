export function asLocalDate(raw: number, locale: Intl.UnicodeBCP47LocaleIdentifier) {
    try {
        const date = new Date(raw);
        return date.toLocaleDateString(locale);
    } catch {
    }
    return '';

}
