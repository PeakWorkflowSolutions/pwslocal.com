# Connect the quote request form to a Google Sheet

About 10 minutes, once. Do this in the Google account that should own the requests (for example aldenscleanteam@gmail.com).

## 1. Make the sheet

1. Go to **sheets.new** to create a blank Google Sheet.
2. Name it something like **Alden's Clean Team - Quote Requests**.

You don't need to add any columns. The script creates a **Requests** tab with these headers the first time a request comes in:

| Received | Reference | Service | How often | Preferred day | Time of day | Street | City | Bedrooms | Bathrooms | Size | Name | Phone | Email | Notes | Status | Who's going | Price quoted |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|

The last three columns are for the team:
- **Status** starts as "New". Change it to Called, Visited, Quoted, Booked, and so on.
- **Who's going**: Dave, Lyndsay or Leah.
- **Price quoted**.

## 2. Add the script

1. In the sheet, open **Extensions → Apps Script**.
2. Delete everything in `Code.gs` and paste in the whole contents of `google-sheet/Code.gs` from this folder.
3. Optional: to get an email for every new request, put an address in the line `var NOTIFY_EMAIL = "";`, for example `var NOTIFY_EMAIL = "aldenscleanteam@gmail.com";`.
4. Click **Save**.

## 3. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set **Execute as** to **Me**, and **Who has access** to **Anyone**.

   "Anyone" is needed so website visitors can send a request. They can only add a row. They can't see or change the sheet.
4. Click **Deploy**, then **Authorize access** and allow it.

   Google may show a "Google hasn't verified this app" screen. That's normal for your own script: click **Advanced → Go to (project name)**.
5. Copy the **Web app URL**. It looks like `https://script.google.com/macros/s/AKfy.../exec`.

To check it works, open that URL in a browser. You should see `{"ok":true,"message":"Alden's Clean Team quote requests endpoint is running."}`.

## 4. Put the URL in the website

1. Open `js/config.js` and find this block near the top:

   ```js
   sheet: {
     url: ""
   },
   ```
2. Paste the Web app URL between the quotes.
3. Save, then re-upload the site to Netlify by dragging the folder or zip onto the site's **Deploys** tab.

Then send a test request from the live site. A new row should appear in the **Requests** tab within a few seconds.

## Good to know

- **Demo mode.** While `url` is empty, the form still works but sends nothing. The confirmation screen says "Demo mode: this request was not sent anywhere."
- **Use the Netlify site.** The Claude artifact preview can't send to Google, because it blocks outside connections. Use the Netlify site for real requests.
- **If you change Code.gs later,** use **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. That keeps the same URL. A "New deployment" gives a new URL, which you'd then have to paste into `config.js` again.
- **If the sheet can't be reached,** the customer sees "Sorry, your request didn't go through. Please try again, or call Dave at (509) 952-9488." They never see a false confirmation.
- **Safety:** every value is saved as plain text, trimmed to 500 characters. Anything that looks like a spreadsheet formula is escaped so it can't run.
