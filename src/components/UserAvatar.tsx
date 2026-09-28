import { useState, useSyncExternalStore } from 'react'
import { getAvatarVersion, subscribeAvatarVersion } from '../lib/avatarStore'
import { getProfilePictureUrl } from '../lib/accountApi'
import '../styles/user-avatar.css'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : (parts[0]?.slice(0, 2) || 'NC').toUpperCase()
}

export default function UserAvatar({ name, className }: { name: string; className: string }) {
  const version = useSyncExternalStore(subscribeAvatarVersion, getAvatarVersion, getAvatarVersion)
  const imageUrl = getProfilePictureUrl(version)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showImage = Boolean(imageUrl && failedUrl !== imageUrl)

  return <div className={className} role="img" aria-label={`${name || 'NodeConnect member'} profile image`}>
    {showImage ? <img className="user-avatar-image" src={imageUrl || undefined} alt="" onError={() => setFailedUrl(imageUrl)} /> : <span className="user-avatar-fallback" aria-hidden="true">{initials(name)}</span>}
  </div>
}