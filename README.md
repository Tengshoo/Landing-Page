# Memoira - The Modern Digital Wedding & Engagement Guestbook

A production-grade, responsive, luxury landing page for **Memoira** - replacing traditional paper guestbooks and expensive audio guestbook rentals.

Built with warm tactile luxury wedding editorial aesthetics (Cormorant Garamond serif display + Plus Jakarta Sans, warm ivory and champagne gold palette), zero dependencies, and fluid micro-interactions.

---

## Features

- **Hear Their Actual Voices:** Authentic voice notes from grandparents, friends, and family.
- **Unfiltered Candid Photos:** Spontaneous table selfies and moments the wedding photographer missed.
- **Thoughtful Written Blessings:** Long-form, comfortable wishes written from guests' seats.
- **Zero App Downloads:** Guests simply point their phone camera at the tabletop QR card.
- **Interactive Audio Waveform Simulator:** Playable audio preview with Web Audio API synthesis.
- **Interactive Guest Simulator:** Modal for prospective couples to test-drive voice recording, photo preview, and wish submission.
- **Permanent Keepsake Archive:** 30-day live celebration gallery + automated Google Drive master delivery.
- **Pricing in Malaysian Ringgit (RM) with RM20 Launch Discount:**
  - **Intimate (RM49, Was RM69 - Save RM20):** Up to 1,500 uploads (ROM & solemnization under 100 pax)
  - **Celebration (RM79, Was RM99 - Save RM20, Most Popular):** Up to 3,000 uploads (banquet 150-350 pax)
  - **Forever (RM99, Was RM119 - Save RM20):** Unlimited uploads (grand multi-session celebrations)

---

## Live Customer Demo (demo-guestbook Integration)

The live interactive demo showcase on this landing page connects directly to the customer configuration of [Tengshoo/demo-guestbook](https://github.com/Tengshoo/demo-guestbook):

- **Event:** Aliff & Ilya's Wedding Celebration (Majlis Perkahwinan)
- **Date & Venue:** Saturday, 28 November 2026 (28.11.2026) at Glasshouse at Seputeh, Kuala Lumpur
- **Hashtag:** #AliffIlyaForever
- **Live Guestbook Web App:** [https://demo.memoira.art/](https://demo.memoira.art/)
- **Live Projector Wall:** [https://demo.memoira.art/wall/](https://demo.memoira.art/wall/)
- **Photobooth Studio:** [https://demo.memoira.art/photobooth/](https://demo.memoira.art/photobooth/)
- **Admin Moderation:** [https://demo.memoira.art/admin/](https://demo.memoira.art/admin/) (PIN available on request)

---

## Tech Stack

- **HTML5:** Semantic, accessible markup with Open Graph meta tags and ARIA support.
- **CSS3:** Bespoke luxury styling, glassmorphism (`backdrop-filter`), CSS Grid/Flexbox, and responsive breakpoints.
- **JavaScript (Vanilla):** Audio synthesis, dynamic live feed injection, FAQ accordion, and mobile drawer transitions.

---

## Running Locally

Clone the repository and open `index.html` directly in your browser, or run a local HTTP server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve
```

Visit `http://localhost:3000` to preview.
