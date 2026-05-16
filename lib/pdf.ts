import PDFDocument from "pdfkit";
import { join } from "path";

interface OrderPDFData {
  orderId: string;
  customer: { fullName: string; phone: string; address: string; email?: string };
  items: { name: string; quantity: number; price: number }[];
  subtotal?: number;
  discountCode?: string;
  discountPercent?: number;
  total: number;
  createdAt: Date;
}

export function generateReceiptPDF(order: OrderPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const fontPath = join(process.cwd(), "public", "fonts", "NotoSansBengali-Regular.ttf");

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end",  () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    try { doc.registerFont("NotoSans", fontPath); } catch { /* fallback */ }

    // Render ৳ in NotoSans then the number in Helvetica, left-aligned at x
    function drawAmt(amount: number, x: number, y: number, color: string, size: number, bold = false) {
      doc.font("NotoSans").fontSize(size);
      const tkW = doc.widthOfString("৳");
      doc.fillColor(color).text("৳", x, y, { lineBreak: false });
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size).fillColor(color)
         .text(amount.toLocaleString(), x + tkW, y);
    }

    // Render "- " just left of x so ৳ stays column-aligned with other rows
    function drawNegAmt(amount: number, x: number, y: number, color: string, size: number) {
      doc.font("Helvetica").fontSize(size).fillColor(color);
      const dashW = doc.widthOfString("- ");
      doc.text("- ", x - dashW, y, { lineBreak: false });
      drawAmt(amount, x, y, color, size);
    }

    const brand  = "#014E73";
    const dark   = "#111827";
    const muted  = "#6B7280";
    const subtle = "#9CA3AF";
    const border = "#E5E7EB";
    const rowAlt = "#F9FAFB";
    const green  = "#059669";
    const W      = doc.page.width;
    const H      = doc.page.height;
    const PAD    = 52;
    const CW     = W - PAD * 2;

    // ── Top accent stripe ─────────────────────────────────────────────────────
    doc.rect(0, 0, W, 6).fill(brand);

    // ── Header ────────────────────────────────────────────────────────────────
    const logoPath = join(process.cwd(), "public", "logo-icon.png");
    try {
      doc.image(logoPath, PAD, 20, { fit: [40, 40] });
    } catch { /* no logo fallback */ }

    doc.fillColor(brand).fontSize(16).font("Helvetica-Bold")
       .text("ROBOZED", PAD + 50, 22);
    doc.fillColor(subtle).fontSize(7.5).font("Helvetica")
       .text("MICROCHIPS  ·  ROBOTICS  ·  GADGETS", PAD + 50, 43);

    doc.fillColor(subtle).fontSize(7.5).font("Helvetica")
       .text("ORDER RECEIPT", PAD, 22, { width: CW, align: "right" });
    doc.fillColor(brand).fontSize(15).font("Helvetica-Bold")
       .text(`#${order.orderId}`, PAD, 37, { width: CW, align: "right" });

    // ── Divider ───────────────────────────────────────────────────────────────
    const sep1 = 80;
    doc.moveTo(PAD, sep1).lineTo(W - PAD, sep1).strokeColor(border).lineWidth(0.8).stroke();

    // ── Bill To / Order Details ───────────────────────────────────────────────
    const infoY  = sep1 + 16;
    const colW   = CW / 2 - 12;
    const rightX = PAD + colW + 24;
    const rW     = W - PAD - rightX;

    doc.fillColor(subtle).fontSize(7).font("Helvetica-Bold")
       .text("BILL TO", PAD, infoY);
    doc.fillColor(dark).fontSize(11.5).font("Helvetica-Bold")
       .text(order.customer.fullName, PAD, infoY + 13, { width: colW });
    doc.fillColor(muted).fontSize(9.5).font("Helvetica")
       .text(order.customer.phone,   PAD, infoY + 29, { width: colW })
       .text(order.customer.address, PAD, infoY + 44, { width: colW });
    if (order.customer.email) {
      doc.fillColor(subtle).fontSize(8.5).font("Helvetica")
         .text(order.customer.email, PAD, doc.y + 4, { width: colW });
    }

    const d       = new Date(order.createdAt);
    const dateStr = d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    doc.fillColor(subtle).fontSize(7).font("Helvetica-Bold")
       .text("ORDER DATE", rightX, infoY, { width: rW, align: "right" });
    doc.fillColor(dark).fontSize(10.5).font("Helvetica-Bold")
       .text(dateStr, rightX, infoY + 13, { width: rW, align: "right" });
    doc.fillColor(muted).fontSize(9).font("Helvetica")
       .text(timeStr, rightX, infoY + 30, { width: rW, align: "right" });

    doc.fillColor(subtle).fontSize(7).font("Helvetica-Bold")
       .text("ORDER ID", rightX, infoY + 50, { width: rW, align: "right" });
    doc.fillColor(brand).fontSize(10).font("Helvetica-Bold")
       .text(`#${order.orderId}`, rightX, infoY + 62, { width: rW, align: "right" });

    // ── Divider ───────────────────────────────────────────────────────────────
    const sep2 = Math.max(doc.y, infoY + 88) + 16;
    doc.moveTo(PAD, sep2).lineTo(W - PAD, sep2).strokeColor(border).lineWidth(0.8).stroke();

    // ── Items table ───────────────────────────────────────────────────────────
    // PAD=52, right edge=543
    //   ITEM:       x=52, inner text at 62, width=256
    //   QTY:        x=330, width=52
    //   UNIT PRICE: x=388, width=80
    //   AMOUNT:     x=468, width=75 → ends 543 ✓
    const C  = { item: PAD, qty: 330, unit: 388, amt: 468 };
    const CL = { item: 256, qty: 52,  unit: 80,  amt: 75  };

    const tblY = sep2 + 12;
    doc.rect(PAD, tblY, CW, 25).fill(brand);
    doc.fillColor("#FFFFFF").fontSize(7.5).font("Helvetica-Bold")
       .text("ITEM",       C.item + 10, tblY + 9)
       .text("QTY",        C.qty,       tblY + 9)
       .text("UNIT PRICE", C.unit,      tblY + 9)
       .text("AMOUNT",     C.amt,       tblY + 9);

    let rY = tblY + 28;
    order.items.forEach((item, i) => {
      const rH = 25;
      if (i % 2 !== 0) {
        doc.rect(PAD, rY - 4, CW, rH).fill(rowAlt);
      }
      doc.moveTo(PAD, rY + rH - 4).lineTo(W - PAD, rY + rH - 4)
         .strokeColor(border).lineWidth(0.4).stroke();

      doc.fillColor(dark).fontSize(9.5).font("Helvetica")
         .text(item.name, C.item + 10, rY, { width: CL.item });
      doc.fillColor(muted).fontSize(9.5).font("Helvetica")
         .text(String(item.quantity), C.qty, rY);
      drawAmt(item.price,                   C.unit, rY, muted, 9.5);
      drawAmt(item.price * item.quantity,   C.amt,  rY, dark,  9.5, true);
      rY += 25;
    });

    // ── Totals ────────────────────────────────────────────────────────────────
    const itemsTotal  = order.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const subtotal    = order.subtotal ?? itemsTotal;
    const inferredAmt = Math.max(0, subtotal - order.total);
    const hasDiscount = (order.discountPercent ?? 0) > 0 || inferredAmt > 0;
    const discAmt     = (order.discountPercent ?? 0) > 0
      ? Math.round(subtotal * ((order.discountPercent ?? 0) / 100))
      : inferredAmt;
    // Show inferred % when discountPercent wasn't stored
    const discPct     = (order.discountPercent ?? 0) > 0
      ? order.discountPercent!
      : (subtotal > 0 ? Math.round((discAmt / subtotal) * 100) : 0);

    rY += 14;

    if (hasDiscount) {
      doc.fillColor(muted).fontSize(9.5).font("Helvetica")
         .text("Subtotal", C.unit, rY);
      drawAmt(subtotal, C.amt, rY, dark, 9.5);
      rY += 20;

      const discLabel = discPct > 0 ? `Discount ${discPct}%` : "Discount";

      doc.fillColor(green).fontSize(9.5).font("Helvetica")
         .text(discLabel, C.unit, rY);
      drawNegAmt(discAmt, C.amt, rY, green, 9.5);
      rY += 13;

      doc.moveTo(C.unit, rY).lineTo(W - PAD, rY).strokeColor(border).lineWidth(0.8).stroke();
      rY += 12;
    }

    // Total box
    const totX = C.unit - 8;
    const totW = (W - PAD) - totX;
    doc.rect(totX, rY - 5, totW, 33).fill(brand);
    doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold")
       .text("TOTAL", C.unit, rY + 5);
    drawAmt(order.total, C.amt, rY + 2, "#FFFFFF", 14, true);

    // ── Footer ────────────────────────────────────────────────────────────────
    const footY = H - 56;
    doc.moveTo(PAD, footY).lineTo(W - PAD, footY).strokeColor(border).lineWidth(0.8).stroke();

    doc.fillColor(dark).fontSize(9).font("Helvetica-Bold")
       .text("Thank you for shopping with RoboZed!", PAD, footY + 12, { align: "center", width: CW });
    doc.fillColor(subtle).fontSize(8).font("Helvetica")
       .text("robozed.com  ·  Microchips · Robotics · Gadgets", PAD, footY + 27, { align: "center", width: CW });
    doc.fillColor(subtle).fontSize(7.5)
       .text("This is a computer-generated document. No signature is required.", PAD, footY + 41, { align: "center", width: CW });

    doc.rect(0, H - 6, W, 6).fill(brand);

    doc.end();
  });
}
