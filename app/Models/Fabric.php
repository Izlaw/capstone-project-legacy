<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fabric extends Model
{
    use HasFactory;

    protected $primaryKey = 'fabricID';
    public $timestamps = false;
    protected $table = 'fabrics';

    protected $fillable = [
        'fabricName',
        'fabricPrice',
        'is_custom',
        'archived',
    ];

    public function uploadOrders()
    {
        return $this->hasMany(UploadOrder::class, 'fabricName', 'fabricID');
    }

    public function customOrders()
    {
        return $this->hasMany(CustomOrder::class, 'fabricID', 'fabricID');
    }
}
