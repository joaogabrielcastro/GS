import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { ALLOW_PUBLIC_REGISTER } from "@/config/env";
import { Lock, Mail } from "lucide-react";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-gs-orange-500 via-gs-orange-600 to-gs-orange-900">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Logo variant="onDark" size="lg" />
          <div className="max-w-md">
            <h1 className="text-3xl font-bold tracking-tight leading-tight">
              Gestão de frota inteligente
            </h1>
            <p className="mt-4 text-gs-orange-100 text-lg leading-relaxed">
              Checklists, ocorrências e pneus em um só lugar — com rastreabilidade para sua operação.
            </p>
          </div>
          <p className="text-sm text-gs-orange-200/90">© 2026 GS Transportes</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 bg-white">
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gs-black tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-2 text-gs-gray-600">Entre com suas credenciais para acessar o sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label-field">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gs-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field-lg pl-11"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label-field">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gs-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field-lg pl-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base mt-2"
            >
              {loading ? "Entrando…" : "Entrar no sistema"}
            </button>
          </form>

          {ALLOW_PUBLIC_REGISTER ? (
            <p className="mt-6 text-center text-sm text-gs-gray-600">
              Não tem conta?{" "}
              <a href="/register" className="font-semibold text-gs-orange-600 hover:text-gs-orange-700">
                Cadastre-se como motorista
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
