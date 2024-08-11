function equalDate(date1, date2) {
  const eeYear = date1.getFullYear();
  const eeMonth = date1.getMonth();
  const eeDay = date1.getDate();

  const schoolYear = date2.getFullYear();
  const schoolMonth = date2.getMonth();
  const schoolDay = date2.getDate();

  console.log(date1);
  console.log(date2);
  // Compare year, month, and day
  if (eeYear === schoolYear && eeMonth === schoolMonth && eeDay === schoolDay) {
    return true;
  } else {
    return false;
  }
}

module.exports = equalDate;
