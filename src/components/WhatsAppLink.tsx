/**
 * The WhatsApp link, everywhere it is shown.
 *
 * Three surfaces, one source: a dot in the header, a dialog behind it, and the
 * Settings card. They existed as one screen before — buried in Settings, owner
 * only — which is why a shop could go a day sending nothing before noticing.
 *
 * The wording is not written here. It comes from `lib/whatsappLink`, so the
 * tooltip, the dialog and the Settings card cannot end up describing the same
 * fault three different ways.
 */

import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, ShieldAlert, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { usePermissions } from "@/hooks/usePermissions";
import { useWhatsAppLink, useWhatsAppLinkStore } from "@/store/whatsappLink";
import { disconnectWhatsAppServerFn } from "@/lib/whatsappAdmin";
import {
  linkAdvice,
  linkHeadline,
  linkSeverity,
  needsScan,
  sinceLabel,
  type LinkSeverity,
} from "@/lib/whatsappLink";

const DOT: Record<LinkSeverity, string> = {
  ok: "bg-success",
  busy: "bg-muted-foreground animate-pulse",
  bad: "bg-destructive",
};

/**
 * The header dot.
 *
 * Shown even when everything is fine, on purpose: a light that only appears
 * when broken is one nobody can use to answer "is it working right now?" —
 * and that question, asked before a customer is standing there, is the entire
 * point of putting it in the header.
 */
export function WhatsAppStatusButton() {
  const { state, configured, ready, history } = useWhatsAppLink();
  const [open, setOpen] = useState(false);

  // A deployment with no WhatsApp service says nothing at all, rather than
  // showing a permanent red light for a feature this shop never bought.
  if (!configured || !ready) return null;

  const severity = linkSeverity(state);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground shrink-0"
        title={linkHeadline(state, history)}
        aria-label={linkHeadline(state, history)}
      >
        <MessageCircle className="h-4 w-4" />
        <span
          className={`absolute right-1 top-1 h-2 w-2 rounded-full ring-2 ring-card ${DOT[severity]}`}
        />
      </button>
      <WhatsAppLinkDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

/** Once per session, per browser. Deliberately session-scoped and not
 *  persisted: a shop that closes the app and comes back tomorrow with WhatsApp
 *  still broken does want telling again. */
const NUDGE_KEY = "bizdesk.whatsapp.nudged.v1";

/** A bill being written. Interrupting one is the fastest way to turn a helpful
 *  warning into the next complaint. */
const ON_A_FORM = new RegExp("/new$|/edit/");

/**
 * Tells the owner, once, that WhatsApp is not going to send anything today.
 *
 * Deliberately narrow, because a modal is the rudest control in the app:
 *
 *  - **Owner only.** Nobody else can scan the QR, so for a counter clerk this
 *    would be an interruption with no action attached to it.
 *  - **Once per session**, and never again after it is dismissed.
 *  - **Never over a half-written bill** — it waits for the next ordinary page
 *    rather than landing mid-sale.
 *  - **Never during a normal start.** It fires on a settled fault, so the
 *    thirty seconds a cold bridge legitimately takes stay silent.
 */
export function WhatsAppStartupNudge() {
  const { state, ready, configured } = useWhatsAppLink();
  const { isOwner } = usePermissions();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const fired = useRef(false);

  const broken = ready && configured && linkSeverity(state) === "bad";
  const busy = ON_A_FORM.test(pathname);

  useEffect(() => {
    if (fired.current || !isOwner || !broken || busy) return;
    try {
      if (sessionStorage.getItem(NUDGE_KEY)) return;
      sessionStorage.setItem(NUDGE_KEY, "1");
    } catch {
      // Storage blocked: show it once for this mount rather than every render.
    }
    fired.current = true;
    setOpen(true);
  }, [isOwner, broken, busy]);

  return <WhatsAppLinkDialog open={open} onOpenChange={setOpen} />;
}

export function WhatsAppLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </DialogTitle>
        </DialogHeader>
        <WhatsAppLinkPanel inDialog />
      </DialogContent>
    </Dialog>
  );
}

/**
 * The body: what the link is doing, and the one thing to do about it.
 *
 * `inDialog` only tells the panel to ask for a faster poll while it is on
 * screen — the QR has to look live while somebody is pointing a phone at it.
 */
export function WhatsAppLinkPanel({ inDialog = false }: { inDialog?: boolean }) {
  const { state, ready, history, phone, qr } = useWhatsAppLink();
  const { isOwner } = usePermissions();
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Asking for the QR is what makes the reading owner-shaped; only do it while
  // this is actually visible, so a background poll never carries a credential.
  useWatchWhileMounted(inDialog && isOwner);

  if (!ready) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" /> Checking WhatsApp…
      </div>
    );
  }

  const severity = linkSeverity(state);
  const since = sinceLabel(history.lastConnectedAt, Date.now());
  const showQr = isOwner && needsScan(state) && !!qr;

  const disconnect = async () => {
    if (!confirm("Disconnect WhatsApp? You'll need to scan a new QR code to reconnect.")) return;
    setDisconnecting(true);
    try {
      const callerIdToken = await auth.currentUser?.getIdToken();
      if (!callerIdToken) throw new Error("Not signed in");
      await disconnectWhatsAppServerFn({ data: { callerIdToken } });
      toast.success("WhatsApp disconnected");
      await useWhatsAppLinkStore.getState().refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const recheck = async () => {
    setRefreshing(true);
    try {
      await useWhatsAppLinkStore.getState().refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 rounded-md border px-3.5 py-3">
        <div
          className={
            "h-9 w-9 rounded-full flex items-center justify-center shrink-0 " +
            (severity === "ok"
              ? "bg-success-soft text-success"
              : severity === "busy"
                ? "bg-muted text-muted-foreground"
                : "bg-destructive/10 text-destructive")
          }
        >
          {severity === "ok" ? (
            <CheckCircle2 className="h-4.5 w-4.5" />
          ) : severity === "busy" ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <ShieldAlert className="h-4.5 w-4.5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{linkHeadline(state, history)}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {linkAdvice(state, history, isOwner)}
          </p>
          {/* Only worth saying while it is broken: on a working link it is
              "connected just now", which is what the green dot already says. */}
          {severity === "bad" && since && (
            <p className="mt-1 text-xs text-muted-foreground">{since}</p>
          )}
          {state === "connected" && phone && (
            <p className="mt-1 text-xs text-muted-foreground">as +{phone}</p>
          )}
        </div>
      </div>

      {showQr && (
        <div className="flex flex-col items-center gap-2 rounded-md border p-4">
          <img
            src={qr}
            alt="Scan with WhatsApp to link"
            className="h-52 w-52 rounded-md border p-2"
          />
          <p className="max-w-xs text-center text-xs text-muted-foreground">
            Open WhatsApp on the shop's phone → Settings → Linked Devices → Link a Device, then scan
            this code.
          </p>
        </div>
      )}

      {/* An owner told "scan the code" with no code on screen is stuck, so the
          wait is named and given a button rather than left as a blank space. */}
      {isOwner && needsScan(state) && !qr && (
        <div className="rounded-md border border-dashed px-3.5 py-4 text-center text-xs text-muted-foreground">
          Waiting for a QR code from the WhatsApp service…
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <Button size="sm" variant="outline" onClick={recheck} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Check again
        </Button>
        {isOwner && state === "connected" && (
          <Button size="sm" variant="destructive" onClick={disconnect} disabled={disconnecting}>
            {disconnecting ? "Disconnecting…" : "Disconnect"}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Marks the store "watched" for as long as this is on screen — which speeds
 *  the poll up and, for an owner, lets the reading carry the QR. */
function useWatchWhileMounted(active: boolean) {
  const setWatching = useWhatsAppLinkStore((s) => s.setWatching);
  useEffect(() => {
    if (!active) return;
    setWatching(true);
    return () => setWatching(false);
  }, [active, setWatching]);
}
