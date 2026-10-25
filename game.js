(() => {
  const $ = (id) => document.getElementById(id);
  const canvas = $("gameCanvas"), ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const duration = 45;
  let db = null, cloudReady = false, running = false, finished = false;
  let startTime = 0, lastFrame = 0, elapsed = 0, score = 0, speed = 0;
  let player = { x: W * .5, y: H * .78, w: 37, h: 60, tilt: 0 };
  let obstacles = [], particles = [], keys = {}, spawnTimer = 0, best = null, lastResult = null;
  let laneOffset = 0, invulnerable = 0, touchDirection = 0;
  const road = { left: W * .22, right: W * .78 };
  const colors = ["#ff4e88", "#ffd166", "#9b8cff", "#52f2dc", "#ff884d"];

  function initCloud() {
    const url = window.SUPABASE_URL || "";
    const key = window.SUPABASE_PUBLISHABLE_KEY || "";
    if (window.supabase && url.startsWith("http") && key && !key.includes("PEGA_AQUI")) {
      db = window.supabase.createClient(url, key);
      cloudReady = true;
      $("connectionStatus").textContent = "Supabase conectado";
      $("connectionStatus").previousElementSibling.style.background = "#52f2dc";
      loadLeaderboard();
    } else {
      $("connectionStatus").textContent = "Falta configurar Supabase";
      loadLeaderboard();
    }
  }

  function roundRect(c, x, y, w, h, r, fill, stroke) {
    c.beginPath(); c.roundRect(x, y, w, h, r);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 2; c.stroke(); }
  }

  function drawCar(x, y, w, h, color, isPlayer=false, tilt=0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.fillStyle = "#0008"; ctx.beginPath(); ctx.ellipse(2, 7, w*.7, h*.53, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#090c13";
    roundRect(ctx, -w*.55, -h*.31, w*.22, h*.28, 4, "#070a10");
    roundRect(ctx, w*.33, -h*.31, w*.22, h*.28, 4, "#070a10");
    roundRect(ctx, -w*.55, h*.13, w*.22, h*.28, 4, "#070a10");
    roundRect(ctx, w*.33, h*.13, w*.22, h*.28, 4, "#070a10");
    roundRect(ctx, -w/2, -h/2, w, h, 10, color, isPlayer ? "#a4fff4" : "#ffffff50");
    roundRect(ctx, -w*.34, -h*.39, w*.68, h*.22, 5, isPlayer ? "#a7fff5" : "#ffffff30");
    roundRect(ctx, -w*.34, -h*.15, w*.68, h*.25, 5, "#16283f", "#ffffff28");
    roundRect(ctx, -w*.29, h*.18, w*.58, h*.16, 4, "#101b30");
    ctx.fillStyle = isPlayer ? "#ffffff" : "#ff526f";
    ctx.fillRect(-w*.34, h*.39, w*.17, 3); ctx.fillRect(w*.17, h*.39, w*.17, 3);
    if (isPlayer) { ctx.shadowColor = "#52f2dc"; ctx.shadowBlur = 18; ctx.strokeStyle = "#52f2dc"; ctx.lineWidth=1.5; roundRect(ctx,-w/2,-h/2,w,h,10,null,"#52f2dc"); }
    ctx.restore();
  }

  function drawBackground() {
    const grd = ctx.createLinearGradient(0,0,0,H); grd.addColorStop(0,"#101a2b"); grd.addColorStop(1,"#152a32");
    ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#102c2c"; ctx.fillRect(0,0,road.left,H); ctx.fillRect(road.right,0,W-road.right,H);
    for (let y = -50 + (laneOffset*.8 % 90); y < H+50; y += 90) {
      ctx.fillStyle="#52f2dc22"; ctx.fillRect(road.left-18,y,5,38); ctx.fillRect(road.right+13,y,5,38);
      ctx.fillStyle="#ff4e8833"; ctx.fillRect(road.left-8,y+30,3,25); ctx.fillRect(road.right+5,y+30,3,25);
    }
    ctx.fillStyle="#252c3b"; ctx.fillRect(road.left,0,road.right-road.left,H);
    ctx.fillStyle="#3a4558"; ctx.fillRect(road.left,0,4,H); ctx.fillRect(road.right-4,0,4,H);
    for(let y=-60+(laneOffset%120);y<H;y+=120){ctx.fillStyle="#ffffff08";ctx.fillRect(road.left+12,y,road.right-road.left-24,2);}
    ctx.strokeStyle="#d9e5f633"; ctx.lineWidth=4; ctx.setLineDash([34,30]); ctx.lineDashOffset=-laneOffset;
    ctx.beginPath(); ctx.moveTo(W*.5,0); ctx.lineTo(W*.5,H); ctx.stroke(); ctx.setLineDash([]);
    for(let i=0;i<9;i++){let x=i*W/8;let bh=35+(i*29%60);ctx.fillStyle="#111d2d";ctx.fillRect(x,0,25,bh);for(let wy=7;wy<bh-5;wy+=12){ctx.fillStyle="#52f2dc28";ctx.fillRect(x+5,wy,4,4);}}
  }

  function drawHUD() {
    ctx.fillStyle="#09101bd9"; ctx.fillRect(road.left+12,12,142,35);
    ctx.fillStyle="#52f2dc"; ctx.font="800 12px Inter, sans-serif"; ctx.fillText("NEON HIGHWAY",road.left+22,26);
    ctx.fillStyle="#b7c5dd"; ctx.font="10px Inter, sans-serif"; ctx.fillText("SECTOR 01  /  "+String(Math.floor(elapsed/10)+1).padStart(2,"0"),road.left+22,39);
  }

  function draw() {
    drawBackground();
    obstacles.forEach(o => drawCar(o.x,o.y,o.w,o.h,o.color,false));
    particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/30);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);});ctx.globalAlpha=1;
    if (!finished || running) drawCar(player.x,player.y,player.w,player.h,"#52f2dc",true,player.tilt);
    drawHUD();
    if (!running && !finished) {
      ctx.fillStyle="#ffffff12";ctx.font="800 22px 'Barlow Condensed', sans-serif";ctx.textAlign="center";ctx.fillText("READY TO RACE",W/2,H-22);ctx.textAlign="left";
    }
  }

  function spawnObstacle() {
    const lanes = [W*.32,W*.5,W*.68];
    const lane = lanes[Math.floor(Math.random()*lanes.length)];
    obstacles.push({x:lane,y:-70,w:35+Math.random()*5,h:55+Math.random()*8,color:colors[Math.floor(Math.random()*colors.length)],speed:2.8+Math.random()*2});
  }
  function burst(x,y,color) {
    for(let i=0;i<18;i++) particles.push({x,y,vx:(Math.random()-.5)*7,vy:(Math.random()-.5)*7-1,life:20+Math.random()*15,size:2+Math.random()*4,color});
  }
  function resetGame() {
    running=false;finished=false;elapsed=0;score=0;speed=0;obstacles=[];particles=[];spawnTimer=0;invulnerable=0;
    player.x=W*.5;player.y=H*.78;player.tilt=0;lastResult=null;
    $("timeValue").innerHTML='45.0<span>s</span>';$("scoreValue").textContent="0000";$("speedValue").innerHTML='0<span> km/h</span>';
    $("progressText").textContent="0%";$("progressBar").style.width="0%";$("saveBtn").disabled=true;
    $("saveMessage").textContent="Completa una carrera para poder guardar tu resultado.";
    $("startOverlay").classList.remove("hidden");$("finishOverlay").classList.add("hidden");
    draw();
  }
  function startGame() {
    if(running)return;
    resetGame();running=true;startTime=performance.now();lastFrame=startTime;
    $("startOverlay").classList.add("hidden");$("finishOverlay").classList.add("hidden");
    requestAnimationFrame(loop);
  }
  function finishGame() {
    running=false;finished=true;lastResult={score:Math.max(0,Math.floor(score)),duration_seconds:duration,player_name:""};
    $("saveBtn").disabled=false;
    $("finishTitle").textContent="¡Carrera completada!";
    $("finishMessage").textContent="Puntaje: "+lastResult.score+" puntos. Registra tu nombre para compartir el récord.";
    $("finishOverlay").classList.remove("hidden");
    if(best===null||score>best){best=Math.floor(score);$("bestValue").textContent=best;}
    draw();
  }
  function collision(a,b) {
    return Math.abs(a.x-b.x)<(a.w+b.w)*.39 && Math.abs(a.y-b.y)<(a.h+b.h)*.38;
  }
  function loop(now) {
    if(!running)return;
    const dt=Math.min(2,(now-lastFrame)/16.67);lastFrame=now;
    elapsed=Math.min(duration,(now-startTime)/1000);
    laneOffset+=5.4*dt;
    const moveLeft=keys.ArrowLeft||keys.a||touchDirection<0, moveRight=keys.ArrowRight||keys.d||touchDirection>0;
    const dx=(moveRight?1:0)-(moveLeft?1:0);
    player.x+=dx*6.2*dt;player.x=Math.max(road.left+player.w*.7,Math.min(road.right-player.w*.7,player.x));
    player.tilt+=(dx*.12-player.tilt)*.18;
    speed=Math.round(145+Math.min(75,elapsed*1.4)+(dx?8:0));
    score+=Math.max(1,Math.floor(speed/35))*dt;
    spawnTimer+=dt;
    if(spawnTimer>Math.max(18,42-elapsed*.4)){spawnObstacle();spawnTimer=0;}
    obstacles.forEach(o=>o.y+=(o.speed+elapsed*.055)*dt);
    obstacles=obstacles.filter(o=>o.y<H+80);
    particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});particles=particles.filter(p=>p.life>0);
    if(invulnerable>0)invulnerable-=dt;
    for(const o of obstacles) {
      if(collision({x:player.x,y:player.y,w:player.w*.8,h:player.h*.8},o)&&invulnerable<=0) {
        score=Math.max(0,score-100);invulnerable=45;burst(player.x,player.y,"#ff4e88");
        o.y=H+100;
      }
    }
    $("timeValue").innerHTML=Math.max(0,duration-elapsed).toFixed(1)+'<span>s</span>';
    $("scoreValue").textContent=String(Math.floor(score)).padStart(4,"0");
    $("speedValue").innerHTML=speed+'<span> km/h</span>';
    $("progressText").textContent=Math.floor(elapsed/duration*100)+"%";
    $("progressBar").style.width=(elapsed/duration*100)+"%";
    draw();
    if(elapsed>=duration){finishGame();return;}
    requestAnimationFrame(loop);
  }

  async function loadLeaderboard() {
    const box=$("leaderboard");
    if(!cloudReady){box.innerHTML='<div class="empty-state">Conecta Supabase para guardar<br>y compartir récords reales.</div>';return;}
    try {
      const {data,error}=await db.from("racing_scores").select("id,player_name,score,created_at").order("score",{ascending:false}).order("created_at",{ascending:true}).limit(8);
      if(error)throw error;
      if(!data||!data.length){box.innerHTML='<div class="empty-state">Todavía no hay récords.<br>¡Sé el primero en la tabla!</div>';return;}
      box.innerHTML=data.map((r,i)=>'<div class="pilot-row"><div class="rank '+(i===0?'gold':'')+'">'+String(i+1).padStart(2,'0')+'</div><div><div class="pilot-name">'+escapeHtml(r.player_name)+'</div><div class="pilot-date">'+new Date(r.created_at).toLocaleDateString("es-EC",{day:"2-digit",month:"short"})+'</div></div><div class="pilot-score">'+Number(r.score).toLocaleString("es-EC")+'<small>PTS</small></div></div>').join("");
    } catch(e) {
      box.innerHTML='<div class="empty-state">No se pudo cargar la tabla.<br>Revisa la tabla y las políticas SQL.</div>';
      console.error(e);
    }
  }
  function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  async function saveScore(e) {
    e.preventDefault();
    if(!lastResult)return;
    const name=$("playerName").value.trim().replace(/\s+/g," ");
    if(name.length<2){$("saveMessage").textContent="Escribe un nombre de al menos 2 caracteres.";$("saveMessage").className="form-message error";return;}
    if(!cloudReady){$("saveMessage").textContent="Falta conectar Supabase. Edita config.js y configura la tabla según README.md.";$("saveMessage").className="form-message error";return;}
    $("saveBtn").disabled=true;$("saveMessage").textContent="Guardando récord...";$("saveMessage").className="form-message";
    try{
      const {error}=await db.from("racing_scores").insert({player_name:name,score:lastResult.score,duration_seconds:duration});
      if(error)throw error;
      $("saveMessage").textContent="¡Récord guardado! Ya aparece en la tabla compartida.";$("saveMessage").className="form-message success";
      $("playerName").value="";await loadLeaderboard();
    }catch(err){console.error(err);$("saveMessage").textContent="No se pudo guardar. Comprueba el SQL de Supabase y vuelve a intentar.";$("saveMessage").className="form-message error";$("saveBtn").disabled=false;}
  }

  document.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault();keys[e.key]=true;});
  document.addEventListener("keyup",e=>keys[e.key]=false);
  canvas.addEventListener("pointerdown",e=>{const r=canvas.getBoundingClientRect();touchDirection=(e.clientX-r.left<r.width/2)?-1:1;});
  canvas.addEventListener("pointerup",()=>touchDirection=0);canvas.addEventListener("pointerleave",()=>touchDirection=0);
  $("startBtn").addEventListener("click",startGame);$("againBtn").addEventListener("click",startGame);
  $("scoreForm").addEventListener("submit",saveScore);$("refreshBtn").addEventListener("click",loadLeaderboard);
  window.addEventListener("focus",()=>{if(cloudReady&&!running)loadLeaderboard();});
  initCloud();draw();
})();