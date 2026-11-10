/* =====================================================================
   OUTBACK ESPRESSO - MENU, HOURS & LOCATIONS (EDIT HERE)
   ---------------------------------------------------------------------
   Prices, sizes and hours come from outbackespresso.com (Nov 2026).
   Change them here and the Menu and Locations sections update.
   A null price shows a dash.
   ===================================================================== */
window.OE = {
  timezone: "America/Los_Angeles",

  social: {
    instagram: "https://www.instagram.com/outback.espresso",
    facebookMain: "https://www.facebook.com/outbackespresso",
    facebookNorth: "https://www.facebook.com/outbacknorthespresso/",
    giftCards: "https://www.giftly.com/gift-card/outback-espresso-yakima"
  },

  /* Food items from their posted menus (no prices: availability and
     prices vary by location, confirm with the owner before adding). */
  food: ["Breakfast burritos", "Breakfast sandwiches", "Bagels & cream cheese", "Muffins", "Cream cheese muffins",
         "Breakfast cookies", "Sugar cookies", "Donuts", "Cinnamon rolls (seasonal)", "Oatmeal", "Tamales"],

  locations: [
    {
      id: "ahtanum",
      name: "Ahtanum",
      alt: "Main location",
      address: "8803 Ahtanum Rd, Yakima, WA 98903",
      phoneDisplay: "(509) 972-9876",
      phoneTel: "+15099729876",
      mapsUrl: "https://www.google.com/maps/place/Outback+Espresso+Coffee+Shop/@46.5585124,-120.6263724,17z",
      photo: "img/loc-ahtanum.jpg",
      // 0 = Sunday ... 6 = Saturday, 24h "HH:MM"
      hours: { 0: ["07:00", "16:00"], 1: ["05:30", "16:30"], 2: ["05:30", "16:30"], 3: ["05:30", "16:30"],
               4: ["05:30", "16:30"], 5: ["05:30", "16:30"], 6: ["07:00", "16:30"] }
    },
    {
      id: "north",
      name: "Wide Hollow",
      alt: "Outback North",
      blurb: "Our delicious variety of unique drinks and breakfast items are a staple to the West Valley community",
      address: "1212 S 80th Ave, Yakima, WA 98908",
      phoneDisplay: "(509) 966-7472",
      phoneTel: "+15099667472",
      mapsUrl: "https://www.google.com/maps/place/Outback+North+Espresso/@46.5824186,-120.6152221,17z",
      photo: "img/loc-north.jpg",
      hours: { 0: ["07:00", "16:00"], 1: ["05:30", "17:00"], 2: ["05:30", "17:00"], 3: ["05:30", "17:00"],
               4: ["05:30", "17:00"], 5: ["05:30", "17:00"], 6: ["07:00", "17:00"] }
    }
  ],

  /* ---------- MENU ---------- */
  sizes: ["12 oz", "16 oz", "20 oz", "24 oz", "32 oz"],
  menu: [
    {
      id: "coffee",
      title: "Coffee & Espresso",
      note: "Hot or iced. 32 oz is iced only.",
      items: [
        { name: "Americano", prices: [2.75, 3.25, 3.50, 4.00, 5.00] },
        { name: "Latte", detail: "Flavored", prices: [4.50, 4.75, 5.00, 5.75, 7.00] },
        { name: "Mocha", prices: [4.75, 5.00, 5.25, 6.00, 7.25] },
        { name: "White Chocolate Mocha", prices: [5.25, 5.50, 5.75, 6.50, 7.75] },
        { name: "Caramel Macchiato", prices: [5.25, 5.50, 5.75, 6.50, 7.75] },
        { name: "Breve / Eggnog", detail: "Eggnog is seasonal", prices: [5.00, 5.25, 5.50, 6.25, 7.50] },
        { name: "Cappuccino", detail: "Wet or dry", prices: [4.00, 4.25, 4.50, null, null] },
        { name: "Cold Brew", prices: [4.00, 4.25, 4.50, 5.25, 6.25] },
        { name: "Blended Drinks", prices: [5.25, 5.50, 6.00, 6.75, 8.25] }
      ]
    },
    {
      id: "more",
      title: "Tea, Chai & More",
      note: "Hot or iced unless noted. 32 oz is iced only.",
      items: [
        { name: "Chai", prices: [4.75, 5.00, 5.25, 5.75, 6.75] },
        { name: "Matcha", prices: [4.75, 5.00, 5.25, 5.75, 6.75] },
        { name: "Italian Soda", prices: [4.00, 4.25, 4.50, 5.00, 6.00] },
        { name: "Iced Tea / Lemonade", prices: [2.50, 2.75, 3.00, 3.50, 4.50] },
        { name: "Flavored Milk", detail: "8 oz kids size $2.75", prices: [4.00, 4.25, 4.50, 5.00, 6.00] }
      ]
    },
    {
      id: "energy",
      title: "Red Bull, Lotus & Spark",
      note: "Pick Red Bull or Lotus. Ask about today's flavors and blended versions.",
      sizes: ["24 oz", "32 oz"],
      items: [
        { name: "Red Bull / Lotus", detail: "Flavored", prices: [5.50, 8.50] },
        { name: "Red Bull / Lotus Specialty", prices: [6.00, 9.00] }
      ],
      extra: { name: "Detox Water", options: [["1 fruit", 1.75], ["2 fruit", 2.25], ["3 fruit", 2.75]] }
    }
  ]
};
