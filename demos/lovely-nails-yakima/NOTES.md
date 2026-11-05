# Lovely Nails Yakima: website + booking demo

Prepared Nov 4, 2026 for the follow-up with Lovely Nails Yakima. This is a warm lead, not a closed sale.

## How to open it

Double-click `index.html`. Everything runs from these files: no server, no install, no build step. The salon view is `index.html#salon`, linked in the footer as "Salon view: bookings" (`salon.html` also redirects there).

There is also a private artifact copy for clicking through in Claude: https://claude.ai/artifact/GRSBhsYtKdKoZuELsfhLW6. It starts visible to Marcos only.

Bookings are saved in the browser that made them. Show the demo on one device: make a booking, then open the salon view in the same browser.

## What was built

- **Home:** the hero photo (holiday snowflake nails), the "Lovely Nails" wordmark done in text and CSS, a "Walk-ins welcome" badge, Book Now and click-to-call buttons, today's hours with a live "open now" line, the address with a map link, the 4.5 Google and 4.4 Facebook ratings, and the full weekly hours.
- **What customers mention:** themes from the brief only (techs who take their time, hot stones and paraffin, friendly staff, kid-friendly chair, husbands welcome, ideas if you can't decide).
- **Services:** 12 services from the brief, each with a short plain description and a Book button that jumps straight to step 2 of the booking flow with that service picked.
- **Gallery:** 8 of the 9 photos from `photos/` (the pedicure/toe photo was removed at Marcos's request), resized for fast loading. Each has a caption and a tag (Nail art, Pedicure, Seasonal design). Tap a photo to see it bigger. No stock photos.
- **Reviews:** the 5 real quotes, word for word. "Golden nails for the win..." is labeled as the salon's own Instagram post, not as a customer review.
- **Book Now:** a 4-step booking flow (service, date and time, technician, details) and a confirmation screen with an `LN-XXXXXX` reference.
- **Contact:** address, a Google Maps link, tap-to-call, the Facebook page, hours, and the real logo cropped from the center tile of `fb-salon-1.jpg`.
- **Salon view (`index.html#salon`):** all bookings, newest first, with date, time, service, length, customer name, phone (tap to call or text), technician, notes and reference. It has Active, Cancelled and All tabs, and a two-tap cancel (Cancel booking, then Yes, cancel). It updates live when a booking comes in from another tab.
- A sticky Call / Book Now bar on phones. The yellow "To confirm" tags were removed at Marcos's request (Nov 4). The "Prices to confirm with the salon" box on Services was also removed. Only the small "price seen in a review" notes remain.

### Booking rules

- Slots are only inside open hours, and the whole appointment must end by closing time. With 60-minute appointments, Mon-Sat runs 9:00 AM to 6:30 PM and Sunday runs 10:00 AM to 5:00 PM.
- No past dates. Today only shows times at least 30 minutes from now, using Yakima (Pacific) time whatever the phone's time zone.
- Name, a 10-digit phone, a date and a time are required. Errors show in red under each field, never as pop-up alerts.
- The storage layer checks every booking again before saving, so out-of-hours or past bookings are rejected even if someone gets around the form.
- Technician choices are Any technician, Song, or Other. Other has an optional name box. No other staff names are listed.
- The page says walk-ins are welcome, booking is optional, and no payment is needed.

## Where to edit prices, durations, hours and services

Everything is in one file: **`js/config.js`**, marked "SITE SETTINGS (EDIT HERE)".

- `appointmentMinutes: 60` is the default length. To give one service its own length, set that service's `minutes` (for example `minutes: 90`).
- `services[].price`, `pricePrefix` and `priceNote` set each price. `price: null` shows "Ask the salon".
- `hours` holds the open and close times per day. Use `null` for a closed day.
- `slotStepMinutes`, `minLeadMinutes` and `bookingWindowDays` control how often slots start, the minimum notice for same-day bookings, and how far ahead people can book.
- `pricesConfirmed`, `hoursConfirmed` and `staffConfirmed` are a checklist only; they no longer change the page.
- `technicians` is the list for step 3. Add names here only after the salon confirms them.

## What the salon still needs to confirm

1. **Hours.** Google/Places says Mon-Sat 9:00-7:30 and Sun 10-6. Older listings say Mon-Sat 9-6 and Sunday closed.
2. **Prices.** The only prices shown come from reviews: dip $38, Shellac manicure with a small design $45, pedicure around $40. A May 2025 review says $40 was quoted and then $50 plus a $3 card fee was charged, so a clear official price list matters. Every other service shows "Ask the salon".
3. **Appointment lengths** per service (60 minutes is a placeholder) and how many clients they can take at once. The demo doesn't block double-booking a time slot.
4. **Staff names.** Is Song still there? Should other techs be listed by name? Does the salon want "Any / Song / Other" at all?
5. **Confirmations.** Do they want real SMS or email confirmations and reminders, and which phone or email should get new-booking alerts? Right now the page says the salon will confirm by phone or text.
6. **Services.** Are facials, waxing areas and kids pedicures all current? Any services missing?
7. **Instagram.** Is there an official handle to link? None is linked now.
8. **Photos.** Do they OK using these photos, and do they have newer ones?
9. **Second phone number.** (509) 469-3288 appears in one directory. Only 469-1712 is used here.
10. **Owner name.** None is shown. The salon is under new ownership, so ask whether they want an "about us" section.

## Moving bookings to a real backend later

The booking flow (`js/booking.js`) and the salon view (`js/salon.js`) never touch localStorage directly. They only call `LN.store`, which has four async methods:

```
LN.store.create(request) -> Promise<booking>
LN.store.list()          -> Promise<booking[]>  (newest first)
LN.store.cancel(ref)     -> Promise<booking>
LN.store.onChange(fn)
```

`js/booking-store.js` holds the demo version (`LocalStorageBookingStore`) and a commented-out `ApiBookingStore` that does the same thing over HTTP. To go live:

1. Stand up a small backend with a `bookings` table. Supabase, a Netlify Function with a database, or Google Sheets through Apps Script would all work.
2. On the server, re-run the same rules as `LN.core.validateBooking` (in `js/core.js`), check the slot isn't already full, generate the `LN-` reference, and save the same record shape as `buildRecord()`.
3. Send the customer an SMS or email confirmation from the server, and alert the salon.
4. Put the salon view behind a login. The `list` and `cancel` calls need an auth token.
5. Change the last line of `booking-store.js` to `window.LN.store = new ApiBookingStore(url, token);`. Nothing else changes.

Also remove `<meta name="robots" content="noindex">` and the black demo bar when the site goes live.

## Files

```
index.html            site (Home, Services, Gallery, Reviews, Book Now, Contact)
salon.html            redirects to index.html#salon (the salon bookings list)
css/styles.css        all styles, mobile first, palette in :root
js/config.js          EDIT HERE: prices, durations, hours, services, techs
js/core.js            hours, time slots, validation (shared)
js/booking-store.js   storage layer (localStorage now, API later)
js/site.js            renders hours, services, gallery lightbox
js/booking.js         booking flow
js/salon.js           salon view
img/                  resized salon photos, logo crop, favicon
```

## Testing done

I ran an automated browser test (Chromium, phone-sized screen, Pacific time) against the files as delivered. All 38 checks passed:

- Booked a **manicure for tomorrow** (Thu Nov 5, 2026, 10:00 AM, with Song) and got reference `LN-XXXXXX` on the confirmation screen with every detail correct.
- The booking showed up in the salon view with service, date, time, name and phone. I cancelled it, and it **disappeared from the Active list** and showed under Cancelled.
- Errors showed for a missing service, date, time, name and phone, and for a short phone number. No pop-up alerts were used.
- No past dates. Today had no slots earlier than 30 minutes from now. Mon-Sat slots ran 9:00 AM to 6:30 PM and Sunday 10:00 AM to 5:00 PM. The store refused a 7:00 PM booking.
- With browser storage blocked, booking and cancelling still work (kept in memory for that visit).
- Newest-first order and live updates between tabs worked. So did the gallery lightbox and the service-card Book buttons. There were no JavaScript errors.
