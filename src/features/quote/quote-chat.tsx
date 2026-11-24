"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { site } from "@/config/site";
import {
  buildQuoteMessage,
  hasWhatsappContact,
  normalizeAnswer,
  type QuoteStage,
  validateAnswer,
  whatsappUrl,
} from "./quote";

type Message = { id: number; text: string; outgoing: boolean };
type Answers = { name: string; problem: string; address: string };

const REPLY_DELAY_MS = 550;

const prompts: Record<QuoteStage, { label: string; placeholder: string; autoComplete: string }> = {
  0: {
    label: "Tu nombre o empresa",
    placeholder: "Escribí tu nombre o empresa…",
    autoComplete: "name",
  },
  1: { label: "Describí tu problema", placeholder: site.problemExample, autoComplete: "off" },
  2: {
    label: "Dirección del lugar",
    placeholder: site.addressExample,
    autoComplete: "street-address",
  },
};

const emptyAnswers: Answers = { name: "", problem: "", address: "" };

export function QuoteChat({ whatsapp, ...props }: ComponentProps<"div"> & { whatsapp: string }) {
  const [stage, setStage] = useState<QuoteStage | "done">(0);
  const [promptStage, setPromptStage] = useState<QuoteStage>(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [value, setValue] = useState("");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [dirty, setDirty] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<HTMLAnchorElement>(null);
  const finishRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef(0);
  const nextId = useRef(0);
  const scrollBehavior = useRef<ScrollBehavior>("smooth");

  const waiting = typing || (stage !== "done" && stage !== promptStage);
  const hasContact = hasWhatsappContact(whatsapp);
  const sendHref =
    stage === "done"
      ? whatsappUrl(whatsapp, buildQuoteMessage({ brand: site.brand, ...answers }))
      : `https://wa.me/${whatsapp}`;

  useEffect(() => {
    scrollBehavior.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    return () => window.clearTimeout(replyTimer.current);
  }, []);

  // Keeps the newest bubble in view; runs only when the conversation grows.
  useEffect(() => {
    if (messages.length === 0 && !typing) return;
    conversationRef.current?.lastElementChild?.scrollIntoView({
      block: "nearest",
      behavior: scrollBehavior.current,
    });
  }, [messages.length, typing]);

  // Focus follows the conversation: the input after each reply, the send link at the end.
  useEffect(() => {
    if (waiting || messages.length === 0) return;
    if (stage === "done") {
      sendRef.current?.focus({ preventScroll: true });
      finishRef.current?.scrollIntoView({ block: "nearest", behavior: scrollBehavior.current });
    } else {
      inputRef.current?.focus();
    }
  }, [waiting, stage, messages.length]);

  // Warns before leaving with an unsent quote in progress.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function push(text: string, outgoing: boolean) {
    nextId.current += 1;
    const id = nextId.current;
    setMessages((current) => [...current, { id, text, outgoing }]);
  }

  function reply(text: string, after: () => void) {
    setTyping(true);
    replyTimer.current = window.setTimeout(() => {
      setTyping(false);
      push(text, false);
      after();
    }, REPLY_DELAY_MS);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stage === "done" || waiting) return;
    const answer = normalizeAnswer(value);
    const problem = validateAnswer(stage, answer);
    if (problem) {
      setError(problem);
      inputRef.current?.focus();
      return;
    }
    setError("");
    setDirty(true);
    push(answer, true);
    setValue("");

    if (stage === 0) {
      setAnswers((current) => ({ ...current, name: answer }));
      setStage(1);
      reply(
        `Gracias, ${answer}. Contame qué necesitás resolver: qué viste, dónde aparece y en qué tipo de espacio.`,
        () => setPromptStage(1),
      );
    } else if (stage === 1) {
      setAnswers((current) => ({ ...current, problem: answer }));
      setStage(2);
      reply("¿En qué dirección está el lugar? Con la calle y el barrio alcanza.", () =>
        setPromptStage(2),
      );
    } else {
      setAnswers((current) => ({ ...current, address: answer }));
      reply(
        "Podemos ayudarte a resolverlo. Te conectamos con un asesor para evaluar el caso y coordinar los próximos pasos.",
        () => setStage("done"),
      );
    }
  }

  function restart() {
    window.clearTimeout(replyTimer.current);
    setStage(0);
    setPromptStage(0);
    setMessages([]);
    setTyping(false);
    setError("");
    setValue("");
    setAnswers(emptyAnswers);
    setDirty(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const prompt = prompts[promptStage];

  return (
    <div {...props} className="wa-shell">
      <section className="wa-chat" aria-label="Cotizador de Fumigaciones Delta">
        <div className="wa-header">
          <span className="wa-avatar" aria-hidden="true">
            <BrandMark />
          </span>
          <span className="wa-contact">
            <strong>COTIZADOR</strong>
            <small>
              <span className="wa-online" aria-hidden="true" />
              En línea
            </small>
          </span>
        </div>
        <div
          ref={conversationRef}
          className="wa-conversation"
          id="wa-conversation"
          aria-live="polite"
          aria-relevant="additions text"
        >
          <span className="wa-day">Hoy</span>
          <p className="wa-encryption">
            Queda en tu dispositivo hasta que confirmás el envío por WhatsApp.
          </p>
          <div className="wa-brief">
            <p>Cuatro datos y armamos el presupuesto.</p>
            <ol>
              <li>
                <span>01</span>Tu nombre o el de la empresa
              </li>
              <li>
                <span>02</span>Qué viste y en qué parte del lugar
              </li>
              <li>
                <span>03</span>Si es casa, negocio o local
              </li>
              <li>
                <span>04</span>La dirección donde hace falta
              </li>
            </ol>
          </div>
          <div className="wa-bubble wa-incoming">
            <span className="wa-sender">Cotizador</span>
            Hola. Empezamos por tu nombre. Si es una empresa, decinos cuál.
            <span className="wa-time">ahora</span>
          </div>
          {messages.map((message) =>
            message.outgoing ? (
              <div className="wa-outrow" key={message.id}>
                <div className="wa-bubble wa-outgoing">
                  <span>{message.text}</span>
                  <span className="wa-time">ahora ✓✓</span>
                </div>
                <span className="wa-user-logo" aria-hidden="true">
                  <BrandMark />
                </span>
              </div>
            ) : (
              <IncomingBubble key={message.id} text={message.text} />
            ),
          )}
          {typing && (
            <div className="wa-typing">
              <span className="sr-only">Cotizador está escribiendo</span>
              <span aria-hidden="true">•••</span>
            </div>
          )}
        </div>
        <form className="wa-composer" noValidate onSubmit={handleSubmit} hidden={stage === "done"}>
          <label className="sr-only" htmlFor="wa-answer">
            {prompt.label}
          </label>
          <input
            ref={inputRef}
            id="wa-answer"
            name="respuesta"
            autoComplete={prompt.autoComplete}
            maxLength={120}
            placeholder={prompt.placeholder}
            aria-describedby="wa-error"
            aria-invalid={Boolean(error)}
            required
            disabled={waiting}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setDirty(true);
              if (error) setError("");
            }}
          />
          <button type="submit" aria-label="Enviar respuesta" disabled={waiting}>
            <Icon name="arrow" />
          </button>
        </form>
        <p className="wa-error" id="wa-error" role="alert">
          {error}
        </p>
        <div className="wa-finish" id="wa-finish" ref={finishRef} hidden={stage !== "done"}>
          <a
            ref={sendRef}
            className="wa-action"
            href={sendHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setDirty(false)}
          >
            Continuar en WhatsApp <Icon name="diagonal" />
          </a>
          {!hasContact && (
            <p>
              El número de la empresa aún no está configurado; WhatsApp te pedirá elegir el
              contacto.
            </p>
          )}
          <button type="button" onClick={restart}>
            Empezar otra consulta
          </button>
        </div>
        <noscript>
          <p className="wa-noscript">Para iniciar la conversación, activá JavaScript.</p>
        </noscript>
      </section>
    </div>
  );
}

function IncomingBubble({ text }: { text: string }) {
  return (
    <div className="wa-bubble wa-incoming">
      <span className="wa-sender">Cotizador</span>
      <span>{text}</span>
      <span className="wa-time">ahora</span>
    </div>
  );
}

function BrandMark() {
  return (
    <img
      className="brand-mark"
      src="/media/delta-icon.svg"
      alt=""
      width={96}
      height={96}
      loading="lazy"
    />
  );
}
