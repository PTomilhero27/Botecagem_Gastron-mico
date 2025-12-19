import html2pdf from "html2pdf.js";
import { VendorSelected } from "@/lib/types";

function esc(s: string) {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatCpfCnpj(v: string) {
  const s = (v ?? "").replace(/\D/g, "");
  if (s.length === 11) return s.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (s.length === 14) return s.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return v ?? "";
}

function formatPhone(v: string) {
  const s = (v ?? "").replace(/\D/g, "");
  if (s.length === 11) return s.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (s.length === 10) return s.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return v ?? "";
}

function tipoEstruturaChecks(tipo: string) {
  const t = (tipo ?? "").toLowerCase();
  return {
    is3x3: t.includes("3") && t.includes("x") && t.includes("3"),
    is3x6: t.includes("3") && t.includes("x") && t.includes("6"),
  };
}

function pre(text: string) {
  // preserva quebras e traços do contrato
  return `<div class="pre">${esc(text)}</div>`;
}

function buildHtml(v: VendorSelected) {
  const { is3x3, is3x6 } = tipoEstruturaChecks(v.tipo_estrutura);
  const equipamentos = (v.equipamentos_eletricos ?? []).join(", ");

  const contratoText = `CONTRATO DE EXPOSIÇÃO DE PRODUTOS E ALIMENTOS EM FEIRA GASTRONÔMICA
FESTIVAL GASTRONÔMICO BOTECAGEM

Pelo presente instrumento particular, de um lado 29.528.954 LUCAS AURELIO TEIXEIRA TOMILHEIRO, pessoa jurídica de direito privado, inscrita no CNPJ nº 29.528.954/0001-53, com sede à Rua João Antônio de Moraes, 473 – Jardim Sampaio – Itapecerica da Serra – SP – CEP 06851-430, organizadora do Festival Gastronômico Botecagem, doravante denominada CONTRATADA, e, de outro lado, o EXPOSITOR, pessoa física ou jurídica qualificada por meio da Ficha Cadastral constante do ANEXO I deste contrato, a qual passa a integrá-lo para todos os fins de direito, doravante denominado CONTRATANTE, têm entre si justo e acordado o presente Contrato de Participação como Expositor, que se regerá pelas cláusulas e condições a seguir descritas.

________________________________________
CLÁUSULA 1 – DO EVENTO
1.1. O presente contrato tem por objeto a participação do CONTRATANTE como EXPOSITOR no Festival Gastronômico Botecagem, evento cultural e gastronômico.
1.2. O evento será realizado nas seguintes condições:
- Datas: 17 e 18 de janeiro de 2026;
- Horários:
  - Dia 17: das 11h às 21h;
  - Dia 18: das 10h às 20h;
- Local: Largo da Batata – Avenida Brigadeiro Faria Lima, s/n – Pinheiros – São Paulo/SP;
- Área aproximada do evento: 14.000 m².

________________________________________
CLÁUSULA 2 – DO OBJETO
2.1. O presente contrato tem como objeto a cessão temporária de espaço e estrutura para exploração comercial de produtos gastronômicos pelo CONTRATADO durante o período do evento, conforme a modalidade de barraca escolhida.

________________________________________
CLÁUSULA 3 – DA ESTRUTURA CONTRATADA
3.1. O EXPOSITOR poderá optar por uma das seguintes estruturas:
a) Barraca Padrão – 3m x 3m (9 m²) - Valor: taxa fixa de R$ 2.500,00 + 15% (quinze por cento) sobre o faturamento bruto.
b) Barraca Dupla / Frente – 3m x 6m (18 m²) - Valor: taxa fixa de R$ 4.500,00 + 15% (quinze por cento) sobre o faturamento bruto.
3.2. A estrutura inclui barraca, iluminação básica e pontos de eletricidade, conforme informado previamente pelo EXPOSITOR.

________________________________________
CLÁUSULA 4 – DAS CONDIÇÕES FINANCEIRAS
4.1. O valor fixo referente à estrutura escolhida deverá ser pago antecipadamente, como condição indispensável para a confirmação da participação do EXPOSITOR no evento.
4.2. A taxa administrativa de 15% incidirá sobre o faturamento bruto total do EXPOSITOR e será descontada diretamente do valor a ser repassado após o encerramento do evento.
4.3. A taxa administrativa destina-se a cobrir custos de produção, estrutura, operação, segurança, limpeza, marketing e administração do evento.
4.4. O pagamento da taxa fixa poderá ser realizado à vista ou parcelado em até 06 (seis) vezes no cartão de crédito, conforme disponibilidade informada pela organização, onde as taxas de parcelamento serão de responsabilidade do EXPOSITOR.

________________________________________
CLÁUSULA 5 – DO SISTEMA DE PAGAMENTO E CONTROLE DE VENDAS
5.1. Todo o sistema de pagamentos do evento será fornecido e operado exclusivamente pelo CONTRATADO, incluindo cartão, PIX e demais meios eletrônicos disponibilizados.
5.2. É expressamente proibido ao EXPOSITOR:
- Receber pagamentos em dinheiro diretamente do público;
- Utilizar máquinas de cartão próprias;
- Informar PIX próprio ao cliente.
5.3. O evento contará com caixa oficial para recebimento de dinheiro, no qual o público poderá adquirir cartão do evento para utilização nas barracas.
5.4. O EXPOSITOR terá acesso a um portal individual para acompanhamento do faturamento em tempo real, relatórios de vendas e apuração final.
5.5. O repasse dos valores devidos ao EXPOSITOR será realizado em até 02 (dois) dias úteis após o encerramento do evento.

________________________________________
CLÁUSULA 6 – DAS OBRIGAÇÕES DO CONTRATADO
6.1. São obrigações do EXPOSITOR:
• Utilizar exclusivamente o sistema oficial de pagamentos do evento;
• Comercializar apenas os produtos previamente cadastrados;
• Levar e expor seu próprio cardápio;
• Manter o estande em funcionamento durante todo o horário do evento;
• Manter o espaço limpo, organizado e em conformidade com as normas sanitárias e boas práticas de higiene;
• Respeitar a carga elétrica informada previamente, sendo vedadas adaptações improvisadas;
• Responsabilizar-se por seus equipamentos, produtos e pertences;
• Manter postura profissional, cordial e respeitosa com o público, equipe organizadora e demais expositores.

________________________________________
CLÁUSULA 7 – DA MONTAGEM E DESMONTAGEM
7.1. A entrada de equipamentos, produtos e insumos será permitida a partir das 07h, devendo toda a montagem estar concluída até as 11h, horário de abertura do evento.
7.2. A desmontagem e retirada de equipamentos e produtos somente poderá ocorrer após o encerramento do evento e dispersão do público.

________________________________________
CLÁUSULA 8 – DA SEGURANÇA E RESPONSABILIDADE
8.1. A CONTRATADO disponibilizará equipe de segurança, limpeza e brigada de incêndio durante a montagem, realização e desmontagem do evento.
8.2. Não obstante, o EXPOSITOR é integralmente responsável por seus bens, produtos, equipamentos e equipe, não cabendo à CONTRATADO qualquer responsabilidade por perdas, furtos ou danos.

________________________________________
CLÁUSULA 9 – DA CONFIRMAÇÃO DE PARTICIPAÇÃO
9.1. A participação do EXPOSITOR somente será considerada confirmada após:
- Aceite formal deste contrato e das regras operacionais do evento;
- Pagamento integral do valor fixo;
- Envio e validação da documentação obrigatória.

________________________________________
CLÁUSULA 10 – DO CANCELAMENTO E DESISTÊNCIA
10.1. O EXPOSITOR poderá solicitar o cancelamento ou desistência de sua participação no evento a qualquer momento, mediante comunicação formal e por escrito AO CONTRATADO.
10.2. Em caso de cancelamento ou desistência por iniciativa do EXPOSITOR, será aplicada multa compensatória equivalente a 50% (cinquenta por cento) do valor total pago até a data da solicitação.
10.3. Caso o valor pago até o momento da desistência seja inferior a 50% do valor total contratado, o EXPOSITOR autoriza desde já a retenção integral dos valores pagos, sem direito a reembolso.
10.4. A multa prevista nesta cláusula tem caráter compensatório, destinada a cobrir custos administrativos, operacionais, de produção e reservas de estrutura já realizadas pela CONTRATADO.
10.5. O não comparecimento do EXPOSITOR ao evento, total ou parcialmente, será considerado desistência tácita e implicará multa equivalente a 100% (cem por cento) do valor total pago, não sendo devido qualquer reembolso, independentemente do motivo alegado.

________________________________________
(continua com as demais cláusulas do seu texto...)
`;

  const contrato = `
    <div class="section">
      ${pre(contratoText)}
      <div class="divider"></div>

      <div class="sign">
        <div>São Paulo, ____ de __________________ de 2026.</div>

        <div style="margin-top:10px;">
          <b>CONTRATADO:</b> 29.528.954 LUCAS AURELIO TEIXEIRA TOMILHEIRO<br/>
          <b>CNPJ:</b> 29.528.954/0001-53<br/>
          <b>Endereço:</b> Rua João Antônio de Moraes, 473 – Jardim Sampaio – Itapecerica da Serra – SP – CEP 06851-430
        </div>

        <div style="margin-top:10px;">
          <b>CONTRATANTE (EXPOSITOR):</b> ${esc(v.razao_social || v.nome_fantasia)}<br/>
          <b>CPF/CNPJ:</b> ${esc(formatCpfCnpj(v.cpf_cnpj))}
        </div>

        <div class="lines" style="margin-top:18px;">
          <div><b>Assinatura do CONTRATANTE:</b> _________________________________</div>
        </div>
      </div>
    </div>
  `;

  const ficha = `
    <h1>FICHA CADASTRAL DO EXPOSITOR<br/>FESTIVAL GASTRONÔMICO BOTECAGEM</h1>

    <h2>1) Dados do expositor</h2>
    <div class="grid">
      <div><div class="label">Razão Social / Nome Completo</div><div class="value">${esc(v.razao_social)}</div></div>
      <div><div class="label">Nome Fantasia</div><div class="value">${esc(v.nome_fantasia)}</div></div>

      <div><div class="label">CPF/CNPJ</div><div class="value">${esc(formatCpfCnpj(v.cpf_cnpj))}</div></div>
      <div><div class="label">Inscrição Estadual / Municipal</div><div class="value">${esc(v.inscricao_estadual_municipal)}</div></div>

      <div style="grid-column: 1 / -1;">
        <div class="label">Endereço Completo</div><div class="value">${esc(v.endereco_completo)}</div>
      </div>

      <div><div class="label">Cidade</div><div class="value">${esc(v.cidade)}</div></div>
      <div><div class="label">Estado / CEP</div><div class="value">${esc(v.estado)} — ${esc(v.cep)}</div></div>

      <div><div class="label">Telefone</div><div class="value">${esc(formatPhone(v.telefone))}</div></div>
      <div><div class="label">WhatsApp</div><div class="value">${esc(formatPhone(v.whatsapp))}</div></div>

      <div><div class="label">E-mail</div><div class="value">${esc(v.email)}</div></div>
      <div><div class="label">Responsável Legal</div><div class="value">${esc(v.responsavel_legal)}</div></div>

      <div><div class="label">CPF do Responsável Legal</div><div class="value">${esc(formatCpfCnpj(v.cpf_responsavel_legal))}</div></div>
      <div></div>
    </div>

    <h2 style="margin-top:14px;">2) Dados operacionais</h2>
    <div class="checks">
      <span class="check ${is3x3 ? "checked" : ""}"></span> Barraca 3m x 3m
      <span class="spacer"></span>
      <span class="check ${is3x6 ? "checked" : ""}"></span> Barraca 3m x 6m
    </div>

    <div class="grid" style="margin-top:10px;">
      <div><div class="label">Nome da Marca / Operação no Evento</div><div class="value">${esc(v.nome_operacao_evento)}</div></div>
      <div><div class="label">Produtos Comercializados</div><div class="value">${esc(v.produtos_comercializados)}</div></div>
      <div><div class="label">Carga Elétrica Necessária (watts)</div><div class="value">${esc(v.carga_eletrica_watts)}</div></div>
      <div><div class="label">Equipamentos Elétricos Utilizados</div><div class="value">${esc(equipamentos)}</div></div>
    </div>

    <h2 style="margin-top:14px;">3) Dados financeiros para repasse</h2>
    <div class="grid">
      <div><div class="label">Banco</div><div class="value">${esc(v.banco)}</div></div>
      <div><div class="label">Agência</div><div class="value">${esc(v.agencia)}</div></div>
      <div><div class="label">Conta Corrente / Poupança</div><div class="value">${esc(v.tipo_conta)}</div></div>
      <div><div class="label">Chave PIX</div><div class="value">${esc(v.chave_pix)}</div></div>
    </div>

    <p class="small muted" style="margin-top:14px;">
      Declaro que as informações acima são verdadeiras e completas, responsabilizando-me civil e criminalmente por sua veracidade, bem como declaro ciência e concordância com o Contrato de Participação como Expositor do Festival Gastronômico Botecagem.
    </p>

    <div class="lines" style="margin-top:12px;">
      <div class="small"><b>Local e Data:</b> __________________________________________</div>
      <div class="small" style="margin-top:6px;"><b>Assinatura do Expositor / Responsável Legal:</b> _________________________________</div>
    </div>
  `;

  return `
    <div class="doc">
      ${contrato}
      <div class="pagebreak"></div>
      ${ficha}
    </div>
  `;
}

export async function generateContractPdf(v: VendorSelected) {
  const host = document.createElement("div");

  // ✅ NÃO use opacity 0 (vira branco no html2canvas)
  host.style.position = "fixed";
  host.style.left = "0";
  host.style.top = "0";
  host.style.width = "794px"; // A4 approx
  host.style.background = "white";
  host.style.opacity = "0.01"; // ✅ precisa ser > 0
  host.style.pointerEvents = "none";
  host.style.zIndex = "2147483647";
  host.style.transform = "translateX(-120vw)"; // ✅ fora da tela sem sumir

  host.innerHTML = `
    <style>
      .doc { font-family: Arial, Helvetica, sans-serif; color:#111; }
      h1 { font-size: 16px; text-align:center; margin: 0 0 10px; }
      h2 { font-size: 12px; margin: 14px 0 6px; }
      p, li, .pre { font-size: 11px; line-height: 1.45; }
      .pre { white-space: pre-wrap; } /* ✅ mantém linhas do contrato */
      .muted { color:#444; }
      .small { font-size: 10px; }
      .divider { margin: 12px 0; border-top: 1px solid #ddd; }
      .pagebreak { page-break-after: always; }
      .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .label { font-size: 10px; color:#555; margin-bottom: 2px; }
      .value { font-size: 11px; font-weight: 600; }
      .checks { font-size: 11px; margin-top: 6px; }
      .check { display:inline-block; width: 12px; height:12px; border:1px solid #111; margin-right:6px; vertical-align: -2px; }
      .checked { background:#111; }
      .spacer { display:inline-block; width: 18px; }
      .section { padding: 2px 2px; }
      .lines { margin-top: 10px; }
    </style>
    ${buildHtml(v)}
  `;

  document.body.appendChild(host);

  // ✅ aguarda layout
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => setTimeout(r, 80));

  const filename = `Contrato_Botecagem_${(v.nome_fantasia || v.razao_social || "expositor")
    .replace(/\s+/g, "_")
    .slice(0, 40)}_${(v.cpf_cnpj ?? "").replace(/\D/g, "")}.pdf`;

  await (html2pdf() as any)
    .set({
      margin: [12, 12, 12, 12],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    } as any)
    .from(host)
    .save();

  host.remove();
}
