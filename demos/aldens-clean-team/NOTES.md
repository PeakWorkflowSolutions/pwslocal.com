# Alden's Clean Team: website + quote request demo

Prepared Nov 2026 for Alden's Clean Team LLC (Yakima, WA). Cold prospect: no call made yet, no demo promised.

## How to open it

Double-click `index.html`. Everything runs from these files: no server, no install, no build step.
The team's request list is at `index.html#requests` ("Team view: quote requests" in the footer, or "Requests" in the desktop menu).

Requests are saved in the browser that made them. For a demo, send a request and open the team view on the same device.

## What was built

- **Home:** team photo (Lyndsay, Dave and Leah), the name, "Relax! We'll Clean It For you", the tagline "Your satisfaction is our guarantee", a Get a Free Quote button, Call buttons for Dave and Leah, and the service area. Under it is a band with their own line, "Short on Time or just need help? Let us Clean it for you!"
- **Services:** all 10 services from the brief, each with a short plain description, "Call or message for a free quote" and a Get a quote button that opens the quote form with that service picked. No prices anywhere.
- **Photos:** the team photo with their business card, and the logo. The flyer is left out at Marcos's request because its living-room picture isn't their work. No stock photos.
- **Kind words:** the two real quotes word for word, attributed as the brief says (a commenter on a local Facebook recommendations thread; a neighbor's endorsement from Linda Larsen Eberle). The realtor shout-out from Becky Hosman is paraphrased, not quoted, and links to her Instagram video. No star rating anywhere.
- **Get a free quote:** 4 steps:
  1. Service.
  2. How often: one-time, weekly, every two weeks or monthly. Move-in/move-out, pre-sale and after-events are locked to one-time, with a note.
  3. Preferred date and home details: no past dates, quick-pick days, bedrooms, bathrooms and approximate size, all with a "Not sure" option and a note that the team confirms the price when they call. Office and garage ask only for size.
  4. Name and phone (required), email and notes (optional).

  The confirmation screen shows an `ACT-XXXXXX` reference and says the team will call back with a price and to confirm the day and time, and that no price is set until they call.
- **Contact:**
  - Dave and Leah, each with Call and Text buttons
  - both emails
  - service area
  - the address, with a note that the ZIP is to confirm (98903 on the state filing, 98902 on Yelp)
  - a Google Maps link that searches the street address without the ZIP
  - no Facebook or Instagram link
- **Team view (`#requests`):** all requests newest first, showing service, frequency, preferred date, customer, phone (Call and Text buttons), home details, email and notes. It has Mark contacted, a two-tap Cancel, and Open / Cancelled / All tabs, and it updates live when a request comes in from another tab.
- A sticky Call Dave / Free Quote bar on phones. Errors show on the page, never as pop-ups. If the browser blocks storage, the form still works for that visit.

## Where to edit things

Everything editable is in **`js/config.js`**, marked "SITE SETTINGS (EDIT HERE)":

- `quote`: all quote wording ("Call or message for a free quote", the confirmation message, the no-price line, the one-time-only note).
- `services`: names, descriptions, `oneTimeOnly`, and `askRooms` (whether to ask for bedrooms and bathrooms).
- `frequencies`, `bedrooms`, `bathrooms`, `squareFeet`: the choices in the form.
- `bookingWindowDays`: how far ahead people can pick a date (90).

Phone numbers, emails and the address also appear directly in `index.html`. Change them in both places.

## What the business still needs to confirm

1. **Prices.** None exist anywhere. Do they want prices on the site at all, or keep "free quote"? If prices go up, how do bedrooms, bathrooms and square footage affect them?
2. **Hours.** None found. None are shown.
3. **Address ZIP.** 98903 (state filing, cleaners10) or 98902 (Yelp). Also: do they want a home address on the site at all?
4. **Emails.** Is dave.alden1@gmail.com OK to show next to aldenscleanteam@gmail.com?
5. **Facebook Page URL and Instagram handle.** Neither was confirmed, so neither is linked.
6. **Confirmations.** Do they want real text or email alerts when a request comes in, and a confirmation text to the customer? Who should get them, Dave or Leah?
7. **Photos.** Before/after photos of real jobs would help a lot. None exist publicly.
8. **Services.** What does "home organization" cover? Is anything missing or no longer offered?
9. **Permission** to use the Becky Hosman shout-out and the two Facebook comments, and to link the Instagram video.
10. **Domain.** They own aldenscleanteam.org. The new site could replace the template site there. (The link to the old site was removed from the Contact section at Marcos's request.)

## Moving requests to a real backend later

The quote form (`js/quote.js`) and the team view (`js/requests.js`) only talk to `ACT.store` in `js/request-store.js`:

```
ACT.store.create(request)    -> Promise<record>
ACT.store.list()             -> Promise<record[]>  (newest first)
ACT.store.markContacted(ref) -> Promise<record>
ACT.store.cancel(ref)        -> Promise<record>
ACT.store.onChange(fn)
```

To go live:

1. Set up a small backend with a `requests` table. Supabase, a Netlify Function with a database, or a Google Sheet through Apps Script would all work.
2. On the server, re-run the same checks as `ACT.core.validateRequest`, generate the `ACT-` reference, and save the same record shape as `buildRecord()`.
3. Text or email the team when a request arrives.
4. Put the team view behind a login.
5. Change the last line of `request-store.js` to use the commented-out `ApiRequestStore`. Nothing else changes.

Also remove `<meta name="robots" content="noindex">` and the black demo bar when it goes live.

## Testing done

I ran an automated browser test (phone-sized screen, Pacific time) against these files. All 41 checks passed:

- Requested a **weekly home cleaning for next week** (3 bed, 2 bath, 1,500-2,000 sq ft) and got an `ACT-` reference with the right details. The confirmation says the team calls back with a price.
- It showed up in the team view. I **marked it contacted**, then **cancelled** it, and it was **gone from the Open list** and showed under Cancelled.
- Errors showed for a missing service, date, name and phone, a short phone number and a bad email. Past dates were refused. Move-out was locked to one-time, and the storage layer also refused a weekly move-out and a past date.
- No prices, no star rating, and no Facebook or Instagram links except the realtor's video. Both phones and both emails were linked. Newest-first order, live updates, the gallery, the service-card buttons and blocked storage all worked. No JavaScript errors and no pop-up alerts.
