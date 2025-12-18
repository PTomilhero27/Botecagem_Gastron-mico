# Painel Botecagem (Next.js + Tailwind)

Painel clean para visualizar cadastros (dados fake) e gerar **QR Code por número** que abre o WhatsApp com mensagem pronta.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra: http://localhost:3000

## Estrutura

- `data/seed.ts` → dados fake (substitua pelos dados da sua planilha depois)
- `app/page.tsx` → página principal (orquestra componentes)
- `components/` → componentes separados (fácil manutenção)
- `lib/whatsapp.ts` → geração do link WhatsApp + QR

## Próximo passo (ligar na planilha)

Depois você pode integrar com:
- Google Sheets API
- Apps Script (publicar um endpoint JSON)
- Banco (Supabase / Firebase)
