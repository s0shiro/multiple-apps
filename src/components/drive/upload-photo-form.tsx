import { uploadPhoto } from "@/lib/actions/photos";
import { UploadImageForm } from "@/components/shared";

export function UploadPhotoForm() {
  return (
    <UploadImageForm
      uploadAction={uploadPhoto}
      fileLabel="Select Image"
      nameLabel="Photo Name (optional)"
      namePlaceholder="Enter a name for the photo..."
    />
  );
}
