import React, { useState } from 'react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3,
  Download,
  Eye, 
  CheckCircle2, 
  X, 
  Printer, 
  ArrowRight,
  Send
} from 'lucide-react';
import { numberToFrenchWords } from "../../utils/numberToFrenchWords";
import { useData, generateTrackingNumber } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Quote, OrderItem, QuoteStatus } from '../../types';
import { formatCurrency, formatDate, generateQuoteNumber } from '../../utils/formatters';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { PrintableQuote } from "../../components/invoice/PrintableQuote";
import logo1 from "../../img/logo1.png";

export const Quotes: React.FC = () => {
  const { quotes, customers, products, addQuote, updateQuote, updateQuoteStatus, deleteQuote, addOrder, settings } = useData();
  const { isAdmin } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isQuotePreviewOpen, setIsQuotePreviewOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [selectedQuoteForPrint, setSelectedQuoteForPrint] = useState<Quote | null>(null);


  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form states
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quoteItems, setQuoteItems] = useState<OrderItem[]>([]);
  const [laborFee, setLaborFee] = useState<number>(0);
  const [transportFee, setTransportFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [validDays, setValidDays] = useState<number>(30);
  const [notes, setNotes] = useState('');

  // Item builder
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState<number>(1);
  const [selectedOptions, setSelectedOptions] = useState<ProductOption[]>([]);

  // Produit sélectionné
  const selectedProduct = products.find(
    p => p.id === selectedProductId
  );

  const handleOpenAdd = () => {
    setEditingQuoteId(null);

    setSelectedCustomerId(customers[0]?.id || '');
    setQuoteItems([]);
    setLaborFee(0);
    setTransportFee(0);
    setDiscount(0);
    setValidDays(30);
    setNotes('');

    setIsModalOpen(true);
  };

  const handleOpenEdit = (quote: Quote) => {
    setEditingQuoteId(quote.id);

    setSelectedCustomerId(quote.customerId);
    setQuoteItems(quote.products || []);
    setLaborFee(quote.laborFee || 0);
    setTransportFee(quote.transportFee || 0);
    setDiscount(quote.discount || 0);
    setNotes(quote.notes || '');

    // Calcul de la durée de validité restante
    if (quote.validUntil) {
      const today = new Date();
      const validUntil = new Date(quote.validUntil);

      const diff =
        Math.ceil(
          (validUntil.getTime() - today.getTime()) /
          (1000 * 60 * 60 * 24)
        );

      setValidDays(Math.max(1, diff));
    } else {
      setValidDays(30);
    }

    setIsModalOpen(true);
  };

  const handleOpenVoir = (quote: Quote) => {
    setIsQuotePreviewOpen(true);
  };

  const handleAddItem = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;
    const optionsTotal =
      selectedOptions.reduce(
        (sum, option) => sum + option.price,
        0
      );

    const unitPrice =
      prod.price + optionsTotal;

    const newItem: OrderItem = {
      productId: prod.id,
      productName: prod.name,
      unit: prod.unit,
      quantity: Number(itemQty),
      unitPrice,
      totalPrice:
        unitPrice * Number(itemQty),

      selectedOptions
    };

    setQuoteItems(prev => [
      ...prev,
      newItem
    ]);

    setSelectedProductId('');
    setSelectedOptions([]);
    setItemQty(1);

  };
  

  const handleRemoveItem = (idx: number) => {
    setQuoteItems(prev => prev.filter((_, i) => i !== idx));
  };

  const subtotal = quoteItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const taxAmount = ((subtotal + laborFee + transportFee - discount) * (parseFloat(settings.tva) || 0)) / 100;
  const totalAmount = Math.max(0, subtotal + laborFee + transportFee - discount + taxAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quoteItems.length === 0) {
      setToast({ message: 'Ajoutez au moins un produit au devis', type: 'error' });
      return;
    }

    const cust = customers.find(c => c.id === selectedCustomerId);
    if (!cust) return;

    try {
      const validUntil = new Date(
        Date.now() + validDays * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const quoteData = {
        customerId: cust.id,
        customerName: cust.name,
        customerPhone: cust.phone,
        customerAddress: cust.address,
        products: quoteItems,
        subtotal,
        laborFee,
        transportFee,
        discount,
        taxRate: settings.tva
          ? parseFloat(settings.tva) || 0
          : 0,
        taxAmount,
        total: totalAmount,
        validUntil,
        notes
      };

      if (editingQuoteId) {
        await updateQuote(editingQuoteId, quoteData);

        setToast({
          message: 'Devis modifié avec succès',
          type: 'success'
        });
      } else {
        await addQuote({
          ...quoteData,
          status: 'En attente'
        });

        setToast({
          message: 'Devis créé avec succès',
          type: 'success'
        });
      }

      setIsModalOpen(false);
      setEditingQuoteId(null);

    } catch (err: any) {
      setToast({
        message:
          err.message ||
          'Erreur lors de l’enregistrement du devis',
        type: 'error'
      });
    }
  };

  const handleConvertToOrder = async (q: Quote) => {
    try {
      await addOrder({
        customerId: q.customerId,
        customerName: q.customerName,
        customerPhone: q.customerPhone,
        customerAddress: q.customerAddress,
        products: q.products,
        laborFee: q.laborFee,
        transportFee: q.transportFee,
        discount: q.discount,
        taxRate: q.taxRate,
        subtotal: q.subtotal,
        taxAmount: q.taxAmount,
        totalAmount: q.total,
        advancePayment: 0,
        remainingAmount: q.total,
        trackingNumber: generateTrackingNumber(),
        status: 'Nouveau',
        notes: `Converti depuis devis N° ${q.quoteNumber}`
      });

      await updateQuoteStatus(q.id, 'Accepté');
      setToast({ message: 'Devis converti en Commande Officielle !', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Erreur de conversion', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteQuote(deleteTargetId);
      setToast({ message: 'Devis supprimé', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };
  
  const handlePrintQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsQuotePreviewOpen(true);

    setTimeout(() => {
      const element = document.getElementById("printable-quote");

      if (!element) {
        setToast({
          message: "Aucun contenu à imprimer.",
          type: "error",
        });
        return;
      }

      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        setToast({
          message: "Impossible d'ouvrir la fenêtre d'impression.",
          type: "error",
        });
        return;
      }

      // ============================================================
      // CLONE DU PREVIEW
      // ============================================================

      const clone = element.cloneNode(true) as HTMLElement;

      // Supprimer les boutons
      clone.querySelectorAll("button").forEach((button) => {
        button.remove();
      });

      // Supprimer les éléments destinés uniquement à l'interface
      clone.querySelectorAll(".no-print").forEach((el) => {
        el.remove();
      });

      // ============================================================
      // COPIER LES STYLES REELS DU PREVIEW
      // ============================================================

      const originalElements = [
        element,
        ...Array.from(element.querySelectorAll("*")),
      ];

      const clonedElements = [
        clone,
        ...Array.from(clone.querySelectorAll("*")),
      ];

      originalElements.forEach((original, index) => {
        const cloned = clonedElements[index] as HTMLElement;

        if (!cloned || !(original instanceof HTMLElement)) return;

        const computed = window.getComputedStyle(original);

        // Copier les propriétés importantes
        cloned.style.fontFamily = computed.fontFamily;
        cloned.style.fontSize = computed.fontSize;
        cloned.style.fontWeight = computed.fontWeight;
        cloned.style.lineHeight = computed.lineHeight;
        cloned.style.letterSpacing = computed.letterSpacing;
        cloned.style.textAlign = computed.textAlign;

        cloned.style.color = computed.color;
        cloned.style.backgroundColor = computed.backgroundColor;

        cloned.style.borderTop = computed.borderTop;
        cloned.style.borderRight = computed.borderRight;
        cloned.style.borderBottom = computed.borderBottom;
        cloned.style.borderLeft = computed.borderLeft;

        cloned.style.borderRadius = computed.borderRadius;

        cloned.style.paddingTop = computed.paddingTop;
        cloned.style.paddingRight = computed.paddingRight;
        cloned.style.paddingBottom = computed.paddingBottom;
        cloned.style.paddingLeft = computed.paddingLeft;

        cloned.style.marginTop = computed.marginTop;
        cloned.style.marginRight = computed.marginRight;
        cloned.style.marginBottom = computed.marginBottom;
        cloned.style.marginLeft = computed.marginLeft;

        cloned.style.width = computed.width;
        cloned.style.height = computed.height;

        cloned.style.display = computed.display;
        cloned.style.flexDirection = computed.flexDirection;
        cloned.style.justifyContent = computed.justifyContent;
        cloned.style.alignItems = computed.alignItems;
        cloned.style.gap = computed.gap;

        cloned.style.position = computed.position;

        // Ombres
        cloned.style.boxShadow = computed.boxShadow;

        // Opacité
        cloned.style.opacity = computed.opacity;
      });

      // ============================================================
      // CONVERSION DES COULEURS
      // ============================================================
      // getComputedStyle retourne normalement rgb/rgba,
      // ka tsy tokony hisy oklch intsony eto.

      clonedElements.forEach((el) => {
        if (!(el instanceof HTMLElement)) return;

        const computed = window.getComputedStyle(el);

        if (computed.color.includes("oklch")) {
          el.style.color = "#0f172a";
        }

        if (computed.backgroundColor.includes("oklch")) {
          el.style.backgroundColor = "#ffffff";
        }

        if (computed.borderTopColor.includes("oklch")) {
          el.style.borderTopColor = "#e2e8f0";
        }

        if (computed.borderRightColor.includes("oklch")) {
          el.style.borderRightColor = "#e2e8f0";
        }

        if (computed.borderBottomColor.includes("oklch")) {
          el.style.borderBottomColor = "#e2e8f0";
        }

        if (computed.borderLeftColor.includes("oklch")) {
          el.style.borderLeftColor = "#e2e8f0";
        }
      });

      // ============================================================
      // STYLE PAGE IMPRESSION
      // ============================================================

      printWindow.document.open();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">

          <head>

            <meta charset="UTF-8" />

            <title>
              Proforma ${quote.quoteNumber}
            </title>

            <style>

              @page {
                size: A4 landscape;
                margin: 5mm;
              }

              * {
                box-sizing: border-box;
              }

              html,
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                min-height: 100%;
                background: #ffffff;
                font-family: Arial, Helvetica, sans-serif;

                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              body {
                display: flex;
                justify-content: center;
                align-items: flex-start;
              }

              #printable-quote {
                width: 287mm !important;
                min-height: 200mm !important;

                background: #ffffff;

                color: #0f172a;

                overflow: hidden;

                margin: 0 auto;
              }

              img {
                max-width: 100%;
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
              }

              table {
                width: 100%;
                border-collapse: collapse;
              }

              button,
              .no-print {
                display: none !important;
              }

              @media print {

                html,
                body {
                  width: 287mm;
                  min-height: 200mm;
                  margin: 0;
                  padding: 0;
                }

                #printable-quote {
                  width: 287mm !important;
                  min-height: 200mm !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }

              }

            </style>

          </head>

          <body>

            ${clone.outerHTML}

          </body>

        </html>
      `);

      printWindow.document.close();

      // ============================================================
      // ATTENDRE LE CHARGEMENT DES IMAGES
      // ============================================================

      const images = printWindow.document.images;

      let loadedImages = 0;

      const printWhenReady = () => {
        printWindow.focus();
        printWindow.print();

        setTimeout(() => {
          printWindow.close();
        }, 800);
      };

      if (images.length === 0) {
        setTimeout(printWhenReady, 500);
      } else {
        Array.from(images).forEach((img) => {

          if (img.complete) {
            loadedImages++;

            if (loadedImages === images.length) {
              setTimeout(printWhenReady, 300);
            }

          } else {

            img.onload = () => {
              loadedImages++;

              if (loadedImages === images.length) {
                setTimeout(printWhenReady, 300);
              }
            };

            img.onerror = () => {
              loadedImages++;

              if (loadedImages === images.length) {
                setTimeout(printWhenReady, 300);
              }
            };

          }

        });
      }

    }, 400);
  };


  const handleDownloadQuote = async (quote: Quote) => {
    setSelectedQuote(quote);
    setIsQuotePreviewOpen(true);

    setTimeout(async () => {
      const element = document.getElementById("printable-quote");

      if (!element) {
        console.error("PrintableQuote introuvable");
        return;
      }

      try {
        // Clone pour éviter que html2canvas touche directement au contenu affiché
        const clone = element.cloneNode(true) as HTMLElement;

        clone.style.backgroundColor = "#ffffff";
        clone.style.color = "#0f172a";

        // Remplacer les couleurs modernes non supportées par html2canvas
        const allElements = clone.querySelectorAll("*");

        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;

          htmlEl.style.setProperty(
            "color",
            htmlEl.style.color || "#0f172a"
          );

          htmlEl.style.setProperty(
            "background-color",
            htmlEl.style.backgroundColor || "transparent"
          );

          htmlEl.style.setProperty(
            "border-color",
            htmlEl.style.borderColor || "#e2e8f0"
          );
        });

        clone.style.position = "fixed";
        clone.style.left = "-10000px";
        clone.style.top = "0";
        clone.style.width = "287mm";
        clone.style.minHeight = "200mm";
        clone.style.zIndex = "-1";

        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        document.body.removeChild(clone);

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

        pdf.save(`Proforma-${quote.quoteNumber}.pdf`);

      } catch (error) {
        console.error("Erreur génération PDF :", error);

        setToast({
          message: "Erreur lors de la génération du PDF.",
          type: "error",
        });
      }
    }, 300);
  };
  

  const filteredQuotes = quotes.filter(q =>
    q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer ce devis ?"
        message="Êtes-vous sûr de vouloir supprimer ce devis de l'ERP ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des Devis Commercial
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Propositions tarifaires et conversion directe en commandes
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouveau Devis
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° devis ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-4 px-4">N° Devis</th>
                <th className="py-4 px-4">Client</th>
                <th className="py-4 px-4">Émis le</th>
                <th className="py-4 px-4">Valable Jusqu'au</th>
                <th className="py-4 px-4">Montant Total</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-amber-600 dark:text-amber-400">{q.quoteNumber}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{q.customerName}</p>
                    <p className="text-[10px] text-slate-400">{q.customerPhone}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{formatDate(q.createdAt)}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{q.validUntil}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(q.total, settings.currency)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={q.status}
                      onChange={(e) => updateQuoteStatus(q.id, e.target.value as QuoteStatus)}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 outline-none"
                    >
                      <option value="En attente">En attente</option>
                      <option value="Accepté">Accepté</option>
                      <option value="Refusé">Refusé</option>
                      <option value="Expiré">Expiré</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">

                      {/* VOIR */}
                      <button
                        onClick={() => handleOpenVoir(q)}
                        title="Voir le devis"
                        className="
                          p-2
                          rounded-xl
                          bg-blue-50
                          dark:bg-blue-950/30
                          text-blue-600
                          dark:text-blue-400
                          hover:bg-blue-600
                          hover:text-white
                          transition-all
                        "
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* MODIFIER */}
                      <button
                        onClick={() => handleOpenEdit(q)}
                        title="Modifier le devis"
                        className="
                          p-2
                          rounded-xl
                          bg-blue-50
                          dark:bg-blue-950/30
                          text-blue-600
                          dark:text-blue-400
                          hover:bg-blue-600
                          hover:text-white
                          transition-all
                        "
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>


                      {/* IMPRIMER */}
                      <button
                        onClick={() => handlePrintQuote(q)}
                        title="Imprimer le devis"
                        className="
                          p-2
                          rounded-xl
                          bg-slate-100
                          dark:bg-slate-800
                          text-slate-600
                          dark:text-slate-300
                          hover:bg-slate-900
                          hover:text-white
                          transition-all
                        "
                      >
                        <Printer className="w-4 h-4" />
                      </button>


                      {/* TELECHARGER PDF */}
                      <button
                        onClick={() => handleDownloadQuote(q)}
                        title="Télécharger le devis PDF"
                        className="
                          p-2
                          rounded-xl
                          bg-emerald-50
                          dark:bg-emerald-950/30
                          text-emerald-600
                          dark:text-emerald-400
                          hover:bg-emerald-600
                          hover:text-white
                          transition-all
                        "
                      >
                        <Download className="w-4 h-4" />
                      </button>


                      {/* CONVERTIR EN COMMANDE */}
                      {q.status !== 'Accepté' && (
                        <button
                          onClick={() => handleConvertToOrder(q)}
                          title="Convertir en Commande"
                          className="
                            flex
                            items-center
                            gap-1
                            px-3
                            py-1.5
                            rounded-xl
                            bg-amber-500
                            text-slate-950
                            font-bold
                            text-[11px]
                            shadow-sm
                            hover:bg-amber-400
                            transition-colors
                          "
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          Transformer
                        </button>
                      )}


                      {/* SUPPRIMER */}
                      {isAdmin && (
                        <button
                          onClick={() => setDeleteTargetId(q.id)}
                          title="Supprimer"
                          className="
                            p-2
                            rounded-xl
                            bg-rose-100
                            dark:bg-rose-950/40
                            text-rose-600
                            hover:bg-rose-600
                            hover:text-white
                            transition-all
                          "
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                CRÉER UN NOUVEAU DEVIS
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Client destinataire *
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>)}
                </select>
              </div>

              {/* Add item */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-extrabold uppercase text-amber-600 dark:text-amber-400">
                  SELECTIONNER LES OUVRAGES
                </h4>
                <div className="space-y-5">
                  <div className="space-y-4">
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="">-- Choisir un produit --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.price.toLocaleString('fr-FR')} {settings.currency}/{p.unit})
                        </option>
                      ))}
                    </select>

                    {/* ⬇️ APETRAKA ETO NY OPTIONS */}
                    {selectedProduct?.options &&
                      selectedProduct.options.length > 0 && (

                      <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4">

                        <p className="text-xs font-bold uppercase mb-3 text-amber-500">
                          Options disponibles
                        </p>

                        <div className="space-y-2">

                          {selectedProduct.options.map(option => {

                            const checked = selectedOptions.some(
                              o => o.id === option.id
                            );

                            return (
                              <label
                                key={option.id}
                                className="flex items-center justify-between text-xs cursor-pointer"
                              >
                                <div className="flex items-center gap-2">

                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {

                                      if (e.target.checked) {

                                        setSelectedOptions(prev => [
                                          ...prev,
                                          option
                                        ]);

                                      } else {

                                        setSelectedOptions(prev =>
                                          prev.filter(o => o.id !== option.id)
                                        );

                                      }

                                    }}
                                  />

                                  <span>{option.name}</span>

                                </div>

                                <span className="font-bold text-amber-500">
                                  + {formatCurrency(option.price, settings.currency)}
                                </span>

                              </label>
                            );

                          })}

                        </div>

                      </div>

                    )}

                  </div>

                  {/* Quantité */}
                  <div className="flex gap-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-2">
                        Quantité
                      </label>

                      <div className="flex">

                        <input
                          type="number"
                          min={selectedProduct?.unit === "Pièce" ? 1 : 0.01}
                          step={selectedProduct?.unit === "Pièce" ? 1 : 0.01}
                          value={itemQty}
                          onChange={(e) => setItemQty(Number(e.target.value))}
                          className="flex-1 px-4 py-3 rounded-l-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold outline-none"
                        />

                        <div className="px-4 flex items-center bg-slate-200 dark:bg-slate-700 rounded-r-xl text-xs font-bold">
                          {selectedProduct?.unit || "-"}
                        </div>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex-1 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400">ARTICLES DEVIS ({quoteItems.length})</h4>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {item.productName}
                        </p>
                        {item.selectedOptions &&
                          item.selectedOptions.length > 0 && (
                            <div className="mt-1 space-y-1">
                              {item.selectedOptions.map(option => (
                                <p
                                  key={option.id}
                                  className="text-[10px] text-amber-500 font-medium"
                                >
                                  • {option.name}
                                </p>
                              ))}
                            </div>
                        )}
                        <p className="text-[11px] text-slate-400">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice, settings.currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          {item.totalPrice.toLocaleString('fr-FR')} {settings.currency}
                        </span>
                        <button type="button" onClick={() => handleRemoveItem(idx)} className="text-rose-500 p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fees */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Main d'œuvre
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={laborFee === 0 ? "" : laborFee.toLocaleString("fr-FR")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
                      setLaborFee(Number(value) || 0);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Transport
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={transportFee === 0 ? "" : transportFee.toLocaleString("fr-FR")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
                      setTransportFee(Number(value) || 0);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Remise
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    value={discount === 0 ? "" : discount.toLocaleString("fr-FR")}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "").replace(/[^\d]/g, "");
                      setDiscount(Number(value) || 0);
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">
                  TOTAL ESTIMÉ DEVIS
                </span>
                <span className="text-xl font-mono font-black text-white">
                  {formatCurrency(totalAmount, settings.currency)}
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                >
                  Générer le Devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isQuotePreviewOpen && selectedQuote && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-slate-900/80
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
            overflow-auto
          "
        >

          <div
            id="printable-quote"
            className="
              bg-white
              text-slate-900
              w-full
              max-w-[1100px]
              min-h-[700px]
              rounded-2xl
              shadow-2xl
              p-8
            "
          >

            {/* HEADER */}

            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">

              <div className="flex items-center gap-4">
                <img
                  src={logo1}
                  alt={settings.companyName}
                  className="w-16 h-16 object-contain"
                />

                <div>
                  <h1 className="text-2xl font-black uppercase text-slate-900">
                    {settings.companyName}
                  </h1>

                  <p className="text-xs text-slate-500 mt-1">
                    Aluminium • Inox • Vitrerie
                  </p>

                  {settings.phone && (
                    <p className="text-xs text-slate-500 mt-1">
                      Tél : {settings.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">

                <p className="text-xs font-black uppercase tracking-[2px] text-slate-400 mb-1">
                  FACTURE PROFORMA
                </p>

                <h2 className="text-3xl font-black text-amber-600">
                  DEVIS
                </h2>

                <p className="text-sm font-bold mt-1">
                  N° {selectedQuote.quoteNumber}
                </p>


                <p className="text-xs text-slate-500">
                  Date : {formatDate(selectedQuote.createdAt)}
                </p>

              </div>

            </div>


            {/* CLIENT */}

            <div className="grid grid-cols-2 gap-8 mt-6">

              <div>

                <p className="text-[10px] font-black uppercase text-slate-400">
                  Client
                </p>

                <p className="font-black text-lg">
                  {selectedQuote.customerName}
                </p>

                <p className="text-sm">
                  {selectedQuote.customerPhone}
                </p>

                <p className="text-sm">
                  {selectedQuote.customerAddress}
                </p>

              </div>


              <div className="text-right">

                <p className="text-[10px] font-black uppercase text-slate-400">
                  Validité
                </p>

                <p className="font-bold">
                  Jusqu'au {selectedQuote.validUntil}
                </p>

              </div>

            </div>


            {/* PRODUITS */}

            <table className="w-full mt-8 border-collapse">

              <thead>

                <tr className="bg-slate-900 text-white text-xs uppercase">

                  <th className="p-3 text-left">
                    Désignation
                  </th>

                  <th className="p-3 text-center">
                    Qté
                  </th>

                  <th className="p-3 text-right">
                    Prix unitaire
                  </th>

                  <th className="p-3 text-right">
                    Total
                  </th>

                </tr>

              </thead>


              <tbody>

                {selectedQuote.products.map((item, index) => (

                  <tr
                    key={index}
                    className="border-b border-slate-200 text-sm"
                  >

                    <td className="p-3">

                      <p className="font-bold">
                        {item.productName}
                      </p>

                      {item.selectedOptions?.map(option => (
                        <p
                          key={option.id}
                          className="text-[10px] text-slate-500"
                        >
                          • {option.name}
                        </p>
                      ))}

                    </td>

                    <td className="p-3 text-center">
                      {item.quantity} {item.unit}
                    </td>

                    <td className="p-3 text-right">
                      {formatCurrency(
                        item.unitPrice,
                        settings.currency
                      )}
                    </td>

                    <td className="p-3 text-right font-bold">
                      {formatCurrency(
                        item.totalPrice,
                        settings.currency
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>


            {/* TOTAL */}

            <div className="flex justify-end mt-6">

              <div className="w-80 space-y-2 text-sm">

                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <strong>
                    {formatCurrency(
                      selectedQuote.subtotal,
                      settings.currency
                    )}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Main d'œuvre</span>
                  <strong>
                    {formatCurrency(
                      selectedQuote.laborFee,
                      settings.currency
                    )}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Transport</span>
                  <strong>
                    {formatCurrency(
                      selectedQuote.transportFee,
                      settings.currency
                    )}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span>Remise</span>
                  <strong>
                    - {formatCurrency(
                      selectedQuote.discount,
                      settings.currency
                    )}
                  </strong>
                </div>

                <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-lg">

                  <span className="font-black">
                    TOTAL
                  </span>

                  <strong className="text-amber-600">
                    {formatCurrency(
                      selectedQuote.total,
                      settings.currency
                    )}
                  </strong>

                </div>

                <div className="flex justify-between border-t-2 border-slate-900 pt-3 text-lg">

                  <span className="text-[10px] font-semibold uppercase text-slate-500 block mt-1"> {numberToFrenchWords( Math.round(selectedQuote.total) )} ARIARY </span>

                </div>

              </div>

            </div>


            {/* NOTES */}

            {selectedQuote.notes && (
              <div className="mt-8">

                <p className="text-[10px] uppercase font-black text-slate-400">
                  Notes
                </p>

                <p className="text-sm mt-1">
                  {selectedQuote.notes}
                </p>

              </div>
            )}


            {/* FOOTER */}

            <div className="mt-12 pt-5 border-t text-center text-xs text-slate-500">

              Merci pour votre confiance.

              <br />

              Votre ouvrage aluminium est fabriqué avec soin
              par notre atelier.

            </div>


            {/* BUTTONS - tsy hivoaka amin'ny impression */}

            <div className="flex justify-end gap-3 mt-8 print:hidden">

              <button
                onClick={() => setIsQuotePreviewOpen(false)}
                className="
                  no-print
                  px-4
                  py-2
                  rounded-xl
                  bg-slate-200
                  text-slate-700
                  text-xs
                  font-bold
                "
              >
                Fermer
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};
