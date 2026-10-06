import { useCallback, useEffect, useState } from 'react';
import { apiRequest, describeApiError } from './api-client';
import type { ApiErrorInfo, RuntimeServerStatus, SystemRuntimes } from '../types';

/**
 * Status "Runtime Server" untuk indikator UI.
 * Deteksi runtime dilakukan di server secara lazy saat /api/runtimes dipanggil.
 */
export function useRuntimeServer(enabled: boolean) {
  const [status, setStatus] = useState<RuntimeServerStatus>('checking');
  const [runtimes, setRuntimes] = useState<SystemRuntimes | null>(null);
  const [error, setError] = useState<ApiErrorInfo | null>(null);

  const refresh = useCallback(async () => {
    setStatus('checking');
    try {
      const data = await apiRequest<SystemRuntimes>('/api/runtimes', { timeoutMs: 20000 });
      setRuntimes(data);
      setError(null);
      setStatus(data.server?.status ?? 'limited');
    } catch (err) {
      setRuntimes(null);
      setError(describeApiError(err));
      setStatus('unavailable');
    }
  }, []);

  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  return { status, runtimes, error, refresh };
}
