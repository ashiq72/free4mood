import Image, { type ImageProps } from "next/image";

type RemoteImageProps = Omit<ImageProps, "width" | "height"> & {
  width?: number;
  height?: number;
};

export const RemoteImage = ({
  alt,
  width = 100,
  height = 100,
  ...props
}: RemoteImageProps) => (
  <Image
    {...props}
    alt={alt}
    width={width}
    height={height}
    unoptimized
  />
);
