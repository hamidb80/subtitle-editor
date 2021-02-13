import { second2timestamp, timestamp2seconds } from "./timestamp"

export type Caption = {
  start: number
  end: number
  content: string
  // TODO hash_key: string => to render chages properly
}

export function captionsCompare(a: Caption, b: Caption): number {
  if (a.start > b.start) return 1
  else if (b.start > a.start) return -1
  else return 0
}

// save as .srt format
export function export2srt(caps: Caption[]): string {
  return caps.map((c, i) =>
    `${i + 1}\n${second2timestamp(c.start, "complete")} --> ${second2timestamp(c.end, "complete")}\n${c.content}`)
    .join('\n\n')
}

export function parseSrt(content: string): Caption[] {
  const matches = Array.from(content.matchAll(/([\d,:]{12}) --> ([\d,:]{12})\n(.*)(?![\d,:]{12})/g))

  return matches.map(m => ({
    start: timestamp2seconds(m[1]),
    end: timestamp2seconds(m[2]),
    content: m[3].trim()
  }))
}