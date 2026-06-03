import React, { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";
import api from "@/services/api";
import { getPrivateMediaApiPath } from "@/lib/mediaUrls";

export type ImageLoadFailure = "missing" | "forbidden" | "network" | "empty";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  onFailure?: (reason: ImageLoadFailure) => void;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className,
  onClick,
  onFailure,
}) => {
  const [error, setError] = useState(false);
  const [resolvedSrc, setResolvedSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [failureReason, setFailureReason] = useState<ImageLoadFailure>("empty");

  useEffect(() => {
    let objectUrl: string | null = null;
    let isCancelled = false;

    const fail = (reason: ImageLoadFailure) => {
      if (isCancelled) return;
      setResolvedSrc("");
      setError(true);
      setFailureReason(reason);
      setLoading(false);
      onFailure?.(reason);
    };

    const loadImage = async () => {
      setError(false);
      setLoading(true);

      const apiPath = getPrivateMediaApiPath(src) || (src.includes("/api/files/") ? src.replace(/^https?:\/\/[^/]+/, "").replace(/^\/api/, "") : "");

      if (!apiPath && !src) {
        fail("empty");
        return;
      }

      const isPrivateFile =
        apiPath.startsWith("/files/") || src.includes("/api/files/");

      if (!isPrivateFile) {
        setResolvedSrc(src);
        setLoading(false);
        return;
      }

      const requestPath = apiPath.startsWith("/files/")
        ? apiPath
        : src.replace(/^https?:\/\/[^/]+\/api/, "");

      try {
        const response = await api.get(requestPath, { responseType: "blob" });
        const blob = response.data;
        if (!(blob instanceof Blob) || blob.size === 0) {
          fail("missing");
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        if (!isCancelled) {
          setResolvedSrc(objectUrl);
          setLoading(false);
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) fail("missing");
        else if (status === 403) fail("forbidden");
        else fail("network");
      }
    };

    void loadImage();

    return () => {
      isCancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, onFailure]);

  if (loading) {
    return <div className="w-full h-full bg-gs-gray-100 animate-pulse rounded-lg" />;
  }

  if (error || !resolvedSrc) {
    const hint =
      failureReason === "missing"
        ? "Arquivo não está no servidor"
        : failureReason === "forbidden"
          ? "Sem permissão"
          : "Falha ao carregar";

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gs-gray-100 text-gs-gray-500 rounded-lg p-2 text-center">
        <ImageOff className="w-8 h-8 mb-1 shrink-0" />
        <span className="text-xs font-medium">Imagem indisponível</span>
        <span className="text-[10px] text-gs-gray-400 mt-0.5 leading-tight">{hint}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => {
        setError(true);
        setFailureReason("network");
      }}
    />
  );
};

export default ImageWithFallback;
