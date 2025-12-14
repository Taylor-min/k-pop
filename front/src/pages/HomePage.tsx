import { useMemo, useState, useEffect } from 'react';
import type { Generation, Mood, Stage, Gender } from '../data/stages';
import { useAuth } from '../auth/AuthProvider';
import BottomNav from '../components/BottomNav';
import { Link } from "react-router-dom";
import { LogIn, LogOut } from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

function getRandomItem<T>(list: T[]): T | null {
  if (!list.length) return null;
  const idx = Math.floor(Math.random() * list.length);
  return list[idx];
}

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<Mood | ''>('');
  const [selectedGen, setSelectedGen] = useState<Generation | ''>('');
  const [selectedGender, setSelectedGender] = useState<Gender | ''>('');
  const [pickedStage, setPickedStage] = useState<Stage | null>(null);
  const [noResult, setNoResult] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading, login, logout } = useAuth();


  // 전체 무대 로딩
  useEffect(() => {
    const fetchStages = async () => {
      try {
        const res = await fetch(`${API_URL}/stages`);
        const data = await res.json();
        setStages(data);
      } catch (e) {
        console.error('Failed to load stages:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  // 로그인한 유저의 좋아요 목록을 백엔드에서 불러오기
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteIds([]);
        return;
      }

      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_URL}/me/likes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error('Failed to load favorites', await res.text());
          return;
        }

        const likedStages: Stage[] = await res.json();
        setFavoriteIds(likedStages.map((s) => s.id));
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    };

    if (!authLoading) {
      void fetchFavorites();
    }
  }, [user, authLoading]);

  const favoriteStages = useMemo(
    () => stages.filter((s) => favoriteIds.includes(s.id)),
    [stages, favoriteIds]
  );

  const handleToggleFavorite = async (stage: Stage) => {
    if (!user) {
      alert('로그인 후 사용할 수 있어요!');
      return;
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${API_URL}/me/likes/${stage.id}/toggle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  const isFavorite = pickedStage ? favoriteIds.includes(pickedStage.id) : false;

  const filteredList = useMemo(() => {
    return stages.filter((s) => {
      if (selectedMood && s.mood !== selectedMood) return false;
      if (selectedGen && s.generation !== selectedGen) return false;
      if (selectedGender && s.gender !== selectedGender) return false;
      return true;
    });
  }, [stages, selectedMood, selectedGen, selectedGender]);

  const handlePick = () => {
    if (!filteredList.length) {
      setPickedStage(null);
      setNoResult(true);
      return;
    }

    const result = getRandomItem(filteredList);
    setPickedStage(result);
    setNoResult(false);
  };

  const stageTags = pickedStage
    ? (pickedStage as any).tags ?? (pickedStage as any).tagsJson ?? []
    : [];

  const preview = favoriteStages.slice(0, 5);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white flex justify-center pb-20">
        <div className="w-full max-w-md px-4 py-6 sm:py-10">
          <div className="text-sm text-gray-400">무대 불러오는 중...</div>
        </div>
        <BottomNav />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white flex justify-center pb-20">
      <div className="w-full max-w-md px-4 py-6 sm:py-10">
        {/* 상단 헤더 */}
        <header className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">오늘의 아이돌 무대</h1>

          {authLoading ? (
            <span className="text-xs text-gray-400">loading...</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              {user.photoURL && (
                <img src={user.photoURL} className="w-8 h-8 rounded-full" />
              )}
              <button
                onClick={logout}
                className="text-xs bg-white/10 px-3 py-1 rounded-full"
              >
            <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="text-xs bg-pink-500 px-3 py-1 rounded-full"
            >
      <LogIn size={18} />
            </button>
          )}
        </header>

        <main className="space-y-5">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* 기분 */}
            <div className="flex flex-col w-40">
              <label className="text-sm font-semibold mb-1">오늘 기분</label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value as Mood | '')}
                className="border border-white/10 bg-neutral-800 text-sm p-2 rounded-md"
              >
                <option value="">상관없음</option>
                <option value="신남">신남</option>
                <option value="감성">감성</option>
                <option value="파워풀">파워풀</option>
                <option value="치유">치유</option>
              </select>
            </div>

            {/* 세대 */}
            <div className="flex flex-col w-40">
              <label className="text-sm font-semibold mb-1">
                보고 싶은 세대
              </label>
              <select
                value={selectedGen}
                onChange={(e) => setSelectedGen(e.target.value as Generation | '')}
                className="border border-white/10 bg-neutral-800 text-sm p-2 rounded-md"
              >
                <option value="">상관없음</option>
                <option value="2세대">2세대</option>
                <option value="3세대">3세대</option>
                <option value="4세대">4세대</option>
                <option value="5세대">5세대</option>
              </select>
            </div>

            {/* 성별 */}
            <div className="flex flex-col w-40">
              <label className="text-sm font-semibold mb-1">성별</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value as Gender | '')}
                className="border border-white/10 bg-neutral-800 text-sm p-2 rounded-md"
              >
                <option value="">상관없음</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
                <option value="혼성">혼성</option>
              </select>
            </div>
          </div>

          <button
            onClick={handlePick}
            className="bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-200 transition mb-2"
          >
            오늘의 무대 추천 받기 🔮
          </button>

          {noResult && (
            <p className="text-xs text-red-400 mb-2">
              선택한 조건에 맞는 무대가 없어요. 필터를 조금 풀어볼까?
            </p>
          )}

          <p className="text-xs text-gray-500 mb-4">
            필터에 맞는 무대가 없으면 전체 리스트에서 랜덤으로 추천해줄게!
          </p>

          {pickedStage && (
            <div className="mt-6 p-4 border border-white/10 rounded-xl bg-neutral-800">
              <h2 className="text-xl font-bold">
                {pickedStage.artist} - {pickedStage.title}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {pickedStage.generation} · {pickedStage.mood} · {pickedStage.gender}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {stageTags.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs bg-neutral-700 px-2 py-1 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleToggleFavorite(pickedStage)}
                className="mt-3 text-xs px-3 py-1 rounded-full border border-white/30 hover:bg-white/10 transition"
              >
                {isFavorite ? '★ 플레이리스트에서 제거' : '☆ 플레이리스트에 추가'}
              </button>

              <div className="relative pt-[56.25%] mt-4 rounded-lg overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${pickedStage.youtubeId}`}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={pickedStage.title}
                />
              </div>
            </div>
          )}

          {favoriteStages.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">내 플레이리스트</h3>
                <Link to="/playlist" className="text-xs text-pink-400">
                  전체 보기 →
                </Link>
              </div>

              <div className="space-y-2">
                {preview.map((stage) => (
                  <button
                    key={stage.id}
                    onClick={() => setPickedStage(stage)}
                    className="w-full flex justify-between items-center text-left text-sm px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700"
                  >
                    <span className="truncate mr-2">
                      {stage.artist} - {stage.title}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {stage.generation} · {stage.gender}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}