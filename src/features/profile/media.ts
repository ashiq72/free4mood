const VIDEO_PATTERN =
  /\.(mp4|webm|mov|m4v|avi|mkv|ogv|ogg|3gp|wmv|flv)$/i;

export const isVideoUrl = (url: string) => {
  const lower = url.toLowerCase();
  return lower.includes("/video/upload/") || VIDEO_PATTERN.test(lower.split("?")[0]);
};

export const splitMediaUrls = (mediaUrls: string[]) => {
  const unique = Array.from(
    new Set(mediaUrls.filter((url): url is string => typeof url === "string" && !!url)),
  );

  return unique.reduce(
    (acc, url) => {
      if (isVideoUrl(url)) {
        acc.videos.push(url);
      } else {
        acc.photos.push(url);
      }
      return acc;
    },
    { photos: [] as string[], videos: [] as string[] },
  );
};

