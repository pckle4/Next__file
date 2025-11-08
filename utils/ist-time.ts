export const getISTTime = (): Date => {
  return new Date()
}

export const formatISTTimestamp = (date?: Date): string => {
  const currentDate = date || new Date()

  const day = currentDate.toLocaleDateString("en-IN", {
    day: "numeric",
    timeZone: "Asia/Kolkata",
  })
  const month = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    timeZone: "Asia/Kolkata",
  })
  const year = currentDate.toLocaleDateString("en-IN", {
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })

  const time = currentDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })

  return `${day} ${month} ${year} at ${time}`
}

export const formatCompactTimestamp = (date?: Date): string => {
  const currentDate = date || new Date()
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - currentDate.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`

  return currentDate.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })
}

export const formatFullTimestamp = (date?: Date): string => {
  const currentDate = date || new Date()

  const day = currentDate.getDate()
  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th"
    switch (day % 10) {
      case 1:
        return "st"
      case 2:
        return "nd"
      case 3:
        return "rd"
      default:
        return "th"
    }
  }

  const dayWithSuffix = `${day}${getOrdinalSuffix(day)}`
  const month = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    timeZone: "Asia/Kolkata",
  })
  const year = currentDate.toLocaleDateString("en-IN", {
    year: "numeric",
    timeZone: "Asia/Kolkata",
  })

  const time = currentDate.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  })

  return `${dayWithSuffix} ${month} ${year} at ${time}`
}

export const getFileMetadata = (file: File) => {
  const istTime = getISTTime()
  const uploadDate = formatISTTimestamp(istTime)

  return {
    uploadDate,
    uploadTime: istTime.toISOString(),
    fileType: file.type || "application/octet-stream",
    fileExtension: file.name.split(".").pop()?.toLowerCase() || "unknown",
    size: file.size,
    lastModified: file.lastModified ? new Date(file.lastModified) : null,
    istTimestamp: istTime,
  }
}

export const consoleLogWithIST = (message: string, ...args: any[]) => {
  // No-op function - logging removed but function kept for compatibility
}

export const getISTTimestamp = (): string => {
  return formatISTTimestamp()
}
