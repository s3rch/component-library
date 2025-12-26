"use client";

import { useMemo, useState } from "react";

import { Button, Card, Input, Modal } from "@repo/ui";

type ModalSize = "small" | "medium" | "large";

export function ShowcaseSection() {
  const [clicks, setClicks] = useState<number>(0);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalSize, setModalSize] = useState<ModalSize>("medium");

  const demoImageSrc = useMemo(() => "/demo-card.svg", []);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Showcase</h2>
        <p className="text-sm text-slate-600">
          Interactúa con los componentes para generar eventos de tracking automáticamente.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Buttons</p>
        <p className="mt-1 text-xs text-slate-500">
          Variants: primary/secondary/danger · States: default/loading/disabled · Icon opcional.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => setClicks((c) => c + 1)} icon={<IconBolt />}>
            Primary
          </Button>
          <Button variant="secondary" onClick={() => setClicks((c) => c + 1)}>
            Secondary
          </Button>
          <Button variant="danger" onClick={() => setClicks((c) => c + 1)}>
            Danger
          </Button>
          <Button variant="primary" state="loading">
            Loading
          </Button>
          <Button variant="secondary" state="disabled">
            Disabled
          </Button>
        </div>

        <p className="mt-3 text-sm text-slate-700">
          Clicks locales: <span className="font-mono">{clicks}</span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Inputs</p>
        <p className="mt-1 text-xs text-slate-500">
          Tracking SOLO en focus/blur (nunca el value). Types: text/email/password. Validation: default/error/success.
        </p>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            label="Name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Input
            label="Email"
            type="email"
            validation="success"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
          <Input
            label="Password"
            type="password"
            validation="error"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />
          <Input label="Disabled" type="text" placeholder="Disabled" disabled value="Disabled" readOnly />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Modal</p>
        <p className="mt-1 text-xs text-slate-500">
          Open/close tracking + reason. Cierra con X / overlay / ESC / botón API.
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setModalSize("small");
              setModalOpen(true);
            }}
          >
            Open small
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setModalSize("medium");
              setModalOpen(true);
            }}
          >
            Open medium
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setModalSize("large");
              setModalOpen(true);
            }}
          >
            Open large
          </Button>
        </div>

        <Modal
          open={modalOpen}
          size={modalSize}
          header={`Demo Modal (${modalSize})`}
          onOpenChange={(open) => setModalOpen(open)}
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Close via API
              </Button>
              <Button variant="primary" onClick={() => setModalOpen(false)}>
                Done
              </Button>
            </div>
          }
        >
          <p className="text-sm text-slate-700">
            Prueba: presiona <span className="font-mono">ESC</span>, haz click en el overlay o usa la X.
          </p>
        </Modal>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-900">Cards</p>
        <p className="mt-1 text-xs text-slate-500">Border: none/subtle/strong · Click tracking solo si es clickable.</p>

        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card border="none" header="Static card" footer={<span className="text-xs text-slate-500">Not clickable</span>}>
            Esta card NO emite tracking de click.
          </Card>

          <Card
            border="subtle"
            header="Clickable card"
            footer={<span className="text-xs text-slate-500">Click me</span>}
            onClick={() => setClicks((c) => c + 1)}
          >
            Click aquí para generar tracking action=click.
          </Card>

          <Card
            border="strong"
            header="Card with image"
            imageSrc={demoImageSrc}
            imageAlt="Demo card image"
            onClick={() => setClicks((c) => c + 1)}
            footer={<span className="text-xs text-slate-500">Clickable + image</span>}
          >
            Soporta imagen + header/body/footer.
          </Card>
        </div>
      </div>
    </section>
  );
}

function IconBolt() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 12-14h-7l-1-6z" />
    </svg>
  );
}







