import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const FROM_EMAIL = process.env.ADMIN_EMAIL!;

export async function sendOrderNotification(
  order: {
    orderId: string;
    customer: { fullName: string; phone: string; address: string; email?: string };
    items: { name: string; quantity: number; price: number }[];
    total: number;
    createdAt: Date;
  },
  pdfBuffer: Buffer
) {
  const itemRows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${i.name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">৳${(i.price * i.quantity).toLocaleString()}</td></tr>`
    )
    .join("");

  const html = `
  <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#014E73;padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:-0.5px">RoboZed</h1>
      <p style="color:#80C9E8;margin:8px 0 0;font-size:14px">Microchips · Robotics · Gadgets</p>
    </div>
    <div style="padding:32px">
      <h2 style="color:#014E73;margin:0 0 8px;font-size:18px">New Order Received</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Order ID: <strong style="color:#0f2027">${order.orderId}</strong> · ${new Date(order.createdAt).toLocaleString()}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr style="background:#f9fafb"><th style="padding:10px 12px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Item</th><th style="padding:10px 12px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Qty</th><th style="padding:10px 12px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280">Amount</th></tr>
        ${itemRows}
        <tr><td colspan="2" style="padding:12px;text-align:right;font-weight:600;color:#0f2027">Total</td><td style="padding:12px;text-align:right;font-weight:700;color:#014E73;font-size:16px">৳${order.total.toLocaleString()}</td></tr>
      </table>
      <div style="background:#f0f7fb;border-radius:8px;padding:16px;margin-bottom:24px">
        <h3 style="margin:0 0 12px;color:#014E73;font-size:14px;text-transform:uppercase;letter-spacing:0.5px">Customer Details</h3>
        <p style="margin:4px 0;color:#374151;font-size:14px"><strong>Name:</strong> ${order.customer.fullName}</p>
        <p style="margin:4px 0;color:#374151;font-size:14px"><strong>Phone:</strong> ${order.customer.phone}</p>
        <p style="margin:4px 0;color:#374151;font-size:14px"><strong>Address:</strong> ${order.customer.address}</p>
        ${order.customer.email ? `<p style="margin:4px 0;color:#374151;font-size:14px"><strong>Email:</strong> ${order.customer.email}</p>` : ""}
      </div>
      <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0">PDF receipt attached · RoboZed Admin Panel</p>
    </div>
  </div>`;

  await sgMail.send({
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `New Order #${order.orderId} — ৳${order.total.toLocaleString()} — RoboZed`,
    html,
    attachments: [
      {
        content: pdfBuffer.toString("base64"),
        filename: `receipt-${order.orderId}.pdf`,
        type: "application/pdf",
        disposition: "attachment",
      },
    ],
  });
}

export async function sendAdminAccessRequest(name: string, email: string) {
  const approvalHtml = `
  <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
    <div style="background:#014E73;padding:32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:24px">RoboZed Admin Access Request</h1>
    </div>
    <div style="padding:32px">
      <p style="color:#374151">A new admin access request has been submitted:</p>
      <div style="background:#f0f7fb;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:4px 0"><strong>Name:</strong> ${name}</p>
        <p style="margin:4px 0"><strong>Email:</strong> ${email}</p>
      </div>
      <p style="color:#6b7280;font-size:13px">Log into the database and set <code>approved: true</code> for this admin user to grant access.</p>
    </div>
  </div>`;

  await sgMail.send({
    to: ADMIN_EMAIL,
    from: FROM_EMAIL,
    subject: `Admin Access Request — ${name} (${email}) — RoboZed`,
    html: approvalHtml,
  });
}
