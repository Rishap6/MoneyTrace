import React from 'react';
import { Link } from 'react-router-dom';

const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`} aria-hidden="true">{name}</span>
);

const capabilities = [
  { icon: 'radar', title: 'Detect risk earlier', body: 'Surface suspicious behavior with explainable signals for velocity, device changes, impossible travel, and more.', color: 'text-rose-600 bg-rose-50' },
  { icon: 'account_tree', title: 'Follow every transfer', body: 'Trace funds across connected accounts and expose the mule networks and circular flows hidden in the ledger.', color: 'text-blue-700 bg-blue-50' },
  { icon: 'lock_clock', title: 'Move toward recovery', body: 'Prioritize live holding accounts with recovery intelligence, clear evidence, and actionable case context.', color: 'text-emerald-700 bg-emerald-50' },
];

const nodes = [
  { x: 75, y: 150, r: 9, label: 'SOURCE', type: 'muted' },
  { x: 205, y: 90, r: 7, label: 'ACC · 1042', type: 'normal' },
  { x: 220, y: 215, r: 8, label: 'ACC · 2081', type: 'risk' },
  { x: 365, y: 145, r: 11, label: 'MULE HUB', type: 'risk' },
  { x: 500, y: 75, r: 7, label: 'ACC · 4410', type: 'normal' },
  { x: 510, y: 220, r: 8, label: 'ACC · 9053', type: 'risk' },
  { x: 650, y: 145, r: 9, label: 'HOLDING', type: 'target' },
];

export const LandingPage: React.FC = () => (
  <main className="min-h-screen bg-[#f7f9fc] text-slate-900 selection:bg-blue-100">
    <header className="relative z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3" aria-label="MoneyTrace home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Icon name="account_balance" className="text-[22px]" /></span>
          <span><span className="block text-[17px] font-bold leading-tight tracking-tight">MoneyTrace</span><span className="block text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">Financial crime intelligence</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] font-medium text-slate-600 md:flex">
          <a href="#platform" className="transition hover:text-blue-700">Platform</a>
          <a href="#workflow" className="transition hover:text-blue-700">How it works</a>
          <a href="#capabilities" className="transition hover:text-blue-700">Capabilities</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/customer/login" className="hidden text-[13px] font-semibold text-slate-600 transition hover:text-blue-700 sm:inline-flex">Customer portal</Link>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">Investigator sign in <Icon name="arrow_forward" className="text-[17px]" /></Link>
        </div>
      </div>
    </header>

    <section className="relative overflow-hidden border-b border-slate-200 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_35%,rgba(59,130,246,.09),transparent_38%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.88fr_1.12fr] lg:gap-10 lg:py-24">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-blue-800"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> One connected financial crime workflow</div>
          <h1 className="text-[42px] font-semibold leading-[1.08] tracking-[-.045em] text-slate-950 sm:text-[54px] lg:text-[60px]">See where the money goes<span className="text-blue-600">.</span></h1>
          <p className="mt-6 max-w-lg text-[16px] leading-7 text-slate-600">Bring transaction monitoring, network analysis, and recovery intelligence together—so investigators can move from a suspicious signal to a clearer picture, faster.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Explore investigator workspace <Icon name="arrow_forward" className="text-[18px]" /></Link>
            <a href="#platform" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-[14px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"><Icon name="play_circle" className="text-[19px] text-slate-500" /> See the platform</a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-slate-500"><span className="flex items-center gap-1.5"><Icon name="verified_user" className="text-[16px] text-emerald-600" /> Role-based access</span><span className="h-1 w-1 rounded-full bg-slate-300" /><span>Explainable risk signals</span><span className="h-1 w-1 rounded-full bg-slate-300" /><span>Case-ready reporting</span></div>
        </div>

        <div id="platform" className="relative mx-auto w-full max-w-[660px] scroll-mt-20">
          <div className="absolute -inset-5 rounded-[32px] bg-blue-100/50 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-[#0b1220] shadow-[0_28px_80px_-28px_rgba(15,23,42,.45)]">
            <div className="flex items-center justify-between border-b border-white/[.08] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300"><Icon name="account_tree" className="text-[18px]" /></span><div><div className="text-[12px] font-semibold text-slate-100">Funds flow investigation</div><div className="mt-0.5 text-[10px] text-slate-500">CASE MT-2048 · Updated moments ago</div></div></div>
              <span className="flex items-center gap-1.5 rounded-full border border-rose-400/20 bg-rose-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-rose-300"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> High risk</span>
            </div>
            <div className="relative h-[280px] overflow-hidden sm:h-[320px]">
              <div className="absolute inset-0 opacity-[.12]" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.25) 1px,transparent 1px)', backgroundSize: '36px 36px' }} />
              <svg viewBox="0 0 720 290" className="absolute inset-0 h-full w-full" role="img" aria-label="A transaction network showing money moving from a source account through a high-risk mule hub to a holding account">
                <defs><linearGradient id="flowLine" x1="0" x2="1"><stop offset="0" stopColor="#38bdf8" stopOpacity=".4" /><stop offset=".55" stopColor="#3b82f6" stopOpacity=".9" /><stop offset="1" stopColor="#34d399" stopOpacity=".7" /></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
                {[['75,150','205,90'],['75,150','220,215'],['205,90','365,145'],['220,215','365,145'],['365,145','500,75'],['365,145','510,220'],['500,75','650,145'],['510,220','650,145']].map(([a,b],i)=><line key={i} x1={a.split(',')[0]} y1={a.split(',')[1]} x2={b.split(',')[0]} y2={b.split(',')[1]} stroke={i===2||i===5?'url(#flowLine)':'#334155'} strokeWidth={i===2||i===5?2.3:1.5} strokeDasharray={i===2||i===5?'0':'4 5'} />)}
                <path d="M365 145 C420 145 450 220 510 220 S600 160 650 145" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="5 7" opacity=".65" />
                {nodes.map((n,i)=><g key={i}><circle cx={n.x} cy={n.y} r={n.r+9} fill={n.type==='risk'?'#fb7185':n.type==='target'?'#34d399':'#60a5fa'} opacity=".1"/><circle cx={n.x} cy={n.y} r={n.r} fill={n.type==='risk'?'#fb7185':n.type==='target'?'#34d399':n.type==='muted'?'#64748b':'#60a5fa'} stroke="#0b1220" strokeWidth="3" filter={n.type==='risk'?'url(#glow)':undefined}/><text x={n.x} y={n.y+27} fill={n.type==='risk'?'#fda4af':n.type==='target'?'#6ee7b7':'#94a3b8'} fontSize="9" textAnchor="middle" fontFamily="ui-monospace,monospace" letterSpacing="1">{n.label}</text></g>)}
                <g transform="translate(357 190)"><rect width="95" height="25" rx="6" fill="#1e293b" stroke="#fb7185" strokeOpacity=".35"/><text x="47" y="16" fill="#fda4af" fontSize="9" fontFamily="ui-monospace,monospace" textAnchor="middle">₹ 4.8L · 2 hops</text></g>
                <g transform="translate(572 69)"><rect width="95" height="25" rx="6" fill="#1e293b" stroke="#34d399" strokeOpacity=".35"/><text x="47" y="16" fill="#6ee7b7" fontSize="9" fontFamily="ui-monospace,monospace" textAnchor="middle">HOLDING ACCOUNT</text></g>
              </svg>
              <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg border border-white/[.08] bg-[#111a2a]/90 px-3 py-2 text-[9px] font-medium text-slate-400 backdrop-blur"><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-blue-400"/>Account</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-rose-400"/>Risk signal</span><span className="flex items-center gap-1.5"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>Holding</span></div>
            </div>
            <div className="grid grid-cols-3 border-t border-white/[.08] bg-[#0e1727]">
              {[['TRACE DEPTH','4 hops'],['ACCOUNTS LINKED','07'],['RECOVERY SIGNAL','Strong']].map(([label,value],i)=><div key={label} className={`px-4 py-3.5 sm:px-6 ${i?'border-l border-white/[.08]':''}`}><div className="text-[8px] font-semibold tracking-[.14em] text-slate-500">{label}</div><div className={`mt-1 text-[13px] font-semibold ${i===2?'text-emerald-400':'text-slate-100'}`}>{value}</div></div>)}
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-xl sm:flex"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Icon name="task_alt" className="text-[18px]" /></span><div><div className="text-[10px] font-semibold text-slate-800">Evidence linked to case</div><div className="mt-0.5 text-[9px] text-slate-500">Risk signals are explainable</div></div></div>
        </div>
      </div>
    </section>

    <section id="capabilities" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-16 sm:px-8 lg:py-20">
      <div className="grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:items-end"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-blue-700">An investigation, connected</p><h2 className="mt-3 max-w-md text-[30px] font-semibold leading-tight tracking-[-.035em] text-slate-950 sm:text-[36px]">From the first alert to the next action.</h2></div><p className="max-w-xl text-[14px] leading-6 text-slate-600 lg:justify-self-end">MoneyTrace brings the context investigators need into one workspace. Understand why a transaction was flagged, how funds moved, and where attention can make a difference.</p></div>
      <div className="mt-9 grid gap-4 md:grid-cols-3">{capabilities.map((item,i)=><article key={item.title} className="group rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,.03)] transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/[.05]"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}><Icon name={item.icon} className="text-[23px]" /></div><div className="mt-5 flex items-center gap-2"><span className="font-mono text-[10px] font-semibold text-slate-400">0{i+1}</span><h3 className="text-[15px] font-semibold text-slate-900">{item.title}</h3></div><p className="mt-2 text-[13px] leading-[1.7] text-slate-600">{item.body}</p><a href="#workflow" className="mt-5 inline-flex items-center gap-1 text-[12px] font-semibold text-blue-700 opacity-0 transition group-hover:opacity-100">Explore workflow <Icon name="arrow_forward" className="text-[15px]" /></a></article>)}</div>
    </section>

    <section id="workflow" className="border-y border-slate-200 bg-white scroll-mt-20">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center lg:py-16">
        <div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-blue-700">A clearer path through complexity</p><h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-.035em] text-slate-950 sm:text-[34px]">Every signal has a next step.</h2><p className="mt-4 max-w-md text-[14px] leading-6 text-slate-600">Connect monitoring, investigation, and reporting without losing the details behind the decision.</p><Link to="/login" className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold text-blue-700 hover:text-blue-800">Enter the investigator portal <Icon name="arrow_forward" className="text-[17px]" /></Link></div>
        <div className="grid gap-3 sm:grid-cols-3">{[{n:'01',icon:'notifications_active',title:'Review the signal',body:'See risk factors and transaction context.'},{n:'02',icon:'route',title:'Trace the flow',body:'Follow connected accounts and transfers.'},{n:'03',icon:'description',title:'Build the case',body:'Keep evidence and reporting together.'}].map((step,i)=><div key={step.n} className="relative rounded-xl border border-slate-200 bg-[#fbfcfe] p-5">{i<2&&<div className="absolute right-[-13px] top-9 z-10 hidden h-px w-6 bg-slate-300 sm:block"/>}<span className="font-mono text-[10px] font-semibold text-blue-700">STEP {step.n}</span><div className="mt-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"><Icon name={step.icon} className="text-[19px]" /></div><h3 className="mt-4 text-[13px] font-semibold text-slate-900">{step.title}</h3><p className="mt-1.5 text-[11px] leading-5 text-slate-500">{step.body}</p></div>)}</div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16"><div className="flex flex-col justify-between gap-7 rounded-2xl bg-[#101a2b] px-6 py-8 text-white sm:px-9 md:flex-row md:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-300">Start with the right workspace</p><h2 className="mt-2 text-[23px] font-semibold tracking-tight">Choose how you want to access MoneyTrace.</h2><p className="mt-2 max-w-xl text-[13px] leading-6 text-slate-300">Investigators can review cases and financial flows. Customers can securely access their banking portal.</p></div><div className="flex shrink-0 flex-col gap-2 sm:flex-row"><Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-[12px] font-semibold text-white transition hover:bg-blue-400">Investigator portal <Icon name="arrow_forward" className="text-[16px]" /></Link><Link to="/customer/login" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-[12px] font-semibold text-slate-100 transition hover:bg-white/10">Customer banking <Icon name="arrow_forward" className="text-[16px]" /></Link></div></div></section>
    <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Link to="/" className="flex items-center gap-2 font-semibold text-slate-700"><span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white"><Icon name="account_balance" className="text-[14px]" /></span>MoneyTrace</Link><span>Financial crime intelligence for clearer investigations.</span><div className="flex gap-4"><Link to="/login" className="transition hover:text-blue-700">Investigator access</Link><Link to="/customer/login" className="transition hover:text-blue-700">Customer access</Link></div></div></footer>
  </main>
);

export default LandingPage;
