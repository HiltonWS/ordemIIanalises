"use client";

import Image from "next/image";
import {
  AlertTriangle,
  Archive,
  ArrowRight,
  BookOpenText,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  ContactRound,
  Database,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  Filter,
  Fingerprint,
  GitCompareArrows,
  Hash,
  ImageIcon,
  Layers3,
  Link2,
  Map,
  Menu,
  Music2,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import archiveJson from "./data/archive-index.json";

type ViewId = "overview" | "search" | "relations" | "compare" | "sheets" | "sources";

type ArchiveRecord = {
  id: string;
  version?: string;
  kind: string;
  title: string;
  page?: number;
  pages?: number[];
  act?: string;
  acts?: string[];
  section?: string;
  provenance?: string;
  tags: string[];
  excerpt?: string;
  text?: string;
  source?: string;
  person?: string | null;
  contentHash?: string;
  metadata?: Record<string, string | number>;
};

type Mechanic = {
  id: string;
  title: string;
  pages: number[];
  summary: string;
  tags: string[];
  links: string[];
};

type PointOfInterest = {
  id: string;
  title: string;
  acts?: string[];
  pages?: number[];
  role?: string;
  tools?: string[];
  links: string[];
  tags: string[];
  pitch?: string;
  baseClue?: string;
  skillLayer?: string;
  toolLayer?: string;
  deduction?: string;
  risk?: string;
};

type SheetConcept = {
  id: string;
  name: string;
  profile: string;
  occupation: string;
  level: number;
  accent: string;
  concept: string;
  focus: string[];
  signature: string;
  sheetIdea: string;
  tags: string[];
};

type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  relation: string;
  evidence: string;
  availability: string;
  downloaded: boolean;
  files?: string[];
  tags: string[];
};

type Finding = {
  id: string;
  severity: string;
  title: string;
  pages: number[];
  note: string;
  tags: string[];
};

type ArchiveData = {
  generatedAt: string;
  stats: {
    records: number;
    pages: number;
    assets: number;
    uniqueTags: number;
    types: Record<string, number>;
    topTags: [string, number][];
  };
  versions: Array<{
    id: string;
    label: string;
    date: string;
    status: string;
    pages: number;
    assets: number;
    fingerprint: string;
  }>;
  records: ArchiveRecord[];
  mechanics: Mechanic[];
  pointsOfInterest: PointOfInterest[];
  originalPoints: PointOfInterest[];
  sheetConcepts: SheetConcept[];
  sources: Source[];
  findings: Finding[];
  taxonomy: Array<{ group: string; values: string[] }>;
  comparisonConfig: {
    identity: string[];
    compare: string[];
    states: string[];
    notes: string;
  };
};

type SearchItem = ArchiveRecord & { searchText: string };
type StagedFile = { name: string; bytes: number; fingerprint: string };

const data = archiveJson as unknown as ArchiveData;

const navItems: Array<{ id: ViewId; label: string; note: string; icon: typeof Search }> = [
  { id: "overview", label: "Visão geral", note: "estado do arquivo", icon: Layers3 },
  { id: "search", label: "Busca", note: `${data.stats.records} registros`, icon: Search },
  { id: "relations", label: "Relações", note: "mecânicas e pistas", icon: Network },
  { id: "compare", label: "Versões", note: "diff preparado", icon: GitCompareArrows },
  { id: "sheets", label: "Fichas", note: `${data.sheetConcepts.length} protótipos`, icon: ContactRound },
  { id: "sources", label: "Fontes", note: `${data.sources.length} referências`, icon: BookOpenText },
];

const kindIcon: Record<string, typeof FileText> = {
  Página: FileText,
  Ficha: ContactRound,
  Histórico: BookOpenText,
  Handout: ImageIcon,
  Mapa: Map,
  Token: CircleDot,
  Áudio: Music2,
  Mecânica: Network,
  "Ponto oficial": Map,
  "Ponto original": Sparkles,
  "Ficha-conceito": ContactRound,
  "Fonte externa": ExternalLink,
  Achado: AlertTriangle,
};

const sheetImages: Record<string, { src: string; alt: string }> = {
  "sheet-lia": { src: "/characters/lia-nascimento.png", alt: "Retrato original de Lia Nascimento" },
  "sheet-mauro": { src: "/characters/mauro-vidal.png", alt: "Retrato original de Mauro Vidal" },
  "sheet-noemi": { src: "/characters/noemi-prado.png", alt: "Retrato original de Noemi Prado" },
};

function fold(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; value >= 1024 && index < units.length; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} ${unit}`;
}

function pageLabel(item: ArchiveRecord) {
  if (item.page) return `p. ${item.page}`;
  if (item.pages?.length) return `p. ${item.pages.join(", ")}`;
  return item.act ?? item.section ?? "índice";
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function provenanceTone(value?: string) {
  if (value === "oficial" || value === "extra oficial") return "official";
  if (value === "homebrew original") return "original";
  if (value === "fonte externa") return "external";
  return "curated";
}

function Tag({ children, tone = "plain" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`tag tag-${tone}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <p>{copy}</p>
    </header>
  );
}

function StatCard({ label, value, note, accent }: { label: string; value: string | number; note: string; accent: string }) {
  return (
    <article className="stat-card" style={{ "--stat-accent": accent } as React.CSSProperties}>
      <div className="stat-rule" />
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

function Overview({ onNavigate }: { onNavigate: (view: ViewId, query?: string) => void }) {
  const version = data.versions[0];
  return (
    <div className="view-stack">
      <SectionHeading
        eyebrow="arquivo privado / baseline"
        title="Um playtest transformado em sistema de consulta."
        copy={`A versão ${version.label} foi dividida em unidades rastreáveis: páginas, extras, mecânicas, pontos de interesse, achados editoriais e fontes.`}
      />

      <section className="stats-grid" aria-label="Resumo da indexação">
        <StatCard label="Registros" value={data.stats.records} note="cada item tem id e hash" accent="#f4b942" />
        <StatCard label="Páginas" value={data.stats.pages} note="texto integral pesquisável" accent="#73d7d0" />
        <StatCard label="Extras" value={data.stats.assets} note="metadados verificados" accent="#ef725f" />
        <StatCard label="Tags" value={data.stats.uniqueTags} note="taxonomia controlada" accent="#a797e8" />
      </section>

      <section className="overview-grid">
        <article className="panel version-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">versão ativa</p>
              <h2>{version.label}</h2>
            </div>
            <Tag tone="success"><CheckCircle2 size={13} /> indexada</Tag>
          </div>
          <div className="version-track">
            <div className="version-node active"><Check size={15} /></div>
            <div className="version-line" />
            <div className="version-node"><Clock3 size={15} /></div>
          </div>
          <div className="version-labels">
            <div><strong>{version.label}</strong><span>{version.pages} páginas · {version.assets} extras</span></div>
            <div><strong>Próxima versão</strong><span>estrutura pronta para importar</span></div>
          </div>
          <button className="text-button" onClick={() => onNavigate("compare")}>
            Abrir comparador <ArrowRight size={15} />
          </button>
        </article>

        <article className="panel system-map">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">leitura conectada</p>
              <h2>Do personagem à conclusão</h2>
            </div>
            <Network size={20} />
          </div>
          <div className="flow-row">
            <button onClick={() => onNavigate("sheets")}><small>01</small><strong>Perfis</strong><span>assimetria</span></button>
            <ChevronRight size={16} />
            <button onClick={() => onNavigate("relations", "investigar")}><small>02</small><strong>Ações</strong><span>investigar</span></button>
            <ChevronRight size={16} />
            <button onClick={() => onNavigate("relations")}><small>03</small><strong>Pontos</strong><span>camadas</span></button>
            <ChevronRight size={16} />
            <button onClick={() => onNavigate("relations", "compendium")}><small>04</small><strong>Fechamento</strong><span>dedução</span></button>
          </div>
          <p className="map-note">A conexão mais forte do playtest: ferramentas não são bônus soltos; elas reabrem pontos já vistos e mudam a qualidade da evidência.</p>
        </article>
      </section>

      <section className="two-column">
        <article className="panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">controle editorial</p>
              <h2>Pontos para acompanhar</h2>
            </div>
            <Tag tone="warning">{data.findings.length} notas</Tag>
          </div>
          <div className="finding-list">
            {data.findings.map((finding) => (
              <button key={finding.id} onClick={() => onNavigate("search", finding.title)}>
                <span className={`finding-dot ${finding.severity}`} />
                <span><strong>{finding.title}</strong><small>{finding.note}</small></span>
                <span className="page-pill">{finding.pages.length ? `p. ${finding.pages.join(", ")}` : "extra"}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="panel taxonomy-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">vocabulário controlado</p>
              <h2>Taxonomia</h2>
            </div>
            <Tags size={20} />
          </div>
          {data.taxonomy.map((group) => (
            <div className="taxonomy-row" key={group.group}>
              <strong>{group.group}</strong>
              <div>{group.values.map((value) => <Tag key={value}>{value}</Tag>)}</div>
            </div>
          ))}
        </article>
      </section>

      <section className="panel hot-tags">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">atalhos de busca</p>
            <h2>Tags mais conectadas</h2>
          </div>
          <button className="text-button" onClick={() => onNavigate("search")}>Ver índice completo <ArrowRight size={15} /></button>
        </div>
        <div className="tag-cloud">
          {data.stats.topTags.slice(3).map(([tag, count], index) => (
            <button key={tag} onClick={() => onNavigate("search", tag)} style={{ "--tag-weight": 1 + Math.max(0, 5 - index) * 0.06 } as React.CSSProperties}>
              {tag}<span>{count}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function RecordDetail({ item, onClose }: { item: SearchItem | null; onClose?: () => void }) {
  if (!item) {
    return (
      <aside className="detail-panel empty-detail">
        <Fingerprint size={26} />
        <h3>Selecione um registro</h3>
        <p>Os metadados, vínculos, tags e o trecho de origem aparecerão aqui.</p>
      </aside>
    );
  }
  const Icon = kindIcon[item.kind] ?? FileText;
  return (
    <aside className="detail-panel">
      <div className="detail-topline">
        <span className="kind-mark"><Icon size={15} /> {item.kind}</span>
        {onClose && <button className="icon-button detail-close" aria-label="Fechar detalhes" onClick={onClose}><X size={17} /></button>}
      </div>
      <h2>{item.title}</h2>
      <div className="detail-meta">
        <Tag tone={provenanceTone(item.provenance)}>{item.provenance ?? "relação curada"}</Tag>
        <Tag>{pageLabel(item)}</Tag>
        {item.version && <Tag>{item.version}</Tag>}
      </div>
      <div className="detail-copy">
        <p>{item.excerpt || "Registro curado sem trecho textual."}</p>
      </div>
      {item.metadata && (
        <dl className="metadata-grid">
          {Object.entries(item.metadata).map(([key, value]) => (
            <div key={key}><dt>{key}</dt><dd>{key === "bytes" ? formatBytes(Number(value)) : String(value)}</dd></div>
          ))}
        </dl>
      )}
      {item.source && (
        <div className="source-box">
          <small>origem privada</small>
          <span>{item.source}</span>
        </div>
      )}
      <div className="detail-tags">
        <small>tags</small>
        <div>{item.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
      </div>
      {item.contentHash && (
        <div className="hash-row" title={item.contentHash}><Hash size={14} /><code>{item.contentHash.slice(0, 20)}…</code></div>
      )}
      {item.text && item.text.length > 500 && (
        <details className="raw-text">
          <summary>Ver texto extraído da página</summary>
          <p>{item.text}</p>
        </details>
      )}
    </aside>
  );
}

function SearchView({ query, setQuery }: { query: string; setQuery: (value: string) => void }) {
  const [kind, setKind] = useState("todos");
  const [scope, setScope] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const searchable = useMemo<SearchItem[]>(() => {
    const records = data.records.map((record) => ({
      ...record,
      searchText: fold([record.title, record.text, record.excerpt, record.source, record.person, record.tags.join(" ")].filter(Boolean).join(" ")),
    }));
    const curated: ArchiveRecord[] = [
      ...data.mechanics.map((item) => ({ ...item, kind: "Mecânica", provenance: "relação curada", excerpt: item.summary })),
      ...data.pointsOfInterest.map((item) => ({ ...item, kind: "Ponto oficial", provenance: "relação curada", excerpt: item.role })),
      ...data.originalPoints.map((item) => ({ ...item, kind: "Ponto original", provenance: "homebrew original", excerpt: `${item.pitch} ${item.deduction}` })),
      ...data.sheetConcepts.map((item) => ({ ...item, title: item.name, kind: "Ficha-conceito", provenance: "homebrew original", excerpt: `${item.concept} ${item.sheetIdea}` })),
      ...data.sources.map((item) => ({ ...item, kind: "Fonte externa", provenance: "fonte externa", excerpt: `${item.relation} ${item.availability}` })),
      ...data.findings.map((item) => ({ ...item, kind: "Achado", provenance: "inferência", excerpt: item.note })),
    ];
    return records.concat(curated.map((record) => ({
      ...record,
      searchText: fold([record.title, record.excerpt, record.tags.join(" ")].filter(Boolean).join(" ")),
    })) as SearchItem[]);
  }, []);

  const kinds = useMemo(() => unique(searchable.map((item) => item.kind)).sort(), [searchable]);
  const tokens = fold(query).split(/\s+/).filter(Boolean);
  const results = useMemo(() => searchable.filter((item) => {
    const queryMatch = tokens.every((token) => item.searchText.includes(token));
    const kindMatch = kind === "todos" || item.kind === kind;
    const scopeMatch = scope === "todos" || fold([item.act, ...(item.acts ?? []), ...item.tags].filter(Boolean).join(" ")).includes(fold(scope));
    return queryMatch && kindMatch && scopeMatch;
  }).slice(0, 250), [searchable, tokens, kind, scope]);

  const effectiveSelectedId = results.some((item) => item.id === selectedId) ? selectedId : (results[0]?.id ?? null);
  const selected = searchable.find((item) => item.id === effectiveSelectedId) ?? null;

  return (
    <div className="view-stack search-view">
      <SectionHeading
        eyebrow="índice unificado"
        title="Busque uma palavra. Siga as conexões."
        copy="A busca atravessa texto de página, nomes de arquivo, metadados, mecânicas curadas, fontes, fichas e conteúdo original. Acentos são opcionais."
      />
      <div className="search-toolbar">
        <label className="search-field large">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: determinação, ferramenta, pista, ritual…" autoFocus />
          {query && <button aria-label="Limpar busca" onClick={() => setQuery("")}><X size={16} /></button>}
        </label>
        <div className="filter-row">
          <label><Filter size={14} /> Tipo
            <select value={kind} onChange={(event) => setKind(event.target.value)}>
              <option value="todos">Todos</option>
              {kinds.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>Escopo
            <select value={scope} onChange={(event) => setScope(event.target.value)}>
              <option value="todos">Todos</option>
              <option value="sistema">Sistema</option>
              <option value="ato i">Ato I</option>
              <option value="ato ii">Ato II</option>
              <option value="homebrew original">Original</option>
            </select>
          </label>
          <span className="result-count"><strong>{results.length}</strong> resultados{results.length === 250 ? "+" : ""}</span>
        </div>
      </div>

      <div className="search-layout">
        <section className="result-list" aria-label="Resultados da busca">
          {results.length ? results.map((item) => {
            const Icon = kindIcon[item.kind] ?? FileText;
            return (
              <button key={item.id} className={effectiveSelectedId === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}>
                <span className="result-icon"><Icon size={17} /></span>
                <span className="result-body">
                  <span className="result-heading"><strong>{item.title}</strong><small>{pageLabel(item)}</small></span>
                  <span className="result-excerpt">{item.excerpt || item.source || "Registro indexado"}</span>
                  <span className="result-tags">{item.tags.slice(0, 4).map((tag) => <Tag key={tag}>{tag}</Tag>)}</span>
                </span>
                <ChevronRight className="result-arrow" size={16} />
              </button>
            );
          }) : (
            <div className="empty-results"><Search size={28} /><h3>Nenhum registro encontrado</h3><p>Tente retirar um filtro ou buscar por um termo mais amplo.</p></div>
          )}
        </section>
        <RecordDetail item={selected} />
      </div>
    </div>
  );
}

function MechanicsPanel() {
  const [selected, setSelected] = useState(data.mechanics[0].id);
  const mechanic = data.mechanics.find((item) => item.id === selected) ?? data.mechanics[0];
  const linked = mechanic.links
    .map((id) => data.mechanics.find((item) => item.id === id) ?? data.pointsOfInterest.find((item) => item.id === id))
    .filter(Boolean) as Array<Mechanic | PointOfInterest>;
  const backlinks = data.pointsOfInterest.filter((item) => item.links.includes(mechanic.id));
  return (
    <div className="relation-layout">
      <div className="relation-index">
        {data.mechanics.map((item, index) => (
          <button key={item.id} className={item.id === selected ? "active" : ""} onClick={() => setSelected(item.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>p. {item.pages.join(", ")}</small>
          </button>
        ))}
      </div>
      <article className="relation-detail panel">
        <p className="eyebrow">mecânica / {String(data.mechanics.indexOf(mechanic) + 1).padStart(2, "0")}</p>
        <h2>{mechanic.title}</h2>
        <p className="relation-summary">{mechanic.summary}</p>
        <div className="detail-tags">{mechanic.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
        <hr />
        <h3><Link2 size={16} /> Ligações diretas</h3>
        <div className="link-cards">
          {linked.map((item) => (
            <button key={item.id} onClick={() => "summary" in item && setSelected(item.id)}>
              <Network size={15} /><span><strong>{item.title}</strong><small>{"summary" in item ? item.summary : item.role}</small></span>
            </button>
          ))}
        </div>
        {backlinks.length > 0 && (
          <>
            <h3><Map size={16} /> Usada nestes pontos</h3>
            <div className="backlink-row">{backlinks.map((item) => <Tag key={item.id} tone="official">{item.title}</Tag>)}</div>
          </>
        )}
      </article>
    </div>
  );
}

function OfficialPoints() {
  const [selectedId, setSelectedId] = useState(data.pointsOfInterest[0].id);
  const point = data.pointsOfInterest.find((item) => item.id === selectedId) ?? data.pointsOfInterest[0];
  return (
    <div className="poi-layout">
      <div className="poi-map">
        {data.pointsOfInterest.map((item) => (
          <button key={item.id} className={item.id === selectedId ? "active" : ""} onClick={() => setSelectedId(item.id)}>
            <Map size={15} /><span><strong>{item.title}</strong><small>{item.role}</small></span>
          </button>
        ))}
      </div>
      <article className="panel poi-detail">
        <div className="panel-title-row"><Tag tone="official">relação curada</Tag><span className="page-pill">p. {point.pages?.join(", ")}</span></div>
        <h2>{point.title}</h2>
        <p className="relation-summary">{point.role}</p>
        <dl>
          <div><dt>Atos</dt><dd>{point.acts?.join(" + ")}</dd></div>
          <div><dt>Ferramentas conectadas</dt><dd>{point.tools?.length ? point.tools.join(" · ") : "Sem ferramenta específica"}</dd></div>
          <div><dt>Vínculos</dt><dd>{point.links.map((id) => data.mechanics.find((m) => m.id === id)?.title ?? data.pointsOfInterest.find((p) => p.id === id)?.title ?? id).join(" · ")}</dd></div>
        </dl>
        <div className="detail-tags">{point.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
      </article>
    </div>
  );
}

function OriginalPoints() {
  const [selectedId, setSelectedId] = useState(data.originalPoints[0].id);
  const point = data.originalPoints.find((item) => item.id === selectedId) ?? data.originalPoints[0];
  return (
    <div className="original-layout">
      <div className="original-list">
        {data.originalPoints.map((item, index) => (
          <button key={item.id} className={item.id === selectedId ? "active" : ""} onClick={() => setSelectedId(item.id)}>
            <span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><small>{item.pitch}</small></div>
          </button>
        ))}
      </div>
      <article className="panel original-detail">
        <div className="panel-title-row"><Tag tone="original"><Sparkles size={13} /> homebrew original</Tag><span>pronto para playtest</span></div>
        <h2>{point.title}</h2>
        <p className="relation-summary">{point.pitch}</p>
        <div className="clue-stack">
          <div><span>01</span><section><small>observação inicial</small><p>{point.baseClue}</p></section></div>
          <div><span>02</span><section><small>camada de perícia</small><p>{point.skillLayer}</p></section></div>
          <div><span>03</span><section><small>camada de ferramenta</small><p>{point.toolLayer}</p></section></div>
          <div><span>04</span><section><small>dedução</small><p>{point.deduction}</p></section></div>
          <div className="risk"><span>!</span><section><small>risco / custo</small><p>{point.risk}</p></section></div>
        </div>
        <div className="detail-tags">{point.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div>
      </article>
    </div>
  );
}

function RelationsView() {
  const [tab, setTab] = useState<"mechanics" | "official" | "original">("mechanics");
  return (
    <div className="view-stack">
      <SectionHeading
        eyebrow="grafo editorial"
        title="O que liga regra, pista e conclusão."
        copy="As relações são curadas e têm proveniência explícita. Assim, uma inferência nunca se confunde com texto oficial ou com conteúdo original."
      />
      <div className="segmented relation-tabs">
        <button className={tab === "mechanics" ? "active" : ""} onClick={() => setTab("mechanics")}><Network size={15} /> {data.mechanics.length} mecânicas</button>
        <button className={tab === "official" ? "active" : ""} onClick={() => setTab("official")}><Map size={15} /> {data.pointsOfInterest.length} pontos oficiais</button>
        <button className={tab === "original" ? "active" : ""} onClick={() => setTab("original")}><Sparkles size={15} /> {data.originalPoints.length} pontos novos</button>
      </div>
      {tab === "mechanics" && <MechanicsPanel />}
      {tab === "official" && <OfficialPoints />}
      {tab === "original" && <OriginalPoints />}
    </div>
  );
}

function CompareView() {
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [working, setWorking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const version = data.versions[0];

  async function stageFiles(files: FileList | null) {
    if (!files?.length) return;
    setWorking(true);
    const result: StagedFile[] = [];
    for (const file of Array.from(files)) {
      const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      const fingerprint = Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
      result.push({ name: file.name, bytes: file.size, fingerprint });
    }
    setStaged(result);
    setWorking(false);
  }

  return (
    <div className="view-stack">
      <SectionHeading
        eyebrow="comparador versionado"
        title="A próxima mudança já tem onde pousar."
        copy="Hoje existe uma baseline imutável. Quando outro playtest chegar, o pipeline separa mudanças editoriais, mecânicas e de acervo sem sobrescrever a versão anterior."
      />
      <section className="compare-hero">
        <article className="version-card current">
          <div><small>BASE A</small><Tag tone="success">indexada</Tag></div>
          <h2>{version.label}</h2>
          <p>{version.date}</p>
          <dl><div><dt>Páginas</dt><dd>{version.pages}</dd></div><div><dt>Extras</dt><dd>{version.assets}</dd></div><div><dt>Hash</dt><dd>{version.fingerprint.slice(0, 10)}…</dd></div></dl>
        </article>
        <div className="compare-arrow"><GitCompareArrows size={24} /><span>comparar</span></div>
        <article className="version-card pending">
          <div><small>BASE B</small><Tag tone="warning">aguardando</Tag></div>
          <h2>Próxima versão</h2>
          <p>Não inventada · nenhum falso diff</p>
          <button onClick={() => inputRef.current?.click()}><UploadCloud size={16} /> Selecionar lote local</button>
          <input ref={inputRef} type="file" multiple hidden onChange={(event) => stageFiles(event.target.files)} accept=".pdf,.zip,.png,.jpg,.jpeg,.mp3" />
        </article>
      </section>

      {(working || staged.length > 0) && (
        <section className="panel staged-panel">
          <div className="panel-title-row"><div><p className="eyebrow">pré-validação local</p><h2>{working ? "Calculando hashes…" : `${staged.length} arquivo(s) preparado(s)`}</h2></div><ShieldCheck size={21} /></div>
          <p>Os arquivos são lidos no seu navegador para calcular a impressão digital; esta etapa não publica nem altera o arquivo atual.</p>
          <div className="staged-files">
            {staged.map((file) => <div key={`${file.name}-${file.fingerprint}`}><FileArchive size={16} /><span><strong>{file.name}</strong><small>{formatBytes(file.bytes)} · {file.fingerprint.slice(0, 16)}…</small></span><CheckCircle2 size={16} /></div>)}
          </div>
        </section>
      )}

      <section className="two-column compare-details">
        <article className="panel">
          <div className="panel-title-row"><div><p className="eyebrow">estados de mudança</p><h2>O diff distingue</h2></div><GitCompareArrows size={20} /></div>
          <div className="diff-states">
            {data.comparisonConfig.states.map((state, index) => <div key={state}><span className={`diff-swatch swatch-${index}`} /><strong>{state}</strong><small>{index === 0 ? "novo registro" : index === 1 ? "saiu da versão" : index === 2 ? "texto ou metadado" : index === 3 ? "mesmo conteúdo, nova página" : index === 4 ? "título mudou" : "sem diferença"}</small></div>)}
          </div>
        </article>
        <article className="panel">
          <div className="panel-title-row"><div><p className="eyebrow">chave de comparação</p><h2>Como encontra o mesmo item</h2></div><Fingerprint size={20} /></div>
          <p className="panel-copy">{data.comparisonConfig.notes}</p>
          <div className="compare-fields">
            <div><small>identidade</small>{data.comparisonConfig.identity.map((field) => <code key={field}>{field}</code>)}</div>
            <div><small>conteúdo</small>{data.comparisonConfig.compare.map((field) => <code key={field}>{field}</code>)}</div>
          </div>
        </article>
      </section>

      <section className="panel pipeline-panel">
        <div className="panel-title-row"><div><p className="eyebrow">fluxo contínuo</p><h2>Importar sem perder história</h2></div><Database size={21} /></div>
        <ol>
          <li><span>1</span><div><strong>Congelar os arquivos</strong><p>Guarda versão, nome original e SHA-256.</p></div></li>
          <li><span>2</span><div><strong>Extrair e classificar</strong><p>Separa páginas, anexos, campos, dimensões e duração.</p></div></li>
          <li><span>3</span><div><strong>Sugerir correspondências</strong><p>Compara id, título normalizado, ato e contexto.</p></div></li>
          <li><span>4</span><div><strong>Revisar relações</strong><p>Inferências e possíveis erratas nunca viram fato automático.</p></div></li>
          <li><span>5</span><div><strong>Publicar a versão privada</strong><p>A interface passa a oferecer A ↔ B sem apagar a baseline.</p></div></li>
        </ol>
      </section>
    </div>
  );
}

function SheetsView() {
  const [selectedId, setSelectedId] = useState(data.sheetConcepts[0].id);
  const sheet = data.sheetConcepts.find((item) => item.id === selectedId) ?? data.sheetConcepts[0];
  const image = sheetImages[sheet.id];

  function downloadPrototype() {
    const content = JSON.stringify({
      schema: "op2-private-sheet-prototype/v1",
      provenance: "homebrew original — validar no playtest",
      character: sheet,
      tracks: { pv: null, pd: null },
      attributes: {},
      skills: sheet.focus.reduce<Record<string, string>>((acc, skill) => ({ ...acc, [skill]: "definir dado" }), {}),
      evidence: [],
      notes: [],
    }, null, 2);
    const href = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${fold(sheet.name).replace(/\s+/g, "-")}-ficha-prototipo.json`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="view-stack">
      <SectionHeading
        eyebrow="laboratório de fichas"
        title="Três perfis, três hierarquias de informação."
        copy="Os exemplos usam a lógica estrutural observada no playtest, mas o desenho, os personagens, os textos e as artes são originais. Valores finais devem ser validados em mesa."
      />
      <div className="sheet-selector">
        {data.sheetConcepts.map((item) => (
          <button key={item.id} className={item.id === selectedId ? "active" : ""} onClick={() => setSelectedId(item.id)} style={{ "--sheet-accent": item.accent } as React.CSSProperties}>
            <span>{item.profile.slice(0, 1)}</span><div><strong>{item.name}</strong><small>{item.profile} · {item.occupation}</small></div>
          </button>
        ))}
      </div>

      <section className="sheet-workbench" style={{ "--sheet-accent": sheet.accent } as React.CSSProperties}>
        <article className="character-art">
          <Image src={image.src} alt={image.alt} fill sizes="(max-width: 900px) 100vw, 33vw" priority />
          <div className="art-fade" />
          <div className="ai-label"><Sparkles size={13} /> arte original gerada por IA</div>
          <div className="character-caption"><small>NÍVEL {sheet.level} / {sheet.profile.toUpperCase()}</small><h2>{sheet.name}</h2><p>{sheet.occupation}</p></div>
        </article>
        <article className="sheet-prototype">
          <div className="sheet-header"><div><p className="eyebrow">protótipo funcional</p><h2>Ficha de investigação</h2></div><button onClick={downloadPrototype}><Download size={15} /> JSON</button></div>
          <p className="sheet-concept">{sheet.concept}</p>
          <div className="resource-row">
            <div><small>PV</small><strong>—</strong><span>ferimentos</span></div>
            <div><small>PD</small><strong>—</strong><span>determinação</span></div>
            <div><small>NÍVEL</small><strong>{sheet.level}</strong><span>progressão</span></div>
          </div>
          <div className="sheet-columns">
            <section>
              <h3>Foco de perícia</h3>
              {sheet.focus.map((skill, index) => <div className="skill-row" key={skill}><span>{skill}</span><div>{[0, 1, 2, 3, 4].map((step) => <i key={step} className={step <= 2 + (index === 0 ? 1 : 0) ? "filled" : ""} />)}</div><strong>{index === 0 ? "d10" : "d8"}</strong></div>)}
              <h3>Assinatura experimental</h3>
              <div className="ability-card"><Sparkles size={16} /><p>{sheet.signature}</p></div>
            </section>
            <section>
              <h3>Evidências</h3>
              <div className="evidence-board"><button>+ pista</button><i /><button>+ hipótese</button><i /><button>+ conclusão</button></div>
              <h3>Desafio de acesso</h3>
              <div className="access-widget"><span><small>método</small>seguro / arriscado</span><span><small>custo</small>PV · PD · tempo</span><span><small>retorno</small>baixo · exato · alto</span></div>
            </section>
          </div>
          <div className="sheet-note"><ShieldCheck size={15} /><span><strong>Decisão de layout:</strong> {sheet.sheetIdea}</span></div>
        </article>
      </section>

      <section className="panel design-principles">
        <div className="panel-title-row"><div><p className="eyebrow">sistema de ficha</p><h2>O que permanece em todas</h2></div><ContactRound size={21} /></div>
        <div>
          <article><span>01</span><h3>Recursos à vista</h3><p>PV e PD ficam no eixo central porque são custos de acesso, investigação e consequência.</p></article>
          <article><span>02</span><h3>Ações por contexto</h3><p>Perícias não ficam isoladas: cada uma aponta para Examinar, Interagir, Recapitular ou Compartilhar.</p></article>
          <article><span>03</span><h3>Rastro de evidência</h3><p>A ficha registra pista, hipótese e conclusão como estados diferentes — sem decidir pelo jogador.</p></article>
          <article><span>04</span><h3>Proveniência visível</h3><p>Regras oficiais, inferências e conteúdo caseiro recebem selos diferentes em todo o sistema.</p></article>
        </div>
      </section>
    </div>
  );
}

function SourcesView() {
  const [filter, setFilter] = useState<"all" | "downloaded" | "link">("all");
  const sources = data.sources.filter((source) => filter === "all" || (filter === "downloaded" ? source.downloaded : !source.downloaded));
  return (
    <div className="view-stack">
      <SectionHeading
        eyebrow="registro de inspirações"
        title="Fonte, relação e disponibilidade — sem atalhos ilegais."
        copy="A pesquisa privilegia páginas oficiais. PDFs gratuitos foram preservados; livros comerciais, páginas sem PDF e links expirados ficam registrados com o estado correto."
      />
      <section className="source-summary">
        <div><BookOpenText size={20} /><span><strong>{data.sources.length}</strong> fontes verificadas</span></div>
        <div><Download size={20} /><span><strong>{data.sources.filter((source) => source.downloaded).reduce((sum, source) => sum + (source.files?.length ?? 0), 0)}</strong> PDFs oficiais baixados</span></div>
        <div><ShieldCheck size={20} /><span><strong>0</strong> cópias piratas</span></div>
      </section>
      <div className="segmented source-filters">
        <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todas</button>
        <button className={filter === "downloaded" ? "active" : ""} onClick={() => setFilter("downloaded")}>PDFs preservados</button>
        <button className={filter === "link" ? "active" : ""} onClick={() => setFilter("link")}>Somente referência</button>
      </div>
      <section className="source-list">
        {sources.map((source, index) => (
          <article key={source.id}>
            <div className="source-number">{String(index + 1).padStart(2, "0")}</div>
            <div className="source-main">
              <div className="source-heading"><div><h2>{source.title}</h2><p>{source.publisher}</p></div><Tag tone={source.downloaded ? "success" : "plain"}>{source.downloaded ? "PDF oficial salvo" : "referência"}</Tag></div>
              <p className="source-relation">{source.relation}</p>
              <div className="source-evidence"><span><small>vínculo</small>{source.evidence}</span><span><small>disponibilidade</small>{source.availability}</span></div>
              {source.files && <div className="file-chips">{source.files.map((file) => <span key={file}><FileText size={13} /> {file}</span>)}</div>}
              <div className="source-footer"><div>{source.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}</div><a href={source.url} target="_blank" rel="noreferrer">Abrir fonte oficial <ExternalLink size={14} /></a></div>
            </div>
          </article>
        ))}
      </section>
      <section className="license-note">
        <ShieldCheck size={22} />
        <div><h2>Limite de uso preservado</h2><p>Este arquivo permanece privado, não republica os PDFs-fonte nem usa identidade visual oficial. Todo material novo com IA está marcado. Uma publicação pública exigiria nova revisão de nome, trechos, imagens e termos da licença vigente.</p></div>
        <a href="https://ordemparanormal.com.br/licenca" target="_blank" rel="noreferrer">Ler licença <ExternalLink size={14} /></a>
      </section>
    </div>
  );
}

export default function ArchiveWorkbench() {
  const [view, setView] = useState<ViewId>("overview");
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const globalSearchRef = useRef<HTMLInputElement>(null);

  function navigate(next: ViewId, nextQuery?: string) {
    if (nextQuery !== undefined) setQuery(nextQuery);
    setView(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        globalSearchRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === globalSearchRef.current) {
        setQuery("");
        globalSearchRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submitGlobalSearch(event: React.FormEvent) {
    event.preventDefault();
    navigate("search");
  }

  return (
    <div className={`archive-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu"><Menu size={20} /></button>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Fechar menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Archive size={19} /></div>
          <div><strong>ARQUIVO // OP2</strong><span>índice de playtest</span></div>
        </div>
        <button className="collapse-button" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}>{sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
        <nav>
          <p>NAVEGAÇÃO</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)} title={sidebarCollapsed ? item.label : undefined}><Icon size={18} /><span><strong>{item.label}</strong><small>{item.note}</small></span>{view === item.id && <i />}</button>;
          })}
        </nav>
        <div className="sidebar-status">
          <div><span className="pulse" /><strong>{data.versions[0].label}</strong></div>
          <p>Baseline íntegra</p>
          <code>{data.versions[0].fingerprint.slice(0, 12)}</code>
        </div>
        <div className="private-label"><ShieldCheck size={14} /><span>uso privado</span></div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="breadcrumb"><span>ARQUIVO</span><ChevronRight size={13} /><strong>{navItems.find((item) => item.id === view)?.label}</strong></div>
          <form onSubmit={submitGlobalSearch} className="global-search">
            <Search size={16} /><input ref={globalSearchRef} value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => view !== "search" && setView("search")} placeholder="Buscar no arquivo…" /><kbd>/</kbd>
          </form>
          <div className="top-status"><span className="status-dot" /><span>{data.stats.records} itens</span></div>
        </header>
        <div className="view-wrap">
          {view === "overview" && <Overview onNavigate={navigate} />}
          {view === "search" && <SearchView query={query} setQuery={setQuery} />}
          {view === "relations" && <RelationsView />}
          {view === "compare" && <CompareView />}
          {view === "sheets" && <SheetsView />}
          {view === "sources" && <SourcesView />}
        </div>
        <footer><span>Arquivo privado independente · sem afiliação ou endosso oficial</span><span>Índice gerado em {new Date(data.generatedAt).toLocaleDateString("pt-BR")}</span></footer>
      </main>
    </div>
  );
}
