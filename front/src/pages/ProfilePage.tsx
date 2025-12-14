import { useAuth } from "../auth/AuthProvider";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return <div className="p-4">로그인이 필요합니다.</div>;

  return (
    <div className="p-4">
      <img src={user.photoURL!} className="w-16 h-16 rounded-full mb-3" />
      <h1 className="text-xl font-bold">{user.displayName}</h1>
      <p className="text-gray-400 text-sm">{user.email}</p>

      <button
        onClick={logout}
        className="mt-6 px-4 py-2 bg-white/10 rounded-full"
      >
        로그아웃
      </button>
    </div>
  );
}