function digitalClock(num: number, numberOfZeroes: number = 2): string {
    let i = 1
    while (i <= numberOfZeroes) {
        const tens = Math.pow(10, i)

        if (num >= tens) i++
        else break
    }

    return '0'.repeat(numberOfZeroes - i) + String(num)
}

// FIXME: minutes are diffrent in diffrent modes
function second2timestamp(total_seconds: number, mode: 'minute' | 'minute+ms' | 'complete'): string {
    const miliseconds = Math.floor((total_seconds % 1) * 1000),
        seconds = Math.floor(total_seconds % 60),
        minutes = Math.floor((total_seconds % 3600) / 60),
        hours = Math.floor(total_seconds / 3600)

    if (mode === 'minute')
        return `${digitalClock(minutes)}:${digitalClock(seconds)}`
    else if (mode === "minute+ms")
        return `${digitalClock(minutes)}:${digitalClock(seconds)}.${digitalClock(miliseconds, 3)}`
    else if (mode === 'complete')
        return `${digitalClock(hours)}:${digitalClock(minutes)}:${digitalClock(seconds)},${digitalClock(miliseconds, 3)}`
    else
        return ''
}

// for example: timestamp = 00:00:00:654
function timestamp2seconds(timestamp: string): number {
    const hours = Number(timestamp.slice(0, 2)),
        minutes = Number(timestamp.slice(3, 5)),
        seconds = Number(timestamp.slice(6, 8)),
        miliseconds = Number(timestamp.slice(9))

    return (hours * 60 * 60) + (minutes * 60) + (seconds) + (miliseconds / 1000)
}


export { timestamp2seconds, second2timestamp, digitalClock, }