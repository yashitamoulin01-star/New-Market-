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
      // Skip if all sections have zero height — likely still loading
      if (els.length === 0) return
      const rects = els.map(el => {
        const r = el.getBoundingClientRect()
        return {
          id: el.getAttribute("data-section-id")!,
          rect: { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height },
        }
      })
      window.parent.postMessage({ type: "NM_SECTION_RECTS", rects }, "*")
    }

    function sendHeight() {
      window.parent.postMessage({ type: "NM_DOC_HEIGHT", height: document.documentElement.scrollHeight }, "*")
    }

    // Initial send
    sendRects()

    // Re-send after Suspense boundaries resolve (staggered to catch async content)
    const t1 = setTimeout(() => { sendRects(); sendHeight() }, 400)
    const t2 = setTimeout(() => { sendRects(); sendHeight() }, 1000)
    const t3 = setTimeout(() => { sendRects(); sendHeight() }, 2500)

    // Watch for resize on existing elements
    const ro = new ResizeObserver(() => { sendRects(); sendHeight() })
    document.querySelectorAll("[data-section-id]").forEach(el => ro.observe(el))

    // Watch for new data-section-id elements added by streaming SSR
    const mo = new MutationObserver(() => {
      const els = document.querySelectorAll("[data-section-id]")
      els.forEach(el => ro.observe(el))
      sendRects()
      sendHeight()
    })
    mo.observe(document.body, { childList: true, subtree: true })

    window.addEventListener("scroll", sendRects, { passive: true })

    // Click-to-select: clicking a section in the iframe tells the builder to select it
    function attachClickListeners() {
      document.querySelectorAll("[data-section-id]").forEach(el => {
        if ((el as HTMLElement).dataset.nmBound) return
        ;(el as HTMLElement).dataset.nmBound = "1"
        el.addEventListener("click", (ev) => {
          ev.stopPropagation()
          window.parent.postMessage({ type: "NM_CLICK_SECTION", id: el.getAttribute("data-section-id") }, "*")
        })
      })
    }
    attachClickListeners()
    // Re-attach on DOM changes (streaming SSR adds sections later)
    const clickMo = new MutationObserver(attachClickListeners)
    clickMo.observe(document.body, { childList: true, subtree: true })

    function onMsg(e: MessageEvent) {
      if (!e.data?.type) return
      if (e.data.type === "NM_REQUEST_RECTS") {
        sendRects()
        sendHeight()
      }
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
    }
    window.addEventListener("message", onMsg)

    window.addEventListener("load", () => { sendRects(); sendHeight() })

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      ro.disconnect()
      mo.disconnect()
      clickMo.disconnect()
      window.removeEventListener("scroll", sendRects)
      window.removeEventListener("message", onMsg)
      style.remove()
    }
  }, [])
  return null
}
