# Jason Slim: portfolio

An interactive portfolio inspired by the layout of [learn-arduino](https://learn-arduino-red.vercel.app/).
Instead of a 3D model, the stage shows a **live, working mockup of each project**: a real shell
interpreter, a JS port of the miniRT ray tracer, a live RFC 6238 TOTP generator, and more.

Plain HTML/CSS/JS (ES modules). No build step, no dependencies.

## Run locally

Any static server works (ES modules don't load from `file://`):

```bash
python3 -m http.server 5173
# open http://localhost:5173
```

## Deploy to Vercel

```bash
npx vercel        # framework preset: "Other", no build command, output dir: .
```

Or push the folder to a GitHub repo and import it at vercel.com/new.

## Where things live

| File | What |
|---|---|
| `js/data.js` | All content: profile, experience, skills, projects (text, stack, code, tags) |
| `js/demos.js` | One live mockup per project id |
| `js/main.js` | Layout scaling, sidebar/flyouts, info + code cards, callout tags, routing |
| `css/style.css` | Design tokens and all styles (compact layout under `html.compact`) |
| `assets/Jason_Slim_CV.pdf` | CV linked from the sidebar |

To add a project: add an entry to `PROJECTS` in `data.js` and a demo function with the same id in `DEMOS` (`demos.js`).
Elements inside a demo marked `data-tag="key"` are what the callout tags (`tags: [{ key, label, text }]`) point at.

Keyboard: ← / → switch projects, R replays the demo, Space runs the code card.
