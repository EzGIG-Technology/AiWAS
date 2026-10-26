/**
 * A very small PDF writer for the demo's evidence exports and management
 * reports: A4 pages, Helvetica text, filled rectangles, JPEG images and a
 * diagonal watermark. Runs in the browser; no library and no network.
 */

const W = 595;
const H = 842;

/** PDF base fonts use WinAnsi; map typographic characters and drop the rest. */
function ansi(s: string) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/→/g, '->')
    .replace(/²/g, '2')
    .replace(/[^\x20-\x7e\xa0-\xff]/g, '?')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

const bytes = (s: string) => {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
};

type Img = { name: string; data: Uint8Array; w: number; h: number };

export class Pdf {
  private pages: string[][] = [[]];
  private images: Img[] = [];
  private watermarkText: string | null = null;
  /** Current cursor, top-down in points. */
  y = 56;

  private get ops() {
    return this.pages[this.pages.length - 1];
  }

  addPage() {
    this.pages.push([]);
    this.y = 56;
  }

  /** Make sure `h` points fit on the page; start a new one if not. */
  need(h: number) {
    if (this.y + h > H - 56) this.addPage();
  }

  text(
    str: string,
    opts: {
      x?: number;
      size?: number;
      bold?: boolean;
      gray?: number;
      y?: number;
    } = {},
  ) {
    const { x = 56, size = 10, bold = false, gray = 0 } = opts;
    const y = opts.y ?? this.y;
    this.ops.push(
      `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${gray} g 1 0 0 1 ${x} ${H - y - size} Tm (${ansi(str)}) Tj ET`,
    );
    if (opts.y === undefined) this.y += size * 1.45;
  }

  /** Wrapped paragraph; Helvetica averages about half the font size per character. */
  para(
    str: string,
    opts: {
      x?: number;
      size?: number;
      width?: number;
      gray?: number;
      bold?: boolean;
    } = {},
  ) {
    const { x = 56, size = 10, width = W - 112 } = opts;
    const perLine = Math.floor(width / (size * 0.5));
    const words = str.split(/\s+/);
    let line = '';
    for (const w of words) {
      if ((line + ' ' + w).trim().length > perLine) {
        this.need(size * 1.45);
        this.text(line, { ...opts, x, size });
        line = w;
      } else line = (line + ' ' + w).trim();
    }
    if (line) {
      this.need(size * 1.45);
      this.text(line, { ...opts, x, size });
    }
  }

  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    rgb: [number, number, number],
  ) {
    this.ops.push(`${rgb.join(' ')} rg ${x} ${H - y - h} ${w} ${h} re f`);
  }

  gap(h = 8) {
    this.y += h;
  }

  image(data: Uint8Array, w: number, h: number, dw: number) {
    const name = `Im${this.images.length + 1}`;
    this.images.push({ name, data, w, h });
    const dh = (h / w) * dw;
    this.need(dh + 6);
    this.ops.push(`q ${dw} 0 0 ${dh} 56 ${H - this.y - dh} cm /${name} Do Q`);
    this.y += dh + 6;
  }

  watermark(str: string) {
    this.watermarkText = str;
  }

  build(): Blob {
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let length = 0;
    const push = (c: Uint8Array | string) => {
      const b = typeof c === 'string' ? bytes(c) : c;
      chunks.push(b);
      length += b.length;
    };
    const obj = (n: number, body: string | (() => void)) => {
      offsets[n] = length;
      push(`${n} 0 obj\n`);
      if (typeof body === 'string') push(body);
      else body();
      push('\nendobj\n');
    };

    const fontF1 = 3;
    const fontF2 = 4;
    const firstImg = 5;
    const firstPage = firstImg + this.images.length;
    const pageIds = this.pages.map((_, i) => firstPage + i * 2);

    push('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(
      2,
      `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`,
    );
    obj(
      fontF1,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    );
    obj(
      fontF2,
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    );
    this.images.forEach((img, i) =>
      obj(firstImg + i, () => {
        push(
          `<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>\nstream\n`,
        );
        push(img.data);
        push('\nendstream');
      }),
    );
    const xobjects = this.images
      .map((img, i) => `/${img.name} ${firstImg + i} 0 R`)
      .join(' ');
    this.pages.forEach((ops, i) => {
      const id = pageIds[i];
      const all = [...ops];
      if (this.watermarkText) {
        const c = Math.cos(Math.PI / 6).toFixed(4);
        const s = Math.sin(Math.PI / 6).toFixed(4);
        all.push(
          `q 0.82 g BT /F2 22 Tf ${c} ${s} -${s} ${c} 90 230 Tm (${ansi(this.watermarkText)}) Tj ET Q`,
        );
      }
      all.push(
        `BT /F1 8 Tf 0.45 g 1 0 0 1 56 28 Tm (${ansi(`EzVision Campus · demonstration export · page ${i + 1} of ${this.pages.length}`)}) Tj ET`,
      );
      const content = all.join('\n');
      obj(
        id,
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R >> /XObject << ${xobjects} >> >> /Contents ${id + 1} 0 R >>`,
      );
      obj(
        id + 1,
        `<< /Length ${bytes(content).length} >>\nstream\n${content}\nendstream`,
      );
    });
    const xref = length;
    const count = firstPage + this.pages.length * 2;
    push(`xref\n0 ${count}\n0000000000 65535 f \n`);
    for (let n = 1; n < count; n++)
      push(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`);
    push(
      `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`,
    );
    return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
  }
}

export function download(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/**
 * Draw a still on a canvas, blur the head area of each tracked person unless
 * the director has unblurred, stamp the watermark, and return JPEG bytes.
 */
export async function evidenceFrame(
  src: string,
  boxes: number[][],
  opts: { blur: boolean; watermark: string },
): Promise<{ data: Uint8Array; w: number; h: number }> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = 960;
  const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  if (opts.blur) {
    for (const [x, y, bw, bh] of boxes) {
      const rx = (x / 100) * w;
      const ry = (y / 100) * h;
      const rw = (bw / 100) * w;
      const rh = Math.max(12, (bh / 100) * h * 0.3);
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx - 4, ry - 4, rw + 8, rh + 8);
      ctx.clip();
      ctx.filter = 'blur(9px)';
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = 'bold 22px sans-serif';
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 8);
  ctx.textAlign = 'center';
  ctx.fillText(opts.watermark, 0, 0);
  ctx.restore();
  const blob = await new Promise<Blob>((r) =>
    canvas.toBlob((b) => r(b!), 'image/jpeg', 0.82),
  );
  return { data: new Uint8Array(await blob.arrayBuffer()), w, h };
}
