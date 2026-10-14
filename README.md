# Kindkit — free file tools, forever

**Live site:** https://repo-cdf.github.io/kindkit/

Free PDF & image tools that run entirely in the browser. No sign-up, no watermarks, no limits, and files never leave the user's device.

## Tools
- **PDF:** Merge, Split, Rotate & Organize, Compress, PDF to JPG, Images to PDF
- **Images:** Compress, Resize, Convert (incl. iPhone HEIC to JPG)
- **Utilities:** QR Code Generator (links, Wi-Fi, WhatsApp), Password Generator, Word Counter

## Settings
Everything you might want to change is at the top of `app.js` in the `CONFIG` block:

| Setting | What it does |
|---|---|
| `paypalEmail` | Where donations go |
| `donateAmounts` | The quick-tip buttons ($3, $5, $10, $25) |
| `adsenseClient` | Your Google AdSense publisher ID (`ca-pub-…`). Turns on Auto ads. |
| `adsenseSlots` | Optional ad-unit IDs for Kindkit's 3 built-in ad spaces |

### Other ad networks (Adsterra, Monetag, Media.net…)
In `index.html`, find the three `<div class="ad-custom">` blocks and paste the network's ad code inside one. The space appears automatically once it has ad code in it.

### ads.txt
Most ad networks ask for an `ads.txt` file. Create `ads.txt` in this repo with the line your network gives you. For example, for AdSense:
```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

## How it works
Plain HTML, CSS and JavaScript. No build step. Libraries load on demand from cdnjs/jsDelivr: pdf-lib, PDF.js, JSZip, qrcode-generator and heic2any.
