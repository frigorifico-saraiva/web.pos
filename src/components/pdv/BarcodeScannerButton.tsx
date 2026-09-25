"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Barcode } from "lucide-react";
import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";
import { NotFoundException, Result } from "@zxing/library";

type Props = {
  onDetected: (code: string) => Promise<boolean> | boolean;
};

const DUPLICATE_SCAN_COOLDOWN_MS = 3000;

export function BarcodeScannerButton({ onDetected }: Props) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState("");
  const [scanFeedback, setScanFeedback] = useState("");

  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const lastScanRef = useRef<{ text: string; at: number } | null>(null);
  const isProcessingRef = useRef(false);
  const onDetectedRef = useRef(onDetected);

  useEffect(() => {
    onDetectedRef.current = onDetected;
  }, [onDetected]);

  const playTone = useCallback((kind: "success" | "error") => {
    const AudioCtx =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioCtx) return;

    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = kind === "success" ? 880 : 220;

    gainNode.gain.setValueAtTime(0.0001, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.15,
      context.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.18,
    );

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.2);

    oscillator.onended = () => {
      void context.close();
    };
  }, []);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;

    readerRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    isProcessingRef.current = false;
    setIsActive(false);
  }, []);

  const startScanner = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Leitura por câmera não é suportada.");
      return;
    }

    if (!videoRef.current) {
      setError("Elemento de vídeo não encontrado.");
      return;
    }

    try {
      setError("");
      setScanFeedback("Posicione o código de barras na câmera.");

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      controlsRef.current = await reader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
          },
        },
        videoRef.current,
        async (result: Result | undefined, err) => {
          if (err && !(err instanceof NotFoundException)) {
            setError("Não foi possível ler o código agora.");
            return;
          }

          if (!result || isProcessingRef.current) {
            return;
          }

          const text = result.getText().trim();

          if (!text) {
            return;
          }

          const now = Date.now();
          const lastScan = lastScanRef.current;

          if (
            lastScan &&
            lastScan.text === text &&
            now - lastScan.at < DUPLICATE_SCAN_COOLDOWN_MS
          ) {
            return;
          }

          lastScanRef.current = {
            text,
            at: now,
          };

          isProcessingRef.current = true;

          try {
            const wasRead = await onDetectedRef.current(text);

            if (wasRead) {
              setScanFeedback("Código lido com sucesso.");
              playTone("success");
            } else {
              setScanFeedback("Código lido, mas não encontrado.");
              playTone("error");
            }
          } finally {
            isProcessingRef.current = false;
          }
        },
      );

      setIsActive(true);
    } catch {
      stopScanner();
      setError("Permita o acesso à câmera para usar o leitor.");
    }
  }, [playTone, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const toggleScanner = useCallback(() => {
    if (isActive) {
      stopScanner();
      return;
    }

    void startScanner();
  }, [isActive, startScanner, stopScanner]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={toggleScanner}
          className={`flex h-6 w-6 items-center justify-center border transition-colors ${
            isActive
              ? "border-black bg-black text-white"
              : "border-primary text-primary"
          }`}
          aria-pressed={isActive}
          aria-label={
            isActive
              ? "desativar leitor de código"
              : "ativar leitor de código"
          }
        >
          <Barcode size={16} />
        </button>

        {error && <p className="text-xs text-red-500">{error}</p>}

        {!error && scanFeedback && (
          <p className="text-xs text-tertiary">{scanFeedback}</p>
        )}
      </div>

      <video
        ref={videoRef}
        className={
          isActive ? "w-full aspect-video object-cover" : "hidden"
        }
        autoPlay
        muted
        playsInline
      />
    </div>
  );
}
