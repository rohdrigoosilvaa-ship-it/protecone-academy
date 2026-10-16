import { useEffect, useRef } from "react";
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
        playerVars: { rel: 0, start: Math.floor(posicaoInicialRef.current) || undefined },
        events: {
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.ENDED) reportar(100, ytPlayer.getDuration());
          },
        },
      });
      intervalo = setInterval(() => {
        if (!ytPlayer?.getDuration) return;
        const duracao = ytPlayer.getDuration();
        const atual = ytPlayer.getCurrentTime();
        if (duracao > 0) reportar(Math.round((atual / duracao) * 100), Math.round(atual));
      }, 4000);
    }

    async function montarVimeo() {
      await loadScript("https://player.vimeo.com/api/player.js");
      if (destruido || !containerRef.current) return;
      const w = window as any;
      vimeoPlayer = new w.Vimeo.Player(containerRef.current, { id: aula.videoId, responsive: true });
      if (posicaoInicialRef.current) vimeoPlayer.setCurrentTime(posicaoInicialRef.current).catch(() => {});
      vimeoPlayer.on("timeupdate", (data: { seconds: number; percent: number }) => {
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
    return <div ref={containerRef} className="aspect-video w-full overflow-hidden rounded-[var(--radius-card-lg)] bg-black" />;
  }

  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-[var(--radius-card-lg)] bg-[var(--color-gray-light)] text-sm text-[var(--color-gray-mid)]">
      Vídeo ainda não cadastrado para esta aula.
    </div>
  );
}
