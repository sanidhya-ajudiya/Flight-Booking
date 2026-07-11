const generateCSV = (headers, data, mappingFn) => {
  const headerRow = headers.join(',');
  const dataRows = data.map(item => {
    const values = mappingFn(item);
    return values.map(val => {
      if (val === undefined || val === null) return '';
      // Escape commas and double quotes
      const strVal = String(val).replace(/"/g, '""');
      return strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')
        ? `"${strVal}"`
        : strVal;
    }).join(',');
  });
  return [headerRow, ...dataRows].join('\n');
};

exports.generateBookingReport = (bookings) => {
  const headers = ['Booking ID', 'Booking Ref', 'PNR', 'Passenger Name', 'Contact Email', 'Flight Number', 'Price', 'Status', 'Booking Date'];
  return generateCSV(headers, bookings, (b) => [
    b._id,
    b.bookingRef,
    b.pnr,
    b.passengers && b.passengers.length > 0 ? `${b.passengers[0].firstName} ${b.passengers[0].lastName}` : 'N/A',
    b.contactEmail,
    b.flight ? (typeof b.flight === 'object' ? b.flight.flightNumber : b.flight) : 'N/A',
    b.totalPrice ? b.totalPrice.total : 0,
    b.status,
    b.createdAt ? new Date(b.createdAt).toISOString() : ''
  ]);
};

exports.generateRevenueReport = (payments) => {
  const headers = ['Transaction ID', 'Booking ID', 'Amount', 'Currency', 'Payment Method', 'Payment Status', 'Paid At'];
  return generateCSV(headers, payments, (p) => [
    p.transactionId,
    p.booking ? (typeof p.booking === 'object' ? p.booking.bookingRef : p.booking) : 'N/A',
    p.amount,
    p.currency,
    p.method,
    p.status,
    p.paidAt ? new Date(p.paidAt).toISOString() : ''
  ]);
};

exports.generateUserReport = (users) => {
  const headers = ['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'Verified', 'Registered Date'];
  return generateCSV(headers, users, (u) => [
    u._id,
    u.fullName || `${u.firstName} ${u.lastName}`,
    u.email,
    u.phone || 'N/A',
    u.role,
    u.isVerified ? 'Yes' : 'No',
    u.createdAt ? new Date(u.createdAt).toISOString() : ''
  ]);
};

exports.generateFlightReport = (flights) => {
  const headers = ['Flight Number', 'Airline', 'Origin', 'Destination', 'Departure Time', 'Arrival Time', 'Economy Price', 'Status'];
  return generateCSV(headers, flights, (f) => [
    f.flightNumber,
    f.airline ? (typeof f.airline === 'object' ? f.airline.name : f.airline) : 'N/A',
    f.origin ? (typeof f.origin === 'object' ? f.origin.code : f.origin) : 'N/A',
    f.destination ? (typeof f.destination === 'object' ? f.destination.code : f.destination) : 'N/A',
    f.departureTime ? new Date(f.departureTime).toISOString() : '',
    f.arrivalTime ? new Date(f.arrivalTime).toISOString() : '',
    f.prices ? f.prices.economy : 0,
    f.status
  ]);
};
