<?php

namespace App\Http\Livewire;

use Livewire\Component;
use App\Models\Conversation;
use App\Models\Message;

class ConversationList extends Component
{
    public $conversations;

    protected $listeners = ['echo:conversations,ConversationCreated' => '$refresh'];

    public function mount()
    {
        $this->conversations = Conversation::with('user', 'latestMessage')
            ->orderByDesc(
                Message::select('messDate')
                    ->whereColumn('convoID', 'conversations.convoID')
                    ->latest()
                    ->limit(1)
            )
            ->get();
    }

    public function render()
    {
        return view('livewire.conversation-list');
    }
}
