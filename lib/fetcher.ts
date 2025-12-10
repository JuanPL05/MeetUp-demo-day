export const fetcher = async (url: string) => {
  console.log("[v0] Fetching data from:", url)

  try {
    const response = await fetch(url)

    console.log("[v0] Response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API Error:", {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`API Error ${response.status}: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Successfully fetched data:", { url, dataLength: Array.isArray(data) ? data.length : "object" })

    return data
  } catch (error) {
    console.error("[v0] Fetch error:", { url, error: error.message })
    throw error
  }
}

export const mutatingFetcher = async (url: string, options: RequestInit) => {
  console.log("[v0] Mutating request to:", url, options.method)

  try {
    const response = await fetch(url, options)

    console.log("[v0] Mutation response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Mutation Error:", {
        url,
        method: options.method,
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`API Error ${response.status}: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Mutation successful:", { url, method: options.method })

    return data
  } catch (error) {
    console.error("[v0] Mutation error:", { url, method: options.method, error: error.message })
    throw error
  }
}
