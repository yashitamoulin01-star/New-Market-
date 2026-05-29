"use client"
import { useEffect } from "react"

export function HomepagePreviewBridge() {
  useEffect(() => {
    if (typeof window === "undefined") return
    try { if (window === window.top) return } catch { return }

    // Inject highlight styles
    const style = document.createElement("style")
    style.textContent = `
      [data-section-id] { position: relative; }
      .nm-hl { outline: 2px solid rgba(59,130,246,0.7) !important; outline-offset: -2px; }
      .nm-sel { outline: 2px solid rgba(239,68,68,0.8) !important; outline-offset: -2px; }
    `
    document.head.appendChild(style)

    function sendRects() {
      const els = Array.from(document.querySelectorAll("[data-section-id]"))
      const rects = els.map(el => {
        const r = el.getBoundingClientRect()
        return {
          id: el.getAttribute("data-section-id")!,
          rect: { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height },
        }
      })
      window.parent.postMessage({ type: "NM_SECTION_RECTS", rects }, "*")
    }

    const ro = new ResizeObserver(sendRects)
    document.querySelectorAll("[data-section-id]").forEach(el => ro.observe(el))
    window.addEventListener("scroll", sendRects, { passive: true })
    sendRects()

    function onMsg(e: MessageEvent) {
      if (!e.data?.type) return
      if (e.data.type === "NM_HIGHLIGHT") {
        document.querySelectorAll("[data-section-id]").forEach(el => el.classList.remove("nm-hl", "nm-sel"))
        if (e.data.id) {
          document.querySelector(`[data-section-id="${e.data.id}"]`)?.classList.add("nm-sel")
        }
      }
      if (e.data.type === "NM_SHOW_OUTLINES") {
        document.querySelectorAll("[data-section-id]").forEach(el => {
          e.data.show ? el.classList.add("nm-hl") : el.classList.remove("nm-hl")
        })
      }
      if (e.data.type === "NM_SCROLL_TO") {
        document.querySelector(`[data-section-id="${e.data.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      if (e.data.type === "NM_SET_HEIGHT") {
        // noop — parent will read from iframe
      }
    }
    window.addEventListener("message", onMsg)

    // Send document height after full paint
    const sendHeight = () => {
      window.parent.postMessage({ type: "NM_DOC_HEIGHT", height: document.documentElement.scrollHeight }, "*")
    }
    window.addEventListener("load", sendHeight)
    new MutationObserver(sendHeight).observe(document.body, { childList: true, subtree: true })
    setTimeout(sendHeight, 1000)

    return () => {
      ro.disconnect()
      window.removeEventListener("scroll", sendRects)
      window.removeEventListener("message", onMsg)
      window.removeEventListener("load", sendHeight)
      style.remove()
    }
  }, [])
  return null
}
