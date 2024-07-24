export default function truncateString(s) {
    if (s.length <= 11) {
        return s;
    }
    return s.slice(0, 7) + ' . . . ' + s.slice(-4);
}