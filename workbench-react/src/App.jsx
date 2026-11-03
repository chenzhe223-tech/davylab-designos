import { useState } from "react";
import { ArrowUpRight, Check, Layers3, Palette, Smartphone, Sparkles } from "lucide-react";

const samples = [
  { name: "Button", kind: "Action", description: "Primary, secondary and quiet actions" },
  { name: "Card", kind: "Container", description: "Structured content with paper-like edges" },
  { name: "Input", kind: "Form", description: "Accessible fields and focus states" },
  { name: "Dialog", kind: "Feedback", description: "Modal flows and confirmation patterns" }
];

export default function App() {
  const [density, setDensity] = useState("comfortable");
  const [tone, setTone] = useState("paper");
  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#202a36]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <a className="flex items-center gap-3 font-semibold tracking-tight" href="/">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#24384d] text-white"><Layers3 size={18}/></span>
          DAVYLAB <span className="font-normal text-slate-500">/ DesignOS</span>
        </a>
        <span className="rounded-full border border-[#d9d5ca] px-3 py-1 text-xs text-slate-600">ISOLATED REACT HOST · PREVIEW</span>
      </header>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-10 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="mb-4 flex items-center gap-2 text-sm font-medium text-[#a05f3e]"><Sparkles size={16}/> COMPONENT LAB / PROVIDER SANDBOX</p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl">A calmer space to shape better interfaces.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">A separate React 19 + Tailwind v4 host for previewing optional component providers without changing the existing static DesignOS application.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a className="inline-flex items-center gap-2 rounded-xl bg-[#24384d] px-5 py-3 text-sm font-medium text-white hover:bg-[#314b66]" href="https://kevintngo.github.io/looseleaf/" target="_blank" rel="noreferrer">Explore Looseleaf <ArrowUpRight size={16}/></a>
            <a className="inline-flex items-center gap-2 rounded-xl border border-[#d9d5ca] bg-white px-5 py-3 text-sm font-medium hover:border-slate-400" href="https://github.com/kevintngo/looseleaf" target="_blank" rel="noreferrer">Upstream source</a>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {samples.map((item) => <article key={item.name} className="rounded-2xl border border-[#ddd8cc] bg-[#fffefa] p-5 shadow-[0_2px_8px_rgba(40,45,50,.04)]">
              <div className="mb-6 flex items-center justify-between"><span className="text-xs uppercase tracking-[.16em] text-[#9a684c]">{item.kind}</span><Check size={16} className="text-emerald-700"/></div>
              <h2 className="text-2xl font-semibold">{item.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>)}
          </div>
        </div>
        <aside className="h-fit rounded-3xl border border-[#ddd8cc] bg-[#fffefa] p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold"><Palette size={17}/> Preview controls</div>
          <label className="mt-7 block text-sm font-medium">Visual pack</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["paper","core"].map((value) => <button key={value} onClick={() => setTone(value)} className={`rounded-xl border px-3 py-2 text-sm capitalize ${tone===value?"border-[#a05f3e] bg-[#f7eee4]":"border-[#ddd8cc]"}`}>{value}</button>)}
          </div>
          <label className="mt-6 block text-sm font-medium">Component density</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {["comfortable","compact"].map((value) => <button key={value} onClick={() => setDensity(value)} className={`rounded-xl border px-3 py-2 text-sm capitalize ${density===value?"border-[#a05f3e] bg-[#f7eee4]":"border-[#ddd8cc]"}`}>{value}</button>)}
          </div>
          <div data-tone={tone} data-density={density} className="mt-7 rounded-2xl border border-[#ddd8cc] bg-[#faf8f2] p-4">
            <div className="flex items-center gap-2 text-xs text-slate-500"><Smartphone size={14}/> Live preview</div>
            <div className="mt-4 rounded-xl border border-[#d8d1c4] bg-white p-4">
              <p className="text-sm font-semibold">A small design decision</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">Scoped preview state. No global theme mutation.</p>
              <button className="mt-4 rounded-lg bg-[#24384d] px-3 py-2 text-xs font-medium text-white">Continue</button>
            </div>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Provider selection is a preview control only. Installing upstream source remains an explicit, reviewed project action.</p>
        </aside>
      </section>
    </main>
  );
}