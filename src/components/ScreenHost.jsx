"use client";
import { useRouter } from "next/navigation";
import { useSetScreen, useNav } from "../lib/nav";

export default function ScreenHost({ Screen }) {
  const setScreen = useSetScreen();
  const router = useRouter();
  const { setConnected } = useNav();
  return (
    <Screen
      setScreen={setScreen}
      onConnect={() => setConnected(true)}
      go={(path) => router.push(path)}
    />
  );
}
