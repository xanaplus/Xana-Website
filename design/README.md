# Xana Life: designs

The finished designs for the Xana Life website. The live front end in `index.html` already implements them. These files are the reference for anything that gets built or changed.

- `screens/`: the 19 screens, exported from Figma at 1x. Desktop screens are 1440 px wide, phone screens 390 px.
- `Xana-Life-Website.pdf`: a six-page overview of the design and the flow.
- `stitch-prompts/`: the prompts used to generate the screens in Stitch.

## Screens

| File | Screen |
| --- | --- |
| `01-home-desktop.png` | Home, desktop |
| `02-home-mobile.png` | Home, phone |
| `03-desktop-pharmacy-division.png` | Pharmacy page |
| `04-desktop-liquor-division.png` | Liquor page (18+ notice) |
| `05-desktop-beverages-category.png` | Category page with a sponsored strip |
| `06-desktop-search-results.png` | Search results (sponsored slot second) |
| `07-desktop-no-results.png` | Search with no results |
| `08-desktop-age-check-dialog.png` | Age check before Liquor |
| `09-desktop-basket.png` | Basket panel |
| `10-desktop-orders.png` | Orders, right after checkout |
| `11-desktop-upload-prescription-dialog.png` | Upload a prescription |
| `12-desktop-prescription-received.png` | Prescription received |
| `13-desktop-book-clinic-visit-dialog.png` | Book a clinic visit |
| `14-desktop-delivery-area-dialog.png` | Delivery area picker |
| `15-mobile-categories.png` | Categories sheet |
| `16-mobile-added-to-basket.png` | "Added to basket" message |
| `17-mobile-basket.png` | Basket sheet |
| `18-mobile-empty-basket.png` | Empty basket |
| `19-mobile-no-orders.png` | No orders yet |

## Flow

| Journey | Screens, in order |
| --- | --- |
| Shopping | Home, division page, category chips, product card, Basket, Checkout (M-PESA), Orders |
| Finding a product | Search in the header, then Search results or No results |
| Liquor | Liquor tab or an add on a liquor product, Age check, Liquor page |
| Prescriptions | "Upload prescription", Upload a prescription, Prescription received |
| Clinic visits | "Book a clinic visit", Book a clinic visit |
| Delivery area | "Change area" in the header, Delivery area picker |
| On a phone | Bottom bar: Shop, Categories, Pharmacy, Orders, Basket. Categories, Basket and Orders open as sheets from the bottom |

## Photos

Product photos in the screens are the real ones used on the site, except the five drinks on the category page, which are stand-ins. Supplier pack shots will replace all placeholders. Photo credits are in `img/credits.json`.
