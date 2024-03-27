export function userInText(text: string, name: string): string {
    if (text) {
        return text.replace(/\$\$c\$\$/g, name);
    } else {
        return text;
    }
}
