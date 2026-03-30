import React, { useState, useMemo, useCallback } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import FilterBar from './components/FilterBar'
import MapView from './components/MapView'
import StoreList from './components/StoreList'
import StoreDetail from './components/StoreDetail'
import RoutePanel from './components/RoutePanel'
import stores, { CHAINS, DISTRICTS, DISTRICT_NAMES } from './data/stores'
import { optimizeRoute, getRouteStats, buildMapsUrl } from './utils/routeOptimizer'
import './App.css'

function App() {
  const [activeChains, setActiveChains] = useState(() => new Set())
  const [activeDistricts, setActiveDistricts] = useState(() => new Set())
  const [selectedStore, setSelectedStore] = useState(null)
  const [routeStores, setRouteStores] = useState([])
  const [viewMode, setViewMode] = useState('map')

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const chainMatch = activeChains.size === 0 || activeChains.has(store.chain)
      const districtMatch = activeDistricts.size === 0 || activeDistricts.has(store.district)
      return chainMatch && districtMatch
    })
  }, [activeChains, activeDistricts])

  const routeStats = useMemo(() => {
    return getRouteStats(routeStores)
  }, [routeStores])

  const handleToggleChain = useCallback((chain) => {
    setActiveChains((prev) => {
      const next = new Set(prev)
      if (next.has(chain)) {
        next.delete(chain)
      } else {
        next.add(chain)
      }
      return next
    })
  }, [])

  const handleToggleDistrict = useCallback((district) => {
    setActiveDistricts((prev) => {
      const next = new Set(prev)
      if (next.has(district)) {
        next.delete(district)
      } else {
        next.add(district)
      }
      return next
    })
  }, [])

  const handleClearFilters = useCallback(() => {
    setActiveChains(new Set())
    setActiveDistricts(new Set())
  }, [])

  const handleStoreSelect = useCallback((store) => {
    setSelectedStore(store)
  }, [])

  const handleAddToRoute = useCallback((store) => {
    setRouteStores((prev) => {
      if (prev.some((s) => s.id === store.id)) {
        return prev
      }
      return [...prev, store]
    })
  }, [])

  const handleRemoveFromRoute = useCallback((store) => {
    setRouteStores((prev) => prev.filter((s) => s.id !== store.id))
  }, [])

  const handleOptimizeRoute = useCallback(() => {
    setRouteStores((prev) => optimizeRoute(prev))
  }, [])

  const handleClearRoute = useCallback(() => {
    setRouteStores([])
  }, [])

  const handleOpenInMaps = useCallback(() => {
    window.open(buildMapsUrl(routeStores), '_blank')
  }, [routeStores])

  return (
    <div className="app">
      <Header />
      <FilterBar
        chains={CHAINS}
        districts={DISTRICTS}
        districtNames={DISTRICT_NAMES}
        activeChains={activeChains}
        activeDistricts={activeDistricts}
        onToggleChain={handleToggleChain}
        onToggleDistrict={handleToggleDistrict}
        onClearFilters={handleClearFilters}
      />
      <div className="app-main">
        <div className={`map-container${viewMode === 'list' ? ' mobile-hidden' : ''}`}>
          <MapView
            stores={filteredStores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            routeStores={routeStores}
          />
        </div>
        <div className={`sidebar${viewMode === 'map' ? ' mobile-hidden' : ''}`}>
          <div className="view-toggle">
            <button
              onClick={() => setViewMode('map')}
              className={viewMode === 'map' ? 'active' : ''}
            >
              Map
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'active' : ''}
            >
              List
            </button>
          </div>

          {selectedStore ? (
            <StoreDetail
              store={selectedStore}
              onClose={() => setSelectedStore(null)}
              onAddToRoute={handleAddToRoute}
              onRemoveFromRoute={handleRemoveFromRoute}
              isInRoute={routeStores.some((s) => s.id === selectedStore.id)}
              routeIndex={routeStores.findIndex((s) => s.id === selectedStore.id)}
            />
          ) : null}

          {routeStores.length > 0 && (
            <RoutePanel
              routeStores={routeStores}
              routeStats={routeStats}
              onOptimizeRoute={handleOptimizeRoute}
              onClearRoute={handleClearRoute}
              onOpenInMaps={handleOpenInMaps}
              onRemoveFromRoute={handleRemoveFromRoute}
            />
          )}

          <StoreList
            stores={filteredStores}
            selectedStore={selectedStore}
            onStoreSelect={handleStoreSelect}
            routeStores={routeStores}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App
