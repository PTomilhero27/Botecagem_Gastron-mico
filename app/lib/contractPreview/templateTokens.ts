export type TokenResult = { value: string; valid: boolean };

export function resolveToken(token: string): TokenResult {
  const today = new Date();

  switch (token) {
    case "DATA_LONGA": {
      const formatted = today.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      return { value: `São Paulo, ${formatted}.`, valid: true };
    }

    default:
      return { value: `{{${token}}}`, valid: false };
  }
}
