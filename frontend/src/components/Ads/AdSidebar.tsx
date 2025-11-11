interface AdSidebarProps {
  sticky?: boolean
}

export default function AdSidebar({ sticky = false }: AdSidebarProps) {
  return (
    <div className={`ad-sidebar ${sticky ? 'sticky top-20' : ''}`}>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center min-h-[600px] flex items-center justify-center border border-gray-200 dark:border-gray-700">
        <div className="text-gray-500 dark:text-gray-400 text-sm">
          <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot="XXXXXXXXXX"
               data-ad-format="vertical">
          </ins>
          <div className="mt-4">
            <span className="text-xs text-gray-400">Advertisement</span>
          </div>
        </div>
      </div>
    </div>
  )
}
