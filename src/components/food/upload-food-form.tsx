import { uploadFoodPhoto } from "@/lib/actions/food";
import { UploadImageForm } from "@/components/shared";

export function UploadFoodForm() {
  return (
    <UploadImageForm
      uploadAction={uploadFoodPhoto}
      fileLabel="Select Food Image"
      nameLabel="Food Name (optional)"
      namePlaceholder="Enter a name for the food..."
    />
  );
}
