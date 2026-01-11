export function formatDayKey(d: Date) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export function formatDayTitle(d: Date) {
    return d.toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatTime(d: Date) {
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}
