import { Vendor } from "@/lib/types";
import { buildWhatsAppLink, qrUrlFor } from "@/lib/whatsapp";
import { renderMessage } from "../../service/message/renderMessage";
import { Modal } from "../ui/Modal";
import { MessageTokenPreview } from "../MessageTokenPreview";

export function WhatsappQrModal({
  vendor,
  message,
  open,
  onClose,
}: {
  vendor: Vendor | null;
  message: string;
  open: boolean;
  onClose: () => void;
}) {
  const rendered = vendor ? renderMessage(message, vendor) : "";

  const link = vendor ? buildWhatsAppLink(vendor.telefone, rendered) : "";
  const qr = vendor ? qrUrlFor(link, 320) : "";

  return (
    <Modal open={open} onClose={onClose} title="QR Code do WhatsApp">
      {vendor ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-sm font-semibold text-zinc-900">{vendor.nome_fantasia}</div>
            <div className="mt-1 text-xs text-zinc-600">Telefone: {vendor.telefone}</div>

            <div className="mt-4 flex items-center justify-center">
              <img src={qr} alt="QR WhatsApp" className="h-64 w-64 rounded-2xl border border-zinc-200 bg-white p-2" />
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Abrir WhatsApp
              </a>

              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(link);
                  } catch { }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Copiar link
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-900">Mensagem que vai junto</div>
            <div className="mt-1 text-xs text-zinc-500">Preview já com os dados do cadastro.</div>

            <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <MessageTokenPreview vendor={vendor} message={message} />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
