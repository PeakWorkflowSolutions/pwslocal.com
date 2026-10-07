# pwslocal.com

Source for [pwslocal.com](https://pwslocal.com), the website for Peak Workflow Solutions, an AI automation consultancy serving small businesses in the Yakima Valley, WA.

## What it is

A single-file static site. No framework and no build step: HTML, CSS and vanilla JavaScript in one `index.html`, deployed on Netlify.

## What's in it

- **Responsive layout** with a mobile nav menu and breakpoints from phone to desktop
- **Light and dark mode** using CSS custom properties (design tokens)
- **SEO and AI-search structured data**: JSON-LD `ProfessionalService` and `FAQPage` schema, Open Graph and Twitter card tags, canonical URL
- **Inline SVG icon sprite** and an animated SVG hero background
- **Contact form** that posts to a Zapier webhook (`fetch`, no-cors) and falls back to a pre-filled `mailto:` link
- **Touch and swipe carousel** written from scratch
- **Accessible accordions** for the FAQ using native `<details>` / `<summary>`

## Notes

- Images are embedded as base64 so the whole site ships as one file.
- The live Zapier webhook URL has been removed from this public copy. With it empty, the form falls back to opening an email.

Built by Marcos Gonzales, Peak Workflow Solutions.
