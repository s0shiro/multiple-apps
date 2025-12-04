import { getPhotos, type SortField, type SortOrder } from "@/lib/actions/photos";
import { UploadPhotoForm } from "@/components/drive/upload-photo-form";
import { PhotoGrid } from "@/components/drive/photo-grid";
import { PhotoFilters } from "@/components/drive/photo-filters";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HardDrive } from "lucide-react";

interface DrivePageProps {
  searchParams: Promise<{
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function DrivePage({ searchParams }: DrivePageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const sortBy = (params.sortBy as SortField) || "createdAt";
  const sortOrder = (params.sortOrder as SortOrder) || "desc";

  const { data: photos } = await getPhotos({ search, sortBy, sortOrder });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Google Drive Lite</CardTitle>
              <CardDescription>
                {photos.length === 0
                  ? "Upload your first photo to get started!"
                  : `${photos.length} photo${photos.length !== 1 ? "s" : ""} stored`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <UploadPhotoForm />
          <div className="border-t border-border pt-6">
            <PhotoFilters
              defaultSearch={search}
              defaultSortBy={sortBy}
              defaultSortOrder={sortOrder}
            />
          </div>
          <PhotoGrid photos={photos} />
        </CardContent>
      </Card>
    </div>
  );
}
