"use client"
export const dynamic = "force-dynamic";

import { VendorSelected } from "@/lib/types";

function formatCpfCnpj(doc?: string) {
  const d = (doc ?? "").replace(/\D/g, "");
  if (d.length === 11) {
    return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  if (d.length === 14) {
    return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }
  return doc ?? "";
}

export function ContractHtml({ vendor }: { vendor: VendorSelected }) {
  function dataHojePorExtenso() {
    const hoje = new Date();
    return hoje.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  const isPf = vendor.person_type === "pf";

  // ✅ “Nome completo / Razão” exibida
  const displayName = isPf
    ? vendor.pf_full_name ?? ""
    : vendor.pj_legal_representative_name ?? "";

  // ✅ Marca (PF ou PJ)
  const brandName = isPf ? vendor.pf_brand_name ?? "" : vendor.pj_brand_name ?? "";

  // ✅ Documento principal do expositor (CPF ou CNPJ)
  const mainDoc = formatCpfCnpj(vendor.vendor_id);

  // ✅ Campos PJ
  const pjCnpj = formatCpfCnpj(vendor.pj_cnpj);
  const pjRepCpf = formatCpfCnpj(vendor.pj_legal_representative_cpf);

  // ✅ Contato
  const phone = vendor.contact_phone ?? "";
  const email = vendor.contact_email ?? "";

  // ✅ Endereço
  const addressFull = vendor.address_full ?? "";
  const city = vendor.address_city ?? "";
  const state = vendor.address_state ?? "";
  const zipcode = vendor.address_zipcode ?? "";

  // ✅ Financeiro
  const bankName = vendor.bank_name ?? "";
  const bankAgency = vendor.bank_agency ?? "";
  const bankAccount = vendor.bank_account ?? "";
  const pixKey = vendor.pix_key ?? "";
  const pixFavored = vendor.pix_favored_name ?? "";

  // ✅ Operacional (se existir no seu type futuro)
  const hasOperational =
    (vendor as any).structure_type ||
    (vendor as any).operation_name ||
    (vendor as any).electrical_load_watts ||
    (vendor as any).products_sold ||
    ((vendor as any).electrical_equipment?.length ?? 0) > 0;

  return (
    <div className="doc">
      {/* CONTRATO */}
      <h1 className="text-center text-lg font-bold">
        CONTRATO DE EXPOSIÇÃO DE PRODUTOS E ALIMENTOS
        <br />
        FESTIVAL GASTRONÔMICO BOTECAGEM
        <br />
        <br />
      </h1>

      <p className="whitespace-pre-wrap text-sm leading-relaxed">
        Pelo presente instrumento particular, de um lado <b>29.528.954 LUCAS AURELIO TEIXEIRA
          TOMILHEIRO</b>, pessoa jurídica de direito privado, inscrita no <b>CNPJ nº 29.528.954/0001-53</b>, com sede
        à <b>Rua João Antônio de Moraes, 473 – Jardim Sampaio – Itapecerica da Serra – SP – CEP 06851-430</b>,
        organizadora do <b>Festival Gastronômico Botecagem</b>, doravante denominada <b>CONTRATADA</b>, e, de
        outro lado, o <b>EXPOSITOR</b>, pessoa física ou jurídica <b>qualificada por meio da Ficha Cadastral
          constante do ANEXO I deste contrato</b>, a qual passa a integrá-lo para todos os fins de direito,
        doravante denominado <b>CONTRATANTE</b>, têm entre si justo e acordado o presente <b>Contrato de
          Participação como Expositor</b>, que se regerá pelas cláusulas e condições a seguir descritas.
        <br />_________________________________________________________________________________<br />
        <b> CLÁUSULA 1 – DO EVENTO </b> <br />
        1.1. O presente contrato tem por objeto a participação do CONTRATANTE como EXPOSITOR no <b> Festival Gastronômico Botecagem</b>, evento cultural e gastronômico. <br />
        1.2. O evento será realizado nas seguintes condições: - <b>Datas</b>: 17 e 18 de janeiro de 2026; - <b>Horários</b>: - Dia 17: das 11h às 21h; - Dia 18: das 10h às 20h; - <b>Local</b>: Largo da Batata – Avenida Brigadeiro Faria Lima, s/n – Pinheiros – São Paulo/SP; - <b>Área aproximada do evento</b>: 14.000 m².
        <br />_________________________________________________________________________________<br />
        <b> CLÁUSULA 2 – DO OBJETO </b><br />
        2.1. O presente contrato tem como objeto a cessão temporária de espaço e estrutura para exploração comercial de produtos gastronômicos pelo CONTRATADO durante o período do evento, conforme a modalidade de barraca escolhida.
        <br />_________________________________________________________________________________<br />
        <b> CLÁUSULA 3 – DA ESTRUTURA CONTRATADA</b><br />
        3.1. O EXPOSITOR poderá optar por uma das seguintes estruturas:<br />
        <b>a) Barraca Padrão – 3m x 3m (9 m²)</b> - Valor: taxa fixa de R$ 2.500,00 + 15% (quinze por cento) sobre o faturamento bruto. <br />
        <b>b) Barraca Dupla / Frente – 3m x 6m (18 m²)</b> - Valor: taxa fixa de R$ 4.500,00 + 15% (quinze por cento) sobre o faturamento bruto.<br />
        3.2. A estrutura inclui barraca, iluminação básica e pontos de eletricidade, conforme informado previamente pelo EXPOSITOR.
        <br />_________________________________________________________________________________<br />
        <div className="avoid-break">
          <b>CLÁUSULA 4 – DAS CONDIÇÕES FINANCEIRAS</b><br />
          4.1. O valor fixo referente à estrutura escolhida deverá ser pago antecipadamente, como condição indispensável para a confirmação da participação do EXPOSITOR no evento.<br />
          4.2. A taxa administrativa de <b>15%</b> incidirá sobre o faturamento bruto total do EXPOSITOR e será descontada diretamente do valor a ser repassado após o encerramento do evento. <br />
          4.3. A taxa administrativa destina-se a cobrir custos de produção, estrutura, operação, segurança, limpeza, marketing e administração do evento.<br />
          4.4. O pagamento da taxa fixa poderá ser realizado à vista ou parcelado em até <b>06 (seis) vezes no cartão de crédito</b>, conforme disponibilidade informada pela organização, onde as taxas de parcelamento serão de responsabilidade do EXPOSITOR.
          <br />_________________________________________________________________________________<br />
        </div>
        <b>CLÁUSULA 5 – DO SISTEMA DE PAGAMENTO E CONTROLE DE VENDAS</b><br />
        5.1. Todo o sistema de pagamentos do evento será fornecido e operado exclusivamente pelo CONTRATADO, incluindo cartão, PIX e demais meios eletrônicos disponibilizados.<br />
        5.2. É <b>expressamente proibido ao EXPOSITOR:</b> - Receber pagamentos em dinheiro diretamente do público; - Utilizar máquinas de cartão próprias; - Informar PIX próprio ao cliente.<br />
        5.3. O evento contará com caixa oficial para recebimento de dinheiro, no qual o público poderá adquirir cartão do evento para utilização nas barracas.<br />
        5.4. O EXPOSITOR terá acesso a um portal individual para acompanhamento do faturamento em tempo real, relatórios de vendas e apuração final.<br />
        5.5. O repasse dos valores devidos ao EXPOSITOR será realizado em até <b>02 (dois) dias úteis</b> após o encerramento do evento.<br />
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 6 – DAS OBRIGAÇÕES DO CONTRATADO</b><br />
        6.1. São obrigações do EXPOSITOR:<br />
        •	Utilizar exclusivamente o sistema oficial de pagamentos do evento;<br />
        •	Comercializar apenas os produtos previamente cadastrados;<br />
        •	Levar e expor seu próprio cardápio;<br />
        •	Manter o estande em funcionamento durante todo o horário do evento;<br />
        •	Manter o espaço limpo, organizado e em conformidade com as normas sanitárias e boas práticas de higiene;<br />
        •	Respeitar a carga elétrica informada previamente, sendo vedadas adaptações improvisadas;<br />
        •	Responsabilizar-se por seus equipamentos, produtos e pertences;<br />
        •	Manter postura profissional, cordial e respeitosa com o público, equipe organizadora e demais expositores.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 7 – DA MONTAGEM E DESMONTAGEM</b><br />
        7.1. A entrada de equipamentos, produtos e insumos será permitida a partir das <b>07h</b>, devendo toda a montagem estar concluída até as <b>11h</b>, horário de abertura do evento.<br />
        7.2. A desmontagem e retirada de equipamentos e produtos somente poderá ocorrer após o encerramento do evento e dispersão do público.<br />
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 8 – DA SEGURANÇA E RESPONSABILIDADE</b><br />
        8.1. A CONTRATADO disponibilizará equipe de segurança, limpeza e brigada de incêndio durante a montagem, realização e desmontagem do evento.<br />
        8.2. Não obstante, o EXPOSITOR é integralmente responsável por seus bens, produtos, equipamentos e equipe, não cabendo à CONTRATADO qualquer responsabilidade por perdas, furtos ou danos.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 9 – DA CONFIRMAÇÃO DE PARTICIPAÇÃO</b><br />
        9.1. A participação do EXPOSITOR somente será considerada confirmada após: - Aceite formal deste contrato e das regras operacionais do evento; - Pagamento integral do valor fixo; - Envio e validação da documentação obrigatória.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 10 – DO CANCELAMENTO E DESISTÊNCIA</b><br />
        10.1. O EXPOSITOR poderá solicitar o cancelamento ou desistência de sua participação no evento a qualquer momento, mediante comunicação formal e por escrito AO CONTRATADO.<br />
        10.2. Em caso de cancelamento ou desistência por iniciativa do EXPOSITOR, será aplicada <b>multa compensatória equivalente a 50% (cinquenta por cento) do valor total pago</b> até a data da solicitação.<br />
        10.3. Caso o valor pago até o momento da desistência seja inferior a 50% do valor total contratado, o EXPOSITOR autoriza desde já a retenção integral dos valores pagos, sem direito a reembolso.<br />
        10.4. A multa prevista nesta cláusula tem caráter compensatório, destinada a cobrir custos administrativos, operacionais, de produção e reservas de estrutura já realizadas pela CONTRATADO.<br />
        10.5. O não comparecimento do EXPOSITOR ao evento, total ou parcialmente, será considerado desistência tácita e implicará <b>multa equivalente a 100% (cem por cento) do valor total pago</b>, não sendo devido qualquer reembolso, independentemente do motivo alegado.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 11 – DAS PENALIDADES</b><br />
        11.1. O descumprimento de quaisquer cláusulas deste contrato ou das normas operacionais do evento poderá acarretar advertência, suspensão temporária ou desligamento imediato do EXPOSITOR, sem direito a reembolso dos valores pagos.<br />
        11.2. O desligamento do EXPOSITOR por infração contratual ou operacional não gera qualquer direito à restituição, indenização ou compensação financeira.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 12 – DAS DISPOSIÇÕES GERAIS</b><br />
        11.1. Este contrato tem caráter temporário e é válido exclusivamente para o período do evento.<br />
        11.2. Qualquer tolerância quanto ao descumprimento de cláusulas será considerada mera liberalidade, não constituindo novação.<br />
        11.3. Os casos omissos serão resolvidos pelo CONTRATADO, observadas a boa-fé e a legislação vigente.
        <br />_________________________________________________________________________________<br />
        <div className="avoid-break">
          <b>CLÁUSULA 13 – DA FORÇA MAIOR, CASO FORTUITO E DECISÕES DO PODER PÚBLICO</b><br />
          12.1. Consideram-se eventos de força maior ou caso fortuito aqueles imprevisíveis ou inevitáveis, alheios à vontade das partes, tais como, mas não se limitando a: chuvas intensas, tempestades, vendavais, alagamentos, incêndios, quedas de energia de grande proporção, pandemias, epidemias, greves, atos de terrorismo, comoção social, bem como atos, determinações ou restrições impostas por autoridades públicas, inclusive municipais, estaduais ou federais.<br />
          12.2. Na ocorrência de quaisquer dos eventos descritos no item 12.1 que resultem na interrupção, suspensão, adiamento ou cancelamento total ou parcial do evento, a CONTRATADO não poderá ser responsabilizada por perdas, danos, lucros cessantes ou indenizações de qualquer natureza.<br />
          12.3. Fica expressamente pactuado que, nos casos de chuva, intempéries climáticas ou condições meteorológicas adversas, ainda que impactem o fluxo de público ou o desempenho de vendas, não haverá devolução total ou parcial dos valores pagos, por se tratar de risco inerente a eventos realizados em área pública e a céu aberto.<br />
          12.4. Da mesma forma, decisões do poder público, negativas ou revogações de alvarás, autorizações, licenças, interdições do local, limitações de horário, restrições sanitárias ou de segurança não ensejarão reembolso dos valores pagos pelo EXPOSITOR.<br />
          12.5. Caso o evento seja adiado, a participação do EXPOSITOR será automaticamente transferida para a nova data, mantendo-se válidas todas as condições deste contrato, sem direito a restituição.<br />
          12.6. Na hipótese de cancelamento definitivo do evento por motivo de força maior ou decisão do poder público, os valores pagos poderão ser retidos pelo CONTRATADO para compensação de custos já incorridos, não sendo devida qualquer restituição.
          <br />_________________________________________________________________________________<br />
        </div>
        <b>CLÁUSULA 14 – DA LIMITAÇÃO DE RESPONSABILIDADE E INDENIZAÇÃO</b><br />
        13.1. O CONTRATADO não será responsável por quaisquer danos diretos ou indiretos, lucros cessantes, perda de faturamento, interrupção de negócios ou expectativas de resultado do EXPOSITOR.<br />
        13.2. O EXPOSITOR concorda em indenizar, isentar e manter O CONTRATADO livre de quaisquer reclamações, ações, perdas, danos, custos ou despesas, inclusive honorários advocatícios, decorrentes de sua atuação, produtos comercializados, conduta de seus funcionários ou terceiros sob sua responsabilidade.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 15 – DA AUSÊNCIA DE GARANTIAS E NÃO EXCLUSIVIDADE</b><br />
        14.1. O CONTRATADO não garante exclusividade de produtos, segmento ou categoria ao EXPOSITOR.<br />
        14.2. O CONTRATADO não garante público mínimo, volume de vendas, faturamento, retorno financeiro ou posicionamento específico do estande.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 16 – DA REALOCAÇÃO E ALTERAÇÃO DE LAYOUT</b><br />
        15.1. O CONTRATADO poderá, por razões técnicas, operacionais ou de segurança, alterar o layout do evento ou realocar estandes, sem que isso gere direito a reembolso ou indenização.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 17 – DAS OBRIGAÇÕES FISCAIS, TRABALHISTAS E SANITÁRIAS</b><br />
        16.1. O EXPOSITOR é exclusivamente responsável por todas as obrigações fiscais, tributárias, trabalhistas, previdenciárias e sanitárias relativas à sua operação, equipe e produtos.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 18 – DO USO DE IMAGEM E MARCA</b><br />
        17.1. O EXPOSITOR autoriza o uso gratuito de sua marca, nome comercial, imagens e vídeos captados durante o evento para fins institucionais, promocionais e publicitários do Festival.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 19 – DA CONFIDENCIALIDADE</b><br />
        18.1. Informações comerciais, operacionais ou estratégicas obtidas em razão deste contrato não poderão ser divulgadas sem autorização expressa do CONTRATADO.
        <br />_________________________________________________________________________________<br />
        <b>CLÁUSULA 20 – DA PROTEÇÃO DE DADOS (LGPD)</b><br />
        19.1. As partes comprometem-se a cumprir a Lei Geral de Proteção de Dados – Lei nº 13.709/2018.
        <br />_________________________________________________________________________________<br />
        <b> CLÁUSULA 21 – DA ASSINATURA ELETRÔNICA</b><br />
        20.1. As partes reconhecem como válida e eficaz a assinatura eletrônica ou digital deste contrato, realizada por meio de plataformas eletrônicas especializadas (tais como DocuSign, Clicksign, Zapsign ou similares), nos termos do art. 10 da Medida Provisória nº 2.200-2/2001.<br />
        20.2. A assinatura eletrônica produzirá os mesmos efeitos jurídicos da assinatura manuscrita, obrigando as partes ao fiel cumprimento de todas as cláusulas aqui pactuadas.
        <br />_________________________________________________________________________________<br />
        <b> CLÁUSULA 22 – DO FORO </b><br />
        12.1. Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato, com renúncia expressa de qualquer outro, por mais privilegiado que seja.<br />
        E, por estarem justas e contratadas, as partes firmam o presente contrato.
        <br />_________________________________________________________________________________<br /><br />

        São Paulo, {dataHojePorExtenso()}.
        <br />
        <br />
        CONTRATADO: 29.528.954 LUCAS AURELIO TEIXEIRA TOMILHEIRO
        <br />
        CNPJ: 29.528.954/0001-53
        <br />
        Endereço: Rua João Antônio de Moraes, 473 – Jardim Sampaio – Itapecerica da Serra – SP – CEP 06851-430
        <br />
        <br />
        CONTRATANTE (EXPOSITOR): {displayName || brandName || "______________________"}<br/>
         _________________________________________________________________________________
        <br />
        CPF/CNPJ: {mainDoc || "______________________"}

        <br /><br /><br />
      </p>


      <div className="page-break" />

      {/* FICHA CADASTRAL */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-center">
          <div className="text-sm font-extrabold tracking-tight text-zinc-900">FICHA CADASTRAL DO EXPOSITOR</div>
          <div className="mt-1 text-xs font-bold text-zinc-700">FESTIVAL GASTRONÔMICO BOTECAGEM</div>
        </div>

        {/* ===== DADOS DO EXPOSITOR ===== */}
        <div className="mt-6">
          <div className="text-[12px] font-extrabold text-zinc-900">DADOS DO EXPOSITOR</div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[11px] font-medium text-zinc-500">
                {isPf ? "Nome Completo" : "Responsável Legal"}
              </div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {displayName || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Nome da Marca</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {brandName || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">{isPf ? "CPF" : "CNPJ"}</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {mainDoc || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Inscrição Estadual / Municipal</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {(isPf ? "" : vendor.pj_state_registration) || "—"}
              </div>
            </div>

            {!isPf && (
              <>
                <div>
                  <div className="text-[11px] font-medium text-zinc-500">CPF do Responsável Legal</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {pjRepCpf || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-medium text-zinc-500">CNPJ</div>
                  <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                    {pjCnpj || "—"}
                  </div>
                </div>
              </>
            )}

            <div className="col-span-2">
              <div className="text-[11px] font-medium text-zinc-500">Endereço Completo</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {addressFull || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Cidade</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {city || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Estado / CEP</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {(state || "—") + "  •  " + (zipcode || "—")}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Telefone / WhatsApp</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {phone || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">E-mail</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900 break-words">
                {email || "—"}
              </div>
            </div>

            <div />
          </div>
        </div>

        {/* ===== DADOS FINANCEIROS ===== */}
        <div className="mt-6">
          <div className="text-[12px] font-extrabold text-zinc-900">DADOS FINANCEIROS PARA REPASSE</div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[11px] font-medium text-zinc-500">Banco</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {bankName || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Agência</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {bankAgency || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Conta</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {bankAccount || "—"}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-medium text-zinc-500">Chave PIX</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900 break-words">
                {pixKey || "—"}
              </div>
            </div>

            <div className="col-span-2">
              <div className="text-[11px] font-medium text-zinc-500">Nome do Favorecido</div>
              <div className="mt-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-semibold text-zinc-900">
                {pixFavored || "—"}
              </div>
            </div>
          </div>
        </div>

        {/* DECLARAÇÃO + ASSINATURA */}
        <div className="mt-6 border-t border-zinc-200 pt-4">
          <p className="text-[10.5px] leading-relaxed text-zinc-700">
            {vendor.terms_accepted ||
              "Declaro que as informações acima são verdadeiras e completas, responsabilizando-me civil e criminalmente por sua veracidade, bem como declaro ciência e concordância com o Contrato de Participação como Expositor do Festival Gastronômico Botecagem."}
          </p>

          <div className="mt-3 grid gap-2 text-[11px] text-zinc-800">
            <div>
              <span className="font-bold">Local e Data:</span> _________________________________________________
            </div>
            <div>
              <span className="font-bold">Assinatura do Expositor / Responsável Legal:</span>{" "}
              _________________________________________________
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
