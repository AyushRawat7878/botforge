import { Pencil, Trash } from './icons'
import { BotAvatar } from './theme'

export default function BotCard({ bot, onChat, onEdit, onDelete }) {
  return (
    <div className="card flex h-full flex-col p-5 transition-colors hover:border-ink-600">
      <div className="flex items-start gap-3.5">
        <BotAvatar name={bot.name} avatar={bot.avatar} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-semibold leading-tight tracking-tight">{bot.name}</h3>
          <p className="mt-0.5 text-sm text-fog-500">{bot.is_owner ? 'Yours' : `by ${bot.owner_username}`}{!bot.is_public && ' · private'}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 flex-1 text-[15px] leading-relaxed text-fog-300">{bot.description || 'No description yet.'}</p>
      {bot.image_replies && <p className="mt-3 text-sm text-fog-500">Can send pictures</p>}

      <div className="mt-5 flex items-center gap-1">
        <button className="btn-outline flex-1" onClick={() => onChat(bot.id)}>Chat</button>
        {onEdit && <button className="btn-ghost px-2.5" onClick={() => onEdit(bot)} title="Edit" aria-label={`Edit ${bot.name}`}><Pencil /></button>}
        {onDelete && <button className="btn-ghost px-2.5 hover:text-coral" onClick={() => onDelete(bot)} title="Delete" aria-label={`Delete ${bot.name}`}><Trash /></button>}
      </div>
    </div>
  )
}
