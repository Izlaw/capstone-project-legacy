<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Events\ConversationCreated;

class Conversation extends Model
{
    protected $table = 'conversations';
    public $timestamps = false;
    protected $primaryKey = 'convoID';

    protected $fillable = [
        'user_id',
        'messID',
        'convoID',
        'assigned_employee',
    ];

    protected $dispatchesEvents = [
        'created' => ConversationCreated::class,
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'convoID', 'convoID'); // Make sure 'conversation_id' exists in the Message model
    }

    public function latestMessage()
    {
        return $this->hasOne(Message::class, 'convoID', 'convoID')->orderBy('messID', 'desc');
    }

    public function order()
    {
        return $this->hasOne(Order::class, 'convoID', 'convoID'); // A conversation might be linked to one specific order directly
    }

    // Add the missing relationship: A conversation can have multiple orders associated with it
    public function orders()
    {
        return $this->hasMany(Order::class, 'convoID', 'convoID');
    }

    // Add the missing relationship: A conversation is assigned to one employee (User)
    public function assignedEmployee()
    {
        return $this->belongsTo(User::class, 'assigned_employee', 'user_id');
    }
}
