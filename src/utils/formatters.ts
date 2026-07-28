import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Invoice, AppSettings, CashflowEntry, Order, Customer } from '../types';

export function formatCurrency(amount: number | undefined | null, currency: string = 'Ar'): string {
  const val = amount || 0;
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(val);
  return `${formatted} ${currency}`;
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function generateOrderNumber(count: number = 1): string {
  const year = new Date().getFullYear();
  const num = String(count).padStart(4, '0');
  return `CMD-${year}-${num}`;
}

export function generateQuoteNumber(count: number = 1): string {
  const year = new Date().getFullYear();
  const num = String(count).padStart(4, '0');
  return `DEV-${year}-${num}`;
}

export function generateInvoiceNumber(count: number = 1): string {
  const year = new Date().getFullYear();
  const num = String(count).padStart(4, '0');
  return `FAC-${year}-${num}`;
}

export function exportToExcel(data: Record<string, any>[], filename: string = 'export.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
  XLSX.writeFile(workbook, filename);
}

const drawInvoice = (
  doc: jsPDF,
  invoice: Invoice,
  settings: AppSettings,
  offsetX: number,
  label: string
) => {

  // Header background
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 35, 'F');

  // Title & Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(settings.companyName.toUpperCase(), 14, 18);

  doc.setFontSize(10);
  doc.text(`${settings.tagline || 'Fabrication Aluminium, Fer, Inox & Vitrerie'}`, 14, 26);

  doc.setFontSize(16);
  doc.text(`FACTURE N° ${invoice.invoiceNumber}`, 130, 20);

  // Reset text color
  doc.setTextColor(30, 41, 59);

  // Company details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tél: ${settings.phone}`, 14, 43);
  doc.text(`Email: ${settings.email}`, 14, 48);
  doc.text(`Adresse: ${settings.address}`, 14, 53);
  if (settings.nif) doc.text(`NIF: ${settings.nif} | STAT: ${settings.stat}`, 14, 58);

  // Customer box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(120, 38, 76, 25, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT:', 124, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName, 124, 50);
  doc.text(`Tél: ${invoice.customerPhone}`, 124, 55);
  if (invoice.customerAddress) doc.text(`Adresse: ${invoice.customerAddress}`, 124, 60);

  // Dates
  doc.setFontSize(9);
  doc.text(`Date d'émission: ${formatDate(invoice.date)}`, 14, 68);
  doc.text(`Date d'échéance: ${formatDate(invoice.dueDate)}`, 120, 68);

  // Table items
  const tableData = invoice.products.map((item, index) => [
    index + 1,
    item.productName,
    item.unit,
    item.quantity,
    formatCurrency(item.unitPrice, settings.currency),
    formatCurrency(item.totalPrice, settings.currency),
  ]);

  if (invoice.laborFee > 0) {
    tableData.push(['-', 'Main d\'œuvre & Pose', 'Ensemble', 1, formatCurrency(invoice.laborFee, settings.currency), formatCurrency(invoice.laborFee, settings.currency)]);
  }
  if (invoice.transportFee > 0) {
    tableData.push(['-', 'Transport & Livraisons', 'Voyage', 1, formatCurrency(invoice.transportFee, settings.currency), formatCurrency(invoice.transportFee, settings.currency)]);
  }

  autoTable(doc, {
    startY: 73,
    head: [['#', 'Désignation', 'Unité', 'Qté', 'Prix Unitaire', 'Total']],
    body: tableData,
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 8, cellPadding: 3 },
  });

  // Totals Breakdown
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  doc.setFontSize(9);
  const startX = 120;
  let currentY = finalY + 10;

  doc.text(`Sous-total:`, startX, currentY);
  doc.text(formatCurrency(invoice.subtotal + (invoice.laborFee || 0) + (invoice.transportFee || 0), settings.currency), 195, currentY, { align: 'right' });

  if (invoice.discount > 0) {
    currentY += 6;
    doc.text(`Remise accordée:`, startX, currentY);
    doc.text(`-${formatCurrency(invoice.discount, settings.currency)}`, 195, currentY, { align: 'right' });
  }

  if (invoice.taxAmount > 0) {
    currentY += 6;
    doc.text(`TVA (${invoice.taxRate}%):`, startX, currentY);
    doc.text(formatCurrency(invoice.taxAmount, settings.currency), 195, currentY, { align: 'right' });
  }

  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setFillColor(30, 41, 59);
  doc.rect(startX - 2, currentY - 5, 80, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(`TOTAL NET:`, startX, currentY);
  doc.text(formatCurrency(invoice.total, settings.currency), 195, currentY, { align: 'right' });

  currentY += 10;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Acompte versé:`, startX, currentY);
  doc.text(formatCurrency(invoice.advance, settings.currency), 195, currentY, { align: 'right' });

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Reste à payer:`, startX, currentY);
  doc.text(formatCurrency(invoice.remaining, settings.currency), 195, currentY, { align: 'right' });

  // Payment Status Stamp
  doc.setFillColor(invoice.paymentStatus === 'Payé' ? 34 : 234, invoice.paymentStatus === 'Payé' ? 197 : 179, invoice.paymentStatus === 'Payé' ? 94 : 8);
  doc.roundedRect(14, finalY + 10, 45, 12, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`STATUT: ${invoice.paymentStatus.toUpperCase()}`, 18, finalY + 18);

  // Signatures Area
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Signature / Cachet Client', 25, 250);
  doc.text('La Direction - Etoile Alu', 135, 250);

  doc.line(20, 270, 75, 270);
  doc.line(130, 270, 185, 270);

  // Footer Note
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Merci pour votre confiance. Les ouvrages en aluminium et vitrerie restent garantis 1 an contre tout vice de fabrication.', 105, 285, { align: 'center' });
};

export function downloadInvoicePDF(
  invoice: Invoice,
  settings: AppSettings
) {

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });


  // Ligne séparation afovoany
  doc.setDrawColor(150);
  doc.line(
    148.5,
    10,
    148.5,
    200
  );


  // GAUCHE
  drawInvoice(
    doc,
    invoice,
    settings,
    0,
    "ORIGINAL"
  );


  // DROITE
  drawInvoice(
    doc,
    invoice,
    settings,
    148.5,
    "COPIE"
  );


  doc.save(
    `Facture_${invoice.invoiceNumber}.pdf`
  );
}
