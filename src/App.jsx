// Comparador de Sugeridos v2 (versión web profesional simplificada)
// Diseñado para desplegarse en Vercel / Netlify

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { BarChart3, Upload, Plus, Trash2, Sparkles, Download } from "lucide-react";

const EMPTY_ROW = () => ({
  id: Date.now() + Math.random(),
  referencia: "",
  descripcion: "",
  sag: "",
  focuss1: "",
  focuss2: "",
});

const SYSTEMS = [
  { key: "sag", label: "SAG" },
  { key: "focuss1", label: "FOCUSS 1" },
  { key: "focuss2", label: "FOCUSS 2" },
];

export default function App() {
  const [rows, setRows] = useState([EMPTY_ROW(), EMPTY_ROW()]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  const addRow = () => setRows((r) => [...r, EMPTY_ROW()]);

  const removeRow = (id) => setRows((r) => r.filter((x) => x.id !== id));

  const updateRow = (id, field, val) =>
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: val } : row)));

  const processFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);

      const newRows = data.map((r) => ({
        id: Date.now() + Math.random(),
        referencia: r.Referencia || r.ref || "",
        descripcion: r.Descripcion || "",
        sag: r.SAG || "",
        focuss1: r["FOCUSS 1"] || "",
        focuss2: r["FOCUSS 2"] || "",
      }));

      setRows(newRows);
    };

    reader.readAsArrayBuffer(file);
  };

  const analyze = async () => {
    setLoading(true);

    const valid = rows.filter((r) => r.referencia);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(valid),
    });

    const data = await res.json();

    setResult(data);
    setLoading(false);
  };

  const exportExcel = () => {
    if (!result) return;

    const ws = XLSX.utils.json_to_sheet(result.items);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "recomendaciones");

    XLSX.writeFile(wb, "analisis_compras.xlsx");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-3xl font-bold flex gap-3 items-center mb-6">
        <BarChart3 /> Comparador Inteligente de Sugeridos
      </h1>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => fileRef.current.click()}
          className="bg-blue-600 px-4 py-2 rounded flex gap-2"
        >
          <Upload size={18} /> Importar Excel
        </button>

        <button onClick={addRow} className="bg-slate-700 px-4 py-2 rounded flex gap-2">
          <Plus size={18} /> Agregar
        </button>

        <button
          onClick={analyze}
          className="bg-purple-600 px-4 py-2 rounded flex gap-2"
        >
          <Sparkles size={18} /> Analizar con IA
        </button>

        <button
          onClick={exportExcel}
          className="bg-emerald-600 px-4 py-2 rounded flex gap-2"
        >
          <Download size={18} /> Exportar Excel
        </button>

        <input
          type="file"
          ref={fileRef}
          hidden
          onChange={(e) => processFile(e.target.files[0])}
        />
      </div>

      <div className="grid grid-cols-6 gap-2 mb-6">
        <div>Referencia</div>
        <div>Descripción</div>
        <div>SAG</div>
        <div>FOCUSS1</div>
        <div>FOCUSS2</div>
        <div></div>
      </div>

      {rows.map((row) => (
        <div key={row.id} className="grid grid-cols-6 gap-2 mb-2">
          <input
            value={row.referencia}
            onChange={(e) => updateRow(row.id, "referencia", e.target.value)}
            className="text-black px-2"
          />

          <input
            value={row.descripcion}
            onChange={(e) => updateRow(row.id, "descripcion", e.target.value)}
            className="text-black px-2"
          />

          {SYSTEMS.map((s) => (
            <input
              key={s.key}
              type="number"
              value={row[s.key]}
              onChange={(e) => updateRow(row.id, s.key, e.target.value)}
              className="text-black px-2"
            />
          ))}

          <button onClick={() => removeRow(row.id)}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}

      {loading && <p className="mt-6">Analizando...</p>}

      {result && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">Resultados IA</h2>

          {result.items.map((item, i) => (
            <div
              key={i}
              className="border border-slate-700 rounded p-4 mb-3"
            >
              <div className="font-bold">
                {item.referencia} — recomendado: {item.recomendacion}
              </div>

              <div className="text-sm text-gray-400">
                Fuente: {item.fuente} | Confianza: {item.confianza}
              </div>

              <div className="text-sm mt-2">{item.justificacion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
