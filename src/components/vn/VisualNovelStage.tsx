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
import { SaveModal } from "./SaveModal";
import { OrientationGuard } from "./OrientationGuard";
import { Button } from "@/components/ui/Button";
import { MOCK_STORY, INITIAL_SCENE_KEY } from "@/data/mockStory";
import { SceneData, SaveData } from "@/types/vn";
import { Play } from "lucide-react";
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
  const [isSaveOpen, setIsSaveOpen] = useState(false);
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

  // Advance linearly
  const handleAdvance = useCallback(() => {
    if (currentScene.navigationType === "choice") {
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

  // Restart story
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

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans">
      <OrientationGuard />

      {/* Main Viewport Stage Container */}
      <div className="relative w-full h-full max-w-[1920px] overflow-hidden bg-neutral-950 shadow-2xl">
        {/* Top Navigation Bar */}
        <TopBar
          sceneTitle={currentScene.sceneTitle}
          chapterTitle={currentScene.chapterTitle}
          onHome={handleRestart}
          onSave={() => setIsSaveOpen(true)}
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

        {/* Scene Background Layer */}
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
              className="object-contain object-center select-none"
            />
          )}
          {/* Sutil viñeta ambiental no invasiva */}
          {!isCover && !isTitleCard && (
            <div className="absolute inset-0 bg-radial-[circle_at_center,transparent_60%,rgba(0,0,0,0.4)_100%]" />
          )}

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

              {/* Acciones principales con el componente Button reutilizable */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                <Button variant="primary" size="md" onClick={handleAdvance}>
                  Jugar
                </Button>

                {hasSaveData && (
                  <Button
                    variant="glass"
                    size="md"
                    onClick={() => handleLoadSave(hasSaveData.sceneKey)}
                    icon={
                      <Play className="w-3.5 h-3.5 text-amber-300 fill-current" />
                    }
                  >
                    Continuar
                  </Button>
                )}
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
              {Boolean(currentScene.chapterTitle) && (
                <p className="text-white text-lg sm:text-xl md:text-2xl font-title-serif font-normal tracking-wide text-neutral-100 mb-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] capitalize">
                  {currentScene.chapterTitle.toLowerCase()}
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
            className="absolute inset-0 z-25 flex items-center justify-center p-4 md:p-8 select-none cursor-pointer pointer-events-auto"
          >
            {/* Contenedor relativo proporcional al pergamino */}
            <div className="relative w-full max-w-[1240px] aspect-[16/9] flex items-center justify-center">
              {/* Texto manuscrito del pergamino */}
              {currentScene.documentText && (
                <div className="max-w-xl self-center text-center">
                  <p className="font-title-script text-base sm:text-xl md:text-2xl lg:text-[29px] leading-relaxed text-[#21140e] drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)] font-semibold select-none whitespace-pre-line">
                    {currentScene.documentText}
                  </p>
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

        {/* SAVE / LOAD MODAL */}
        <SaveModal
          isOpen={isSaveOpen}
          onClose={() => setIsSaveOpen(false)}
          currentScene={currentScene}
          onLoadSave={handleLoadSave}
        />
      </div>
    </div>
  );
};
