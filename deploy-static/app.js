(() => {
  const data = window.DASHBOARD_DATA;
  const ALL = '__ALL__';
  const state = { integration: ALL, years: [], csj: ALL, sede: ALL, organo: ALL, collapsed: new Set() };
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => new Intl.NumberFormat('es-PE').format(n || 0);
  const uniq = (xs) => [...new Set(xs.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es',{sensitivity:'base'}));
  const sum = (rs) => rs.reduce((s,r)=>s+r.cantidad,0);
  const byState = () => data.records.filter(r => (state.integration===ALL||r.integration===state.integration) && (!state.years.length||state.years.includes(r.year)) && (state.csj===ALL||r.csj===state.csj) && (state.sede===ALL||r.sede===state.sede) && (state.organo===ALL||r.organo===state.organo));
  const integrationRows = () => data.records.filter(r => state.integration===ALL || r.integration===state.integration);
  const meta = () => data.integrations.find(i => i.name===state.integration);
  const label = (title) => title.split(' ').map((x,i,a)=> i===a.length-1?`<em>${x}</em>`:x).join(' ');

  function renderNav(){
    const items=[{name:ALL,label:'Resumen general',rows:data.integrations.length},...data.integrations.map(x=>({name:x.name,label:x.name,rows:x.rows}))];
    $('nav').innerHTML=items.map((it,i)=>`<button class="nav-item ${state.integration===it.name?'active':''}" data-int="${encodeURIComponent(it.name)}"><span class="nav-num">${String(i+1).padStart(2,'0')}</span><span>▦</span><span>${it.label}</span><span class="nav-badge">${it.rows}</span></button>`).join('');
    $('nav').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.integration=decodeURIComponent(b.dataset.int); state.years=[]; state.csj=state.sede=state.organo=ALL; state.collapsed.clear(); render(); closeMenu();});
  }
  function renderHero(rs){
    const title=state.integration===ALL?'Integraciones judiciales':state.integration;
    $('title').innerHTML=label(title);
    $('subtitle').textContent=state.integration===ALL?'Vista consolidada y desagregable por año, corte superior, sede y órgano jurisdiccional.':`Análisis dinámico de ${state.integration}, respetando únicamente las dimensiones disponibles en su hoja de origen.`;
    $('heroTotal').textContent=fmt(sum(rs)); $('metric').textContent=state.integration===ALL?'registros':(meta()?.metric||'registros');
    $('source').textContent=`FUENTE · ${data.source}`; $('updated').textContent=`ACTUALIZADO · ${data.generatedAt}`;
  }
  function renderFilters(){
    const base=integrationRows(); const years=[...new Set(base.map(r=>r.year))].sort((a,b)=>a-b);
    const csjs=uniq(base.map(r=>r.csj)); const byCsj=base.filter(r=>state.csj===ALL||r.csj===state.csj);
    const sedes=uniq(byCsj.map(r=>r.sede)); const bySede=byCsj.filter(r=>state.sede===ALL||r.sede===state.sede); const organos=uniq(bySede.map(r=>r.organo));
    const sel=(id,labelText,vals,value)=> vals.length?`<label><span>${labelText}</span><select id="${id}"><option value="${ALL}">Todas</option>${vals.map(v=>`<option ${v===value?'selected':''}>${v}</option>`).join('')}</select></label>`:'';
    $('filters').innerHTML=`<div class="filter-heading"><span>⌁</span><span>Filtros de análisis</span><button id="resetBtn">RESTABLECER</button></div><div class="year-pills">${years.map(y=>`<button class="${state.years.includes(y)?'active':''}" data-year="${y}"><span class="dot"></span>${y}</button>`).join('')}</div><div class="select-grid">${sel('csj','CSJ / DISTRITO JUDICIAL',csjs,state.csj)}${sel('sede','SEDE',sedes,state.sede)}${sel('organo','ÓRGANO JURISDICCIONAL',organos,state.organo)}</div>`;
    $('resetBtn').onclick=()=>{state.years=[]; state.csj=state.sede=state.organo=ALL; render();};
    $('filters').querySelectorAll('[data-year]').forEach(b=>b.onclick=()=>{const y=Number(b.dataset.year); state.years=state.years.includes(y)?state.years.filter(x=>x!==y):[...state.years,y].sort(); render();});
    ['csj','sede','organo'].forEach(id=>{const el=$(id); if(el) el.onchange=()=>{state[id]=el.value; if(id==='csj'){state.sede=state.organo=ALL;} if(id==='sede'){state.organo=ALL;} render();};});
    return years;
  }
  function renderKpis(rs){
    const years=[...new Set(rs.map(r=>r.year))], csj=uniq(rs.map(r=>r.csj)), sedes=uniq(rs.map(r=>r.sede)), org=uniq(rs.map(r=>r.organo));
    const metric=state.integration===ALL?'registros':(meta()?.metric||'registros');
    const items=[[`TOTAL ${metric}`,fmt(sum(rs)),`${rs.length} registros agregados`],['AÑOS VISIBLES',fmt(years.length),years.length?`${Math.min(...years)}–${Math.max(...years)}`:'Sin datos'],['CSJ / DISTRITOS',fmt(csj.length),csj.length?'con información disponible':'dimensión no informada'],['SEDES',fmt(sedes.length),sedes.length?'sedes distintas':'dimensión no informada'],['ÓRGANOS',fmt(org.length),'órganos distintos']];
    $('kpis').innerHTML=items.map(x=>`<div class="kpi"><div class="kpi-label">${x[0]}</div><div class="kpi-value">${x[1]}</div><div class="kpi-sub">${x[2]}</div></div>`).join('');
  }
  function renderBars(rs){
    const m=new Map(); rs.forEach(r=>m.set(r.year,(m.get(r.year)||0)+r.cantidad)); const arr=[...m].sort((a,b)=>a[0]-b[0]); const max=Math.max(1,...arr.map(x=>x[1])); $('periods').textContent=`${arr.length} periodos`;
    $('bars').innerHTML=arr.map(([y,v])=>`<div class="bar-col"><div class="bar-value">${fmt(v)}</div><div class="bar-track"><div class="bar-fill" style="height:${Math.max(3,v/max*100)}%"></div></div><div class="bar-year">${y}</div></div>`).join('');
  }
  function node(label,key,level,rows,years,children=[]){const values={};years.forEach(y=>values[y]=sum(rows.filter(r=>r.year===y)));return{label,key,level,rows,values,total:sum(rows),children};}
  function buildDims(rs,years,offset=0,prefix=''){
    const kp=prefix?prefix+'/':''; const hasCsj=rs.some(r=>r.csj), hasSede=rs.some(r=>r.sede);
    if(hasCsj){
      const roots=uniq(rs.map(r=>r.csj)).map(c=>{const cr=rs.filter(r=>r.csj===c); if(hasSede&&cr.some(r=>r.sede)){const ch=uniq(cr.map(r=>r.sede)).map(s=>{const sr=cr.filter(r=>r.sede===s);const org=uniq(sr.map(r=>r.organo)).map(o=>node(o,`${kp}c:${c}/s:${s}/o:${o}`,offset+2,sr.filter(r=>r.organo===o),years));return node(s,`${kp}c:${c}/s:${s}`,offset+1,sr,years,org)});return node(c,`${kp}c:${c}`,offset,cr,years,ch)} const org=uniq(cr.map(r=>r.organo)).map(o=>node(o,`${kp}c:${c}/o:${o}`,offset+1,cr.filter(r=>r.organo===o),years));return node(c,`${kp}c:${c}`,offset,cr,years,org)});
      const without=rs.filter(r=>!r.csj); return without.length?[...roots,...buildDims(without,years,offset,`${kp}sin-csj`)]:roots;
    }
    if(hasSede) return uniq(rs.map(r=>r.sede)).map(s=>{const sr=rs.filter(r=>r.sede===s);const org=uniq(sr.map(r=>r.organo)).map(o=>node(o,`${kp}s:${s}/o:${o}`,offset+1,sr.filter(r=>r.organo===o),years));return node(s,`${kp}s:${s}`,offset,sr,years,org)});
    return uniq(rs.map(r=>r.organo)).map(o=>node(o,`${kp}o:${o}`,offset,rs.filter(r=>r.organo===o),years));
  }
  function buildPivot(rs,years){
    const ints=uniq(rs.map(r=>r.integration));
    if(ints.length>1) return ints.map(i=>{const ir=rs.filter(r=>r.integration===i); return node(i,`i:${i}`,0,ir,years,buildDims(ir,years,1,`i:${i}`));});
    return buildDims(rs,years);
  }
  function renderPivot(rs,availableYears){
    const years=state.years.length?state.years.filter(y=>availableYears.includes(y)):availableYears; const roots=buildPivot(rs,years); const flat=[];
    function walk(n){flat.push(n); if(state.collapsed.has(n.key))return; n.children.forEach(walk)} roots.forEach(walk);
    $('rowsCount').textContent=`${flat.length} filas visibles`;
    const head=`<thead><tr><th>Etiquetas de fila</th>${years.map(y=>`<th>${y}</th>`).join('')}<th>Total general</th></tr></thead>`;
    const body=flat.map(r=>`<tr class="level-${r.level}"><td><div class="row-label" style="padding-left:${r.level*22}px">${r.children.length?`<button class="fold ${state.collapsed.has(r.key)?'collapsed':''}" data-key="${encodeURIComponent(r.key)}">›</button>`:'<span class="fold-spacer"></span>'}<span>${r.label}</span></div></td>${years.map(y=>`<td>${fmt(r.values[y]||0)}</td>`).join('')}<td class="total-col">${fmt(r.total)}</td></tr>`).join('');
    const gt=`<tr class="grand-total"><td>Total general</td>${years.map(y=>`<td>${fmt(sum(rs.filter(r=>r.year===y)))}</td>`).join('')}<td>${fmt(sum(rs))}</td></tr>`;
    $('pivot').innerHTML=head+`<tbody>${body}${gt}</tbody>`;
    $('pivot').querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>{const k=decodeURIComponent(b.dataset.key); state.collapsed.has(k)?state.collapsed.delete(k):state.collapsed.add(k); render();});
  }
  function exportCsv(){const rs=byState(); const rows=[['Integración','Año','CSJ','Sede','Órgano','Cantidad'],...rs.map(r=>[r.integration,r.year,r.csj||'',r.sede||'',r.organo||'',r.cantidad])]; const esc=v=>`"${String(v).replaceAll('"','""')}"`; const blob=new Blob(['\ufeff'+rows.map(r=>r.map(esc).join(';')).join('\n')],{type:'text/csv;charset=utf-8'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u;a.download='integraciones.csv';a.click();URL.revokeObjectURL(u);}
  function openMenu(){$('sidebar').classList.add('is-open');$('scrim').style.display='block'} function closeMenu(){if(innerWidth<961){$('sidebar').classList.remove('is-open');$('scrim').style.display='none'}}
  $('menuBtn').onclick=openMenu; $('scrim').onclick=closeMenu; $('exportBtn').onclick=exportCsv;
  function render(){renderNav(); const rs=byState(); renderHero(rs); const years=renderFilters(); renderKpis(rs); renderBars(rs); renderPivot(rs,years); $('footer').innerHTML=`<span>${data.integrations.length} integraciones</span><span>${data.records.length} registros normalizados</span><span>${uniq(data.records.map(r=>r.sourceSheet)).length} hojas de origen</span>`;}
  if(innerWidth<961){$('sidebar').classList.remove('is-open');$('scrim').style.display='none'} else {$('scrim').style.display='none'}
  render();
})();
