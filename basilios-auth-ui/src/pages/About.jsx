import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUp,
  ArrowLeft,
  Flame,
  Leaf,
  Truck,
  Star,
  ChefHat,
  Clock,
  MapPin,
  Utensils,
} from "lucide-react";

import LogoLink from "../components/LogoLink.jsx";
import BackButton from "../components/BackButton.jsx";
import FeatureCard from "../components/FeatureCard.jsx";
import TimelineItem from "../components/TimelineItem.jsx";
import Ticker from "../components/Ticker.jsx";

import "../styles/about.css";

export default function About() {
  const nav = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const items = root.querySelectorAll("[data-reveal]");
    if (prefersReduced) {
      items.forEach((el) => el.classList.add("show"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.setProperty(
              "--reveal-delay",
              `${(Number(e.target.dataset.delay) || 0) * 90}ms`
            );
            e.target.classList.add("show");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <main id="topo" className="about-root" ref={containerRef}>
      {/* HERO: preto com glow vermelho + sombra inferior */}
      <header className="about-hero about-hero--dark">
        <div className="about-hero__bg" aria-hidden="true" />
        <div className="about-hero__edge" aria-hidden="true" />
        <div className="container about-hero__inner">
          <div className="about-hero__top">
            <BackButton onClick={() => nav(-1)} className="btn--on-dark">
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </BackButton>

            {/* Logo maior e responsiva, reposicionada para mobile */}
            <LogoLink to="/home" />
          </div>

          <div className="about-hero__content" data-reveal="up" data-delay="0">
            <h1>
              Sobre a <span className="brand">Basilios</span>
            </h1>
            <p className="lead">
              Na Basilios, o sabor vem com abraço.
            Aqui o lanche é feito como em casa: maionese verde, pão fresquinho e carne no ponto.
            
            </p>

            <div className="about-hero__cta">
              <a className="btn btn--ghost btn--on-dark anchor-btn" href="#history">
                Nossa história
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* TICKER: junção preta → degrade até vermelho (liga com o hero) */}
      <Ticker
        text="O delicioso sabor, sempre!"
        separator=""
        speed={24}
        Icon={Utensils}
        tone="red"
        gap={80}
      />

      {/* DIFERENCIAIS: cards pretos + ícones vermelho chamativo */}
      <section className="container section" data-reveal="up" data-delay="0">
        <div className="section__head">
          <h2>Nossos diferenciais</h2>
          <p>O básico bem feito, com técnica e sabor.</p>
        </div>

        <div className="features">
          <FeatureCard
            className="is-dark"
            icon={Flame}
            title="Ponto perfeito"
            text="A chapa canta, o cliente escolhe o ponto e a gente acerta no sabor."
          />
          <FeatureCard
            className="is-dark"
            icon={Leaf}
            title="Ingredientes de respeito"
            text="Blend próprio, pães frescos e aquela maionese da casa. Só o que agrega."
          />
          <FeatureCard
            className="is-dark"
            icon={Truck}
            title="Entrega cuidadosa"
            text="Sai bonito, chega perfeito! O lanche merece respeito até a porta."
          />
          <FeatureCard
            className="is-dark"
            icon={Star}
            title="Receitas autorais"
            text="Clássicos da casa e combinações novas pra surpreender sem perder a essência."
          />
        </div>
      </section>

      {/* HISTÓRIA */}
      <section id="history" className="container section section--split">
        <div className="split__media" data-reveal="left" data-delay="0">
          <img src="/RestauranteDentro.png" alt="Primeira chapa da Basilios" className="card-media" />
          <div className="stacked">
            <img src="/logo.png" alt="Selo Basilios" className="card-media stacked__img" />
          </div>
        </div>

        <div className="split__content" data-reveal="right" data-delay="1">
          <h2>Nossa história</h2>
          <p>
             A <b>Basilios</b> nasceu de uma vontade simples: fazer um bom lanche, do jeito que a gente gostaria de comer.
            No começo era só uma <b>chapa</b>, um <b>sonho</b> e muita <b>força de vontade</b>.
          </p>

          <p>
          Com o tempo, a vizinhança chegou, os pedidos cresceram, e o tempero virou tradição.
          Hoje somos aquele cantinho do bairro onde o sabor é caseiro, o atendimento é de amigo e o lanche vem com <b>história</b>.
          </p>
          
          <p>
            Crescemos ouvindo clientes, ajustando processos e sem abrir mão do
            sabor. Hoje Basilios é sinônimo de <b>família</b>.
          </p>

          <ul className="bullets">
            <li><ChefHat size={18} /> Blend próprio do nosso jeito.</li>
            <li><Clock size={18} /> Ponto exato, sem passar um segundo.</li>
            <li><MapPin size={18} /> Ingredientes da melhor qualidade.</li>
          </ul>

          <a className="btn btn--primary anchor-btn" href="#principles">
            Nossos princípios
          </a>
        </div>
      </section>

      {/* LINHA DO TEMPO */}
      <section className="container section" data-reveal="up" data-delay="0">
        <div className="section__head">
          <h2>Linha do tempo</h2>
          <p>Marcos que moldaram nossa chapa.</p>
        </div>

        <div className="timeline">
          <div data-reveal="left" data-delay="0">
            <TimelineItem year="2015" title="A primeira chapa" image="/chapa.png">
              Começamos com muita garra, sabendo como e onde chegariamos.
            </TimelineItem>
          </div>
          <div data-reveal="right" data-delay="1">
            <TimelineItem year="2020" title="Explosão do delivery" image="entrega.png" right>
              Embalagem, roteirização e tempo de entrega otimizados.
            </TimelineItem>
          </div>
          <div data-reveal="left" data-delay="2">
            <TimelineItem year="2023" title="Menu autoral" image="/cardapio.png">
              Edições exclusivas, com muitas variedades e sabor.
            </TimelineItem>
          </div>
         <div data-reveal="right" data-delay="3">
            <TimelineItem year="2025" title="Dias atuais" image="/doismilevintecinco.png" right>
              Hoje a Basilios é aquele cantinho da aclimação, que todo mundo conhece e ama. 
            </TimelineItem>
          </div>
        </div>
      </section>

      {/* POSTERS */}
      <section id="principles" className="posters section" data-reveal="up" data-delay="0">
        <div className="container">
          <div className="posters__grid">
            <article className="poster poster--red" data-reveal="up" data-delay="0">
              <h3>SABOR EM<br/> PRIMEIRO LUGAR</h3>
              <p>Cada lanche é feito com o mesmo carinho do primeiro.</p>
            </article>
            <article className="poster poster--terra" data-reveal="up" data-delay="1">
              <h3>TEMPO É<br/> RESPEITO</h3>
              <p>Quem vem com fome merece atenção. Velocidade é nosso jeito de cuidar.</p>
            </article>
            <article className="poster poster--ink" data-reveal="up" data-delay="2">
              <h3>SIMPLES,<br/> SUCULENTO,<br/> DIRETO</h3>
              <p>O simples bem feito é o que faz a diferença.</p>
            </article>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta" data-reveal="up" data-delay="0">
        <div className="cta__bg" aria-hidden="true" />
        <div className="container cta__inner">
          <h3>Bora morder essa história?</h3>
          <p>Faça o pedido agora ou venha nos visitar!</p>
          <div className="cta__actions">
  <Link className="btn btn--primary" to="/home">Fazer pedido</Link>

  {/* Botão Voltar (padronizado) + classe extra para custom só no de baixo */}
        <a
  className="btn btn--ghost btn--back btn--back-bottom"
  href="#top"
  aria-label="Voltar ao topo"
>
  <ArrowUp size={18} />
  Topo
</a>

        </div>

        </div>
      </section>
    </main>
  );
}
