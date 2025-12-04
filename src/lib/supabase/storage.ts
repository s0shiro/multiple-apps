import { createAdminClient } from "./admin";

const PHOTOS_BUCKET = "photos";

// Ensure the photos storage bucket exists
export async function ensurePhotosBucket() {
  const supabase = createAdminClient();

  // Check if bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("Error listing buckets:", listError);
    throw new Error("Failed to check storage buckets");
  }

  const bucketExists = buckets?.some((b) => b.name === PHOTOS_BUCKET);

  if (!bucketExists) {
    // Create the bucket
    const { error: createError } = await supabase.storage.createBucket(PHOTOS_BUCKET, {
      public: true, // Allow public access to files
      fileSizeLimit: 5 * 1024 * 1024, // 5MB max file size
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    });

    if (createError) {
      console.error("Error creating bucket:", createError);
      throw new Error("Failed to create storage bucket");
    }

    console.log(`Created storage bucket: ${PHOTOS_BUCKET}`);
  }

  return PHOTOS_BUCKET;
}

// Get the bucket name constant
export function getPhotosBucketName() {
  return PHOTOS_BUCKET;
}
