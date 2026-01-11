export default function Messages() {
  return (
    <div className="h-[calc(100vh-3.5rem)] lg:h-screen flex">
      {/* Conversations list */}
      <div className="w-full md:w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 text-center text-gray-500">
            <p>No conversations yet</p>
            <p className="text-sm mt-1">Start a chat with someone!</p>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Select a conversation to start chatting</p>
        </div>
      </div>
    </div>
  );
}
