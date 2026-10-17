import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { loadScript } from "../../lib/loadScript";
import type { Aula } from "../../lib/types";

interface Props {
  aula: Aula;
  onProgresso: (percentual: number, segundos: number) => void;
  onConcluida: () => void;
}

// Toca o vídeo pelo provedor configurado na aula (seção 7-8 do escopo:
// controles nativos do player + acompanhamento de progresso). YouTube e
// Vimeo usam as APIs oficiais deles via <script> (sem dependência extra no
// bundle); um link direto (.mp4 etc.) usa a tag <video> nativa.
export function VideoPlayer({ aula, onProgresso, onConcluida }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const concluidaRef = useRef(false);
  const onProgressoRef = useRef(onProgresso);
  const onConcluidaRef = useRef(onConcluida);
  onProgressoRef.current = onProgresso;
  onConcluidaRef.current = onConcluida;

  useEffect(() => { concluidaRef.current = false; }, [aula.id]);

  // controles próprios (YouTube/Vimeo): o player do provedor fica coberto por
  // uma camada transparente, assim o aluno não consegue clicar no título, no
  // logo ou em "Assistir no YouTube" e sair da plataforma.
  const [tocando, setTocando] = useState(false);
  const [mudo, setMudo] = useState(false);
  const [atual, setAtual] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const adaptadorRef = useRef<{ play: () => void; pause: () => void; recuar: () => void; mutar: (m: boolean) => void } | null>(null);

  // retoma do segundo exato em que o aluno parou (seção 21 do escopo) — só
  // faz sentido se ele já tinha assistido uma parte razoável
  const posicaoInicialRef = useRef(0);
  posicaoInicialRef.current = (aula.ultimaPosicaoSegundos || 0) > 5 ? aula.ultimaPosicaoSegundos! : 0;

  const reportar = (pct: number, seg: number) => {
    onProgressoRef.current(pct, seg);
    if (pct >= 100 && !concluidaRef.current) {
      concluidaRef.current = true;
      onConcluidaRef.current();
    }
  };

  useEffect(() => {
    let destruido = false;
    let intervalo: ReturnType<typeof setInterval> | undefined;
    let ytPlayer: any;
    let vimeoPlayer: any;

    async function montarYoutube() {
      await loadScript("https://www.youtube.com/iframe_api");
      const YT = await new Promise<any>((resolve) => {
        const w = window as any;
        if (w.YT?.Player) return resolve(w.YT);
        const anterior = w.onYouTubeIframeAPIReady;
        w.onYouTubeIframeAPIReady = () => { anterior?.(); resolve(w.YT); };
      });
      if (destruido || !containerRef.current) return;
      ytPlayer = new YT.Player(containerRef.current, {
        videoId: aula.videoId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          rel: 0, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, iv_load_policy: 3,
          playsinline: 1, start: Math.floor(posicaoInicialRef.current) || undefined,
        },
        events: {
          onStateChange: (e: any) => {
            setTocando(e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.ENDED) reportar(100, ytPlayer.getDuration());
          },
        },
      });
      adaptadorRef.current = {
        play: () => ytPlayer.playVideo?.(),
        pause: () => ytPlayer.pauseVideo?.(),
        recuar: () => ytPlayer.seekTo?.(Math.max(0, ytPlayer.getCurrentTime() - 10), true),
        mutar: (m) => (m ? ytPlayer.mute?.() : ytPlayer.unMute?.()),
      };
      intervalo = setInterval(() => {
        if (!ytPlayer?.getDuration) return;
        const duracao = ytPlayer.getDuration();
        const atual = ytPlayer.getCurrentTime();
        setAtual(atual); setDuracao(duracao);
        if (duracao > 0) reportar(Math.round((atual / duracao) * 100), Math.round(atual));
      }, 1000);
    }

    async function montarVimeo() {
      await loadScript("https://player.vimeo.com/api/player.js");
      if (destruido || !containerRef.current) return;
      const w = window as any;
      vimeoPlayer = new w.Vimeo.Player(containerRef.current, {
        id: aula.videoId, responsive: true, title: false, byline: false, portrait: false,
        controls: false, dnt: true, keyboard: false, pip: false,
      });
      adaptadorRef.current = {
        play: () => vimeoPlayer.play().catch(() => {}),
        pause: () => vimeoPlayer.pause().catch(() => {}),
        recuar: () => vimeoPlayer.getCurrentTime().then((t: number) => vimeoPlayer.setCurrentTime(Math.max(0, t - 10))).catch(() => {}),
        mutar: (m) => vimeoPlayer.setMuted(m).catch(() => {}),
      };
      vimeoPlayer.on("play", () => setTocando(true));
      vimeoPlayer.on("pause", () => setTocando(false));
      vimeoPlayer.on("ended", () => setTocando(false));
      if (posicaoInicialRef.current) vimeoPlayer.setCurrentTime(posicaoInicialRef.current).catch(() => {});
      vimeoPlayer.on("timeupdate", (data: { seconds: number; percent: number }) => {
        setAtual(data.seconds);
        setDuracao(data.percent > 0 ? data.seconds / data.percent : 0);
        reportar(Math.round(data.percent * 100), Math.round(data.seconds));
      });
      vimeoPlayer.on("ended", (data: { seconds: number }) => reportar(100, Math.round(data.seconds)));
    }

    if (aula.provedorVideo === "YOUTUBE" && aula.videoId) montarYoutube();
    if (aula.provedorVideo === "VIMEO" && aula.videoId) montarVimeo();

    return () => {
      destruido = true;
      if (intervalo) clearInterval(intervalo);
      try { ytPlayer?.destroy?.(); } catch { /* noop */ }
      try { vimeoPlayer?.destroy?.(); } catch { /* noop */ }
    };
  }, [aula.id, aula.provedorVideo, aula.videoId]);

  if (aula.provedorVideo === "URL" && aula.videoUrl) {
    return (
      <video
        ref={videoRef}
        src={aula.videoUrl}
        controls
        className="aspect-video w-full rounded-[var(--radius-card-lg)] bg-black"
        onLoadedMetadata={(e) => {
          if (posicaoInicialRef.current) e.currentTarget.currentTime = posicaoInicialRef.current;
        }}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration > 0) reportar(Math.round((v.currentTime / v.duration) * 100), Math.round(v.currentTime));
        }}
        onEnded={(e) => reportar(100, Math.round(e.currentTarget.duration))}
      />
    );
  }

  if ((aula.provedorVideo === "YOUTUBE" || aula.provedorVideo === "VIMEO") && aula.videoId) {
    const alternarPlay = () => (tocando ? adaptadorRef.current?.pause() : adaptadorRef.current?.play());
    const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    const pct = duracao > 0 ? Math.min(100, (atual / duracao) * 100) : 0;
    return (
      <div>
        <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-card-lg)] bg-black [&_iframe]:h-full [&_iframe]:w-full">
          <div ref={containerRef} className="h-full w-full" />
          {/* camada que bloqueia qualquer clique no player do provedor */}
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={alternarPlay}
            onContextMenu={(e) => e.preventDefault()}
          >
            {!tocando && (
              <div className="flex h-full w-full items-center justify-center bg-black/30">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-[var(--color-green-dark)]"><Play size={28} /></span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-3 rounded-[var(--radius-btn)] bg-[var(--color-gray-subtle)] px-3 py-2 text-xs font-semibold text-[var(--color-gray-dark)]">
          <button onClick={alternarPlay} aria-label={tocando ? "Pausar" : "Reproduzir"} className="hover:text-[var(--color-green)]">
            {tocando ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={() => adaptadorRef.current?.recuar()} aria-label="Voltar 10 segundos" className="hover:text-[var(--color-green)]"><RotateCcw size={16} /></button>
          <span className="tabular-nums">{fmt(atual)} / {fmt(duracao)}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-gray-light)]">
            <div className="h-full bg-[var(--color-green)]" style={{ width: `${pct}%` }} />
          </div>
          <button
            onClick={() => { adaptadorRef.current?.mutar(!mudo); setMudo(!mudo); }}
            aria-label={mudo ? "Ativar som" : "Silenciar"}
            className="hover:text-[var(--color-green)]"
          >
            {mudo ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-[var(--radius-card-lg)] bg-[var(--color-gray-light)] text-sm text-[var(--color-gray-mid)]">
      Vídeo ainda não cadastrado para esta aula.
    </div>
  );
}
