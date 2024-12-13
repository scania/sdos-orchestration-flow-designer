export const replaceSpecialChars = (str: string) => str.replace(/[/.]/g, "_");

export const randomizeValue = (value: number) => {
    return value * (0.85 + Math.random() * 0.3)
}
