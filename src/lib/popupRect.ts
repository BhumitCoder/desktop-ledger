/**
 * Where a floating panel goes so that it lands on the screen.
 *
 * The bill form's three popups — the item search, the change-item picker and
 * the last-prices list — are all portalled to <body> and positioned in
 * viewport coordinates taken from their input's own rect. That is the right
 * shape (they sit inside a horizontally scrollable table, which clips
 * anything absolutely positioned), but it was missing the only step that
 * matters on a phone: nothing checked the answer against the width of the
 * screen.
 *
 * So on a 390px phone the item dropdown, anchored to an input sitting at
 * x=140 in a 720px-wide table, opened at x=140 and ran 200px off the right
 * edge — the prices were simply not on the display. The last-prices popup,
 * which right-aligns itself by subtracting its own width, did the same thing
 * off the LEFT edge and lost its heading. Both were photographed at the
 * counter.
 *
 * Pure on purpose: the anchor and the viewport come in as plain numbers, so
 * every case below can be asserted without a browser.
 */

export type Anchor = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
};

export type Viewport = { width: number; height: number };

export type PopupPlacement = {
  left: number;
  width: number;
  /** Set when the panel hangs below its anchor. */
  top?: number;
  /** Set instead when it was flipped above — distance from the viewport's
   *  bottom edge, so the panel grows upward from the input rather than
   *  floating away from it. */
  bottom?: number;
  /** Never taller than the room it was given. */
  maxHeight: number;
};

export type PopupOptions = {
  /** Widen a narrow anchor up to this, room permitting. */
  minWidth?: number;
  /** Ignore the anchor's own width and ask for this instead. */
  preferredWidth?: number;
  /** Which edge to line up with. Right-aligned panels are the ones that used
   *  to walk off the left of a phone. */
  align?: "left" | "right";
  /** Breathing room kept at the screen edges. */
  margin?: number;
  /** Distance between the anchor and the panel. */
  gap?: number;
};

/** Below this there is not enough room to show a list, so prefer the other side. */
const USEFUL_HEIGHT = 168;

export function popupRect(
  anchor: Anchor,
  viewport: Viewport,
  opts: PopupOptions = {},
): PopupPlacement {
  const margin = opts.margin ?? 8;
  const gap = opts.gap ?? 4;

  /* A panel may be as wide as the screen less both gutters — and no wider,
     however wide the thing it is anchored to. A 720px table inside a 390px
     phone is exactly how a 300px dropdown ended up half off the display. */
  const room = Math.max(0, viewport.width - margin * 2);
  let width = opts.preferredWidth ?? anchor.width;
  if (opts.minWidth) width = Math.max(width, opts.minWidth);
  width = Math.min(width, room);

  let left = opts.align === "right" ? anchor.right - width : anchor.left;
  // Clamp last: an anchor scrolled off either side must still yield a panel
  // that is wholly on the screen.
  const rightmost = viewport.width - margin - width;
  left = Math.min(Math.max(left, margin), Math.max(margin, rightmost));

  const below = viewport.height - (anchor.bottom + gap) - margin;
  const above = anchor.top - gap - margin;

  /* Open upwards only when down is genuinely too tight AND up is better —
     which on a phone is what a keyboard does to the bottom half of the
     screen. Callers pass the visual viewport, so "the screen" here means the
     part of it the keyboard has not taken. */
  if (below < Math.min(USEFUL_HEIGHT, above) && above > below) {
    return {
      left,
      width,
      bottom: viewport.height - (anchor.top - gap),
      maxHeight: Math.max(0, above),
    };
  }
  return { left, width, top: anchor.bottom + gap, maxHeight: Math.max(0, below) };
}

/**
 * The part of the screen that is actually visible, in the coordinates
 * getBoundingClientRect and `position: fixed` both speak.
 *
 * On a phone the on-screen keyboard shrinks the visual viewport without
 * touching window.innerHeight, so measuring the old way put dropdowns
 * underneath the keyboard and called it "on screen".
 */
export function currentViewport(win: Window = window): Viewport {
  const vv = win.visualViewport;
  return {
    width: win.innerWidth,
    height: vv ? vv.height + vv.offsetTop : win.innerHeight,
  };
}
