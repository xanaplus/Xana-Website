# Stitch fix prompts (after the Figma review, 9 October 2026)

Paste these in the same Stitch project, one message each, in this order. Prompt A fixes the existing screens; prompts B, C and D add the three missing screens. Attach only `xana-logo.png`.

---

## A. Fix all existing screens

```
Fix every existing screen in this project. Change only the points below. Keep all text, layout, colours and spacing that are not mentioned exactly as they are now.

1. FRAME WIDTH (all Desktop screens)
Every Desktop frame must be exactly 1440 px wide, the same width as its content. Right now the frames are 1280 px wide while the content is 1440 px, which leaves a black band down the right side and cuts off the footer text ("Kitengela Road", "8pm"). After the fix there is no black area anywhere, the page background #F7F8F6 runs to the right edge, and the content stays centred in a 1320 px column with 60 px margins on both sides.

2. PRODUCT PHOTOS (all screens)
Replace every product photo with a simple studio photo of the correct item: the item alone, front-on, centred, on a plain white or very light grey background, soft even light. No kitchens, tables, barrels, plants, bowls or props. No readable brand names, logos or printed text on the packs. Never reuse one product's photo for another product. Use exactly these subjects:
- Ibuprofen 400mg Tablets: a plain white and green cardboard tablet box
- Royco Mchuzi Mix: a small red and brown paper sachet of stew seasoning
- Pishori Rice (5 kg bag): a woven 5 kg sack of white rice
- Cold Cuts Platter: sliced cured meats arranged on a white marble board, seen from above
- Cooking Oil Carton · 3L: three yellow 3 litre plastic jerrycans of cooking oil side by side
- Dry Red Wine · House Reserve: one dark red wine bottle next to a glass of red wine
- Deep Heat Pain Relief Spray: one silver aerosol can
- White Sugar (2 kg): a plain white paper 2 kg sugar bag
- Vicks VapoRub: a small blue glass jar with a lid
- Strepsils Soothing Lozenges: a small flat cardboard pack of lozenges with a blister strip
- Vitamin C 1000mg Effervescent: an orange plastic tube of effervescent tablets
- Seven Seas Cod Liver Oil: a brown plastic bottle of capsules
- Calcium + Zinc Complex: a white plastic supplement bottle
- Calpol Infant Suspension: a small medicine bottle with a measuring syringe
- Sudocrem Care & Protect: a round grey tub of cream
- Infacol Colic Relief Drops: a small dropper bottle with its box
- Oral Rehydration Salts: a small foil sachet
- Amoxicillin 500mg Capsules: a plain white cardboard box with a blister strip of capsules
- Kenya Cane: a clear glass bottle of cane spirit
- Gilbey's Gin: a clear square glass gin bottle
- Smirnoff Vodka: a clear tall glass vodka bottle
- Tusker Lager: one brown 500 ml beer bottle next to a full glass of lager
- Fahari Ya Kenya Tea: a yellow foil packet of loose tea
- Sprite: a green 2 litre plastic soda bottle
- Pepsi: a 2 litre plastic bottle of cola with a blue cap
- Dasani Water: a clear 1 litre water bottle with a blue cap
- Minute Maid Mango: a 1 litre carton of mango juice
- Bio Whole Milk: a white 500 ml milk carton
- Brookside Fresh Milk Pouch: a plain white 500 ml milk pouch with blue print and no readable words
Banner tile and the Pharmacy and Retail card photos follow the same rule: the Royco sachet in the banner tile; an orange vitamin tube and a glass of water for Pharmacy; a pile of fresh vegetables for Retail.

3. DIALOGS AND PANELS (Age check, Upload prescription, Prescription received, Book clinic visit, Delivery area, Basket, Orders, Categories)
Make each of these screens exactly one viewport tall: 1440 x 900 px on Desktop, 390 x 844 px on Mobile. Show only the top of the Home page behind it. The dark overlay (#0A1510 at 46% opacity) covers the whole frame edge to edge, with no undimmed strip at the bottom or on the right. Dialogs sit in the exact centre of the frame. The Basket and Orders panels sit 18 px from the right edge and 18 px from the bottom edge of the frame. Mobile bottom sheets are attached to the bottom edge of the frame.

4. NUMBERS
Set every digit in every text on every screen in "Libre Franklin", at the same size and weight as the words around it. Zeros must be plain round zeros, never slashed. Check in particular: "Ibuprofen 400mg Tablets", "Vitamin C 1000mg Effervescent", "Amoxicillin 500mg Capsules", "500 g", "500 ml", "within 30 minutes", "Order before 9pm and it arrives in about 45 minutes", "7am to 11pm", "8am to 8pm", "CC BY-SA 3.0", "KSh 1,780 to free delivery" and "KSh 310 each". Inside sentences, the digits must not look bigger than the letters.

5. FOOTER CREDITS (all screens)
Replace the credit line with exactly: "Product photos by Open Food Facts contributors (CC BY-SA 3.0) and Wikimedia Commons contributors. See img/credits.json for full attribution." Do not mention Unsplash anywhere.

6. BEVERAGES SCREEN: PRODUCT CARDS
Rebuild the five product cards to match the cards on the Home screen exactly:
- Photo area on top (4:3, white, a 1 px #EAF0E9 line below it). No pill or label on the photo.
- Below it, one row: the brand on the left (11 px, uppercase, muted, letter spacing 0.06em) and "Retail" on the right (11 px, normal case, muted, no pill, no colour).
- Product name (14.5 px semi-bold), pack size (12.5 px muted).
- Price: a small "KSh" (11.5 px bold, muted) followed by the amount (21 px extra bold).
- At the bottom, a full-width "+ Add to basket" button with fill #EEF6F0, border #CFE3D5 and dark green #035A30 text. It is not a small solid green button beside the price.
Also, in the chip row, the active chip is "Beverages" (solid green, white text) and must be visible: scroll the chip row so that "Beverages" is in view. The "All" chip is white.

7. EQUAL CARD HEIGHTS (all grids)
All cards in a grid row are the same height, and the "+ Add to basket" buttons in a row line up on one line at the bottom. On the Search results screen, the Bio Whole Milk and Brookside Fresh Milk Pouch cards are the same height, with their buttons aligned.

8. MOBILE TEXT
- On Home (Mobile) and Added to basket (Mobile), the Pishori Rice old price reads "KSh 890" (with "KSh"), struck through.
- The wine is named "Dry Red Wine · House Reserve" on every screen, never "Dry Red Wine · Reserve".

9. ADDED TO BASKET (Mobile)
Make this screen exactly 390 x 844 px. The bottom navigation bar is fixed to the very bottom edge of the frame. The dark offer bar sits directly above it. The message "Added White Sugar" floats 88 px above the bottom edge, centred. No footer text appears below the bottom navigation.
```

---

## B. Basket, mobile bottom sheet (missing screen)

```
Create a new Mobile screen (390 x 844 px): "Basket (Mobile)". It shows the same basket as the Desktop "Basket" screen, with the same products, numbers and button text, as a bottom sheet.

STYLE (same as Home): brand green #046938, dark green #035A30, text #0A1510, muted #5E6E64, border #DCE4DB, light divider #EAF0E9. Headings, prices, buttons and every digit in "Libre Franklin" (plain zeros, never slashed); body text in "Atkinson Hyperlegible Next". No gradients, no decoration.

1. Behind: the top of the Home (Mobile) screen, with an overlay of #0A1510 at 46% opacity covering the whole frame.
2. The sheet is attached to the bottom edge across the full width. Only its top corners are rounded (18 px); there is no gap at the sides or bottom. It is at most 88% of the frame height (743 px). The bottom navigation and the dark offer bar are hidden behind it.
3. Sheet header, 16 px by 18 px padding, 1 px bottom border: a green basket icon, "Your basket" (17 px bold), "· 4 items" (12.5 px muted), and on the right a 32 px square close button (fill #F7F8F6, 8 px radius, X icon).
4. Three product rows, 18 px side padding, 1 px #EAF0E9 lines between them. Each row: a 50 x 50 px photo with 10 px radius (plain studio photo of the item on white), the name (13.5 px semi-bold), the pack and unit price (12 px muted), the line total (bold ink), and on the right a "−" button, the quantity, and a "+" button (28 px squares, white, 1 px border, 8 px radius):
   - Ibuprofen 400mg Tablets · "Pack of 30 · KSh 280 each" · "KSh 280" · 1
   - Brookside Fresh Milk Pouch · "500 ml pouch · KSh 65 each" · "KSh 130" · 2
   - White Sugar · "2 kg · KSh 310 each" · "KSh 310" · 1
5. Footer, background #FAFCF9, 1 px top border, 16 px by 18 px padding:
   - "KSh 1,780 to free delivery" on the left (12.5 px muted) and "KSh 720 / KSh 2,500" on the right (bold); below, a 6 px fully rounded track (#EAF0E9) filled 29% with green.
   - Suggestion row: a 44 x 44 px green #046938 tile with 10 px radius holding a yellow #F9D04A package icon; "Maize Flour Bale · 2kg units" (12.5 px semi-bold) with "Reaches free delivery · KSh 1,920" below (11.5 px muted); on the right a small "Add" button (fill #F7F8F6, 1 px border, 8 px radius).
   - "Subtotal" "KSh 720"; "Delivery (Nairobi)" "KSh 250"; then "Total" "KSh 970" in 18 px bold.
   - A full-width solid green button, 15 px padding, 10 px radius, white 15 px semi-bold: a phone-payment icon and "Checkout · M-PESA".
   - Centred below, 11.5 px muted: "Liquor is not sold to under-18s. ID is checked on delivery."
```

---

## C. Empty basket (missing screen)

```
Create a new Mobile screen (390 x 844 px): "Empty basket". The same bottom sheet as "Basket (Mobile)", over the top of Home (Mobile) with the full-frame overlay (#0A1510 at 46%), but with nothing in it.

1. Header: green basket icon, "Your basket" and the close button. No item count.
2. Body, 18 px side padding: one empty-state box: white, 1 px dashed border #DCE4DB, 14 px radius, 34 px by 22 px padding, everything centred: a 24 px muted #8A9A90 outline basket icon; "Your basket is empty" (15.5 px Libre Franklin semi-bold, ink); "Add medicines, groceries or bulk stock to get started." (13 px muted).
3. No footer, no totals, no checkout button, no suggestions. The sheet is only as tall as its content.
```

---

## D. No orders yet (missing screen)

```
Create a new Mobile screen (390 x 844 px): "No orders". The Orders panel as a bottom sheet over the top of Home (Mobile), with the full-frame overlay (#0A1510 at 46%). The sheet is attached to the bottom edge, full width, white, top corners rounded 18 px, only as tall as its content.

1. Header (16 px by 18 px padding, 1 px bottom border): a green package icon, "Orders" (17 px Libre Franklin bold), and on the right the 32 px close button (fill #F7F8F6, 8 px radius, X icon).
2. Body, 18 px side padding: an empty-state box (white, 1 px dashed border #DCE4DB, 14 px radius, 34 px by 22 px padding, centred): a 24 px muted #8A9A90 outline package icon; "No orders yet" (15.5 px Libre Franklin semi-bold, ink); "Your M-PESA checkouts will appear here." (13 px muted).
3. Nothing else.
```
