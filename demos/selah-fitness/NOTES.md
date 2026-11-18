# 24/7 Selah Fitness: website demo

Built Nov 12, 2026 from Marcos's full scrape (Facebook, Instagram, Google Places, Yelp). The gym is on board and waiting for the demo (per Marcos, Nov 12, 2026). Published as an artifact.

## Live

https://selah-fitness-247.netlify.app. Deployed Nov 18, 2026 to the Netlify project `selah-fitness-247`. Anyone can open it, no sign-in needed. Demo sign-in: alex.morgan@example.com / Selah2026!

## How to open it

Double-click `index.html`. No server, no install, no build step, and no JavaScript.

## Design

- **Built from their sign**, the only brand mark they have. The sign has a gold "24/7" with a red heartbeat line running through it, and silver "SELAH FITNESS" block letters on a gray building.
  - Colors: dark gray #1E2023, gold #F2C230, red #E03A3E, silver #D9DCE0.
  - The hero recreates their logo (24/7 RESULTS TRAINING graphic Marcos sent, Nov 16) in type and CSS:
    - yellow 24 and 7 with a dark outline
    - a glowing neon heartbeat line running right under them, with one big up-and-down spike between the 24 and the 7
    - two slanted yellow banners underneath
  - The logo's banners say RESULTS and TRAINING. On the site they say SELAH and FITNESS to match the gym name. Swap them back if the owner prefers.
- **The pulse line** is the section divider, like the pine treeline on the Outback site.
- **Fonts:** Anton (tall block capitals, close to the sign), Oswald for labels, Inter for body text.
- **Same structure as the Outback site:** sticky header, hero, a quick-facts strip, content sections, reviews, a visit section and contact.

## What's on the page

1. **Hero:**
   - the 24/7 sign
   - their Facebook bio, "Inclusive fitness facility here to help you meet all your fitness goals!" and "Now offering personal training!"
   - Get a membership and Call (509) 698-2829 buttons (a gold Join button is also in the header)
   - the address
2. **Quick facts:** 24/7 member access · Personal training · Downtown Selah.
2a. **Equipment** (new, Nov 16): their weights photo (the dumbbell rack Marcos sent), plus tabs to pick a section: Free weights, Benches & racks, Cardio, Machines.
   - Free weights and benches are described from the photo: rubber hex dumbbells on a full rack, benches and a rubber floor.
   - Cardio and Machines are only general lines. **Confirm what they actually have** (brands, counts, heaviest dumbbell, squat rack or not) and fill these in.
3. **The gym:** three cards: gym access, personal training, and everyone's welcome (from their "inclusive" bio).

(The outdoor workout from their Instagram was removed at Marcos's request, Nov 12.)
4. **Reviews:** both Facebook reviews, word for word, including "nice openers" (probably meant "owners"; left as written). No star rating anywhere.
5. **Visit:** 103 N 1st St, Ste D, a "Look for the yellow 24/7 sign" line, and a Directions link using their Google coordinates.
5a. **Membership sign-up (demo, Nov 18)**, for the walk-through with the owner. "Get a membership" opens a 5-step sign-up:
   1. **Plan:** one membership, **Monthly $29** (confirmed by Marcos, Nov 18). It's the only plan.
   2. **You:** name, date of birth (16+), phone, email, address, emergency contact.
   3. **Paperwork:** membership & billing agreement, liability waiver, 24/7 access rules, a 3-question health check, typed name (must match) and a drawn signature with today's date. **Sample wording**, labeled for the owner's attorney to review.
   4. **Pay:** demo checkout. Test card 4242 4242 4242 4242, any future date, any 3 digits. Card number is checked and formatted. No card is charged and nothing is sent anywhere.
   5. **Welcome:** member card with name, plan, member # (SF-xxxx), amount paid with last 4 digits, and "Phone key active". The button jumps to the phone key.
   - **Pre-filled for the walk-through (Nov 18):** every step starts filled in with a sample member, Alex Morgan, including the checkboxes, a drawn signature and the test card, so you can just click Continue. Everything can still be edited, and Clear removes the signature. To start with empty forms, set `DEMO_FILL = false` at the top of `js/join.js`.
   - Only name, plan, member #, last 4 and paid amount are saved, in that browser, so the phone key can greet the member. No full card, CVC, birthday or phone.
5b. **Phone key (Nov 18, simplified at Marcos's request).** Just a phone mockup: "24/7 Selah Fitness", "Hi, [name]", "Membership active" and one big gold lock button. Tap it and it turns green with an open lock, "Unlocked. Come on in!", then locks again after 4 seconds. Marcos pitches the idea out loud, so there's no pitch text, door code, door reader or owner view on the page.
   - Before anyone signs up it says "Hi, Member". After sign-up it greets the new member.
   - For a real build: an app or web pass on the phone, an NFC or Bluetooth reader at the door, and a door controller tied to the member list (for example Kisi, Openpath/Avigilon Alta, Brivo, or the gym software's own access system). Payments through Stripe or the gym's billing software.
5c. **Member sign in (Nov 18).** The phone key is guarded by a sign-in:
   - **Sign in** button in the header (next to Join) and an "Already a member? Sign in" link under the hero buttons. On phones the header shows just the 24/7 logo, Sign in and Join.
   - Signed out, the phone shows a gray lock, "Members only. Sign in to use your door key." and a Sign in button. The unlock button only appears once signed in, and "Sign out" locks it again.
   - Username is the member's email. Sign-up step 2 now asks for a password (8+ characters).
   - After paying, the button reads **Sign in to your key** and opens the sign-in already filled in.
   - Pre-filled for the walk-through: alex.morgan@example.com / **Selah2026!** (works before anyone signs up). A wrong password, unknown email or empty fields show an error.
   - Demo only: the password is checked in the browser and saved only as a scrambled fingerprint. A real build checks it on a server (or the gym's member software).
6. **Contact:** call, text, email (247selahfitness@gmail.com), Instagram and Facebook.

## What I deliberately did NOT put on the site

- **Personal training prices.** Membership is $29/month (confirmed by Marcos, Nov 18) and is on the contact section and in the sign-up. Personal training rates aren't known, so the site says "Call, text or email for personal training rates."
- **Staffed hours.** The sources conflict: Facebook says "Always open", Yelp says 24 hours, Google says 8 AM-10 PM. The site only says "24/7 member access", which matches the gym's name, Facebook and Yelp. It doesn't list staffed hours.
- **Founding year, owner name, ratings, classes, trainer names.** Not confirmed, or not found.
- **Anything about other gyms.** Anytime Fitness, Fully Charged, Selah Grace and Bebe Nails are all left out. The 2020 COVID fine was Anytime Fitness, not this gym.
- **Photos.** The only photo is the dumbbell rack Marcos sent. No stock photos are used. More photos of the floor, the machines and the sign are still the first thing to ask for.

## To confirm with the business (if they say yes)

1. Who the owner or contact is.
2. Hours: is it 24/7 member access with staffed hours of 8 AM-10 PM? If so, add staffed hours.
3. Day pass and personal training prices (membership is $29/month).
4. Classes and trainer names, if any. (Yelp lists "Cardio Classes".)
5. Current photos of the gym floor, equipment and building sign, to add a photo section.
6. How people join today, and what door system the chip fobs use (brand of reader/controller), to see if it can take phone keys.
8. Real plans and prices, sign-up fee, and their actual waiver and agreement wording for the sign-up.
7. Whether to claim the Yelp listing and add a Google Business profile.

## Testing done

Sign in (Nov 18): 40 checks passed on phone and desktop: the key stays hidden until sign-in; wrong password, unknown email and empty fields are rejected; sign-in survives a reload; sign out locks the key; a new member signs in with the password they created; the password isn't stored in plain text.

Sign-up and phone key (Nov 18): 43 checks passed on phone and desktop:
- Get a membership opens the sign-up; empty fields, bad email, unchecked agreements, a typed name that doesn't match, bad card, past expiry and short CVC are all caught on the page (no pop-ups).
- The test card goes through, the welcome card shows name, SF- member # and last 4, and only those basics are saved.
- The phone key greets the new member; tapping the lock unlocks (green, open lock) and it relocks after 4 seconds. No pitch text, code, reader or owner view remain.
- No sideways scroll, no errors. Screenshots checked by eye.

Site checks: all 18 passed:
- No prices, star ratings, owner name, founding year or disputed hours anywhere. No competitor or COVID-fine content.
- Call, text, email, Instagram, Facebook and directions links all work.
- Both reviews are word for word and the workout section is gone.
- The logo has one spike between the 24 and the 7, and the banners read SELAH and FITNESS.
- The weights photo loads, and the equipment tabs switch sections.
- No sideways scrolling on a phone, and no errors.
- Screenshots checked by eye on phone and desktop.
