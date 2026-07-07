import { AppData, ServiceOrder } from '@/types';
import { formatDate, formatMoney, statusLabel } from '@/utils/formatters';

export const PDF_PAGE_MARGINS = {
  top: 54,
  right: 44,
  bottom: 58,
  left: 44,
};

type PdfTemplateOptions = {
  useBodyMargins?: boolean;
};

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : '#1E4FD7';
}

export function buildOrderPdfHtml(data: AppData, order: ServiceOrder, options: PdfTemplateOptions = {}) {
  const company = data.company;
  const customer = data.customers.find((item) => item.id === order.customerId);
  const equipment = data.equipments.find((item) => item.id === order.equipmentId);
  const technician = data.technicians.find((item) => item.id === order.technicianId) ?? data.technicians.find((item) => item.isDefault);
  const items = data.items.filter((item) => item.orderId === order.id);
  const services = items.filter((item) => item.type === 'service');
  const parts = items.filter((item) => item.type === 'part');
  const photos = data.photos.filter((item) => item.orderId === order.id && item.includeInPdf);
  const customerSignature = data.signatures.find((item) => item.orderId === order.id && item.kind === 'customer');
  const primary = safeColor(data.pdfSettings.primaryColor);
  const technicianName = technician?.name ?? company?.responsibleName ?? 'Responsavel';
  const bodyMargin = options.useBodyMargins === false
    ? '0'
    : `${PDF_PAGE_MARGINS.top}px ${PDF_PAGE_MARGINS.right}px ${PDF_PAGE_MARGINS.bottom}px ${PDF_PAGE_MARGINS.left}px`;

  const rows = (target: typeof items) =>
    target
      .map(
        (item) => `
        <tr>
          <td>${escapeHtml(item.description)}</td>
          <td class="center">${item.quantity}</td>
          <td class="right">${formatMoney(item.unitPriceCents)}</td>
          <td class="right">${formatMoney(item.totalCents)}</td>
        </tr>`,
      )
      .join('');

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        @page { margin: 0; }
        body { font-family: Arial, sans-serif; color: #0f172a; margin: ${bodyMargin}; font-size: 11px; }
        .header { display: grid; grid-template-columns: 1fr 190px; gap: 18px; border-bottom: 2px solid ${primary}; padding-bottom: 14px; margin-bottom: 12px; }
        .brand { display: flex; gap: 12px; align-items: center; }
        .logo { width: 58px; height: 58px; border: 2px solid ${primary}; display: flex; align-items: center; justify-content: center; color: ${primary}; font-weight: 700; }
        h1, h2, h3, p { margin: 0; }
        h1 { font-size: 20px; color: #0f172a; }
        h2 { font-size: 12px; color: ${primary}; border-bottom: 1px solid #b7c3d6; padding-bottom: 5px; margin: 14px 0 8px; }
        .order-box { text-align: right; font-weight: 700; font-size: 16px; color: #0f172a; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; }
        .section { page-break-inside: avoid; break-inside: avoid; }
        .flow-section { page-break-inside: auto; break-inside: auto; }
        .final-section { margin-top: 14px; page-break-inside: avoid; break-inside: avoid; }
        .label { color: #334155; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        tr { page-break-inside: avoid; break-inside: avoid; }
        thead { display: table-header-group; }
        th { background: #eef4ff; color: #183b66; text-align: left; }
        td, th { border: 1px solid #cbd5e1; padding: 7px; }
        .right { text-align: right; }
        .center { text-align: center; }
        .summary { width: 260px; margin-left: auto; }
        .terms { font-size: 10px; line-height: 1.45; }
        .terms p { page-break-inside: avoid; break-inside: avoid; margin-bottom: 5px; }
        .signature-section { page-break-inside: avoid; break-inside: avoid; margin-top: 14px; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 12px; }
        .signature { border: 1px solid #cbd5e1; border-radius: 8px; height: 118px; padding: 10px 12px 8px; text-align: center; display: flex; flex-direction: column; justify-content: flex-end; break-inside: avoid; }
        .signature-image-wrap { height: 62px; display: flex; align-items: center; justify-content: center; margin-bottom: 5px; }
        .signature-img { max-width: 100%; width: 100%; height: 62px; object-fit: contain; display: block; }
        .signature-line { border-top: 1px solid ${primary}; padding-top: 7px; font-weight: 700; line-height: 1.25; }
        .footer { border-top: 1px solid #cbd5e1; margin-top: 18px; padding-top: 12px; text-align: center; color: #475569; font-size: 10px; }
        .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .photo { width: 100%; height: 92px; object-fit: cover; border: 1px solid #cbd5e1; border-radius: 6px; }
        .photo, .photo-grid, .summary, .footer { page-break-inside: avoid; break-inside: avoid; }
      </style>
    </head>
    <body>
      <section class="header section">
        <div class="brand">
          ${
            company?.logoUri
              ? `<img class="logo" src="${escapeHtml(company.logoUri)}" />`
              : '<div class="logo">OP</div>'
          }
          <div>
            <h1>${escapeHtml(company?.name ?? 'OrdemPro')}</h1>
            <p>${escapeHtml(company?.document ?? '')}</p>
            <p>${escapeHtml(company?.addressLine ?? '')} ${company?.city ? `- ${escapeHtml(company.city)}/${escapeHtml(company.state ?? '')}` : ''}</p>
            <p>Tel: ${escapeHtml(company?.phone ?? '-')} | WhatsApp: ${escapeHtml(company?.whatsapp ?? '-')}</p>
            <p>${escapeHtml(company?.email ?? '')}</p>
          </div>
        </div>
        <div class="order-box">
          ORDEM DE SERVICO<br />Nº ${order.shortCode.replace('OS-', '')}<br />
          <span style="font-size: 11px; font-weight: 400;">${escapeHtml(statusLabel(order.status))}</span>
        </div>
      </section>

      <section class="grid section">
        <div>
          <h2>DADOS DO CLIENTE</h2>
          <p><span class="label">Nome:</span> ${escapeHtml(customer?.name ?? '-')}</p>
          <p><span class="label">Telefone:</span> ${escapeHtml(customer?.phone ?? customer?.whatsapp ?? '-')}</p>
          <p><span class="label">E-mail:</span> ${escapeHtml(customer?.email ?? '-')}</p>
          <p><span class="label">Endereco:</span> ${escapeHtml(customer?.city ? `${customer.city}/${customer.state ?? ''}` : '-')}</p>
        </div>
        <div>
          <h2>DADOS DO EQUIPAMENTO</h2>
          <p><span class="label">Tipo:</span> ${escapeHtml(equipment?.type ?? (order.isServiceWithoutEquipment ? 'Servico sem equipamento' : '-'))}</p>
          <p><span class="label">Marca:</span> ${escapeHtml(equipment?.brand ?? '-')}</p>
          <p><span class="label">Modelo:</span> ${escapeHtml(equipment?.model ?? '-')}</p>
          <p><span class="label">Serie:</span> ${escapeHtml(equipment?.serialNumber ?? '-')}</p>
          <p><span class="label">Tecnico:</span> ${escapeHtml(technicianName)}</p>
        </div>
      </section>

      <section class="section">
        <h2>DEFEITO RELATADO</h2>
        <p>${escapeHtml(order.reportedIssue)}</p>
      </section>

      <section class="section">
        <h2>DIAGNOSTICO</h2>
        <p>${escapeHtml(order.diagnosis ?? '-')}</p>
      </section>

      <section class="section">
        <h2>SERVICO EXECUTADO</h2>
        <p>${escapeHtml(order.performedService ?? '-')}</p>
      </section>

      <section class="flow-section">
        <h2>SERVICOS</h2>
        <table><thead><tr><th>Descricao</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead><tbody>${rows(services) || '<tr><td colspan="4">Nenhum servico informado.</td></tr>'}</tbody></table>
      </section>

      <section class="flow-section">
        <h2>PECAS</h2>
        <table><thead><tr><th>Descricao</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead><tbody>${rows(parts) || '<tr><td colspan="4">Nenhuma peca informada.</td></tr>'}</tbody></table>
      </section>

      ${
        data.pdfSettings.showPhotos && photos.length
          ? `<section class="final-section"><h2>FOTOS DO SERVICO</h2><div class="photo-grid">${photos.map((photo) => `<img class="photo" src="${escapeHtml(photo.localUri)}" />`).join('')}</div></section>`
          : ''
      }

      ${
        data.pdfSettings.showValues
          ? `<section class="final-section"><h2>VALORES</h2>
            <table class="summary">
              <tr><td>Subtotal servicos</td><td class="right">${formatMoney(order.laborTotalCents)}</td></tr>
              <tr><td>Subtotal pecas</td><td class="right">${formatMoney(order.partsTotalCents)}</td></tr>
              <tr><td><strong>Total</strong></td><td class="right"><strong>${formatMoney(order.totalCents)}</strong></td></tr>
              <tr><td>Pago</td><td class="right">${formatMoney(order.paidCents)}</td></tr>
              <tr><td>Pendente</td><td class="right">${formatMoney(order.pendingCents)}</td></tr>
            </table></section>`
          : ''
      }

      <section class="final-section">
        <div>
          <h2>TERMOS E CONDICOES</h2>
          <div class="terms">
            <p>${escapeHtml(data.terms.warrantyText)}</p>
            <p>${escapeHtml(data.terms.serviceAuthorizationText)}</p>
            <p>${escapeHtml(data.terms.dataResponsibilityText)}</p>
          </div>
        </div>
      </section>
        ${
          data.pdfSettings.showSignatures
            ? `<section class="signature-section">
              <h2>ASSINATURAS</h2>
              <div class="signatures">
                <div class="signature">
                  <div class="signature-image-wrap">${customerSignature?.localUri ? `<img class="signature-img" src="${escapeHtml(customerSignature.localUri)}" />` : ''}</div>
                  <div class="signature-line">${escapeHtml(customerSignature?.signerName ?? customer?.name ?? 'Cliente')}<br />Cliente</div>
                </div>
                <div class="signature">
                  <div class="signature-image-wrap">${technician?.signatureUri ? `<img class="signature-img" src="${escapeHtml(technician.signatureUri)}" />` : ''}</div>
                  <div class="signature-line">${escapeHtml(technicianName)}<br />Tecnico/Responsavel</div>
                </div>
              </div>
            </section>
            `
            : ''
        }

      <div class="footer">
        ${escapeHtml(data.pdfSettings.footerText ?? 'Documento gerado pelo OrdemPro.')} - ${escapeHtml(formatDate(order.openedAt))}
      </div>
    </body>
  </html>`;
}
