import { useCallback, useEffect, useRef } from 'react';
import { createAudioPlayer } from 'expo-audio';

const serializeConfig = (config) =>
  [
    config?.volume,
    config?.loop,
    config?.updateInterval,
    config?.downloadFirst,
    config?.keepAudioSessionActive,
  ]
    .map((value) => (value === undefined ? '' : String(value)))
    .join('|');

export function useSoundEffect(source, config = {}) {
  const ref = useRef(null);
  const key = serializeConfig(config);

  useEffect(() => {
    if (!source) return undefined;
    const player = createAudioPlayer(source, {
      updateInterval: config.updateInterval,
      downloadFirst: config.downloadFirst,
      keepAudioSessionActive: config.keepAudioSessionActive,
    });
    if (typeof config.volume === 'number') {
      player.volume = config.volume;
    }
    if (typeof config.loop === 'boolean') {
      player.loop = config.loop;
    }
    ref.current = player;
    return () => {
      player.remove();
      ref.current = null;
    };
  }, [source, key]);

  const play = useCallback(() => {
    const player = ref.current;
    if (!player) return;
    player.pause();
    const playFromStart = () => {
      try {
        player.play();
      } catch {
        // ignore playback errors
      }
    };
    player.seekTo(0).then(playFromStart).catch(playFromStart);
  }, []);
  play.getPlayer = () => ref.current;
  return play;
}
