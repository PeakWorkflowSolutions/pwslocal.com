# Outback Espresso: website demo

Built Nov 2026 for Outback Espresso (Yakima, WA), at the business's request.

## How to open it

Double-click `index.html`. No server, no install, no build step.

## Where everything came from

Everything on the site comes from **their own website, outbackespresso.com**, read on Nov 10, 2026:

- Business details:
  - two drive-thrus and their addresses, phone numbers and hours
  - the email (outbackespresso99@gmail.com, shown in scrambled form on their contact page)
  - the 1999 founding by the Grimes family
  - Outback North added in 2011 to support West Valley High School
  - their mission line, their story text and "In God We Trust"
- **Menu prices:** every drink, size and price from their online order pages.
- **Customer quotes:** six of the ten testimonials on their homepage, word for word, with each person's favorite drink and years as a customer.
- **Photos:** their logo (black and white versions), both buildings, and 14 of their own drink photos.

Left out on purpose:
- The small round drink icons on their current site are **Starbucks product images**.
- The coffee-bags photo, the "Take Away" badge, the "John Appleseed" signature and the placeholder "History" text are **website template stock**.
- I didn't use any of those, and didn't scrape Yelp or other directories.

## Design

- **Black and white** like their logo, with cream (#FFFBF2, the background color their current site uses) for the story and food sections.
- A **pine treeline** edge between sections. It's an original drawing that echoes the trees in their logo.
- **Oswald** (tall condensed capitals, close to the "OUTBACK" lettering) for headings, and **Inter** for body text.
- The drink photos stay in full color so they pop against the monochrome. Building photos are shown in black and white in the hero and story sections.

## What's on the page

1. **Hero:** white logo over a black-and-white photo of the Ahtanum stand under its big pine, "Family-owned · Yakima, WA · Since 1999", their mission line, and buttons for the menu and drive-thrus.
2. **Open now strip:** both locations, showing open or closed right now and closing time, in Yakima time.
3. **Menu:** three tabs.
   - Coffee & Espresso: 9 drinks.
   - Tea, Chai & More: 5 drinks.
   - Red Bull, Lotus & Spark: 2 drinks, plus Detox Water.
   - Every size from 12 to 32 oz with prices. On phones, each drink's prices sit in a row under its name.
   - A Food card with their own line, "Come visit our locations for our food options!"
4. **Photo wall:** 12 drink photos (10 on desktop, to keep the grid even).
5. **Locations:** photo, address, Call and Directions buttons, open-now status, and weekly hours with today in bold, for Ahtanum (Main) and Wide Hollow (Outback North).
6. **Our story:** their own story, shortened.
7. **What our customers say:** 6 testimonials with each person's usual drink.
8. **Contact:** both phones, the email, "In God We Trust".

## Where to edit

- **`js/data.js`:** all menu items, sizes and prices, plus both locations' address, phone, map link and hours.
- Everything else is plain text in `index.html`.

## Things to confirm with the owner

1. **Outback North's phone number.** Their North page says (509) 972-9876, which is the same as Ahtanum. The footer and contact page say Wide Hollow is (509) 966-7472. The site uses 966-7472. Which is right?
2. **Food.** Their site lists no food items or prices. Reviews elsewhere mention breakfast burritos, sandwiches and muffins, and one photo shows glazed donut holes. Do they want a food list with prices?
3. **Flavors.** The menu headings mention flavored and blended Red Bull/Lotus and Spark, with no separate prices. What are the flavor lists and the blended prices?
4. **Facebook and Instagram.** The icons on their current site don't link anywhere. What are their real page URLs?
5. **Online ordering.** Their current site has a "Place Order" shop. Do they use it? Should the new site link to it?
6. **Careers page.** Their site has a Job Board page. Do they want hiring info on the new site?
7. **Prices.** These were taken from their site on Nov 10, 2026. Are they current, and before tax?

Remove `<meta name="robots" content="noindex">` and the "Demo site by Peak Workflow Solutions" line when it goes live.

## Testing done

I ran an automated browser test on phone and desktop sizes, all 11 checks passed:
- 16 priced drinks show across the 3 tabs, and the tabs switch.
- The prices match their site.
- Both open-now cards, both location cards, click-to-call and directions for both locations, and the 6 quotes all render.
- Every image loads, and there are no JavaScript errors.
- Screenshots checked by eye on phone and desktop.
