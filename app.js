function ProteinLookupApp() {
  const { useEffect, useMemo, useState } = React;
  const [proteinData, setProteinData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [verdict, setVerdict] = useState("All");

  useEffect(() => {
    fetch("./protein-data-v9.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load protein data");
        return res.json();
      })
      .then((data) => {
        setProteinData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setLoadError("Could not load the protein dataset.");
        setLoading(false);
      });
  }, []);

  const categories = ["All", ...new Set(proteinData.map((item) => item.category).filter(Boolean))];
  const verdicts = ["All", ...new Set(proteinData.map((item) => item.verdict).filter(Boolean))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return proteinData
      .filter((item) => {
        const haystack = [
          item.name,
          item.brand,
          item.category,
          item.why,
          item.searchTerms,
          item.lead,
          item.arsenic,
          item.cadmium,
          item.mercury,
          item.ingredients,
          ...(item.better || []),
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery = !q || haystack.includes(q);
        const matchesCategory = category === "All" || item.category === category;
        const matchesVerdict = verdict === "All" || item.verdict === verdict;

        return matchesQuery && matchesCategory && matchesVerdict;
      })
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [proteinData, query, category, verdict]);

  const topResult = filtered[0];
  const otherResults = filtered.slice(1, 6);

  const verdictTone = (text) => {
    if (!text) return "bg-slate-100 text-slate-800 border-slate-200";
    if (text.startsWith("Excellent")) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (text.startsWith("Good")) return "bg-green-100 text-green-800 border-green-200";
    if (text.startsWith("Decent")) return "bg-amber-100 text-amber-800 border-amber-200";
    if (text.startsWith("Limit")) return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const scoreTone = (score) => {
    if (score >= 85) return "text-emerald-600";
    if (score >= 75) return "text-green-600";
    if (score >= 65) return "text-amber-600";
    if (score >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const formatMetal = (value) => {
    if (value === null || value === undefined || value === "") return "Unknown";
    return value;
  };

  const formatIngredients = (value) => {
    if (value === null || value === undefined || value === "") {
      return "No ingredient quality notes yet.";
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full bg-white border border-slate-200 px-3 py-1 text-sm shadow-sm">
            Protein verification tool
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Look up a protein and see how it ranks.
            </h1>
            <p className="text-slate-600 text-lg max-w-3xl">
              Search what you already have in your hand. Get a score, verdict, red flags,
              actual heavy metal data, ingredient quality, and better alternatives without
              getting trapped by marketing.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search: orgain chocolate, gold standard whey, gorilla mind..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-300 bg-slate-50"
              />
            </div>
            <div className="md:col-span-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base bg-slate-50"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-base bg-slate-50"
              >
                {verdicts.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-sm text-slate-500">
            Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center text-slate-600">
            Loading protein dataset...
          </div>
        ) : loadError ? (
          <div className="bg-white rounded-3xl shadow-sm border border-red-200 p-10 text-center text-red-700">
            {loadError}
          </div>
        ) : topResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Top match</div>
                  <h2 className="text-2xl md:text-3xl font-semibold leading-tight">{topResult.name}</h2>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                      {topResult.brand}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">
                      {topResult.category}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-3xl px-6 py-4 border border-slate-200 min-w-[150px] text-center">
                  <div className="text-sm text-slate-500">Score</div>
                  <div className={`text-4xl font-semibold ${scoreTone(topResult.score)}`}>
                    {topResult.score}
                  </div>
                  <div className="text-xs text-slate-500 pt-1">out of 100</div>
                </div>
              </div>

              <div className={`rounded-2xl border px-4 py-3 text-sm md:text-base font-medium ${verdictTone(topResult.verdict)}`}>
                {topResult.verdict}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">Red flags</div>
                  <div className="text-lg font-semibold pt-1">{topResult.redFlag}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">Trust level</div>
                  <div className="text-lg font-semibold pt-1">{topResult.transparency}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div className="text-sm text-slate-500">Key reason</div>
                  <div className="text-base font-medium pt-1">{topResult.why}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="text-sm text-slate-500">Heavy metals</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-500">Lead:</span>{" "}
                      <span className="font-medium">{formatMetal(topResult.lead)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Arsenic:</span>{" "}
                      <span className="font-medium">{formatMetal(topResult.arsenic)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Cadmium:</span>{" "}
                      <span className="font-medium">{formatMetal(topResult.cadmium)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Mercury:</span>{" "}
                      <span className="font-medium">{formatMetal(topResult.mercury)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
                  <div className="text-sm text-slate-500">Ingredient quality</div>
                  <div className="text-base font-medium">
                    {formatIngredients(topResult.ingredients)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 space-y-4">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Better options</div>
                <h3 className="text-xl font-semibold pt-2">Safer alternatives</h3>
              </div>
              <div className="space-y-3">
                {(topResult.better || []).length ? (
                  topResult.better.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setQuery(item);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full text-left rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium hover:bg-slate-100 transition"
                    >
                      {item}
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No alternatives listed yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center text-slate-600">
            No results found. Try a brand, flavor, or product line.
          </div>
        )}

        {otherResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Other matching results</h3>
              <div className="text-sm text-slate-500">Top {otherResults.length} additional matches</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {otherResults.map((item) => (
                <div key={item.name} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold leading-snug">{item.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                        {item.brand}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">Score</div>
                      <div className={`text-3xl font-semibold ${scoreTone(item.score)}`}>
                        {item.score}
                      </div>
                    </div>
                    <div className={`rounded-2xl border px-3 py-2 text-xs font-medium ${verdictTone(item.verdict)}`}>
                      {item.verdict}
                    </div>
                  </div>

                  <div className="text-sm text-slate-600">{item.why}</div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div>Lead: <span className="font-medium text-slate-700">{formatMetal(item.lead)}</span></div>
                    <div>Arsenic: <span className="font-medium text-slate-700">{formatMetal(item.arsenic)}</span></div>
                    <div>Cadmium: <span className="font-medium text-slate-700">{formatMetal(item.cadmium)}</span></div>
                    <div>Mercury: <span className="font-medium text-slate-700">{formatMetal(item.mercury)}</span></div>
                  </div>

                  <div className="text-xs text-slate-500">
                    {formatIngredients(item.ingredients)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<ProteinLookupApp />);
