// Generates unbranded placeholder product photos listed in placeholders.json.
// Usage: node gen-placeholders.mjs <path-to-key-file> [id ...]
// The key prefix picks the service: "sk-" OpenAI, "AIza" Google Gemini (Imagen).
// Output: img/placeholder/<file>, 900 px on the long side, JPEG. Existing files are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const outDir = path.join(root, 'img/placeholder');
const [keyFile, ...only] = process.argv.slice(2);
if (!keyFile) { console.error('usage: node gen-placeholders.mjs <key-file> [id ...]'); process.exit(1); }
const key = fs.readFileSync(keyFile, 'utf8').trim();
const list = JSON.parse(fs.readFileSync(path.join(here, 'placeholders.json'), 'utf8'))
  .filter(p => !only.length || only.includes(p.id));

const style = s => `Product photo for an online grocery and pharmacy shop: ${s}. ` +
  'Centred, front-on, filling most of the frame, on a plain pure white background, soft even studio lighting, ' +
  'a gentle shadow underneath. No logos, no brand names, no readable text or labels, no props, no hands. Photorealistic.';

async function openai(prompt) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: process.env.IMAGE_MODEL || 'gpt-image-1', prompt, size: '1536x1024', quality: 'medium', n: 1 }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || r.status);
  return Buffer.from(j.data[0].b64_json, 'base64');
}

async function gemini(prompt) {
  const model = process.env.IMAGE_MODEL || 'imagen-4.0-generate-001';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '4:3' } }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || r.status);
  return Buffer.from(j.predictions[0].bytesBase64Encoded, 'base64');
}

const generate = key.startsWith('sk-') ? openai : key.startsWith('AIza') ? gemini : null;
if (!generate) { console.error('Unrecognised key: expected an OpenAI (sk-) or Gemini (AIza) key'); process.exit(1); }

// Resize to 900 px and save as JPEG with Windows' built-in System.Drawing.
function toJpeg(src, dest) {
  const ps = `Add-Type -AssemblyName System.Drawing;$i=[Drawing.Image]::FromFile('${src}');$s=900/[Math]::Max($i.Width,$i.Height);` +
    `$b=New-Object Drawing.Bitmap([int]($i.Width*$s)),([int]($i.Height*$s));$g=[Drawing.Graphics]::FromImage($b);` +
    `$g.InterpolationMode='HighQualityBicubic';$g.DrawImage($i,0,0,$b.Width,$b.Height);` +
    `$c=[Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|?{$_.MimeType -eq 'image/jpeg'};$e=New-Object Drawing.Imaging.EncoderParameters 1;` +
    `$e.Param[0]=New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality,[long]85);$b.Save('${dest}',$c,$e);$g.Dispose();$b.Dispose();$i.Dispose()`;
  execFileSync('powershell', ['-NoProfile', '-Command', ps]);
}

fs.mkdirSync(outDir, { recursive: true });
let failed = 0;
for (const p of list) {
  const dest = path.join(outDir, p.file);
  if (fs.existsSync(dest)) { console.log('skip', p.id, p.file); continue; }
  try {
    const raw = path.join(outDir, p.file.replace(/\.jpg$/, '.raw.png'));
    fs.writeFileSync(raw, await generate(style(p.subject)));
    toJpeg(raw, dest);
    fs.unlinkSync(raw);
    console.log('ok  ', p.id, p.file);
  } catch (e) { failed++; console.log('FAIL', p.id, e.message); }
}
process.exit(failed ? 1 : 0);
