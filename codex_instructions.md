# Codex Instructions for Production Build

You do not need Codex to review this prototype. The prototype can run by opening `index.html` in a browser.

Codex is useful when converting this prototype into a proper Next.js/Laravel/Node application. OpenAI describes Codex as a coding agent that helps write, review and ship code.

## What to upload to Codex

Upload or add this full folder to a GitHub repository:

- `index.html`
- `styles.css`
- `app.js`
- `data.js`
- `assets/0. Plan.pdf`
- `assets/GNA Constraction price list App data.xlsx`
- `assets/GnA_Quote_Final.xlsx`
- `assets/GnA Quote master.xlsx`
- `demo_script.md`

## Prompt 1 - Convert prototype to Next.js

```text
Convert this static GNA Fast Quote prototype into a production-quality Next.js 14 application using TypeScript and Tailwind CSS.

Keep the same user flow:
1. Upload Plans
2. Review Extracted Info
3. Pricing Engine
4. Add Labour Rate
5. Generate PDF Quote

Requirements:
- Use the existing styling as the design reference.
- Create reusable components for sidebar, wizard stepper, cards, tables, inputs, quote preview and buttons.
- Use the supplied data.js values as seed data.
- Keep all pricing in South African Rand (ZAR / R).
- Output must run with npm install and npm run dev.
- Include a README with setup instructions.
```

## Prompt 2 - Add Excel import

```text
Add Excel import support to the GNA Fast Quote app using SheetJS/xlsx.

Requirements:
- Read the uploaded workbook named "GNA Constraction price list App data.xlsx".
- Import sheets: Building, Doors & Windows, ceiling, steel, timber and Roof.
- Detect columns: Product Code, Description, Quantity, Unit, Price, Incl VAT.
- Convert the workbook rows into a typed inventory structure.
- Build a pricing mapper that maps extracted plan quantities to product codes.
- Keep a clear audit trail showing which extracted measurement produced each priced item.
```

## Prompt 3 - Add PDF plan extraction service

```text
Add a plan extraction module for the uploaded 0. Plan.pdf.

Requirements:
- Use pdfjs-dist to preview PDF pages in the browser.
- Extract text from the PDF where available.
- Detect area schedule fields such as Ground Floor UFL, First Floor UFL, Grand Total, room names, doors and windows.
- Return editable extracted values.
- Do not promise perfect extraction; allow manual correction before pricing.
```

## Prompt 4 - Add quote PDF generation

```text
Add PDF quote generation to the GNA Fast Quote app.

Requirements:
- Use a server-side PDF generator or React PDF.
- The PDF must include GNA Fast Quote branding.
- Include project details, client details, material cost, labour cost, mark-up, VAT, grand total, assumptions and exclusions.
- The PDF should be the only final output for the user.
```

## Prompt 5 - Add authentication, admin and credits

```text
Extend the GNA Fast Quote app with authentication and admin workflows.

Requirements:
- User sign-up requires full name, email, company name, company registration, company address, NHBRC number, NHBRC certificate upload and password.
- Users remain pending until admin approval.
- Admin portal has two pages: Potential Users and Verified Users.
- Verified users can access the quote workflow.
- Add a credit wallet where 1 generated PDF quote deducts 1 credit.
- Add South African payment gateway integration as a future placeholder.
```
