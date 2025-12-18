export type Vendor = {
  timestamp: string;
  nome_empresarial: string;
  nome_fantasia: string;
  cnpj: string;
  redes_sociais: string;
  responsavel: string;
  telefone: string;
  tipo_operacao: string;
  produto_principal: string;
  ticket_medio: string;
  ja_participou: string;
  tenda: string;
  equipe: string;
  energia: "Sim" | "Não";
  equipamentos: string[];
  gas: "Sim" | "Não";
  observacoes: string;
};
