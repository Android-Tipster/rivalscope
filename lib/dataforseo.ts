const DFS_USER = process.env.DATAFORSEO_USER!
const DFS_PASS = process.env.DATAFORSEO_PASS!

async function dfsPost(endpoint: string, tasks: object[]): Promise<any> {
  const auth = Buffer.from(`${DFS_USER}:${DFS_PASS}`).toString('base64')
  const res = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tasks),
  })
  if (!res.ok) throw new Error(`DataForSEO error: ${res.status}`)
  return res.json()
}

export interface DomainOverview {
  domain: string
  organicKeywords: number
  organicTraffic: number
  trafficCost: number
  error?: string
}

export interface KeywordItem {
  keyword: string
  position: number
  searchVolume: number
  etv: number
}

export async function getDomainOverview(domain: string): Promise<DomainOverview> {
  try {
    const data = await dfsPost('dataforseo_labs/google/domain_rank_overview/live', [
      { target: domain, language_code: 'en', location_code: 2840 },
    ])
    const metrics = data?.tasks?.[0]?.result?.[0]?.metrics?.organic
    return {
      domain,
      organicKeywords: metrics?.count ?? 0,
      organicTraffic: metrics?.etv ?? 0,
      trafficCost: metrics?.estimated_paid_traffic_cost ?? 0,
    }
  } catch {
    return { domain, organicKeywords: 0, organicTraffic: 0, trafficCost: 0, error: 'fetch_failed' }
  }
}

export async function getTopKeywords(domain: string, limit = 10): Promise<KeywordItem[]> {
  try {
    const data = await dfsPost('dataforseo_labs/google/ranked_keywords/live', [
      {
        target: domain,
        language_code: 'en',
        location_code: 2840,
        limit,
        order_by: ['ranked_serp_element.serp_item.etv,desc'],
      },
    ])
    const items: any[] = data?.tasks?.[0]?.result?.[0]?.items ?? []
    return items.map((item) => ({
      keyword: item.keyword_data?.keyword ?? '',
      position: item.ranked_serp_element?.serp_item?.rank_group ?? 0,
      searchVolume: item.keyword_data?.keyword_info?.search_volume ?? 0,
      etv: item.ranked_serp_element?.serp_item?.etv ?? 0,
    }))
  } catch {
    return []
  }
}
