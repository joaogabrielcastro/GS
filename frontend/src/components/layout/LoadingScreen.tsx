import React from "react";
import Logo from "@/components/Logo";
import { Spinner } from "@/components/ui/Spinner";

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gs-orange-500 via-gs-orange-600 to-gs-orange-800 px-4">
    <div className="mb-8 flex justify-center">
      <Logo variant="onDark" size="lg" />
    </div>
    <Spinner size="lg" label="Carregando…" className="[&_p]:text-white/90" />
  </div>
);

export default LoadingScreen;
