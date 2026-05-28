# GNA Fast Quote - Working Core Prototype

This folder contains a lightweight browser prototype that demonstrates the core feature of the GNA Fast Quote web app:

**Upload/read plans -> review extracted information -> price using Excel-derived material data -> contractor adds labour rates -> generate a PDF-ready quote.**

## How to run

1. Unzip the folder.
2. Open `index.html` in Google Chrome or Microsoft Edge.
3. Move through the 5 demo steps using the red buttons.
4. On the final step, click **Open PDF-Ready Quote** and use the browser print dialog to save as PDF.

No server is required for this prototype.

## What is included

- `index.html` - main prototype interface
- `styles.css` - GNA Fast Quote UI styling
- `app.js` - extraction, pricing, labour and quote logic
- `data.js` - data extracted from the sample plan and Excel price sheets
- `assets/0. Plan.pdf` - sample architectural plan
- `assets/GNA Constraction price list App data.xlsx` - source price workbook
- `assets/GnA_Quote_Final.xlsx` and `assets/GnA Quote master.xlsx` - quote references
- `assets/plan_renders/` - rendered plan previews
- `demo_script.md` - client-facing summary/script
- `codex_instructions.md` - instructions and prompts for rebuilding this as a production-ready app with Codex

## Demo limitation

The prototype uses a controlled extraction model from the sample plan. It does not yet perform full production CAD/PDF geometry extraction from any uploaded plan.
