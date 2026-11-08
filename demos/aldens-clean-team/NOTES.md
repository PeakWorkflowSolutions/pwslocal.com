# Alden's Clean Team: website + quote visit booking demo

Prepared Nov 2026 for Alden's Clean Team LLC (Yakima, WA). Approved by the business for a demo.

## How to open it

Double-click `index.html`. Everything runs from these files: no server, no install, no build step.
The team's list of quote visits is at `index.html#requests` ("Team view: quote visits" in the footer, or "Team" in the desktop menu).

Bookings are saved in the browser that made them. For a demo, book a visit and open the team view on the same device.

## What was built

- **Home:** team photo (Lyndsay, Dave and Leah), the name, "Relax! We'll Clean It For you", the tagline "Your satisfaction is our guarantee", a Book a Free Quote Visit button, Call buttons for Dave and Leah, and the service area. Under it is a band with their own line, "Short on Time or just need help? Let us Clean it for you!"
- **Services:** all 10 services from the brief, each with a short plain description, "Free quote visit" and a Book a visit button that opens the booking form with that service picked. No prices anywhere.
- **Photos:** the team photo and the logo. The flyer is left out at Marcos's request because its living-room picture isn't their work. No stock photos.
- **Kind words:** the two real quotes word for word, attributed as the brief says (a commenter on a local Facebook recommendations thread; a neighbor's endorsement from Linda Larsen Eberle). The realtor shout-out from Becky Hosman is paraphrased, not quoted, and links to her Instagram video. No star rating anywhere.
- **Book a free quote visit:** the customer books a time for someone from the team to come see the job and give a price in person. 5 steps:
  1. Service.
  2. How often: one-time, weekly, every two weeks or monthly. Move-in/move-out, pre-sale and after-events are locked to one-time, with a note.
  3. The place: street address and city (required, since that's where the team goes), plus bedrooms, bathrooms and approximate size, each with a "Not sure" option. Office and garage ask only for size.
  4. Visit time:
     - quick-pick days, plus a date picker
     - start times every 30 minutes inside the visit hours
     - no past dates, and no same-day times less than 2 hours away
     - times already booked show as "Booked" and can't be picked
  5. Name and phone (required), email and notes (optional, such as a gate code, pets or parking).

  The confirmation screen shows an `ACT-XXXXXX` reference, the visit day and time, the address and the job details. It says Dave, Lyndsay or Leah will come by to see the job and give a price, will call or text to confirm before the visit, and that no price is set until the visit.
- **Contact:**
  - Dave and Leah, each with Call and Text buttons
  - both emails
  - service area
  - the address, with a note that the ZIP is to confirm (98903 on the state filing, 98902 on Yelp)
  - a Google Maps link
  - no Facebook or Instagram link and no link to the old website
- **Team view (`#requests`):**
  - **Upcoming** tab, soonest visit first. Each visit shows:
    - the day and time
    - the job address, linked to Google Maps
    - service and frequency
    - customer, phone (Call and Text buttons), home details, email and notes
  - On each visit:
    - **Who's going** picker: Dave, Lyndsay or Leah
    - **Mark visited**, once the quote is given
    - two-tap **Cancel**
  - Badges: "New: assign someone", "Leah is going", or "Visit time passed: mark visited?".
  - **Visited**, **Cancelled** and **All** tabs. Cancelling a visit frees up its time slot again.
  - The view updates live when a booking comes in from another tab.
- A sticky Call Dave / Free Quote bar on phones. Errors show on the page, never as pop-ups. If the browser blocks storage, booking still works for that visit.

## Where to edit things

Everything editable is in **`js/config.js`**, marked "SITE SETTINGS (EDIT HERE)":

- `visit`: **visit times (placeholder)**.
  - `hours`: hours per weekday. The placeholder is Mon-Sat 9:00 AM to 5:00 PM, with no Sunday visits.
  - `minutes`: visit length (30).
  - `slotStepMinutes`: how often a new start time begins (30).
  - `minLeadMinutes`: minimum notice for same-day visits (120).
  - `perSlot`: how many visits the team can do at the same time (1).
- `team`: who can be assigned a visit (Dave, Lyndsay, Leah).
- `quote`: all wording ("Free quote visit", the confirmation message, the no-price line, the one-time-only note).
- `services`: names, descriptions, `oneTimeOnly`, and `askRooms` (whether to ask for bedrooms and bathrooms).
- `frequencies`, `bedrooms`, `bathrooms`, `squareFeet`: the choices in the form.
- `bookingWindowDays`: how far ahead people can book (60).

Phone numbers, emails and the address also appear directly in `index.html`. Change them in both places.

## What the business still needs to confirm

1. **Visit times.** No hours were found anywhere. The Mon-Sat 9-5 visit times are a placeholder. When can they actually do quote visits? How long does one take? Can two of them do visits at the same time (`perSlot: 2`)?
2. **Prices.** None exist anywhere. They're given at the visit. Do they ever want prices or price ranges on the site?
3. **Service area.** "Yakima, WA and surrounding areas." Which towns will they drive to for a quote visit?
4. **Address ZIP.** 98903 (state filing, cleaners10) or 98902 (Yelp). Also: do they want a home address on the site at all?
5. **Emails.** Is dave.alden1@gmail.com OK to show next to aldenscleanteam@gmail.com?
6. **Facebook Page URL and Instagram handle.** Neither was confirmed, so neither is linked.
7. **Confirmations and reminders.** Do they want a text or email when a visit is booked? Who gets it? Do they want a confirmation and a day-before reminder sent to the customer?
8. **Photos.** Before/after photos of real jobs would help a lot. None exist publicly.
9. **Services.** What does "home organization" cover? Is anything missing or no longer offered?
10. **Permission** to use the Becky Hosman shout-out and the two Facebook comments, and to link the Instagram video.
11. **Domain.** They own aldenscleanteam.org. The new site could replace the template site there.

## Moving bookings to a real backend later

The booking form (`js/quote.js`) and the team view (`js/requests.js`) only talk to `ACT.store` in `js/request-store.js`:

```
ACT.store.create(request)      -> Promise<visit>
ACT.store.list()               -> Promise<visit[]>   (soonest first)
ACT.store.takenSlots(date)     -> Promise<"HH:MM"[]>
ACT.store.assign(ref, person)  -> Promise<visit>
ACT.store.markVisited(ref)     -> Promise<visit>
ACT.store.cancel(ref)          -> Promise<visit>
ACT.store.onChange(fn)
```

To go live:

1. Set up a small backend with a `visits` table. Supabase, a Netlify Function with a database, or a Google Sheet through Apps Script would all work.
2. On the server:
   - re-run the same checks as `ACT.core.validateRequest`
   - refuse a slot that's already full
   - generate the `ACT-` reference
   - save the same record shape as `buildRecord()`
3. Text or email the team when a visit is booked, and send the customer a confirmation and reminder.
4. Optionally add each visit to a shared Google Calendar.
5. Put the team view behind a login.
6. Change the last line of `request-store.js` to use the commented-out `ApiVisitStore`. Nothing else changes.

Also remove `<meta name="robots" content="noindex">` and the black demo bar when it goes live.

## Testing done

I ran an automated browser test (phone-sized screen, Pacific time) against these files. All 37 checks passed:

- **Booked a quote visit for a weekly home cleaning next week** (Mon Nov 16, 10:00 AM, 123 Test Ave, Yakima, 3 bed, 2 bath). The confirmation showed the right `ACT-` reference, time, address and details, and explained that the price comes at the visit.
- For the next customer, **10:00 AM showed as Booked** and couldn't be picked. The storage layer also **refused a double booking** of the same slot.
- In the team view, visits were **sorted soonest first**. I **assigned the visit to Leah** ("Leah is going"), **marked it visited** (it moved to Visited as "Visited by Leah"), and **cancelled** a second visit (gone from Upcoming, listed under Cancelled). Both time slots freed up again.
- Checks that passed:
  - Errors showed for a missing service, street and city, visit day, visit time, name and phone.
  - Sundays and past dates were refused, and Sundays didn't appear in the quick-pick days.
  - No same-day times within 2 hours of now.
  - Visit times ran 9:00 AM to 4:30 PM.
  - Office cleaning hid the bedroom and bathroom fields, and move-out was locked to one-time.
  - Booking still worked with browser storage blocked.
  - No prices, no old-website link, no JavaScript errors and no pop-up alerts.
