import { useEffect, useState } from "react"
import { routeFromLocation, routePaths } from "./routes"
import type { Route } from "../../types"

export function useAppNavigation() {
  const [route, setRoute] = useState<Route>(routeFromLocation)

  useEffect(() => {
    const onNavigation = () => setRoute(routeFromLocation())
    window.addEventListener("popstate", onNavigation)
    window.addEventListener("hashchange", onNavigation)
    return () => {
      window.removeEventListener("popstate", onNavigation)
      window.removeEventListener("hashchange", onNavigation)
    }
  }, [])

  const navigate = (target: Route) => {
    if (target === route) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }
    const updateRoute = () => {
      window.history.pushState({}, "", routePaths[target])
      setRoute(target)
      window.scrollTo({ top: 0, behavior: "auto" })
    }
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => void
    }
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (transitionDocument.startViewTransition && !reduceMotion) {
      transitionDocument.startViewTransition(updateRoute)
    } else {
      updateRoute()
    }
  }

  return { route, navigate }
}
