<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Timeframe extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'timeframe';

    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'timeframeID';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'delivery_timeframe',
        'percentageCost',
        'maximum_orders',
        'archived',
    ];

    // Basic CRUD operations can be added here if needed
}
