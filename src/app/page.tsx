'use client'

import { useState, useEffect, useCallback } from 'react'
import Fuse from 'fuse.js'

// Types
interface Guest {
  firstName: string
  lastName: string
  table: number
  photo?: string
}

interface SearchResult extends Guest {
  score?: number
}

// Configuration - Update this with your Google Sheet ID
const GOOGLE_SHEET_ID = '1FTotgAg8IZwCr--xU8EHcuLdF_hVeZZrypioJHUT8Lk'
const SHEET_NAME = 'Sheet1' // Change if your sheet has a different name

const Flourish = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="currentColor">
    <path d="M50 0 Q60 40 100 50 Q60 60 50 100 Q40 60 0 50 Q40 40 50 0Z" opacity="0.6" />
    <circle cx="50" cy="50" r="8" />
  </svg>
)

// Avatar Component
const Avatar = ({ firstName, lastName, photo }: { firstName: string; lastName: string; photo?: string }) => {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
  const [imgError, setImgError] = useState(false)

  if (photo && !imgError) {
    return (
      <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg ring-2 ring-shaadi-gold/30">
        <img
          src={photo}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className="avatar w-14 h-14 rounded-full flex items-center justify-center text-white font-display text-lg font-semibold">
      {initials}
    </div>
  )
}

// Guest Card Component
const GuestCard = ({ guest, index }: { guest: SearchResult; index: number }) => (
  <div
    className="guest-card bg-white rounded-2xl p-4 shadow-md border border-shaadi-cream-dark animate-slide-up"
    style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
  >
    <div className="flex items-center gap-4">
      <Avatar firstName={guest.firstName} lastName={guest.lastName} photo={guest.photo} />
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-xl font-semibold text-shaadi-red-dark truncate">
          {guest.firstName} {guest.lastName}
        </h3>
        <p className="text-shaadi-red/60 font-body text-sm">Guest</p>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-body text-shaadi-red/60 uppercase tracking-wider mb-1">Table</span>
        <div className="table-badge w-12 h-12 rounded-full flex items-center justify-center text-white font-display text-xl font-bold">
          {guest.table}
        </div>
      </div>
    </div>
  </div>
)

// Main Component
export default function TableFinder() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fuse, setFuse] = useState<Fuse<Guest> | null>(null)

  // Fetch guests from Google Sheet
  useEffect(() => {
    const fetchGuests = async () => {
      try {
        setIsLoading(true)
        const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`
        const response = await fetch(url)
        const text = await response.text()

        // Parse the JSONP response
        const jsonString = text.substring(47).slice(0, -2)
        const data = JSON.parse(jsonString)

        const rows = data.table.rows
        const parsedGuests: Guest[] = rows
          .filter((row: any) => row.c && row.c[0]?.v) // Filter out empty rows
          .map((row: any) => ({
            firstName: row.c[0]?.v?.toString().trim() || '',
            lastName: row.c[1]?.v?.toString().trim() || '',
            table: parseInt(row.c[2]?.v) || 0,
            photo: row.c[3]?.v?.toString().trim() || undefined,
          }))
          .filter((guest: Guest) => guest.firstName && guest.table > 0)

        setGuests(parsedGuests)

        // Initialize Fuse.js for fuzzy search
        const fuseInstance = new Fuse(parsedGuests, {
          keys: ['firstName', 'lastName'],
          threshold: 0.4,
          distance: 100,
          includeScore: true,
        })
        setFuse(fuseInstance)
        setError(null)
      } catch (err) {
        console.error('Error fetching guests:', err)
        setError('Unable to load guest list. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuests()
  }, [])

  // Search function
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !fuse) {
      return
    }

    const searchResults = fuse.search(searchQuery.trim())
    setResults(searchResults.map((result) => ({ ...result.item, score: result.score })))
    setShowResults(true)
  }, [searchQuery, fuse])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  // Reset to search screen
  const handleSearchAgain = () => {
    setShowResults(false)
    setSearchQuery('')
    setResults([])
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center pattern-overlay">
        <div className="text-center animate-fade-in">
          <img 
            src="/mrlogo.png" 
            alt="M & R" 
            className="h-20 mx-auto mb-4"
          />
          <div className="flex items-center gap-2 justify-center text-shaadi-red/60">
            <div className="w-2 h-2 bg-shaadi-red rounded-full animate-pulse" />
            <span className="font-body text-lg">Loading guest list...</span>
            <div className="w-2 h-2 bg-shaadi-red rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center pattern-overlay p-6">
        <div className="text-center animate-fade-in max-w-md">
          <img 
            src="/mrlogo.png" 
            alt="M & R" 
            className="h-20 mx-auto mb-6"
          />
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <p className="text-shaadi-red font-body text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-white font-display font-semibold py-3 px-8 rounded-full"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    return (
      <div className="min-h-screen min-h-dvh pattern-overlay">
        {/* Header */}
        <div className="bg-gradient-to-r from-shaadi-red via-shaadi-red-dark to-shaadi-red p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSearchAgain}
              className="text-white/80 hover:text-white transition-colors p-2 -ml-2"
              aria-label="Go back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="font-display text-xl text-white font-semibold">Find Your Table</h1>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 pb-32">
          <div className="mb-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-shaadi-red-dark mb-1">
              Results for &lsquo;{searchQuery}&rsquo;
            </h2>
            <p className="font-body text-shaadi-red/60">
              {results.length === 0
                ? 'No matches found for your search.'
                : `We found ${results.length} match${results.length === 1 ? '' : 'es'} for your search.`}
            </p>
          </div>

          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((guest, index) => (
                <GuestCard key={`${guest.firstName}-${guest.lastName}-${index}`} guest={guest} index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-md text-center animate-slide-up">
              <div className="text-shaadi-red/30 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="font-body text-shaadi-red/70 text-lg">
                We couldn&apos;t find anyone matching that name.
              </p>
              <p className="font-body text-shaadi-red/50 mt-2">
                Please check the spelling or visit the concierge desk.
              </p>
            </div>
          )}

          <p className="text-center text-shaadi-red/40 font-body text-sm mt-6 italic">
            End of search results
          </p>
        </div>

        {/* Fixed Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-shaadi-cream via-shaadi-cream to-transparent">
          <button
            onClick={handleSearchAgain}
            className="btn-primary w-full text-white font-display font-semibold py-4 rounded-2xl text-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search Again
          </button>
        </div>
      </div>
    )
  }

  // Search Screen (Home)
  return (
    <div className="min-h-screen min-h-dvh pattern-overlay flex flex-col">
      {/* Decorative Top Bar */}
      <div className="h-2 bg-gradient-to-r from-shaadi-red via-shaadi-gold to-shaadi-red" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-between p-6 py-10">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="text-center mb-6">
            <img 
              src="/mrlogo.png" 
              alt="M & R" 
              className="h-28 md:h-36 mx-auto logo-animate"
            />
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl font-bold text-shaadi-red-dark text-center mb-5 leading-tight">
            Welcome to the<br />Shaadi Afterparty
          </h1>

          {/* Decorative Line */}
          <div className="gold-line w-40 mx-auto mb-6" />

          {/* Subtitle */}
          <p className="font-body text-xl text-shaadi-red/70 text-center mb-12 leading-relaxed px-4">
            Please enter your first and last name to find your table assignment.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name-search"
                className="block font-display text-sm font-semibold text-shaadi-red-dark uppercase tracking-wider mb-3"
              >
                Enter Your Name
              </label>
              <div className="relative">
                <input
                  id="name-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="input-field w-full rounded-2xl py-4 px-5 pr-12 font-body text-lg text-shaadi-red-dark placeholder:text-shaadi-red/30"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="words"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-shaadi-red/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!searchQuery.trim()}
              className="btn-primary w-full text-white font-display font-semibold py-4 rounded-2xl text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Find My Table
            </button>
          </form>

          {/* Help Text */}
          <p className="font-body text-shaadi-red/50 text-center mt-10 text-sm leading-relaxed">
            If you cannot find your name, please visit the<br />
            <span className="text-shaadi-red/70 font-medium">concierge desk</span> at the entrance.
          </p>
        </div>

        {/* Decorative Bottom Flourish */}
        <div className="flex justify-center pt-6">
          <Flourish className="w-16 h-16 text-shaadi-red bottom-flourish" />
        </div>
      </div>
    </div>
  )
}
