"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

export function useUserLevel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      setLoading(false);
    };

    fetchUser();
  }, []);

  const userLevel = user?.user_metadata?.level || 1;

  return {
    user,
    userLevel: Number(userLevel),
    isAtLeastLevel: (level: number) => Number(userLevel) >= level,
    isPrivileged: Number(userLevel) >= 3,
    isAdmin: Number(userLevel) >= 4,
    loading
  };
}
