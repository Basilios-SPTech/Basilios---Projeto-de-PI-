// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const CHAVE_STORAGE = "produtos-basilios";

function formatBRL(value) {
    try {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 2,
        }).format(Number(value || 0));
    } catch {
        return `R$ ${value}`;
    }
}

export default function Home() {
    const [produtos, setProdutos] = useState([]);
    const location = useLocation();

    const loadFromStorage = () => {
        try {
            const raw = localStorage.getItem(CHAVE_STORAGE);
            const arr = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(arr)) return setProdutos([]);

            const normalized = arr.map((p, i) => {
                const nome = p.nome ?? p.name ?? "";
                const descricao = p.descricao ?? p.description ?? "";
                const preco = p.preco ?? p.price ?? 0;
                const imagem = p.imagem ?? p.imageDataUrl ?? "";
                const id = p.id ?? String(p.index ?? i);
                return { id, nome, descricao, preco, imagem };
            });

            setProdutos(normalized);
        } catch {
            setProdutos([]);
        }
    };

    useEffect(() => {
        loadFromStorage();
    }, [location.key]);

    useEffect(() => {
        const handler = () => loadFromStorage();
        window.addEventListener("produtos-updated", handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener("produtos-updated", handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    if (!produtos?.length) {
        return (
            <section className="grid place-items-center py-24">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-semibold">Sem produtos ainda 😶‍🌫️</h2>
                    <p className="text-slate-600 mt-2">
                        Vai lá em <span className="font-semibold">Cadastrar</span> e adiciona o primeiro.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <h2 className="text-xl font-semibold mb-4">Produtos</h2>

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {produtos.map((p) => (
                    <li
                        key={p.id}
                        className="group relative mx-auto w-full max-w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-within:ring-2 focus-within:ring-black/10"
                    >
                        <figure className="relative aspect-square w-full overflow-hidden bg-slate-50">
                            {p.imagem ? (
                                <div className="absolute inset-0 flex items-center justify-center p-3">
                                    <img
                                        src={p.imagem}
                                        alt={p.nome || "Produto"}
                                        loading="lazy"
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://placehold.co/800x800?text=Produto";
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 grid place-items-center text-slate-400">
                                    sem imagem
                                </div>
                            )}
                        </figure>


                        {/* CONTEÚDO */}
                        <div className="p-4">
                            <h3 className="text-base font-semibold text-slate-900 line-clamp-1">
                                {p.nome}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600 leading-relaxed line-clamp-2">
                                {p.descricao}
                            </p>

                            {/* FOOTER: preço + CTA */}
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-lg font-bold tracking-tight text-slate-900">
                                    {formatBRL(p.preco)}
                                </span>

                                {/* CTA opcional: remova se não for usar agora */}
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand,#BB3530)] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand,#BB3530)]"
                                    onClick={() => console.log("Adicionar ao carrinho:", p.id)}
                                >
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

        </section>
    );
}
