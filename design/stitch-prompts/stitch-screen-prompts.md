# Stitch prompts for every Xana Life screen

How to use:
- Paste these in the same Stitch project as the Home screen, one prompt per message and in this order. Prompt 0 fixes the Home screen first.
- Paste each prompt whole. Every prompt repeats the style rules, so Stitch cannot drift.
- Attach only `xana-logo.png`. Do not attach the reference screenshots again: Stitch pasted pieces of them inside the product photos.
- Every name, price, label and message below is the real text from the live site. Keep them word for word.

---

## 0. Fix the Home screen (desktop)

```
Fix the existing Home (Desktop) screen. Change only the points below and keep everything else exactly as it is.

1. The design is cut off on the right: the basket button, the "Shop retail" button, the "Recommended" dropdown, the right half of the banner and the 4th product column all run past the edge. The frame is 1440 px wide. Centre all content in a 1320 px wide column with 60 px empty margin on both sides. Nothing may cross the right edge.
2. Product photos and small images contain pieces of screenshots (rows of category chips, parts of other cards, a page inside the banner photo tile). Remove all of these. Every photo area must hold one single product photo and nothing else: no text, no user interface, no screenshots. If you have no photo for a product, use a plain light grey #F6F7F5 area with a simple green #046938 outline package icon centred in it.
3. Numbers show a slashed zero (for example "2,5Ø0", "3Ø"). Set every number on the page in "Libre Franklin" so that zeros are plain round zeros. This applies to prices, counts, pack sizes, times and the licence number.
4. Pharmacy and Retail cards: replace the outline icons on the left with 72 x 72 px photos with 10 px rounded corners. Pharmacy: an orange vitamin effervescent tube next to a glass of water, on white. Retail: a pile of fresh vegetables (tomatoes, peppers, greens) on a wooden crate.
5. Offers banner: the 152 x 152 px white tile on the left shows only a green Royco Mchuzi Mix sachet photo, cropped to fill the tile.
6. Product cards row 1: the "SPONSORED" label and the "−12%" badge each appear twice. Show each badge only once, in the top left corner of the photo.
7. Product cards row 2 show the wrong photos (copies of row 1). Use: Cooking Oil Carton · 3L = three yellow 3 litre plastic jerrycans; Dry Red Wine · House Reserve = a wine bottle with a glass of red wine on white; Deep Heat Pain Relief Spray = a silver aerosol can on light grey; White Sugar = a plain white paper sugar bag on white.
8. In each grid row, the "+ Add to basket" buttons all sit on the same line at the bottom of the cards.
```

---

## 1. Home (Mobile, 390 px)

```
Create the Mobile version (390 px wide) of the existing Home (Desktop) screen. Same design system, same content and same order. Side padding 12 px. Change only what is listed.

STYLE (same as Home): page background #F7F8F6, white cards with 1 px border #DCE4DB and 14 px radius, no shadows, brand green #046938, near-black text #0A1510, muted text #5E6E64. Headings, prices, buttons and all numbers in "Libre Franklin" (bold 700 or extra bold 800); body text in "Atkinson Hyperlegible Next" 15 px. Buttons and inputs 10 px radius. No gradients, no decoration, no emoji. Product photos contain only the product, never text or screenshots.

1. Top strip (green #046938, white 12.5 px, centred): truck icon and "Free delivery in Nairobi over KSh 2,500" ("KSh 2,500" bold). The wholesale pickup text is hidden.
2. Header (white, 1 px bottom border): row 1 = Xana Life logo 34 px tall on the left; on the right a map pin icon with "Delivering to" (12 px muted) above "Nairobi" (13.5 px semi-bold); then a green basket button showing only the basket icon and a white circle with a green "0". There is no "Change area" link and no divider line on mobile. Row 2 = the search field at full width: fill #F6F7F5, 1 px border, magnifying glass icon, placeholder "Try panadol, sukuma or a bale of unga", white "Search" button inside on the right.
3. Division tabs in one line that scrolls sideways and is cut off at the right edge: "All 69" (green, 2 px green underline), "Pharmacy 25", "Retail 27", "Deli 5", "Liqu…". The counts are smaller and muted. The three text links from desktop are hidden.
4. Pharmacy card, then Retail card below it (10 px gap, 12 px padding each). Each: a 56 x 56 px photo with 10 px radius on the left, and beside it the heading (18 px extra bold) and text (13.5 px muted). Pharmacy also has the green line "Pharmacist on duty until 11pm". Below, in one row across the full card width: a solid green button that stretches to fill ("Upload prescription" with the Rx icon / "Shop retail"), then a green underlined text link on the right ("Shop pharmacy" / "This week's offers").
5. Offers banner (near-black #0A1510, white text, 14 px radius, 16 px padding): an 84 x 84 px white tile with 10 px radius showing the Royco sachet photo on the left; beside it "Royco Mchuzi Mix" (19 px extra bold), "KSh 250" (24 px extra bold) with "Back in stock" (14 px) after it, then "The 200g pack, in stock today and ready to ship." (13 px). Below, on its own row, a white button "Add to basket" with dark green #035A30 text. Two 34 px outlined chevron buttons (left, right) sit in the bottom-right corner. No dots, no close button.
6. "All products" (22 px extra bold) on the left; the "Recommended" dropdown on the right. The "69 products" pill is hidden. Below, the category chip row scrolls sideways, starting with "All" (solid green) and "On offer", "Pain & fever", "Cold & flu", "Vitamins"…, cut off at the right edge.
7. Product grid: 2 columns, 12 px gap. Same cards as desktop, in the same order (Ibuprofen 400mg Tablets, Royco Mchuzi Mix with "SPONSORED", Pishori Rice with "−12%", Cold Cuts Platter…). Card body padding 10 px by 11 px, product name 13.5 px, price 18 px. Full-width "+ Add to basket" button at the bottom of each card.
8. Fixed to the very bottom: a white bottom navigation bar with a 1 px top border and five equal items, each a 22 px outline icon above an 11 px semi-bold label: "Shop" (storefront icon, green, active), "Categories" (2x2 grid icon), "Pharmacy" (pill icon), "Orders" (package icon), "Basket" (basket icon). Inactive items are muted #5E6E64.
9. Directly above the bottom navigation, a full-width bar in #0A1510, 10 px by 12 px padding, 12.5 px light text #E6EDE7: a 7 px yellow #F9D04A dot, then "Royco · Mchuzi Mix on the shelf at KSh 250" with "Royco" in bold white, then a small solid green "Add" button on the right (12.5 px, 8 px by 12 px padding). No close button.
```

---

## 2. Pharmacy division page (Desktop)

```
Create a new Desktop screen (1440 px): "Pharmacy division". It is the Home screen after the shopper clicks the "Pharmacy" tab. Use the same design system and keep the top strip, header, Pharmacy and Retail cards, offers banner, wholesale box and footer exactly as on Home. Change only what is listed.

STYLE (same as Home): content centred in a 1320 px column; page background #F7F8F6; white cards, 1 px border #DCE4DB, 14 px radius, no shadows; brand green #046938; text #0A1510; muted #5E6E64. Headings, prices, buttons and all numbers in "Libre Franklin"; body in "Atkinson Hyperlegible Next". No gradients, no decoration. Product photos show only the product.

1. Division tabs: "Pharmacy 25" is active (green text, 2 px green underline). "All 69" is now plain ink text.
2. Catalogue heading: "Pharmacy", with the pill "25 products". "Recommended" dropdown on the right.
3. Category chips, in this order: "All" (solid green, active), "On offer", "Pain & fever", "Cold & flu", "Vitamins", "Mother & baby", "Skin care", "Diabetes care", "Devices", "First aid", "Personal care", "Antibiotics".
4. No "SPONSORED" card on this page.
5. Product grid, 4 columns, the same card design as Home. Show these 12 cards in this order (brand in uppercase on the left of each card, "Pharmacy" on the right):
   1. Ibuprofen 400mg Tablets · GENERIC · Pack of 30 · KSh 280
   2. Deep Heat Pain Relief Spray · DEEP HEAT · 150 ml · KSh 920
   3. Vicks VapoRub · VICKS · 100 g jar · KSh 450, old price KSh 520 struck through · yellow badge "−13%"
   4. Strepsils Soothing Lozenges · STREPSILS · Pack of 24 · KSh 450
   5. Vitamin C 1000mg Effervescent · VITACARE · Tube of 20 · KSh 620
   6. Seven Seas Cod Liver Oil · SEVEN SEAS · Pack of 60 · KSh 1,350, old price KSh 1,520 · badge "−11%"
   7. Calcium + Zinc Complex · VITACARE · Pack of 60 · KSh 1,150
   8. Calpol Infant Suspension · CALPOL · 100 ml · KSh 560
   9. Sudocrem Care & Protect · SUDOCREM · 125 g · KSh 880
   10. Infacol Colic Relief Drops · INFACOL · 85 ml · KSh 790
   11. Oral Rehydration Salts · GENERIC · Pack of 6 sachets · KSh 240
   12. Amoxicillin 500mg Capsules · GENERIC · Pack of 21 · KSh 480 · a small white badge "Rx only" in the top right of the photo (1 px border, 11 px bold, 6 px radius). Instead of "+ Add to basket" this card has a white button with a 1 px border, the Rx icon and "Upload prescription" in ink text.
   Photos: plain front-on product photos without readable brand text; no screenshots.
```

---

## 3. Age check (Desktop, over Home)

```
Create a new Desktop screen (1440 px): "Age check". It shows the Home screen behind a dark overlay with a small dialog in the centre. This appears when the shopper clicks the "Liquor" tab.

STYLE (same as Home): brand green #046938, text #0A1510, muted #5E6E64, border #DCE4DB. Headings, buttons and numbers in "Libre Franklin"; body in "Atkinson Hyperlegible Next". No gradients, no decoration.

1. Behind: the Home (Desktop) screen unchanged, covered by a full-screen overlay of #0A1510 at 46% opacity.
2. Dialog, centred: white, 14 px radius, 440 px wide, 26 px padding, soft shadow (0 24px 60px, #0A1510 at 30%).
3. Inside, left aligned, top to bottom:
   - A 38 px green #046938 outline icon of an ID card with "18+".
   - Heading "Are you 18 or older?" (20 px, Libre Franklin bold).
   - Text, 13.5 px muted: "You are opening Liquor: wine, spirits and beer. Not for sale to persons under 18. ID is checked on delivery." The word "Liquor" is bold.
   - 18 px below, two buttons side by side with equal width and a 9 px gap: left "No, go back" (white, 1 px border #DCE4DB, ink text); right "Yes, I am 18+" (solid green #046938, white text). Both 10 px radius, 14 px Libre Franklin semi-bold, 11 px by 18 px padding.
4. No close (X) button, no checkbox, no date-of-birth fields.
```

---

## 4. Liquor division page (Desktop, after the age check)

```
Create a new Desktop screen (1440 px): "Liquor division". It is the Home screen after the shopper confirms they are 18+ and the "Liquor" tab is open. Use the same design system and keep the top strip, header, Pharmacy and Retail cards, offers banner, wholesale box and footer exactly as on Home.

STYLE (same as Home): content centred in a 1320 px column; page background #F7F8F6; white cards, 1 px border #DCE4DB, 14 px radius, no shadows; brand green #046938; text #0A1510; muted #5E6E64. Headings, prices, buttons and all numbers in "Libre Franklin"; body in "Atkinson Hyperlegible Next". No gradients, no decoration, no bar or nightlife imagery.

1. Division tabs: "Liquor 5" active (green, 2 px underline).
2. Heading "Liquor" with the pill "5 products". "Recommended" dropdown on the right.
3. Chips: "All" (solid green), "On offer", "Wine", "Spirits", "Beer & cider".
4. Between the chips and the grid, a full-width notice strip: background #FFF8E8, 1 px border #EEDCA6, 10 px radius, 10 px by 12 px padding, text #5C4713 at 12.5 px, with a small amber #B26B00 "18+" ID icon on the left: "Liquor. Not for sale to persons under 18. Drink responsibly."
5. Grid, 4 columns, same card design as Home. Every card has the small white badge "18+" in the top right of the photo. Division label on each card: "Liquor". Cards in this order:
   1. Dry Red Wine · House Reserve · RESERVE · 750 ml bottle · KSh 1,450 (photo: a red wine bottle and a glass of red wine on white)
   2. Kenya Cane · KENYA CANE · 750 ml bottle · KSh 1,650 (photo: a clear bottle of cane spirit on white)
   3. Gilbey's Gin · GILBEY'S · 1 L bottle · KSh 2,200 (photo: a clear gin bottle on white)
   4. Smirnoff Vodka · SMIRNOFF · 1 L bottle · KSh 2,450, old price KSh 2,700 struck through · yellow badge "−9%" top left (photo: a clear vodka bottle on white)
   5. Tusker Lager · TUSKER · 6 × 500 ml · KSh 1,380 (photo: a brown lager bottle and a full glass)
6. Each card ends with the full-width "+ Add to basket" button. The grid has 5 cards: 4 in the first row and 1 in the second row, left aligned.
```

---

## 5. Search results (Desktop)

```
Create a new Desktop screen (1440 px): "Search results". The shopper typed "milk" into the header search. Same design system; keep the top strip, header, Pharmacy and Retail cards, offers banner, wholesale box and footer as on Home.

STYLE (same as Home): content centred in a 1320 px column; page background #F7F8F6; white cards, 1 px border #DCE4DB, 14 px radius, no shadows; brand green #046938; text #0A1510; muted #5E6E64. Headings, prices, buttons and all numbers in "Libre Franklin"; body in "Atkinson Hyperlegible Next".

1. The header search field contains the typed text "milk" (ink colour, not placeholder grey), and has a green #046938 1 px border with a soft green focus ring (3 px, #046938 at 12%).
2. Division tab "All 69" stays active.
3. Heading: "Results for “milk”" (26 px extra bold, with curly quotes), then the pill "2 products". "Recommended" dropdown on the right.
4. Chips: "All" active, then the rest of the chip row as on Home.
5. Grid, 4 columns, only 2 cards, left aligned; the other two columns stay empty:
   1. Bio Whole Milk · BIO · Retail · 500 ml · KSh 85 (photo: a white 500 ml milk carton on white)
   2. Brookside Fresh Milk Pouch · BROOKSIDE · Retail · 500 ml pouch · KSh 65, with the white "SPONSORED" label in the top left of the photo (photo: a white milk pouch with blue print)
6. Do not add "suggested products", "people also searched" or any other section.
```

---

## 6. No search results (Desktop)

```
Create a new Desktop screen (1440 px): "No results". Same as the "Search results" screen, but the shopper searched for "insulin pen".

1. Search field shows "insulin pen".
2. Heading "Results for “insulin pen”" with the pill "0 products".
3. Instead of the grid, one full-width empty-state box: white, 1 px dashed border #DCE4DB, 14 px radius, 34 px by 22 px padding, everything centred: a 24 px muted #8A9A90 outline magnifying glass icon; "No products found" (15.5 px, Libre Franklin semi-bold, ink); "Try a different search, or clear the filters." (13 px, muted).
4. Nothing else: no illustration, no suggestions, no buttons.
```

---

## 7. Category with sponsored strip (Desktop)

```
Create a new Desktop screen (1440 px): "Beverages category". The shopper clicked the "Beverages" chip on Home. Same design system; keep the top strip, header, Pharmacy and Retail cards, offers banner, wholesale box and footer as on Home.

STYLE (same as Home): content centred in a 1320 px column; page background #F7F8F6; white cards, 1 px border #DCE4DB, 14 px radius, no shadows; brand green #046938; text #0A1510; muted #5E6E64. Headings, prices, buttons and all numbers in "Libre Franklin"; body in "Atkinson Hyperlegible Next".

1. Division tab "All 69" stays active. In the chip row, "Beverages" is solid green and "All" is white.
2. Heading "Beverages" with the pill "5 products".
3. Between the chips and the grid, a full-width sponsored strip: background #0A1510, 14 px radius, 12 px by 14 px padding, 13 px light text #E6EDE7. Left: a white 18 px outline price-tag icon. Then "Soda day · Cold drinks and water, in stock today." with "Soda day" in white semi-bold. Far right: a white button with ink text, 10 px radius, 13.5 px Libre Franklin semi-bold: "Add Pepsi · KSh 260". No close button.
4. Grid, 4 columns, same cards as Home, division label "Retail" on each, in this order:
   1. Fahari Ya Kenya Tea · FAHARI · 500 g · KSh 480 (a yellow foil tea packet)
   2. Sprite · SPRITE · 2 L bottle · KSh 260 (a green 2 litre soda bottle)
   3. Pepsi · PEPSI · 2 L bottle · KSh 260 (a 2 litre cola bottle)
   4. Dasani Water · DASANI · 1 L bottle · KSh 110 (a clear water bottle)
   5. Minute Maid Mango · MINUTE MAID · 1 L · KSh 320 (a mango juice carton)
```

---

## 8. Basket with items (Desktop)

```
Create a new Desktop screen (1440 px): "Basket". The Home screen with the basket panel open. Same design system.

STYLE (same as Home): brand green #046938, dark green #035A30, text #0A1510, muted #5E6E64, border #DCE4DB, light divider #EAF0E9. Headings, prices, buttons and all numbers in "Libre Franklin"; body in "Atkinson Hyperlegible Next". No gradients, no decoration.

1. Behind: the Home (Desktop) screen, covered by an overlay of #0A1510 at 46% opacity. The basket button in the header shows the count "4" and the total "KSh 720".
2. Basket panel: a white panel 420 px wide floating at the bottom right, 18 px from the right and bottom edges, 14 px radius, 1 px border, shadow (0 24px 60px, #0A1510 at 28%), at most 82% of the screen height.
3. Panel header, 16 px by 18 px padding, 1 px bottom border: a green basket icon and "Your basket" (17 px Libre Franklin bold), then "· 4 items" (12.5 px muted), and on the far right a 32 px square close button (fill #F7F8F6, 8 px radius, ink X icon).
4. Panel body, 18 px side padding, three rows separated by 1 px #EAF0E9 lines, 13 px vertical padding each. Each row: a 50 x 50 px product photo with 10 px radius; then the name (13.5 px semi-bold), below it the pack and unit price (12 px muted), and below that the line total in bold ink; on the right, a quantity control: a 28 px square "−" button (white, 1 px border, 8 px radius), the number (13.5 px Libre Franklin), and a 28 px square "+" button.
   - Ibuprofen 400mg Tablets · "Pack of 30 · KSh 280 each" · "KSh 280" · quantity 1
   - Brookside Fresh Milk Pouch · "500 ml pouch · KSh 65 each" · "KSh 130" · quantity 2
   - White Sugar · "2 kg · KSh 310 each" · "KSh 310" · quantity 1
5. Panel footer, background #FAFCF9, 1 px top border, 16 px by 18 px padding, top to bottom:
   - A line with "KSh 1,780 to free delivery" on the left (12.5 px muted) and "KSh 720 / KSh 2,500" on the right (bold ink); below it a 6 px tall fully rounded track (#EAF0E9) filled 29% with green #046938.
   - A suggestion row (1 px #EAF0E9 top line, 12 px top padding): a 44 x 44 px tile with 10 px radius in green #046938 holding a yellow #F9D04A package icon; "Maize Flour Bale · 2kg units" (12.5 px semi-bold) with "Reaches free delivery · KSh 1,920" below (11.5 px muted); on the right a small "Add" button (fill #F7F8F6, 1 px border, 8 px radius, 12.5 px semi-bold).
   - Totals, 13.5 px, label left (muted) and amount right (ink semi-bold): "Subtotal" "KSh 720"; "Delivery (Nairobi)" "KSh 250". Then "Total" "KSh 970" in 18 px Libre Franklin bold.
   - A full-width solid green button, 15 px padding, 10 px radius, 15 px Libre Franklin semi-bold, white: a phone-payment icon and "Checkout · M-PESA".
   - Below it, centred, 11.5 px muted: "Liquor is not sold to under-18s. ID is checked on delivery."
```

---

## 9. Basket, mobile bottom sheet (Mobile 390 px)

```
Create a new Mobile screen (390 px): "Basket (Mobile)". The same basket as the Desktop "Basket" screen, with the same rows, numbers, footer and button text, shown as a bottom sheet.

STYLE (same as Home): brand green #046938, text #0A1510, muted #5E6E64, border #DCE4DB. Libre Franklin for headings, prices, buttons and numbers; Atkinson Hyperlegible Next for body text.

1. Behind: the Home (Mobile) screen with an overlay of #0A1510 at 46% opacity.
2. The sheet is attached to the bottom edge across the full width, with only the top corners rounded (18 px) and no side or bottom gap. It is at most 88% of the screen height.
3. The content is identical to the Desktop basket panel: header "Your basket · 4 items" with the close button; the three product rows; the free-delivery progress line; the Maize Flour Bale suggestion; the Subtotal, Delivery and Total lines; the full-width "Checkout · M-PESA" button; and the note "Liquor is not sold to under-18s. ID is checked on delivery."
4. The bottom navigation bar and the dark offer bar are hidden behind the sheet.
```

---

## 10. Empty basket (Mobile 390 px)

```
Create a new Mobile screen (390 px): "Empty basket". The same bottom sheet as "Basket (Mobile)", but with nothing in it.

1. Header: basket icon, "Your basket" and the close button. No item count.
2. Body: one empty-state box: white, 1 px dashed border #DCE4DB, 14 px radius, 34 px by 22 px padding, centred: a 24 px muted #8A9A90 outline basket icon; "Your basket is empty" (15.5 px Libre Franklin semi-bold, ink); "Add medicines, groceries or bulk stock to get started." (13 px muted).
3. No footer, no totals, no checkout button, no suggestions.
```

---

## 11. Orders after checkout (Desktop)

```
Create a new Desktop screen (1440 px): "Orders". The Home screen with the Orders panel open, right after the shopper paid. Same design system and the same panel style as the "Basket" screen (420 px wide, bottom right, 14 px radius, overlay #0A1510 at 46%).

STYLE (same as Home): brand green #046938, text #0A1510, muted #5E6E64, border #DCE4DB. Libre Franklin for headings and numbers; Atkinson Hyperlegible Next for body text.

1. The header basket button now shows "0" and "KSh 0".
2. Panel header: a green package icon, "Orders" (17 px Libre Franklin bold) and the 32 px close button on the right.
3. A success message at the top of the body: background #EFF6F0, 1 px border #C6E0CC, 10 px radius, 13 px padding, 13 px text. A green check icon on the left; then "Order XN-482913 placed" in bold, and on the next line "Approve the M-PESA prompt on your phone. The rider departs for Nairobi once payment lands."
4. Below it, one order row: a 50 x 50 px tile with 10 px radius, fill #EAF3EA, with a green package icon; "XN-482913" in bold followed by " · 4 items" (13.5 px); below in 12 px muted: "9 Oct, 14:32 · Nairobi · KSh 970 · Preparing", where "KSh 970" is bold ink and "Preparing" is green.
5. No order tracking map, no rider photo, no rating stars.
```

---

## 12. No orders yet (Mobile 390 px)

```
Create a new Mobile screen (390 px): "No orders". The Orders panel as a mobile bottom sheet (full width, attached to the bottom, top corners 18 px) over Home (Mobile) with the dark overlay.

1. Header: green package icon, "Orders", close button.
2. Body: an empty-state box (white, 1 px dashed border #DCE4DB, 14 px radius, centred content): a muted outline package icon; "No orders yet" (15.5 px Libre Franklin semi-bold); "Your M-PESA checkouts will appear here." (13 px muted).
```

---

## 13. Upload a prescription (Desktop)

```
Create a new Desktop screen (1440 px): "Upload prescription". The Home screen behind a dark overlay (#0A1510 at 46%) with a centred dialog, using the same dialog style as the "Age check" screen (white, 14 px radius, 440 px wide, 26 px padding, soft shadow).

STYLE (same as Home): brand green #046938, text #0A1510, muted #5E6E64, border #DCE4DB. Libre Franklin for headings, buttons and numbers; Atkinson Hyperlegible Next for body text.

Inside, left aligned, top to bottom:
1. A 38 px green outline "Rx" prescription icon.
2. "Upload a prescription" (20 px Libre Franklin bold).
3. 13.5 px muted: "Photograph the prescription and a PPB licensed pharmacist will confirm within 30 minutes, 7am to 11pm."
4. Three fields, 14 px apart. Each has a 12.5 px semi-bold label above a full-width input (1 px border #DCE4DB, 10 px radius, 11 px by 12 px padding, 14.5 px text):
   - "Full name", placeholder "e.g. Wanjiku Mwangi"
   - "Phone, for M-PESA", placeholder "07..."
   - "Prescription file": a file picker with a "Choose file" button and "No file chosen"
5. 18 px below, two equal buttons with a 9 px gap: "Cancel" (white, 1 px border) and "Submit" (solid green, white text).
6. No close (X) icon, no drag-and-drop area, no camera illustration.
```

---

## 14. Prescription received (Desktop)

```
Duplicate the "Upload prescription" screen as "Prescription received". Keep everything, fill in the fields and add the confirmation:

1. "Full name" contains "Wanjiku Mwangi". "Phone, for M-PESA" contains "0712 345 678". "Prescription file" shows "prescription.jpg".
2. Below the two buttons, a success message: background #EFF6F0, 1 px border #C6E0CC, 10 px radius, 13 px padding, 13 px text, a green check icon on the left; "Prescription received" in bold, and on the next line "A pharmacist will WhatsApp you within 30 minutes."
```

---

## 15. Book a clinic visit (Desktop)

```
Create a new Desktop screen (1440 px): "Book a clinic visit". The Home screen behind a dark overlay (#0A1510 at 46%) with a centred dialog in the same style as "Upload prescription" (white, 14 px radius, 440 px wide, 26 px padding).

STYLE (same as Home): brand green #046938, text #0A1510, muted #5E6E64, border #DCE4DB. Libre Franklin for headings, buttons and numbers; Atkinson Hyperlegible Next for body text.

Inside, left aligned:
1. A 38 px green outline clinic icon (a building with a medical cross).
2. "Book a clinic visit" (20 px Libre Franklin bold).
3. 13.5 px muted: "GP, child health, diabetes and hypertension care, lab tests and vaccinations. Ruaka · Kilimani · Kitengela Road."
4. Fields, each with a 12.5 px semi-bold label above a full-width input (1 px border, 10 px radius):
   - "Clinic": a dropdown showing "Ruaka, GP and lab". Its other options are "Kilimani, GP and mother and baby" and "Kitengela Road, diabetes and hypertension".
   - "Day": a date input showing "dd/mm/yyyy" with a small calendar icon.
   - "Phone": placeholder "07...".
5. Two equal buttons with a 9 px gap: "Cancel" (white, 1 px border) and "Book visit, KSh 800" (solid green, white text).
6. Do not add time slots, doctor photos or a calendar grid.
```

---

## 16. Delivery area (Desktop)

```
Create a new Desktop screen (1440 px): "Delivery area". The Home screen behind a dark overlay (#0A1510 at 46%) with a centred dialog in the same style as the other dialogs (white, 14 px radius, 440 px wide, 26 px padding). It opens from the "Change area" link in the header.

STYLE (same as Home): brand green #046938, text #0A1510, muted #5E6E64, border #DCE4DB. Libre Franklin for headings and buttons; Atkinson Hyperlegible Next for body text.

Inside, left aligned:
1. A 38 px green outline map pin icon.
2. "Delivery area" (20 px Libre Franklin bold).
3. 13.5 px muted: "We deliver across Nairobi, Kiambu and Kajiado. Choose the area closest to you."
4. 14 px below, a stack of six full-width buttons with 8 px gaps, each 10 px radius, 14 px Libre Franklin semi-bold, 11 px by 18 px padding, text centred. All are white with a 1 px border and ink text: "Nairobi · Ruaka", "Nairobi · Kilimani", "Nairobi · Westlands", "Nairobi · Embakasi", "Nairobi · Karen", "Kiambu · Thika Rd".
5. No map, no search field, no close (X) icon, no Cancel button.
```

---

## 17. Categories sheet (Mobile 390 px)

```
Create a new Mobile screen (390 px): "Categories". It opens from "Categories" in the bottom navigation. Home (Mobile) behind an overlay of #0A1510 at 46%, with a bottom sheet (full width, attached to the bottom, top corners 18 px, white).

STYLE (same as Home): brand green #046938, text #0A1510, muted #5E6E64, border #DCE4DB. Libre Franklin for headings; Atkinson Hyperlegible Next for body text.

1. Sheet header (16 px by 18 px padding, 1 px bottom border): a green 2x2 grid icon, "Categories" (17 px Libre Franklin bold), and on the right the 32 px close button (fill #F7F8F6, 8 px radius, X icon).
2. Body, 18 px side padding. First, the divisions as chips that wrap onto several lines, 8 px gaps. Each chip: white, 1 px border, 10 px radius, 13 px text, 8 px by 13 px padding, with a small outline icon before the word: "All" (grid icon, solid green with white text, active), "Pharmacy" (pill icon), "Retail" (storefront icon), "Deli" (fork and knife icon), "Liquor" (wine glass icon), "Wholesale" (package icon).
3. A 1 px #DCE4DB line, 12 px above and below.
4. Then all categories as the same chips without icons, wrapping, with 6 px right and 8 px bottom spacing: "All" (solid green, active), "Pain & fever", "Cold & flu", "Vitamins", "Mother & baby", "Skin care", "Diabetes care", "Devices", "First aid", "Personal care", "Antibiotics", "Staples", "Cooking", "Dairy & eggs", "Household", "Beverages", "Snacks", "Fresh produce", "Meat", "Cold cuts", "Cured meats", "Cheese", "Antipasti", "Hot foods", "Wine", "Spirits", "Beer & cider", "Bulk flour", "Bulk oil & sugar", "Bulk rice", "Bulk household".
5. No images and no counts on the chips.
```

---

## 18. Added-to-basket message (Mobile 390 px)

```
Create a new Mobile screen (390 px): "Added to basket". The Home (Mobile) screen, unchanged, with one small message floating above the bottom bars.

1. The White Sugar card in the grid now shows a quantity control instead of the "+ Add to basket" button: a full-width box (fill #EEF6F0, 1 px border #CFE3D5, 10 px radius, 3 px padding) with a white 36 x 34 px "−" button on the left, the number "1" (13.5 px bold) in the middle, and a white 36 x 34 px "+" button on the right.
2. The header basket button shows "1". The "Basket" item in the bottom navigation has a small green #046938 round badge with a white "1".
3. A message centred horizontally, 88 px above the bottom of the screen: background #0A1510, white 13.5 px text, 10 px radius, 11 px by 18 px padding, shadow (0 12px 32px, #0A1510 at 35%): "Added White Sugar".
```
