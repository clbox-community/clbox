export function asLocalDate(raw: number) {
    try {
        const date = new Date(raw);
        return `${date.getDate()}/${date.getMonth() < 8 && '0'}${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
    }
    return '';

}
