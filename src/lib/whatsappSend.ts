import { auth } from "@/lib/firebase";
import { elementToPdfBase64 } from "@/lib/pdf";
import { sendWhatsAppMessageServerFn } from "@/lib/whatsappAdmin";

/** Renders a printable DOM node to PDF and sends it as a WhatsApp document
 * to the given phone number — the shared "Send WhatsApp" action used by
 * both the invoice page and the party statement page. Throws with a
 * user-facing message on failure (no phone saved, not connected, etc.) so
 * callers can just toast the error. */
export async function sendElementViaWhatsApp(opts: {
  el: HTMLElement;
  phone: string | undefined;
  message: string;
  fileName: string;
  orientation?: "portrait" | "landscape";
}): Promise<void> {
  const phone = opts.phone?.trim();
  if (!phone) {
    throw new Error("This party has no phone number saved — add one to send via WhatsApp.");
  }
  const callerIdToken = await auth.currentUser?.getIdToken();
  if (!callerIdToken) throw new Error("Not signed in");

  const pdfBase64 = await elementToPdfBase64(opts.el, opts.orientation ?? "landscape");
  await sendWhatsAppMessageServerFn({
    data: {
      callerIdToken,
      phone,
      message: opts.message,
      pdfBase64,
      fileName: opts.fileName.toLowerCase().endsWith(".pdf") ? opts.fileName : `${opts.fileName}.pdf`,
    },
  });
}
