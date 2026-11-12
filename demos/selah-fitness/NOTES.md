# 24/7 Selah Fitness: website demo

Built Nov 12, 2026 from Marcos's full scrape (Facebook, Instagram, Google Places, Yelp). The gym is on board and waiting for the demo (per Marcos, Nov 12, 2026). Published as an artifact.

## How to open it

Double-click `index.html`. No server, no install, no build step, and no JavaScript.

## Design

- **Built from their sign**, the only brand mark they have. The sign has a gold "24/7" with a red heartbeat line running through it, and silver "SELAH FITNESS" block letters on a gray building.
  - Colors: dark gray #1E2023, gold #F2C230, red #E03A3E, silver #D9DCE0.
  - The hero recreates the sign in type and CSS: a big gold 24/7 with a red heartbeat line running through it that spikes between the 24 and the 7, like their logo, and SELAH FITNESS underneath.
- **The pulse line** is the section divider, like the pine treeline on the Outback site.
- **Fonts:** Anton (tall block capitals, close to the sign), Oswald for labels, Inter for body text.
- **Same structure as the Outback site:** sticky header, hero, a quick-facts strip, content sections, reviews, a visit section and contact.

## What's on the page

1. **Hero:**
   - the 24/7 sign
   - their Facebook bio, "Inclusive fitness facility here to help you meet all your fitness goals!" and "Now offering personal training!"
   - Call (509) 698-2829 and Ask about membership buttons
   - the address
2. **Quick facts:** 24/7 member access · Personal training · Downtown Selah.
3. **The gym:** three cards: gym access, personal training, and everyone's welcome (from their "inclusive" bio).

(The outdoor workout from their Instagram was removed at Marcos's request, Nov 12.)
4. **Reviews:** both Facebook reviews, word for word, including "nice openers" (probably meant "owners"; left as written). No star rating anywhere.
5. **Visit:** 103 N 1st St, Ste D, a "Look for the yellow 24/7 sign" line, and a Directions link using their Google coordinates.
6. **Contact:** call, text, email (247selahfitness@gmail.com), Instagram and Facebook.

## What I deliberately did NOT put on the site

- **Prices.** None are published anywhere, so the site says "Call, text or email for current membership and personal training rates."
- **Staffed hours.** The sources conflict: Facebook says "Always open", Yelp says 24 hours, Google says 8 AM-10 PM. The site only says "24/7 member access", which matches the gym's name, Facebook and Yelp. It doesn't list staffed hours.
- **Founding year, owner name, ratings, classes, trainer names.** Not confirmed, or not found.
- **Anything about other gyms.** Anytime Fitness, Fully Charged, Selah Grace and Bebe Nails are all left out. The 2020 COVID fine was Anytime Fitness, not this gym.
- **Photos.** None were available, and no stock photos are used. Their gym floor and equipment photos are the first thing to ask for.

## To confirm with the business (if they say yes)

1. Who the owner or contact is.
2. Hours: is it 24/7 member access with staffed hours of 8 AM-10 PM? If so, add staffed hours.
3. Membership, day pass and personal training prices.
4. Classes and trainer names, if any. (Yelp lists "Cardio Classes".)
5. Current photos of the gym floor, equipment and building sign, to add a photo section.
6. How people join: in person, online, or a key fob or code for 24/7 access?
7. Whether to claim the Yelp listing and add a Google Business profile.

## Testing done

I ran an automated browser test on phone and desktop sizes, all 13 checks passed:
- No prices, star ratings, owner name, founding year or disputed hours anywhere. No competitor or COVID-fine content.
- Call, text, email, Instagram, Facebook and directions links all work.
- Both reviews are word for word, the workout section is gone, and the heartbeat spike sits between the 24 and the 7.
- No sideways scrolling on a phone, and no errors.
- Screenshots checked by eye on phone and desktop.
