"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Plus, Star, Trash2, X } from "lucide-react";
import { deleteProduct, saveProduct, uploadImages, type ProductInput } from "@/app/admin/actions";
import { centsToInput, parsePrice } from "@/lib/format";
import { resizeImage } from "@/lib/resize-image";
import { Card } from "./ui";

type ImageState = { id?: number; url: string; alt: string };
type VariantState = {
  key: string;
  id?: number;
  name: string;
  sku: string;
  colorHex: string;
  price: string;
  stock: string;
  imageUrl: string | null;
};

type Initial = Omit<ProductInput, "variants"> & {
  id: number;
  variants: { id: number; name: string; sku: string | null; colorHex: string | null; price: number | null; stock: number; imageUrl: string | null }[];
};

let keyCounter = 0;
const newKey = () => `v${++keyCounter}`;

export function ProductEditor({ initial, categories }: { initial: Initial | null; categories: { id: number; name: string }[] }) {
  const router = useRouter();
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ? String(initial.categoryId) : String(categories[0]?.id ?? ""));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [details, setDetails] = useState(initial?.details ?? "");
  const [price, setPrice] = useState(centsToInput(initial?.price));
  const [compareAt, setCompareAt] = useState(centsToInput(initial?.compareAtPrice));
  const [optionLabel, setOptionLabel] = useState(initial?.optionLabel ?? "Ngjyra");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [active, setActive] = useState(initial?.active ?? true);
  const [images, setImages] = useState<ImageState[]>(initial?.images.map((i) => ({ ...i, alt: i.alt ?? "" })) ?? []);
  const [variants, setVariants] = useState<VariantState[]>(
    initial?.variants.map((v) => ({
      key: newKey(),
      id: v.id,
      name: v.name,
      sku: v.sku ?? "",
      colorHex: v.colorHex ?? "",
      price: centsToInput(v.price),
      stock: String(v.stock),
      imageUrl: v.imageUrl,
    })) ?? [{ key: newKey(), name: "Standard", sku: "", colorHex: "", price: "", stock: "0", imageUrl: null }],
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMessage(null);
    // One request per photo keeps each upload under the hosting size limit.
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("name", name);
      fd.append("files", await resizeImage(file));
      const res = await uploadImages(fd);
      setImages((prev) => [...prev, ...res.urls.map((url) => ({ url, alt: name }))]);
      if (res.error) {
        setMessage({ type: "error", text: res.error });
        break;
      }
    }
    setUploading(false);
    if (fileInput.current) fileInput.current.value = "";
  }

  function moveImage(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeImage(index: number) {
    const url = images[index].url;
    setImages((prev) => prev.filter((_, i) => i !== index));
    setVariants((prev) => prev.map((v) => (v.imageUrl === url ? { ...v, imageUrl: null } : v)));
  }

  function updateVariant(key: string, patch: Partial<VariantState>) {
    setVariants((prev) => prev.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function save() {
    setMessage(null);
    const priceCents = parsePrice(price);
    if (priceCents == null) return setMessage({ type: "error", text: "Shkruani çmimin e produktit." });

    const payload: ProductInput = {
      id: initial?.id,
      name,
      slug,
      categoryId: categoryId ? Number(categoryId) : null,
      description,
      details,
      price: priceCents,
      compareAtPrice: parsePrice(compareAt),
      optionLabel,
      featured,
      active,
      images,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku.trim() || null,
        colorHex: v.colorHex || null,
        price: parsePrice(v.price),
        stock: Math.max(0, parseInt(v.stock, 10) || 0),
        imageUrl: v.imageUrl,
      })),
    };

    startSaving(async () => {
      const res = await saveProduct(payload);
      if (!res.ok) return setMessage({ type: "error", text: res.error ?? "Ruajtja dështoi." });
      setMessage({ type: "ok", text: "Ndryshimet u ruajtën." });
      if (!initial) router.replace(`/admin/produktet/${res.id}`);
      else router.refresh();
    });
  }

  function remove() {
    if (!initial) return;
    if (!confirm(`Ta fshij "${initial.name}"? Ky veprim nuk kthehet.`)) return;
    startSaving(() => deleteProduct(initial.id));
  }

  const totalStock = variants.reduce((n, v) => n + (parseInt(v.stock, 10) || 0), 0);

  return (
    <div className="pb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-normal">{initial ? initial.name : "Produkt i ri"}</h1>
        {initial && (
          <Link href={`/produkti/${initial.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
            Shiko në dyqan <ExternalLink size={14} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <div>
              <label className="label">Emri i produktit</label>
              <input className="field rounded" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label">Përshkrimi</label>
              <textarea className="field rounded" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
              <p className="mt-1 text-xs text-muted">Lini një rresht bosh për paragraf të ri.</p>
            </div>
            <div>
              <label className="label">Detajet (një për rresht, p.sh. &quot;Material: 100% pambuk&quot;)</label>
              <textarea className="field rounded font-mono text-sm" rows={5} value={details} onChange={(e) => setDetails(e.target.value)} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm">Fotot</h2>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="btn btn-outline !min-h-9 rounded !px-3 !text-xs"
              >
                <ImagePlus size={16} /> {uploading ? "Duke ngarkuar…" : "Shto foto"}
              </button>
              <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            </div>
            {images.length === 0 ? (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="grid w-full place-items-center rounded border-2 border-dashed border-stone py-12 text-sm text-muted"
              >
                Klikoni për të ngarkuar foto
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {images.map((img, i) => (
                  <div key={img.url} className="group relative">
                    <div className="relative aspect-[4/5] overflow-hidden rounded bg-sand">
                      <Image src={img.url} alt="" fill sizes="160px" className="object-cover" />
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">Kryesore</span>}
                    </div>
                    <div className="mt-1 flex justify-between">
                      <div className="flex">
                        <IconButton label="Majtas" onClick={() => moveImage(i, -1)} disabled={i === 0}><ArrowUp size={14} className="-rotate-90" /></IconButton>
                        <IconButton label="Djathtas" onClick={() => moveImage(i, 1)} disabled={i === images.length - 1}><ArrowDown size={14} className="-rotate-90" /></IconButton>
                      </div>
                      <IconButton label="Fshij foton" onClick={() => removeImage(i)}><Trash2 size={14} /></IconButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-sm">Variantet dhe stoku</h2>
                <p className="mt-1 text-xs text-muted">Çdo ngjyrë/madhësi ka stokun dhe kodin e vet. Totali: {totalStock} copë.</p>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <label className="label !mb-1 !text-xs">Etiketa e zgjedhjes</label>
                  <input className="field !min-h-9 w-36 rounded !py-1 text-sm" value={optionLabel} onChange={(e) => setOptionLabel(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="text-left text-xs text-muted">
                  <tr>
                    <th className="pb-2 pr-2 font-normal">Emri</th>
                    <th className="pb-2 pr-2 font-normal">Ngjyra</th>
                    <th className="pb-2 pr-2 font-normal">Kodi (SKU)</th>
                    <th className="pb-2 pr-2 font-normal">Çmim tjetër €</th>
                    <th className="pb-2 pr-2 font-normal">Stoku</th>
                    <th className="pb-2 pr-2 font-normal">Foto</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.key} className="align-top">
                      <td className="py-1 pr-2">
                        <input className="field !min-h-9 rounded !py-1" value={v.name} onChange={(e) => updateVariant(v.key, { name: e.target.value })} />
                      </td>
                      <td className="py-1 pr-2">
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            className="h-9 w-9 cursor-pointer rounded border border-stone bg-white p-0.5"
                            value={v.colorHex || "#ffffff"}
                            onChange={(e) => updateVariant(v.key, { colorHex: e.target.value })}
                          />
                          {v.colorHex && (
                            <IconButton label="Hiq ngjyrën" onClick={() => updateVariant(v.key, { colorHex: "" })}><X size={14} /></IconButton>
                          )}
                        </div>
                      </td>
                      <td className="py-1 pr-2">
                        <input className="field !min-h-9 w-32 rounded !py-1 font-mono text-xs" value={v.sku} onChange={(e) => updateVariant(v.key, { sku: e.target.value })} />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          className="field !min-h-9 w-24 rounded !py-1"
                          inputMode="decimal"
                          placeholder={price || "—"}
                          value={v.price}
                          onChange={(e) => updateVariant(v.key, { price: e.target.value })}
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <input
                          className="field !min-h-9 w-20 rounded !py-1"
                          type="number"
                          min={0}
                          value={v.stock}
                          onChange={(e) => updateVariant(v.key, { stock: e.target.value })}
                        />
                      </td>
                      <td className="py-1 pr-2">
                        <select
                          className="field !min-h-9 w-32 rounded !py-1 text-xs"
                          value={v.imageUrl ?? ""}
                          onChange={(e) => updateVariant(v.key, { imageUrl: e.target.value || null })}
                        >
                          <option value="">—</option>
                          {images.map((img, i) => (
                            <option key={img.url} value={img.url}>Foto {i + 1}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1">
                        <IconButton
                          label="Fshij variantin"
                          onClick={() => setVariants((prev) => prev.filter((x) => x.key !== v.key))}
                          disabled={variants.length === 1}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() =>
                setVariants((prev) => [...prev, { key: newKey(), name: "", sku: "", colorHex: "", price: "", stock: "0", imageUrl: null }])
              }
              className="mt-3 inline-flex items-center gap-1 text-sm text-clay hover:underline"
            >
              <Plus size={15} /> Shto variant
            </button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>
                Aktiv në dyqan
                <span className="block text-xs text-muted">Kur është fikur, produkti fshihet.</span>
              </span>
              <Toggle checked={active} onChange={setActive} />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <Star size={14} className="text-clay" /> I veçuar në faqen kryesore
              </span>
              <Toggle checked={featured} onChange={setFeatured} />
            </label>
          </Card>
          <Card className="space-y-4 p-5">
            <div>
              <label className="label">Çmimi (€)</label>
              <input className="field rounded" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="label">Çmimi i vjetër (€, për ofertë)</label>
              <input className="field rounded" inputMode="decimal" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} placeholder="opsionale" />
            </div>
          </Card>
          <Card className="space-y-4 p-5">
            <div>
              <label className="label">Kategoria</label>
              <select className="field rounded" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Pa kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Adresa në web (slug)</label>
              <input className="field rounded font-mono text-xs" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="krijohet nga emri" />
            </div>
          </Card>
          {initial && (
            <button type="button" onClick={remove} className="inline-flex items-center gap-1.5 text-sm text-danger hover:underline">
              <Trash2 size={15} /> Fshij produktin
            </button>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur md:left-60">
        <div className="flex items-center justify-end gap-4 px-4 py-3 sm:px-8">
          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-emerald-700" : "text-danger"}`}>{message.text}</p>
          )}
          <button type="button" onClick={save} disabled={saving || uploading} className="btn btn-primary !min-h-10 rounded">
            {saving ? "Duke ruajtur…" : "Ruaj"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-8 w-8 place-items-center rounded text-muted hover:bg-sand hover:text-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-ink" : "bg-stone"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}
