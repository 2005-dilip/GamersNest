import * as React from "react";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, fill, priority, className, ...props }, ref) => {
    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

export default Image;
