# Client dashboards: one-time setup

This sets up the live client dashboards at **https://system.zkjverse.com/app/**.
You only do it once. Every step works on a phone or a laptop at **supabase.com/dashboard**, in your ZKJ SYSTEM project.

**Already done for you:**

- **You are the admin.** Your login, kj@zkjverse.com, becomes admin automatically.
- **Both clients already exist.** Step 1 creates them:
  - **KJ VISION** (client #1, case study): its real audit numbers, the first 5 posts from the 30-day calendar waiting for approval, the audit and strategy reports, and a welcome message.
  - **ZKJ VERSE** (client #2, Growth package): a welcome message only.
- **You land on ZKJ SYSTEM HQ.** As admin you first see HQ: one card per client (what's waiting for the client, your to-do, this week, published this month), your to-do list across all clients, and this week's timeline. Tap **Open workspace** on a card to see exactly what that client sees. A client login for each brand is optional; you can invite one later.
- **Both brands are yours.** They are marked `internal = true` (own brand), so in their workspace you can **Approve as owner**. For any other client only the client can approve; you see "Waiting for client" instead.

---

## 1. Create the database (5 minutes)

1. Open your project, then **SQL Editor** in the left menu.
2. Tap **New query**.
3. Open the file `supabase/schema.sql` from this website's code, copy **all** of it, and paste it into the editor.
4. Tap **Run**. You should see "Success. No rows returned".
5. Check the result: go to **Table Editor → clients**. You should see **KJ VISION** and **ZKJ VERSE**.

It is safe to run the file again later, for example after an update. It never deletes or overwrites your data.

## 2. Turn off public sign-up

1. Go to **Authentication → Sign In / Providers**.
2. Make sure **Email** is **on**.
3. Turn **"Allow new users to sign up" OFF** and save.

With sign-up off, nobody can create an account on their own. Only people you invite can log in.

## 3. Set the website address

1. Go to **Authentication → URL Configuration**.
2. Set **Site URL** to `https://system.zkjverse.com/app/`
3. Under **Redirect URLs**, add both of these:
   - `https://system.zkjverse.com/app/`
   - `https://system.zkjverse.com/app/login.html`
4. Save.

This makes invite and "forgot password" emails open your dashboard.

## 4. Invite yourself and check you're admin

1. Go to **Authentication → Users** and tap **Invite user**.
2. Enter **kj@zkjverse.com** and send.
3. Open the email and tap the link. Your dashboard opens and asks you to **choose a password**. Choose one and save it.
4. Check that you're admin. Either:
   - you see an **ADMIN** label, a client switcher (KJ VISION / ZKJ VERSE) and **Admin tools** at the bottom of the dashboard, or
   - in **Table Editor → profiles**, your row says `role = admin`.

From now on, sign in at **https://system.zkjverse.com/app/login.html**. The site footer and the demo dashboard also have a **Client login** link.

## 5. Give a client their own login (optional, anytime)

KJ VISION and ZKJ VERSE already exist, so for them start at step 2 below.

1. **New client only:** add the brand.
   1. Go to **Table Editor → clients** and tap **Insert row**.
   2. Fill in:
      - `name`, and `name_ar` for the Arabic name
      - `logo_url`: a link to the logo image
      - `primary_color` and `accent_color`, for example `#0B0B0F` and `#D4AF37`
      - `instagram`: the handle
      - `plan`, and `plan_ar` for Arabic: the package name, for example `Growth` / `النمو`
      - `internal`: leave it **false** for a real client. Set it to true only for your own brands.
   3. Save. The new client appears as a card on HQ.

   The plan decides which panels the client sees:
   - **Starter:** approvals, calendar, numbers and reports.
   - **Growth:** the same, plus inbox replies.
   - **Full:** everything, including Ads and WhatsApp.

   Panels that aren't in the package show an "Add to your package" note.
2. **Invite the client's email.** Go to **Authentication → Users → Invite user**. They get an email and choose their own password.
3. **Link the login to the brand.** Go to **Table Editor → profiles**, find their email, and set `client_id` to the brand's `id` from the clients table. Save.

Until you link them, the client sees: *"Your account isn't linked yet — KJ will set it up."*

The client can now log in. They see only their own brand.

## 6. Add content, numbers and messages from your dashboard

1. Sign in. You land on **ZKJ SYSTEM HQ**.
2. Open **Control Center** (in the dock, or **More** on a phone), choose the client, then:
   - **Add an item:** type (post, reel, story, carousel, reply or ad), title and caption in English and Arabic, media link, platform and date. The status starts as **Needs your approval**, so it appears in the client's approvals queue and on the calendar.
   - **Add a key number:** for example "Followers", 1358, as of today. It shows at the top of the client's dashboard.
   - **Send a notification:** it appears under the client's bell.
3. When a client taps **Approve** or **Request changes** (with a note), you get a message under **your** bell and in **Your to-do** on HQ. Changes requested show the client's note.
4. Anything else, for example changing a status to *scheduled* or *published*, or adding a report file link: use **Table Editor**. Edit the row in `items` or `reports`.

Drafts (status `draft`) stay hidden from clients until you change the status.

## 7. Never share these

- **Never share or paste the `service_role` key** (Project Settings → API) anywhere: not in the website, not in WhatsApp, not in email. It can read and change everything.
- **Never share the database password.**
- The **publishable key** (`sb_publishable_…`) in the website code is meant to be public. That's fine. The security rules from step 1 protect the data.
- If you think a secret leaked, rotate it in **Project Settings → API / Database** straight away.
