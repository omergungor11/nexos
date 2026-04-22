"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  CheckIcon,
  XIcon,
  MapPinIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { GoogleMapPicker } from "@/components/admin/google-map-picker";

import {
  createCity,
  updateCity,
  deleteCity,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  createNeighborhood,
  updateNeighborhood,
  deleteNeighborhood,
} from "@/actions/locations";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CityRow = {
  id: number;
  name: string;
  slug: string;
  plate_code: number | null;
  lat: number | null;
  lng: number | null;
};

type DistrictRow = {
  id: number;
  name: string;
  slug: string;
  city_id: number;
  lat: number | null;
  lng: number | null;
};

type NeighborhoodRow = {
  id: number;
  name: string;
  slug: string;
  district_id: number;
  lat: number | null;
  lng: number | null;
};

type ActiveTab = "cities" | "districts" | "neighborhoods";

// ---------------------------------------------------------------------------
// Inline edit row
// ---------------------------------------------------------------------------

function InlineEditInput({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (value.trim()) onSave(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-7 text-sm"
        autoFocus
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => value.trim() && onSave(value.trim())}
        aria-label="Kaydet"
      >
        <CheckIcon className="size-4 text-green-600" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        aria-label="Iptal"
      >
        <XIcon className="size-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Generic delete confirm dialog
// ---------------------------------------------------------------------------

function DeleteConfirmDialog({
  name,
  onDelete,
}: {
  name: string;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      onDelete();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="Sil" />
        }
      >
        <Trash2Icon className="size-4 text-destructive" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sil</DialogTitle>
          <DialogDescription>
            &ldquo;{name}&rdquo; silinecek. Bu islem geri alinamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Vazgec</DialogClose>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Map pin dialog — reusable for all location types
// ---------------------------------------------------------------------------

function MapPinDialog({
  name,
  lat,
  lng,
  onSave,
}: {
  name: string;
  lat: number | null;
  lng: number | null;
  onSave: (coords: { lat: number; lng: number }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null
  );
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (newCoords: { lat: number; lng: number }) => {
      setCoords(newCoords);
    },
    []
  );

  function handleSave() {
    if (!coords) return;
    startTransition(async () => {
      onSave(coords);
      setOpen(false);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          // Reset coords when opening
          setCoords(lat != null && lng != null ? { lat, lng } : null);
        }
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Konum belirle"
            title={
              lat != null
                ? `${lat.toFixed(4)}, ${lng?.toFixed(4)}`
                : "Konum belirle"
            }
          />
        }
      >
        <MapPinIcon
          className={`size-4 ${lat != null ? "text-green-600" : "text-muted-foreground"}`}
        />
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Konum Belirle — {name}</DialogTitle>
          <DialogDescription>
            Haritaya tiklayarak veya arama yaparak tam konumu belirleyin.
          </DialogDescription>
        </DialogHeader>

        <GoogleMapPicker
          lat={lat}
          lng={lng}
          onChange={handleChange}
          height="400px"
        />

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Vazgec
          </DialogClose>
          <Button onClick={handleSave} disabled={isPending || !coords}>
            {isPending ? "Kaydediliyor..." : "Konumu Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Coordinate badge
// ---------------------------------------------------------------------------

function CoordBadge({ lat, lng }: { lat: number | null; lng: number | null }) {
  if (lat == null || lng == null) {
    return (
      <span className="text-xs text-muted-foreground/50">Konum yok</span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-mono text-green-700 dark:bg-green-950 dark:text-green-400">
      <MapPinIcon className="size-2.5" />
      {lat.toFixed(4)}, {lng.toFixed(4)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Cities tab
// ---------------------------------------------------------------------------

function CitiesTab({ initialCities }: { initialCities: CityRow[] }) {
  const [cities, setCities] = useState<CityRow[]>(initialCities);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [, startTransition] = useTransition();

  function handleEdit(id: number, newName: string) {
    startTransition(async () => {
      const result = await updateCity(id, { name: newName });
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setCities((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, name: result.data.name, slug: result.data.slug }
              : c
          )
        );
        toast.success("Il guncellendi.");
      }
      setEditingId(null);
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteCity(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setCities((prev) => prev.filter((c) => c.id !== id));
        toast.success("Il silindi.");
      }
    });
  }

  function handleAdd() {
    if (!newName.trim()) return;

    startTransition(async () => {
      const result = await createCity({
        name: newName.trim(),
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        const newCity: CityRow = {
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          plate_code: null,
          lat: null,
          lng: null,
        };
        setCities((prev) =>
          [...prev, newCity].sort((a, b) =>
            a.name.localeCompare(b.name, "tr")
          )
        );
        toast.success("Il eklendi.");
        setNewName("");
        setAddingNew(false);
      }
    });
  }

  function handleSaveCoords(cityId: number, coords: { lat: number; lng: number }) {
    startTransition(async () => {
      const result = await updateCity(cityId, { lat: coords.lat, lng: coords.lng });
      if (result.error) {
        toast.error(result.error);
      } else {
        setCities((prev) =>
          prev.map((c) =>
            c.id === cityId ? { ...c, lat: coords.lat, lng: coords.lng } : c
          )
        );
        toast.success("Konum kaydedildi.");
      }
    });
  }

  const thClass =
    "px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAddingNew(true)}>
          <PlusIcon className="size-4" />
          Il Ekle
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Il Adi</th>
              <th className={thClass}>Slug</th>
              <th className={thClass}>Konum</th>
              <th className={thClass}>Islemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {/* New row */}
            {addingNew && (
              <tr>
                <td className="px-3 py-2">
                  <Input
                    placeholder="Il adi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-7 w-40 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") setAddingNew(false);
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  otomatik
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  —
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleAdd}
                    >
                      <CheckIcon className="size-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setAddingNew(false);
                        setNewName("");
                      }}
                    >
                      <XIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {cities.length === 0 && !addingNew ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  Henuz il eklenmemis.
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-2">
                    {editingId === city.id ? (
                      <InlineEditInput
                        initialValue={city.name}
                        onSave={(v) => handleEdit(city.id, v)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <span className="font-medium">{city.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {city.slug}
                  </td>
                  <td className="px-3 py-2">
                    <CoordBadge lat={city.lat} lng={city.lng} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <MapPinDialog
                        name={city.name}
                        lat={city.lat}
                        lng={city.lng}
                        onSave={(coords) => handleSaveCoords(city.id, coords)}
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingId(city.id)}
                        aria-label="Duzenle"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirmDialog
                        name={city.name}
                        onDelete={() => handleDelete(city.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Districts tab
// ---------------------------------------------------------------------------

function DistrictsTab({
  initialDistricts,
  cities,
}: {
  initialDistricts: DistrictRow[];
  cities: CityRow[];
}) {
  const [districts, setDistricts] = useState<DistrictRow[]>(initialDistricts);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCityId, setNewCityId] = useState<string>("");
  const [filterCityId, setFilterCityId] = useState<string>("all");
  const [, startTransition] = useTransition();

  const filtered =
    filterCityId === "all"
      ? districts
      : districts.filter((d) => d.city_id === parseInt(filterCityId, 10));

  function getCityName(cityId: number): string {
    return cities.find((c) => c.id === cityId)?.name ?? "—";
  }

  function handleEdit(id: number, newName: string) {
    startTransition(async () => {
      const result = await updateDistrict(id, { name: newName });
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setDistricts((prev) =>
          prev.map((d) =>
            d.id === id
              ? { ...d, name: result.data.name, slug: result.data.slug }
              : d
          )
        );
        toast.success("Ilce guncellendi.");
      }
      setEditingId(null);
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteDistrict(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setDistricts((prev) => prev.filter((d) => d.id !== id));
        toast.success("Ilce silindi.");
      }
    });
  }

  function handleAdd() {
    if (!newName.trim() || !newCityId) return;

    startTransition(async () => {
      const cityId = parseInt(newCityId, 10);
      const result = await createDistrict({
        name: newName.trim(),
        city_id: cityId,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        const newDistrict: DistrictRow = {
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          city_id: cityId,
          lat: null,
          lng: null,
        };
        setDistricts((prev) =>
          [...prev, newDistrict].sort((a, b) =>
            a.name.localeCompare(b.name, "tr")
          )
        );
        toast.success("Ilce eklendi.");
        setNewName("");
        setNewCityId("");
        setAddingNew(false);
      }
    });
  }

  function handleSaveCoords(districtId: number, coords: { lat: number; lng: number }) {
    startTransition(async () => {
      const result = await updateDistrict(districtId, { lat: coords.lat, lng: coords.lng });
      if (result.error) {
        toast.error(result.error);
      } else {
        setDistricts((prev) =>
          prev.map((d) =>
            d.id === districtId
              ? { ...d, lat: coords.lat, lng: coords.lng }
              : d
          )
        );
        toast.success("Konum kaydedildi.");
      }
    });
  }

  const thClass =
    "px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {/* City filter */}
        <Select
          value={filterCityId}
          onValueChange={(v) => setFilterCityId(v ?? "all")}
        >
          <SelectTrigger className="h-8 w-48">
            <SelectValue placeholder="Ile gore filtrele" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum Iller</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" onClick={() => setAddingNew(true)}>
          <PlusIcon className="size-4" />
          Ilce Ekle
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Ilce Adi</th>
              <th className={thClass}>Il</th>
              <th className={thClass}>Slug</th>
              <th className={thClass}>Konum</th>
              <th className={thClass}>Islemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {/* New row */}
            {addingNew && (
              <tr>
                <td className="px-3 py-2">
                  <Input
                    placeholder="Ilce adi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-7 w-40 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") setAddingNew(false);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={newCityId}
                    onValueChange={(v) => setNewCityId(v ?? "")}
                  >
                    <SelectTrigger className="h-7 w-36">
                      <SelectValue placeholder="Il sec" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  otomatik
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  —
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={handleAdd}>
                      <CheckIcon className="size-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setAddingNew(false);
                        setNewName("");
                        setNewCityId("");
                      }}
                    >
                      <XIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {filtered.length === 0 && !addingNew ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  Bu ile ait ilce bulunamadi.
                </td>
              </tr>
            ) : (
              filtered.map((district) => (
                <tr
                  key={district.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2">
                    {editingId === district.id ? (
                      <InlineEditInput
                        initialValue={district.name}
                        onSave={(v) => handleEdit(district.id, v)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <span className="font-medium">{district.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {getCityName(district.city_id)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {district.slug}
                  </td>
                  <td className="px-3 py-2">
                    <CoordBadge lat={district.lat} lng={district.lng} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <MapPinDialog
                        name={district.name}
                        lat={district.lat}
                        lng={district.lng}
                        onSave={(coords) =>
                          handleSaveCoords(district.id, coords)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingId(district.id)}
                        aria-label="Duzenle"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirmDialog
                        name={district.name}
                        onDelete={() => handleDelete(district.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Neighborhoods tab
// ---------------------------------------------------------------------------

function NeighborhoodsTab({
  initialNeighborhoods,
  districts,
  cities,
}: {
  initialNeighborhoods: NeighborhoodRow[];
  districts: DistrictRow[];
  cities: CityRow[];
}) {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodRow[]>(
    initialNeighborhoods
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDistrictId, setNewDistrictId] = useState<string>("");
  const [filterCityId, setFilterCityId] = useState<string>("all");
  const [filterDistrictId, setFilterDistrictId] = useState<string>("all");
  const [, startTransition] = useTransition();

  // Cascading: districts filtered by selected city
  const cityFilteredDistricts =
    filterCityId === "all"
      ? districts
      : districts.filter((d) => d.city_id === parseInt(filterCityId, 10));

  // Neighborhoods filtered by city+district
  const filtered = neighborhoods.filter((n) => {
    if (filterDistrictId !== "all") {
      return n.district_id === parseInt(filterDistrictId, 10);
    }
    if (filterCityId !== "all") {
      const cityId = parseInt(filterCityId, 10);
      const districtIds = new Set(
        districts.filter((d) => d.city_id === cityId).map((d) => d.id)
      );
      return districtIds.has(n.district_id);
    }
    return true;
  });

  function getDistrictName(districtId: number): string {
    return districts.find((d) => d.id === districtId)?.name ?? "—";
  }

  function handleEdit(id: number, name: string) {
    startTransition(async () => {
      const result = await updateNeighborhood(id, { name });
      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        setNeighborhoods((prev) =>
          prev.map((n) =>
            n.id === id
              ? { ...n, name: result.data.name, slug: result.data.slug }
              : n
          )
        );
        toast.success("Mahalle guncellendi.");
      }
      setEditingId(null);
    });
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteNeighborhood(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        setNeighborhoods((prev) => prev.filter((n) => n.id !== id));
        toast.success("Mahalle silindi.");
      }
    });
  }

  function handleAdd() {
    if (!newName.trim() || !newDistrictId) return;

    startTransition(async () => {
      const districtId = parseInt(newDistrictId, 10);
      const result = await createNeighborhood({
        name: newName.trim(),
        district_id: districtId,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.data) {
        const newNeighborhood: NeighborhoodRow = {
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          district_id: districtId,
          lat: null,
          lng: null,
        };
        setNeighborhoods((prev) =>
          [...prev, newNeighborhood].sort((a, b) =>
            a.name.localeCompare(b.name, "tr")
          )
        );
        toast.success("Mahalle eklendi.");
        setNewName("");
        setNewDistrictId("");
        setAddingNew(false);
      }
    });
  }

  function handleSaveCoords(
    neighborhoodId: number,
    coords: { lat: number; lng: number }
  ) {
    startTransition(async () => {
      const result = await updateNeighborhood(neighborhoodId, {
        lat: coords.lat,
        lng: coords.lng,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        setNeighborhoods((prev) =>
          prev.map((n) =>
            n.id === neighborhoodId
              ? { ...n, lat: coords.lat, lng: coords.lng }
              : n
          )
        );
        toast.success("Konum kaydedildi.");
      }
    });
  }

  const thClass =
    "px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {/* City filter */}
          <Select
            value={filterCityId}
            onValueChange={(v) => {
              setFilterCityId(v ?? "all");
              setFilterDistrictId("all");
            }}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Il" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum Iller</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* District filter */}
          <Select
            value={filterDistrictId}
            onValueChange={(v) => setFilterDistrictId(v ?? "all")}
          >
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Ilce" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tum Ilceler</SelectItem>
              {cityFilteredDistricts.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={() => setAddingNew(true)}>
          <PlusIcon className="size-4" />
          Mahalle Ekle
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className={thClass}>Mahalle Adi</th>
              <th className={thClass}>Ilce</th>
              <th className={thClass}>Slug</th>
              <th className={thClass}>Konum</th>
              <th className={thClass}>Islemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-background">
            {/* New row */}
            {addingNew && (
              <tr>
                <td className="px-3 py-2">
                  <Input
                    placeholder="Mahalle adi"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-7 w-40 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAdd();
                      if (e.key === "Escape") setAddingNew(false);
                    }}
                  />
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={newDistrictId}
                    onValueChange={(v) => setNewDistrictId(v ?? "")}
                  >
                    <SelectTrigger className="h-7 w-40">
                      <SelectValue placeholder="Ilce sec" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  otomatik
                </td>
                <td className="px-3 py-2 text-muted-foreground text-xs">
                  —
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleAdd}
                    >
                      <CheckIcon className="size-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setAddingNew(false);
                        setNewName("");
                        setNewDistrictId("");
                      }}
                    >
                      <XIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}

            {filtered.length === 0 && !addingNew ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-6 text-center text-muted-foreground"
                >
                  Bu filtreye ait mahalle bulunamadi.
                </td>
              </tr>
            ) : (
              filtered.map((neighborhood) => (
                <tr
                  key={neighborhood.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2">
                    {editingId === neighborhood.id ? (
                      <InlineEditInput
                        initialValue={neighborhood.name}
                        onSave={(v) => handleEdit(neighborhood.id, v)}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <span className="font-medium">{neighborhood.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {getDistrictName(neighborhood.district_id)}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    {neighborhood.slug}
                  </td>
                  <td className="px-3 py-2">
                    <CoordBadge
                      lat={neighborhood.lat}
                      lng={neighborhood.lng}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <MapPinDialog
                        name={neighborhood.name}
                        lat={neighborhood.lat}
                        lng={neighborhood.lng}
                        onSave={(coords) =>
                          handleSaveCoords(neighborhood.id, coords)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEditingId(neighborhood.id)}
                        aria-label="Duzenle"
                      >
                        <PencilIcon className="size-4" />
                      </Button>
                      <DeleteConfirmDialog
                        name={neighborhood.name}
                        onDelete={() => handleDelete(neighborhood.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function LocationManager({
  initialCities,
  initialDistricts,
  initialNeighborhoods,
}: {
  initialCities: CityRow[];
  initialDistricts: DistrictRow[];
  initialNeighborhoods: NeighborhoodRow[];
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("cities");

  const tabs: { value: ActiveTab; label: string; count: number }[] = [
    { value: "cities", label: "Iller", count: initialCities.length },
    { value: "districts", label: "Ilceler", count: initialDistricts.length },
    {
      value: "neighborhoods",
      label: "Mahalleler",
      count: initialNeighborhoods.length,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "cities" && (
        <CitiesTab initialCities={initialCities} />
      )}
      {activeTab === "districts" && (
        <DistrictsTab
          initialDistricts={initialDistricts}
          cities={initialCities}
        />
      )}
      {activeTab === "neighborhoods" && (
        <NeighborhoodsTab
          initialNeighborhoods={initialNeighborhoods}
          districts={initialDistricts}
          cities={initialCities}
        />
      )}
    </div>
  );
}
