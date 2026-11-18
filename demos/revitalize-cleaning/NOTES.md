# Revitalize Cleaning Services: website demo

Built Nov 17, 2026 from Marcos's scrape (Facebook Page, posts and reels, Instagram, web search). **Approved** by Mari and Damian Shelton on Nov 17. They have no website today.

## How to open it

Double-click `index.html`. No server, no install, no build step.

## Design

Rebranded Nov 17 from the logo screenshot Marcos sent:
- **Emblem:** buildings and houses under a sparkling dome, with squeegees, cut out of the screenshot. The grid paper behind it was removed, and it's saved with transparency as `img/logo-mark.png`. It's used in the header, the hero and the favicon.
- **Colors from the logo:** royal blue #1B37A6 (the wordmark), periwinkle #8FA2EE (the dome), pale periwinkle #E3E9FF, and white.
- **Fonts:** Saira, bold and wide like their wordmark, for headings and "REVITALIZE CLEANING SERVICES LLC". Inter for body text.
- **Their tagline**, word for word under the name: "Revitalizing your space, one detail at a time".
- Sparkles, like the ones in their logo's dome.
- For a sharper emblem, ask for the original logo file. The cut-out came from a screenshot.

## What's on the page

1. **Hero:** their emblem, "REVITALIZE CLEANING SERVICES LLC", their tagline, "Residential and commercial cleaning in Yakima, WA, from a husband-and-wife team, Mari and Damian Shelton.", and buttons to request a free quote or message them on Facebook.
2. **Strip:** Homes · Offices · Move-in & move-out · New construction · Real estate listings.
3. **Services**, in three groups (all from the scrape):
   - Residential: regular maintenance, deep cleaning, move-in and move-out.
   - Commercial: office spaces, restaurants, business facilities.
   - Real estate & new construction: listing cleans and new construction cleaning.
3a. **Real estate cleaning (new, Nov 18):** their own job photos, Marcos sent 7. Each project is one row you swipe sideways, or use the arrows, with a "1 / 4" counter, so it doesn't take up the whole page.
   - Project 1, tiled shower and bench: their before/after photo, shown full width.
   - Project 2, shower with pebble floor: Before, After and two Detail close-ups.
   - Project 3, tile floors: two After photos.
   - The labels only describe what's in each photo. No client names or addresses.
4. **Our story, "Built brick by brick"** (their own phrase), from the John L. Scott recommendation reel:
   - Mari started cleaning at a local church after losing her job, then cleaned listings for a Yakima real estate team.
   - With their encouragement she started her own business.
   - About a year later, Damian left construction to build it with her.
5. **Recommendation:** "5 star performing duo", Jeremy and Lindsay of John L. Scott Yakima, linked to the reel. It's a quote, not a star rating.
6. **Free quote form**, sent to a Google Sheet:
   - Required: service, property type, city, name and phone.
   - Optional: street, size, preferred day, email and notes.
   - On send: a confirmation with an `RCS-` reference and "Mari or Damian will reach out."
7. **Contact:** "Serving Yakima, WA" plus the quote form and Facebook.

## Deliberately NOT on the site

- **Prices and add-ons.** The pricing video in the first scrape was Revitalize Real Estate in Tampa, not them. The fridge, oven, garage and windows add-ons came from that same video, so they're out too.
- **Phone and email.** None exist publicly. Add them once Mari gives them.
- **Street address.** 3403 Jefferson Ave is the LLC filing address and may be their home. The site says "Yakima, WA" until Mari says it's okay to list.
- **"Licensed, bonded, insured."** Not confirmed.
- **Damian's Instagram** (personal account), faith or church details beyond the story itself, and all same-name and competitor businesses.

## Connecting the Google Sheet

Follow `google-sheet/SETUP.md`: make a sheet, paste `google-sheet/Code.gs` into Apps Script, deploy it as a web app, and paste the URL into `js/config.js` (`sheetUrl`).

The sheet's columns:
- From the form: Received, Reference, Service, Property, Street, City, Size, Preferred day, Name, Phone, Email, Notes.
- For them to fill in: Status, Walkthrough date, Price quoted.

Until the URL is set, the form works in demo mode and says nothing was sent. The Claude artifact can't send to Google, so use the Netlify site for real requests.

## To confirm with Mari and Damian

1. Phone number and email for the site.
2. Whether to show the street address, or just "Yakima, WA".
3. Service area: Selah and other towns?
4. Services list: is anything missing, like carpets or windows?
5. Prices, if they ever want them shown.
6. Licensed, bonded or insured: if so, add it.
7. The original logo file (for a sharper emblem). Also: are the 3 projects real estate listings? Do they want project names or locations? More photos would help, including commercial jobs and the two of them.
8. Spelling: Damian, Damion or Damon?
9. Permission to quote the John L. Scott recommendation and link the reel.
10. Which Google account the quote-request sheet should live in, and who should get the email notice.

## Testing done

All 22 site checks and 19 photo-row checks passed:
- **Content:** no prices, add-ons, licensed/bonded/insured claim, street address, invented phone, or same-name businesses. The recommendation and Facebook links are present.
- **Form:**
  - Required-field and phone errors show on the page, never as pop-ups.
  - Demo mode shows the confirmation with an RCS- reference and a demo note.
  - With a stand-in Google endpoint, it sends exactly one complete row.
  - If the sheet is down, the customer gets a clear error and no false confirmation.
- **Apps Script**, run against a fake sheet: correct header and columns, and a request without a phone number is rejected.
- **Photo rows**, on phone and desktop: the 3 projects have 1, 4 and 2 photos, and every photo loads. The arrows step through and stop at each end, the counter updates, a single-photo project hides its arrows, and the page itself never scrolls sideways.
- No sideways scroll on a phone, no JavaScript errors.
- Screenshots checked by eye on phone and desktop.
