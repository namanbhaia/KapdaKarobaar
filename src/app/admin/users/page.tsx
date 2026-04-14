"use client";

import { useEffect, useState } from "react";
import { getUsers, setUserLevel } from "@/app/auth/actions";
import { Shield, Mail, User as UserIcon, Loader2, CheckCircle2, ChevronRight, UserPlus } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleLevelChange = async (userId: string, newLevel: number) => {
    setUpdating(userId);
    try {
      await setUserLevel(userId, newLevel);
      await fetchAllUsers(); // Refresh list
    } catch (err) {
      console.error("Error updating level:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Fetching global directory...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto w-full">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/20">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              User <span className="text-blue-400">Management</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Control access levels and permissions across the platform.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-6">
        {users.map((user) => {
          const level = user.user_metadata?.level || 1;
          const isUpdating = updating === user.id;

          return (
            <div 
              key={user.id} 
              className="glass p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                    <UserIcon className="w-7 h-7 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {user.user_metadata?.display_name || user.email?.split('@')[0]}
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase">
                        Lvl {level}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4].map((l) => (
                    <button
                      key={l}
                      onClick={() => handleLevelChange(user.id, l)}
                      disabled={isUpdating}
                      className={`
                        px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 border
                        ${level === l 
                          ? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/40" 
                          : "bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                        }
                        ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {isUpdating && level !== l && updating === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        `Level ${l}`
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {users.length === 0 && (
        <div className="text-center py-20 glass rounded-3xl border border-dashed border-slate-700">
          <UserPlus className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">No users found</h3>
          <p className="text-slate-500">Wait for users to sign up to manage them here.</p>
        </div>
      )}
    </div>
  );
}
