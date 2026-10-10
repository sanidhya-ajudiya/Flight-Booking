const PDFDocument = require('pdfkit');

const buildPDF = (booking, doc) => {
  // Background Header
  doc.rect(0, 0, 595.28, 100).fill('#0f172a');

  // Header Title
  doc.fillColor('#38bdf8').fontSize(24).font('Helvetica-Bold').text('SKYWINGS AIRLINES', 40, 30);
  doc.fillColor('#94a3b8').fontSize(12).font('Helvetica').text('BOARDING PASS & E-TICKET RECEIPT', 40, 60);

  // PNR Badge
  doc.rect(430, 25, 125, 50).fill('#1e293b').stroke('#38bdf8');
  doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('BOOKING REF (PNR)', 440, 33);
  doc.fillColor('#38bdf8').fontSize(18).font('Helvetica-Bold').text(booking.pnr, 440, 50);

  // Flight Main Info Card
  doc.rect(40, 120, 515, 140).fill('#f8fafc').stroke('#cbd5e1');

  const flight = booking.flight || {};
  const depAirport = flight.departureAirport || {};
  const arrAirport = flight.arrivalAirport || {};
  const airline = flight.airline || {};

  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text(`${airline.name || 'SkyWings'} - Flight ${flight.flightNumber || 'SK-101'}`, 55, 135);
  doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Aircraft: ${flight.aircraftType || 'Boeing 787 Dreamliner'} | Cabin: ${(booking.cabinClass || 'Economy').toUpperCase()}`, 55, 155);

  // Departure & Arrival Details
  doc.fillColor('#0284c7').fontSize(20).font('Helvetica-Bold').text(depAirport.code || 'BOM', 55, 185);
  doc.fillColor('#334155').fontSize(11).font('Helvetica-Bold').text(depAirport.city || 'Mumbai', 55, 210);
  doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Dep: ${flight.departureTime || '08:00'}`, 55, 225);

  doc.fillColor('#64748b').fontSize(12).font('Helvetica').text(`---> ${flight.duration || '2h 15m'} (${flight.stops === 0 ? 'Direct' : flight.stops + ' Stop'}) --->`, 220, 195);

  doc.fillColor('#0284c7').fontSize(20).font('Helvetica-Bold').text(arrAirport.code || 'DEL', 430, 185);
  doc.fillColor('#334155').fontSize(11).font('Helvetica-Bold').text(arrAirport.city || 'Delhi', 430, 210);
  doc.fillColor('#64748b').fontSize(10).font('Helvetica').text(`Arr: ${flight.arrivalTime || '10:15'}`, 430, 225);

  // Passengers Table
  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('PASSENGER DETAILS', 40, 285);

  let y = 310;
  doc.rect(40, y, 515, 25).fill('#0f172a');
  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
  doc.text('Passenger Name', 50, y + 7);
  doc.text('Gender', 230, y + 7);
  doc.text('Seat', 330, y + 7);
  doc.text('Passport', 430, y + 7);

  y += 25;
  (booking.passengers || []).forEach((p, idx) => {
    const bgColor = idx % 2 === 0 ? '#f1f5f9' : '#ffffff';
    doc.rect(40, y, 515, 25).fill(bgColor).stroke('#e2e8f0');
    doc.fillColor('#1e293b').fontSize(10).font('Helvetica');
    doc.text(p.name, 50, y + 7);
    doc.text(p.gender, 230, y + 7);
    doc.text(p.seatNumber, 330, y + 7);
    doc.text(p.passportNumber || 'N/A', 430, y + 7);
    y += 25;
  });

  // Payment Breakdown
  y += 20;
  doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text('PAYMENT SUMMARY', 40, y);
  y += 20;
  doc.rect(40, y, 515, 80).fill('#f8fafc').stroke('#cbd5e1');
  doc.fillColor('#475569').fontSize(10).font('Helvetica');
  doc.text(`Base Fare: ₹${booking.baseFare || 0}`, 55, y + 15);
  doc.text(`Taxes & Airport Fees: ₹${booking.taxAmount || 0}`, 55, y + 35);
  doc.text(`Extra Baggage: ₹${booking.extraBaggageFee || 0}`, 55, y + 55);

  doc.text(`Discount: -₹${booking.discountAmount || 0}`, 330, y + 15);
  doc.text(`Payment Status: ${(booking.paymentStatus || 'Paid').toUpperCase()}`, 330, y + 35);
  doc.fillColor('#0284c7').fontSize(13).font('Helvetica-Bold');
  doc.text(`Total Amount Paid: ₹${booking.totalAmount || 0}`, 330, y + 55);

  // Footer Note
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica').text('Please present this ticket along with a valid government-issued photo ID / passport at check-in counter.', 40, 750, { align: 'center' });
};

const generateTicketPDF = (booking, res) => {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=E-Ticket-${booking.pnr}.pdf`);
  doc.pipe(res);
  buildPDF(booking, doc);
  doc.end();
};

const generateTicketPDFBuffer = (booking) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);
    buildPDF(booking, doc);
    doc.end();
  });
};

module.exports = generateTicketPDF;
module.exports.generateTicketPDF = generateTicketPDF;
module.exports.generateTicketPDFBuffer = generateTicketPDFBuffer;
