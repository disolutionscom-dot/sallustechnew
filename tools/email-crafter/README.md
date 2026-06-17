# MailCraft Studio

An open-source, multi-user visual email designer. Visitors sign in with Google, build branded and interactive emails in a drag-and-drop editor, upload images and video to their own Google Drive, send from their own Gmail, and **schedule one-time or recurring campaigns** — all with no servers, no databases, and no third-party storage.

Built on Google Apps Script, so it runs entirely inside each user's own Google account.

---

## Features

- **Sign in with Google** — handled by the Apps Script web-app gate.
- **Send from your own account** — each user sends through their own Gmail; recipients get individual copies.
- **Recurring & scheduled sends** — send now, schedule once, or repeat daily / weekly / monthly. Manage and cancel from the **Scheduled** panel.
- **Drag-and-drop editor** — 14 block types (logo, heading, text, button, image, image + text, button-on-image, animated GIF, video, two columns, divider, spacer, social icons, footer).
- **Media uploads to your own Drive** — images and video saved to a `MailCraft Studio Uploads` folder in the signed-in user's Drive.
- **Reliable image rendering** — uploaded images are embedded inline (CID) at send time, so they display even when remote images are blocked.
- **Email-safe HTML** — table layout, fully inlined CSS, bulletproof VML buttons for Outlook, mobile-responsive.
- **Brand kit, starter layouts, templates, JSON import/export, desktop/mobile preview.**

---

## How GitHub and Apps Script fit together

This is important: **GitHub hosts the source code; the live app runs on Google Apps Script — not on GitHub Pages.** A static GitHub page cannot send email from a visitor's Gmail, because that requires Google's authenticated backend, which Apps Script provides.

```
GitHub repo (source, open source)  ──clasp push──►  Apps Script project (the running web app)
        ▲                                                     │
        └────────────────── clasp pull ──────────────────────┘
```

So the workflow is:
1. Keep the canonical code in your **GitHub repo** (for sharing, versioning, contributions).
2. Deploy/sync it to **Apps Script**, which gives you the live `/exec` URL.
3. Embed that `/exec` URL in your website with an `<iframe>` (the server already allows framing).

---

## Repository structure

```
mailcraft-studio/
├── Code.gs            # Server: auth, Drive uploads, sending, scheduling
├── Index.html         # The full editor (front end)
├── appsscript.json    # Manifest: scopes + web-app config
├── .clasp.json        # Links the repo to your Apps Script project (add your scriptId)
├── .gitignore
├── LICENSE            # MIT
└── README.md
```

---

## Setup — Option 1: manual (no tools, ~5 minutes)

1. Go to **https://script.google.com → New project**.
2. Paste `Code.gs` into the default code file.
3. **File → New → HTML**, name it exactly `Index`, and paste in `Index.html`.
4. **Project Settings → “Show appsscript.json manifest file”**, then replace the manifest with the provided `appsscript.json`.
5. **Deploy → New deployment → Web app:**
   - **Execute as:** *User accessing the web app*
   - **Who has access:** *Anyone with a Google account* (or your organisation)
6. **Deploy**, authorise the permissions, and copy the **/exec** URL.

## Setup — Option 2: GitHub + clasp (keeps repo and app in sync)

[clasp](https://github.com/google/clasp) is Google's command-line tool for Apps Script.

```bash
npm install -g @google/clasp
clasp login

# create a new bound script project (or use an existing scriptId)
clasp create --type webapp --title "MailCraft Studio"

# put the scriptId it prints into .clasp.json, then push your files:
clasp push

# open it in the browser to deploy as a web app:
clasp open
```

After `clasp push`, finish the **Deploy → New deployment → Web app** step in the browser (same settings as Option 1). From then on, `git pull` + `clasp push` keeps GitHub and the live app aligned.

---

## Recurring & scheduled sends — how it works

When a user schedules a campaign, the app:
1. saves the full campaign (recipients, subject, HTML, image references) as a JSON file in **their own Drive**, and
2. creates a **time-based trigger** that runs as that user.

When the trigger fires, the campaign is sent from the user's account. One-time sends clean themselves up afterwards; recurring sends repeat until cancelled in the **Scheduled** panel.

Notes:
- Times use the **app's time zone** (set in `appsscript.json` — currently `Asia/Dubai`).
- Google fires time triggers within a short window of the chosen time (about 15 minutes for one-time, within the hour for recurring) — they are not to-the-second exact.
- Apps Script allows up to **20 triggers per user**, so each user can hold up to ~20 active schedules.

---

## Permissions it requests

| Scope | Why |
|---|---|
| `gmail.send` | Send the designed email from the user's own account |
| `drive` | Save uploaded media and scheduled campaigns to the user's own Drive, and read them back |
| `userinfo.email` | Greet the user and address test sends |
| `script.scriptapp` | Create the time-based triggers for scheduled sends |

The app never reads the user's inbox or unrelated Drive files.

---

## Going fully public (important)

`gmail.send` is a **restricted scope**. In **Testing** mode it works immediately for you and up to 100 added test users. To open it to the **general public**, Google requires the project to pass **OAuth verification** (a consent-screen security review). For personal, internal/organisation, or self-hosted use, no review is needed.

---

## Honest notes on email rendering

- **Images** display everywhere (embedded inline at send time).
- **Animated GIFs** animate in most clients; Outlook 2007–2019 shows only the first frame — design that frame well.
- **Video does not play inside the inbox** except in Apple Mail. Elsewhere, an uploaded video becomes a **thumbnail with a play button that opens the video** (the approach Salesforce and Mailchimp use). The app auto-generates the thumbnail.
- **JavaScript** never runs inside email; all interactivity lives in the editor only.

Always use **Preview** and a **test send** before a real campaign.

---

## Sending limits

Set by Google, per account, per day: roughly **100 recipients** on free Gmail and **1,500** on Google Workspace.

---

## Tech

Front end: single `Index.html` (vanilla HTML/CSS/JS, no build step). Back end: Google Apps Script (`Code.gs`). Storage: the signed-in user's Google Drive. No servers, no database, no external dependencies.

---

## License

MIT — free to use, modify, and redistribute. See `LICENSE`.
