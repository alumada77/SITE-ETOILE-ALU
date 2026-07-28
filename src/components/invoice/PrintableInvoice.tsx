import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, X, Building2, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { Invoice, AppSettings } from '../../types';
import { formatCurrency, formatDate, downloadInvoicePDF } from '../../utils/formatters';

interface PrintableInvoiceProps {
  invoice: Invoice;
  settings: AppSettings;
  onClose?: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice, settings, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    downloadInvoicePDF(invoice, settings);
  };

  const qrData = JSON.stringify({
    invoice: invoice.invoiceNumber,
    company: settings.companyName,
    client: invoice.customerName,
    total: invoice.total,
    date: invoice.date,
  });

  const InvoiceContent = () => {
    return (
      <div className="text-[9px] leading-tight">
      <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200">
            <div className="flex items-start gap-4">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt={settings.companyName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-2xl">
                  EA
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{settings.companyName}</h1>
                <p className="text-xs font-medium text-amber-600 dark:text-amber-500">{settings.tagline}</p>
                <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {settings.phone}</p>
                  <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {settings.email}</p>
                  <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-slate-400" /> {settings.address}, {settings.city}</p>
                  {settings.nif && <p className="font-mono text-[10px] text-slate-400">NIF: {settings.nif} | STAT: {settings.stat}</p>}
                </div>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <div className="inline-block bg-slate-100 text-slate-800 px-4 py-2 rounded-xl text-right">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">FACTURE</span>
                <span className="text-xl font-black font-mono text-slate-900">{invoice.invoiceNumber}</span>
              </div>
              <div className="mt-3 text-xs text-slate-500 space-y-1">
                <p><span className="font-semibold text-slate-700">Date d'émission:</span> {formatDate(invoice.date)}</p>
                <p><span className="font-semibold text-slate-700">Échéance:</span> {formatDate(invoice.dueDate)}</p>
                <p className="pt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    invoice.paymentStatus === 'Payé'
                      ? 'bg-emerald-100 text-emerald-800'
                      : invoice.paymentStatus === 'Partiel'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {invoice.paymentStatus.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="my-8 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">FACTURÉ À</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-base font-bold text-slate-900">{invoice.customerName}</p>
                <p className="text-xs text-slate-600 mt-1"><Phone className="w-3 h-3 inline mr-1 text-slate-400" />{invoice.customerPhone}</p>
                {invoice.customerEmail && <p className="text-xs text-slate-600"><Mail className="w-3 h-3 inline mr-1 text-slate-400" />{invoice.customerEmail}</p>}
              </div>
              <div>
                {invoice.customerAddress && (
                  <p className="text-xs text-slate-600"><MapPin className="w-3 h-3 inline mr-1 text-slate-400" />{invoice.customerAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-900 text-slate-900 uppercase font-black tracking-wider">
                  <th className="py-3 px-2">Désignation</th>
                  <th className="py-3 px-2 text-center">Unité</th>
                  <th className="py-3 px-2 text-center">Qté</th>
                  <th className="py-3 px-2 text-right">Prix Unitaire</th>
                  <th className="py-3 px-2 text-right">Total Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.products.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-2 font-medium text-slate-900">{item.productName}</td>
                    <td className="py-3.5 px-2 text-center text-slate-500 font-mono">{item.unit}</td>
                    <td className="py-3.5 px-2 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-3.5 px-2 text-right font-mono text-slate-600">{formatCurrency(item.unitPrice, settings.currency)}</td>
                    <td className="py-3.5 px-2 text-right font-bold font-mono text-slate-900">{formatCurrency(item.totalPrice, settings.currency)}</td>
                  </tr>
                ))}
                {invoice.laborFee > 0 && (
                  <tr>
                    <td className="py-3.5 px-2 font-medium text-slate-900">Main d'œuvre, Pose & Assemblage</td>
                    <td className="py-3.5 px-2 text-center text-slate-500 font-mono">Forfait</td>
                    <td className="py-3.5 px-2 text-center font-bold text-slate-800">1</td>
                    <td className="py-3.5 px-2 text-right font-mono text-slate-600">{formatCurrency(invoice.laborFee, settings.currency)}</td>
                    <td className="py-3.5 px-2 text-right font-bold font-mono text-slate-900">{formatCurrency(invoice.laborFee, settings.currency)}</td>
                  </tr>
                )}
                {invoice.transportFee > 0 && (
                  <tr>
                    <td className="py-3.5 px-2 font-medium text-slate-900">Transport & Livraison Chantier</td>
                    <td className="py-3.5 px-2 text-center text-slate-500 font-mono">Trajet</td>
                    <td className="py-3.5 px-2 text-center font-bold text-slate-800">1</td>
                    <td className="py-3.5 px-2 text-right font-mono text-slate-600">{formatCurrency(invoice.transportFee, settings.currency)}</td>
                    <td className="py-3.5 px-2 text-right font-bold font-mono text-slate-900">{formatCurrency(invoice.transportFee, settings.currency)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 pt-6 border-t border-slate-200">
            {/* Left: QR Code & Barcode */}
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <QRCodeSVG value={qrData} size={80} level="M" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CODE FACTURE</p>
                <div className="font-mono text-xs font-bold text-slate-800 tracking-widest mt-1">
                  ||| | ||||| || ||| |||| |
                </div>
                <p className="font-mono text-[10px] text-slate-500 mt-1">{invoice.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400 mt-2">Scannez pour vérifier l'authenticité</p>
              </div>
            </div>

            {/* Right: Calculations */}
            <div className="w-full sm:w-80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 py-1">
                <span>Sous-total HT:</span>
                <span className="font-mono font-semibold">{formatCurrency(invoice.subtotal + (invoice.laborFee || 0) + (invoice.transportFee || 0), settings.currency)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-rose-600 py-1">
                  <span>Remise accordée:</span>
                  <span className="font-mono font-semibold">-{formatCurrency(invoice.discount, settings.currency)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-slate-600 py-1">
                  <span>TVA ({invoice.taxRate}%):</span>
                  <span className="font-mono font-semibold">{formatCurrency(invoice.taxAmount, settings.currency)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-black text-slate-900 bg-slate-900 text-white p-3 rounded-xl mt-2">
                <span>TOTAL TTC:</span>
                <span className="font-mono text-base text-amber-400">{formatCurrency(invoice.total, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold py-1 pt-2">
                <span>Acompte perçu:</span>
                <span className="font-mono">{formatCurrency(invoice.advance, settings.currency)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-black text-xs py-1 border-t border-slate-200 pt-2">
                <span>RESTE À PAYER:</span>
                <span className="font-mono">{formatCurrency(invoice.remaining, settings.currency)}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-14 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700">Signature Client</p>
              <p className="text-[10px] text-slate-400 mt-1">Mention "Bon pour accord"</p>
              <div className="h-16 border-b border-dashed border-slate-300 mt-4"></div>
            </div>
            <div>
              <p className="font-bold text-slate-700">La Direction - {settings.companyName}</p>
              <p className="text-[10px] text-slate-400 mt-1">Cachet officiel et signature</p>
              <div className="h-16 border-b border-dashed border-slate-300 mt-4 flex items-center justify-center">
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-widest">[ CACHET ATELIER ]</span>
              </div>
            </div>
          </div>
      </>
    </div>
    )
    }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-[1400px] bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-900 text-xs font-black px-2.5 py-1 rounded-md tracking-wider uppercase">
              FACTURE OFFICIELLE
            </span>
            <span className="text-sm font-semibold text-slate-300">
              N° {invoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              Imprimer
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              Télécharger PDF
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Invoice Printable Content */}
        <div
          className="p-6 overflow-y-auto print:p-0 print:overflow-visible"
          ref={printRef}
          id="printable-invoice"
        >

          <div className="flex flex-row w-full">

            {/* GAUCHE - ORIGINAL */}
            <div className="w-1/2 border-r border-dashed border-slate-300 pr-6">

              <div className="text-right text-xs font-black text-slate-400 mb-3">
                ORIGINAL
              </div>

              <InvoiceContent />

            </div>


            {/* DROITE - COPIE */}
            <div className="w-1/2 pl-6">

              <div className="text-right text-xs font-black text-slate-400 mb-3">
                COPIE
              </div>

              <InvoiceContent />

            </div>


          </div>

        </div>

      </div>
    </div>
  );
};
