"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useTransition,
  useRef,
  useMemo,
  useSyncExternalStore,
} from "react";
import { TopBar } from "./TopBar";
import { DialogueBox } from "./DialogueBox";
import { CharacterStage } from "./CharacterStage";
import { ChoiceOverlay } from "./ChoiceOverlay";
import { OrientationGuard } from "./OrientationGuard";
import { Button } from "@/components/ui/Button";
import { MOCK_STORY, INITIAL_SCENE_KEY } from "@/data/mockStory";
import { SceneData, SaveData } from "@/types/vn";
import Image from "next/image";

const STORAGE_KEY = "armonia_saved_games";

const subscribeToStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getSavedGamesSnapshot = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const getServerSnapshot = (): string | null => null;

export const VisualNovelStage: React.FC = () => {
  const [currentKey, setCurrentKey] = useState<string>(INITIAL_SCENE_KEY);
  const [history, setHistory] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [, startTransition] = useTransition();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const savedGamesRaw = useSyncExternalStore(
    subscribeToStorage,
    getSavedGamesSnapshot,
    getServerSnapshot,
  );

  const hasSaveData: SaveData | null = useMemo(() => {
    if (!savedGamesRaw) return null;
    try {
      const parsed = JSON.parse(savedGamesRaw) as (SaveData | null)[];
      return parsed.find((s) => s !== null) || null;
    } catch (e) {
      console.error("Error checking saved games", e);
      return null;
    }
  }, [savedGamesRaw]);

  const currentScene: SceneData =
    MOCK_STORY[currentKey] || MOCK_STORY[INITIAL_SCENE_KEY];

  // Audio setup (BGM)
  useEffect(() => {
    // Inicializar audio de fondo suave
    const audio = new Audio(
      "https://cdn.freesound.org/previews/612/612613_5674468-lq.mp3",
    );
    audio.loop = true;
    audio.volume = 0.35;
    audioRef.current = audio;

    const unlockAudio = () => {
      audio.play().catch(() => {
        // El navegador espera interacción del usuario
      });
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      audio.pause();
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.35;
    }
  }, [isMuted]);

  // Preload next scene assets
  useEffect(() => {
    if (typeof window === "undefined") return;

    const nextKey = currentScene.nextSceneKey;
    if (nextKey && MOCK_STORY[nextKey]?.backgroundUrl) {
      const img = new window.Image();
      img.src = MOCK_STORY[nextKey].backgroundUrl!;
    }
    if (currentScene.choices) {
      currentScene.choices.forEach((c) => {
        const target = MOCK_STORY[c.targetSceneKey];
        if (target?.backgroundUrl) {
          const img = new window.Image();
          img.src = target.backgroundUrl;
        }
      });
    }
  }, [currentScene]);

  const [showNewGameConfirm, setShowNewGameConfirm] = useState(false);

  // Clear save and restart to chapter 1
  const handleStartNewGame = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Error clearing save", e);
    }
    setShowNewGameConfirm(false);
    setHistory([]);
    setCurrentKey(
      MOCK_STORY[INITIAL_SCENE_KEY]?.nextSceneKey || "hab_daniel_01",
    );
  };

  // Advance linearly or return to home upon reaching end
  const handleAdvance = useCallback(() => {
    if (currentScene.navigationType === "choice") {
      return;
    }

    // Si es el final de la historia (ch1_ending o navigationType: 'end')
    if (currentScene.navigationType === "end" || !currentScene.nextSceneKey) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        console.error("Error clearing save on finish", e);
      }
      setHistory([]);
      setCurrentKey(INITIAL_SCENE_KEY);
      return;
    }

    if (currentScene.nextSceneKey && MOCK_STORY[currentScene.nextSceneKey]) {
      startTransition(() => {
        setHistory((prev) => [...prev, currentKey]);
        setCurrentKey(currentScene.nextSceneKey!);
      });
    }
  }, [currentScene, currentKey]);

  // Go back
  const handleBack = () => {
    if (history.length === 0) return;
    const prevKey = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentKey(prevKey);
  };

  // Branch choice selected
  const handleSelectChoice = (targetKey: string) => {
    if (MOCK_STORY[targetKey]) {
      startTransition(() => {
        setHistory((prev) => [...prev, currentKey]);
        setCurrentKey(targetKey);
      });
    }
  };

  // Restart story without clearing save
  const handleRestart = () => {
    setHistory([]);
    setCurrentKey(INITIAL_SCENE_KEY);
  };

  // Load saved scene
  const handleLoadSave = (savedSceneKey: string) => {
    if (MOCK_STORY[savedSceneKey]) {
      setCurrentKey(savedSceneKey);
    }
  };

  const isCover = currentKey === "cover";
  const isTitleCard =
    currentKey.endsWith("_title") ||
    currentKey.includes("title") ||
    currentKey.endsWith("_ending") ||
    currentKey.includes("ending");
  const isDocument = Boolean(
    currentScene.documentText || currentScene.overlayImage,
  );

  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Guardado directo en 1 sola ranura (Single Slot Save)
  const handleQuickSave = () => {
    try {
      const saveData: SaveData = {
        slotId: 1,
        timestamp: new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sceneKey: currentKey,
        sceneTitle: currentScene.sceneTitle || "Escena actual",
        chapterTitle: currentScene.chapterTitle || "Capítulo 1",
        previewText: currentScene.dialogueText || currentScene.sceneTitle || "",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify([saveData]));
      setSaveToast("Partida guardada correctamente");
      setTimeout(() => setSaveToast(null), 2500);
    } catch (e) {
      console.error("Error al guardar partida", e);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans select-none">
      <OrientationGuard />

      {/* Main Viewport Stage Container - Estricto 16:9 que escala perfectamente dentro de cualquier pantalla */}
      <div className="relative w-full aspect-video max-w-[177.78vh] max-h-screen overflow-hidden bg-black shadow-2xl flex flex-col justify-between">
        {/* Top Navigation Bar: Oculta completamente en la portada (isCover) */}
        {!isCover && (
          <TopBar
            sceneTitle={currentScene.sceneTitle}
            chapterTitle={currentScene.chapterTitle}
            onHome={handleRestart}
            onSave={handleQuickSave}
            onBack={handleBack}
            onNext={handleAdvance}
            canGoBack={history.length > 0}
            canGoNext={
              currentScene.navigationType === "linear" &&
              Boolean(currentScene.nextSceneKey)
            }
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            variant={isTitleCard ? "minimal" : "default"}
          />
        )}

        {/* Notificación Toast sutil de Partida Guardada */}
        {saveToast && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-white/30 text-white text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Scene Background Layer - Confinado 100% al interior del canvas 16:9 */}
        <div
          className="absolute inset-0 z-0 overflow-hidden bg-black pointer-events-none"
          style={{ position: "absolute" }}
        >
          {currentScene.backgroundUrl && (
            <Image
              src={currentScene.backgroundUrl}
              alt={currentScene.sceneTitle || "Fondo de escena"}
              fill
              priority={isCover || isTitleCard}
              sizes="(max-width: 1920px) 100vw, 1920px"
              className="object-cover object-center select-none"
            />
          )}
          {/* Sutil viñeta ambiental no invasiva */}
          {!isCover && !isTitleCard && (
            <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_60%,rgba(0,0,0,0.4)_100%]" />
          )}

          {/* Tinte azul exclusivo para escenas con opciones (Choice) - Jamás escapa del canvas 16:9 */}
          {currentScene.navigationType === "choice" && (
            <div className="absolute inset-0 bg-[#11616F]/40 pointer-events-none transition-opacity duration-300" />
          )}
        </div>

        {/* COVER / TITLE SCREEN (Screenshot 1) */}
        {isCover && (
          <div className="absolute inset-0 z-30 flex flex-col  justify-center p-8 select-none pointer-events-auto">
            <div className="flex flex-col items-center justify-center max-w-xl">
              {/* Logo Beige Original Estático */}
              <div className="w-[300px] sm:w-[380px] md:w-[440px]">
                <Image
                  src="/assets/logo-beige.png"
                  alt="El Mundo de Armonía"
                  width={1077}
                  height={541}
                  priority
                  className="w-full h-auto max-w-full object-contain pointer-events-none select-none drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] block"
                />
              </div>

              {/* Acciones principales: Botón mutante dinámico (Opción A) */}
              <div className="flex flex-col items-center justify-center gap-2.5 mt-5">
                {hasSaveData ? (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleLoadSave(hasSaveData.sceneKey)}
                    >
                      Continuar
                    </Button>
                    <button
                      onClick={() => setShowNewGameConfirm(true)}
                      className="text-xs text-neutral-900 font-bold hover:text-neutral-400 transition-colors underline cursor-pointer mt-1 tracking-wide"
                    >
                      Nueva partida
                    </button>
                  </>
                ) : (
                  <Button variant="primary" size="md" onClick={handleAdvance}>
                    Jugar
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación para Nueva Partida */}
        {showNewGameConfirm && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-white/20 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-lg font-bold text-white mb-2 font-sans">
                ¿Comenzar nueva partida?
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-sans">
                Se perderá tu progreso guardado actual.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewGameConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartNewGame}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* CHAPTER TITLE CARD (Portada Demo ilustrada) */}
        {isTitleCard && (
          <div
            onClick={handleAdvance}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center p-8 select-none cursor-pointer"
          >
            <div className="text-center select-none flex flex-col items-center justify-center pointer-events-auto">
              {Boolean(currentScene.chapterTitle?.trim()) && (
                <p className="text-white text-lg sm:text-xl md:text-2xl font-title-serif font-normal tracking-wide text-neutral-100 mb-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] capitalize">
                  {currentScene.chapterTitle.trim().toLowerCase()}
                </p>
              )}
              <h2 className="text-3xl sm:text-4xl md:text-5xl text-white font-title-script font-normal tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {currentScene.sceneTitle}
              </h2>
            </div>
          </div>
        )}

        {/* DOCUMENT / PERGAMINO LAYER */}
        {isDocument && (
          <div
            onClick={handleAdvance}
            className="absolute inset-0 z-25 flex items-center justify-center select-none cursor-pointer pointer-events-auto"
          >
            {/* Contenedor relativo exacto 16:9 alineado al fondo */}
            <div className="relative w-full h-full flex items-center">
              {/* Bloque de texto centrado en el pergamino con interlineado y separación de párrafos calibrados */}
              {currentScene.documentText && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[74%] sm:w-[68%] md:w-[60%] lg:w-[54%] max-w-2xl pr-4 sm:pr-8 md:pr-12 pt-1 pb-4">
                    {currentScene.documentFont === "serif" ? (
                      <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3 text-left">
                        {currentScene.documentText
                          .split(/\n\s*\n/)
                          .map((paragraph, idx) => (
                            <p
                              key={idx}
                              className="font-title-serif text-xs sm:text-[13px] md:text-[14px] lg:text-[15px] leading-snug sm:leading-normal md:leading-relaxed text-[#1f1712] font-medium select-none"
                            >
                              {paragraph.trim()}
                            </p>
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-3.5 text-center">
                        {currentScene.documentText
                          .split(/\n\s*\n/)
                          .map((paragraph, idx) => (
                            <p
                              key={idx}
                              className="font-title-script text-base sm:text-lg md:text-xl lg:text-[23px] leading-snug sm:leading-normal md:leading-relaxed text-[#1a120c] font-normal select-none"
                            >
                              {paragraph.trim()}
                            </p>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHARACTER SPRITES STAGE */}
        {!isCover && !isTitleCard && !isDocument && (
          <CharacterStage characters={currentScene.characters} />
        )}

        {/* DIALOGUE BOX */}
        {!isCover &&
          !isTitleCard &&
          !isDocument &&
          (Boolean(currentScene.dialogueText) ||
            Boolean(currentScene.speakerName)) && (
            <DialogueBox
              speakerName={currentScene.speakerName}
              speakerStatus={currentScene.speakerStatus}
              dialogueText={currentScene.dialogueText || ""}
              onAdvance={handleAdvance}
              disabled={currentScene.navigationType === "choice"}
              hasCharacter={Boolean(
                currentScene.characters && currentScene.characters.length > 0,
              )}
            />
          )}

        {/* BRANCHING CHOICES OVERLAY */}
        {currentScene.navigationType === "choice" && currentScene.choices && (
          <ChoiceOverlay
            choices={currentScene.choices}
            onSelectChoice={handleSelectChoice}
          />
        )}
      </div>
    </div>
  );
};
