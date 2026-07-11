import { createServerFn } from "@tanstack/react-start";
import { requireOwner } from "@/lib/firebaseAdmin";

function serviceConfig(): { url: string; key: string } {
  const url = process.env.WHATSAPP_SERVICE_URL;
  const key = process.env.WHATSAPP_SERVICE_API_KEY;
  if (!url || !key) {
    throw new Error(
      "WhatsApp service isn't configured yet — set WHATSAPP_SERVICE_URL and " +
        "WHATSAPP_SERVICE_API_KEY as environment variables.",
    );
  }
  return { url, key };
}

export interface WhatsAppStatus {
  status: "waiting" | "qr" | "connected";
  qr?: string;
  phone?: string;
}

const validateCaller = (data: unknown): { callerIdToken: string } => {
  const d = data as Partial<{ callerIdToken: string }>;
  if (!d?.callerIdToken) throw new Error("Not authenticated");
  return { callerIdToken: d.callerIdToken };
};

export const getWhatsAppStatusServerFn = createServerFn({ method: "POST" })
  .validator(validateCaller)
  .handler(async ({ data }): Promise<WhatsAppStatus> => {
    await requireOwner(data.callerIdToken);
    const { url, key } = serviceConfig();
    const res = await fetch(`${url}/qr`, { headers: { "x-api-key": key } });
    if (!res.ok) throw new Error("Could not reach the WhatsApp service");
    return res.json();
  });

export const disconnectWhatsAppServerFn = createServerFn({ method: "POST" })
  .validator(validateCaller)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    await requireOwner(data.callerIdToken);
    const { url, key } = serviceConfig();
    const res = await fetch(`${url}/disconnect`, {
      method: "POST",
      headers: { "x-api-key": key },
    });
    if (!res.ok) throw new Error("Could not disconnect WhatsApp");
    return res.json();
  });
