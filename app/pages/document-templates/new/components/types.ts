export type ClauseInciso = {
  id: string;
  html: string;
};

export type ContractBlock =
  | {
      id: string;
      type: "clause";
      clauseNo: number;
      title: string;
      text: string;
      incisos: ClauseInciso[];
    }
  | {
      id: string;
      type: "text";
      text: string;
    };

export type BlockType = "clause" | "text" | "registration";
