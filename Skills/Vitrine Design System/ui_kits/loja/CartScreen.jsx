const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function CartScreen({ cart, setQty, remove, go }) {
  const { ImagePlaceholder, QuantityStepper, Price, Button, Checkbox, Icon, Badge, IconButton } = window.VitrineDesignSystem_f1a071;
  const [gift, setGift] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const subtotal = cart.reduce((s, i) => s + i.p.price * i.qty, 0);
  const savings = cart.reduce((s, i) => s + ((i.p.original || i.p.price) - i.p.price) * i.qty, 0);
  const shipping = subtotal >= 99 || subtotal === 0 ? 0 : 19.9;
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const wrap = { maxWidth: 'var(--container-max)', margin: '0 auto', padding: '40px var(--gutter) 0' };
  if (done) return (
    <main style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', paddingTop: 96 }}>
      <span style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--lime-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={36} /></span>
      <h1 style={{ font: 'var(--type-h1)', letterSpacing: 'var(--ls-heading)' }}>Pedido confirmado!</h1>
      <p style={{ font: 'var(--fw-regular) 18px/1.5 var(--font-sans)', color: 'var(--text-secondary)' }}>Enviamos os detalhes para o seu e-mail. Chega amanhã.</p>
      <Button size="lg" onClick={() => { setDone(false); go('home'); }}>Continuar comprando</Button>
    </main>
  );
  if (!cart.length) return (
    <main style={{ ...wrap, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', paddingTop: 96 }}>
      <span style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--ink-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="shopping-bag" size={32} /></span>
      <h1 style={{ font: 'var(--type-h2)' }}>Seu carrinho está vazio</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Que tal começar pelas ofertas do dia?</p>
      <Button size="lg" onClick={() => go('home')}>Ver ofertas</Button>
    </main>
  );
  return (
    <main style={wrap}>
      <h1 style={{ font: 'var(--type-h1)', letterSpacing: 'var(--ls-heading)', marginBottom: 8 }}>Carrinho</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>{count} {count === 1 ? 'item' : 'itens'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 380px', gap: 32, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {subtotal < 99 && <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderRadius: 'var(--radius-md)', background: 'var(--lime-100)', font: '500 15px/1.3 var(--font-sans)' }}><Icon name="truck" size={18} />Faltam {brl(99 - subtotal)} para o frete grátis.</div>}
          {cart.map(({ p, qty }) => (
            <article key={p.id} style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr) auto', gap: 20, padding: 20, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-1)' }}>
              <ImagePlaceholder label="produto" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                <span style={{ font: 'var(--type-overline)', letterSpacing: 'var(--ls-caps)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{p.brand}</span>
                <a onClick={() => go('product', p)} style={{ font: '600 16px/1.35 var(--font-sans)', color: 'var(--text-primary)', textDecoration: 'none', cursor: 'pointer' }}>{p.title}</a>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: '500 13px/1.3 var(--font-sans)', color: 'var(--text-success)' }}><Icon name="truck" size={14} />{p.shipping}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
                  <QuantityStepper value={qty} onChange={(n) => setQty(p.id, n)} size="sm" />
                  <Button variant="ghost" size="sm" iconLeft="trash-2" onClick={() => remove(p.id)}>Remover</Button>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}><Price value={p.price * qty} original={p.original ? p.original * qty : undefined} size="md" style={{ alignItems: 'flex-end' }} /></div>
            </article>
          ))}
        </div>
        <aside style={{ position: 'sticky', top: 148, padding: 24, background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-2)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ font: 'var(--type-h3)' }}>Resumo do pedido</h2>
          {[['Subtotal', brl(subtotal)], ['Frete', shipping ? brl(shipping) : 'Grátis'], ['Descontos', savings ? '- ' + brl(savings) : '—']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', font: '400 15px/1 var(--font-sans)', color: k === 'Descontos' && savings ? 'var(--text-success)' : 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}><span>{k}</span><span>{v}</span></div>
          ))}
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}><span style={{ font: '600 16px/1 var(--font-sans)' }}>Total</span><Price value={subtotal + shipping} installments={10} size="md" style={{ alignItems: 'flex-end' }} /></div>
          <Checkbox label="É para presente" checked={gift} onChange={setGift} />
          <Button size="lg" fullWidth iconRight="arrow-right" onClick={() => setDone(true)}>Finalizar compra</Button>
          <Button variant="ghost" size="md" fullWidth onClick={() => go('home')}>Continuar comprando</Button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, font: '400 13px/1 var(--font-sans)', color: 'var(--text-muted)' }}><Icon name="shield-check" size={14} />Pagamento 100% seguro</div>
        </aside>
      </div>
    </main>
  );
}
window.CartScreen = CartScreen;
