import React, { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import api from "@/services/api";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  onClick,
}) => {
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let isCancelled = false;

    const loadImage = async () => {
      setError(false);
      setLoading(true);

      if (!src) {
        setResolvedSrc("");
        setLoading(false);
        return;
      }

      const isPrivateFile = src.includes("/api/files/");
      if (!isPrivateFile) {
        setResolvedSrc(src);
        setLoading(false);
        return;
      }

      try {
        // Requests to private files must carry auth headers; img tags do not.
        const response = await api.get(src, { responseType: "blob" });
        objectUrl = URL.createObjectURL(response.data);
        if (!isCancelled) {
          setResolvedSrc(objectUrl);
          setLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setResolvedSrc("");
          setError(true);
          setLoading(false);
        }
      }
    };

    void loadImage();

    return () => {
      isCancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (loading) {
    return <div className="w-full h-full bg-gray-200 animate-pulse" />;
  }

  if (error || !resolvedSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 text-gray-400">
        <ImageOff className="w-8 h-8 mb-1" />
        <span className="text-xs">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setError(true)}
    />
  );
};

export default ImageWithFallback;
