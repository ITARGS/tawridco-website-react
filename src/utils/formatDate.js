export function formatDate(isoDate) {
    const dateObj = new Date(isoDate);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    const formattedDate = dateObj.toLocaleDateString("en-US", options).split(" ");
    const formattedDateDay = formattedDate[1].split(",")[0];
    const formattedDateMonth = formattedDate[0];
    const formattedDateYear = formattedDate[2];

    return `${formattedDateDay} ${formattedDateMonth} ${formattedDateYear}`;
};
export function formatTime(isoDate) {
    const dateObj = new Date(isoDate);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = (hours % 12 === 0 ? 12 : hours % 12).toString().padStart(2, "0");
    return `${formattedHours}:${minutes} ${period}`;
}
