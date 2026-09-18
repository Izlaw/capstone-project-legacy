<div wire:poll.1s>
    <ul class="space-y-4">
        @foreach($conversations as $conversation)
        @if($conversation->user)
        <li class="mb-4" data-conversation-id="{{ $conversation->convoID }}">
            <a href="{{ route('assistcustomer.show', ['convoID' => $conversation->convoID]) }}" class="block p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition duration-300">
                <div class="flex justify-between items-center">
                    <p class="font-semibold text-gray-800">
                        @if($conversation->latestMessage && $conversation->latestMessage->user)
                        @auth
                        @if($conversation->latestMessage->user->user_id === Auth::id())
                        You
                        @else
                        {{ $conversation->latestMessage->user->getFullName() }}
                        @endif
                        @else
                        {{ $conversation->latestMessage->user->getFullName() }}
                        @endauth
                        @else
                        No sender info
                        @endif
                    </p>
                    @if($conversation->latestMessage)
                    <p class="text-sm text-gray-500 ml-2">
                        {{ $conversation->latestMessage->created_at->format('h:i A') }}
                    </p>
                    @endif
                </div>
                <p class="text-gray-600 mt-1">
                    @if($conversation->latestMessage)
                    @if($conversation->latestMessage->messType === 'image')
                    Attached an image
                    @else
                    {{ $conversation->latestMessage->messContent }}
                    @endif
                    @else
                    No messages yet
                    @endif
                </p>
            </a>
        </li>
        @else
        <li class="mb-4">
            <p class="text-red-500">No user found for this conversation</p>
        </li>
        @endif
        @endforeach
    </ul>
</div>