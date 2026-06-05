/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    REACT_APP_SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
    REACT_APP_SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY,
    REACT_APP_AI_DIAGNOSIS_KEY: process.env.REACT_APP_AI_DIAGNOSIS_KEY,
  },
};

export default nextConfig;
