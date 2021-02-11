import { second2timestamp } from "./timestamp";

export type Caption = {
    start: number
    end: number,
    content: string
}


export function captionsCompare(a: Caption, b: Caption): number {
    if (a.start > b.start) return 1
    else if (b.start > a.start) return -1
    return 0
}

export function captionsToFileString(caps: Caption[]): string {
    return caps.map((c, i) =>
        `${i+1}\n${second2timestamp(c.start, "complete")} --> ${second2timestamp(c.end, "complete")}\n${c.content}`)
        .join('\n\n')
}