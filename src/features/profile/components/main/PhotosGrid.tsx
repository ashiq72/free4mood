import Image from "next/image";

interface PhotosGridProps {
  photos: string[];
  loading?: boolean;
}

export const PhotosGrid = ({ photos, loading }: PhotosGridProps) => {
  const preview = photos.slice(0, 9);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-zinc-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Photos</h2>
        <span className="text-sm text-gray-500">{photos.length} total</span>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading photos...</div>
      ) : preview.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {preview.map((photoUrl, index) => (
            <div
              key={`${photoUrl}-${index}`}
              className="aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                width={240}
                height={240}
                src={photoUrl}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                unoptimized
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No photos yet.</p>
      )}
    </div>
  );
};
