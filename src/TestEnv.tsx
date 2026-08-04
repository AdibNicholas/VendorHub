function TestEnv() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Environment Test</h2>

      <p>
        URL: {import.meta.env.VITE_SUPABASE_URL || "NOT FOUND"}
      </p>

      <p>
        KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY || "NOT FOUND"}
      </p>
    </div>
  );
}

export default TestEnv;