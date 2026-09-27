# PremathoNIKU — Final Wedding Reception Website

This build contains the six finalized screens in this order:

1. Nithin & Kusuma — Join Our Wedding Reception
2. Charlotte — Where Our Story Began
3. Invitation — January 9, 2027 at 7:00 PM
4. Utsav Event Spaces + interactive View Map hotspot
5. Dress Code — An Evening to Shine
6. RSVP — interactive form connected to Google Sheets via the supplied Apps Script endpoint

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

The output is generated in `dist/` and is compatible with static hosting such as GitHub Pages.

## Transition model

All five scene-to-scene transitions use the locked V5 overlap behavior:

- incoming scene becomes visible first
- outgoing scene then fades in gradual steps
- both scenes coexist during the handoff
- outgoing scene reaches zero only after the incoming scene has fully taken over
- the persistent star layer remains above the full journey

This avoids blank/dark gaps between portrait screens on desktop.

## RSVP

The RSVP form submits to the Google Apps Script endpoint already configured for this project. The final background artwork remains visually unchanged; real form controls are positioned over the baked input areas.


## V6 RSVP fix
The RSVP screen now uses a single real HTML card with its own labels and controls over an opaque midnight panel. This intentionally covers the baked form elements in the reference artwork so fields, radio buttons, selects, and the submit button no longer visually overlap. All scene transitions remain unchanged from the locked V5 model.


V7 changes:
- Dress Code ↔ RSVP uses a quicker symmetric crossfade; all other locked transitions are unchanged.
- RSVP baked-in artwork controls are masked beneath the real HTML form to prevent duplicate Submit RSVP/UI, especially in the Not Attending state.
