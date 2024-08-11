function calculateDateRange(date, start, end) {
    let startDate, endDate;
    if (date) {
        startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(date);
        endDate.setHours(23, 59, 59, 0);

    } else {
        startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(end);
        endDate.setHours(23, 59, 59, 0);

    }
    return { start: startDate, end: endDate };
}

module.exports = calculateDateRange;