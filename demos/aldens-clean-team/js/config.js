/* =====================================================================
   ALDEN'S CLEAN TEAM - SITE SETTINGS (EDIT HERE)
   ---------------------------------------------------------------------
   The one place to change the Google Sheet link, quote request
   wording, services, frequencies, home size options and contact
   details. The Services section, the request form and the
   confirmation screen all read from here.
   ===================================================================== */

window.ACT_CONFIG = {

  /* ---------- Business facts (from the brief) ---------- */
  business: {
    name: "Alden's Clean Team",
    legalName: "Alden's Clean Team LLC",
    tagline: "Your satisfaction is our guarantee",
    serviceArea: "Yakima, WA and surrounding areas",
    phones: [
      { who: "Dave", display: "(509) 952-9488", tel: "+15099529488" },
      { who: "Leah", display: "(509) 406-4528", tel: "+15094064528" }
    ],
    emails: [
      { label: "Email", address: "aldenscleanteam@gmail.com" },
      { label: "Dave's email", address: "dave.alden1@gmail.com" }  // on the flyer/business card; confirm before launch
    ],
    addressLine1: "3901 Emma Ln",
    addressLine2: "Yakima, WA 98903",
    zipNote: "ZIP to confirm: the state filing says 98903, Yelp lists 98902.",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=3901+Emma+Ln+Yakima+WA",
    timezone: "America/Los_Angeles"
  },

  /* ---------- GOOGLE SHEET ----------
     Paste the Web app URL from the Apps Script deployment here
     (see google-sheet/SETUP.md). Every quote request is added as a
     new row in the sheet. Leave it empty for demo mode: the form
     works, but nothing is sent anywhere. */
  sheet: {
    url: ""
  },

  /* ---------- QUOTE REQUEST WORDING ----------
     Prices are given in person at a free quote visit, so the site
     never shows a price. Change these lines to change the wording. */
  quote: {
    priceLine: "Free quote visit",
    stepNote: "The team gives you the price when they come see the job.",
    confirmTitle: "Request sent!",
    confirmBody: "Dave, Lyndsay or Leah will call or text you to set up a time to come see the job and give you a price.",
    noPriceYet: "No price is set until the team sees the job. No payment is needed.",
    oneTimeOnlyNote: "This kind of clean is one-time only.",
    demoNote: "Demo mode: this request was not sent anywhere. Once the Google Sheet is connected, requests land there."
  },

  /* How far ahead customers can pick a preferred day, in days. */
  bookingWindowDays: 60,

  /* Preferred time of day for the quote visit. */
  timesOfDay: ["Morning", "Afternoon", "Evening", "Any time"],

  /* ---------- Frequencies ---------- */
  frequencies: [
    { id: "one-time",  label: "One-time" },
    { id: "weekly",    label: "Weekly" },
    { id: "bi-weekly", label: "Every two weeks" },
    { id: "monthly",   label: "Monthly" }
  ],

  /* ---------- Home size options (used to price the job) ---------- */
  bedrooms:  ["Not sure", "Studio", "1", "2", "3", "4", "5", "6 or more"],
  bathrooms: ["Not sure", "1", "1.5", "2", "2.5", "3", "3.5", "4 or more"],
  squareFeet: ["Not sure", "Under 1,000 sq ft", "1,000 - 1,500 sq ft", "1,500 - 2,000 sq ft",
               "2,000 - 2,500 sq ft", "2,500 - 3,000 sq ft", "Over 3,000 sq ft"],

  /* ---------- Services ----------
     oneTimeOnly: frequency is locked to one-time
     askRooms:    show bedrooms and bathrooms (otherwise square feet only) */
  services: [
    { id: "home", name: "Home cleaning", askRooms: true, oneTimeOnly: false,
      description: "Regular house cleaning, one time or on a schedule: weekly, every two weeks or monthly." },
    { id: "office", name: "Office cleaning", askRooms: false, oneTimeOnly: false,
      description: "Cleaning for your office or workplace." },
    { id: "garage", name: "Garage cleaning", askRooms: false, oneTimeOnly: false,
      description: "We will even clean the garage." },
    { id: "special-rooms", name: "Special rooms cleaning", askRooms: true, oneTimeOnly: false,
      description: "Just one room or area that needs extra attention. Tell us which." },
    { id: "after-events", name: "After-events cleaning", askRooms: true, oneTimeOnly: true,
      description: "Had a party or a get-together? We clean up after." },
    { id: "pre-sale", name: "Pre-sale listing cleaning", askRooms: true, oneTimeOnly: true,
      description: "A thorough clean to get a home ready to list and show." },
    { id: "move", name: "Move-in / move-out cleaning", askRooms: true, oneTimeOnly: true,
      description: "Cleaning before you move in or after you move out." },
    { id: "airbnb", name: "Airbnb cleaning", askRooms: true, oneTimeOnly: false,
      description: "Cleaning between guests for short-term rentals." },
    { id: "maintenance", name: "Home and office maintenance cleaning", askRooms: true, oneTimeOnly: false,
      description: "Ongoing cleaning to keep a home or office in shape." },
    { id: "organization", name: "Home organization", askRooms: true, oneTimeOnly: false,
      description: "Help getting a home organized. Ask us what this covers." }
  ]
};
