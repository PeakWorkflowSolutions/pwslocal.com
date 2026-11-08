/* =====================================================================
   ALDEN'S CLEAN TEAM - SITE SETTINGS (EDIT HERE)
   ---------------------------------------------------------------------
   The one place to change quote wording, services, frequencies, home
   size options and contact details. The Services section, the quote
   flow, the confirmation screen and the Contact section all read
   from here.
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

  /* ---------- QUOTE WORDING ----------
     No prices were found anywhere, so the site never shows a price.
     Change these lines once the team decides how they want to word it. */
  quote: {
    priceLine: "Call or message for a free quote",
    stepNote: "The team will confirm the price when they call.",
    confirmTitle: "Request received!",
    confirmBody: "Dave, Lyndsay or Leah will call you back with a price and to confirm the day and time.",
    noPriceYet: "No price is set until the team calls you. No payment is needed.",
    oneTimeOnlyNote: "This kind of clean is one-time only."
  },

  /* How far ahead customers can pick a date, in days. */
  bookingWindowDays: 90,

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
