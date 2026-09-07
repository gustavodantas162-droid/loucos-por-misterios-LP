'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  Eye,
  FileImage,
  FileSearch,
  FileText,
  Fingerprint,
  FolderLock,
  FolderOpen,
  LockKeyhole,
  NotebookTabs,
  Search,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const BASIC_CHECKOUT = 'https://pay.kiwify.com.br/V4JTClL';
const ADVANCED_CHECKOUT = 'https://pay.kiwify.com.br/0a8xvjd';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const planItems = {
  basic: [
    '1 caso completo',
    'Dificuldade fácil/média',
    'Guia do investigador',
    'Desfecho + versão alternativa',
    'Acesso imediato',
  ],
  advanced: [
    '3 casos completos',
    'Dificuldade média/difícil',
    'Guia dos três casos',
    'Três desfechos protegidos',
    'Três versões alternativas',
    'Acesso imediato',
  ],
};

const previews = [
  { src: '/previews/mansao-capa.webp', label: 'Capa do caso', title: 'Mansão de São Bento', redact: 'redact-cover', alt: 'Envelope classificado do caso da Mansão de São Bento' },
  { src: '/previews/jason-guia.webp', label: 'Guia do investigador', title: 'Quem Matou Jason Turner?', redact: 'redact-guide', alt: 'Página de instruções do caso Quem Matou Jason Turner' },
  { src: '/previews/aurora-suspeitos.webp', label: 'Galeria de suspeitos', title: 'Pensão Aurora', redact: 'redact-suspects', alt: 'Galeria de pessoas de interesse do caso Pensão Aurora' },
  { src: '/previews/aurora-laudo.webp', label: 'Relatório da cena', title: 'Relatório pericial', redact: 'redact-report', alt: 'Relatório pericial do caso Pensão Aurora' },
  { src: '/previews/serial-evidencias.webp', label: 'Evidências visuais', title: 'Caso Serial Killer', redact: 'redact-evidence', alt: 'Painel de evidências do Caso Serial Killer' },
  { src: '/previews/jason-forense.webp', label: 'Laudo forense', title: 'Laboratório forense', redact: 'redact-forensic', alt: 'Relatório do laboratório de ciências forenses do caso Jason Turner' },
];

const benefits = [
  { icon: FolderOpen, label: 'Dossiês completos' },
  { icon: Users, label: 'Pistas e depoimentos' },
  { icon: FileImage, label: 'Documentos e evidências' },
  { icon: NotebookTabs, label: 'Guia de investigação' },
  { icon: FileText, label: 'Formulário de acusação' },
  { icon: LockKeyhole, label: 'Desfechos protegidos' },
  { icon: Fingerprint, label: 'Versões alternativas' },
];

const faqs = [
  ['Precisa imprimir?', 'Não. Todos os arquivos podem ser analisados pelo celular, tablet ou computador. A impressão é opcional e deixa a experiência ainda mais imersiva.'],
  ['Quantas pessoas podem jogar?', 'A experiência foi pensada principalmente para casais, mas também pode ser realizada com amigos.'],
  ['Quanto tempo dura?', 'O tempo depende da dificuldade e do ritmo dos investigadores. Recomendamos reservar pelo menos uma hora para cada caso.'],
  ['Recebo o produto imediatamente?', 'Sim. Após a confirmação do pagamento, o acesso aos arquivos é liberado na área de membros.'],
  ['Os casos possuem solução?', 'Sim. Cada investigação possui um desfecho separado e uma versão alternativa para continuar o debate depois da revelação.'],
];

function track(event: string, properties: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const detail = { event, ...properties };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(detail);
  window.dispatchEvent(new CustomEvent('loucosporMisterio:conversion', { detail }));
}

function scrollToPlans(source: string) {
  if (source === 'final') track('click_final_cta');
  document.getElementById('operacoes')?.scrollIntoView({ behavior: 'smooth' });
}

function PreviewDocument({ item, enlarged = false }: { item: typeof previews[number]; enlarged?: boolean }) {
  return (
    <div className={`actual-preview ${enlarged ? 'actual-preview-enlarged' : ''}`}>
      <img src={item.src} alt={enlarged ? item.alt : ''} width="850" height="1200" loading="lazy" />
      <div className={`blur-zones ${item.redact}`} aria-hidden="true">
        <i /><i /><i /><i />
        <span>Prévia censurada</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<(typeof previews)[number] | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<'advanced' | 'basic' | null>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const name = entry.target.getAttribute('data-view-event');
        if (name && !seen.has(name)) {
          seen.add(name);
          track(name);
        }
      });
    }, { threshold: 0.35 });
    if (pricingRef.current) observer.observe(pricingRef.current);
    if (previewRef.current) observer.observe(previewRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible'));
    }, { threshold: 0.1 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  function handleBasicClick() {
    track('click_basic_plan');
    if (sessionStorage.getItem('lpm_upgrade_seen') === 'true') {
      setPurchaseLoading('basic');
      window.location.href = BASIC_CHECKOUT;
      return;
    }
    sessionStorage.setItem('lpm_upgrade_seen', 'true');
    track('open_upgrade_popup');
    setUpgradeOpen(true);
  }

  function goToCheckout(kind: 'advanced' | 'basic', eventName: string) {
    track(eventName);
    setPurchaseLoading(kind);
    window.location.href = kind === 'advanced' ? ADVANCED_CHECKOUT : BASIC_CHECKOUT;
  }

  return (
    <main>
      <div className="launch-bar">Oferta de lançamento: 3 investigações por apenas R$47</div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Loucos por Mistério — início"><span>Loucos por</span><strong>Mistério</strong></a>
        <span className="brand-line">Casais. Pistas. Grandes histórias.</span>
        <button className="button button-small" onClick={() => scrollToPlans('header')}>Escolher operação <ArrowRight /></button>
      </header>

      <section className="hero" id="top">
        <img className="hero-image" src="/hero-investigacao.webp" alt="Casal analisando documentos e fotografias em uma mesa de investigação" width="1920" height="850" fetchPriority="high" />
        <div className="hero-shade" />
        <div className="container hero-content">
          <p className="eyebrow">Uma experiência criminal para casais</p>
          <h1>Transforme uma noite comum em uma investigação criminal.</h1>
          <p className="hero-copy">Analisem pistas, interroguem suspeitos e descubram juntos quem está mentindo.</p>
          <button className="button button-primary" onClick={() => scrollToPlans('hero')}>Quero investigar <ArrowRight /></button>
          <p className="immediate"><Zap /> Acesso imediato <span /> Jogue no celular ou imprima</p>
        </div>
      </section>

      <section className="paper-section how" aria-labelledby="como-funciona">
        <div className="container reveal">
          <h2 id="como-funciona" className="ink-title">Como funciona</h2>
          <div className="steps">
            <article><span><FolderOpen /></span><div><b>1. Escolha a operação</b><p>Selecionem o caso que mais combina com vocês.</p></div></article>
            <article><span><Search /></span><div><b>2. Abram os arquivos</b><p>Analisem documentos, pistas e depoimentos realistas.</p></div></article>
            <article><span><Users /></span><div><b>3. Apontem o culpado</b><p>Confrontem os depoimentos e defendam juntos a acusação final.</p></div></article>
          </div>
        </div>
      </section>

      <section ref={pricingRef} data-view-event="view_pricing" className="pricing section-dark" id="operacoes" aria-labelledby="operacoes-title">
        <div className="container reveal">
          <p className="eyebrow centered">Do primeiro caso aos arquivos mais complexos</p>
          <h2 id="operacoes-title">Escolha sua operação</h2>
          <div className="plans">
            <article className="plan-card">
              <div className="file-mark"><FileSearch /></div><p className="plan-kicker">Dossiê confidencial</p>
              <h3>Operação Iniciante</h3><p className="case-name">O Assassinato na Mansão de São Bento</p>
              <div className="price"><sup>R$</sup>37</div>
              <ul>{planItems.basic.map((item) => <li key={item}><Check /> {item}</li>)}</ul>
              <button className="button button-outline button-full" type="button" onClick={handleBasicClick}>Começar a investigação <ArrowRight /></button>
            </article>
            <article className="plan-card featured">
              <span className="badge">★ Mais escolhida</span><div className="file-mark"><FolderLock /></div><p className="plan-kicker">Três arquivos confidenciais</p>
              <h3>Operação Avançada</h3><p className="case-name">Pensão Aurora • Jason Turner • Serial Killer</p>
              <div className="price"><sup>R$</sup>47</div>
              <p className="upgrade-line">Leve 3 investigações por apenas R$10 a mais.</p>
              <ul>{planItems.advanced.map((item) => <li key={item}><Check /> {item}</li>)}</ul>
              <a className="button button-primary button-full" href={ADVANCED_CHECKOUT} onClick={() => { track('click_advanced_plan'); setPurchaseLoading('advanced'); }} aria-busy={purchaseLoading === 'advanced'}>{purchaseLoading === 'advanced' ? 'Abrindo arquivos…' : 'Quero os 3 casos'} <ArrowRight /></a>
            </article>
          </div>
          <p className="pricing-note">Os arquivos são liberados imediatamente após a compra. Oferta de lançamento sujeita a atualização com a expansão dos arquivos.</p>
        </div>
      </section>

      <section ref={previewRef} data-view-event="view_product_preview" className="product-preview paper-section" aria-labelledby="preview-title">
        <div className="container reveal">
          <p className="eyebrow ink-eyebrow">Uma amostra sem spoilers</p><h2 id="preview-title" className="ink-title">Veja o que espera por vocês</h2>
          <p className="section-intro ink-copy">Documentos, interrogatórios e evidências que parecem ter saído de uma investigação verdadeira.</p>
          <div className="preview-grid">
            {previews.map((item) => (
              <button key={item.label} className="preview-card" onClick={() => setSelectedPreview(item)} aria-label={`Ampliar: ${item.label}`}>
                <PreviewDocument item={item} /><span className="preview-label"><Eye /> {item.label}</span>
              </button>
            ))}
          </div>
          <button className="button button-ink" onClick={() => scrollToPlans('preview')}>Quero acessar os arquivos <ArrowRight /></button>
        </div>
      </section>

      <section className="receives section-dark" aria-labelledby="receives-title">
        <div className="container reveal"><p className="eyebrow centered">Cada detalhe pode ser a chave</p><h2 id="receives-title">Vocês não recebem um ebook.<br />Recebem uma investigação.</h2>
          <div className="benefit-grid">{benefits.map(({ icon: Icon, label }) => <article key={label}><Icon /><span>{label}</span></article>)}</div>
        </div>
      </section>

      <section className="date-section" aria-labelledby="date-title">
        <img src="/casal-investigando.webp" alt="Casal concentrado analisando os arquivos de um caso durante um encontro em casa" width="1536" height="1024" loading="lazy" />
        <div className="date-overlay" />
        <div className="container date-content reveal"><div><p className="eyebrow">Grandes histórias também se vivem a dois</p><h2 id="date-title">Um date que vocês vão lembrar.</h2><p>Sem aplicativo, sem preparação complicada e sem precisar sair de casa. Abram os arquivos, montem suas teorias e descubram se vocês conseguem chegar juntos à verdade.</p><p className="today-line"><Zap /> Comecem a investigação ainda hoje.</p></div></div>
      </section>

      <section className="security paper-section" aria-label="Segurança da compra">
        <div className="container security-grid reveal">
          <article><Zap /><div><b>Acesso imediato</b><p>Recebam os arquivos na hora após a confirmação.</p></div></article>
          <article><ShieldCheck /><div><b>Pagamento seguro</b><p>Compra protegida e processada pela Kiwify.</p></div></article>
          <article><Award /><div><b>7 dias de garantia</b><p>Conheçam a experiência. Se não fizer sentido, solicitem o reembolso dentro do prazo.</p></div></article>
        </div>
      </section>

      <section className="faq-section paper-section" aria-labelledby="faq-title">
        <div className="container faq-layout reveal"><div className="faq-copy"><p className="eyebrow ink-eyebrow">Antes de abrir o arquivo</p><h2 id="faq-title" className="ink-title left">Perguntas frequentes</h2><p className="ink-copy">Tudo que vocês precisam saber para começar sem complicação.</p></div>
          <Accordion className="faq-list">{faqs.map(([question, answer], index) => <AccordionItem value={`item-${index}`} key={question}><AccordionTrigger className="faq-trigger">{question}</AccordionTrigger><AccordionContent className="faq-answer">{answer}</AccordionContent></AccordionItem>)}</Accordion>
        </div>
      </section>

      <section className="final-cta" aria-labelledby="final-title"><div className="container reveal"><Fingerprint /><h2 id="final-title">A próxima pista está esperando por vocês.</h2><p>Escolham a operação, abram os arquivos e comecem a investigação ainda hoje.</p><button className="button button-primary" onClick={() => scrollToPlans('final')}>Escolher minha operação <ArrowRight /></button></div></section>
      <footer><span>Loucos por Mistério © 2026</span><span>Experiências investigativas para casais</span></footer>

      <div className="mobile-sticky" aria-label="Oferta em destaque"><div><b>3 casos por R$47</b><span>Acesso imediato</span></div><a href={ADVANCED_CHECKOUT} onClick={() => track('click_advanced_plan', { source: 'mobile_sticky' })}>Investigar <ArrowRight /></a></div>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="upgrade-modal" aria-describedby="upgrade-description">
          <DialogHeader><p className="modal-kicker">Arquivo adicional localizado</p><DialogTitle>Espere: vocês podem levar 3 casos por apenas R$10 a mais.</DialogTitle><DialogDescription id="upgrade-description">A Operação Iniciante entrega uma investigação por R$37. Na Operação Avançada, vocês recebem três casos completos por R$47.</DialogDescription></DialogHeader>
          <div className="upgrade-compare"><div><small>Iniciante</small><strong>1</strong><span>investigação</span><b>R$37</b></div><div className="upgrade-best"><small>Avançada</small><strong>3</strong><span>investigações</span><b>R$47</b></div></div>
          <p className="upgrade-highlight">São duas investigações extras acrescentando apenas R$10.</p>
          <button className="button button-primary button-full" onClick={() => goToCheckout('advanced', 'accept_upgrade')} aria-busy={purchaseLoading === 'advanced'}>{purchaseLoading === 'advanced' ? 'Abrindo checkout…' : 'Quero os 3 casos por R$47'} <ArrowRight /></button>
          <button className="modal-secondary" onClick={() => goToCheckout('basic', 'continue_basic')} aria-busy={purchaseLoading === 'basic'}>{purchaseLoading === 'basic' ? 'Abrindo checkout…' : 'Continuar com 1 caso por R$37'}</button>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedPreview !== null} onOpenChange={(open) => !open && setSelectedPreview(null)}>
        <DialogContent className="preview-modal" aria-describedby="preview-modal-description">
          <DialogHeader><DialogTitle>{selectedPreview?.title}</DialogTitle><DialogDescription id="preview-modal-description">Prévia real do produto com informações sensíveis desfocadas. Nenhuma solução foi revelada.</DialogDescription></DialogHeader>
          {selectedPreview && <PreviewDocument item={selectedPreview} enlarged />}
          <DialogClose className="button button-ink">Fechar arquivo</DialogClose>
        </DialogContent>
      </Dialog>
    </main>
  );
}
