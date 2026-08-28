
import React, { useRef } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";

import {
  Printer,
  Download,
  X,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from "lucide-react";

import { Quote, AppSettings } from "../../types";

import {
  formatCurrency,
  formatDate,
} from "../../utils/formatters";

import { numberToFrenchWords } from "../../utils/numberToFrenchWords";

import logo1 from "../../img/logo1.png";

interface PrintableQuoteProps {
  quote: Quote;
  settings: AppSettings;
  onClose?: () => void;
}

export const PrintableQuote: React.FC<PrintableQuoteProps> = ({
  quote,
  settings,
  onClose,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // PRINT
  // ============================================================

  const handlePrint = async () => {
    const element = document.getElementById("printable-quote");

    if (!element) {
      console.error("PrintableQuote introuvable");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 5;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        pageWidth - margin * 2,
        pageHeight - margin * 2
      );

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const printWindow = window.open(pdfUrl, "_blank");

      if (!printWindow) {
        URL.revokeObjectURL(pdfUrl);
        return;
      }

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();

        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 2000);
      };
    } catch (error) {
      console.error("Erreur impression devis :", error);
    }
  };

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================

  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-quote");

    if (!element) {
      console.error("PrintableQuote introuvable");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 5;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        pageWidth - margin * 2,
        pageHeight - margin * 2
      );

      pdf.save(`Devis-${quote.quoteNumber}.pdf`);
    } catch (error) {
      console.error("Erreur téléchargement devis :", error);
    }
  };

  // ============================================================
  // QR DATA
  // ============================================================

  const qrData = JSON.stringify({
    type: "DEVIS",
    quote: quote.quoteNumber,
    company: settings.companyName,
    client: quote.customerName,
    total: quote.total,
    date: quote.createdAt,
    validUntil: quote.validUntil,
  });

  // ============================================================
  // MONTANT EN LETTRES
  // ============================================================

  const amountInWords = numberToFrenchWords(
    Math.round(quote.total)
  );

  // ============================================================
  // QUOTE CONTENT
  // ============================================================

  const QuoteContent = () => {
    return (
      <div className="text-[7px] leading-tight scale-[0.92] origin-top">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-2 border-b border-slate-200">

          {/* COMPANY */}

          <div className="flex items-start gap-4">

            {settings.logo || logo1 ? (
              <img
                src={settings.logo || logo1}
                alt={settings.companyName}
                className="
                  w-10
                  h-10
                  rounded-xl
                  object-cover
                  border
                  border-slate-200
                  shadow-sm
                "
              />
            ) : (
              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-slate-900
                  text-amber-400
                  flex
                  items-center
                  justify-center
                  font-black
                  text-2xl
                "
              >
                EA
              </div>
            )}

            <div>

              <h1 className="text-sm font-black text-slate-900 tracking-tight">
                {settings.companyName}
              </h1>

              {settings.tagline && (
                <p className="text-xs font-medium text-amber-600">
                  {settings.tagline}
                </p>
              )}

              <div className="mt-2 text-xs text-slate-500 space-y-0.5">

                {settings.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {settings.phone}
                  </p>
                )}

                {settings.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {settings.email}
                  </p>
                )}

                {settings.address && (
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {settings.address}
                    {settings.city
                      ? `, ${settings.city}`
                      : ""}
                  </p>
                )}

                {(settings.nif || settings.stat) && (
                  <p className="font-mono text-[10px] text-slate-400">
                    {settings.nif &&
                      `NIF: ${settings.nif}`}

                    {settings.nif &&
                      settings.stat &&
                      " | "}

                    {settings.stat &&
                      `STAT: ${settings.stat}`}
                  </p>
                )}

              </div>

            </div>

          </div>

          {/* QUOTE NUMBER */}

          <div className="text-right">

            <div className="
              inline-block
              bg-slate-100
              text-slate-800
              px-4
              py-2
              rounded-xl
              text-right
            ">

              <span className="
                text-[10px]
                uppercase
                font-extrabold
                tracking-wider
                text-slate-400
                block
              ">
                DEVIS / PROFORMA
              </span>

              <span className="
                text-xl
                font-black
                font-mono
                text-slate-900
              ">
                {quote.quoteNumber}
              </span>

            </div>

            <div className="
              mt-3
              text-xs
              text-slate-500
              space-y-1
            ">

              <p>
                <span className="font-semibold text-slate-700">
                  Date d'émission :
                </span>{" "}
                {formatDate(quote.createdAt)}
              </p>

              <p>
                <span className="font-semibold text-slate-700">
                  Valable jusqu'au :
                </span>{" "}
                {formatDate(quote.validUntil)}
              </p>

              <p className="pt-1">

                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1
                    px-2.5
                    py-0.5
                    rounded-full
                    text-xs
                    font-bold
                    ${
                      quote.status === "Accepté"
                        ? "bg-emerald-100 text-emerald-800"
                        : quote.status === "Refusé"
                        ? "bg-rose-100 text-rose-800"
                        : quote.status === "Expiré"
                        ? "bg-slate-200 text-slate-700"
                        : "bg-amber-100 text-amber-800"
                    }
                  `}
                >

                  <CheckCircle2 className="w-3 h-3" />

                  {quote.status.toUpperCase()}

                </span>

              </p>

            </div>

          </div>

        </div>

        {/* ======================================================
            CLIENT
        ====================================================== */}

        <div className="
          my-2
          bg-slate-50
          p-2
          rounded-lg
          border
          border-slate-200/80
        ">

          <h2 className="
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-slate-400
            mb-2
          ">
            PROPOSITION DESTINÉE À
          </h2>

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-4
          ">

            <div>

              <p className="
                text-base
                font-bold
                text-slate-900
              ">
                {quote.customerName}
              </p>

              {quote.customerPhone && (
                <p className="
                  text-xs
                  text-slate-600
                  mt-1
                ">
                  <Phone className="
                    w-3
                    h-3
                    inline
                    mr-1
                    text-slate-400
                  " />
                  {quote.customerPhone}
                </p>
              )}

              {quote.customerEmail && (
                <p className="text-xs text-slate-600">
                  <Mail className="
                    w-3
                    h-3
                    inline
                    mr-1
                    text-slate-400
                  " />
                  {quote.customerEmail}
                </p>
              )}

            </div>

            <div>

              {quote.customerAddress && (
                <p className="text-xs text-slate-600">
                  <MapPin className="
                    w-3
                    h-3
                    inline
                    mr-1
                    text-slate-400
                  " />
                  {quote.customerAddress}
                </p>
              )}

            </div>

          </div>

        </div>

        {/* ======================================================
            PRODUCTS TABLE
        ====================================================== */}

        <div className="overflow-x-auto my-6">

          <table className="w-full text-left text-xs">

            <thead>

              <tr className="
                border-b-2
                border-slate-900
                text-slate-900
                uppercase
                font-black
                tracking-wider
              ">

                <th className="py-1 px-1">
                  Désignation
                </th>

                <th className="py-1 px-1 text-center">
                  Unité
                </th>

                <th className="py-1 px-1 text-center">
                  Qté
                </th>

                <th className="py-1 px-1 text-right">
                  Prix Unitaire
                </th>

                <th className="py-1 px-1 text-right">
                  Total
                </th>

              </tr>

            </thead>

            <tbody className="
              divide-y
              divide-slate-100
            ">

              {quote.products.map((item, idx) => (

                <tr key={idx}>

                  <td className="
                    py-1
                    px-1
                    align-top
                  ">

                    <p className="
                      font-bold
                      text-slate-900
                    ">
                      {item.productName}
                    </p>

                    {item.description && (
                      <p className="
                        mt-1
                        text-[10px]
                        text-slate-500
                        italic
                      ">
                        {item.description}
                      </p>
                    )}

                    {item.color && (
                      <p className="
                        text-[10px]
                        text-slate-500
                      ">
                        <span className="font-semibold">
                          Couleur :
                        </span>{" "}
                        {item.color}
                      </p>
                    )}

                    {item.dimension && (
                      <p className="
                        text-[10px]
                        text-slate-500
                      ">
                        <span className="font-semibold">
                          Dimension :
                        </span>{" "}
                        {item.dimension}
                      </p>
                    )}

                    {item.selectedOptions &&
                      item.selectedOptions.length > 0 && (

                        <div className="
                          mt-1
                          space-y-1
                        ">

                          {item.selectedOptions.map(
                            (option) => (

                              <p
                                key={option.id}
                                className="
                                  text-[10px]
                                  text-amber-600
                                  font-medium
                                "
                              >

                                ✓ {option.name}

                                {option.price > 0 && (
                                  <>
                                    {" "}
                                    (+
                                    {formatCurrency(
                                      option.price,
                                      settings.currency
                                    )}
                                    )
                                  </>
                                )}

                              </p>

                            )
                          )}

                        </div>

                      )}

                  </td>

                  <td className="
                    py-1
                    px-1
                    text-center
                    text-slate-500
                    font-mono
                  ">
                    {item.unit}
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-center
                    font-bold
                    text-slate-800
                  ">
                    {item.quantity}
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-right
                    font-mono
                    text-slate-600
                  ">
                    {formatCurrency(
                      item.unitPrice,
                      settings.currency
                    )}
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-right
                    font-bold
                    font-mono
                    text-slate-900
                  ">
                    {formatCurrency(
                      item.totalPrice,
                      settings.currency
                    )}
                  </td>

                </tr>

              ))}

              {/* MAIN D'OEUVRE */}

              {quote.laborFee > 0 && (

                <tr>

                  <td className="
                    py-1
                    px-1
                    font-medium
                    text-slate-900
                  ">
                    Main d'œuvre, Pose & Assemblage
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-center
                    text-slate-500
                    font-mono
                  ">
                    Forfait
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-center
                    font-bold
                    text-slate-800
                  ">
                    1
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-right
                    font-mono
                    text-slate-600
                  ">
                    {formatCurrency(
                      quote.laborFee,
                      settings.currency
                    )}
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-right
                    font-bold
                    font-mono
                    text-slate-900
                  ">
                    {formatCurrency(
                      quote.laborFee,
                      settings.currency
                    )}
                  </td>

                </tr>

              )}

              {/* TRANSPORT */}

              {quote.transportFee > 0 && (

                <tr>

                  <td className="
                    py-1
                    px-1
                    font-medium
                    text-slate-900
                  ">
                    Transport & Livraison Chantier
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-center
                    text-slate-500
                    font-mono
                  ">
                    Trajet
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-center
                    font-bold
                    text-slate-800
                  ">
                    1
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-right
                    font-mono
                    text-slate-600
                  ">
                    {formatCurrency(
                      quote.transportFee,
                      settings.currency
                    )}
                  </td>

                  <td className="
                    py-1
                    px-1
                    text-right
                    font-bold
                    font-mono
                    text-slate-900
                  ">
                    {formatCurrency(
                      quote.transportFee,
                      settings.currency
                    )}
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* ======================================================
            TOTALS
        ====================================================== */}

        <div className="
          flex
          flex-col
          sm:flex-row
          justify-between
          items-start
          gap-2
          pt-2
          border-t
          border-slate-200
        ">

          {/* QR + BARCODE */}

          <div className="
            flex
            items-center
            gap-6
            p-4
            bg-slate-50
            rounded-2xl
            border
            border-slate-200/80
          ">

            <QRCodeSVG
              value={qrData}
              size={80}
              level="M"
            />

            <div>

              <p className="
                text-[10px]
                font-bold
                text-slate-400
                uppercase
                tracking-wider
              ">
                CODE DEVIS
              </p>

              <div className="mt-2">

                <Barcode
                  value={quote.quoteNumber}
                  width={1.5}
                  height={35}
                  fontSize={10}
                  displayValue={false}
                  background="#ffffff"
                  lineColor="#0f172a"
                />

              </div>

              <p className="
                font-mono
                text-[10px]
                text-slate-500
                mt-1
              ">
                {quote.quoteNumber}
              </p>

              <p className="
                text-[10px]
                text-slate-400
                mt-2
              ">
                Scannez pour identifier le devis
              </p>

            </div>

          </div>

          {/* CALCULATIONS */}

          <div className="
            w-full
            sm:w-80
            space-y-2
            text-xs
          ">

            <div className="
              flex
              justify-between
              text-slate-600
              py-1
            ">

              <span>
                Sous-total HT :
              </span>

              <span className="
                font-mono
                font-semibold
              ">
                {formatCurrency(
                  quote.subtotal +
                    (quote.laborFee || 0) +
                    (quote.transportFee || 0),
                  settings.currency
                )}
              </span>

            </div>

            {quote.discount > 0 && (

              <div className="
                flex
                justify-between
                text-rose-600
                py-1
              ">

                <span>
                  Remise accordée :
                </span>

                <span className="
                  font-mono
                  font-semibold
                ">
                  -
                  {formatCurrency(
                    quote.discount,
                    settings.currency
                  )}
                </span>

              </div>

            )}

            {quote.taxAmount > 0 && (

              <div className="
                flex
                justify-between
                text-slate-600
                py-1
              ">

                <span>
                  TVA ({quote.taxRate}%) :
                </span>

                <span className="
                  font-mono
                  font-semibold
                ">
                  {formatCurrency(
                    quote.taxAmount,
                    settings.currency
                  )}
                </span>

              </div>

            )}

            {/* TOTAL */}

            <div className="
              flex
              justify-between
              items-center
              text-sm
              font-black
              text-white
              bg-slate-900
              p-3
              rounded-xl
              mt-2
            ">

              <span>
                TOTAL TTC :
              </span>

              <span className="
                font-mono
                text-base
                text-amber-400
              ">
                {formatCurrency(
                  quote.total,
                  settings.currency
                )}
              </span>

            </div>

          </div>

        </div>

        {/* ======================================================
            AMOUNT IN WORDS
        ====================================================== */}

        <div className="
          mt-4
          w-full
          border-2
          border-slate-300
          rounded-xl
          bg-slate-50
          px-5
          py-4
        ">

          <p className="
            text-[10px]
            uppercase
            tracking-[2px]
            font-bold
            text-slate-500
            mb-2
          ">
            ARRÊTÉE À LA SOMME DE :
          </p>

          <p className="
            text-sm
            leading-7
            text-justify
            font-bold
            uppercase
            text-slate-900
          ">

            {amountInWords} ARIARY

            <span className="
              font-normal
              normal-case
            ">
              {" "}
              (
              {formatCurrency(
                quote.total,
                settings.currency
              )}
              )
            </span>

          </p>

        </div>

        {/* ======================================================
            NOTES
        ====================================================== */}

        {quote.notes && (

          <div className="
            mt-4
            rounded-xl
            border
            border-slate-200
            bg-white
            px-5
            py-3
          ">

            <p className="
              text-[10px]
              uppercase
              font-black
              tracking-wider
              text-slate-400
              mb-1
            ">
              Observations
            </p>

            <p className="
              text-[10px]
              leading-relaxed
              text-slate-600
            ">
              {quote.notes}
            </p>

          </div>

        )}

        {/* ======================================================
            SIGNATURES
        ====================================================== */}

        <div className="
          mt-4
          pt-2
          border-t
          border-slate-200
          grid
          grid-cols-2
          gap-2
          text-center
          text-xs
        ">

          {/* CLIENT */}

          <div>

            <p className="
              font-bold
              text-slate-700
            ">
              Signature Client
            </p>

            <p className="
              text-[10px]
              text-slate-400
              mt-1
            ">
              Mention « Bon pour accord »
            </p>

            <div className="
              h-16
              border-b
              border-dashed
              border-slate-300
              mt-4
            />

          </div>

          {/* DIRECTION */}

          <div>

            <p className="
              font-bold
              text-slate-700
            ">
              La Direction - {settings.companyName}
            </p>

            <p className="
              text-[10px]
              text-slate-400
              mt-1
            ">
              Cachet officiel et signature
            </p>

            <div className="
              h-16
              border-b
              border-dashed
              border-slate-300
              mt-4
              flex
              items-center
              justify-center
            ">

              <span className="
                text-[10px]
                font-mono
                text-slate-300
                uppercase
                tracking-widest
              ">
                [ CACHET ATELIER ]
              </span>

            </div>

          </div>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="
          mt-6
          rounded-xl
          border
          border-slate-300
          bg-slate-50
          px-5
          py-4
          text-center
        ">

          <p className="
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-slate-500
          ">
            DEVIS ESTIMATIF / PROFORMA
          </p>

          <p className="
            mt-2
            text-[10px]
            text-slate-500
            leading-relaxed
          ">
            Ce devis est valable jusqu'au{" "}
            <span className="
              font-bold
              text-slate-700
            ">
              {formatDate(quote.validUntil)}
            </span>
            . Les prix indiqués sont ceux convenus
            dans la présente proposition.
          </p>

          <p className="
            mt-2
            text-[10px]
            text-slate-500
          ">
            Merci pour votre confiance. Votre projet
            aluminium est étudié et fabriqué avec soin
            par notre atelier.
          </p>

        </div>

      </div>
    );
  };

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="
      fixed
      inset-0
      z-50
      overflow-y-auto
      bg-slate-900/70
      backdrop-blur-md
      p-4
      sm:p-6
      flex
      items-center
      justify-center
    ">

      <div className="
        w-full
        max-w-[1400px]
        bg-white
        text-slate-900
        rounded-2xl
        shadow-2xl
        overflow-hidden
        my-auto
        flex
        flex-col
        max-h-[92vh]
      ">

        {/* ======================================================
            TOP CONTROL BAR
        ====================================================== */}

        <div className="
          flex
          items-center
          justify-between
          px-6
          py-4
          bg-slate-900
          text-white
          border-b
          border-slate-800
          flex-shrink-0
        ">

          <div className="
            flex
            items-center
            gap-2
          ">

            <span className="
              bg-amber-500
              text-slate-900
              text-xs
              font-black
              px-2.5
              py-1
              rounded-md
              tracking-wider
              uppercase
            ">
              DEVIS / PROFORMA
            </span>

            <span className="
              text-sm
              font-semibold
              text-slate-300
            ">
              N° {quote.quoteNumber}
            </span>

          </div>

          <div className="
            flex
            items-center
            gap-3
          ">

            {/* PRINT */}

            <button
              onClick={handlePrint}
              className="
                flex
                items-center
                gap-2
                px-3.5
                py-2
                rounded-xl
                bg-slate-800
                hover:bg-slate-700
                text-white
                text-xs
                font-semibold
                transition-colors
              "
            >

              <Printer className="
                w-4
                h-4
                text-amber-400
              " />

              Imprimer

            </button>

            {/* DOWNLOAD */}

            <button
              onClick={handleDownloadPDF}
              className="
                flex
                items-center
                gap-2
                px-3.5
                py-2
                rounded-xl
                bg-amber-500
                hover:bg-amber-400
                text-slate-950
                text-xs
                font-bold
                transition-colors
                shadow-lg
                shadow-amber-500/20
              "
            >

              <Download className="w-4 h-4" />

              Télécharger PDF

            </button>

            {/* CLOSE */}

            {onClose && (

              <button
                onClick={onClose}
                className="
                  p-2
                  text-slate-400
                  hover:text-white
                  hover:bg-slate-800
                  rounded-xl
                  transition-colors
                  ml-2
                "
              >

                <X className="w-5 h-5" />

              </button>

            )}

          </div>

        </div>

        {/* ======================================================
            PRINTABLE CONTENT
        ====================================================== */}

        <div
          ref={printRef}
          id="printable-quote"
          className="
            p-2
            overflow-y-auto
            print:p-0
            print:overflow-visible
            bg-white
          "
        >

          <div className="
            flex
            flex-row
            w-full
            gap-2
            print:w-[297mm]
            print:h-[210mm]
          ">

            {/* ==================================================
                ORIGINAL
            ================================================== */}

            <div className="
              w-1/2
              border-r
              border-dashed
              border-slate-300
              pr-2
              overflow-hidden
            ">

              <div className="
                text-right
                text-[8px]
                font-black
                text-slate-400
                mb-1
              ">
                ORIGINAL
              </div>

              <QuoteContent />

            </div>

            {/* ==================================================
                COPIE
            ================================================== */}

            <div className="
              w-1/2
              pl-2
              overflow-hidden
            ">

              <div className="
                text-right
                text-[8px]
                font-black
                text-slate-400
                mb-1
              ">
                COPIE
              </div>

              <QuoteContent />

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default PrintableQuote;

