function isPIN (string) {
    return /^\d+$/.test(string) && string.length === 4
}

export { isPIN }