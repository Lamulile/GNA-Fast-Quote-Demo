# Client Demo Script - GNA Fast Quote

## What this demo is

This is a working proof-of-concept for the core GNA Fast Quote workflow. It demonstrates how a contractor can upload/read an architectural plan, review extracted plan information, apply pricing from the approved Excel pricing data, add labour rates, and generate a PDF-ready quote.

The purpose is to prove the business logic and user journey before building the full production system.

## Demo flow

1. **Upload Plan**  
   The app shows the uploaded architectural plan and preview. In the full version, the user would upload PDF, DWG/DXF or supported drawing formats.

2. **Review Extracted Information**  
   The app displays extracted values such as ground floor area, first floor area, total area, doors, windows, room labels and key plan notes. The contractor can edit or confirm the values before pricing.

3. **Pricing Engine**  
   The confirmed quantities are mapped against the approved Excel price data. The demo uses material items such as bricks, cement, ready-mix concrete, roof tiles, ceiling boards, doors and windows.

4. **Add Labour Rate**  
   The contractor enters labour rates for brickwork, plastering, roofing, painting, tiling, plumbing, electrical, general labour and additional costs.

5. **Generate PDF Quote**  
   The app combines the material cost, labour cost, mark-up, VAT and transport/location allowance into a final PDF-ready quote.

## What this demo is not

This is not yet the full production application. It does not yet include full user registration, NHBRC verification, payment gateway integration, credit deduction, admin approval, cloud file storage, or full automated CAD/PDF measurement extraction from every possible architectural drawing.

## Recommended next step

Approve the workflow and pricing logic, then proceed to a production MVP that adds authentication, admin verification, payment/credits, secure cloud storage, a real extraction service, and production PDF generation.
