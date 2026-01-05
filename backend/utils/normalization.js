export const normalizeName = (name) => {
    if (!name) return "";
    return name.toString().toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, ' ');
};

export const normalizeDob = (dob) => {
    if (!dob) return "";
    // If it's a Date object, format to YYYY-MM-DD
    if (dob instanceof Date) {
        return dob.toISOString().split('T')[0];
    }
    return dob.toString().trim();
};

export const normalizeMobile = (mobile) => {
    if (!mobile) return "";
    let clean = mobile.toString().replace(/\D/g, '');
    if (clean.length > 10) {
        if (clean.startsWith('91')) {
            clean = clean.slice(2);
        } else if (clean.startsWith('0')) {
            clean = clean.slice(1);
        }
    }
    return clean.length >= 10 ? clean.slice(-10) : clean;
};

export const normalizeAddress = (address) => {
    if (!address) return "";
    return address.toString().toUpperCase()
        .replace(/[^A-Z0-9\s]/g, ' ')
        .trim()
        .replace(/\s+/g, ' ');
};
