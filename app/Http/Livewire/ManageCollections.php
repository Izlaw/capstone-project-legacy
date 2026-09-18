<?php

namespace App\Http\Livewire;

use Livewire\Component;
use Livewire\WithFileUploads;
use App\Models\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ManageCollections extends Component
{
    use WithFileUploads;

    public $collections;
    public $archivedCollections;
    public $collectID;
    public $collectName;
    public $collectPrice;
    public $collectFilePath;
    public $image;

    protected $listeners = [
        'createCollection' => 'store',
        'updateCollection' => 'update',
        'deleteCollection' => 'delete',
        'showCreateCollectionPopup' => 'showCreateCollectionPopup',
        'showEditCollectionPopup' => 'showEditCollectionPopup',
        'showDeleteCollectionPopup' => 'showDeleteCollectionPopup',
    ];

    protected $rules = [
        'collectName' => 'required|string|max:50',
        'collectPrice' => 'required|numeric',
        'image' => 'nullable|image|max:2048', // 2MB Max
    ];

    public function mount()
    {
        Log::info('Mounting ManageCollections component');
        $this->collections = Collection::where('archived', false)->get();
        $this->archivedCollections = Collection::where('archived', true)->get();
    }

    public function store($data)
    {
        Log::info("Storing new design:", ['data' => $data]);

        $this->collectName = $data['collectName'];
        $this->collectPrice = $data['collectPrice'];
        $originalFilename = isset($data['originalFilename']) ? $data['originalFilename'] : null;

        // Validate the data
        $validatedData = $this->validate([
            'collectName' => 'required|string|max:50',
            'collectPrice' => 'required|numeric',
            'image' => 'required|image|max:2048', // 2MB Max
        ]);

        Log::info("Validated data:", ['validated' => $validatedData]);

        // Check if the collections folder exists
        if (!Storage::exists('public/collections')) {
            Log::info('Collections folder does not exist, creating it...');
            Storage::makeDirectory('public/collections');
        }

        // The image is already uploaded via Livewire's temporary upload mechanism
        // Use the original filename if provided from JavaScript, otherwise get it from the uploaded file
        $originalName = $originalFilename ?: $this->image->getClientOriginalName();

        // Check if a file with the same name already exists and handle it
        if (Storage::exists('public/collections/' . $originalName)) {
            // Append a unique identifier to avoid overwriting
            $pathInfo = pathinfo($originalName);
            $originalName = $pathInfo['filename'] . '_' . uniqid() . '.' . $pathInfo['extension'];
        }

        // Store the file with the original name
        $storedPath = $this->image->storeAs('collections', $originalName, 'public');

        Log::info('Image stored:', [
            'originalName' => $originalName,
            'storedPath' => $storedPath
        ]);

        // Create the collection with the image path
        Collection::create([
            'collectName' => $this->collectName,
            'collectPrice' => $this->collectPrice,
            'collectFilePath' => $storedPath, // Stores as 'collections/filename.jpg'
        ]);

        Log::info('Design created successfully');

        // Refresh the collections list
        $this->collections = Collection::all();

        // Clear the form fields
        $this->reset(['collectName', 'collectPrice', 'image']);

        // Show success message
        $this->dispatchBrowserEvent('showAlert', [
            'type' => 'success',
            'message' => 'Design created successfully!'
        ]);
    }

    public function update($data)
    {
        Log::info('Updating design:', ['data' => $data]);

        $this->collectID = $data['collectID'];
        $this->collectName = $data['collectName'];
        $this->collectPrice = $data['collectPrice'];
        $originalFilename = isset($data['originalFilename']) ? $data['originalFilename'] : null;

        // Get the collection to update
        $collection = Collection::findOrFail($this->collectID);

        // Prepare the update data
        $updateData = [
            'collectName' => $this->collectName,
            'collectPrice' => $this->collectPrice,
        ];

        // Handle image if provided
        if (isset($data['image']) && $this->image) {
            // Validate the image
            $this->validate([
                'image' => 'image|max:2048', // 2MB Max
            ]);

            // Use the original filename if provided from JavaScript, otherwise get it from the uploaded file
            $originalName = $originalFilename ?: $this->image->getClientOriginalName();

            // Check if a file with the same name already exists and handle it
            if (Storage::exists('public/collections/' . $originalName)) {
                // Append a unique identifier to avoid overwriting
                $pathInfo = pathinfo($originalName);
                $originalName = $pathInfo['filename'] . '_' . uniqid() . '.' . $pathInfo['extension'];
            }

            // Store the file with the original name
            $storedPath = $this->image->storeAs('collections', $originalName, 'public');

            Log::info('Updated image stored:', [
                'originalName' => $originalName,
                'storedPath' => $storedPath
            ]);

            // Delete the old image if it exists
            if ($collection->collectFilePath && Storage::exists('public/' . $collection->collectFilePath)) {
                Storage::delete('public/' . $collection->collectFilePath);
            }

            // Update the image path
            $updateData['collectFilePath'] = $storedPath;
        }

        // Update the collection
        $collection->update($updateData);

        Log::info('Design updated successfully');

        // Refresh the collections list
        $this->collections = Collection::all();

        // Clear the form fields
        $this->reset(['collectName', 'collectPrice', 'image']);
    }

    public function delete($id)
    {
        Log::info('Archiving design:', ['id' => $id]);

        $collection = Collection::findOrFail($id);

        // Archive the collection record
        $collection->archived = true;
        $collection->save();

        Log::info('Design archived successfully');

        // Refresh the collections list
        $this->mount();
    }

    public function showCreateCollectionPopup()
    {
        $this->dispatchBrowserEvent('showCreateCollectionPopup');
    }

    public function showEditCollectionPopup($collectID, $collectName, $collectPrice, $collectFilePath)
    {
        $this->collectID = $collectID;
        $this->collectName = $collectName;
        $this->collectPrice = $collectPrice;
        $this->collectFilePath = $collectFilePath;
        $this->dispatchBrowserEvent('showEditCollectionPopup', [
            'collectID' => $collectID,
            'collectName' => $collectName,
            'collectPrice' => $collectPrice,
            'collectFilePath' => $collectFilePath,
        ]);
    }

    public function showDeleteCollectionPopup($collectID)
    {
        $this->dispatchBrowserEvent('showDeleteCollectionPopup', ['collectID' => $collectID]);
    }

    public function render()
    {
        return view('livewire.manage-collections');
    }

    public function getId()
    {
        return $this->id;
    }
}
