import { useCallback, useEffect } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";

/**
 * One step back — the way a back button is supposed to behave.
 *
 * Every detail page used to send you to its own list with a forward
 * navigation (`navigate({ to: "/items" })`). That looks the same and is not:
 *
 *  - It PUSHES a new history entry, so the browser's own Back button then
 *    returns to the detail page you just left. Press both a few times and you
 *    are stuck in a loop.
 *  - The list remounts from scratch, so a search you had typed is gone — the
 *    "I searched, opened a result, came back, and it had forgotten
 *    everything" complaint.
 *  - It ignores where you actually came from. Reaching an item from the
 *    global search on the dashboard and pressing back should return you to
 *    the dashboard, not drop you on the items list.
 *
 * `fallbackTo` is for the cases where there is genuinely nothing behind this
 * page: a link opened in a fresh tab, a bookmark, the print window's escape
 * hatch. Going "back" there would leave the app, so it goes to the list
 * instead.
 */
export function useGoBack(fallbackTo: string) {
  const router = useRouter();
  const navigate = useNavigate();
  const back = useCallback(() => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }
    navigate({ to: fallbackTo });
  }, [router, navigate, fallbackTo]);
  // A page with a back button is a page the back KEYS belong on. Installing
  // them here rather than at each call site is what keeps the two from
  // drifting apart — no screen can end up with the button and not the keys.
  useBackShortcuts(true, back);
  return back;
}

/** Is the user typing? Then no key is a navigation shortcut. */
export function isTyping(el: EventTarget | null): boolean {
  const node = el as HTMLElement | null;
  if (!node || !node.tagName) return false;
  const tag = node.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    node.isContentEditable === true ||
    // A listbox option or combobox has its own idea of what Escape means.
    !!node.closest?.('[role="combobox"],[role="listbox"],[contenteditable="true"]')
  );
}

/**
 * Go back one step from a detail page — by key, not just by the chevron.
 *
 * The client works on a MacBook and on Windows, so this answers what a person
 * reaches for on either: Escape and Backspace (the habit from every document
 * viewer), plus each platform's own browser-back chord — Alt+← on Windows,
 * Cmd+← on macOS. All of them do exactly ONE step, the same as the chevron;
 * none of them jump to the home page.
 *
 * It stays out of the way of everything that owns a key first: any typing, and
 * any open dialog — Escape there must close the dialog, and taking the key
 * would send the user back a page with the sheet still up.
 */
export function useBackShortcuts(enabled: boolean, back: () => void) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || isTyping(e.target)) return;
      if (document.querySelector('[role="dialog"],[role="alertdialog"]')) return;
      const arrowBack = e.key === "ArrowLeft" && (e.altKey || e.metaKey);
      const plainBack = (e.key === "Escape" || e.key === "Backspace") && !e.metaKey && !e.ctrlKey;
      if (!arrowBack && !plainBack) return;
      e.preventDefault();
      back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, back]);
}
