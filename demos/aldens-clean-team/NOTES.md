# Alden's Clean Team: website + quote requests to a Google Sheet

Prepared Nov 2026 for Alden's Clean Team LLC (Yakima, WA). Approved by the business for a demo.

## How to open it

Double-click `index.html`. Everything runs from these files: no server, no install, no build step.

Requests go to a Google Sheet once it's connected (see **`google-sheet/SETUP.md`**). Until then the form runs in demo mode: it works end to end, and the confirmation says nothing was sent.

## What was built

- **Home:** team photo (Lyndsay, Dave and Leah), the name, "Relax! We'll Clean It For you", the tagline "Your satisfaction is our guarantee", a Request a Free Quote Visit button, Call buttons for Dave and Leah, and the service area. Under it is a band with their own line, "Short on Time or just need help? Let us Clean it for you!"
- **Services:** all 10 services from the brief, each with a short plain description, "Free quote visit" and a Request a visit button that opens the form with that service picked. No prices anywhere.
- **Photos:** the team photo and the logo. The flyer is left out at Marcos's request.
- **Kind words:** the two real quotes word for word, attributed as the brief says. The realtor shout-out from Becky Hosman is paraphrased and links to her Instagram video. No star rating.
- **Request a free quote visit:** 5 steps:
  1. Service.
  2. How often. Move-in/move-out, pre-sale and after-events are locked to one-time.
  3. The place: street and city (required), plus bedrooms, bathrooms and size. Office and garage ask only for size.
  4. When: a preferred day (quick-pick or date picker, no past days) and a time of day (Morning, Afternoon, Evening or Any time). There's no calendar; the team calls to set the exact time.
  5. Name and phone (required), email and notes (optional).

  The confirmation screen shows an `ACT-XXXXXX` reference and everything they entered. It says Dave, Lyndsay or Leah will call or text to set up a time to come see the job and give a price, and that no price is set until then.
- **Google Sheet:** each request becomes one row on a **Requests** tab. The columns are Received, Reference, Service, How often, Preferred day, Time of day, Street, City, Bedrooms, Bathrooms, Size, Name, Phone, Email and Notes. Three more columns are for the team to fill in: **Status** (starts as "New"), **Who's going** and **Price quoted**. An email notice for each new request is optional.
- **Contact:** Dave and Leah with Call and Text buttons, both emails, service area, the address (with a ZIP-to-confirm note) and a Google Maps link. No Facebook, Instagram or old-website links.
- A sticky Call Dave / Free Quote bar on phones. Errors show on the page, never as pop-ups. If the sheet can't be reached, the customer gets a clear "didn't go through" message with Dave's number, never a false confirmation.

## Where to edit things

Everything editable is in **`js/config.js`**, marked "SITE SETTINGS (EDIT HERE)":

- `sheet.url`: the Apps Script Web app URL. Empty means demo mode.
- `quote`: all wording (the confirmation message, the no-price line, the demo-mode note).
- `timesOfDay`: the time-of-day choices.
- `bookingWindowDays`: how far ahead people can pick a day (60).
- `services`, `frequencies`, `bedrooms`, `bathrooms`, `squareFeet`: the form's choices.

In the Apps Script (`google-sheet/Code.gs`):
- `NOTIFY_EMAIL`: the email notice.
- `COLUMNS`: the sheet's columns.

Phone numbers, emails and the address also appear directly in `index.html`.

## What the business still needs to confirm

1. **Which Google account owns the sheet,** and who should get the new-request email.
2. **Prices.** None exist anywhere. They're given after seeing the job.
3. **Service area.** Which towns will they drive to for a quote visit?
4. **Address ZIP.** 98903 (state filing) or 98902 (Yelp). Do they want a home address on the site at all?
5. **Emails.** Is dave.alden1@gmail.com OK to show next to aldenscleanteam@gmail.com?
6. **Facebook Page URL and Instagram handle.** Neither was confirmed, so neither is linked.
7. **Customer confirmations.** Do they want an automatic text or email sent to the customer? That's possible later, from the same Apps Script.
8. **Photos.** Before/after photos of real jobs would help.
9. **Services.** What does "home organization" cover?
10. **Permission** to use the Becky Hosman shout-out and the two Facebook comments.
11. **Domain.** They own aldenscleanteam.org. The new site could replace the template site there.

## How it fits together

- `js/quote.js` (the form) only calls `ACT.store.create(request)` in `js/request-store.js`.
- That validates the request, builds one row object and POSTs it as JSON to `sheet.url`.
- `google-sheet/Code.gs` checks the required fields again, cleans every value and appends the row under a lock, so two requests at once can't collide. If an email address is set, it also sends a notice.
- To swap the sheet for a database or CRM later, only `request-store.js` changes.

Remove `<meta name="robots" content="noindex">` and the black demo bar when it goes live.

## Testing done

**Website: automated browser test, phone-sized, Pacific time. All 23 checks passed.** Google's endpoint was simulated, because Google can't be reached from the build machine.
- A weekly home-cleaning request sent **exactly one POST** with every field correct: service, frequency, preferred day, morning, address, 3 bed/2 bath, name, formatted phone, notes and the `ACT-` reference.
- The confirmation's reference matched the row sent.
- An office request sent no bedroom or bathroom values.
- If the sheet returns an error, or the script rejects the request, the customer sees "didn't go through", with no confirmation, and the button works again.
- **Demo mode** (no URL): the confirmation says nothing was sent, and no network requests are made.
- Validation works for street, preferred day, time of day and past days. No calendar slots or old team view remain. No prices, no JavaScript errors, no pop-ups.

**Apps Script: run against a fake Google Sheet. All 14 checks passed.**
- It creates the Requests tab with a bold, frozen header row, once.
- Each value goes in the right column. Status is "New" and the team columns are blank.
- Text that looks like a formula is escaped.
- A request missing a phone number, or a garbage body, is rejected with no row added.
- The email is sent only when `NOTIFY_EMAIL` is set. The browser health check works.

**Not yet tested against a real Google account.** Run step 4 of `google-sheet/SETUP.md` (send one test request) after deploying.
