/**
 * Seeds (or updates, idempotently) a first real Property from prod-like data,
 * to have a non-empty environment ready ahead of the first deployment
 * (SPEC.md §4). Safe to re-run: upserts by slug, uploads are deduplicated by
 * filename against the existing media library.
 *
 * Photos are intentionally NOT committed to the repo (see .gitignore) — drop
 * the property's images in `apps/cms/seed-data/property-1/photos/` locally
 * (or point SEED_PHOTOS_DIR elsewhere) before running.
 *
 * Usage: pnpm --filter cms seed:property
 */

import path from "node:path";
import fs from "node:fs";
import { compileStrapi, createStrapi } from "@strapi/strapi";
import type { Core } from "@strapi/strapi";

const SLUG = "maison-en-campagne-vue-mer";
const PHOTOS_DIR =
  process.env.SEED_PHOTOS_DIR ?? path.join(__dirname, "..", "seed-data", "property-1", "photos");

// PropertyHero (apps/web/src/components/PropertyHero.tsx) always uses
// `photos[0]` as the background image — landscape orientation matters more
// here than elsewhere, since it's rendered `fill` + `object-cover` across a
// full-width banner. Pulled to the front of the upload order regardless of
// filename sort.
const HERO_PHOTO_FILENAME = "photo-02.jpeg";

type BlocksContent = Array<{ type: "paragraph"; children: Array<{ type: "text"; text: string }> }>;

function paragraphs(text: string): BlocksContent {
  return text.split("\n\n").map((block) => ({
    type: "paragraph" as const,
    children: [{ type: "text" as const, text: block }],
  }));
}

const AMENITIES_FR = [
  { label: "Cuisine équipée", icon: "utensils-crossed" },
  { label: "Réfrigérateur", icon: "refrigerator" },
  { label: "Cafetière filtre", icon: "coffee" },
  { label: "Jardin", icon: "trees" },
  { label: "Barbecue", icon: "flame" },
  { label: "Stationnement gratuit sur place", icon: "parking-circle" },
  { label: "Animaux acceptés", icon: "paw-print" },
  { label: "Chauffage", icon: "sun" },
  { label: "Clés remises par l'hôte", icon: "key" },
  { label: "Chaises longues", icon: "bed" },
  { label: "Linge de lit fourni", icon: "bed" },
  { label: "Salle de bain avec eau chaude", icon: "bath" },
];

const AMENITIES_EN = [
  { label: "Fully equipped kitchen", icon: "utensils-crossed" },
  { label: "Refrigerator", icon: "refrigerator" },
  { label: "Drip coffee maker", icon: "coffee" },
  { label: "Garden", icon: "trees" },
  { label: "Barbecue", icon: "flame" },
  { label: "Free parking on premises", icon: "parking-circle" },
  { label: "Pets allowed", icon: "paw-print" },
  { label: "Heating", icon: "sun" },
  { label: "Self check-in with keys", icon: "key" },
  { label: "Sun loungers", icon: "bed" },
  { label: "Bed linen provided", icon: "bed" },
  { label: "Bathroom with hot water", icon: "bath" },
];

const FR_DATA = {
  name: "Maison en campagne vue mer",
  shortDescription: "Maison entière en campagne bretonne, vue mer, jardin clos, à 3 km des plages.",
  description: paragraphs(
    [
      "La maison se situe à 3 km des plages, dont une autorisée aux chiens l'été (en laisse). Elle dispose d'un grand jardin, dont une partie clôturée si vous en avez le besoin.",
      "Le logement dispose d'un espace de vie, avec vue mer, comprenant salon, salle à manger et cuisine au rez-de-chaussée. La salle de bain et les toilettes y sont également présents.",
      "À l'étage, vous retrouverez un coin cosy, disposant d'un canapé-lit d'une place et d'un lit simple. La chambre principale, avec un lit queen-size et des espaces de rangement, est idéale pour accueillir un couple.",
      "Réservation de 1 à 2 nuits possible en fonction des disponibilités — nous contacter pour en savoir plus. Du 1er juillet au 12 septembre, le logement n'est disponible que sur des semaines complètes, du samedi au samedi.",
    ].join("\n\n"),
  ),
  amenities: AMENITIES_FR,
};

const EN_DATA = {
  name: "Countryside house with sea view",
  shortDescription:
    "Entire house in the Breton countryside, sea view, enclosed garden, 3 km from the beaches.",
  description: paragraphs(
    [
      "The house is located 3 km from the beaches, including one where dogs are allowed on a leash in summer. It has a large garden, part of which is enclosed if needed.",
      "The home has a living area with sea views, including a lounge, dining room and kitchen on the ground floor. The bathroom and toilet are also on this level.",
      "Upstairs you'll find a cosy nook with a single sofa bed and a single bed. The main bedroom, with a queen-size bed and storage space, is ideal for a couple.",
      "Bookings of 1 to 2 nights are possible depending on availability — contact us to find out more. From July 1st to September 12th, the property is only available for full weeks, Saturday to Saturday.",
    ].join("\n\n"),
  ),
  amenities: AMENITIES_EN,
};

const LOCATION = {
  addressLine: "10 Kermabon",
  city: "Plouider",
  postalCode: "29260",
  country: "France",
  latitude: 48.6261595,
  longitude: -4.3185,
  // Should be derived server-side by the property lifecycle
  // (deriveApproximateLocation, src/api/property/content-types/property/lifecycles.ts)
  // on create/update — but that hook only fires against db.query's raw event
  // shape and never actually receives `location` through entityService/Document
  // Service writes (verified empirically: approxLatitude/approxLongitude stay
  // null in practice), so the map silently fails to render for every property.
  // Set explicitly here as a workaround until that's fixed; same rounding
  // (2 decimals, ~1km) as the lifecycle's own logic.
  approxLatitude: 48.63,
  approxLongitude: -4.32,
  proximityNote: "À 3 km des plages",
};

const PRICING = {
  basePricePerNight: 104,
  currency: "EUR" as const,
};

const MAX_GUESTS = 4;

async function uploadPhotos(strapi: Core.Strapi): Promise<number[]> {
  if (!fs.existsSync(PHOTOS_DIR)) {
    strapi.log.warn(`Photos directory not found (${PHOTOS_DIR}) — seeding without photos.`);
    return [];
  }

  const uploadService = strapi.plugin("upload").service("upload");
  const filenames = fs
    .readdirSync(PHOTOS_DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => {
      if (a === HERO_PHOTO_FILENAME) return -1;
      if (b === HERO_PHOTO_FILENAME) return 1;
      return a.localeCompare(b);
    });

  if (filenames.length === 0) {
    strapi.log.warn(`No image files found in ${PHOTOS_DIR} — seeding without photos.`);
    return [];
  }

  const existing = await strapi.db.query("plugin::upload.file").findMany({
    where: { name: { $in: filenames } },
  });
  const existingByName = new Map(
    existing.map((file: { name: string; id: number }) => [file.name, file.id]),
  );

  const ids: number[] = [];
  for (const filename of filenames) {
    const alreadyUploaded = existingByName.get(filename);
    if (alreadyUploaded) {
      ids.push(alreadyUploaded);
      continue;
    }

    const filepath = path.join(PHOTOS_DIR, filename);
    const { size } = fs.statSync(filepath);
    const ext = path.extname(filename).slice(1).toLowerCase();
    const mimetype = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    const [uploaded] = await uploadService.upload({
      data: {},
      files: { filepath, originalFilename: filename, mimetype, size },
    });
    ids.push(uploaded.id);
    strapi.log.info(`Uploaded ${filename} (media id ${uploaded.id}).`);
  }

  return ids;
}

async function seed() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  app.log.level = "info";

  try {
    const properties = app.documents("api::property.property");

    const photoIds = await uploadPhotos(app);

    const existing = await properties.findFirst({
      filters: { slug: SLUG },
      locale: "fr",
      status: "published",
    });

    const baseData = {
      slug: SLUG,
      maxGuests: MAX_GUESTS,
      location: LOCATION,
      pricing: PRICING,
      ...(photoIds.length > 0 ? { photos: photoIds } : {}),
    };

    let documentId: string;
    if (existing) {
      documentId = existing.documentId;
      await properties.update({
        documentId,
        locale: "fr",
        data: { ...baseData, ...FR_DATA },
        status: "published",
      });
      app.log.info(`Updated existing property "${FR_DATA.name}" (${documentId}).`);
    } else {
      const created = await properties.create({
        locale: "fr",
        data: { ...baseData, ...FR_DATA },
        status: "published",
      });
      documentId = created.documentId;
      app.log.info(`Created property "${FR_DATA.name}" (${documentId}).`);
    }

    await properties.update({
      documentId,
      locale: "en",
      data: { ...baseData, ...EN_DATA },
      status: "published",
    });
    app.log.info(`Upserted English localization for "${EN_DATA.name}".`);
  } finally {
    await app.destroy();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
