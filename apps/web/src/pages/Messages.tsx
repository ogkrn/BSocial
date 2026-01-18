export default function Messages() {
  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex">
      {/* Conversations list */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start a chat with someone!</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}
