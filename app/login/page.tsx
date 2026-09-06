"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState("");
  const router=useRouter();

  async function login() {
    setError("");
    const supabase=createClient();
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error){setError(error.message);return;}
    router.push("/"); router.refresh();
  }

  return <main className="max-w-md mx-auto px-6 py-20">
    <h1 className="text-3xl font-black mb-8">Admin Login</h1>
    <input className="w-full border rounded-lg p-3 mb-3" placeholder="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)}/>
    <input className="w-full border rounded-lg p-3 mb-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}
    <button onClick={login} className="w-full bg-black text-white rounded-lg p-3">Login</button>
  </main>;
}
