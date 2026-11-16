// DANNKOZT - SPA: navigasi, role, data, booking, dashboard (satu file JS)
const $=i=>document.getElementById(i);
const rp=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n);
const L=(k,d)=>JSON.parse(localStorage.getItem(k)||'null')??d, S=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tgl=d=>new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
const SEWA={bulan:{n:'Sewa Per Bulan',m:1,u:'bulan'},semester:{n:'Sewa Per Semester',m:6,u:'semester'},tahun:{n:'Sewa Per Tahun',m:12,u:'tahun'}};
function addMonths(s,m){const d=new Date(s),h=d.getDate();d.setMonth(d.getMonth()+m);if(d.getDate()<h)d.setDate(0);return d}
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;document.body.append(d);setTimeout(()=>d.remove(),2500)}
// ---- Data dummy (harga null = tipe sewa nonaktif) ----
const SEED=[['Kost Melati','Semarang','Putri',['WiFi','AC','Kamar Mandi Dalam'],10,4,800000,4500000,8000000,'🏠'],['Kost Garuda','Semarang','Putra',['WiFi','Parkir'],12,6,650000,null,7000000,'🏢'],['Kost Anggrek','Yogyakarta','Campur',['WiFi','AC','Dapur'],8,0,900000,5000000,9000000,'🏡'],['Kost Mawar','Bandung','Putri',['WiFi','Laundry'],15,7,750000,4200000,7800000,'🏘️'],['Kost Pelangi','Jakarta','Campur',['AC','WiFi','Parkir'],20,9,1200000,6800000,12500000,'🏙️'],['Kost Sakura','Surabaya','Putri',['WiFi','Kamar Mandi Dalam'],9,2,700000,3900000,null,'🌸'],['Kost Nusantara','Malang','Putra',['WiFi','Dapur','Parkir'],14,5,600000,3400000,6200000,'🏠'],['Kost Harmoni','Semarang','Campur',['AC','WiFi','Laundry'],11,3,850000,4800000,8700000,'🏢']].map((r,i)=>({id:i+1,nama:r[0],kota:r[1],tipe:r[2],fasilitas:r[3],kamar:r[4],tersedia:r[5],harga:{bulan:r[6],semester:r[7],tahun:r[8]},ikon:r[9],status:'Disetujui',owner:'pemilik@dannkozt.id'}));
if(!L('kosts'))S('kosts',SEED);
// DEMO: password polos hanya untuk prototipe, bukan autentikasi aman
if(!L('users'))S('users',[{email:'penyewa@dannkozt.id',pass:'123456',role:'penyewa',nama:'Budi Penyewa',hp:'0812000111'},{email:'pemilik@dannkozt.id',pass:'123456',role:'pemilik',nama:'Siti Pemilik',hp:'0812000222',status:'Disetujui'},{email:'admin@dannkozt.id',pass:'admin123',role:'admin',nama:'Admin'}]);
const me=()=>L('session',null);
// ---- Navigasi & akses role ----
const MENU={guest:[['beranda','Beranda'],['kamar','Cari Kost'],['login','Login'],['register','Daftar']],penyewa:[['beranda','Beranda'],['kamar','Cari Kost'],['riwayat','Riwayat Booking'],['profil','Profil']],pemilik:[['dashboard','Dashboard'],['tambah','Tambah Kost'],['kelola','Kelola Kost'],['pesanan','Pesanan Masuk'],['profil','Profil']],admin:[['dashboard','Dashboard'],['verif','Verifikasi'],['pengguna','Pengguna'],['transaksi','Transaksi']]};
const ROLE={riwayat:'penyewa',profil:'*',dashboard:'pemilik,admin',tambah:'pemilik',kelola:'pemilik',pesanan:'pemilik',verif:'admin',pengguna:'admin',transaksi:'admin'};
let cur='beranda';
function go(v,p){const u=me(),r=ROLE[v];
 if(r&&(!u||(r!=='*'&&!r.split(',').includes(u.role)))){toast('Login dengan akun yang sesuai dulu');v='login'}
 cur=v;$('nav').classList.remove('open');document.querySelectorAll('.page').forEach(s=>s.classList.toggle('on',s.id==='v-'+v));
 $('nav').innerHTML=`<a class="logo" onclick="go('${u&&u.role!=='penyewa'?'dashboard':'beranda'}')">DANNKOZT</a><button class="ham" onclick="$('nav').classList.toggle('open')">☰</button>`+MENU[u?u.role:'guest'].map(m=>`<a class="${m[0]===v?'on':''}" onclick="go('${m[0]}')">${m[1]}</a>`).join('')+(u?`<span>${esc(u.nama)}</span><a class="btn alt" onclick="logout()">Keluar</a>`:'');
 R[v]&&R[v](p);scrollTo(0,0)}
function logout(){localStorage.removeItem('session');go('beranda')}
function doLogin(e){e.preventDefault();const u=L('users',[]).find(x=>x.email===$('le').value.trim()&&x.pass===$('lp').value);
 if(!u)return toast('Email atau password salah');S('session',u);toast('Login berhasil');go(u.role==='penyewa'?'kamar':'dashboard')}
function doReg(e){e.preventDefault();const role=$('rr').value,em=$('re').value.trim(),us=L('users',[]);
 if(!/^\S+@\S+\.\S+$/.test(em))return toast('Email tidak valid');
 if(!/^(\+62|0)8\d{7,12}$/.test($('rh').value))return toast('Nomor HP tidak valid');
 if($('rp').value.length<6)return toast('Password minimal 6 karakter');
 if($('rp').value!==$('rc').value)return toast('Konfirmasi password tidak sama');
 if(us.some(x=>x.email===em))return toast('Email sudah terdaftar');
 const u={email:em,pass:$('rp').value,role,nama:$('rn').value.trim(),hp:$('rh').value};
 if(role==='pemilik'){if(!/^\d{16}$/.test($('rk').value))return toast('NIK harus 16 digit');
  const f=$('rf').files[0];if(!f||!/\.(jpe?g|png)$/i.test(f.name))return toast('Foto KTP wajib JPG/JPEG/PNG');
  u.status='Menunggu Verifikasi';u.ktp='Terunggah (demo, berkas tidak disimpan)'}
 us.push(u);S('users',us);e.target.reset();toast(role==='pemilik'?'Registrasi berhasil, KTP menunggu verifikasi':'Registrasi berhasil, silakan login');go('login')}
// ---- Kartu kost ----
const aktif=k=>Object.keys(SEWA).filter(t=>k.harga[t]);
function kartu(k){const t=aktif(k);return `<div class="card"><div class="img">${k.ikon}</div><div class="body"><h3>${esc(k.nama)}</h3><div>📍 ${esc(k.kota)} <span class="tag">${k.tipe}</span></div><p><b>Mulai ${rp(Math.min(...t.map(x=>k.harga[x])))}</b></p>${t.map(x=>`<span class="tag">${x}: ${rp(k.harga[x])}</span>`).join('')}<div>${k.fasilitas.map(f=>`<span class="tag">${esc(f)}</span>`).join('')}</div><span class="tag ${k.tersedia>0?'ok':'no'}">${k.tersedia>0?k.tersedia+' kamar tersedia':'Penuh'}</span><br><button class="btn alt" onclick="go('detail',${k.id})">Detail</button> ${k.tersedia>0?`<button class="btn" onclick="go('detail',${k.id})">Booking</button>`:''}</div></div>`}
const pub=()=>L('kosts',[]).filter(k=>k.status==='Disetujui'&&aktif(k).length);
let K,T;
const R={
 beranda(){$('rek').innerHTML=pub().slice(0,4).map(kartu).join('')},
 kamar(){const f=()=>{const q=$('q').value.toLowerCase(),m=+$('max').value||Infinity,h=pub().filter(k=>k.kota.toLowerCase().includes(q)&&(!$('tp').value||k.tipe===$('tp').value)&&(!$('sw').value||k.harga[$('sw').value])&&(!$('av').checked||k.tersedia>0)&&(!k.harga.bulan||k.harga.bulan<=m));
  $('list').innerHTML=h.map(kartu).join('')||'<p>Tidak ada kost cocok. Ubah filter Anda.</p>'};
  document.querySelectorAll('#v-kamar input,#v-kamar select').forEach(i=>i.oninput=f);f()},
 detail(id){K=L('kosts',[]).find(x=>x.id==id);T=null;if(!K)return $('d').textContent='Kost tidak ditemukan.';
  $('d').innerHTML=`<div class="gal" id="gal"><div class="img" style="height:220px;border-radius:16px">${K.ikon}</div></div><h1>${esc(K.nama)}</h1><p>📍 ${esc(K.alamat?K.alamat+', '+K.kec+', ':'')}${esc(K.kota)}${K.prov?', '+esc(K.prov):''} · ${K.tipe} · ${K.tersedia}/${K.kamar} kamar tersedia</p><p>${K.fasilitas.map(f=>`<span class="tag">${esc(f)}</span>`).join('')}</p>${info(K)}<h3>Pilih tipe sewa</h3><div class="opts">${aktif(K).map(t=>`<div class="opt" id="o-${t}" onclick="pick('${t}')"><b>${SEWA[t].n.toUpperCase()}</b><br>${rp(K.harga[t])}/${SEWA[t].m===1?'bulan':SEWA[t].m+' bulan'}</div>`).join('')}</div>
  <label>Durasi (<span id="du">-</span>) <input id="dn" type="number" min="1" value="1" oninput="hit()"></label> <label>Mulai <input id="ds2" type="date" oninput="hit()"></label><div class="sum" id="sum">Pilih tipe sewa untuk melihat ringkasan.</div><button class="btn" onclick="book()" ${K.tersedia<1?'disabled':''}>Booking Sekarang</button>`;
  $('ds2').value=$('ds2').min=new Date().toISOString().slice(0,10);if(K.media)loadGal(K.id)},
 riwayat(){const u=me(),b=L('bookings',[]).filter(x=>x.email===u.email).reverse();
  $('rw').innerHTML=b.map(x=>`<div class="card"><div class="img">${x.ikon}</div><div class="body"><h3>${esc(x.kost)}</h3><p>${SEWA[x.tipe].n}: ${x.dur} ${SEWA[x.tipe].u}<br>${tgl(x.mulai)} - ${tgl(x.akhir)}<br>Harga ${rp(x.harga)} · Total <b>${rp(x.total)}</b></p><span class="tag">${x.status}</span><span class="tag">${x.bayar}</span><br>${x.bayar==='Belum Dibayar'&&x.status!=='Ditolak'?`<button class="btn" onclick="bayar(${x.id})">Bayar (simulasi)</button>`:''}</div></div>`).join('')||'<p>Belum ada booking. Mulai dari menu Cari Kost.</p>'},
 profil(){const u=me();$('pf').innerHTML=`<h2>Profil</h2><div class="sum">Nama: ${esc(u.nama)}<br>Email: ${esc(u.email)}<br>HP: ${esc(u.hp||'-')}<br>Peran: ${u.role}${u.status?'<br>Status verifikasi: <b>'+u.status+'</b>':''}${u.ktp?'<br>KTP: '+u.ktp+' (tidak ditampilkan ke publik)':''}</div>`},
 dashboard(){const u=me(),ks=L('kosts',[]),bs=L('bookings',[]),us=L('users',[]);let s;
  if(u.role==='pemilik'){const mk=ks.filter(k=>k.owner===u.email),mb=bs.filter(b=>mk.some(k=>k.id===b.kostId)),c=x=>mb.filter(b=>b.status===x).length;
   s=[['Total kost',mk.length],['Total kamar',mk.reduce((a,k)=>a+k.kamar,0)],['Kamar tersedia',mk.reduce((a,k)=>a+k.tersedia,0)],['Booking masuk',mb.length],['Menunggu',c('Menunggu Konfirmasi')],['Diterima',c('Diterima')],['Ditolak',c('Ditolak')]];
   const x=us.find(z=>z.email===u.email);if(x&&x.status!=='Disetujui')toast('Akun pemilik: '+x.status+'. Kost belum bisa dipublikasikan.')}
  else s=[['Penyewa',us.filter(x=>x.role==='penyewa').length],['Pemilik',us.filter(x=>x.role==='pemilik').length],['Kost',ks.length],['Kamar',ks.reduce((a,k)=>a+k.kamar,0)],['Transaksi',bs.length],['Pemilik menunggu',us.filter(x=>x.status==='Menunggu Verifikasi').length],['Kost menunggu',ks.filter(k=>k.status==='Menunggu').length]];
  $('ds').innerHTML=s.map(x=>`<div class="stat"><b>${x[1]}</b>${x[0]}</div>`).join('')},
 kelola(){const u=me(),mk=L('kosts',[]).filter(k=>k.owner===u.email);
  $('kl').innerHTML='<table><tr><th>Kost</th><th>Harga bulan/semester/tahun</th><th>Kamar</th><th>Status</th><th></th></tr>'+mk.map(k=>`<tr><td>${esc(k.nama)}</td><td>${['bulan','semester','tahun'].map(t=>k.harga[t]?rp(k.harga[t]):'nonaktif').join(' / ')}</td><td>${k.tersedia}/${k.kamar}</td><td>${k.status}</td><td><button class="btn" onclick="editHarga(${k.id})">Ubah harga &amp; kamar</button> <button class="btn red" onclick="delKost(${k.id})">Hapus</button></td></tr>`).join('')+'</table>'},
 pesanan(){const u=me(),ids=L('kosts',[]).filter(k=>k.owner===u.email).map(k=>k.id),b=L('bookings',[]).filter(x=>ids.includes(x.kostId)).reverse();
  $('ps').innerHTML='<table><tr><th>Penyewa</th><th>HP</th><th>Kost</th><th>Sewa</th><th>Periode</th><th>Total</th><th>Bayar</th><th>Status</th><th></th></tr>'+b.map(x=>`<tr><td>${esc(x.nama)}</td><td>${esc(x.hp||'-')}</td><td>${esc(x.kost)}</td><td>${SEWA[x.tipe].n} x${x.dur}</td><td>${tgl(x.mulai)} - ${tgl(x.akhir)}</td><td>${rp(x.total)}</td><td>${x.bayar}</td><td>${x.status}</td><td>${x.status==='Menunggu Konfirmasi'?`<button class="btn" onclick="setB(${x.id},'Diterima')">Terima</button> <button class="btn red" onclick="setB(${x.id},'Ditolak')">Tolak</button>`:''}</td></tr>`).join('')+'</table>'},
 verif(){const us=L('users',[]).filter(x=>x.role==='pemilik'),ks=L('kosts',[]);
  $('vo').innerHTML='<table><tr><th>Nama</th><th>Email</th><th>KTP (akses admin)</th><th>Status</th><th></th></tr>'+us.map(x=>`<tr><td>${esc(x.nama)}</td><td>${esc(x.email)}</td><td>${x.ktp||'Data dummy'}</td><td>${x.status}</td><td><button class="btn" onclick="setU('${x.email}','Disetujui')">Setujui</button> <button class="btn red" onclick="setU('${x.email}','Ditolak')">Tolak</button></td></tr>`).join('')+'</table>';
  $('vk').innerHTML='<table><tr><th>Kost</th><th>Kota</th><th>Pemilik</th><th>Status</th><th></th></tr>'+ks.map(k=>`<tr><td>${esc(k.nama)}</td><td>${esc(k.kota)}</td><td>${esc(k.owner)}</td><td>${k.status}</td><td><button class="btn" onclick="setK(${k.id},'Disetujui')">Setujui</button> <button class="btn red" onclick="setK(${k.id},'Ditolak')">Tolak</button></td></tr>`).join('')+'</table>'},
 pengguna(){$('pg').innerHTML='<table><tr><th>Nama</th><th>Email</th><th>Peran</th><th></th></tr>'+L('users',[]).map(x=>`<tr><td>${esc(x.nama)}</td><td>${esc(x.email)}</td><td>${x.role}</td><td>${x.role==='admin'?'':`<button class="btn red" onclick="delU('${x.email}')">Hapus</button>`}</td></tr>`).join('')+'</table>'},
 transaksi(){$('tr').innerHTML='<table><tr><th>Penyewa</th><th>Kost</th><th>Sewa</th><th>Total</th><th>Pembayaran</th><th>Status</th></tr>'+L('bookings',[]).map(x=>`<tr><td>${esc(x.nama)}</td><td>${esc(x.kost)}</td><td>${SEWA[x.tipe].n} x${x.dur}</td><td>${rp(x.total)}</td><td>${x.bayar}</td><td>${x.status}</td></tr>`).join('')+'</table>'}
};
// ---- Tipe sewa, perhitungan harga & tanggal ----
function pick(t){T=t;document.querySelectorAll('.opt').forEach(o=>o.classList.toggle('sel',o.id==='o-'+t));hit()}
function hit(){if(!T)return null;const dur=Math.max(1,parseInt($('dn').value)||1),bln=SEWA[T].m*dur,akhir=addMonths($('ds2').value,bln),total=K.harga[T]*dur;
 $('du').textContent=SEWA[T].u;$('sum').innerHTML=`Tipe: <b>${SEWA[T].n}</b><br>Harga: ${rp(K.harga[T])}<br>Durasi: ${dur} ${SEWA[T].u} (${bln} bulan)<br>Mulai: ${tgl($('ds2').value)}<br>Berakhir: ${tgl(akhir)}<br>Total: <b>${rp(total)}</b>`;
 return{tipe:T,dur,mulai:$('ds2').value,akhir:akhir.toISOString().slice(0,10),harga:K.harga[T],total}}
function book(){const u=me();if(!u||u.role!=='penyewa'){toast('Login sebagai penyewa dulu');return go('login')}
 const h=hit();if(!h)return toast('Pilih tipe sewa dulu');const ks=L('kosts',[]),kk=ks.find(x=>x.id===K.id);if(kk.tersedia<1)return toast('Kamar penuh');
 kk.tersedia--;S('kosts',ks);const b=L('bookings',[]);b.push({id:Date.now(),email:u.email,nama:u.nama,hp:u.hp,kostId:K.id,kost:K.nama,ikon:K.ikon,status:'Menunggu Konfirmasi',bayar:'Belum Dibayar',...h});S('bookings',b);toast('Booking berhasil');go('riwayat')}
function bayar(id){const b=L('bookings',[]);b.find(x=>x.id===id).bayar='Berhasil';S('bookings',b);toast('Pembayaran berhasil (simulasi)');R.riwayat()}
// ---- Pemilik ----
// ---- Media (IndexedDB), fasilitas, iuran ----
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('dannkozt',1);r.onupgradeneeded=()=>r.result.createObjectStore('media');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
async function mPut(id,arr){const d=await idb();return new Promise((ok,no)=>{const t=d.transaction('media','readwrite');t.objectStore('media').put(arr,id);t.oncomplete=ok;t.onerror=()=>no(t.error)})}
async function mGet(id){const d=await idb();return new Promise(ok=>{const q=d.transaction('media').objectStore('media').get(id);q.onsuccess=()=>ok(q.result||[]);q.onerror=()=>ok([])})}
const UMUM=[['dapur','Dapur Umum','🍳'],['kulkas','Kulkas Bersama','🧊'],['mesin','Mesin Cuci Bersama','🧺'],['jemuran','Jemuran','👕'],['toilet','Toilet Bersama','🚻']];
const PRIB=[['kasur','Kasur','🛏️'],['lemari','Lemari','🚪'],['meja','Meja','🪑'],['ac','AC','❄️'],['kipas','Kipas Angin','🌀'],['kmd','Kamar Mandi Dalam','🚿']];
const rows=(p,a)=>a.map(x=>`<div class="fr"><span>${x[2]} ${x[1]}</span><span><label><input type="radio" name="${p+x[0]}" value="1" onchange="fx()"> Ada</label> <label><input type="radio" name="${p+x[0]}" value="0" checked onchange="fx()"> Tidak Ada</label></span></div>`).join('');
const yes=n=>document.querySelector(`input[name="${n}"]:checked`).value==='1';
function fx(){const t=yes('u_toilet');$('jt').classList.toggle('hide',!t);if(!t)$('jt').value=''}
function fi(){const w=$('iw').value==='1',l=$('il').value==='1',s=$('sl').value,a=$('ia').value==='1';
 $('hw').classList.toggle('hide',!w);$('bl').classList.toggle('hide',!l);$('ib').classList.toggle('hide',!(l&&s==='bulanan'));$('bt').classList.toggle('hide',!(l&&s==='token'));$('ha').classList.toggle('hide',!a);
 if(!w)$('hw').value='';if(!a)$('ha').value='';if(!l||s!=='bulanan')$('ib').value='';if(!l||s!=='token')$('tk').value=''}
let MF=[];const OKT=/^(image\/(jpeg|png|webp)|video\/(mp4|webm))$/;
function pickFiles(inp){for(const f of inp.files){if(!OKT.test(f.type))toast(f.name+': format tidak didukung');else if(f.size>10485760)toast(f.name+': ukuran melebihi 10 MB');else MF.push(f)}inp.value='';prev()}
function prev(){$('mc').textContent=MF.length+'/5 file'+(MF.length>=5?' ✓':'');$('mp').innerHTML=MF.map((f,i)=>{const u=URL.createObjectURL(f);return `<div class="pv">${f.type.startsWith('video')?`<video src="${u}" muted></video>`:`<img src="${u}">`}<small>${esc(f.name)}<br>${(f.size/1048576).toFixed(2)} MB</small><button type="button" class="btn red" onclick="MF.splice(${i},1);prev()">Hapus</button></div>`}).join('')}
async function addKost(e){e.preventDefault();const u=me(),x=L('users',[]).find(z=>z.email===u.email);
 if(!x||x.status!=='Disetujui')return toast('Akun pemilik belum disetujui admin');
 if(!$('pv').value||!$('kb').value||!$('kk').value)return toast('Pilih provinsi, kabupaten/kota, dan kecamatan');if(!$('al').value.trim())return toast('Alamat lengkap wajib diisi');
 const on={bulan:$('cb').checked,semester:$('cs').checked,tahun:$('cy').checked},v={bulan:+$('hb').value,semester:+$('hs').value,tahun:+$('hy').value},h={};
 for(const t in on)h[t]=on[t]?v[t]:null;if(!Object.values(h).some(Boolean))return toast('Aktifkan minimal satu tipe sewa dengan harga valid');
 if(+$('ka').value>+$('kj').value)return toast('Kamar tersedia melebihi jumlah kamar');
 if(MF.length<5)return toast('Upload minimal 5 foto/video ('+MF.length+'/5)');
 const um={};UMUM.forEach(a=>um[a[0]]=yes('u_'+a[0]));let jt=null;if(um.toilet){jt=parseInt($('jt').value);if(!(jt>0))return toast('Total toilet harus angka positif')}
 const nom=id=>+$(id).value>0?+$(id).value:null,s=$('sl').value;
 const iu={wifi:{ya:$('iw').value==='1',nominal:nom('hw')},listrik:{ya:$('il').value==='1',sistem:s,nominal:nom('ib'),token:nom('tk')},air:{ya:$('ia').value==='1',nominal:nom('ha')}};
 if(iu.wifi.ya&&!iu.wifi.nominal)return toast('Isi nominal iuran WiFi');if(iu.air.ya&&!iu.air.nominal)return toast('Isi nominal iuran air');
 if(iu.listrik.ya&&s==='bulanan'&&!iu.listrik.nominal)return toast('Isi total iuran listrik');
 if(!iu.listrik.ya)Object.assign(iu.listrik,{sistem:null,nominal:null,token:null});
 const pr={},id=Date.now();PRIB.forEach(a=>pr[a[0]]=yes('p_'+a[0]));
 try{await mPut(id,MF)}catch(err){return toast('Gagal menyimpan foto/video (penyimpanan penuh?)')}
 const ks=L('kosts',[]);ks.push({id,nama:$('kn').value.trim(),prov:nm('pv'),kota:nm('kb'),kec:nm('kk'),alamat:$('al').value.trim(),tipe:$('kt').value,kamar:+$('kj').value,tersedia:+$('ka').value,fasilitas:$('kf').value.split(',').map(s=>s.trim()).filter(Boolean),harga:h,ikon:'🏠',status:'Menunggu',owner:u.email,umum:um,jmlToilet:jt,iuran:iu,pribadi:pr,media:MF.length});
 S('kosts',ks);MF=[];e.target.reset();fill('kb',[],'Pilih Kabupaten/Kota');fill('kk',[],'Pilih Kecamatan');fx();fi();prev();toast('Kost menunggu persetujuan admin');go('kelola')}
// ---- Info detail kost ----
const rpm=n=>rp(n)+'/bulan';
function info(k){if(!k.umum)return '';const u=k.umum,i=k.iuran,p=k.pribadi,l=i.listrik,r=(t,ok,tx)=>`<div class="fi"><span>${t}</span><b class="${ok?'y':'n'}">${tx}</b></div>`;
 const ls=!l.ya?'Tidak':l.sistem==='termasuk'?'Iya · termasuk harga sewa':l.sistem==='bulanan'?'Iya · iuran '+rpm(l.nominal):'Iya · token per kamar, dibayar masing-masing penghuni'+(l.token?' (perkiraan '+rpm(l.token)+')':'');
 return `<div class="info"><div class="sec"><h3>Fasilitas Umum</h3>${UMUM.map(a=>r(a[2]+' '+a[1],u[a[0]],u[a[0]]?'Ada'+(a[0]==='toilet'?' ('+k.jmlToilet+' unit)':''):'Tidak Ada')).join('')}</div>
 <div class="sec"><h3>Iuran Kost</h3>${r('📶 WiFi',i.wifi.ya,i.wifi.ya?'Iya · '+rpm(i.wifi.nominal):'Tidak')}${r('💡 Listrik',l.ya,ls)}${r('🚰 Air',i.air.ya,i.air.ya?'Iya · '+rpm(i.air.nominal):'Tidak')}</div>
 <div class="sec"><h3>Fasilitas Pribadi Kamar</h3>${PRIB.map(a=>r(a[2]+' '+a[1],p[a[0]],a[0]==='kmd'?(p.kmd?'Kamar Mandi Dalam tersedia':u.toilet?'Menggunakan kamar mandi luar/bersama':'Tidak tersedia'):p[a[0]]?'Tersedia':'Tidak tersedia')).join('')}</div></div>`}
async function loadGal(id){const m=await mGet(id);if(!m.length||!$('gal'))return;$('gal').innerHTML=m.map(f=>{const u=URL.createObjectURL(f);return f.type.startsWith('video')?`<video src="${u}" controls></video>`:`<img src="${u}" onclick="zoom(this.src)">`}).join('')}
function zoom(s){$('lb').innerHTML=`<img src="${s}">`;$('lb').classList.add('on')}
function editHarga(id){const ks=L('kosts',[]),k=ks.find(x=>x.id===id);const p=t=>{const r=prompt('Harga '+t+' (kosongkan = nonaktif)',k.harga[t]||'');return r===null?k.harga[t]:(+r>0?+r:null)};
 const h={bulan:p('bulan'),semester:p('semester'),tahun:p('tahun')};if(!Object.values(h).some(Boolean))return toast('Minimal satu tipe sewa aktif');
 k.harga=h;const t=prompt('Kamar tersedia (maks '+k.kamar+')',k.tersedia);if(t!==null&&+t>=0&&+t<=k.kamar)k.tersedia=+t;S('kosts',ks);toast('Kost diperbarui');R.kelola()}
function delKost(id){if(confirm('Hapus kost ini?')){S('kosts',L('kosts',[]).filter(k=>k.id!==id));R.kelola()}}
function setB(id,s){const b=L('bookings',[]),x=b.find(z=>z.id===id);x.status=s;S('bookings',b);
 if(s==='Ditolak'){const ks=L('kosts',[]),k=ks.find(z=>z.id===x.kostId);if(k){k.tersedia++;S('kosts',ks)}}toast('Booking '+s.toLowerCase());R.pesanan()}
// ---- Admin ----
function setU(em,s){const us=L('users',[]);us.find(x=>x.email===em).status=s;S('users',us);toast('Pemilik '+s.toLowerCase());R.verif()}
function setK(id,s){const ks=L('kosts',[]);ks.find(x=>x.id===id).status=s;S('kosts',ks);toast('Kost '+s.toLowerCase());R.verif()}
function delU(em){if(confirm('Hapus pengguna?')){S('users',L('users',[]).filter(x=>x.email!==em));R.pengguna()}}
// ---- Lokasi Indonesia (API wilayah, cache localStorage) ----
const API='https://www.emsifa.com/api-wilayah-indonesia/api/',OPT={},PH={};
async function wil(p){const c=L('wil_'+p,null);if(c)return c;
 try{const r=await fetch(API+p+'.json');if(!r.ok)throw 0;const d=await r.json();try{S('wil_'+p,d)}catch(e){}return d}catch(e){toast('Gagal memuat data wilayah. Periksa koneksi internet.');return null}}
function fill(id,list,ph){OPT[id]=list;PH[id]=ph;const s=$(id),v=s.value;s.innerHTML=`<option value="">${ph}</option>`+list.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');if(list.some(x=>x.id==v))s.value=v}
function flt(id,q){fill(id,(OPT[id+'_all']||OPT[id]||[]).filter(x=>x.name.toLowerCase().includes(q.toLowerCase())),PH[id])}
async function load(id,path,ph){fill(id,[],'Memuat...');const d=await wil(path);if(!d)return fill(id,[],'Gagal memuat, pilih ulang induknya');OPT[id+'_all']=d;fill(id,d,ph)}
const nm=id=>$(id).selectedOptions[0].text;
function onPv(){fill('kb',[],'Pilih Kabupaten/Kota');fill('kk',[],'Pilih Kecamatan');$('fs2').value=$('fs3').value='';delete OPT.kb_all;delete OPT.kk_all;if($('pv').value)load('kb','regencies/'+$('pv').value,'Pilih Kabupaten/Kota')}
function onKb(){fill('kk',[],'Pilih Kecamatan');$('fs3').value='';delete OPT.kk_all;if($('kb').value)load('kk','districts/'+$('kb').value,'Pilih Kecamatan')}
R.tambah=()=>{if(!OPT.pv_all)load('pv','provinces','Pilih Provinsi')};
$('fu').innerHTML=rows('u_',UMUM);$('fp').innerHTML=rows('p_',PRIB);
go('beranda');
