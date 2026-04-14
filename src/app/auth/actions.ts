"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getGoogleSheets, SPREADSHEET_ID } from "@/lib/googleSheets";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Sign up with Supabase
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
        level: 1,
      },
    },

  });

  if (error) {
    return { error: error.message };
  }

  // 2. Sync to Google Sheets (Profiles tab)
  try {
    const sheets = await getGoogleSheets();
    
    // Append to Profiles tab
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Profiles!A:D",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[name, email, password, 1]],
      },
    });

  } catch (sheetError) {
    console.error("Error syncing to Google Sheets:", sheetError);
    // We don't necessarily want to fail the whole signup if sheet sync fails, 
    // but the user asked for it. For now, we'll log it.
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
