import { useEffect, useMemo, useState } from 'react';
import type { Stage } from '../data/stages';
import { useAuth } from '../auth/AuthProvider';

const API_URL = import.meta.env.VITE_API_URL;

export default function PlaylistPage() {
  const { user, loading: authLoading } = useAuth();
  const [stages, setStages] = useState<Stage[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ 메인 재생 무대
  const [playingStage, setPlayingStage] = useState<Stage | null>(null);

  // 전체 무대 로딩
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetch(`${API_URL}/stages`);
        const data = await res.json();
        setStages(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load stages', e);
        setStages([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchStages();
  }, []);

  // 좋아요 로딩
  useEffect(() => {
    const fetchFavorites = async () => {
      if (authLoading) return;

      if (!user) {
        try {
          const raw = localStorage.getItem('favoriteStageIds');
          const parsed = raw ? JSON.parse(raw) : [];
          setFavoriteIds(Array.isArray(parsed) ? parsed : []);
        } catch {
          setFavoriteIds([]);
        }
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/me/likes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          console.error(await res.text());
          return;
        }

        const likedStages: Stage[] = await res.json();
        setFavoriteIds(likedStages.map((s) => s.id));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };

    void fetchFavorites();
  }, [user, authLoading]);

  const favoriteStages = useMemo(
    () => stages.filter((s) => favoriteIds.includes(s.id)),
    [stages, favoriteIds]
  );

  // ✅ 최초 진입 시: 플레이리스트 첫 곡 자동 선택
  useEffect(() => {
    if (playingStage) return;
    if (favoriteStages.length > 0) setPlayingStage(favoriteStages[0]);
  }, [favoriteStages, playingStage]);

  // ✅ 현재 재생이 플레이리스트에서 빠지면 교체/해제
  useEffect(() => {
    if (!playingStage) return;
    const stillExists = favoriteIds.includes(playingStage.id);
    if (!stillExists) {
      const next = favoriteStages[0] ?? null;
      setPlayingStage(next);
    }
  }, [favoriteIds, favoriteStages, playingStage]);

  // 좋아요 토글(사이드바에서 제거)
  const handleToggleFavorite = async (stage: Stage) => {
    if (!user) {
      setFavoriteIds((prev) => {
        const next = prev.includes(stage.id)
          ? prev.filter((id) => id !== stage.id)
          : [...prev, stage.id];
        localStorage.setItem('favoriteStageIds', JSON.stringify(next));
        return next;
      });
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/me/likes/${stage.id}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Failed to toggle favorite', await res.text());
        return;
      }

      const result: { liked: boolean } = await res.json();
      setFavoriteIds((prev) =>
        result.liked
          ? prev.includes(stage.id)
            ? prev
            : [...prev, stage.id]
          : prev.filter((id) => id !== stage.id)
      );
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-400">불러오는 중...</div>;
  }

  if (favoriteStages.length === 0) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-3">내 플레이리스트</h2>
        <p className="text-gray-400">저장된 무대가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold">내 플레이리스트</h2>
        <p className="text-xs text-gray-400">
          {favoriteStages.length}개 저장됨
        </p>
      </div>

      {/* ✅ 메인(재생) + 사이드바(목록)
         - 모바일: 세로 스택
         - sm 이상: 가로 2컬럼 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 메인 재생 화면 */}
        <section className="flex-1 min-w-0">
          {playingStage && (
            <div className="p-4 border border-white/10 rounded-2xl bg-neutral-900">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold truncate">
                    {playingStage.artist} - {playingStage.title}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {playingStage.generation} · {playingStage.mood} · {playingStage.gender}
                  </div>
                </div>

                <button
                  onClick={() => handleToggleFavorite(playingStage)}
                  className="text-xs px-3 py-1 rounded-full border border-white/20 hover:bg-white/10"
                >
                  제거
                </button>
              </div>

              <div className="relative pt-[56.25%] mt-3 rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${playingStage.youtubeId}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={playingStage.title}
                />
              </div>
            </div>
          )}
        </section>

        {/* 사이드바: 플레이리스트 */}
        <aside className="sm:w-72 shrink-0">
          <div className="p-3 rounded-2xl border border-white/10 bg-neutral-900">
            <div className="text-sm font-semibold mb-2 text-gray-200">
              플레이리스트
            </div>

            <div className="space-y-2 max-h-[60vh] sm:max-h-[70vh] overflow-auto pr-1">
              {favoriteStages.map((s) => {
                const active = playingStage?.id === s.id;
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl p-2 border ${
                      active
                        ? 'border-pink-500/60 bg-pink-500/10'
                        : 'border-white/10 bg-neutral-800'
                    }`}
                  >
                    <button
                      onClick={() => setPlayingStage(s)}
                      className="w-full text-left"
                    >
                      <div className="text-sm font-medium truncate">
                        {s.artist} - {s.title}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        {s.generation} · {s.mood} · {s.gender}
                      </div>
                    </button>

                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleToggleFavorite(s)}
                        className="text-[11px] px-2 py-1 rounded-full border border-white/15 hover:bg-white/10"
                      >
                        제거
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}