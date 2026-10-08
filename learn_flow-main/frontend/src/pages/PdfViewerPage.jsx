import { Bookmark, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useParams } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import api from "../utils/api.js";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

export default function PdfViewerPage() {
  const { id } = useParams();
  const [pdf, setPdf] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [scale, setScale] = useState(1.1);
  const [bookmarked, setBookmarked] = useState(false);
  const file = useMemo(() => ({ url: `${import.meta.env.VITE_API_URL || "/api"}/catalog/pdfs/${id}/file`, withCredentials: true }), [id]);

  useEffect(() => {
    Promise.all([
      api.get(`/catalog/pdfs/${id}`),
      api.get(`/progress/pdfs/${id}`),
      api.get("/bookmarks/status", { params: { kind: "pdf", resourceId: id } }),
    ]).then(([pdfResponse, progressResponse, bookmarkResponse]) => {
      setPdf(pdfResponse.data.pdf);
      setPage(progressResponse.data.progress?.currentPage || 1);
      setBookmarked(bookmarkResponse.data.bookmarked);
    });
  }, [id]);

  useEffect(() => {
    if (pdf && pages) api.put(`/progress/pdfs/${id}`, { currentPage: page, totalPages: pages });
  }, [page, pages, pdf, id]);

  if (!pdf) return <Loading label="Opening PDF" />;
  const toggle = async () => { const { data } = await api.post("/bookmarks/toggle", { kind: "pdf", resourceId: id }); setBookmarked(data.bookmarked); };

  return <div><div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm text-slate-500">{pdf.courseName} / PDF resource</p><h1 className="mt-1 text-2xl font-bold text-slate-950">{pdf.title}</h1></div><div className="flex flex-wrap gap-2"><button className="secondary-button" onClick={() => setScale((value) => Math.max(value - 0.15, 0.6))}><ZoomOut size={16} /></button><button className="secondary-button" onClick={() => setScale((value) => Math.min(value + 0.15, 2))}><ZoomIn size={16} /></button><button className="secondary-button" onClick={toggle}><Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />{bookmarked ? "Bookmarked" : "Bookmark"}</button><a className="secondary-button" href={file.url} target="_blank" rel="noreferrer"><Download size={16} />Open original view</a></div></div><div className="panel overflow-hidden"><div className="flex items-center justify-center gap-3 border-b border-slate-200 p-3"><button className="secondary-button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></button><span className="min-w-28 text-center text-sm font-semibold">Page {page} of {pages || "..."}</span><button className="secondary-button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></button></div><div className="grid min-h-[600px] place-items-start overflow-auto bg-slate-200 p-4 md:p-8"><Document file={file} loading={<Loading label="Rendering PDF" />} onLoadSuccess={({ numPages }) => { setPages(numPages); setPage((current) => Math.min(current, numPages)); }} onLoadError={(error) => console.error(error)}><Page className="pdf-page shadow-xl" pageNumber={page} scale={scale} /></Document></div></div></div>;
}
