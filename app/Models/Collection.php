<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    protected $table = 'existing_design'; // Corrected to plural form
    protected $primaryKey = 'collectID';
    public $timestamps = false; // Set to true if you have timestamps in the collections table

    // Define the fillable properties
    protected $fillable = [
        'collectName',
        'collectPrice',
        'collectFilePath',
        'archived',
    ];

    public function orders()
    {
        return $this->belongsToMany(Order::class, 'existing_design_order_size', 'collectID', 'orderID')
            ->withPivot('sizeID', 'quantity', 'edordersizeID');
    }
}
