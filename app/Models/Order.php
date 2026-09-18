<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Order extends Model
{
    use Notifiable;

    protected $table = 'orders';
    protected $primaryKey = 'orderID';
    public $timestamps = false;

    protected $fillable = [
        'orderTotal',
        'orderStatus',
        'orderQuantity',
        'dateOrder',
        'dateReceived',
        'user_id',
        'collectID',
        'customID',
        'upID',
        'convoID',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function customOrder()
    {
        return $this->belongsTo(CustomOrder::class, 'customID', 'customID')->withDefault(['fabric_type' => null]);
    }

    public function sizes()
    {
        return $this->belongsToMany(Size::class, 'existing_design_order_size', 'orderID', 'sizeID')
            ->withPivot('quantity');
    }


    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'existing_design_order_size', 'orderID', 'collectID')
            ->withPivot('sizeID', 'quantity', 'edordersizeID')
            ->join('sizes', 'sizes.sizeID', '=', 'existing_design_order_size.sizeID')
            ->select('existing_design.*', 'sizes.sizeName as pivot_sizeName', 'existing_design_order_size.quantity as pivot_quantity');
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class, 'collectID', 'collectID')->withDefault(['fabric_type' => null]);
    }

    public function uploadOrder()
    {
        return $this->belongsTo(UploadOrder::class, 'upID', 'upID')->withDefault(['fabric_type' => null]);
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class, 'convoID', 'convoID');
    }

    public function collectionSizes()
    {
        return $this->belongsToMany(Size::class, 'existing_design_order_size', 'orderID', 'sizeID')
            ->withPivot('quantity')
            ->select('sizes.*'); // This ensures all columns from the sizes table are selected
    }

    // Modified accessor to always return "T-Shirt" as the custom order name.
    public function getCustomOrderNameAttribute()
    {
        return 'T-Shirt';
    }
}
