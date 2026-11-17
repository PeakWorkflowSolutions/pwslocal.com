/* =====================================================================
   REVITALIZE CLEANING SERVICES - SITE SETTINGS (EDIT HERE)
   ===================================================================== */
window.RCS = {
  /* Paste the Apps Script Web app URL here (see google-sheet/SETUP.md).
     Empty = demo mode: the form works but sends nothing. */
  sheetUrl: "",

  facebook: "https://facebook.com/people/Revitalize-cleaning-services/61575773371956/",
  timezone: "America/Los_Angeles",

  /* Quote form choices */
  services: ["Residential cleaning", "Recurring maintenance cleaning", "Deep cleaning", "Move-in cleaning",
             "Move-out cleaning", "New construction cleaning", "Real estate listing cleaning", "Commercial cleaning"],
  properties: ["House", "Apartment / condo", "New build", "Office", "Restaurant", "Other business"],
  sizes: ["Not sure", "Under 1,000 sq ft", "1,000 - 2,000 sq ft", "2,000 - 3,000 sq ft", "3,000 - 4,000 sq ft", "Over 4,000 sq ft"],

  confirmText: "Thank you! Mari or Damian will reach out to talk about your space and give you a quote.",
  demoNote: "Demo mode: this request was not sent anywhere. Once the Google Sheet is connected, requests land there."
};
