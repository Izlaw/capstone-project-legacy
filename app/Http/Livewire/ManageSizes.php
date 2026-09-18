<?php

namespace App\Http\Livewire;

use App\Models\Size;
use Livewire\Component;

class ManageSizes extends Component
{
    public $sizes = [];
    public $archivedSizes = [];

    protected $listeners = [
        'addSize' => 'addSize',
        'deleteSize' => 'deleteSize',
        'updateSizeDetails' => 'updateSizeDetails'
    ];

    protected $rules = [
        'sizes.*.price' => 'numeric|min:0',
        'sizes.*.sizeName' => 'required|string|max:50',
    ];

    public function mount()
    {
        $this->loadSizes();
    }

    private function loadSizes()
    {
        $this->sizes = Size::where('archived', false)->get()->keyBy('sizeID')->map(function ($size) {
            return [
                'sizeName' => $size->sizeName,
                'sizePrice' => $size->sizePrice,
            ];
        })->toArray();

        $this->archivedSizes = Size::where('archived', true)->get()->keyBy('sizeID')->map(function ($size) {
            return [
                'sizeName' => $size->sizeName,
                'sizePrice' => $size->sizePrice,
            ];
        })->toArray();
    }

    public function updateSize($sizeID)
    {
        // Find the size object in the database
        $size = Size::find($sizeID);

        if ($size) {
            $updated = false;

            // Check if price is set for the size in the $sizes array
            if (isset($this->sizes[$sizeID]['price'])) {
                $size->sizePrice = $this->sizes[$sizeID]['price'];
                $updated = true;
            }

            // Check if sizeName is set for the size in the $sizes array
            if (isset($this->sizes[$sizeID]['sizeName'])) {
                // Check if the name already exists for other sizes
                $nameExists = Size::where('sizeName', $this->sizes[$sizeID]['sizeName'])
                    ->where('sizeID', '!=', $sizeID)
                    ->exists();

                if ($nameExists) {
                    $this->emit('showErrors', ['sizeName' => 'This size name already exists.']);
                    return;
                }

                $size->sizeName = $this->sizes[$sizeID]['sizeName'];
                $updated = true;
            }

            if ($updated) {
                $size->save();

                // Re-fetch sizes to reflect updated data
                $this->loadSizes();

                // Emit event for SweetAlert
                $this->emit('sizeUpdated');
            }
        }
    }

    public function updatePrice($sizeID)
    {
        // This method is kept for backward compatibility
        $this->updateSize($sizeID);
    }

    public function addSize($sizeName, $sizePrice)
    {
        try {
            // Validate size name uniqueness
            $nameExists = Size::where('sizeName', $sizeName)->exists();
            if ($nameExists) {
                $this->emit('showErrors', ['sizeName' => 'This size name already exists.']);
                return;
            }

            // Create a new size record
            $size = new Size();
            $size->sizeName = $sizeName;
            $size->sizePrice = $sizePrice;
            $size->save();

            // Re-fetch sizes
            $this->loadSizes();

            // Emit event for SweetAlert
            $this->emit('sizeAdded');
        } catch (\Exception $e) {
            $this->emit('showErrors', ['general' => 'An error occurred while adding the size: ' . $e->getMessage()]);
        }
    }

    public function deleteSize($sizeID)
    {
        try {
            // Find the size and "archive" it
            $size = Size::find($sizeID);
            if ($size) {
                $size->archived = true;
                $size->save();

                // Re-fetch sizes
                $this->loadSizes();

                // Emit event for SweetAlert
                $this->emit('sizeDeleted');
            }
        } catch (\Exception $e) {
            $this->emit('showErrors', ['general' => 'An error occurred while deleting the size: ' . $e->getMessage()]);
        }
    }

    public function updateSizeDetails($sizeID, $sizeName, $sizePrice)
    {
        try {
            // Check if the name is already used by another size
            $nameExists = Size::where('sizeName', $sizeName)
                ->where('sizeID', '!=', $sizeID)
                ->exists();

            if ($nameExists) {
                $this->emit('showErrors', ['sizeName' => 'This size name already exists.']);
                return;
            }

            // Find the size and update it
            $size = Size::find($sizeID);
            if ($size) {
                $size->sizeName = $sizeName;
                $size->sizePrice = $sizePrice;
                $size->save();

                // Re-fetch sizes
                $this->loadSizes();

                // Emit event for SweetAlert
                $this->emit('sizeUpdated');
            }
        } catch (\Exception $e) {
            $this->emit('showErrors', ['general' => 'An error occurred while updating the size: ' . $e->getMessage()]);
        }
    }

    public function render()
    {
        return view('livewire.manage-sizes');
    }
}
