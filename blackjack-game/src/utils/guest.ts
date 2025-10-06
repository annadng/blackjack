export function getGuestId(): string {
    // Check if we're in the browser
    if (typeof window === "undefined") {
        return ""; // Return empty string on server
    }

    let guestId = sessionStorage.getItem("guestId");
    if (!guestId) {
        guestId = `guest-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        sessionStorage.setItem("guestId", guestId);
    }
    return guestId;
}