# Abdul Kaium portfolio (Next.js static export for GitHub Pages)

## Run locally
    npm install        # creates package-lock.json; commit it, then CI uses npm ci automatically
    npm run dev        # http://localhost:3000   (editor: /admin/   blog editor: /admin/blog/)
    npm run build      # prebuild writes sitemap.xml, robots.txt, feed.xml, then exports to out/

## Add your real details (nothing is invented for you)
Edit `lib/content.js`: PROFILE (email, github, linkedin, availability, location, timezone), STATS, EXPERIENCE,
TESTIMONIALS, LEVELS, ESTIMATE. Empty values are hidden from the site. The Download CV button builds a printable CV
from this data (choose Save as PDF in the print dialog).

## Admin login and publishing
The admin UI now requires Supabase Email/Password authentication; the old password-free “Enter workspace” button is disabled. GitHub Pages is still static, so this is suitable for signing in to the local export workflow, not for protecting private server data or directly writing to GitHub.

1. Create a Supabase project. In **Authentication → Providers**, enable Email and Password; enable email confirmation. Create your own admin user and use a unique password (MFA is recommended if enabled for your project).
2. In **Project Settings → API**, copy the Project URL and the publishable/anon key. Never use the `service_role` key in frontend code or any `NEXT_PUBLIC_` variable.
3. In GitHub repository **Settings → Secrets and variables → Actions → Variables**, add `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `ADMIN_EMAILS` (comma-separated exact allowed email addresses). They are injected during the static build. Re-run the workflow after adding them.
4. To publish projects and blog posts, sign in at `/admin/` or `/admin/blog/`, edit and export JSON, replace `public/data/projects.json` or `public/data/posts.json`, then commit and push. Drafts are saved in this browser only.
5. If you later connect Supabase tables for persistent content, enable Row Level Security (RLS) on every table and add write policies restricted to the authenticated admin. Do not rely on hiding the admin page as database security.

If Supabase variables are missing, admin access fails closed and shows setup instructions.

## Deploy on GitHub Pages
Repo Settings > Pages > Source: GitHub Actions. The workflow builds `out/` and sets the base path from the repo name.
Your site: https://USERNAME.github.io/REPOSITORY/

## Optional services (repo Settings > Secrets and variables > Actions > Variables)
- FORM_ENDPOINT: a Formspree (or similar) form URL for real email delivery. Without it the form opens the visitor's email app.
- PLAUSIBLE_DOMAIN: enables Plausible analytics. Without it no tracking script is loaded.
Never put secrets in NEXT_PUBLIC_ variables: they are visible in the browser.

## Known limitations
The admin sign-in uses Supabase Auth, but the content editor remains a browser-local static export workflow: no direct repository writes and no server-side CMS. A static frontend cannot keep private credentials or enforce authorization for private data; use backend endpoints plus Supabase RLS policies before storing or editing protected data.

## Project pages and case studies
Every project in `public/data/projects.json` gets a static page at `/projects/<slug>/` (slug is optional; it defaults to the title).
Optional fields (all backward compatible): slug, date, overview, problem, solution, decisions, api, challenges, performance,
security, results, lessons (text, or a list), flow (list shown as an architecture diagram), benchmarks ([{k, v}] real numbers only),
caps (screenshot captions). Missing fields are simply not shown. The admin editor has a "Case study" section for these.
Screenshots: the admin stores compressed images inside the JSON, which makes pages heavy. For best performance put image files in
`public/img/` and use paths like `/img/shop-1.jpg` in `shots`; they are base-path aware.
Filter state is shareable: `/?q=api&tag=Next.js&sort=newest`.

## Blog
Posts live in `public/data/posts.json` (fields: id, date YYYY-MM-DD, title, tags, excerpt, body in Markdown, optional slug, optional draft).
Each published post gets a static page at `/blog/<slug>/` with table of contents, reading progress, copy-code buttons, syntax highlighting,
related articles and BlogPosting JSON-LD. Posts with `"draft": true` are hidden from the site, static pages, feed and sitemap.
The home page lists articles with search, tag filter and Load more. Markdown HTML is escaped; only https links and images are allowed.

## Social share image
Open /admin/og/, download og.png, save it as `public/og.png`, set NEXT_PUBLIC_SITE_URL, commit and push. Without the file no share image is added.

## Analytics events (optional, Plausible)
Set the PLAUSIBLE_DOMAIN variable. Page views, including each project and article page, are automatic. In Plausible create custom goals named:
`CTA: View work`, `Click: GitHub`, `Click: LinkedIn`, `Demo click`, `Repo click`, `CV download`, `Copy email`, `Contact submitted`, `Read: <article title>`.
Demo and repo clicks carry the project name as a property. Nothing is sent when no provider is configured or when the browser sends Do Not Track.

## Spider cursor
A spider follows the mouse on every page, walking on 8 legs and spinning a web behind it. Click to shoot a web; stop moving and it weaves an orb web.
Threads are spun in real time, sag and sway gently, carry dew drops, and meet at small knots. Click or pause and it weaves a full orb web (spokes, anchor lines, frame and spiral). Webs are attached to the page, so they stay put when you scroll, and fade after about 11 seconds. It is off on touch devices and for visitors who prefer reduced motion.
Switch effect (spider, snake, off) with Ctrl+K > "Cursor effect", the terminal command `cursor`, or the Aa panel on the home page. The choice is remembered.


## Your data and the profile editor
Your personal data lives in `lib/profile.js` (name, links, stats, experience, testimonials, skill levels, estimator). Open /admin/profile/, fill the form,
fix any validation messages, download `profile.js`, replace `lib/profile.js`, commit and push. Empty fields and lists stay hidden on the site.
`public/data/projects.json` starts with one real case study (this portfolio itself). Edit or replace it in /admin/ and export your own projects.

The default cursor effect is the snake (works on every page). Switch to spider or off with Ctrl+K > Cursor effect, the terminal command `cursor`, or the Aa panel. The footer lists your section links plus LinkedIn, Email and GitHub; each appears only once you set it in lib/profile.js (or /admin/profile/).

## Engineering features
- `npm run validate` checks projects, posts and decision records; `npm test` runs the Node test suite (no extra dependencies). Both run in CI and `prebuild`.
- Project case studies accept optional fields: audience, requirements, api, testing, deployment, limitations, results, lessons, docsUrl, adr (list of ADR ids), architecture ({nodes, edges}). Missing fields are not shown; the table of contents appears only for long case studies.
- Decision records live in `content/engineering/adr/*.md` (front matter: id, title, date, status) and render at `/engineering/`.
- Docs: `docs/DEPLOYMENT.md`, `docs/ARCHITECTURE.md`, `docs/PERFORMANCE.md`, `docs/ENGINEERING-ROADMAP.md`.

## More checks and tools
- `npm run check-export` checks the exported HTML in `out/` (title, lang, description, one h1, image alt, canonical URL). CI runs it after the build.
- `npm run check-links` checks external links (projects, profile). Optional; it never runs in the build, and unreachable is reported separately from broken.
- The build writes `public/data/github.json` (public repositories snapshot) and `public/sw-version.js` (a new service-worker cache name per deployment).

## Restored personal details, contact form, and CV status

The portfolio contact form uses FormSubmit's AJAX endpoint for `kaiumabd10@gmail.com`, compatible with static hosting. The first submission requires activating the confirmation message sent by FormSubmit to that inbox; actual delivery has not been tested from this offline workspace. Never put a Gmail password or private API secret in the client bundle.

The supplied project ZIP does **not** contain `public/cv.pdf` or another attached CV PDF. Typing `cv` in the homepage terminal opens the generated printable CV built from the profile data and asks the visitor to choose **Save as PDF**. To use an uploaded CV file instead, add the actual approved PDF at `public/cv.pdf` and update the button/terminal behavior deliberately. No CV file has been fabricated.

Profile data restored from prior user instructions includes the supplied email, GitHub/LinkedIn links, `CSE @ BUET` footer text, four experience entries, skill radar values, project estimator options, and the two provided testimonial placeholders. Company/client placeholder labels should be replaced with truthful details before public use.

