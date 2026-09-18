<?php

namespace App\Http\Livewire;

use Illuminate\Support\Facades\Log;
use Livewire\Component;
use App\Models\Fabric;

class ManageFabric extends Component
{
    public $fabrics;

    protected $rules = [
        'fabrics.*.fabricPrice' => 'required|numeric',
    ];

    protected $listeners = [
        'createFabric' => 'createFabric',
        'updateFabric' => 'updateFabric',
        'archiveFabric' => 'archiveFabric'
    ];

    public function mount()
    {
        // Just load the fabrics as a collection - no need to key by ID
        $this->fabrics = Fabric::all();
        // Log::info("Fabrics loaded: ", $this->fabrics->toArray());
    }

    public function updateFabric($fabricID)
    {
        // Log::info("updateFabric called with ID: " . $fabricID);

        // Find the specific fabric in our collection
        $fabric = $this->fabrics->find($fabricID);

        if (!$fabric) {
            // Log::warning("Fabric not found in collection for ID: " . $fabricID);
            session()->flash('error', 'Fabric not found.');
            return;
        }

        // Validate the fabric data
        $this->validate([
            'fabrics.' . $this->fabrics->search($fabric) . '.fabricName' => 'required|string|max:255',
            'fabrics.' . $this->fabrics->search($fabric) . '.fabricPrice' => 'required|numeric|min:0',
        ]);

        // Check for duplicate names
        $nameExists = Fabric::where('fabricName', $fabric->fabricName)
            ->where('fabricID', '!=', $fabricID)
            ->exists();

        if ($nameExists) {
            // Log::warning("Fabric name '{$fabric->fabricName}' already exists for another fabric.");
            session()->flash('error', 'Fabric name already exists.');
            return;
        }

        try {
            $fabric->save();
            // Log::info("Fabric updated successfully in DB for ID: " . $fabricID);
            session()->flash('message', 'Fabric Updated.');
            $this->emit('fabricUpdated');
        } catch (\Exception $e) {
            // Log::error("Error updating fabric with ID: " . $fabricID, ['exception' => $e->getMessage()]);
            session()->flash('error', 'An error occurred while updating the fabric.');
        }
    }

    public $newFabric = ['fabricName' => '', 'fabricPrice' => ''];

    public function addFabric()
    {
        $this->validate([
            'newFabric.fabricName' => 'required',
            'newFabric.fabricPrice' => 'required|numeric',
        ]);

        // Add uniqueness check before creating
        $nameExists = Fabric::where('fabricName', $this->newFabric['fabricName'])->exists();
        if ($nameExists) {
            session()->flash('error', 'Fabric name already exists.');
            // Optionally emit event for JS
            // $this->emit('showFabricErrors', ['newFabric.fabricName' => 'This fabric name already exists.']);
            return;
        }

        Fabric::create([
            'fabricName' => $this->newFabric['fabricName'],
            'fabricPrice' => $this->newFabric['fabricPrice'],
        ]);

        // Reload the Eloquent collection
        $this->fabrics = Fabric::all();
        $this->newFabric = ['fabricName' => '', 'fabricPrice' => '']; // Reset form
        session()->flash('message', 'Fabric Added.');
        // Optionally emit event for JS
        // $this->emit('fabricAdded');
    }

    public function showFabricModal()
    {
        Log::info('showFabricModal called');
        $this->emit('showFabricModal'); // Change this line
    }

    public function createFabric($fabricName, $fabricPrice)
    {
        // Add uniqueness check before creating (if this method is still used, e.g. from JS)
        $nameExists = Fabric::where('fabricName', $fabricName)->exists();
        if ($nameExists) {
            session()->flash('error', 'Fabric name already exists.');
            // Optionally emit event for JS
            // $this->emit('showFabricErrors', ['fabricName' => 'This fabric name already exists.']);
            return;
        }

        Fabric::create([
            'fabricName' => $fabricName,
            'fabricPrice' => $fabricPrice,
        ]);

        // Reload the Eloquent collection
        $this->fabrics = Fabric::all();
        session()->flash('message', 'Fabric Added.');
        // Optionally emit event for JS
        // $this->emit('fabricAdded');
    }

    public function archiveFabric($fabricID)
    {
        $fabric = Fabric::find($fabricID);

        if (!$fabric) {
            session()->flash('error', 'Fabric not found.');
            return;
        }

        $fabric->archived = !$fabric->archived;
        $fabric->save();

        \Log::info('Fabric Archived', ['fabricID' => $fabricID]);

        $this->fabrics = Fabric::all();
        session()->flash('message', 'Fabric Archived.');
    }

    public function render()
    {
        $archivedFabrics = Fabric::where('archived', 1)->get();
        return view('livewire.manage-fabric', ['archivedFabrics' => $archivedFabrics]);
    }
}
