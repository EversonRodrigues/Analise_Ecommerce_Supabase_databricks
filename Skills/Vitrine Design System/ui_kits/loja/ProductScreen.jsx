function ProductScreen({ product, go, add }) {
  const { ImagePlaceholder, Badge, Rating, Price, Button, QuantityStepper, Input, Icon, ProductCard, IconButton } = window.VitrineDesignSystem_f1a071;
  const [qty, setQty] = React.useState(1);
  const [thumb, setThumb] = React.useState(0);
  const [color, setColor] = React.useState('Grafite');
  const p = product;
  const related = window.VITRINE_DATA.products.filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <main style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '24px var(--gutter) 0' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', font: '400 14px/1 var(--font-sans)', color: 'var(--text-muted)', marginBottom: 24 }}>
        <a onClick={() => go('home')} style={{ color: 'var(--text-muted)', cursor: 'pointer' }}>Início</a><Icon name="chevron-right" size={14} /><span>{p.cat}</span><Icon name="chevron-right" size={14} /><span style={{ color: 'var(--text-primary)' }}>{p.brand}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 56, alignItems: 'start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[0, 1, 2, 3].map((i) => <button key={i} onClick={() => setThumb(i)} style={{ padding: 0, border: '2px solid ' + (thumb === i ? 'var(--ink-900)' : 'transparent'), borderRadius: 'var(--radius-md)', background: 'none', cursor: 'pointer' }}><ImagePlaceholder label={'vista ' + (i + 1)} radius="10px" /></button>)}
          </div>
          <div style={{ position: 'relative', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-1)' }}>
            <ImagePlaceholder label={'foto do produto — vista ' + (thumb + 1)} radius="var(--radius-lg)" />
            {p.badge && <Badge tone={p.badgeTone || 'deal'} style={{ position: 'absolute', top: 36, left: 36 }}>{p.badge}</Badge>}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ font: 'var(--type-overline)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.brand}</span>
          <h1 style={{ font: 'var(--fw-bold) 34px/1.15 var(--font-sans)', letterSpacing: 'var(--ls-heading)', marginTop: -8 }}>{p.title}</h1>
          <Rating value={p.rating} count={p.reviews} size={16} />
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <Price value={p.price} original={p.original} installments={10} size="lg" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ font: 'var(--type-label)' }}>Cor: <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>{color}</span></span>
            <div style={{ display: 'flex', gap: 10 }}>
              {[['Grafite', 'var(--ink-800)'], ['Areia', '#D9CFBF'], ['Lima', 'var(--lime-500)']].map(([n, c]) => <button key={n} aria-label={n} onClick={() => setColor(n)} style={{ width: 40, height: 40, borderRadius: 999, background: c, border: 0, cursor: 'pointer', boxShadow: color === n ? '0 0 0 3px var(--white), 0 0 0 5px var(--ink-900)' : 'inset 0 0 0 1px rgba(15,27,51,.12)' }} />)}
            </div>
          </div>
          <div style={{ padding: 20, borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)', boxShadow: 'var(--shadow-1)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-success)', font: '600 15px/1.3 var(--font-sans)' }}><Icon name="truck" size={20} />{p.shipping || 'Frete grátis'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, font: '500 14px/1 var(--font-sans)', color: 'var(--success-600)' }}><span style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--success-500)' }} />Em estoque</div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <QuantityStepper value={qty} onChange={setQty} size="md" />
              <Button size="lg" iconLeft="shopping-bag" style={{ flex: 1 }} onClick={() => { add(p, qty); go('cart'); }}>Adicionar ao carrinho</Button>
              <IconButton icon="heart" label="Favoritar" variant="soft" size={52} />
            </div>
            <Button variant="secondary" size="lg" fullWidth onClick={() => { add(p, qty); go('cart'); }}>Comprar agora</Button>
          </div>
          <Input label="Calcular frete" placeholder="Digite seu CEP" iconLeft="map-pin" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, font: '400 15px/1.55 var(--font-sans)', color: 'var(--text-secondary)' }}>
            <h3 style={{ font: 'var(--type-h3)', color: 'var(--text-primary)' }}>Sobre este item</h3>
            <p>Cancelamento de ruído ativo com três níveis, até 40 horas de bateria e carregamento rápido: 10 minutos garantem 5 horas de uso.</p>
            <p>Almofadas em espuma com memória e conexão simultânea com dois dispositivos.</p>
          </div>
        </div>
      </div>
      <section style={{ marginTop: 'var(--gap-section)' }}>
        <h2 style={{ font: 'var(--type-h2)', letterSpacing: 'var(--ls-heading)', marginBottom: 24 }}>Quem viu este item também viu</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 24 }}>{related.map((r) => <ProductCard key={r.id} {...r} onClick={() => go('product', r)} onAdd={() => add(r)} />)}</div>
      </section>
    </main>
  );
}
window.ProductScreen = ProductScreen;
