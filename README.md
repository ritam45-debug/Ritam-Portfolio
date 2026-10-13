# Ritam Dhara — Portfolio

*Where Finance Meets Data, Strategy & AI*

**Live site:** https://ritam45-debug.github.io/Ritam-Portfolio/

React 18 · TypeScript · Vite 6 · Tailwind CSS 4 · Recharts · Lucide icons. Static site: no database, no server, no paid services.

## What's on the site

| Section | What it shows |
|---|---|
| Hero | Animated aurora background, interactive "data → decision" chart, ticker tape of real project figures |
| About | Education, toolkit, focus areas |
| Projects | **Blue Star Ltd** equity snapshot (individual) and **Wires & Cables: Polycab vs KEI vs R R Kabel** (FADM group project) as interactive dashboards, with the original summary page and all 26 deck slides in a full-screen viewer |
| Competition record | 60 competitions with filters, charts and a searchable table |
| Finance trivia / Marketing trivia | Two separate quiz sections; 4-option questions generated fresh each time (calculations with random numbers, glossary matching, fact bank), score and streak |
| Consult | Question box (emails you), notification bell, WhatsApp and email contact |

Extras: three colour themes (Aurora, Saffron, Orchid) plus light/dark mode, both remembered per visitor; scroll-reveal animations and reading-progress bar; full keyboard support; respects "reduce motion".

## Consulting box, bell and contact

- **Questions** from the Consult form are emailed to mathsbaba61@gmail.com by [FormSubmit](https://formsubmit.co) (free, no account). **One-time activation:** the very first question sent from the live site makes FormSubmit email you an "Activate Form" link. Click it; questions are only delivered after that. Send yourself a test question right after deploying.
- **Bell icon:** each question also posts a short alert (topic and time only, never names or emails) to the public [ntfy.sh](https://ntfy.sh) topic `ritam-portfolio-consult-8q4z`. The bell polls that topic. ntfy.sh keeps messages only for a limited time (hours), so your email inbox is the permanent record.
- **Phone push alerts:** install the free **ntfy** app (Android / iOS), tap **+**, and subscribe to `ritam-portfolio-consult-8q4z`. You get a push notification for every new question.
- **Change the topic or email:** edit `consult` and `contact` in `src/content/profile.ts`. Because the topic name is in public code, anyone could post to it; if that happens, change the topic name.
- **WhatsApp** links use `https://wa.me/917602039771` (India +91). **Email** shows mathsbaba61@gmail.com with a copy button.

## Original files

The PDFs behind each project live in `public/files/` and open from the project cards ("Original file" / "Open PDF"). The FADM deck there is a web-sized copy (8.6 MB) of the original 17.6 MB file; replace it with the same file name to update it.

---

## How deployment works

```
you edit files  →  git push to main  →  GitHub Actions builds the site  →  gh-pages branch  →  live site
```

The workflow lives in `.github/workflows/deploy.yml`. Every push to `main` rebuilds and republishes automatically, usually within 1–2 minutes.

### First-time setup (already done for ritam45-debug/Ritam-Portfolio)

1. **Create the repo.** On github.com/new, name it `ritam-portfolio`, make it **Public**, and leave README/.gitignore/licence unticked.
2. **Push the code** from this folder:
   ```bash
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/ritam45-debug/Ritam-Portfolio.git
   git push -u origin main
   ```
3. **Let the workflow run.** Open the repo's **Actions** tab and wait for "Deploy to GitHub Pages" to show a green tick. It creates the `gh-pages` branch.
4. **Turn on Pages.** Go to **Settings → Pages**. Under *Build and deployment*, set **Source: Deploy from a branch**, **Branch: `gh-pages`**, folder **`/ (root)`**, then **Save**.
5. **Open the site** at `https://ritam45-debug.github.io/Ritam-Portfolio/`. The first publish can take a few minutes; Settings → Pages shows the live URL when it's ready.

### Updating the site later

1. Edit the files you need (see *Update your content* below).
2. Check it locally: `npm run dev`, then open http://localhost:5173
3. Push:
   ```bash
   git add .
   git commit -m "Describe the change"
   git push
   ```
4. Watch the **Actions** tab; when it's green, refresh the live site (hard refresh: Ctrl/Cmd + Shift + R).

You can also edit a file directly on github.com (pencil icon → *Commit changes*); that triggers the same automatic deploy.

### If you rename the repo or use a custom domain

- **Renamed repo:** the workflow reads the repo name automatically. Also update the `og:url` / `og:image` URLs in `index.html` and `siteUrl` in `src/content/profile.ts`.
- **Custom domain (e.g. ritamdhara.com):** add the domain in **Settings → Pages → Custom domain**, add the DNS records GitHub shows you at your domain registrar, then change `VITE_BASE` in the workflow from `/${{ github.event.repository.name }}/` to `/` and update the URLs above.

### Other hosts

- **Netlify:** *Add new site → Import from Git*, pick the repo. Build command `npm run build`, publish directory `dist`. No base path needed.
- **Vercel:** *Add New → Project*, import the repo, framework preset **Vite**. No base path needed.
- **No build at all:** `npm run build:single` produces one self-contained `dist-single/index.html` (about 3.8 MB, images included) that you can drop onto any static host, e.g. Netlify Drop.

---

## Run it locally

Requires Node 18+.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # serve dist/ locally
npm run build:single # one self-contained HTML file → dist-single/index.html
```

## Update your content

All content lives in `src/content/`; components never need editing for content changes.

| To… | Edit |
|---|---|
| Bio, education, tools, LinkedIn | `profile.ts` |
| Blue Star or FADM figures, takeaways, team | `work.ts` |
| Replace FADM slide images | `src/assets/fadm/slide-01.jpg` … `slide-26.jpg` (keep the names; titles are in `work.ts → fadm.slides`) |
| Replace the Blue Star summary image | `src/assets/bluestar-summary.jpg` |
| Add or fix a competition | `competitions.ts` (one line per competition) |
| Trivia questions (add facts, terms or calculation templates) | `trivia.ts` |
| Ticker-tape figures | `TAPE` list at the bottom of `src/components/Hero.tsx` |

Parked sections (Analytics playground, Learning journey, Interests, Ask Ritam, Journal, Contact) are still in `src/components/` and can be switched back on in `src/App.tsx`.

## Checklist

- [x] Production build and type-check pass
- [x] Loads correctly under the `/ritam-portfolio/` path, all images resolve
- [x] Works at phone width with no sideways scrolling
- [x] Light/dark and all three colour themes
- [ ] After the first deploy, open the live link on your phone
- [ ] Optional: share the link on LinkedIn to check the preview image
