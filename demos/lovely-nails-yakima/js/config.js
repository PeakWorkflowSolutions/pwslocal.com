/* =====================================================================
   LOVELY NAILS YAKIMA - SITE SETTINGS (EDIT HERE)
   ---------------------------------------------------------------------
   This is the ONE place to change prices, appointment length, hours,
   services and technicians. The Services section, the booking flow,
   the hours on the home page and the Contact section all read from here.

   Anything with "confirmed: false" shows a visible "To confirm" tag on
   the site. Flip it to true once the salon has confirmed it.
   ===================================================================== */

window.LN_CONFIG = {

  /* ---------- Salon facts (from the brief) ---------- */
  salon: {
    name: "Lovely Nails Yakima",
    phoneDisplay: "(509) 469-1712",
    phoneTel: "+15094691712",
    addressLine1: "1731 S 1st St Ste 100",
    addressLine2: "Yakima, WA 98901",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Lovely+Nails+1731+S+1st+St+Ste+100+Yakima+WA+98901",
    facebookUrl: "https://www.facebook.com/399704083385479",
    googleRating: 4.5,
    facebookRating: 4.4,
    timezone: "America/Los_Angeles"
  },

  /* ---------- Appointment length ----------
     Default length of every appointment, in minutes. A service can
     override it with its own "minutes" value below. */
  appointmentMinutes: 60,

  /* Time slots start every N minutes inside open hours. */
  slotStepMinutes: 30,

  /* Earliest booking for today: this many minutes from now. */
  minLeadMinutes: 30,

  /* How far ahead customers can book, in days. */
  bookingWindowDays: 60,

  /* ---------- Opening hours ----------
     0 = Sunday ... 6 = Saturday. 24-hour "HH:MM". Use null for closed.
     Google/Places data, Nov 2026. Older listings say Mon-Sat 9-6 and
     Sunday closed, so these stay marked "to confirm". */
  hoursConfirmed: false,
  hours: {
    0: { open: "10:00", close: "18:00" }, // Sunday
    1: { open: "09:00", close: "19:30" }, // Monday
    2: { open: "09:00", close: "19:30" }, // Tuesday
    3: { open: "09:00", close: "19:30" }, // Wednesday
    4: { open: "09:00", close: "19:30" }, // Thursday
    5: { open: "09:00", close: "19:30" }, // Friday
    6: { open: "09:00", close: "19:30" }  // Saturday
  },

  /* ---------- Prices ----------
     Prices below come from customer reviews, NOT from the salon.
     price: number or null (null shows "Ask the salon")
     pricePrefix: e.g. "around" or "from"
     priceNote: short note shown next to the price
     minutes: null = use appointmentMinutes above */
  pricesConfirmed: false,
  services: [
    {
      id: "acrylic",
      name: "Acrylic nails",
      description: "Full sets and fills. Pick your shape, length and color.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "dip",
      name: "Dip powder nails",
      description: "Dip powder color, plain or with a design.",
      price: 38, pricePrefix: "", priceNote: "price seen in a review", minutes: null
    },
    {
      id: "gel-shellac",
      name: "Gel manicure / Shellac",
      description: "Gel polish with a glossy finish that lasts longer than regular polish.",
      price: 45, pricePrefix: "", priceNote: "with a small design, price seen in a review", minutes: null
    },
    {
      id: "gel-x",
      name: "Gel-X extensions",
      description: "Soft gel extensions for extra length with a natural look.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "manicure",
      name: "Manicure",
      description: "Shape, cuticle care and polish. Simple and clean.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "pedicure",
      name: "Pedicure",
      description: "Soak, scrub, trim and polish. Sit back and relax.",
      price: 40, pricePrefix: "around", priceNote: "price seen in a review", minutes: null
    },
    {
      id: "spa-pedicure",
      name: "Shellac spa pedicure",
      description: "Pedicure finished with Shellac. Customers mention hot stones, paraffin wax and a great massage.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "kids-pedicure",
      name: "Kids pedicure",
      description: "A child-sized pedicure chair for little ones. Toddler friendly.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "nail-art",
      name: "Nail art and designs",
      description: "Seasonal designs, French tips, rhinestones and more. Not sure what you want? Ask for ideas.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "facial",
      name: "Facial",
      description: "A relaxing facial to refresh your skin.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "eyebrow-wax",
      name: "Eyebrow wax",
      description: "Quick, neat brow shaping.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    },
    {
      id: "waxing",
      name: "Other waxing",
      description: "Waxing for other areas. Ask us what we offer.",
      price: null, pricePrefix: "", priceNote: "", minutes: null
    }
  ],

  /* ---------- Technicians ----------
     Only Song is named (from reviews). Do not add names until the
     salon confirms them. "allowName" shows an optional name box. */
  staffConfirmed: false,
  technicians: [
    { id: "any",   label: "Any technician", hint: "First available" },
    { id: "song",  label: "Song",           hint: "Named in customer reviews" },
    { id: "other", label: "Other",          hint: "Tell us who, if you know", allowName: true }
  ]
};
