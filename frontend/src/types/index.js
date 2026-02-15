export var BookingStatus;
(function (BookingStatus) {
    BookingStatus[BookingStatus["Pending"] = 1] = "Pending";
    BookingStatus[BookingStatus["Approved"] = 2] = "Approved";
    BookingStatus[BookingStatus["Rejected"] = 3] = "Rejected";
    BookingStatus[BookingStatus["Completed"] = 4] = "Completed";
    BookingStatus[BookingStatus["Cancelled"] = 5] = "Cancelled";
})(BookingStatus || (BookingStatus = {}));
