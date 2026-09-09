# WhatsApp: making a flaky link behave professionally

The shop's complaint, in their words: *"sometimes it throws waiting message,
this is not professional."* They are right, and the screen is the smaller half
of the problem.

## What is actually there

WhatsApp here is **not an API**. It is a QR-linked device: an external bridge
service (`WHATSAPP_SERVICE_URL`) that holds a WhatsApp Web session on behalf of
the shop's phone. Three endpoints — `/qr`, `/disconnect`, `/send` — behind an
`x-api-key`.

A linked device drops for reasons no amount of code in this repo can prevent:

- the shop's phone is offline ~14 days and WhatsApp force-unlinks it
- the bridge host restarts with its session credentials on temporary disk
- WhatsApp logs the device out, or somebody taps "log out from all devices"

**So the goal is not "never drop".** The goal is: when it drops, the shop finds
out immediately, in one glance, and fixes it in two clicks — and no bill is
ever silently lost in the meantime.

## The three faults, precisely

1. **`waiting` is a bucket.** Booting, reconnecting, logged-out and
   never-linked are one indistinguishable state, rendered by
   `WhatsAppSection.tsx` as a spinner reading *"Starting WhatsApp
   connection…"* — with no timeout. It spins forever and advises nothing.

2. **Status is invisible.** It is rendered in exactly one place, inside an
   owner-only card on the Settings page. The counter learns WhatsApp is dead
   at 6pm with a customer waiting, never at 9am when it could be fixed.

3. **A failed send is a lost bill.** `sendElementViaWhatsApp` is a single
   `fetch`. Socket down at that instant → throw, toast, and nothing else. No
   retry, no record, and nobody can answer "which customers didn't get theirs?"

## The constraint that shapes everything

**The bridge service is a separate codebase and is not in this repo.** Every
phase below is therefore designed to land entirely in this repo, deriving what
it needs from the three endpoints that already exist. Bridge-side work
(auto-reconnect, a real heartbeat) is real and worth doing, but it is Phase 6
and nothing before it depends on it.

## Two ideas that make this work without touching the bridge

**A. The state machine is client-side.** `/qr` returns three states; a shop
needs six. The missing information is not in the response — it is in *time* and
*history*, both of which the client has:

| bridge says | seen connected before? | watched for | → shown as |
| --- | --- | --- | --- |
| `connected` | – | – | **connected** (green) |
| `qr` | no | – | **never linked** (red, offers QR) |
| `qr` | yes | – | **dropped** (red, offers QR) |
| `waiting` | – | < 30s | **starting** (grey) |
| `waiting` | yes | ≥ 30s | **dropped** (red) |
| `waiting` | no | ≥ 30s | **never linked** (red) |
| unreachable | – | ≥ 30s | **unreachable** (red) |

**B. The send result is ground truth, and outranks the status.** A sleeping
bridge answers `/qr` cheerfully while WhatsApp is long gone, so a green light
sourced only from polling is a light that lies. A `/send` that succeeds proves
the socket was alive one second ago; a `/send` that fails proves it was not.
Both feed straight back into the indicator. This is what makes the dot
*accurate* rather than merely present.

## Phases

Ordered so that each one is useful alone, and so nothing shows a status before
that status is trustworthy.

### Phase 0 ✅ — the state machine, as a pure function

`src/lib/whatsappLink.ts`: `deriveLinkState(bridge, history, now)` — the table
above and nothing else. No React, no fetch, no clock of its own. It is the
piece most worth testing and the piece most likely to be reasoned about wrongly
at 6pm, so it gets to be pure.

Also here: the copy. `linkHeadline(state)` and `linkAdvice(state)` — one place
where the shop's wording lives, so "Disconnected — scan to relink" cannot drift
between the header tooltip, the modal and Settings.

### Phase 1 ✅ — status without handing out the QR

`getWhatsAppStatusServerFn` currently calls `requireOwner`. Put the indicator
in the header as-is and it throws for every staff user on every page.

Split it in two:

| server fn | guard | returns |
| --- | --- | --- |
| `getWhatsAppLinkStateServerFn` | `requireActiveUser` | state + phone, **`qr` stripped** |
| `getWhatsAppStatusServerFn` | `requireOwner` (unchanged) | state + phone + `qr` |

**The QR is a login.** Anyone who scans it gets full control of the shop's
WhatsApp account. It must never be sent to a non-owner's browser, and stripping
it server-side — rather than merely not rendering it — is the difference
between a permission and a decoration.

### Phase 2 ✅ — one poller for the whole app

`src/store/whatsappLink.ts`: a single Zustand store, one timer, shared by every
subscriber. Not a `useEffect` per component — the header indicator lives on
every page, and a poll per mount would multiply by tabs and tills.

Cadence, so the bridge is only asked when someone is actually looking:

- **60s** when connected — nothing is changing
- **15s** when broken — somebody is probably fixing it
- **3s** while the modal is open on a QR — it needs to look fresh
- **immediately** on tab focus, and after every send attempt
- **never** while the tab is hidden

### Phase 3 ✅ — the indicator and the modal

A small WhatsApp glyph in `Topbar.tsx` with a status dot: **green** connected,
**grey** starting, **red** everything else. Tooltip says the headline. Click
opens the reconnect modal.

Owner sees the QR and Disconnect. Staff see the state and *"ask the owner to
relink"* — because staff cannot fix this, and a screen that implies otherwise
wastes their time at the counter.

Mobile: the header is a three-column grid and already tight, so the dot rides
next to the existing search icon rather than claiming a new slot.

### Phase 4 ✅ — the nudge, kept on a short leash

If the link is broken when the app opens, the owner gets the modal once.

**Owner only, once per session, dismissible, and never while a bill is open.**
A modal in the face of a counter clerk who cannot fix it — mid-sale, at 9am —
is its own kind of unprofessional, and would be a worse complaint than the one
being fixed here.

### Phase 5 ⏳ NOT BUILT — the outbox (the phase that stops bills being lost)

A failed send stops being a dead end:

> *"Queued — will send when WhatsApp reconnects."*

Queued in IndexedDB on the till that made it: `{ html, phone, message,
fileName, invoiceNumber, queuedAt, attempts }`. **The HTML, not the PDF** —
`buildPrintableHtml(el)` already produces exactly this string, it is a fraction
of the size of the rendered PDF, and re-rendering at send time costs nothing we
were not already paying.

Flushed one at a time when the link comes back, oldest first, with backoff and
an attempt cap. The header dot carries the count. Settings lists what is
waiting, with **Send now** and **Cancel** per row.

This phase is where "I don't want this nonsense" actually gets answered: the
counter stops babysitting the connection, because a bill entered is a bill that
will go.

### Phase 6 ⏳ NOT BUILT — the bridge service (separate repo, separate change)

Not needed by anything above, and listed so it is not forgotten:

- **persist the session to durable storage** — a volume, S3, or Firestore. If
  the session lives on container disk, every deploy costs a QR scan and every
  phase above is polish over a hole that reopens.
- **auto-reconnect from stored credentials** on socket close, with backoff.
  This is a *reconnect*, not a re-link: no QR, and the shop never notices.
- **a real heartbeat**, so `connected` means the socket answered, not that the
  process is running.
- optionally a **4am socket refresh** — quiet hours, from saved credentials.

> **Rejected: disconnecting on a timer.** `/disconnect` throws the session
> away; the app's own confirm text says *"you'll need to scan a new QR code to
> reconnect."* On a 10-hour schedule that is two or three forced QR scans a
> day, forever. The problem it is reaching for — a socket that is dead while
> claiming otherwise — is solved by the heartbeat and auto-reconnect above,
> neither of which asks anyone to pick up the phone.

## Testing

Phase 0 is pure and gets the full table above as assertions, including the two
that are easy to get backwards: `qr` **with** history is a relink and `qr`
**without** is first-time setup, and `waiting` at 29s is still *starting* while
at 31s it is *dropped*.

Mutation-tested as usual: break the grace period, break the history check,
break the QR-stripping — each must turn a **named** assertion red. The
QR-stripping mutation matters most, because a test that passes when a staff
user receives the QR is a test that is not protecting anything.

## Rollout

Branch `whatsapp-reliability`, off `main`. **Nothing goes to `main` until the
whole thing is verified**, because `main` is what the two live shops run and it
holds real data.

Phases 0–4 touch no money, no stock and no document. The only write anywhere in
them is a `localStorage` note of when the link was last seen alive. Phase 5
introduces a queue, which is new state and gets its own look before it ships.

`APP_VERSION` is bumped on the deploy, per the repo rule — a fix the shop
cannot see the version of is a fix they will report again.

## Where this got to

**Phases 0–4 are built, on branch `whatsapp-reliability`, not merged.**

Verified: 105,382 unit assertions and 577 screen assertions pass; `tsc` and
`eslint` clean over `src` and `tests`. Nine mutants — the grace period, the
QR short-circuit, the history split, the unreachable branch, the staff advice,
the future timestamp, and three separate ways of leaking the QR to a staff
browser — were each introduced and each killed a **named** assertion.

The screen suite renders through the real route tree, so `AppShell` → `Topbar`
→ the new indicator mount in a real browser on all 577 of them with no
uncaught page errors.

**Not verified locally: `npm run build`.** A stale `.vercel/output` from an
earlier run is held open by another node process on this machine and cannot be
deleted or moved, so the production build cannot complete here. Nothing
suggests a code fault — `tsc` is clean and every component mounts in the
browser suite — but it is unproven and should be watched on the first deploy.

**Still true, and still nothing to do with this branch:** as long as the link
is a QR-linked device it will keep dropping. Phases 0–4 make that visible and
fast to fix. Phase 5 stops it costing a bill. Only Phase 6 makes it rarer.
