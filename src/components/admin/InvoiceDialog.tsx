/**
 * InvoiceDialog
 *
 * Shows a GST-style invoice for an order. Every field is editable before the
 * invoice is printed or emailed, so the admin can correct a name, adjust a
 * line item, or add a note without touching the order record itself.
 *
 * Business details default from Admin → Settings → Invoice.
 */

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Printer, Mail, Loader2, Pencil, Eye, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSiteSettings, getSettingValue } from '@/hooks/useSiteSettings';
import { supabase } from '@/lib/supabase';
import type { Order, OrderItemDB } from '@/hooks/useOrders';

interface LineItem {
  name: string;
  qty: number;
  price: number;
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  items: OrderItemDB[];
}

const money = (n: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const InvoiceDialog = ({ open, onOpenChange, order, items }: InvoiceDialogProps) => {
  const { data: invoiceSettings } = useSiteSettings('invoice');
  const printRef = useRef<HTMLDivElement>(null);

  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);

  // Editable state
  const [biz, setBiz] = useState({
    name: '', address: '', state: '', phone: '', email: '', gstin: '',
  });
  const [cust, setCust] = useState({ name: '', phone: '', address: '' });
  const [meta, setMeta] = useState({ refNo: '', date: '' });
  const [lines, setLines] = useState<LineItem[]>([]);
  const [terms, setTerms] = useState('');
  const [footerNote, setFooterNote] = useState('');

  // Reset the form whenever a different order is opened
  useEffect(() => {
    if (!order || !open) return;

    setBiz({
      name:    getSettingValue(invoiceSettings, 'invoice_business_name', 'HELMET HUB'),
      address: getSettingValue(invoiceSettings, 'invoice_address', ''),
      state:   getSettingValue(invoiceSettings, 'invoice_state', ''),
      phone:   getSettingValue(invoiceSettings, 'invoice_phone', ''),
      email:   getSettingValue(invoiceSettings, 'invoice_email', ''),
      gstin:   getSettingValue(invoiceSettings, 'invoice_gstin', ''),
    });

    setCust({
      name:    order.customer_name || '',
      phone:   order.customer_phone || '',
      address: order.shipping_address || '',
    });

    // Order numbers already carry the prefix (e.g. "HH-01011"), so only add it
    // when it is genuinely missing — otherwise you get "HHHH-01011".
    const prefix = getSettingValue(invoiceSettings, 'invoice_prefix', 'HH');
    const num = order.order_number || '';
    const refNo = prefix && !num.toUpperCase().startsWith(prefix.toUpperCase())
      ? `${prefix}-${num}`
      : num;

    setMeta({
      refNo,
      date: new Date(order.created_at).toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      }),
    });

    setLines(
      items.map((i) => ({
        name: [i.product_name, i.color, i.size].filter(Boolean).join(' — '),
        qty: i.quantity,
        price: Number(i.price),
      }))
    );

    setTerms(getSettingValue(invoiceSettings, 'invoice_terms', ''));
    setFooterNote(getSettingValue(invoiceSettings, 'invoice_footer_note', ''));
    setEditing(false);
  }, [order, items, invoiceSettings, open]);

  if (!order) return null;

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.price, 0);
  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);
  const grandTotal = Number(order.total_amount) || subtotal;
  const shipping = Math.max(0, grandTotal - subtotal);

  const updateLine = (idx: number, patch: Partial<LineItem>) =>
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const addLine = () => setLines((prev) => [...prev, { name: '', qty: 1, price: 0 }]);

  /** Opens a clean print window containing only the invoice markup. */
  const handlePrint = () => {
    const node = printRef.current;
    if (!node) return;

    const win = window.open('', '_blank', 'width=820,height=1000');
    if (!win) {
      toast.error('Please allow pop-ups to print the invoice');
      return;
    }

    win.document.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${meta.refNo}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      margin: 0; padding: 24px; color: #1a1a1a; font-size: 13px;
    }
    .inv { max-width: 720px; margin: 0 auto; }
    .bar { height: 34px; background: #4FC3E8; margin: -24px -24px 20px; }
    h1 { font-size: 19px; margin: 0 0 6px; letter-spacing: -0.01em; }
    .muted { color: #667; }
    .row { display: flex; justify-content: space-between; gap: 24px; }
    .divider { border: 0; border-top: 1px solid #E2E6EA; margin: 16px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th { text-align: left; font-size: 11px; text-transform: uppercase;
         letter-spacing: .05em; color: #667; padding: 8px 6px;
         border-bottom: 1.5px solid #D8DDE2; }
    td { padding: 9px 6px; border-bottom: 1px solid #EDF0F2; vertical-align: top; }
    .r { text-align: right; }
    .tot td { border-bottom: 0; padding-top: 7px; }
    .grand td { font-weight: 700; font-size: 15px; border-top: 1.5px solid #D8DDE2; }
    .terms { margin-top: 22px; font-size: 11.5px; color: #555; line-height: 1.55; }
    .note { margin-top: 10px; font-size: 11.5px; color: #667; }
    @media print { body { padding: 0; } .bar { margin: 0 0 20px; } }
  </style>
</head>
<body>${node.innerHTML}</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  /** Sends the rendered invoice as an HTML email to the customer. */
  const handleEmail = async () => {
    if (!order.customer_email) {
      toast.error('This order has no customer email address');
      return;
    }
    const node = printRef.current;
    if (!node) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/send-invoice-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          order_id: order.id,
          to: order.customer_email,
          invoice_no: meta.refNo,
          html: node.innerHTML,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invoice');
      toast.success(`Invoice emailed to ${order.customer_email}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  };

  const field = 'h-9 text-sm';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="admin-theme max-w-3xl max-h-[92vh] overflow-y-auto bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle>Invoice — {order.order_number}</DialogTitle>
          <DialogDescription>
            Check the details, edit anything that needs correcting, then print or email.
          </DialogDescription>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <Button
            variant={editing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setEditing((v) => !v)}
            className="gap-1.5"
          >
            {editing ? <Eye size={15} /> : <Pencil size={15} />}
            {editing ? 'Preview' : 'Edit'}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer size={15} />
            Print / Save PDF
          </Button>
          <Button size="sm" onClick={handleEmail} disabled={sending} className="gap-1.5">
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
            {sending ? 'Sending…' : 'Email to Customer'}
          </Button>
        </div>

        {/* ---------------- EDIT MODE ---------------- */}
        {editing && (
          <div className="space-y-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <h3 className="mb-2.5">Business Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Business Name</Label>
                  <Input className={field} value={biz.name}
                    onChange={(e) => setBiz({ ...biz, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>GSTIN <span className="text-gray-400">(optional)</span></Label>
                  <Input className={field} value={biz.gstin} placeholder="Leave blank if not registered"
                    onChange={(e) => setBiz({ ...biz, gstin: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Address</Label>
                  <Textarea rows={2} className="text-sm" value={biz.address}
                    onChange={(e) => setBiz({ ...biz, address: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input className={field} value={biz.phone}
                    onChange={(e) => setBiz({ ...biz, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input className={field} value={biz.state}
                    onChange={(e) => setBiz({ ...biz, state: e.target.value })} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2.5">Customer & Invoice</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Bill To</Label>
                  <Input className={field} value={cust.name}
                    onChange={(e) => setCust({ ...cust, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Customer Phone</Label>
                  <Input className={field} value={cust.phone}
                    onChange={(e) => setCust({ ...cust, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Invoice / Ref No.</Label>
                  <Input className={field} value={meta.refNo}
                    onChange={(e) => setMeta({ ...meta, refNo: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of Issue</Label>
                  <Input className={field} value={meta.date}
                    onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Delivery Address</Label>
                  <Textarea rows={2} className="text-sm" value={cust.address}
                    onChange={(e) => setCust({ ...cust, address: e.target.value })} />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <h3>Line Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5 h-8">
                  <Plus size={14} /> Add row
                </Button>
              </div>
              <div className="space-y-2">
                {lines.map((l, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <Input className={`${field} flex-1`} value={l.name} placeholder="Item name"
                      onChange={(e) => updateLine(i, { name: e.target.value })} />
                    <Input className={`${field} w-16`} type="number" min={1} value={l.qty}
                      onChange={(e) => updateLine(i, { qty: parseInt(e.target.value) || 1 })} />
                    <Input className={`${field} w-28`} type="number" min={0} step="0.01" value={l.price}
                      onChange={(e) => updateLine(i, { price: parseFloat(e.target.value) || 0 })} />
                    <Button type="button" variant="ghost" size="icon-sm"
                      className="text-red-600 hover:bg-red-50 mt-0.5"
                      onClick={() => removeLine(i)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Terms & Conditions</Label>
              <Textarea rows={3} className="text-sm" value={terms}
                onChange={(e) => setTerms(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Footer Note</Label>
              <Input className={field} value={footerNote}
                onChange={(e) => setFooterNote(e.target.value)} />
            </div>
          </div>
        )}

        {/* ---------------- PREVIEW (this is what prints / emails) ---------------- */}
        <div className="rounded-lg border border-gray-200 overflow-hidden bg-white">
          <div ref={printRef}>
            <div className="inv" style={{ fontSize: 13, color: '#1a1a1a' }}>
              <div className="bar" style={{ height: 34, background: '#4FC3E8' }} />

              <div style={{ padding: '0 20px 20px' }}>
                {/* Business block */}
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 19, margin: '0 0 6px' }}>{biz.name}</h1>
                    <div className="muted" style={{ color: '#667', lineHeight: 1.5 }}>
                      {biz.address}
                      {biz.phone && <><br />{biz.phone}</>}
                      {biz.email && <><br />{biz.email}</>}
                      {biz.gstin && <><br /><strong>Company GST: {biz.gstin}</strong></>}
                      {biz.state && <><br />{biz.state}</>}
                    </div>
                  </div>
                  <div style={{
                    width: 62, height: 62, borderRadius: '50%', background: '#F5C518',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, fontWeight: 700, color: '#141414', flexShrink: 0,
                  }}>
                    {(biz.name || 'H').charAt(0)}
                  </div>
                </div>

                <hr className="divider" style={{ border: 0, borderTop: '1px solid #E2E6EA', margin: '16px 0' }} />

                {/* Bill to / ref */}
                <div className="row" style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
                  <div>
                    <div style={{ color: '#4FC3E8', fontWeight: 600, marginBottom: 3 }}>Bill To:</div>
                    <div style={{ fontWeight: 600 }}>{cust.name}</div>
                    {cust.phone && <div className="muted" style={{ color: '#667' }}>{cust.phone}</div>}
                    {cust.address && (
                      <div className="muted" style={{ color: '#667', maxWidth: 300, marginTop: 4, lineHeight: 1.5 }}>
                        {cust.address}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#4FC3E8', fontWeight: 600, marginBottom: 3 }}>Ref No:</div>
                    <div style={{ fontWeight: 600 }}>{meta.refNo}</div>
                    <div style={{ color: '#4FC3E8', fontWeight: 600, marginTop: 8 }}>Date of Issue</div>
                    <div>{meta.date}</div>
                  </div>
                </div>

                {/* Items */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 18 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: '#667', padding: '8px 6px', borderBottom: '1.5px solid #D8DDE2', width: 34 }}>SR</th>
                      <th style={{ textAlign: 'left', fontSize: 11, textTransform: 'uppercase', color: '#667', padding: '8px 6px', borderBottom: '1.5px solid #D8DDE2' }}>Name</th>
                      <th style={{ textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: '#667', padding: '8px 6px', borderBottom: '1.5px solid #D8DDE2', width: 52 }}>Qty</th>
                      <th style={{ textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: '#667', padding: '8px 6px', borderBottom: '1.5px solid #D8DDE2', width: 88 }}>Price</th>
                      <th style={{ textAlign: 'right', fontSize: 11, textTransform: 'uppercase', color: '#667', padding: '8px 6px', borderBottom: '1.5px solid #D8DDE2', width: 96 }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => (
                      <tr key={i}>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #EDF0F2' }}>{i + 1}</td>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #EDF0F2' }}>{l.name}</td>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #EDF0F2', textAlign: 'right' }}>{l.qty}</td>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #EDF0F2', textAlign: 'right' }}>{money(l.price)}</td>
                        <td style={{ padding: '9px 6px', borderBottom: '1px solid #EDF0F2', textAlign: 'right' }}>{money(l.qty * l.price)}</td>
                      </tr>
                    ))}
                    <tr className="tot">
                      <td colSpan={2} style={{ padding: '9px 6px', fontWeight: 700 }}>Total</td>
                      <td style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>{totalQty}</td>
                      <td />
                      <td style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700 }}>{money(subtotal)}</td>
                    </tr>
                    {shipping > 0 && (
                      <tr className="tot">
                        <td colSpan={4} style={{ padding: '4px 6px', textAlign: 'right', color: '#667' }}>Shipping</td>
                        <td style={{ padding: '4px 6px', textAlign: 'right' }}>{money(shipping)}</td>
                      </tr>
                    )}
                    <tr className="grand">
                      <td colSpan={4} style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700, fontSize: 15, borderTop: '1.5px solid #D8DDE2' }}>Total</td>
                      <td style={{ padding: '9px 6px', textAlign: 'right', fontWeight: 700, fontSize: 15, borderTop: '1.5px solid #D8DDE2' }}>{money(grandTotal)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} style={{
                        padding: '3px 6px', textAlign: 'right',
                        color: order.payment_status === 'paid' ? '#667' : '#C0392B',
                        fontWeight: order.payment_status === 'paid' ? 400 : 600,
                      }}>
                        {order.payment_status === 'paid' ? 'Received' : 'Amount Due'}
                      </td>
                      <td style={{
                        padding: '3px 6px', textAlign: 'right',
                        color: order.payment_status === 'paid' ? '#1a1a1a' : '#C0392B',
                        fontWeight: order.payment_status === 'paid' ? 400 : 600,
                      }}>
                        {/* Unpaid orders owe the full amount — showing 0.00 here
                            made every pending invoice look already settled. */}
                        {money(grandTotal)}
                      </td>
                    </tr>

                    {/* Dispatch details appear once the order has shipped */}
                    {(order.tracking_id || order.courier_name) && (
                      <tr>
                        <td colSpan={5} style={{ padding: '10px 6px 0', color: '#667', fontSize: 12 }}>
                          <strong style={{ color: '#1a1a1a' }}>Dispatch:</strong>{' '}
                          {order.courier_name || 'Courier'}
                          {order.tracking_id && <> — Tracking <strong>{order.tracking_id}</strong></>}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {terms && (
                  <div className="terms" style={{ marginTop: 22, fontSize: 11.5, color: '#555', lineHeight: 1.55 }}>
                    {terms}
                  </div>
                )}
                {footerNote && (
                  <div className="note" style={{ marginTop: 10, fontSize: 11.5, color: '#667' }}>
                    {footerNote}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDialog;
