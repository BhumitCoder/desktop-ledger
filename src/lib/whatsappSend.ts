import { auth } from "@/lib/firebase";
import { elementToPdfBase64 } from "@/lib/pdf";
import { sendWhatsAppMessageServerFn } from "@/lib/whatsappAdmin";
import { useWhatsAppLinkStore } from "@/store/whatsappLink";

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
  /** For thermal-format bills (80mm/58mm) — see elementToPdfBase64. */
  pageWidthMm?: number;
}): Promise<void> {
  const phone = opts.phone?.trim();
  if (!phone) {
    throw new Error("This party has no phone number saved — add one to send via WhatsApp.");
  }
  const callerIdToken = await auth.currentUser?.getIdToken();
  if (!callerIdToken) throw new Error("Not signed in");

  const pdfBase64 = await elementToPdfBase64(
    opts.el,
    opts.orientation ?? "landscape",
    opts.pageWidthMm,
  );
  /* Whatever happens next is the most reliable thing anyone will learn about
     this link all day. A polled status only proves the bridge process is
     running — it will answer "connected" from a host whose WhatsApp session
     died hours ago. A send that goes through proves the socket was alive a
     second ago, and one that fails proves it was not. So the outcome is fed
     back into the indicator either way, which is what stops the green dot
     being a decoration. */
  try {
    await sendWhatsAppMessageServerFn({
      data: {
        callerIdToken,
        phone,
        message: opts.message,
        pdfBase64,
        fileName: opts.fileName.toLowerCase().endsWith(".pdf")
          ? opts.fileName
          : `${opts.fileName}.pdf`,
      },
    });
  } catch (err) {
    useWhatsAppLinkStore.getState().noteSendResult(false);
    throw err;
  }
  useWhatsAppLinkStore.getState().noteSendResult(true);
}
