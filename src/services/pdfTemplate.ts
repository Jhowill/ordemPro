import { AppData, ServiceOrder } from '@/types';
import { formatDate, formatMoney, statusLabel } from '@/utils/formatters';

export function buildOrderPdfHtml(data: AppData, order: ServiceOrder) {
  const company = data.company;
  const customer = data.customers.find((item) => item.id === order.customerId);
  const equipment = data.equipments.find((item) => item.id === order.equipmentId);
  const items = data.items.filter((item) => item.orderId === order.id);
  const services = items.filter((item) => item.type === 'service');
  const parts = items.filter((item) => item.type === 'part');
  const photos = data.photos.filter((item) => item.orderId === order.id && item.includeInPdf);
  const primary = data.pdfSettings.primaryColor;

  const rows = (target: typeof items) =>
    target
      .map(
        (item) => `
        <tr>
          <td>${item.description}</td>
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
        body { font-family: Arial, sans-serif; color: #0f172a; margin: 28px; font-size: 11px; }
        .header { display: grid; grid-template-columns: 1fr 190px; gap: 18px; border-bottom: 2px solid ${primary}; padding-bottom: 14px; }
        .brand { display: flex; gap: 12px; align-items: center; }
        .logo { width: 58px; height: 58px; border: 2px solid ${primary}; display: flex; align-items: center; justify-content: center; color: ${primary}; font-weight: 700; }
        h1, h2, h3, p { margin: 0; }
        h1 { font-size: 20px; color: #0f172a; }
        h2 { font-size: 12px; color: ${primary}; border-bottom: 1px solid #b7c3d6; padding-bottom: 5px; margin: 14px 0 8px; }
        .order-box { text-align: right; font-weight: 700; font-size: 16px; color: #0f172a; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
        .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; }
        .label { color: #334155; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; margin-top: 6px; }
        th { background: #eef4ff; color: #183b66; text-align: left; }
        td, th { border: 1px solid #cbd5e1; padding: 7px; }
        .right { text-align: right; }
        .center { text-align: center; }
        .summary { width: 260px; margin-left: auto; }
        .terms { font-size: 10px; line-height: 1.45; }
        .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 12px; }
        .signature { border: 1px solid #cbd5e1; border-radius: 8px; min-height: 92px; padding: 12px; text-align: center; }
        .line { border-top: 1px solid ${primary}; margin-top: 34px; padding-top: 8px; font-weight: 700; }
        .footer { border-top: 1px solid #cbd5e1; margin-top: 16px; padding-top: 10px; text-align: center; color: #475569; font-size: 10px; }
        .photo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .photo { width: 100%; height: 92px; object-fit: cover; border: 1px solid #cbd5e1; border-radius: 6px; }
      </style>
    </head>
    <body>
      <section class="header">
        <div class="brand">
          ${
            company?.logoUri
              ? `<img class="logo" src="${company.logoUri}" />`
              : '<div class="logo">OP</div>'
          }
          <div>
            <h1>${company?.name ?? 'OrdemPro'}</h1>
            <p>${company?.document ?? ''}</p>
            <p>${company?.addressLine ?? ''} ${company?.city ? `- ${company.city}/${company.state}` : ''}</p>
            <p>Tel: ${company?.phone ?? '-'} | WhatsApp: ${company?.whatsapp ?? '-'}</p>
            <p>${company?.email ?? ''}</p>
          </div>
        </div>
        <div class="order-box">
          ORDEM DE SERVICO<br />Nº ${order.shortCode.replace('OS-', '')}<br />
          <span style="font-size: 11px; font-weight: 400;">${statusLabel(order.status)}</span>
        </div>
      </section>

      <section class="grid">
        <div>
          <h2>DADOS DO CLIENTE</h2>
          <p><span class="label">Nome:</span> ${customer?.name ?? '-'}</p>
          <p><span class="label">Telefone:</span> ${customer?.phone ?? customer?.whatsapp ?? '-'}</p>
          <p><span class="label">E-mail:</span> ${customer?.email ?? '-'}</p>
          <p><span class="label">Endereco:</span> ${customer?.city ? `${customer.city}/${customer.state}` : '-'}</p>
        </div>
        <div>
          <h2>DADOS DO EQUIPAMENTO</h2>
          <p><span class="label">Tipo:</span> ${equipment?.type ?? (order.isServiceWithoutEquipment ? 'Servico sem equipamento' : '-')}</p>
          <p><span class="label">Marca:</span> ${equipment?.brand ?? '-'}</p>
          <p><span class="label">Modelo:</span> ${equipment?.model ?? '-'}</p>
          <p><span class="label">Serie:</span> ${equipment?.serialNumber ?? '-'}</p>
        </div>
      </section>

      <h2>DEFEITO RELATADO</h2>
      <p>${order.reportedIssue}</p>

      <h2>DIAGNOSTICO</h2>
      <p>${order.diagnosis ?? '-'}</p>

      <h2>SERVICOS</h2>
      <table><thead><tr><th>Descricao</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead><tbody>${rows(services) || '<tr><td colspan="4">Nenhum servico informado.</td></tr>'}</tbody></table>

      <h2>PECAS</h2>
      <table><thead><tr><th>Descricao</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th></tr></thead><tbody>${rows(parts) || '<tr><td colspan="4">Nenhuma peca informada.</td></tr>'}</tbody></table>

      ${
        data.pdfSettings.showPhotos && photos.length
          ? `<h2>FOTOS DO SERVICO</h2><div class="photo-grid">${photos.map((photo) => `<img class="photo" src="${photo.localUri}" />`).join('')}</div>`
          : ''
      }

      <h2>VALORES</h2>
      <table class="summary">
        <tr><td>Subtotal servicos</td><td class="right">${formatMoney(order.laborTotalCents)}</td></tr>
        <tr><td>Subtotal pecas</td><td class="right">${formatMoney(order.partsTotalCents)}</td></tr>
        <tr><td><strong>Total</strong></td><td class="right"><strong>${formatMoney(order.totalCents)}</strong></td></tr>
        <tr><td>Pendente</td><td class="right">${formatMoney(order.pendingCents)}</td></tr>
      </table>

      <section class="grid">
        <div>
          <h2>TERMOS E CONDICOES</h2>
          <div class="terms">
            <p>${data.terms.warrantyText}</p>
            <p>${data.terms.serviceAuthorizationText}</p>
            <p>${data.terms.dataResponsibilityText}</p>
          </div>
        </div>
        <div>
          <h2>ASSINATURAS</h2>
          <div class="signatures">
            <div class="signature"><div class="line">${customer?.name ?? 'Cliente'}<br />Cliente</div></div>
            <div class="signature"><div class="line">${company?.responsibleName ?? 'Responsavel'}<br />Tecnico/Responsavel</div></div>
          </div>
        </div>
      </section>

      <div class="footer">
        ${data.pdfSettings.footerText ?? 'Documento gerado pelo OrdemPro.'} - ${formatDate(order.openedAt)}
      </div>
    </body>
  </html>`;
}
