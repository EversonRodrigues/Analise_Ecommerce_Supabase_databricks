function SectionHead({ title, action }) {
  const { Icon } = window.VitrineDesignSystem_f1a071;
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
      <h2 style={{ font: 'var(--type-h2)', letterSpacing: 'var(--ls-heading)' }}>{title}</h2>
      {action && <a style={{ display: 'inline-flex', alignItems: 'center', gap: 4, font: '600 15px/1 var(--font-sans)', color: 'var(--text-primary)', textDecoration: 'none', cursor: 'pointer' }}>{action}<Icon name="chevron-right" size={16} /></a>}
    </div>
  );
}
function HomeScreen({ go, add }) {
  const { PromoBanner, CategoryTile, ProductCard, Icon } = window.VitrineDesignSystem_f1a071;
  const { categories, products } = window.VITRINE_DATA;
  const perks = [['truck', 'Frete grátis', 'acima de R$ 99'], ['rotate-ccw', 'Troca fácil', 'em até 30 dias'], ['credit-card', 'Até 10x', 'sem juros'], ['shield-check', 'Compra segura', 'pagamento protegido']];
  return (
    <main style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '32px var(--gutter) 0', display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)' }}>
      <PromoBanner eyebrow="Semana Vitrine" title="Até 40% off em áudio e som" subtitle="Fones, caixas e acessórios selecionados, com frete grátis para todo o Brasil." onCta={() => go('product', products[0])} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: -32 }}>
        {perks.map(([ic, t, s]) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)' }}>
            <span style={{ width: 40, height: 40, borderRadius: 999, background: 'var(--lime-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ic} size={20} /></span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><b style={{ font: '600 15px/1.2 var(--font-sans)' }}>{t}</b><span style={{ font: '400 13px/1.2 var(--font-sans)', color: 'var(--text-muted)' }}>{s}</span></span>
          </div>
        ))}
      </div>
      <section>
        <SectionHead title="Explore por categoria" action="Ver todas" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20 }}>{categories.map((c) => <CategoryTile key={c.id} label={c.label} tone={c.tone} />)}</div>
      </section>
      <section>
        <SectionHead title="Ofertas do dia" action="Ver todas as ofertas" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 24 }}>
          {products.slice(0, 4).map((p) => <ProductCard key={p.id} {...p} onClick={() => go('product', p)} onAdd={() => add(p)} />)}
        </div>
      </section>
      <section>
        <SectionHead title="Mais amados em Casa e Estilo" action="Ver mais" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 24 }}>
          {products.slice(4).map((p) => <ProductCard key={p.id} {...p} onClick={() => go('product', p)} onAdd={() => add(p)} />)}
        </div>
      </section>
    </main>
  );
}
window.HomeScreen = HomeScreen;
