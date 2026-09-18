<div wire:id="{{ $_instance->getId() }}" wire:init class="containerCollections mx-auto w-full shadow-xl p-10" x-data @wheel.prevent="$el.scrollLeft += $event.deltaY">
    <h1 class="text-4xl text-highlight font-extrabold mb-6 text-center">Manage Collections</h1>

    <!-- Single Horizontal Scrolling Container -->
    <div x-data
        x-init="$el.addEventListener('wheel', e => { 
                     e.preventDefault(); 
                     $el.scrollLeft += e.deltaY; 
                 }, { passive: false })"
        class="flex flex-nowrap gap-8 overflow-x-auto px-10 py-2 rounded-lg bg-secondary">

        <!-- Active Designs -->
        @foreach($collections as $collection)
        <div class="bg-white bg-opacity-80 p-4 rounded-lg shadow-lg flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <h2 class="text-xl font-semibold text-center">{{ $collection->collectName }}</h2>
            <img src="{{ asset('storage/' . $collection->collectFilePath) }}" class="w-full h-48 object-cover rounded-lg mt-4">
            <!-- Details Container -->
            <div class="bg-accent bg-opacity-80 p-2 rounded-lg mt-4 text-white">
                <p>Price: ₱{{ number_format($collection->collectPrice, 2) }}</p>
            </div>
            <!-- Managing Buttons -->
            <div class="button-container mt-4 flex justify-center gap-4">
                <button class="edit-button bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                    wire:click="showEditCollectionPopup({{ $collection->collectID }}, '{{ $collection->collectName }}', {{ $collection->collectPrice }}, '{{ $collection->collectFilePath }}')">
                    <!-- Pencil Icon for Edit -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41L18.37 3.29c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                </button>
                <button class="delete-button bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                    wire:click="showDeleteCollectionPopup({{ $collection->collectID }})">
                    <!-- Trash Icon for Delete -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v2H9V4a1 1 0 011-1z" />
                    </svg>
                </button>
            </div>
        </div>
        @endforeach

        <!-- Create Design Card -->
        <div id="manage-collections-component" class="bg-white bg-opacity-80 p-4 rounded-lg shadow-lg flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 flex flex-col justify-center items-center cursor-pointer"
            wire:click="showCreateCollectionPopup">
            <div class="flex flex-col justify-center items-center h-full">
                <h2 class="text-xl font-semibold text-center text-gray-400">Add New Design</h2>
                <div class="w-full h-48 flex justify-center items-center bg-gray-200 rounded-lg mt-4">
                    <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                </div>
                <div class="bg-accent bg-opacity-80 p-2 rounded-lg mt-4 w-full text-center">
                    <h3 class="text-lg font-semibold text-gray-400">Design Name</h3>
                    <p class="text-gray-400">Price</p>
                </div>
            </div>
        </div>

        <!-- Archived Designs -->
        @foreach($archivedCollections as $collection)
        <div class="bg-white bg-opacity-80 p-4 rounded-lg shadow-lg flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
            <h2 class="text-xl font-semibold text-center">{{ $collection->collectName }}</h2>
            <img src="{{ asset('storage/' . $collection->collectFilePath) }}" class="w-full h-48 object-cover rounded-lg mt-4">
            <!-- Details Container -->
            <div class="bg-accent bg-opacity-80 p-2 rounded-lg mt-4 text-white">
                <p>Price: ₱{{ number_format($collection->collectPrice, 2) }}</p>
            </div>
            <!-- Archived Label (No Actions) -->
            <div class="mt-4 text-center text-gray-500 font-bold">
                Archived
            </div>
        </div>
        @endforeach
    </div>
</div>